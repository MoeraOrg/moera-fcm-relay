import express, { Express, Request, Response } from 'express';
import fs from 'fs/promises';

import rpcService from "pushrelay/rpc/service";
import logger from "pushrelay/logger";

export function initApp(): void {
    const app: Express = express();
    const port = process.env.PORT;

    app.use(express.static("public"));
    app.use(express.json());

    app.get(["/", "/index.html"], async (req: Request, res: Response) => {
        const view = await fs.readFile("views/index.m.html");
        const endpointUrl = `${req.protocol}://${req.hostname}/moera-push-relay/`;
        const html = view.toString().replace("{{endpointUri}}", endpointUrl)
        res.type("html").send(html);
    });

    app.post("/moera-push-relay", (req, res) => {
        const jsonRPCRequest = req.body;
        rpcService.receive(jsonRPCRequest).then((jsonRPCResponse) => {
            if (jsonRPCResponse) {
                res.json(jsonRPCResponse);
            } else {
                res.sendStatus(204);
            }
        });
    });

    app.listen(port, () => {
        logger.info(`[server]: Server is running at http://localhost:${port}`);
    });
}
