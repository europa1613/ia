Yes, direct memory is entirely separate from -Xmx. Here’s the full picture:

JVM Memory Regions (all count toward container memory)

Container Memory Limit
│
├── JVM Heap (-Xms / -Xmx)           ← GC-managed, your objects
├── Direct Memory (-XX:MaxDirectMemorySize)  ← off-heap, NIO buffers, Netty
├── Metaspace (-XX:MaxMetaspaceSize)  ← class metadata
├── Thread stacks (-Xss × threads)
├── JVM internal / code cache
└── Native libs, OS overhead


-Xmx only caps the heap. Direct memory lives completely outside it — so your 512M addition is additive to whatever heap you’ve allocated.

What Changed in Your Upgrade

Spring Boot 3.x / Netty / modern NIO libraries allocate significantly more direct memory than older stacks. A few specific drivers:

	•	Netty’s buffer pool (if you’re using WebFlux or any reactive stack) scales with CPU count and is allocated as direct memory by default
	•	Spring Boot 3.2+ auto-configuration can activate more reactive components
	•	JDK 21→25 has changes to java.nio internals that can increase direct buffer usage in certain scenarios

Sizing the Container Limit

A practical formula:

Container Limit ≥ Xmx + MaxDirectMemorySize + MetaspaceSize + (threads × Xss) + ~150-200M overhead

Example:
  -Xmx 1024M
  -XX:MaxDirectMemorySize 512M
  -XX:MaxMetaspaceSize 256M
  ~300 threads × 512KB stack = ~150M
  Overhead: ~200M
  ──────────────────────────────
  Total: ~2150M → set limit to 2.5Gi


Practical Recommendations

JVM flags to add:

-XX:MaxDirectMemorySize=512m
-XX:MaxMetaspaceSize=256m        # prevent unbounded metaspace growth
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/heapdump.hprof


Kubernetes resource block — always set both requests and limits:

resources:
  requests:
    memory: "1.5Gi"   # what scheduler uses for placement
    cpu: "500m"
  limits:
    memory: "2.5Gi"   # what the OOM killer enforces


Key rule: if your container limit is too close to Xmx alone, the Linux OOM killer will terminate your pod — this shows up as OOMKilled in kubectl describe pod, not as a Java exception. That’s often harder to diagnose than the Java-level OutOfDirectMemoryError.

Diagnosing the Root Cause

Before just raising the limit, worth confirming it’s not a leak:

# Add at startup to expose direct memory via JMX / actuator
-Dio.netty.leakDetection.level=paranoid   # dev only, perf overhead

# Or check via actuator if micrometer is on the classpath
GET /actuator/metrics/jvm.buffer.memory.used?tag=id:direct


If the jvm.buffer.memory.used metric grows unboundedly over time rather than stabilizing, you have a leak — raising MaxDirectMemorySize just delays the failure.