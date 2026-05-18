# JVM Direct Memory & Kubernetes: JDK 25 / Spring Boot 3.5 Upgrade Guide

## Is Direct Memory Separate from `-Xmx`?

Yes — **direct memory is entirely separate from `-Xmx`**. `-Xmx` only caps the heap. Direct memory lives completely outside it, so your `512M` addition to `-XX:MaxDirectMemorySize` is **additive** to whatever heap you've allocated.

---

## JVM Memory Regions (all count toward container memory)

```
Container Memory Limit
│
├── JVM Heap (-Xms / -Xmx)                  ← GC-managed, your objects
├── Direct Memory (-XX:MaxDirectMemorySize)  ← off-heap, NIO buffers, Netty
├── Metaspace (-XX:MaxMetaspaceSize)         ← class metadata
├── Thread stacks (-Xss × threads)
├── JVM internal / code cache
└── Native libs, OS overhead
```

---

## What Changed in Your Upgrade

Spring Boot 3.x / Netty / modern NIO libraries allocate significantly more direct memory than older stacks. Key drivers:

- **Netty's buffer pool** (if you're using WebFlux or any reactive stack) scales with CPU count and is allocated as direct memory by default
- **Spring Boot 3.2+ auto-configuration** can activate more reactive components
- **JDK 21→25** has changes to `java.nio` internals that can increase direct buffer usage in certain scenarios

---

## Sizing the Container Limit

A practical formula:

```
Container Limit ≥ Xmx + MaxDirectMemorySize + MetaspaceSize + (threads × Xss) + ~150-200M overhead
```

### Example

| Region | Size |
|---|---|
| `-Xmx` | 1024M |
| `-XX:MaxDirectMemorySize` | 512M |
| `-XX:MaxMetaspaceSize` | 256M |
| ~300 threads × 512KB stack | ~150M |
| Overhead (JVM internals, native libs) | ~200M |
| **Total** | **~2150M → set limit to `2.5Gi`** |

---

## Practical Recommendations

### JVM Flags to Add

```bash
-XX:MaxDirectMemorySize=512m
-XX:MaxMetaspaceSize=256m         # prevent unbounded metaspace growth
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/heapdump.hprof
```

### Kubernetes Resource Block

Always set both `requests` and `limits`:

```yaml
resources:
  requests:
    memory: "1.5Gi"   # what the scheduler uses for pod placement
    cpu: "500m"
  limits:
    memory: "2.5Gi"   # what the Linux OOM killer enforces
```

> **Key rule:** If your container limit is too close to `-Xmx` alone, the Linux OOM killer will terminate your pod. This shows up as `OOMKilled` in `kubectl describe pod` — *not* as a Java exception — which is often harder to diagnose than a Java-level `OutOfDirectMemoryError`.

---

## Diagnosing the Root Cause

Before simply raising the limit, confirm it's not a leak.

### Enable Netty Leak Detection (dev only — has perf overhead)

```bash
-Dio.netty.leakDetection.level=paranoid
```

### Check via Spring Boot Actuator (if Micrometer is on the classpath)

```
GET /actuator/metrics/jvm.buffer.memory.used?tag=id:direct
```

If `jvm.buffer.memory.used` grows unboundedly over time rather than stabilizing, you have a **leak** — raising `MaxDirectMemorySize` just delays the failure.