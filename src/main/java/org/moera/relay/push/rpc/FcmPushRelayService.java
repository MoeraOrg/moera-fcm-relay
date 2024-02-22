package org.moera.relay.push.rpc;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.transaction.Transactional;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.googlecode.jsonrpc4j.spring.AutoJsonRpcServiceImpl;
import org.moera.commons.util.LogUtil;
import org.moera.relay.push.Config;
import org.moera.relay.push.data.Client;
import org.moera.relay.push.data.ClientRepository;
import org.moera.relay.push.rpc.exception.ServiceError;
import org.moera.relay.push.rpc.exception.ServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

@Service
@AutoJsonRpcServiceImpl
public class FcmPushRelayService implements PushRelayService {

    private static final Logger log = LoggerFactory.getLogger(FcmPushRelayService.class);

    private static final int CLIENT_ID_MAX_LENGTH = 256;
    private static final int LANG_MAX_LENGTH = 8;

    @Inject
    private Config config;

    @Inject
    private ClientRepository clientRepository;

    @Inject
    private FcmDelivery fcmDelivery;

    @Inject
    private MessageGenerator messageGenerator;

    @PostConstruct
    public void init() {
        try {
            FileInputStream serviceAccount = new FileInputStream(config.getFcmAccount());
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            log.error("Error initializing Firebase: {}", e.getMessage());
            System.exit(1);
        }
    }

    @Override
    @Transactional
    public void register(String clientId, String nodeName, String lang, byte[] signature) {
        log.info("register(): clientId = {}, nodeName = {}, lang = {}, signature = {}",
                LogUtil.format(clientId), LogUtil.format(nodeName), LogUtil.format(lang), LogUtil.format(signature));

        if (ObjectUtils.isEmpty(clientId)) {
            throw new ServiceException(ServiceError.CLIENT_ID_EMPTY);
        }
        if (clientId.length() > CLIENT_ID_MAX_LENGTH) {
            throw new ServiceException(ServiceError.CLIENT_ID_TOO_LONG);
        }
        if (ObjectUtils.isEmpty(nodeName)) {
            throw new ServiceException(ServiceError.NODE_NAME_EMPTY);
        }
        if (lang != null && lang.length() > LANG_MAX_LENGTH) {
            throw new ServiceException(ServiceError.LANG_TOO_LONG);
        }

        // TODO check node name and signature

        Client client = clientRepository.findByClientId(clientId).orElse(null);
        if (client == null) {
            client = new Client(clientId);
        }
        client.setNodeName(nodeName);
        client.setLang(lang);
        clientRepository.save(client);
    }

    @Override
    @Transactional
    public void feedStatus(String feedName, int notViewed, String nodeName, byte[] signature) {
        Collection<Client> clients = clientRepository.findByNodeName(nodeName);
        if (clients.isEmpty()) {
            throw new ServiceException(ServiceError.NO_CLIENTS);
        }

        if (!Objects.equals(feedName, "news")) {
            return;
        }

        // TODO check signature

        for (Client client : clients) {
            String body = messageGenerator.format(
                    client.getLang(),
                    "new-posts-newsfeed",
                    Map.of("count", notViewed));
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setBody(body)
                            .build())
                    .setAndroidConfig(AndroidConfig.builder()
                            .setTtl(24 * 60 * 60 * 1000)
                            .setNotification(AndroidNotification.builder()
                                    .setTag("news")
                                    .build())
                            .build())
                    .putData("url", "https://moera.page/@/~/news")
                    .setToken(client.getClientId())
                    .build();
            fcmDelivery.send(message, client.getClientId());
        }
    }

}
