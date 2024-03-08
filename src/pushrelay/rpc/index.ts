import express, { Express } from 'express';
import fs from 'fs/promises';
import * as process from 'process';

import rpcService from "pushrelay/rpc/service";
import { deriveLogger, getLogger as getParentLogger } from "pushrelay/logger";
import { Client } from "pushrelay/data/models/Client";

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

    app.get(["/", "/index.html"], async (req, res) => {
        const view = await fs.readFile("views/index.m.html");
        const endpointUrl = `${req.protocol}://${req.hostname}/moera-push-relay/`;
        const html = view.toString().replace("{{endpointUri}}", endpointUrl)
        res.type("html").send(html);
    });

    app.get("/health", async (req, res) => {
        await Client.findAll({limit: 1});
        res.type("txt").send("OK");
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
