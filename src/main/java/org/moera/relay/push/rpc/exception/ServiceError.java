package org.moera.relay.push.rpc.exception;

import java.util.Arrays;

public enum ServiceError {

    CLIENT_ID_EMPTY(1, "client-id.empty", "client ID is empty"),
    CLIENT_ID_TOO_LONG(2, "client-id.too-long", "client ID is too long"),
    NODE_NAME_EMPTY(3, "node-name.empty", "node name is empty"),
    LANG_TOO_LONG(4, "lang.too-long", "language code is too long"),
    NO_CLIENTS(5, "node.no-clients", "the node has node clients");

    private final int rpcCode;
    private final String errorCode;
    private final String message;

    ServiceError(int rpcCode, String errorCode, String message) {
        this.rpcCode = rpcCode;
        this.errorCode = errorCode;
        this.message = message;
    }

    public int getRpcCode() {
        return rpcCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public static ServiceError forCode(String code) {
        if (code == null) {
            return null;
        }
        return Arrays.stream(values()).filter(v -> v.getErrorCode().equals(code)).findFirst().orElse(null);
    }

}
