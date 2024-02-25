import { getMessaging } from 'firebase-admin/messaging';
import { t } from 'i18next';

import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { Client } from "pushrelay/data/models/Client";
import { getLogger } from "pushrelay/rpc";

interface Params {
    feedName?: string | null;
    notViewed?: number | null;
    nodeName?: string | null;
    signature?: string | null;
}

export default async function feedStatus({feedName, notViewed, nodeName, signature}: Params): Promise<void> {
    getLogger().info(`Reporting feed status for node '${nodeName}' feed '${feedName}', ${notViewed} not viewed`);

    if (feedName !== "news") {
        getLogger().info(`Feed '${feedName}' is ignored`);
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
        const body = t("new-posts-newsfeed", {count: notViewed ?? 0, lng: client.lang ?? "en"});
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
