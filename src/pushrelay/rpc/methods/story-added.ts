import { changeLanguage } from 'i18next';
import { validateNodeSchema } from 'moeralib/node';
import { StoryInfo } from 'moeralib/node/types';

import { resolve } from "pushrelay/api";
import { getInstantSummary, getInstantTarget, getInstantTypeDetails } from "pushrelay/api/node/instant/instant-types";
import { sendMessage } from "pushrelay/fcm";
import { getLogger } from "pushrelay/rpc";
import { forAllClients } from "pushrelay/rpc/clients";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { validateMessageSignature } from "pushrelay/rpc/validators";
import { universalLocation } from "pushrelay/util/url";
import { absoluteNodeName } from "pushrelay/util/rel-node-name";

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
    if (!validateNodeSchema("StoryInfo", story).valid) {
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
    const targetNodeName = absoluteNodeName(
        target.nodeName, {homeOwnerNameOrUrl: nodeName, ownerNameOrUrl: nodeName, searchName: "search_0"}
    );
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
