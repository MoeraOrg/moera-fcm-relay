import dotenv from 'dotenv';

import { initApp } from "pushrelay/rpc/app";
import { initDatabase } from "pushrelay/data/database";
import { initFcm } from "pushrelay/fcm/fcm";

dotenv.config({path: ['.env.local', '.env']});
initDatabase().then(() => {
    initFcm();
    initApp();
});
