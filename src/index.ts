import dotenv from 'dotenv';

import { initI18n } from "pushrelay/i18n";
import { initDatabase } from "pushrelay/data";
import { initFcm } from "pushrelay/fcm";
import { initApp } from "pushrelay/rpc";

dotenv.config({path: ['.env.local', '.env']});
initI18n();
initDatabase().then(() => {
    initFcm();
    initApp();
});
