import { createJSONRPCErrorResponse, JSONRPCRequest, JSONRPCServer, JSONRPCServerMiddlewareNext } from 'json-rpc-2.0';

import register from "pushrelay/rpc/methods/register";
import feedStatus from "pushrelay/rpc/methods/feed-status";
import storyAdded from "pushrelay/rpc/methods/story-added";
import storyDeleted from "pushrelay/rpc/methods/story-deleted";
import { ServiceException } from "pushrelay/rpc/errors";
import { getLogger } from "pushrelay/rpc";

const service = new JSONRPCServer({errorListener: () => {}});
service.applyMiddleware(exceptionMiddleware);
service.addMethod("register", register);
service.addMethod("feedStatus", feedStatus);
service.addMethod("storyAdded", storyAdded);
service.addMethod("storyDeleted", storyDeleted);

async function exceptionMiddleware(
    next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void
) {
    try {
        return await next(request, serverParams);
    } catch (error) {
        if (error instanceof ServiceException) {
            getLogger().warn(`Returned error: ${error.message}`);
            return createJSONRPCErrorResponse(request.id ?? 0, error.rpcCode, error.message);
        } else {
            throw error;
        }
    }
}

export default service;
