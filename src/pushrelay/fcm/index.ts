import { FirebaseError } from 'firebase-admin';
import { App, initializeApp } from 'firebase-admin/app';
import { getMessaging, TokenMessage } from 'firebase-admin/messaging';
import { addSeconds, differenceInSeconds, isPast } from 'date-fns';

import { Client } from "pushrelay/data/models/Client";
import { deriveLogger } from "pushrelay/logger";

export let index: App;

export const getLogger = deriveLogger("fcm");

export function initFcm(): void {
    index = initializeApp();
}

const MAX_MESSAGES_BATCH = 500;

interface StampedMessage {
    message: TokenMessage;
    createdAt: Date;
    resendAt?: Date;
}

let queue: StampedMessage[] = [];
let delivering = false;

export function sendMessage(message: TokenMessage): void {
    if (getLogger().isDebugEnabled()) {
        getLogger().debug("FCM message data: " + JSON.stringify(message.data));
    }
    queue.push({message, createdAt: new Date()});
    deliverMessages().then();
}

async function deliverMessages(): Promise<void> {
    if (delivering) {
        return;
    }
    if (queue.length === 0) {
        return;
    }

    delivering = true;
    try {
        while (true) {
            let messages: StampedMessage[];
            if (queue.length <= MAX_MESSAGES_BATCH) {
                messages = queue;
                queue = [];
            } else {
                messages = queue.slice(0, MAX_MESSAGES_BATCH);
                queue = queue.slice(MAX_MESSAGES_BATCH);
            }

            messages = messages.filter(sm => sm.resendAt == null || isPast(sm.resendAt));
            if (messages.length === 0) {
                return;
            }

            try {
                const responses = await getMessaging().sendEach(messages.map(sm => sm.message));
                for (let i = 0; i < messages.length; i++) {
                    const response = responses.responses[i];
                    if (response.success) {
                        continue;
                    }
                    await postpone(messages[i], response.error);
                }
            } catch (e) {
                if (isFirebaseError(e)) {
                    const error = e;
                    messages.forEach(sm => postpone(sm, error));
                } else {
                    throw e;
                }
            }
        }
    } finally {
        delivering = false;
    }
}

setInterval(deliverMessages, 10000);

function isFirebaseError(error: any): error is FirebaseError {
    return error != null && typeof error === 'object' && 'code' in error;
}

async function postpone(message: StampedMessage, error: FirebaseError | undefined): Promise<void> {
    switch (error?.code) {
        case "messaging/mismatched-credential":
        case "messaging/invalid-registration-token":
        case "messaging/invalid-argument": // Also means that the token is invalid
        case "messaging/registration-token-not-registered":
            await unregister(message.message.token);
            break;

        default:
            getLogger().warn(`Error sending a message: ${error?.code}`);

            let amount = 10;
            if (message.resendAt != null) {
                amount = differenceInSeconds(message.resendAt, message.createdAt);
                amount *= 2;
                if (amount > 6 * 60 * 60) {
                    break;
                }
            }
            message.resendAt = addSeconds(new Date(), amount);
            queue.push(message);
    }
}

async function unregister(clientId: string): Promise<void> {
    getLogger().info(`Unregistering client '${(clientId ?? '').substring(0, 6)}'`);
    const client = await Client.findOne({where: {clientId}});
    if (client != null) {
        await client.destroy();
    }
}
