import { changeLanguage } from 'i18next';

import { getLogger } from "pushrelay/rpc";
import { NODE_API_VALIDATORS, resolve, StoryInfo } from "pushrelay/api";
import { isSchemaValid } from "pushrelay/api/schema";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { getInstantSummary, getInstantTarget, getInstantTypeDetails } from "pushrelay/api/node/instant/instant-types";
import { forAllClients } from "pushrelay/rpc/clients";
import { sendMessage } from "pushrelay/fcm";
import { universalLocation } from "pushrelay/util/url";

interface Params {
    story?: StoryInfo | null;
    nodeName?: string | null;
    carte?: string | null;
}

export default async function story({story, nodeName, carte}: Params): Promise<void> {
    getLogger().info(`Displaying a story ${story?.id} for node '${nodeName}'`);

    if (story == null) {
        throw new ServiceException(ServiceError.STORY_EMPTY);
    }
    if (!isSchemaValid(NODE_API_VALIDATORS["StoryInfo"]!, story)) {
        throw new ServiceException(ServiceError.STORY_INVALID);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    if (await resolve(nodeName) == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }

    // TODO check carte

    const target = getInstantTarget(story);
    const targetNodeName = target.nodeName === ":" ? nodeName : target.nodeName;
    const targetNodeRoot = (await resolve(targetNodeName))?.nodeUri;
    const targetUrl = universalLocation(null, targetNodeName, targetNodeRoot, target.href);
    const details = getInstantTypeDetails(story.storyType);
    if (details == null) {
        throw new ServiceException(ServiceError.STORY_TYPE_UNKNOWN);
    }
    const icon = details.icon ?? (story.storyType.endsWith("-negative") ? "fa_thumbs_down" : "fa_thumbs_up");
    await forAllClients(nodeName, (clientId, lang) => {
        changeLanguage(lang);
        const body = getInstantSummary(story, nodeName);
        const message = {
            notification: {
                body
            },
            android: {
                ttl: 24 * 60 * 60 * 1000,
                notification: {
                    icon,
                    color: details.color ?? "#adb5bd",
                    tag: "story:" + story.id
                }
            },
            data: {
                url: targetUrl
            },
            token: clientId
        }
        sendMessage(message);
    });
}
