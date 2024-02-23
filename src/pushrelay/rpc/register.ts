import { ServiceError, ServiceException } from "pushrelay/rpc/errors";

const CLIENT_ID_MAX_LENGTH = 256;
const LANG_MAX_LENGTH = 8;

interface Params {
    clientId?: string | null;
    nodeName?: string | null;
    lang?: string | null;
    signature?: string | null;
}

export default function register({clientId, nodeName, lang, signature}: Params): void {
    if (!clientId) {
        throw new ServiceException(ServiceError.CLIENT_ID_EMPTY);
    }
    if (clientId.length > CLIENT_ID_MAX_LENGTH) {
        throw new ServiceException(ServiceError.CLIENT_ID_TOO_LONG);
    }
    if (!nodeName) {
        throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
    }
    if (lang != null && lang.length > LANG_MAX_LENGTH) {
        throw new ServiceException(ServiceError.LANG_TOO_LONG);
    }
}
