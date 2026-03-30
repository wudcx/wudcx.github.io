## Distributed Systems Theory, Common Interview Questions

### 什么是 CAP 理论

**Principle:**
CAP theorem states that a distributed system can only provide at most two of the three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are unavoidable in distributed systems, designers must choose between strong consistency (CP) or high availability (AP). ZooKeeper prioritizes consistency, while Eureka prioritizes availability.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

skinparam rectangle {
    backgroundColor #F0F0F0
    borderColor #333333
}

rectangle "CAP Theorem" as cap {
    rectangle "Consistency\n一致性" as C {
        card "All nodes see\nsame data" as C1
    }
    rectangle "Availability\n可用性" as A {
        card "Every request gets\nresponse" as A1
    }
    rectangle "Partition Tolerance\n分区容错" as P {
        card "System tolerates\nnetwork failures" as P1
    }
}

note top of cap
    "A distributed system can only\nguarantee 2 of 3 properties"
end note

@enduml
```

---

### 什么是 Base 理论

**Principle:**
Base theory is a practical approach to distributed systems that sacrifices strong consistency for availability and scalability. It stands for Basically Available, Soft state, and Eventually consistent. The key insight is that systems don't need to be consistent all the time - they just need to become consistent eventually, usually through asynchronous repair mechanisms.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

skinparam rectangle {
    backgroundColor #F0F0F0
    borderColor #333333
}

rectangle "BASE Theory" as base {

    rectangle "Basically Available\n基本可用" as BA {
        card "Degrade gracefully\nduring failures" as BA1
    }
    
    rectangle "Soft State\n软状态" as SS {
        card "State may be\nintermediate/temporary" as SS1
    }
    
    rectangle "Eventually Consistent\n最终一致性" as EC {
        card "System converges\nto consistent state" as EC1
    }
}

BA <-down-> SS : "Async\nUpdates"
SS <-down-> EC : "Time-based\nConvergence"

note right of base
    "Unlike ACID transactions,\nBASE embraces temporary\ninconsistency"
end note

@enduml
```

---

### 什么是2PC

**Principle:**
2PC (Two-Phase Commit) ensures atomicity in distributed transactions across multiple nodes. Phase 1 (Voting): coordinator asks participants to prepare; Phase 2 (Commit): if all vote Yes, coordinator sends Commit, otherwise Rollback. Drawbacks include synchronous blocking, single point of failure, and data inconsistency risk if coordinator crashes after sending Commit.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

participant "Coordinator\n协调者" as C
participant "Participant 1\n参与者1" as P1
participant "Participant 2\n参与者2" as P2
participant "Participant N\n参与者N" as PN

== Phase 1: Voting / 投票阶段 ==

C -> P1: **Prepare** Request
C -> P2: **Prepare** Request  
C -> PN: **Prepare** Request

P1 -> C: **Vote Yes** (prepared)
P2 -> C: **Vote Yes** (prepared)
PN -> C: **Vote Yes** (prepared)

== Phase 2: Commit / 提交阶段 ==

alt All Yes
    C -> P1: **Commit** Request
    C -> P2: **Commit** Request
    C -> PN: **Commit** Request
    P1 -> C: **Ack**
    P2 -> C: **Ack**
    PN -> C: **Ack**
else Any No or Timeout
    C -> P1: **Rollback** Request
    C -> P2: **Rollback** Request
    C -> PN: **Rollback** Request
end

@enduml
```

---

### 什么是Raft协议，解决了什么问题

**Principle:**
Raft is a distributed consensus algorithm designed to be more understandable than Paxos. It solves leader election, log replication, and safety in distributed systems. Nodes start as followers, become candidates to elect a leader, then the leader replicates log entries to followers. Safety is guaranteed through majority voting and log completeness requirements. Used in etcd, Consul, and CockroachDB.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

skinparam state {
    backgroundColor #E8F4FD
    borderColor #333333
    fontSize 12
}

state "Follower\n追随者" as F
state "Candidate\n候选者" as C
state "Leader\n领导者" as L

F --> C: **Election Timeout**\n(no heartbeat)
C --> L: **Won Election**\n(majority votes)
L --> C: **New Election**\n(terms outdated)
C --> F: **Other Leader Found**\n(higher term)
L --> F: **Heartbeat Timeout**

note right of L
    Leader handles all\nclient requests
end note

note right of C
    Requests votes from\nother nodes
end note

note right of F
    Responds to requests\nfrom leader
end note

@enduml
```

---

