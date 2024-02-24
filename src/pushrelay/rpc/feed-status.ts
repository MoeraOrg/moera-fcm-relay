import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { Client } from "pushrelay/data/models/Client";
import { getMessaging } from "firebase-admin/messaging";

interface Params {
    feedName?: string | null;
    notViewed?: number | null;
    nodeName?: string | null;
    signature?: string | null;
}

export default async function feedStatus({feedName, notViewed, nodeName, signature}: Params): Promise<void> {
    if (feedName !== "news") {
        return;
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }

    // TODO check signature

    const clients: Client[] = await Client.findAll({where: {nodeName}});
    if (clients.length === 0) {
        throw new ServiceException(ServiceError.NO_CLIENTS);
    }

    for (const client of clients) {
        // String body = messageGenerator.format(
        //     client.getLang(),
        //     "new-posts-newsfeed",
        //     Map.of("count", notViewed));
        const body = "Hi!";
        const message = {
            notification: {
                body
            },
            android: {
                ttl: 24 * 60 * 60 * 1000,
                notification: {
                    icon: "fa_newspaper",
                    color: "#0099cc",
                    tag: "news"
                }
            },
            data: {
                url: "https://moera.page/@/~/news"
            },
            token: client.clientId
        }
        // fcmDelivery.send(message, client.getClientId());
        await getMessaging().send(message);
    }

}
