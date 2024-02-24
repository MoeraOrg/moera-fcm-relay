import dotenv from 'dotenv';

import { initApp } from "pushrelay/rpc/app";
import { initDatabase } from "pushrelay/data/database";

dotenv.config({path: ['.env.local', '.env']});
initDatabase().then(() => {
    initApp();
});
