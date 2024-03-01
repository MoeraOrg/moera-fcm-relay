import { getLogger } from "pushrelay/rpc";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { forAllClients } from "pushrelay/rpc/clients";
import { sendMessage } from "pushrelay/fcm";
import { resolve } from "pushrelay/api";

interface Params {
    storyId?: string | null;
    nodeName?: string | null;
    carte?: string | null;
}

export default async function storyDeleted({storyId, nodeName, carte}: Params): Promise<void> {
    getLogger().info(`Deleted a story ${storyId} for node '${nodeName}'`);

    if (!storyId) {
        throw new ServiceException(ServiceError.STORY_EMPTY);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    if (await resolve(nodeName) == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }

    // TODO check carte

    await forAllClients(nodeName, (clientId, lang) => {
        const message = {
            data: {
                tag: "story:" + storyId,
            },
            token: clientId
        }
        sendMessage(message);
    });
}
