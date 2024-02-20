package org.moera.relay.push.rpc;

import java.io.IOException;
import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.jsonrpc4j.JsonRpcServer;
import org.moera.naming.rpc.NamingService;
import org.moera.relay.push.rpc.exception.ServiceErrorResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class PushRelayController {

    private static final Logger log = LoggerFactory.getLogger(PushRelayController.class);

    private JsonRpcServer jsonRpcServer;

    @Inject
    private PushRelayService pushRelayService;

    @Inject
    private ServiceErrorResolver serviceErrorResolver;

    @PostConstruct
    protected void init() {
        jsonRpcServer = new JsonRpcServer(new ObjectMapper(), pushRelayService, NamingService.class);
        jsonRpcServer.setAllowExtraParams(true);
        jsonRpcServer.setAllowLessParams(true);
        jsonRpcServer.setErrorResolver(serviceErrorResolver);
    }

    @CrossOrigin("*")
    @PostMapping("/moera-push-relay")
    public void pushRelay(HttpServletRequest request, HttpServletResponse response) throws IOException {
        jsonRpcServer.handle(request, response);
    }

}
