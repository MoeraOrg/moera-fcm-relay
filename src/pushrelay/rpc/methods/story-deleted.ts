import { resolve } from "pushrelay/api";
import { sendMessage } from "pushrelay/fcm";
import { getLogger } from "pushrelay/rpc";
import { forAllClients } from "pushrelay/rpc/clients";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { validateMessageSignature } from "pushrelay/rpc/validators";

interface Params {
    storyId?: string | null;
    nodeName?: string | null;
    signedAt?: number | null;
    signature?: string | null;
}

export default async function storyDeleted({storyId, nodeName, signedAt, signature}: Params): Promise<void> {
    getLogger().info(`Deleted a story ${storyId} for node '${nodeName}'`);

    if (!storyId) {
        throw new ServiceException(ServiceError.STORY_ID_EMPTY);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    const nodeInfo = await resolve(nodeName);
    if (nodeInfo == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }
    validateMessageSignature(nodeInfo, signedAt, signature);

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
