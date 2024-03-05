// This file is imported from moera-client-react and should not be modified here

import i18n, { TFunction } from 'i18next';

import { StoryInfo, StorySummaryData, StoryType } from "pushrelay/api";
import {
    buildAskedToFriendSummary,
    buildAskedToSubscribeSummary,
    buildBlockedUserInPostingSummary,
    buildBlockedUserSummary,
    buildCommentAddedSummary,
    buildCommentMediaReactionAddedSummary,
    buildCommentMediaReactionFailedSummary,
    buildCommentPostTaskFailedSummary,
    buildCommentReactionAddedSummary,
    buildCommentReactionTaskFailedSummary,
    buildCommentUpdateTaskFailedSummary,
    buildFriendAddedSummary,
    buildFriendDeletedSummary,
    buildFriendGroupDeletedSummary,
    buildMentionCommentSummary,
    buildMentionPostingSummary,
    buildPostingMediaReactionAddedSummary,
    buildPostingMediaReactionFailedSummary,
    buildPostingPostTaskFailedSummary,
    buildPostingReactionTaskFailedSummary,
    buildPostingSubscribeTaskFailedSummary,
    buildPostingUpdatedSummary,
    buildPostingUpdateTaskFailedSummary,
    buildReactionAddedSummary,
    buildRemoteCommentAddedSummary,
    buildReplyCommentSummary,
    buildSheriffComplainAddedSummary,
    buildSheriffComplainDecidedSummary,
    buildSheriffMarkedSummary,
    buildSheriffUnmarkedSummary,
    buildSubscriberAddedSummary,
    buildSubscriberDeletedSummary,
    buildUnblockedUserInPostingSummary,
    buildUnblockedUserSummary
} from "pushrelay/api/node/instant/instant-summaries";

type InstantSummarySupplier = (data: StorySummaryData, homeOwnerName: string | null, t: TFunction) => string;

interface InstantTarget {
    nodeName: string | null | undefined;
    href: string;
}

type InstantTargetSupplier = (story: StoryInfo ) => InstantTarget;


type SheriffField = "posting" | "comment" | "comments";

interface InstantTypeDetails {
    color?: string;
    icon?: string;
    summary: InstantSummarySupplier;
    target: InstantTargetSupplier;
    sheriffFields?: SheriffField[];
}

const INSTANT_TYPES: Record<StoryType, InstantTypeDetails> = {
    "posting-added": {
        color: "#198754",
        icon: "fa_pen_alt",
        summary: () => "",
        target: story => ({nodeName: ":", href: `/post/${getStoryPostingId(story)}`})
    },
    "reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildReactionAddedSummary(data, false, t),
        target: story => ({nodeName: ":", href: `/post/${getStoryPostingId(story)}`})
    },
    "reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildReactionAddedSummary(data, true, t),
        target: story => ({nodeName: ":", href: `/post/${getStoryPostingId(story)}`})
    },
    "comment-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildCommentReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "comment-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildCommentReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "mention-posting": {
        color: "#0d6efd",
        icon: "fa_at",
        summary: (data, homeOwnerName, t) => buildMentionPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`}),
        sheriffFields: ["posting"]
    },
    "mention-comment": {
        color: "#0d6efd",
        icon: "fa_at",
        summary: (data, homeOwnerName, t) => buildMentionCommentSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comment"]
    },
    "subscriber-added": {
        color: "#6610f2",
        icon: "fa_eye",
        summary: (data, homeOwnerName, t) => buildSubscriberAddedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"}),
    },
    "subscriber-deleted": {
        color: "#6610f2",
        icon: "fa_eye_slash",
        summary: (data, homeOwnerName, t) => buildSubscriberDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"})
    },
    "comment-added": {
        color: "#42d042",
        icon: "fa_comment",
        summary: (data, homeOwnerName, t) => buildCommentAddedSummary(data, t),
        target: story => ({nodeName: ":", href: `/post/${getStoryPostingId(story)}?comment=${story.remoteCommentId}`})
    },
    "remote-comment-added": {
        color: "#42d042",
        icon: "fa_comment",
        summary: (data, homeOwnerName, t) => buildRemoteCommentAddedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comments"]
    },
    "reply-comment": {
        color: "#42d042",
        icon: "fa_reply",
        summary: (data, homeOwnerName, t) => buildReplyCommentSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comments"]
    },
    "comment-post-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildCommentPostTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "comment-update-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildCommentUpdateTaskFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "posting-updated": {
        color: "#198754",
        icon: "fa_pen_alt",
        summary: (data, homeOwnerName, t) => buildPostingUpdatedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "posting-post-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildPostingPostTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"})
    },
    "posting-update-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildPostingUpdateTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "posting-media-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "posting-media-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "posting-media-reaction-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "posting-subscribe-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildPostingSubscribeTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "posting-reaction-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildPostingReactionTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "comment-reaction-task-failed": {
        color: "#dc3545",
        icon: "fa_exclamation_circle",
        summary: (data, homeOwnerName, t) => buildCommentReactionTaskFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "friend-added": {
        color: "#20c997",
        icon: "fa_user",
        summary: (data, homeOwnerName, t) => buildFriendAddedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"}),
    },
    "friend-deleted": {
        color: "#20c997",
        icon: "fa_user_slash",
        summary: (data, homeOwnerName, t) => buildFriendDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"})
    },
    "friend-group-deleted": {
        color: "#20c997",
        icon: "fa_user_times",
        summary: (data, homeOwnerName, t) => buildFriendGroupDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"})
    },
    "asked-to-subscribe": {
        color: "#6610f2",
        icon: "fa_question",
        summary: (data, homeOwnerName, t) => buildAskedToSubscribeSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"}),
    },
    "asked-to-friend": {
        color: "#20c997",
        icon: "fa_question",
        summary: (data, homeOwnerName, t) => buildAskedToFriendSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"}),
    },
    "blocked-user": {
        color: "#dc3545",
        icon: "fa_handcuffs",
        summary: (data, homeOwnerName, t) => buildBlockedUserSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"}),
    },
    "unblocked-user": {
        color: "#228b22",
        icon: "fa_handcuffs",
        summary: (data, homeOwnerName, t) => buildUnblockedUserSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: "/"})
    },
    "blocked-user-in-posting": {
        color: "#dc3545",
        icon: "fa_handcuffs",
        summary: (data, homeOwnerName, t) => buildBlockedUserInPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`}),
    },
    "unblocked-user-in-posting": {
        color: "#228b22",
        icon: "fa_handcuffs",
        summary: (data, homeOwnerName, t) => buildUnblockedUserInPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName, href: `/post/${story.remotePostingId}`})
    },
    "sheriff-marked": {
        color: "#dc3545",
        icon: "fa_hat_cowboy",
        summary: (data, homeOwnerName, t) => buildSheriffMarkedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: story.remotePostingId == null
                ? "/"
                : story.remoteCommentId == null
                    ? `/post/${story.remotePostingId}`
                    : `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
    },
    "sheriff-unmarked": {
        color: "#228b22",
        icon: "fa_hat_cowboy",
        summary: (data, homeOwnerName, t) => buildSheriffUnmarkedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName,
            href: story.remotePostingId == null
                ? "/"
                : story.remoteCommentId == null
                    ? `/post/${story.remotePostingId}`
                    : `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
    },
    "sheriff-complain-added": {
        color: "#0d6efd",
        icon: "fa_hat_cowboy",
        summary: (data, homeOwnerName, t) => buildSheriffComplainAddedSummary(t),
        target: story => ({
            nodeName: story.summaryNodeName,
            href: `/complains/${story.summaryData?.sheriff?.complainId}`
        })
    },
    "sheriff-complain-decided": {
        color: "#6610f2",
        icon: "fa_hat_cowboy",
        summary: (data, homeOwnerName, t) => buildSheriffComplainDecidedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.summaryNodeName,
            href: `/complains/${story.summaryData?.sheriff?.complainId}`
        })
    }
};

function isStoryInfo(story: StoryInfo ): story is StoryInfo {
    return "posting" in story;
}

function getStoryPostingId(story: StoryInfo ): string | null | undefined {
    return isStoryInfo(story) ? story.posting?.id : null;
}

export function getInstantTypeDetails(storyType: StoryType): InstantTypeDetails | null {
    return INSTANT_TYPES[storyType] ?? null;
}

export function getInstantTarget(story: StoryInfo ): InstantTarget {
    return getInstantTypeDetails(story.storyType)?.target(story) ?? {nodeName: ":", href: "/"};
}

export function getInstantSummary(story: StoryInfo , homeOwnerName: string | null): string {
    if (story.summaryData == null) {
        return "";
    }
    return getInstantTypeDetails(story.storyType)?.summary(story.summaryData, homeOwnerName, i18n.t) ?? "";
}
