export class ServiceError {

    static CLIENT_ID_EMPTY = new ServiceError(1, "client-id.empty", "client ID is empty");
    static CLIENT_ID_TOO_LONG = new ServiceError(2, "client-id.too-long", "client ID is too long");
    static NODE_NAME_EMPTY = new ServiceError(3, "node-name.empty", "node name is empty");
    static LANG_TOO_LONG = new ServiceError(4, "lang.too-long", "language code is too long");
    static NO_CLIENTS = new ServiceError(5, "node.no-clients", "the node has node clients");

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
