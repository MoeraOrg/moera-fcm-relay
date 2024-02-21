package org.moera.relay.push.naming;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import javax.annotation.PostConstruct;

import com.googlecode.jsonrpc4j.JsonRpcHttpClient;
import com.googlecode.jsonrpc4j.ProxyUtil;
import org.moera.naming.rpc.NamingService;
import org.moera.naming.rpc.RegisteredName;
import org.moera.naming.rpc.RegisteredNameInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NamingCache {

    private static final Logger log = LoggerFactory.getLogger(NamingCache.class);

    private static final String NAMING_SERVICE_URL = "https://naming.moera.org/moera-naming";
    private static final int NAMING_THREADS = 16;
    private static final Duration NORMAL_TTL = Duration.of(6, ChronoUnit.HOURS);
    private static final Duration ERROR_TTL = Duration.of(1, ChronoUnit.MINUTES);

    private NamingService namingService;
    private final ExecutorService executor = Executors.newFixedThreadPool(NAMING_THREADS);

    private final class Record {

        private final String nodeName;
        private Instant accessed = Instant.now();
        private Instant deadline;
        private NameInfo url;
        private List<CompletableFuture<NameInfo>> waitList;
        private boolean fetching;
        private final Object lock = new Object();

        Record(String nodeName) {
            this.nodeName = nodeName;
            waitList = new ArrayList<>();
        }

        public boolean isLoaded() {
            return waitList == null;
        }

        public void reload() {
            synchronized (lock) {
                if (isLoaded()) {
                    deadline = null;
                    waitList = new ArrayList<>();
                    fetch();
                }
            }
        }

        public Future<NameInfo> getInfo() {
            accessed = Instant.now();
            if (isLoaded()) {
                return CompletableFuture.completedFuture(url);
            }
            synchronized (lock) {
                if (isLoaded()) {
                    return CompletableFuture.completedFuture(url);
                }
                CompletableFuture<NameInfo> future = new CompletableFuture<>();
                waitList.add(future);
                fetch();
                return future;
            }
        }

        private void setInfo(NameInfo url) {
            List<CompletableFuture<NameInfo>> list;
            synchronized (lock) {
                if (isLoaded()) {
                    throw new IllegalStateException("URL is loaded already");
                }
                this.url = url;
                deadline = Instant.now().plus(url != null ? NORMAL_TTL : ERROR_TTL);

                list = waitList;
                waitList = null;
            }
            list.forEach(future -> future.complete(url));
        }

        private void fetch() {
            if (!fetching) {
                fetching = true;
                executor.submit(this::fetchName);
            }
        }

        private void fetchName() {
            try {
                RegisteredName registeredName = RegisteredName.parse(nodeName);
                RegisteredNameInfo info =
                        namingService.getCurrent(registeredName.getName(), registeredName.getGeneration());
                setInfo(new NameInfo(info));
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                setInfo(null);
            }
        }

        public boolean isExpired() {
            return deadline != null && deadline.isBefore(Instant.now());
        }

        public boolean isPopular() {
            return accessed.plus(NORMAL_TTL).isAfter(Instant.now());
        }

    }

    private final ReadWriteLock cacheLock = new ReentrantReadWriteLock();
    private final Map<String, Record> cache = new HashMap<>();

    @PostConstruct
    public void init() throws MalformedURLException {
        JsonRpcHttpClient client = new JsonRpcHttpClient(new URL(NAMING_SERVICE_URL));
        namingService = ProxyUtil.createClientProxy(getClass().getClassLoader(), NamingService.class, client);
    }

    public Optional<NameInfo> getFast(String nodeName) {
        Future<NameInfo> future = getOrRun(nodeName);
        try {
            NameInfo nameInfo = future.get(500, TimeUnit.MILLISECONDS);
            return Optional.of(nameInfo);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            return Optional.empty();
        }
    }

    public NameInfo get(String nodeName) {
        try {
            return getOrRun(nodeName).get();
        } catch (InterruptedException | ExecutionException e) {
            return null;
        }
    }

    private Future<NameInfo> getOrRun(String nodeName) {
        nodeName = RegisteredName.expand(nodeName);
        Record record;
        cacheLock.readLock().lock();
        try {
            record = cache.get(nodeName);
        } finally {
            cacheLock.readLock().unlock();
        }
        if (record == null) {
            cacheLock.writeLock().lock();
            try {
                record = cache.get(nodeName);
                if (record == null) {
                    record = new Record(nodeName);
                    cache.put(nodeName, record);
                }
            } finally {
                cacheLock.writeLock().unlock();
            }
        }
        return record.getInfo();
    }

    @Scheduled(fixedDelayString = "PT1M")
    public void purge() {
        List<String> remove;
        cacheLock.readLock().lock();
        try {
            remove = cache.entrySet().stream()
                    .filter(e -> e.getValue().isExpired())
                    .map(Map.Entry::getKey)
                    .toList();
        } finally {
            cacheLock.readLock().unlock();
        }
        if (!remove.isEmpty()) {
            cacheLock.writeLock().lock();
            try {
                remove.forEach(key -> {
                    Record record = cache.get(key);
                    if (record.isPopular()) {
                        record.reload();
                    } else {
                        cache.remove(key);
                    }
                });
            } finally {
                cacheLock.writeLock().unlock();
            }
        }
    }

}
