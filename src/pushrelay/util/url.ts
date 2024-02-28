import * as URI from 'uri-js';

import { NodeName } from "pushrelay/api";

export function urlWithParameters(url: string,
                                  parameters: {[name: string]: string | number | boolean | null | undefined}): string {
    let query = "";
    for (let name in parameters) {
        if (parameters.hasOwnProperty(name)) {
            const value = parameters[name];
            if (value != null) {
                query += (query === "" ? "" : "&") + name + "=" + encodeURIComponent(value);
            }
        }
    }
    if (query === "") {
        return url;
    }
    return url + (url.indexOf("?") < 0 ? "?" : "&") + query;
}

export function universalLocation(
    clientUrl: string | null, nodeName: string | null | undefined, nodeRoot: string | null | undefined,
    location: string, readId?: string | null
): string {
    let url = (clientUrl ?? "https://moera.page") + "/@";
    if (nodeName != null) {
        url += encodeURIComponent(NodeName.shorten(nodeName));
    }
    url += "/";
    if (nodeRoot != null) {
        const {scheme, host, port} = URI.parse(nodeRoot);
        if (scheme && scheme !== "https") {
            url += scheme + ":";
        }
        url += host;
        if (port && port !== 443 && port !== "443") {
            url += ":" + port;
        }
    } else {
        url += "~";
    }
    if (location.startsWith("/moera")) {
        location = location.substring(6);
    }
    url += location;
    if (readId) {
        url = urlWithParameters(url, {read: readId});
    }
    return url;
}
