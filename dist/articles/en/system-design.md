## System Design, Common Interview Questions

### Find the Most Frequent Integer with 2GB Memory Among 2 Billion

**Principle:**
This classic big data problem tests handling massive data with limited memory. The core approach uses HashMap for frequency counting, but 2 billion integers × 4 bytes = 8GB, far exceeding 2GB. Solution: range partitioning (bucket division) into smaller files, or external sorting + merging.

Better approach: BitMap + segmentation. First determine integer range (32-bit unsigned: 0~2^32-1), divide into 65536 buckets (each bucket = 2^16 consecutive integers). First pass: use 65536 counters (8 bytes each ≈ 512KB) to determine which bucket has the highest count. Second pass: for the heaviest bucket (~30K+ numbers), build a HashMap for precise frequency, return the most frequent number.

Alternative: Divide and Conquer + Hash. Split 2 billion numbers into 1000 small files (~2 million each), use HashMap per file to get each file's TOP1, then merge the 1000 TOP1s to get the global TOP1. Time O(n), space O(bucket_count).

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

rectangle "Step 1: 桶划分\nBucket Division" as Step1 {
    file "20亿整数\n2 Billion Integers" as Input
    file "Bucket[0]\n0~65535" as Bucket0
    file "Bucket[1]\n65536~131071" as Bucket1
    file "Bucket[N]\n..." as BucketN
}

rectangle "Step 2: 计数统计\nCounting" as Step2 {
    file "Counter[0] = 3.2M\n计数器" as Counter0
    file "Counter[1] = 1.8M\n计数器" as Counter1
    file "Counter[N] = ???\n计数器" as CounterN
}

rectangle "Step 3: 找最大桶\nFind Max Bucket" as Step3 {
    rectangle "Bucket[K] 计数最大\nMax Bucket Identified" as MaxBucket
}

rectangle "Step 4: 哈希精确统计\nHashMap Frequency" as Step4 {
    file "HashMap<num, count>\n2GB内可容纳" as HashMap
}

Input --> Bucket0
Input --> Bucket1
Input --> BucketN

Bucket0 --> Counter0 : 计数
Bucket1 --> Counter1 : 计数
BucketN --> CounterN : 计数

Counter0 ..> Step3
Counter1 ..> Step3
CounterN ..> Step3

Step3 --> MaxBucket
MaxBucket --> HashMap

@enduml
```

---

### TOPK Problem: Finding Most Frequent Words Among 10 Billion URLs

**Principle:**
TOPK is a frequent interview topic — finding the K most frequent elements in massive data. For 10 billion URLs, directly counting all frequencies requires enormous memory. Standard solution: "Divide and Conquer + Hash + Min-Heap" in 3 steps.

Step 1 (Divide and Conquer): Use a hash function (`hash(url) % 1000`) to distribute 10 billion URLs into 1000 small files. Each file averages ~10 million URLs. Identical URLs must go to the same file (hash property).

Step 2 (Frequency Count per file): Use HashMap for each file (~10M entries). If average URL is 100 bytes, each file is ~1GB — manageable. After processing each file, get its TOP 100 most frequent URLs using a min-heap.

Step 3 (Merge for Global TOPK): Merge TOP100 from all 1000 files. The global TOPK must be within all files' local TOPKs. Use a min-heap of size K to merge, resulting in global TOPK.

Time O(n), space O(file_count × K). K depends on memory: with K=100, min-heap holds just 100 elements ≈ 10KB.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E6E6FA
    borderColor #9370DB
    fontSize 11
}

rectangle "Step 1: 分桶 (Hash)\nPartition by Hash" as Step1 {
    file "100亿URL\n10 Billion URLs" as URLs
    file "File-0\n~10M URLs" as File0
    file "File-1\n~10M URLs" as File1
    file "File-999\n~10M URLs" as File999
    
    URLs --> File0 : hash(url) % 1000 == 0
    URLs --> File1 : hash(url) % 1000 == 1
    URLs --> File999 : hash(url) % 1000 == 999
}

rectangle "Step 2: 各文件内统计\nCount Per File" as Step2 {
    rectangle "File-0 处理\nHashMap + MinHeap(TOP100)" as Process0
    rectangle "File-1 处理\nHashMap + MinHeap(TOP100)" as Process1
    rectangle "File-999 处理\nHashMap + MinHeap(TOP100)" as Process999
}

rectangle "Step 3: 归并TOPK\nMerge Global TOPK" as Step3 {
    rectangle "小顶堆 (size=K)\nMin-Heap" as MinHeap
    rectangle "全局TOPK结果\nGlobal TOPK Result" as Result
}

File0 --> Process0
File1 --> Process1
File999 --> Process999

Process0 ..> MinHeap : TOP100
Process1 ..> MinHeap : TOP100
Process999 ..> MinHeap : TOP100

MinHeap --> Result

note bottom of MinHeap
  始终保持堆大小=K
  堆顶是当前最小
  Keep size=K
  Heap top is current minimum
end note

@enduml
```

---

### Find Missing Number Among 400 Million Non-negative Integers

**Principle:**
Classic "missing number" problem testing BitMap and binary search. Key info: 400 million non-negative integers (32-bit unsigned range is 0~2^32-1, about 4.3 billion). 400M given means ~300M are missing.

Solution 1: BitMap. Use a 2^32-bit bit map (~512MB) to mark each number's presence. Traverse 400M numbers, set corresponding bit to 1. After traversal, find first bit that is 0 — that's the missing number. For smaller memory (10MB), segment the 2^32 range into buckets and process bucket by bucket.

Solution 2: Binary search (requires data can be fully loaded or read multiple times). If 400M numbers can be read into an array, use binary search: count numbers in range [0, 2^31-1]. If count < 2^31, the missing number is in the high bits; otherwise low bits. Recursively binary search until found. Time O(n log M), space O(1), where M is range size. No extra storage but needs multiple data reads.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E0F0FF
    borderColor #4169E1
    fontSize 11
}

rectangle "解法1: 位图法\nBitMap Solution" as BitMapSol {
    file "2^32 bits = 512MB\n位图存储" as BitMap
    file "遍历40亿个数\nTraverse 400M" as Traverse
    file "标记 bit[i] = 1\nMark presence" as Mark
    file "找到第一个 bit[i]=0\nFind first 0" as FindMissing
}

rectangle "解法2: 二分法\nBinary Search" as BinarySol {
    file "Range: [0, 2^32-1]\n总范围" as TotalRange
    file "Count([0, mid)) = C\n统计前半段数量" as Count
    rectangle "C < (mid) ?\n缺失在前半段" as Compare {
        note bottom
          是 → 高位缺失
          否 → 低位缺失
        end note
    }
    file "递归二分\nRecursive Binary" as Recurse
    file "最终找到缺失数\nFind Missing" as Found
}

Traverse --> BitMap
BitMap --> FindMissing
TotalRange --> Count
Count --> Compare
Compare --> Recurse
Recurse ..> Found

note bottom of BitMapSol
  空间: 512MB
  Time: O(n)
end note

note bottom of BinarySol
  空间: O(1)
  Time: O(n log M)
end note

@enduml
```

---

### Find Median and Numbers Appearing Twice in 400 Million Non-negative Integers

**Principle:**
Two sub-problems: median and finding numbers appearing twice.

Part 1: Find median — the 2 billionth largest number (or average of 2Bth and 2Bth+1th for even count). Can't load all 40B into memory. Use binary search + counting: for 32-bit unsigned, range 0~2^32-1. For median m, at least 2B numbers ≤ m and at least 2B ≥ m. For each candidate mid, count numbers ≤ mid (count). If count > 2B, median ≤ mid; otherwise median > mid. Binary search until found. Time O(n log M), where M = 2^32.

Part 2: Find numbers appearing twice. Use BitMap (2^32 bits) or binary bit manipulation. The clever binary approach: for each bit position (0~31), count total 1s across all numbers. If 1s count > 4B (total numbers), some bit was set by a duplicate number (since identical numbers have identical bits). Use this property with range partitioning to narrow down and locate specific duplicates.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #FFF0F0
    borderColor #CD5C5C
    fontSize 11
}

rectangle "问题1: 找中位数\nFind Median" as Median {
    rectangle "二分候选值 mid\nBinary Search mid" as BinaryMid
    rectangle "Count(≤ mid)\n统计 ≤ mid 的数量" as CountLe
    rectangle "Count > 20亿 ?\n判断方向" as CompareMedian
    rectangle "缩小范围\nNarrow Range" as NarrowMedian
    rectangle "最终: 中位数\nResult: Median" as MedianResult
}

rectangle "问题2: 找出现两次的数\nFind Duplicate Numbers" as Duplicate {
    rectangle "按位统计 1 的个数\nCount 1s per bit" as BitCount
    rectangle "某位 1的个数 > 40亿 ?\n判断是否有重复" as BitCompare
    rectangle "分段缩小范围\nPartition & Narrow" as Partition
    rectangle "定位重复数\nLocate Duplicate" as DupResult
}

BinaryMid --> CountLe
CountLe --> CompareMedian
CompareMedian --> NarrowMedian
NarrowMedian ..> MedianResult

BitCount --> BitCompare
BitCompare --> Partition
Partition ..> DupResult

note bottom of Median
  时间 O(n log M)\n空间 O(1)
end note

note bottom of Duplicate
  利用二进制位特性\nBit manipulation trick
end note

@enduml
```

---

### Island Problem

**Principle:**
The Island Problem is a classic 2D matrix search problem. Given a 2D array (M×N grid) with values 0 (water) or 1 (land), count all connected land regions ("islands"). Islands are defined as land cells (1) connected via up/down/left/right.

Direct solution: DFS or BFS. Traverse each cell; if an unvisited land cell (1) is found, do DFS/BFS to mark all connected land as visited (set to 0 or use visited array). Increment island count per DFS/BFS. Time O(M×N), space O(M×N) for visited or O(M+N) for recursion stack (worst O(M×N)).

Advanced: Union-Find. Treat each cell as a node, union adjacent land cells. Count independent sets (root nodes) = island count. Union-Find excels in dynamic scenarios (matrix updates), supporting near O(α(n)) merge and query.

Advanced variant: Divide and Conquer. Split matrix by row/column, process sub-regions in parallel, handle boundary merging. Particularly important for distributed computing scenarios.

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

rectangle "输入矩阵 / Input Matrix" as Matrix {
    file "0 1 1 0 1\n1 0 1 1 0\n0 1 0 0 1\n1 1 0 0 0\n0 0 1 1 1" as GridData
}

rectangle "DFS/BFS 遍历\nDFS/BFS Traversal" as Traversal {
    rectangle "遍历每个格子\nVisit Each Cell" as Visit
    rectangle "发现陆地 (1)\nFound Land (1)" as FoundLand
    rectangle "DFS标记连通区域\nDFS Mark Connected" as DFSMark
    rectangle "岛屿计数+1\nIsland Count +1" as IslandCount
}

rectangle "结果\nResult" as Result {
    file "岛屿数量: 3\nIsland Count: 3" as Island3
}

Matrix --> Visit
Visit --> FoundLand
FoundLand --> DFSMark : 是未访问陆地
DFSMark --> IslandCount
IslandCount --> Result

note right of GridData
  黑色=陆地(1)\n  白色=水(0)
  Black=Land(1)
  White=Water(0)
end note

note bottom of DFSMark
  递归上下左右四个方向
  Recurse: up/down/left/right
end note

@enduml
```

---

### Redis-MySQL Cache Consistency

**Principle:**
When Redis serves as MySQL's cache, the core challenge is maintaining consistency between Redis cached data and MySQL source data. Three common patterns: Cache Aside, Read Through, and Write Through, each with pros and cons.

Cache Aside (most common): Read — check cache first, return if hit; on miss, query DB, then write to cache. Write — update DB first, then delete cache key (not update). Delete is lighter than update and avoids the "double write" inconsistency problem under concurrency.

Read Through: Application only interacts with cache; cache service loads from DB on miss. Write Through: Writes update both cache and DB synchronously before returning success.

In distributed/high-concurrency scenarios, Cache Aside faces additional issues: cache penetration (大量请求查询不存在的数据 → use Bloom Filter), cache breakdown (热点 key 过期瞬间大量请求 → use mutex or never-expire strategy), cache avalanche (大量 key 同时过期 → use random TTL or eternal TTL for hot data).

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

actor "Client\n客户端" as Client

rectangle "Cache Aside 读流程\nCache Aside Read" as ReadFlow {
    rectangle "1. 查询Redis\nQuery Redis" as ReadRedis
    rectangle "2. 命中?\nHit?" as ReadHit
    rectangle "3. 返回数据\nReturn Data" as ReadReturn
    rectangle "4. 查MySQL\nQuery MySQL" as ReadDB
    rectangle "5. 写入Redis\nWrite to Redis" as WriteCache
}

rectangle "Cache Aside 写流程\nCache Aside Write" as WriteFlow {
    rectangle "1. 更新MySQL\nUpdate MySQL" as WriteDB
    rectangle "2. 删除Redis Key\nDelete Redis Key" as DeleteCache
    rectangle "3. 返回成功\nReturn Success" as WriteReturn
}

Client --> ReadRedis : 读请求
ReadRedis --> ReadHit
ReadHit --> ReadReturn : 是 (命中)
ReadHit --> ReadDB : 否 (未命中)
ReadDB --> WriteCache
WriteCache --> ReadReturn

Client --> WriteDB : 写请求
WriteDB --> DeleteCache
DeleteCache --> WriteReturn

note right of DeleteCache
  删除而非更新\nDelete not Update
  避免并发不一致\nAvoids concurrency issue
end note

note bottom of WriteFlow
  先更新数据库，再删除缓存
  Update DB first, then delete cache
end note

@enduml
```

---

### Implement a Timer (Live Coding)

**Principle:**
Timer is a core component in backend development, executing tasks at specified times or periodically. Live coding a timer tests understanding of Time Wheel, Min-Heap, or Time Chain data structures and high-performance I/O models (epoll/select).

Solution 1: Min-Heap. Timer node contains deadline and callback function. Store all timer nodes in min-heap; check heap top for expiration each tick. If expired, execute callback and pop; if not, calculate wait time. Insert/delete O(log n), expiry check O(1).

Solution 2: Time Wheel (used in Linux kernel). Ring array where each slot holds a timer linked list. A tick pointer advances periodically; each slot check triggers expired timers. Insert by computing slot from delay. Ordinary time wheel insert/delete O(1); multi-level time wheels (Linux kernel) handle larger delay ranges.

Solution 3: epoll + Min-Heap hybrid. epoll listens on a pipe/eventfd read end; timer writes to pipe on expiry, epoll triggers handler. Ideal for combining with network I/O frameworks — common pattern in high-performance servers like Nginx.

Key points for timer implementation: struct design (deadline + callback + extra data), expiration check logic, time complexity analysis, and thread safety.

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E6E6FA
    borderColor #9370DB
    fontSize 11
}

rectangle "Timer 结构体\nTimer Struct" as TimerStruct {
    file "deadline: uint64_t\n到期时间戳" as Deadline
    file "interval: uint64_t\n重复间隔(0=单次)" as Interval
    file "callback: function<void()>\n回调函数" as Callback
    file "data: void*\n用户数据指针" as Data
}

rectangle "方案1: 最小堆定时器\nMin-Heap Timer" as MinHeap {
    rectangle "插入定时器 O(log n)\nInsert Timer" as Insert
    rectangle "堆顶到期? O(1)\nCheck Top" as CheckTop
    rectangle "执行回调 + 弹出\nExecute + Pop" as Execute
    rectangle "计算下次等待时间\nCalc Wait Time" as CalcWait
}

rectangle "方案2: 时间轮定时器\nTime Wheel Timer" as TimeWheel {
    file "槽0  槽1  槽2 ... 槽N-1\nSlot 0  Slot 1  ... Slot N-1" as Slots
    file "指针跳动 tick\nPointer Tick" as Tick
    file "槽链表存储定时器\nTimer List per Slot" as TimerList
    rectangle "插入: 计算槽位置 O(1)\nInsert: Compute Slot" as TWSlot
    rectangle "到期检查: 检查当前槽 O(1)\nCheck: Current Slot" as TWCheck
}

TimerStruct --> Insert
TimerStruct --> TWSlot

Insert --> CheckTop
CheckTop --> Execute : 到期
CheckTop --> CalcWait : 未到期
CalcWait --> Insert : 等待

Slots --> Tick
Tick --> TWCheck
TWCheck --> Execute : 到期

note bottom of MinHeap
  优点: 实现简单\n缺点: 插入删除 O(log n)
  Simple implementation\nInsert/delete O(log n)
end note

note bottom of TimeWheel
  优点: 插入删除 O(1)\n缺点: 延迟范围受限
  Insert/delete O(1)\nDelay range limited
end note

@enduml
```

(End of file)
