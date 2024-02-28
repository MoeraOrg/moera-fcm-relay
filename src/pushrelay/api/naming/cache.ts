import { addMinutes, differenceInSeconds, isFuture, isPast } from 'date-fns';

import { RegisteredNameInfo } from "pushrelay/api/naming/api-types";
import { getCurrent } from "pushrelay/api/naming/api-calls";
import { NodeName } from "pushrelay/api/node-name";

const NORMAL_TTL = 6 * 60;
const ERROR_TTL = 1;
const MAX_CACHE_SIZE = 1024;

interface Record {
    nodeName: string;
    accessed: Date;
    deadline: Date | null;
    info: Promise<RegisteredNameInfo | null>;
    fetching: boolean;
}

const names = new Map<string, Record>();

async function fetchName(nodeName: string): Promise<RegisteredNameInfo | null> {
    const {name, generation} = NodeName.parse(nodeName);
    let info: RegisteredNameInfo | null = null;
    try {
        info = await getCurrent(name, generation);
    } catch (e) {
        // ignore
    }

    const record = names.get(nodeName);
    if (record != null) {
        record.deadline = addMinutes(new Date(), info != null ? NORMAL_TTL : ERROR_TTL);
        record.fetching = false;
    }

    return info;
}

export async function resolve(nodeName: string | null | undefined): Promise<RegisteredNameInfo | null> {
    if (nodeName == null) {
        return null;
    }

    let record = names.get(nodeName);
    if (record == null) {
        record = {nodeName, accessed: new Date(), deadline: null, info: fetchName(nodeName), fetching: true};
        names.set(nodeName, record);
    } else {
        record.accessed = new Date();
    }
    return record.info;

}

function purge(): void {
    names.forEach((record, nodeName) => {
        if (record.fetching) {
            return;
        }
        if (record.deadline != null && isPast(record.deadline)) {
            if (isFuture(addMinutes(record.accessed, NORMAL_TTL))) {
                record.fetching = true;
                record.info = fetchName(nodeName);
            } else {
                names.delete(nodeName);
            }
        }
    });

    if (names.size > MAX_CACHE_SIZE) {
        const unpopular = Array.from(names.entries())
            .filter(([_, r]) => !r.fetching)
            .map(([nodeName, r]) => ({nodeName, accessed: r.accessed}));
        unpopular.sort((u1, u2) => differenceInSeconds(u1.accessed, u2.accessed));
        for (let i = 0; i < names.size - MAX_CACHE_SIZE; i++) {
            names.delete(unpopular[i].nodeName);
        }
    }
}

setInterval(purge, 60000);
