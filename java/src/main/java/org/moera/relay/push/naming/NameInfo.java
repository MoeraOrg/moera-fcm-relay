package org.moera.relay.push.naming;

import org.moera.naming.rpc.RegisteredNameInfo;

public class NameInfo {

    private final RegisteredNameInfo info;

    public NameInfo(RegisteredNameInfo info) {
        this.info = info;
    }

    public RegisteredNameInfo getInfo() {
        return info;
    }

}
