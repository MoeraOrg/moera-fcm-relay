export interface ErrorResult {
    code: number;
    message: string;
}

export interface RegisteredNameInfo {
    name: string;
    generation: number;
    updatingKey: string;
    nodeUri?: string | null;
    signingKey?: string | null;
    validFrom?: number | null;
}
