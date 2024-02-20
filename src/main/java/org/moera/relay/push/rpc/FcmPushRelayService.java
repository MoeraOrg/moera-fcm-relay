package org.moera.relay.push.rpc;

import javax.inject.Inject;
import javax.transaction.Transactional;

import com.googlecode.jsonrpc4j.spring.AutoJsonRpcServiceImpl;
import org.moera.commons.util.LogUtil;
import org.moera.relay.push.data.Client;
import org.moera.relay.push.data.ClientRepository;
import org.moera.relay.push.rpc.exception.ServiceError;
import org.moera.relay.push.rpc.exception.ServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

@Component
@AutoJsonRpcServiceImpl
public class FcmPushRelayService implements PushRelayService {

    private static final Logger log = LoggerFactory.getLogger(FcmPushRelayService.class);

    private static final int CLIENT_ID_MAX_LENGTH = 256;
    private static final int LANG_MAX_LENGTH = 8;

    @Inject
    private ClientRepository clientRepository;

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

}
