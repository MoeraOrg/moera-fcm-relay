import { createJSONRPCErrorResponse, JSONRPCRequest, JSONRPCServer, JSONRPCServerMiddlewareNext } from 'json-rpc-2.0';

import register from "pushrelay/rpc/register";
import { ServiceError } from "pushrelay/rpc/errors";

const service = new JSONRPCServer({errorListener: () => {}});
service.applyMiddleware(exceptionMiddleware);
service.addMethod("register", register);

async function exceptionMiddleware(
    next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void
) {
    try {
        return await next(request, serverParams);
    } catch (error) {
        if (error instanceof ServiceError) {
            return createJSONRPCErrorResponse(request.id ?? 0, error.rpcCode, error.message);
        } else {
            throw error;
        }
    }
}

export default service;
