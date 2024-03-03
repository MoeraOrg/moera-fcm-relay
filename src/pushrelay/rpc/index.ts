import express, { Express, Request, Response } from 'express';
import fs from 'fs/promises';
import * as process from 'process';

import rpcService from "pushrelay/rpc/service";
import { deriveLogger, getLogger as getParentLogger } from "pushrelay/logger";

export function initApp(): void {
    const app: Express = express();
    const port = process.env.PORT;

    if (process.env.TRUST_PROXY === "true") {
        app.set('trust proxy', true);
    }
    app.use(express.static("public"));
    app.use(express.json({
        type: [
            "application/json-rpc",
            "application/json",
            "application/jsonrequest"
        ]
    }));

    app.get(["/", "/index.html"], async (req: Request, res: Response) => {
        const view = await fs.readFile("views/index.m.html");
        const endpointUrl = `${req.protocol}://${req.hostname}/moera-push-relay/`;
        const html = view.toString().replace("{{endpointUri}}", endpointUrl)
        res.type("html").send(html);
    });

    app.post("/moera-push-relay", (req, res) => {
        try {
            const jsonRPCRequest = req.body;
            rpcService.receive(jsonRPCRequest).then((jsonRPCResponse) => {
                if (jsonRPCResponse) {
                    res.json(jsonRPCResponse);
                } else {
                    res.sendStatus(204);
                }
            });
        } catch (e) {
            getParentLogger().error(e);
            res.sendStatus(500);
        }
    });

    app.listen(port, () => {
        getParentLogger().info(`Server is running at http://localhost:${port}`);
    });
}

export const getLogger = deriveLogger("rpc");
