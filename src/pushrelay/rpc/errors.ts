export class ServiceError {

    static CLIENT_ID_EMPTY = new ServiceError(1, "client-id.empty", "client ID is empty");
    static CLIENT_ID_TOO_LONG = new ServiceError(2, "client-id.too-long", "client ID is too long");
    static NODE_NAME_EMPTY = new ServiceError(3, "node-name.empty", "node name is empty");
    static NODE_NAME_UNKNOWN = new ServiceError(4, "node-name.unknown", "node name is unknown");
    static LANG_TOO_LONG = new ServiceError(5, "lang.too-long", "language code is too long");
    static NO_CLIENTS = new ServiceError(6, "node.no-clients", "the node has node clients");
    static STORY_EMPTY = new ServiceError(7, "story.empty", "story is empty");
    static STORY_INVALID = new ServiceError(8, "story.invalid", "story has invalid format");
    static STORY_TYPE_UNKNOWN = new ServiceError(8, "story.type-unknown", "story type is unknown");

    rpcCode: number;
    errorCode: string;
    message: string;

    constructor(rpcCode: number, errorCode: string, message: string) {
        this.rpcCode = rpcCode;
        this.errorCode = errorCode;
        this.message = message;
    }

}

export class ServiceException extends Error {

    serviceError: ServiceError;

    constructor(serviceError: ServiceError) {
        super(serviceError.errorCode + ": " + serviceError.message);
        this.serviceError = serviceError;
    }

    get rpcCode(): number {
        return this.serviceError.rpcCode;
    }

    get errorCode(): string {
        return this.serviceError.errorCode;
    }

}
