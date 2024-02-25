import { createJSONRPCErrorResponse, JSONRPCRequest, JSONRPCServer, JSONRPCServerMiddlewareNext } from 'json-rpc-2.0';

import register from "pushrelay/rpc/register";
import feedStatus from "pushrelay/rpc/feed-status";
import { ServiceException } from "pushrelay/rpc/errors";
import logger from "pushrelay/logger";

const service = new JSONRPCServer({errorListener: () => {}});
service.applyMiddleware(exceptionMiddleware);
service.addMethod("register", register);
service.addMethod("feedStatus", feedStatus);

async function exceptionMiddleware(
    next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void
) {
    try {
        return await next(request, serverParams);
    } catch (error) {
        if (error instanceof ServiceException) {
            logger.warn(`[rpc]: Returned error: ${error.message}`);
            return createJSONRPCErrorResponse(request.id ?? 0, error.rpcCode, error.message);
        } else {
            throw error;
        }
    }
}

export default service;
