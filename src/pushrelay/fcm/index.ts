import { App, initializeApp } from 'firebase-admin/app';

export let index: App;

export function initFcm() {
    index = initializeApp();
}
