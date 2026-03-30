## etcd, Common Interview Questions

### etcd 中一个任期是什么意思

**Principle:**
In etcd's Raft implementation, a Term is a logical clock - a monotonically increasing integer starting from 0. Each election increments the term. Terms help distinguish election cycles, identify stale information, resolve conflicts, and are embedded in log entries. During network partitions, multiple terms may exist, and nodes with lower terms must step down.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Timeline\n时间线" as T

rectangle "Term 0" as T0
rectangle "Term 1" as T1
rectangle "Term 2" as T2
rectangle "Term 3" as T3

T0 -[hidden]-> T1
T1 -[hidden]-> T2
T2 -[hidden]-> T3

note bottom of T0
    初始状态\n集群启动
end note

note bottom of T1
    第一次选举\nLeader: Node A
end note

note bottom of T2
    第二次选举\nLeader: Node B
end note

note bottom of T3
    第三次选举\nLeader: Node C
end note

@enduml
```

---

### etcd中raft状态机是怎么样切换的

**Principle:**
    if (electionTimeout) -> Candidate;
    if (appendEntries) -> stay Follower;
    if (voteRequest && canVote) -> grant vote;
case Candidate:
    if (wonElection) -> Leader;
    if (electionTimeout) -> restart election;
    if (higherTermFound) -> Follower;
case Leader:
    if (higherTermFound) -> Follower;
    if (heartbeatTimeout) -> sendHeartbeat();
}
```


etcd nodes transition between three states: Follower, Candidate, and Leader. Follower becomes Candidate when election timeout occurs. Candidate becomes Leader on majority votes. Any state transitions to Follower upon discovering higher term. Leader sends heartbeats to maintain authority and steps down if a higher term is discovered.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

skinparam state {
    backgroundColor #E8F4FD
    borderColor #333333
    fontSize 11
}

state "Follower\n追随者" as F {
    note: "默认状态\n等待心跳或超时"
}

state "Candidate\n候选者" as C {
    note: "发起选举\n请求投票"
}

state "Leader\n领导者" as L {
    note: "处理请求\n发送心跳"
}

F --> C: **选举超时\n未收到心跳**
C --> L: **赢得选举\n多数票**
C --> F: **发现更高Term**
C --> C: **选举超时\n重新选举**
L --> F: **发现更高Term**

note right of F
    超时时间：\n100-500ms随机\n避免同时发起选举
end note

@enduml
```

---

### 如何防止候选者在遗漏数据的情况下成为总统

**Principle:**
Raft prevents incomplete candidates from becoming leader through vote restriction. Candidates include lastLogTerm and lastLogIndex in vote requests. Voters deny vote if candidate's log is behind theirs. Comparison: higher term wins, or same term with higher index wins. This ensures new leader has all committed entries.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Candidate\n候选者" as C {
    card "lastLogTerm = 3\nlastLogIndex = 100" as C1
}

rectangle "Voter\n投票者" as V {
    card "lastLogTerm = 3\nlastLogIndex = 99" as V1
}

C -> V: **VoteRequest\n(3, 100)**
V -> C: **VoteGranted**

note right of V
    日志比较：\nC的Term=3 >= V的Term=3\nC的Index=100 > V的Index=99\n所以V投赞成票
end note

note left of C
    只有获得多数票\n才能成为Leader
end note

@enduml
```

---

### etcd某个节点宕机后会怎么做

**Principle:**

当etcd集群中某个节点宕机时，集群会根据节点类型和故障情况采取不同措施：

**Follower宕机**：
- Leader检测到Follower心跳超时（通常几秒）
- 将该节点从通信中移除
- 不影响集群的写操作（如果Leader还在）
- Follower恢复后，会自动重新加入并同步数据

**Leader宕机**：
- 其他节点等待心跳超时
- 触发新一轮选举
- 如果原Leader恢复，会发现更高的Term，自动转为Follower
- 选举期间集群不可用（通常几秒）

**Candidate宕机**：
- 选举超时后，其他节点重新发起选举
- 不影响集群的正常Leader工作

- 节点恢复后，从Leader获取缺失的日志条目
- 通过Raft日志重放恢复状态机状态
- 如果日志损坏，需要从快照恢复

- 少数派分区无法选主，自动变为Follower
- 原Leader在多数派分区继续工作
- 分区恢复后，少数派节点同步新Leader数据


When an etcd node fails: Follower failure is detected via heartbeat timeout, removed from communication,不影响写操作. Leader failure triggers new election, cluster unavailable during election. Recovery involves re-syncing from leader via log replay or snapshot restoration. Network partition isolates minority, primary continues working.



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "正常状态" as N {
    rectangle "Leader" as L
    rectangle "Follower1" as F1
    rectangle "Follower2" as F2
}

rectangle "Follower宕机" as FD {
    rectangle "Leader" as L2
    rectangle "Follower1" as F12
    card "❌ Follower2\n宕机" as F23
}

rectangle "Leader宕机" as LD {
    card "❌ Leader\n宕机" as L3
    rectangle "Follower1\n发起选举" as F13
    rectangle "Follower2" as F22
}

N -[hidden]-> FD
FD -[hidden]-> LD

note bottom of FD
    Follower恢复后\n自动同步数据
end note

note bottom of LD
    新选举产生Leader\n集群恢复工作
end note

@enduml
```

---

### 为什么raft算法不考虑拜占庭将军问题

**Principle:**
Raft doesn't address Byzantine failures because: 1) BFT algorithms have high overhead and complexity; 2) datacenter nodes are assumed trustworthy; 3) simplified design improves performance. For Byzantine tolerance, use specialized BFT implementations like PBFT. etcd assumes crash-only failures in trusted environments.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Raft假设" as Raft {
    card "节点崩溃\n(非恶意)" as C1
    card "网络可信\n(无篡改)" as C2
    card "简化设计\n(高性能)" as C3
}

rectangle "BFT要求" as BFT {
    card "恶意行为容忍" as B1
    card "消息签名验证" as B2
    card "高复杂度\n(多轮共识)" as B3
}

note bottom of Raft
    CrashFault Tolerance (CFT)\n适用于数据中心内部\netcd, Consul, etc.
end note

note bottom of BFT
    ByzantineFault Tolerance\n适用于不可信网络\nPBFT, Hyperledger, etc.
end note

@enduml
```

---

### etcd 如何选举出leader节点

**Principle:**
etcd leader election: When a follower doesn't receive heartbeat within election timeout (100-500ms random), it becomes Candidate, increments term, and requests votes from all nodes. Votes granted only if candidate's log is newer. Majority votes wins. New leader sends heartbeats, other nodes follow. If election fails, timeout and retry.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

participant "Node A\n(Leader)" as A
participant "Node B\n(Follower)" as B
participant "Node C\n(Candidate)" as C

note over B
    election timeout\n未收到心跳
end note

== Election ==

B -> C: **RequestVote(term=2)\nlastLog=(1,10)**
C -> B: **VoteGranted**
C -> A: **RequestVote(term=2)\nlastLog=(1,10)**
A -> C: **VoteGranted**

alt 获得多数票
    C -> C: **成为Leader\n发送心跳**
    C -> B: **Heartbeat**
    C -> A: **Heartbeat**
else 未获多数票
    C -> C: **选举超时\n重新发起选举**
end

@enduml
```

---

### etcd如何保证数据一致性

**Principle:**
etcd ensures consistency via Raft: 1) Log replication - writes go to leader's log, replicated to majority; 2) Leader completeness - only nodes with all committed entries can become leader (vote restriction); 3) Log matching - consistency check ensures no divergence; 4) State machine applies committed entries; 5) Reads served by leader by default for consistency.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Client\n客户端" as Cl

rectangle "Leader" as L {
    card "本地日志\n写入" as LD
    card "状态机\n应用" as SM
}

rectangle "Follower 1" as F1 {
    card "日志复制" as F1D
}

rectangle "Follower 2" as F2 {
    card "日志复制" as F2D
}

Cl -> L: **写请求**
L -> LD: **写入本地**
LD -> F1: **AppendEntries**
LD -> F2: **AppendEntries**
F1 -> L: **复制成功**
F2 -> L: **复制成功**
L -> SM: **已提交\n应用状态机**
L -> Cl: **返回成功**

note right of L
    只有多数节点\n确认后才是已提交\n已提交日志不会丢失
end note

@enduml
```

---

