import { t } from 'i18next';

import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { getLogger } from "pushrelay/rpc";
import { sendMessage } from "pushrelay/fcm";
import { resolve } from "pushrelay/api";
import { forAllClients } from "pushrelay/rpc/clients";
import { universalLocation } from "pushrelay/util/url";

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
    const nodeInfo = await resolve(nodeName);
    if (nodeInfo == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }

    // TODO check signature

    const targetUrl = universalLocation(null, nodeName, nodeInfo.nodeUri, "/news");
    await forAllClients(nodeName, (clientId, lang) => {
        const summary = t("new-posts-newsfeed", {count: notViewed ?? 0, lng: lang});
        const message = {
            data: {
                summary,
                icon: "fa_newspaper",
                color: "#0099cc",
                tag: "news",
                url: targetUrl
            },
            token: clientId
        }
        sendMessage(message);
    });
}
