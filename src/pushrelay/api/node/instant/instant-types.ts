// This file is imported from moera-client-react and should not be modified here

import i18n, { TFunction } from 'i18next';

import { StoryInfo, StorySummaryData, StoryType } from "moeralib/node/types";
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
    buildDefrostingSummary,
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
    buildSheriffComplaintAddedSummary,
    buildSheriffComplaintDecidedSummary,
    buildSheriffMarkedSummary,
    buildSheriffUnmarkedSummary,
    buildSubscriberAddedSummary,
    buildSubscriberDeletedSummary,
    buildUnblockedUserInPostingSummary,
    buildUnblockedUserSummary
} from "pushrelay/api/node/instant/instant-summaries";
import { REL_HOME, RelNodeName } from "pushrelay/util/rel-node-name";

type InstantSummarySupplier = (data: StorySummaryData, homeOwnerName: string | null, t: TFunction) => string;

interface InstantTarget {
    nodeName: RelNodeName | string;
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
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: `/post/${getStoryPostingId(story)}`})
    },
    "reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildReactionAddedSummary(data, false, t),
        target: story => ({nodeName: REL_HOME, href: `/post/${getStoryPostingId(story)}`})
    },
    "reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildReactionAddedSummary(data, true, t),
        target: story => ({nodeName: REL_HOME, href: `/post/${getStoryPostingId(story)}`})
    },
    "comment-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildCommentReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "comment-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildCommentReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "mention-posting": {
        color: "#0d6efd",
        icon: "ms_alternate_email",
        summary: (data, homeOwnerName, t) => buildMentionPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`}),
        sheriffFields: ["posting"]
    },
    "mention-comment": {
        color: "#0d6efd",
        icon: "ms_alternate_email",
        summary: (data, homeOwnerName, t) => buildMentionCommentSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comment"]
    },
    "subscriber-added": {
        color: "#6610f2",
        icon: "ms_visibility",
        summary: (data, homeOwnerName, t) => buildSubscriberAddedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"}),
    },
    "subscriber-deleted": {
        color: "#6610f2",
        icon: "ms_visibility_off",
        summary: (data, homeOwnerName, t) => buildSubscriberDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"})
    },
    "comment-added": {
        color: "#479f76",
        icon: "ms_comment",
        summary: (data, homeOwnerName, t) => buildCommentAddedSummary(data, t),
        target: story => ({
            nodeName: REL_HOME,
            href: `/post/${getStoryPostingId(story)}?comment=${story.remoteCommentId}`
        })
    },
    "remote-comment-added": {
        color: "#479f76",
        icon: "ms_comment",
        summary: (data, homeOwnerName, t) => buildRemoteCommentAddedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comments"]
    },
    "reply-comment": {
        color: "#479f76",
        icon: "ms_reply_solid",
        summary: (data, homeOwnerName, t) => buildReplyCommentSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
        sheriffFields: ["posting", "comments"]
    },
    "comment-post-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildCommentPostTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "comment-update-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildCommentUpdateTaskFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "posting-updated": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: (data, homeOwnerName, t) => buildPostingUpdatedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "posting-post-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildPostingPostTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"})
    },
    "posting-update-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildPostingUpdateTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "posting-media-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "posting-media-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-added-positive": {
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionAddedSummary(data, false, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-added-negative": {
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionAddedSummary(data, true, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "posting-media-reaction-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildPostingMediaReactionFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?media=${story.remoteMediaId}`
        })
    },
    "comment-media-reaction-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildCommentMediaReactionFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}&media=${story.remoteMediaId}`
        })
    },
    "posting-subscribe-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildPostingSubscribeTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "posting-reaction-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildPostingReactionTaskFailedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "comment-reaction-task-failed": {
        color: "#dc3545",
        icon: "ms_error",
        summary: (data, homeOwnerName, t) => buildCommentReactionTaskFailedSummary(data, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        })
    },
    "friend-added": {
        color: "#20c997",
        icon: "ms_person",
        summary: (data, homeOwnerName, t) => buildFriendAddedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"}),
    },
    "friend-deleted": {
        color: "#20c997",
        icon: "ms_person_off",
        summary: (data, homeOwnerName, t) => buildFriendDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"})
    },
    "friend-group-deleted": {
        color: "#20c997",
        icon: "ms_group_off",
        summary: (data, homeOwnerName, t) => buildFriendGroupDeletedSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"})
    },
    "asked-to-subscribe": {
        color: "#6610f2",
        icon: "ms_live_help",
        summary: (data, homeOwnerName, t) => buildAskedToSubscribeSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"}),
    },
    "asked-to-friend": {
        color: "#20c997",
        icon: "ms_live_help",
        summary: (data, homeOwnerName, t) => buildAskedToFriendSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"}),
    },
    "blocked-user": {
        color: "#dc3545",
        icon: "ms_block",
        summary: (data, homeOwnerName, t) => buildBlockedUserSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"}),
    },
    "unblocked-user": {
        color: "#228b22",
        icon: "ms_block",
        summary: (data, homeOwnerName, t) => buildUnblockedUserSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: "/"})
    },
    "blocked-user-in-posting": {
        color: "#dc3545",
        icon: "ms_block",
        summary: (data, homeOwnerName, t) => buildBlockedUserInPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`}),
    },
    "unblocked-user-in-posting": {
        color: "#228b22",
        icon: "ms_block",
        summary: (data, homeOwnerName, t) => buildUnblockedUserInPostingSummary(data, t),
        target: story => ({nodeName: story.remoteNodeName ?? REL_HOME, href: `/post/${story.remotePostingId}`})
    },
    "sheriff-marked": {
        color: "#dc3545",
        icon: "ms_shield_person",
        summary: (data, homeOwnerName, t) => buildSheriffMarkedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: story.remotePostingId == null
                ? "/"
                : story.remoteCommentId == null
                    ? `/post/${story.remotePostingId}`
                    : `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
    },
    "sheriff-unmarked": {
        color: "#228b22",
        icon: "ms_shield_person",
        summary: (data, homeOwnerName, t) => buildSheriffUnmarkedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.remoteNodeName ?? REL_HOME,
            href: story.remotePostingId == null
                ? "/"
                : story.remoteCommentId == null
                    ? `/post/${story.remotePostingId}`
                    : `/post/${story.remotePostingId}?comment=${story.remoteCommentId}`
        }),
    },
    "sheriff-complaint-added": {
        color: "#0d6efd",
        icon: "ms_shield_person",
        summary: (data, homeOwnerName, t) => buildSheriffComplaintAddedSummary(t),
        target: story => ({
            nodeName: story.summaryNodeName ?? REL_HOME,
            href: `/complaints/${story.summaryData?.sheriff?.complaintId}`
        })
    },
    "sheriff-complaint-decided": {
        color: "#6610f2",
        icon: "ms_shield_person",
        summary: (data, homeOwnerName, t) => buildSheriffComplaintDecidedSummary(data, homeOwnerName, t),
        target: story => ({
            nodeName: story.summaryNodeName ?? REL_HOME,
            href: `/complaints/${story.summaryData?.sheriff?.complaintId}`
        })
    },
    "defrosting": {
        color: "#fd7e14",
        icon: "ms_partly_cloudy_day",
        summary: (data, homeOwnerName, t) => buildDefrostingSummary(t),
        target: story => ({
            nodeName: REL_HOME,
            href: "/news"
        }),
    },
    "search-report": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: "/"})
    },
    "reminder-full-name": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: "/"})
    },
    "reminder-avatar": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: "/"})
    },
    "reminder-email": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: "/"})
    },
    "reminder-sheriff-allow": {
        color: "#198754",
        icon: "ms_ink_pen",
        summary: () => "",
        target: story => ({nodeName: REL_HOME, href: "/"})
    },
};

function getStoryPostingId(story: StoryInfo ): string | null | undefined {
    return ("posting" in story ? story.posting?.id : null) ?? story.postingId;
}

export function getInstantTypeDetails(storyType: StoryType): InstantTypeDetails | null {
    return INSTANT_TYPES[storyType] ?? null;
}

export function getInstantTarget(story: StoryInfo ): InstantTarget {
    return getInstantTypeDetails(story.storyType)?.target(story) ?? {nodeName: REL_HOME, href: "/"};
}

export function getInstantSummary(story: StoryInfo , homeOwnerName: string | null): string {
    return getInstantTypeDetails(story.storyType)?.summary(story.summaryData ?? {}, homeOwnerName, i18n.t) ?? "";
}
