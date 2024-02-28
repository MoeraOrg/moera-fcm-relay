import { JSONRPCClient } from 'json-rpc-2.0';
import * as process from 'process';

import { getLogger } from "pushrelay/logger";
import { ErrorResult, RegisteredNameInfo } from "pushrelay/api/naming/api-types";
import { BasicValidateFunction, isSchemaValid } from "pushrelay/api/schema";
import {
    ErrorResult as ErrorResultValidator,
    RegisteredNameInfo as RegisteredNameInfoValidator
} from "pushrelay/api/naming/api-validators";

export class NamingException extends Error {
}

export class NamingApiException extends NamingException {

    error: ErrorResult;

    constructor(error: ErrorResult) {
        super(error.message);
        this.error = error;
    }

    get code(): number {
        return this.error.code;
    }

}

let rpcClient: JSONRPCClient<BasicValidateFunction<any>> | null = null;

function getRpcClient(): JSONRPCClient<BasicValidateFunction<any>> {
    if (rpcClient == null) {
        const namingServer = process.env.NAMING_SERVER;
        if (namingServer == null) {
            getLogger().error("Naming server is not set in NAMING_SERVER environment variable");
            process.exit(1);
        }

        rpcClient = new JSONRPCClient(async (request, validator) => {
            const response = await fetch(namingServer, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json"
                },
                body: JSON.stringify(request),
            });
            if (response.status === 200) {
                const data = await response.json();
                if (!('result' in data)) {
                    return Promise.reject(new NamingException("Naming server returned invalid response"));
                }
                if (!isSchemaValid(validator, data.result)) {
                    return Promise.reject(new NamingException("Naming server returned invalid response"));
                }
                rpcClient!.receive(data);
            } else if (request.id !== undefined) {
                try {
                    const data = await response.json();
                    if ('error' in data) {
                        if (!isSchemaValid(ErrorResultValidator, data.error)) {
                            return Promise.reject(new NamingException("Naming server returned invalid error response"));
                        }
                        return Promise.reject(new NamingApiException(data.error));
                    }
                } catch (e) {
                    // throw the error
                }
                return Promise.reject(new Error(response.statusText));
            }
        });
    }
    return rpcClient;
}

export async function getCurrent(name: string, generation: number): Promise<RegisteredNameInfo> {
    return await getRpcClient().request("getCurrent", {name, generation}, RegisteredNameInfoValidator);
}
