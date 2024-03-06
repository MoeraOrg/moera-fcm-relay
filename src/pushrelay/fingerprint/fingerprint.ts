export type FingerprintPrimitiveType = "string" | "boolean" | "number" | FingerprintSchema;
export type FingerprintSchema = [string, FingerprintPrimitiveType][];
export type Fingerprint = Partial<Record<string, any>>;
