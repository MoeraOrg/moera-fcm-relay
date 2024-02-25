import dotenv from 'dotenv';

import { initDatabase } from "pushrelay/data";
import { initFcm } from "pushrelay/fcm";
import { initApp } from "pushrelay/rpc";

dotenv.config({path: ['.env.local', '.env']});
initDatabase().then(() => {
    initFcm();
    initApp();
});
