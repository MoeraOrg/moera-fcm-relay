import { changeLanguage } from 'i18next';

import { NODE_API_VALIDATORS, resolve, StoryInfo } from "pushrelay/api";
import { getInstantSummary, getInstantTarget, getInstantTypeDetails } from "pushrelay/api/node/instant/instant-types";
import { isSchemaValid } from "pushrelay/api/schema";
import { sendMessage } from "pushrelay/fcm";
import { getLogger } from "pushrelay/rpc";
import { forAllClients } from "pushrelay/rpc/clients";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { validateMessageSignature } from "pushrelay/rpc/validators";
import { universalLocation } from "pushrelay/util/url";

interface Params {
    story?: StoryInfo | null;
    nodeName?: string | null;
    signedAt?: number | null;
    signature?: string | null;
}

export default async function storyAdded({story, nodeName, signedAt, signature}: Params): Promise<void> {
    getLogger().info(`Added a story ${story?.id} for node '${nodeName}'`);
    if (getLogger().isDebugEnabled() && story != null) {
        getLogger().debug("Story data: " + JSON.stringify(story));
    }

    if (story == null) {
        throw new ServiceException(ServiceError.STORY_EMPTY);
    }
    if (!isSchemaValid(NODE_API_VALIDATORS["StoryInfo"]!, story)) {
        throw new ServiceException(ServiceError.STORY_INVALID);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    const nodeInfo = (await resolve(nodeName));
    if (nodeInfo == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }
    validateMessageSignature(nodeInfo, signedAt, signature);

    const target = getInstantTarget(story);
    const targetNodeName = target.nodeName === ":" ? nodeName : target.nodeName;
    const targetNodeRoot = (await resolve(targetNodeName))?.nodeUri;
    const targetUrl = universalLocation(null, targetNodeName, targetNodeRoot, target.href, story.id);

    const details = getInstantTypeDetails(story.storyType);
    if (details == null) {
        throw new ServiceException(ServiceError.STORY_TYPE_UNKNOWN);
    }
    const smallIcon = details.icon ?? (story.storyType.endsWith("-negative") ? "fa_thumbs_down" : "fa_thumbs_up");

    let avatarUrl = "";
    let avatarShape = "circle";
    if (story.summaryAvatar?.path != null) {
        avatarUrl = `${nodeInfo.nodeUri}/media/${story.summaryAvatar.path}`;
        avatarShape = story.summaryAvatar.shape ?? avatarShape;
    }

    await forAllClients(nodeName, (clientId, lang) => {
        changeLanguage(lang);
        const summary = getInstantSummary(story, nodeName);
        const message = {
            data: {
                avatarUrl,
                avatarShape,
                summary,
                smallIcon,
                color: details.color ?? "#adb5bd",
                tag: "story:" + story.id,
                url: targetUrl,
                markAsReadId: story.id
            },
            token: clientId
        }
        sendMessage(message);
    });
}
