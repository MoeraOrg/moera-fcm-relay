import { App, initializeApp } from 'firebase-admin/app';

export let fcm: App;

export function initFcm() {
    fcm = initializeApp();
}
