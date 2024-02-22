package org.moera.relay.push.rpc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import javax.annotation.PostConstruct;
import javax.inject.Inject;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.SendResponse;
import org.moera.relay.push.data.ClientRepository;
import org.moera.relay.push.util.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

@Service
public class FcmDelivery implements Runnable {

    private static class StampedMessage {

        private final Message message;
        private final String clientId;
        private final Instant createdAt = Instant.now();
        private Instant resendAt;

        StampedMessage(Message message, String clientId) {
            this.message = message;
            this.clientId = clientId;
        }

        public Message getMessage() {
            return message;
        }

        public String getClientId() {
            return clientId;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public Instant getResendAt() {
            return resendAt;
        }

        public void setResendAt(Instant resendAt) {
            this.resendAt = resendAt;
        }

    }

    private static final Logger log = LoggerFactory.getLogger(FcmDelivery.class);

    private static final int MAX_MESSAGES_BATCH = 500;

    private final BlockingQueue<StampedMessage> queue = new LinkedBlockingQueue<>();
    private List<StampedMessage> postponed = new ArrayList<>();
    private final Object postponedLock = new Object();

    @Inject
    private ClientRepository clientRepository;

    @Inject
    private PlatformTransactionManager txManager;

    @PostConstruct
    public void init() {
        Thread thread = new Thread(this);
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    public void run() {
        try {
            while (true) {
                List<StampedMessage> messages = new ArrayList<>();
                messages.add(queue.take());
                queue.drainTo(messages, MAX_MESSAGES_BATCH - 1);
                try {
                    BatchResponse responses = FirebaseMessaging.getInstance().sendEach(
                            messages.stream().map(StampedMessage::getMessage).toList());
                    for (int i = 0; i < messages.size(); i++) {
                        SendResponse response = responses.getResponses().get(i);
                        if (response.isSuccessful()) {
                            continue;
                        }
                        postpone(messages.get(i), response.getException());
                    }
                } catch (FirebaseMessagingException e) {
                    messages.forEach(sm -> postpone(sm, e));
                }
            }
        } catch (InterruptedException e) {
            // just exit
        }
    }

    private void postpone(StampedMessage message, FirebaseMessagingException exception) {
        switch (exception.getMessagingErrorCode()) {
            case SENDER_ID_MISMATCH:
            case UNREGISTERED:
                unregister(message.getClientId());
                break;

            default:
                log.warn("Error sending a message: {}", exception.getMessagingErrorCode());

                long amount = 10;
                if (message.getResendAt() != null) {
                    amount = message.getCreatedAt().until(message.getResendAt(), ChronoUnit.SECONDS);
                    amount *= 2;
                    if (amount > 6 * 60 * 60) {
                        break;
                    }
                }
                message.setResendAt(Instant.now().plus(amount, ChronoUnit.SECONDS));
                synchronized (postponedLock) {
                    postponed.add(message);
                }
        }
    }

    private void unregister(String clientId) {
        try {
            Transaction.execute(txManager, () -> {
                clientRepository.findByClientId(clientId)
                        .ifPresent(client -> clientRepository.delete(client));
                return null;
            });
        } catch (Throwable e) {
            log.error("Cannot delete the client", e);
        }
    }

    private void send(StampedMessage message) {
        try {
            queue.put(message);
        } catch (InterruptedException e) {
            // just exit
        }
    }

    public void send(Message message, String clientId) {
        send(new StampedMessage(message, clientId));
    }

    @Scheduled(fixedDelayString = "PT10S")
    public void resend() {
        List<StampedMessage> waiting = new ArrayList<>();
        List<StampedMessage> ready = new ArrayList<>();
        synchronized (postponedLock) {
            for (StampedMessage message : postponed) {
                if (message.getResendAt().isBefore(Instant.now())) {
                    ready.add(message);
                } else {
                    waiting.add(message);
                }
            }
            postponed = waiting;
        }
        ready.forEach(this::send);
    }

}
