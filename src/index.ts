import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    let html = fs.readFileSync("views/index.html").toString();
    const endpointUrl = `${req.protocol}://${req.hostname}/moera-push-relay/`;
    html = html.replace("{{endpointUri}}", endpointUrl)
    res.type("html").send(html);
});

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
