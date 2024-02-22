package org.moera.relay.push;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Config {

    @Value("${relay.fcm.account}")
    private String fcmAccount;

    public String getFcmAccount() {
        return fcmAccount;
    }

    public void setFcmAccount(String fcmAccount) {
        this.fcmAccount = fcmAccount;
    }

}
