import crypto from 'crypto';

import { Fingerprint, FingerprintSchema } from "pushrelay/fingerprint/fingerprint";
import { FingerprintWriter } from "pushrelay/fingerprint/writer";

export { Fingerprint, FingerprintSchema };

const PUBLIC_KEY_LENGTH = 64;

function toPublicKey(rawPublicKey: string): crypto.KeyObject {
    const buf = Buffer.from(rawPublicKey, "base64");
    const x = buf.subarray(0, PUBLIC_KEY_LENGTH / 2).toString("base64url");
    const y = buf.subarray(PUBLIC_KEY_LENGTH / 2, PUBLIC_KEY_LENGTH).toString("base64url");
    return crypto.createPublicKey({
        format: "jwk",
        key: {
            kty: "EC",
            x,
            y,
            crv: "secp256k1"
        }
    });
}

export function verifySignature(
    fingerprint: Fingerprint, schema: FingerprintSchema, rawPublicKey: string | null, signature: string
): boolean {
    if (rawPublicKey == null) {
        return false;
    }

    const fingerprintWriter = new FingerprintWriter();
    fingerprintWriter.append(fingerprint, schema);

    const verify = crypto.createVerify("SHA3-256");
    verify.update(fingerprintWriter.toBuffer());
    return verify.verify(toPublicKey(rawPublicKey), signature, "base64");
}
