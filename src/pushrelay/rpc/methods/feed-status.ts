import { t } from 'i18next';

import { resolve } from "pushrelay/api";
import { sendMessage } from "pushrelay/fcm";
import { getLogger } from "pushrelay/rpc";
import { forAllClients } from "pushrelay/rpc/clients";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { validateMessageSignature } from "pushrelay/rpc/validators";
import { universalLocation, urlWithParameters } from "pushrelay/util/url";

interface Params {
    feedName?: string | null;
    notViewed?: number | null;
    notViewedMoment?: number | null;
    nodeName?: string | null;
    signedAt?: number | null;
    signature?: string | null;
}

export default async function feedStatus({
    feedName, notViewed, notViewedMoment, nodeName, signedAt, signature
}: Params): Promise<void> {
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
    validateMessageSignature(nodeInfo, signedAt, signature);

    const href = urlWithParameters("/news", {before: notViewedMoment});
    const targetUrl = universalLocation(null, nodeName, nodeInfo.nodeUri, href);
    await forAllClients(nodeName, (clientId, lang) => {
        let message;
        if (notViewed != null && notViewed !== 0) {
            const summary = t("new-posts-newsfeed", {count: notViewed ?? 0, lng: lang});
            message = {
                data: {
                    summary,
                    icon: "fa_newspaper",
                    color: "#0099cc",
                    tag: "news",
                    url: targetUrl
                },
                token: clientId
            }
        } else {
            message = {
                data: {
                    tag: "news",
                },
                token: clientId
            }
        }
        sendMessage(message);
    });
}
