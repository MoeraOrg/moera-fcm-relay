import { addMinutes, fromUnixTime, isPast } from 'date-fns';
import { RegisteredNameInfo } from 'moeralib/naming/types';
import { createPushRelayMessageFingerprint0, createPushRelayRegisterFingerprint0 } from 'moeralib/node/fingerprints';
import { rawToPublicKey, verifyFingerprintSignature } from 'moeralib/crypto';

import { ServiceError, ServiceException } from "pushrelay/rpc/errors";

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

    if (nodeInfo.signingKey == null) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }

    const signatureCorrect = verifyFingerprintSignature(
        createPushRelayRegisterFingerprint0(clientId, lang, signedAt!),
        Buffer.from(signature!, "base64"),
        rawToPublicKey(Buffer.from(nodeInfo.signingKey, "base64"))
    );

    if (!signatureCorrect) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }
}

export function validateMessageSignature(
    nodeInfo: RegisteredNameInfo, signedAt: number | null | undefined, signature: string | null | undefined
): void {
    validateSignatureParameters(signedAt, signature);

    if (nodeInfo.signingKey == null) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }

    const signatureCorrect = verifyFingerprintSignature(
        createPushRelayMessageFingerprint0(signedAt!),
        Buffer.from(signature!, "base64"),
        rawToPublicKey(Buffer.from(nodeInfo.signingKey, "base64"))
    );

    if (!signatureCorrect) {
        throw new ServiceException(ServiceError.SIGNATURE_INCORRECT);
    }
}
