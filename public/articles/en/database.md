## Database Clustering, Common Interview Questions

### MySQL Master-Slave Replication Principle

**Principle:**
MySQL Master-Slave Replication is MySQL's built-in data synchronization mechanism, asynchronously replicating DDL and DML operations from a master database to one or more slaves for redundancy, read/write splitting, and load balancing. The core principle: the master writes all data changes to Binary Log; the slave's I/O thread connects to master, fetches binary log content into local Relay Log; the slave's SQL thread reads Relay Log and replays SQL statements locally, achieving data synchronization with the master.

Key technical points include: binary log format (STATEMENT, ROW, MIXED — affects data volume and precision), replication filtering rules (`replicate-do-db`, `replicate-wild-do-table`), causes of replication lag and monitoring (`Seconds_Behind_Master` in `Show Slave Status\G`), and GTID (Global Transaction Identifier) replication mode (uses unique transaction identifiers, no need to specify log file names/positions, simplifies failover). Production Master-Slave typically works with connection pools and read/write splitting middleware (MySQL Proxy, Atlas, ShardingSphere) for automatic query distribution.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E6F3FF
    borderColor #1E90FF
    fontSize 11
}

rectangle "主库 / Master" as Master {
    file "用户请求\nUser Requests" as UserReq
    file "存储引擎\nInnoDB" as Engine
    file "二进制日志\nBinary Log" as BinLog
    rectangle "Dump线程\nDump Thread" as DumpThread
}

rectangle "从库 / Slave" as Slave {
    rectangle "I/O线程\nI/O Thread" as IOThread
    file "中继日志\nRelay Log" as RelayLog
    rectangle "SQL线程\nSQL Thread" as SQLThread
    file "本地数据库\nLocal Database" as LocalDB
}

UserReq --> Engine : 写入数据
Engine --> BinLog : 记录变更
BinLog --> DumpThread : 读取binlog
DumpThread <--> IOThread : 网络传输\nBinary Log Stream
IOThread --> RelayLog : 写入中继日志
RelayLog --> SQLThread : 读取中继日志
SQLThread --> LocalDB : 重放SQL\nReplay SQL

rectangle "复制配置\nReplication Config" as Config {
    file "server_id = 1" as SID1
    file "log_bin = mysql-bin" as LB1
    file "binlog_format = ROW" as BF1
}

Master --> Config

note bottom of BinLog
  主库记录所有变更\nMaster records all changes
end note

note bottom of RelayLog
  从库本地缓存\nLocal cache on slave
end note

@enduml
```

---

### MySQL Database and Table Sharding

**Principle:**
MySQL sharding (horizontal partitioning) addresses explosive data growth by splitting data across multiple tables/databases based on rules (hash, modulo, range), breaking through single-table/database performance bottlenecks. Database sharding distributes data across separate database instances, each with independent connections and storage. Table sharding splits one large table into multiple structurally identical tables. Sharding solves write bottlenecks, storage limits, and connection bottlenecks, but introduces complexity: cross-shard queries, distributed transactions, and routing.

Core concepts: Sharding Key — the critical field determining data distribution, typically high-frequency and evenly distributed in query conditions. Sharding algorithms: hash sharding (hash modulo, good for uniform distribution), range sharding (by time/ID range, good for ordered access), and directory sharding (mapping table, high flexibility but query overhead). Implementation approaches: middleware layer (ShardingSphere, MyCAT, Cobar) and application layer (client SDKs like Hibernate Shards, MyBatis Sharding). Production also needs global ID generation (Snowflake, UUID), cross-shard JOINs (denormalization, multiple queries), and distributed transactions (2PC, TCC, Saga).

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #FFF8DC
    borderColor #DAA520
    fontSize 11
}

rectangle "应用层 / Application" as App {
    file "分片路由SDK\nSharding SDK" as SDK
    file "全局ID生成器\nGlobal ID Generator" as GID
}

rectangle "分片中间件 / Sharding Middleware" as Middleware {
    rectangle "ShardingSphere-Proxy\nMyCAT" as Proxy
    rectangle "SQL解析与路由\nSQL Parse & Route" as Router
    rectangle "结果集合并\nResult Merge" as Merger
}

database "DB-0 / Shard-0\nuser_0, order_0" as DB0
database "DB-1 / Shard-1\nuser_1, order_1" as DB1
database "DB-2 / Shard-2\nuser_2, order_2" as DB2
database "DB-N / Shard-N\nuser_n, order_n" as DBN

App --> SDK
SDK --> Router
Router --> Proxy
Proxy --> DB0 : shard 0
Proxy --> DB1 : shard 1
Proxy --> DB2 : shard 2
Proxy --> DBN : shard n

Router -[dashed]-> GID : 请求全局ID

note right of Router
  哈希/范围/目录路由
  Hash/Range/Directory Routing
end note

note bottom of Merger
  跨分片排序/聚合\nCross-shard Sort/Aggregate
end note

@enduml
```

---

### Redis High Availability Solutions

**Principle:**
Three main Redis HA solutions: Master-Slave Replication, Sentinel, and Cluster. Master-Slave Replication is the basic approach — data asynchronously replicates from master to slaves for redundancy and read/write splitting. Master is read/write, slaves are read-only (default). When master fails, manual failover is needed. This solves backup and read scaling but not automatic failover.

Sentinel (Redis 2.8+) adds automatic failure detection and failover on top of Master-Slave. Sentinel processes monitor master/slave health (PING commands), notify applications of failures, and perform automatic failover (Raft-based election of new master, slaves redirect). A Sentinel cluster can monitor multiple Redis master-slave instances. Sentinel solves automatic failover but may have data loss during failover (async replication).

Cluster mode (Redis 3.0+) is a distributed solution using data sharding (16384 slots) across nodes with master-slave replicas per shard. Cluster provides both sharding and HA — when a slave detects master failure, it votes/elects a new master to continue serving. Cluster also supports online rescaling and automatic failover.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #FFE4E1
    borderColor #CD5C5C
    fontSize 11
}

rectangle "方案1: 主从复制\nMaster-Slave" as MS {
    rectangle "Master (RW)\n可读写" as MasterMS
    rectangle "Slave1 (RO)\n只读" as Slave1MS
    rectangle "Slave2 (RO)\n只读" as Slave2MS
    
    MasterMS --> Slave1MS : async replication
    MasterMS --> Slave2MS : async replication
    
    note bottom
      手动故障切换
      Manual Failover
    end note
}

rectangle "方案2: 哨兵模式\nSentinel" as Sentinel {
    rectangle "Master\n主节点" as MasterS
    rectangle "Slave1\n从节点" as Slave1S
    rectangle "Slave2\n从节点" as Slave2S
    rectangle "Sentinel-1\n哨兵" as Sent1
    rectangle "Sentinel-2\n哨兵" as Sent2
    rectangle "Sentinel-3\n哨兵" as Sent3
    
    MasterS --> Slave1S : replication
    MasterS --> Slave2S : replication
    Sent1 --> MasterS : monitor
    Sent1 --> Slave1S : monitor
    Sent1 --> Slave2S : monitor
    Sent2 --> MasterS : monitor
    Sent3 --> MasterS : monitor
    
    note bottom
      自动故障切换
      Automatic Failover
    end note
}

rectangle "方案3: 集群模式\nCluster" as Cluster {
    rectangle "Node-A (Master)\nSlot 0-5460" as NodeA
    rectangle "Node-B (Master)\nSlot 5461-10922" as NodeB
    rectangle "Node-C (Master)\nSlot 10923-16383" as NodeC
    rectangle "Node-A1 (Slave)\nNode-A的副本" as NodeA1
    rectangle "Node-B1 (Slave)\nNode-B的副本" as NodeB1
    rectangle "Node-C1 (Slave)\nNode-C的副本" as NodeC1
    
    NodeA1 ..> NodeA : slave of
    NodeB1 ..> NodeB : slave of
    NodeC1 ..> NodeC : slave of
}

@enduml
```

---

### Redis-Cluster Cluster Principle

**Principle:**
Redis Cluster (Redis 3.0+) distributes data across nodes using hash slots (16384 total), computed as `CRC16(key) mod 16384`. Each node is responsible for a subset of slots. For a 6-node cluster (3 masters, 3 slaves), slots are roughly distributed: Node A 0-5460, Node B 5461-10922, Node C 10923-16383. When a client connects to any node, it receives full slot mapping (propagated via Gossip protocol), so clients can directly target the correct node without a proxy.

Redis Cluster HA uses master-slave replication and automatic failover. Each master can have one or more slaves. When a master fails, its slave initiates an election: slave requests votes from reachable nodes; if it receives a majority (> N/2 + 1), it promotes to master and starts accepting requests. Cluster also supports online resharding via `redis-trib` or `redis-cli --cluster` for horizontal scaling. Nodes communicate via Gossip protocol (port 16800) to propagate node liveness and topology changes.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #F0FFF0
    borderColor #228B22
    fontSize 11
}

rectangle "Redis Cluster 架构\n16384 Hash Slots" as Cluster {
    rectangle "Node-A (Master)\nSlot: 0-5460" as NodeA {
        file "数据存储\nData Storage" as DataA
    }
    rectangle "Node-B (Master)\nSlot: 5461-10922" as NodeB {
        file "数据存储\nData Storage" as DataB
    }
    rectangle "Node-C (Master)\nSlot: 10923-16383" as NodeC {
        file "数据存储\nData Storage" as DataC
    }
    
    rectangle "Node-A1 (Slave)\nNode-A副本" as NodeA1
    rectangle "Node-B1 (Slave)\nNode-B副本" as NodeB1
    rectangle "Node-C1 (Slave)\nNode-C副本" as NodeC1
    
    NodeA1 ..> NodeA : failover target
    NodeB1 ..> NodeB : failover target
    NodeC1 ..> NodeC : failover target
}

rectangle "Gossip 协议\n节点间通信" as Gossip {
    file "PING/PONG\n心跳检测" as PingPong
    file "MEET/FORGET\n节点加入/离开" as MeetForget
    file "FAIL/PUBLISH\n故障检测/广播" as FailPublish
}

rectangle "客户端路由\nClient Routing" as Client {
    file "Smart Client\n智能客户端" as SmartClient
    file "槽位映射缓存\nSlot Mapping Cache" as SlotCache
}

SmartClient --> SlotCache : 缓存槽位表
SmartClient --> NodeA : 直接请求
SmartClient --> NodeB : 直接请求
SmartClient --> NodeC : 直接请求

Cluster -- Gossip : Gossip Protocol\nPort 16800

note right of Client
  客户端直连目标节点
  无需代理层
  Client connects directly
  No proxy layer
end note

note bottom of NodeA1
  故障时自动选举\n从节点晋升为主节点
  Failover: slave promotes
  to master
end note

@enduml
```

---

