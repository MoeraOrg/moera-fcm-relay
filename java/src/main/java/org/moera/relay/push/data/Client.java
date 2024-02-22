package org.moera.relay.push.data;

import java.sql.Timestamp;
import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import org.moera.relay.push.util.Util;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    private UUID id;

    @NotNull
    private String clientId;

    @NotNull
    private String nodeName;

    private String lang;

    @NotNull
    private Timestamp createdAt = Util.now();

    public Client() {
    }

    public Client(String clientId) {
        this.id = UUID.randomUUID();
        this.clientId = clientId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

}
