import dotenv from 'dotenv';

import { initI18n } from "pushrelay/i18n";
import { initDatabase } from "pushrelay/data";
import { initFcm } from "pushrelay/fcm";
import { initApp } from "pushrelay/rpc";

dotenv.config({path: [`${process.env.HOME}/.env`, '.env.local', '.env']});
initI18n()
    .then(() =>
        initDatabase()
    ).then(() => {
        initFcm();
        initApp();
    });
