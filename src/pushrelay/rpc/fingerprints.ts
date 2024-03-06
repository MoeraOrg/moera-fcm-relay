import { Fingerprint, FingerprintSchema } from "pushrelay/fingerprint";

export const PushRelayRegisterFingerprintSchema: FingerprintSchema = [
    ["version", "number"],
    ["objectType", "string"],
    ["clientId", "string"],
    ["lang", "string"],
    ["signedAt", "number"]
];

export const createPushRelayRegisterFingerprint = (
    clientId: string, lang: string | null, signedAt: number
): Fingerprint => ({
    version: 0,
    objectType: "PUSH_RELAY_REGISTER",
    clientId,
    lang,
    signedAt
});

export const PushRelayMessageFingerprintSchema: FingerprintSchema = [
    ["version", "number"],
    ["objectType", "string"],
    ["signedAt", "number"]
];

export const createPushRelayMessageFingerprint = (signedAt: number): Fingerprint => ({
    version: 0,
    objectType: "PUSH_RELAY_MESSAGE",
    signedAt
});
