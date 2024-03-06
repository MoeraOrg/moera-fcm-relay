import { resolve } from "pushrelay/api";
import { Client } from "pushrelay/data/models/Client";
import { getLogger } from "pushrelay/rpc";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import { validateRegisterSignature } from "pushrelay/rpc/validators";

const CLIENT_ID_MAX_LENGTH = 256;
const LANG_MAX_LENGTH = 8;

interface Params {
    clientId?: string | null;
    nodeName?: string | null;
    lang?: string | null;
    signedAt?: number | null;
    signature?: string | null;
}

export default async function register({clientId, nodeName, lang, signedAt, signature}: Params): Promise<void> {
    getLogger().info(
        `Registering client '${(clientId ?? '').substring(0, 6)}' language '${lang}' for node '${nodeName}'`
    );

    if (!clientId) {
        throw new ServiceException(ServiceError.CLIENT_ID_EMPTY);
    }
    if (clientId.length > CLIENT_ID_MAX_LENGTH) {
        throw new ServiceException(ServiceError.CLIENT_ID_TOO_LONG);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    const nodeInfo = await resolve(nodeName);
    if (nodeInfo == null) {
        throw new ServiceException(ServiceError.NODE_NAME_UNKNOWN);
    }
    if (lang != null && lang.length > LANG_MAX_LENGTH) {
        throw new ServiceException(ServiceError.LANG_TOO_LONG);
    }
    validateRegisterSignature(clientId, nodeInfo, lang ?? null, signedAt, signature);

    let client = await Client.findOne({where: {clientId}});
    if (client == null) {
        client = Client.build({clientId, nodeName, lang, createdAt: new Date()});
        await client.save();
    } else {
        await client.update({nodeName, lang: lang ?? null});
    }
}
