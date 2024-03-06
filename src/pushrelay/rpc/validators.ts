import { addMinutes, fromUnixTime, isPast } from 'date-fns';

import { RegisteredNameInfo } from "pushrelay/api";
import { verifySignature } from "pushrelay/fingerprint";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";
import {
    createPushRelayMessageFingerprint,
    createPushRelayRegisterFingerprint,
    PushRelayMessageFingerprintSchema,
    PushRelayRegisterFingerprintSchema
} from "pushrelay/rpc/fingerprints";

export function validateSignatureParameters(
    signedAt: number | null | undefined, signature: string | null | undefined
): void {
    if (signedAt == null) {
        throw new ServiceException(ServiceError.SIGNED_AT_EMPTY);
    }
    if (isPast(addMinutes(fromUnixTime(signedAt), 2))) {
        throw new ServiceException(ServiceError.SIGNED_AT_TOO_OLD);
    }
    if (!signature) {
        throw new ServiceException(ServiceError.SIGNATURE_EMPTY);
    }
}

export function validateRegisterSignature(
    clientId: string, nodeInfo: RegisteredNameInfo, lang: string | null, signedAt: number | null | undefined,
    signature: string | null | undefined
): void {
    validateSignatureParameters(signedAt, signature);

    const signatureCorrect = verifySignature(
        createPushRelayRegisterFingerprint(clientId, lang, signedAt!),
        PushRelayRegisterFingerprintSchema,
        nodeInfo.signingKey ?? null,
        signature!
    );

    if (!signatureCorrect) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }
}

export function validateMessageSignature(
    nodeInfo: RegisteredNameInfo, signedAt: number | null | undefined, signature: string | null | undefined
): void {
    validateSignatureParameters(signedAt, signature);

    const signatureCorrect = verifySignature(
        createPushRelayMessageFingerprint(signedAt!),
        PushRelayMessageFingerprintSchema,
        nodeInfo.signingKey ?? null,
        signature!
    );

    if (!signatureCorrect) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }
}
