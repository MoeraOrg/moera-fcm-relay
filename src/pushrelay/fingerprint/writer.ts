import { Fingerprint, FingerprintPrimitiveType, FingerprintSchema } from "pushrelay/fingerprint/fingerprint";

export class FingerprintWriter {

    data: number[] = [];

    private appendNull(): void {
        this.data.push(0xff);
    }

    private appendString(str: string | null): void {
        if (str == null) {
            this.appendNull();
            return;
        }
        const buf = Buffer.from(str);
        this.appendNumber(buf.length);
        this.data = this.data.concat([...buf.values()]);
    }

    private appendBoolean(b: boolean): void {
        this.data.push(b ? 1 : 0);
    }

    private appendNumber(l: number): void {
        let len: number;
        if (l < 0xfc) {
            len = 1;
        } else if (l <= 0xffff) {
            this.data.push(0xfc);
            len = 2;
        } else if (l <= 0xffffffff) {
            this.data.push(0xfd);
            len = 4;
        } else {
            this.data.push(0xfe);
            len = 8;
        }
        for (let i = 0; i < len; i++) {
            this.data.push(l & 0xff);
            l = l >> 8;
        }
    }

    private appendFingerprint(fingerprint: Fingerprint, schema: FingerprintSchema): void {
        for (const field of schema) {
            this.append(fingerprint[field[0]], field[1]);
        }
    }

    public append(value: any, type: FingerprintPrimitiveType): void {
        if (value == null) {
            this.appendNull();
        } else if (Array.isArray(type)) {
            this.appendFingerprint(value, type);
        } else if (type === "string") {
            this.appendString(value);
        } else if (type === "boolean") {
            this.appendBoolean(value);
        } else if (type === "number") {
            this.appendNumber(value);
        }
    }

    public toBuffer(): Buffer {
        return Buffer.from(this.data);
    }

}
