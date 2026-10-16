package com.samuel.portfolio.util;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class RateLimiter {

    private static final Duration IDLE = Duration.ofDays(1);
    private static final Duration PURGE_EVERY = Duration.ofMinutes(10);

    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();
    private final AtomicReference<Instant> lastPurge = new AtomicReference<>(Instant.now());

    public boolean allow(String key, int limit, Duration window) {
        return waitSeconds(key, limit, window) == 0;
    }

    public long waitSeconds(String key, int limit, Duration window) {
        Instant now = Instant.now();
        purge(now);
        Deque<Instant> deque = hits.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(now.minus(window))) {
                deque.pollFirst();
            }
            if (deque.size() >= limit) {
                Duration remaining = Duration.between(now, deque.peekFirst().plus(window));
                return Math.max(1, remaining.toSeconds() + 1);
            }
            deque.addLast(now);
            return 0;
        }
    }

    private void purge(Instant now) {
        Instant last = lastPurge.get();
        if (last.plus(PURGE_EVERY).isAfter(now) || !lastPurge.compareAndSet(last, now)) {
            return;
        }
        hits.values().removeIf(deque -> {
            synchronized (deque) {
                return deque.isEmpty() || deque.peekLast().isBefore(now.minus(IDLE));
            }
        });
    }
}
