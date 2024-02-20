package org.moera.relay.push.util;

import java.sql.Timestamp;
import java.time.Instant;

public class Util {

    public static Timestamp now() {
        return Timestamp.from(Instant.now());
    }

    public static Long toEpochSecond(Timestamp timestamp) {
        return timestamp != null ? timestamp.toInstant().getEpochSecond() : null;
    }

    public static Timestamp toTimestamp(Long epochSecond) {
        return epochSecond != null ? Timestamp.from(Instant.ofEpochSecond(epochSecond)) : null;
    }

}
