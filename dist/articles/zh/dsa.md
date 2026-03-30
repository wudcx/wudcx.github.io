## 数据结构与算法，常见题型

### 用两个栈实现队列

**原理:**

**核心思想：** 用两个栈 `stack_in` 和 `stack_out` 模拟队列操作。入口栈负责接收 push 操作，出口栈负责 pop 操作。当出口栈为空时，将入口栈所有元素依次弹出并压入出口栈，实现"先进先出"顺序。

**关键操作：**

- `push`：元素直接压入 `stack_in`，时间复杂度 **O(1)**
- `pop`：若 `stack_out` 不空，弹出栈顶；若为空，将 `stack_in` 所有元素倒入 `stack_out` 后再弹。均摊复杂度 **O(1)**
- `peek`：与 pop 类似，但只查看出口栈栈顶元素
- `empty`：两个栈都为空时队列为空

**复杂度分析：**

- 时间复杂度：push O(1)，pop 均摊 O(1)
- 空间复杂度：O(n)，n 为队列中元素个数

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **两个栈实现队列 - 数据流图**

rectangle "入口栈 (stack_in)" as IN #F0F8FF
rectangle "出口栈 (stack_out)" as OUT #FFF0F5

note right of IN
  push(x): 直接压入
  顺序: bottom → top
end note

note left of OUT
  pop(): 弹出栈顶
  若为空则先从IN倒入
end note

== 入队操作 ==
actor Client as C #88CC88
C → IN : push(x)
note right of IN
  stack_in: [1, 2, 3] → push 4
  stack_in: [1, 2, 3, 4]
end note

== 出队操作 ==
alt OUT 不为空
  OUT → C : pop() 直接弹出
else OUT 为空
  IN → OUT : 依次弹出并压入
  note left of OUT
    转移过程:
    pop(3)→push, pop(2)→push, pop(1)→push
    stack_out: [1, 2, 3] (3在栈顶，先出)
  end note
  OUT → C : pop() 返回 1
end

legend center
| 栈 | 特点 |
|---|---|
| stack_in | 顺序入栈，栈底=队列头 |
| stack_out | 逆序存储，栈顶=队列头 |
endlegend
@enduml
```

---

### 包含min函数的栈

**原理:**

**核心思想：** 使用主栈和辅助栈同步维护。主栈正常执行所有操作；辅助栈（名为 `min_stack`）同步压入当前最小值。**辅助栈栈顶永远保存当前栈中的最小元素**。

**关键操作：**

- `push(x)`：主栈正常压入；辅助栈压入 `min(x, 当前最小值)`
- `pop()`：两栈同时弹出
- `top()`：返回主栈栈顶
- `min()`：返回辅助栈栈顶

**复杂度分析：**

- 时间复杂度：所有操作均为 **O(1)**
- 空间复杂度：O(n)，最坏情况每个元素都需在辅助栈中存储

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **包含min函数的栈 - 示意图**

rectangle "主栈 (data_stack)" as DS #E8F4E8
rectangle "辅助栈 (min_stack)" as MS #FFE4E1

note right of DS
  push(3): DS=[3], MS=[3]
  push(5): DS=[3,5], MS=[3,3]
  push(2): DS=[3,5,2], MS=[3,3,2]
  push(1): DS=[3,5,2,1], MS=[3,3,2,1]
  min() 返回 1 (MS栈顶)
end note

note left of MS
  辅助栈记录每个位置的"历史最小值"
  栈顶永远是当前最小
end note

== 同步操作示意 ==
agent "push(x)" as P
P → DS : 压入主栈
P → MS : 压入 min(x, MS.top)

agent "pop()" as PO
PO → DS : 弹出主栈
PO → MS : 弹出辅助栈

legend center
| 操作 | 主栈 | 辅助栈 |
|---|---|---|
| push(5) | [3,5] | [3,3] |
| push(2) | [3,5,2] | [3,3,2] |
| min() | - | 2 |
| pop() | [3,5] | [3,3] |
| min() | - | 3 |
endlegend
@enduml
```

---

### 队列的最大值

**原理:**

**核心思想：** 维护一个双端队列（deque）作为辅助结构，存储可能成为最大值的元素下标。队列中所有元素按入队顺序排列，deque 队头始终是当前队列最大值的下标。

**关键操作：**

- `push_back(x)`：入队，同时从 deque 队尾移除所有小于 x 的元素（它们永无出头之日），将 x 下标加入 deque
- `pop_front()`：出队，若出队元素下标等于 deque 队头，则同步移除 deque 队头
- `max_value()`：返回 deque 队头对应的队列元素值

**复杂度分析：**

- 时间复杂度：均摊 O(1)，每个元素最多被 push 和 pop 一次
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **队列的最大值 - 数据流**

queue "主队列 (queue)" as Q #F0F8FF
deque "辅助双端队列 (deque)" as D #FFF0F5

note right of Q
  入队: 1, 3, 2, 5, 4
  队列状态变化
end note

note right of D
  deque 维护可能的最大值:
  [1]→[3]→[3]→[3,5]→[5]
  (存储下标，对应值递减)
end note

== 入队 3 ==
Q → Q : 1, 3
Q → D : 从队尾移除所有 <3 的元素
D → D : [1] 移除，deque=[3]

== 入队 2 ==
Q → Q : 1, 3, 2
Q → D : 2 < 5，不移除
D → D : deque=[3,2] (队尾加入2)

== 获取最大值 ==
Q → D : max_value()
D → Q : 返回 deque[0] 对应值 = 3

== 出队 1 ==
Q → Q : 3, 2, 5, 4
Q → D : 1 == deque[0]? Yes!
D → D : deque=[2] (移除队头)

legend center
| 原理 | 说明 |
|---|---|
| deque队头 | 当前最大值的下标 |
| deque单调递减 | 前面元素永远 >= 后面元素 |
| 每个元素最多进deque一次 | O(n) 总操作 |
endlegend
@enduml
```

---

### 用一个栈实现另一个栈的排序

**原理:**

**核心思想：** 借助一个辅助栈，每次从原栈弹出栈顶元素，将其与辅助栈栈顶比较。若辅助栈为空或栈顶元素小于等于弹出元素，则直接压入；否则将辅助栈栈顶元素逐个弹回原栈，直到可以放入弹出元素。

**核心不变性：** 辅助栈从栈底到栈顶始终是**降序排列**的。

**复杂度分析：**

- 时间复杂度：最坏 O(n²)，每个元素最多被 push/pop 2n 次
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **栈排序 - 过程示意**

rectangle "原栈 (input)" as IS #F0F8FF
rectangle "辅助栈 (temp,降序)" as TS #FFF0F5

note right of IS
  初始: [6, 3, 5, 1] (1在栈顶)
  目标: 栈顶到栈底升序
end note

== 排序过程 ==
IS → TS : pop(1), temp空 → push(1)
note right of TS
  IS: [6,3,5], TS:[1]
end note

IS → TS : pop(5), 5>1 → push(5)
note right of TS
  IS: [6,3], TS:[5,1]
end note

IS → IS : pop(3), 3<5
IS → TS : 5弹回IS, push(3), 再push(5)
note right of TS
  IS: [6,5], TS:[3,1]
end note

IS → IS : pop(5), 5>3
IS → TS : 3弹回IS, push(5), 再push(3)
note right of TS
  IS: [6,3], TS:[5,1]
end note

legend center
| 步骤 | input栈 | temp栈(升序) |
|---|---|---|
| 初始 | [6,3,5,1] | [] |
| 第1步 | [6,3,5] | [1] |
| 第2步 | [6,3] | [5,1] |
| ... | ... | ... |
| 最终 | [] | [6,5,3,1] |
endlegend
@enduml
```

---

### 仅用递归和栈操作逆序一个栈

**原理:**

**核心思想：** 递归函数 `reverseStack()` 完成两件事：
1. 递归将栈中除栈底元素外的所有元素逆序（通过递归调用自己）
2. 将栈底元素移到栈顶（通过另一个递归函数 `insertBottom()`）

**关键函数：**

- `getAndRemoveBottom(stack)`：递归弹出并返回栈底元素，同时逆序恢复其他元素
- `reverseStack(stack)`：递归逆序整个栈

**复杂度分析：**

- 时间复杂度：O(n²)，每个元素被递归处理多次
- 空间复杂度：O(n)，递归栈深度

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **递归逆序栈 - 执行流程**

rectangle "栈状态" as S #F0F8FF

note right of S
  初始: [1,2,3,4] (4在栈顶)
  目标: [4,3,2,1]
end note

== reverseStack() 执行过程 ==

== getAndRemoveBottom 递归展开 ==
S → S : pop() → 4
S → S : pop() → 3
S → S : pop() → 2
S → S : pop() → 1 (栈空，1是栈底)

== 逐层返回并逆序插入 ==
S ← S : 返回1，递归展开
S ← S : push(1)到栈底
S ← S : push(2)到栈底
S ← S : push(3)到栈底
S ← S : push(4)到栈底

note right of S
  最终: [4,3,2,1]
end note

legend center
| 递归层 | 操作 | 说明 |
|---|---|---|
| 第1层 | pop(4), 递归  | |
| 第2层 | pop(3), 递归 | |
| 第3层 | pop(2), 递归 | |
| 第4层 | pop(1), 栈空返回 | 栈底元素 |
| 第3层 | insertBottom(2) | 2插到1下面 |
| 第2层 | insertBottom(3) | 3插到底部 |
| 第1层 | insertBottom(4) | 4插到底部 |
endlegend
@enduml
```

---

### 链表中倒数第 k 个节点

**原理:**

**核心思想：双指针法（快慢指针）**

- 快指针 `fast` 先走 k 步
- 然后快慢指针同时前进，直到 fast 到达链表末尾
- 此时 slow 指向的位置就是倒数第 k 个节点

**特殊情况处理：**

- 链表为空或 k <= 0：返回 nullptr
- k 大于链表长度：返回 nullptr

**复杂度分析：**

- 时间复杂度：O(n)，只需遍历一次
- 空间复杂度：O(1)，只用了两个指针

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **链表倒数第k个节点 - 双指针**

rectangle "链表" as L #F0F8FF

note right of L
  1 → 2 → 3 → 4 → 5 → NULL
  找倒数第2个节点(k=2)
end note

== 第一步：fast先走k步 ==
L → L : fast = head, 走2步
note right of L
  fast → 节点3
  slow → head(节点1)
end note

== 第二步：同时前进 ==
L → L : fast != NULL
loop 直到 fast到底
  fast → fast.next
  slow → slow.next
end

note right of L
  fast → NULL
  slow → 节点4
end note

L → L : 返回 slow (节点4)

legend center
| 步骤 | fast位置 | slow位置 |
|---|---|---|
| 初始 | 节点1 | 节点1 |
| 快走k步后 | 节点3 | 节点1 |
| 同时走 | ... | ... |
| fast到末尾 | NULL | 节点4 (答案) |
endlegend
@enduml
```

---

### 链表中环的入口节点

**原理:**

**核心思想：Floyd 判圈算法**

- 第一步（判断是否有环）：快指针 `fast` 每次走两步，慢指针 `slow` 每次走一步。若存在环，两者必相遇。
- 第二步（找环入口）：相遇后，将 slow 重新指向 head，然后 fast 和 slow 同时每次走一步，再次相遇点即为环入口。

**数学证明：** 设环前长度为 a，环长度为 b。相遇时 slow 走了 a+x，fast 走了 a+x+k*b。fast 速度是 slow 两倍，所以 2(a+x) = a+x+k*b → a+x = k*b → a = (k-1)*b + (b-x)。即从 head 走到环入口的距离 a，等于从相遇点继续走到环入口的距离。

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **链表环入口 - Floyd算法**

rectangle "链表" as L #F0F8FF

note right of L
  head → 1 → 2 → 3 → 4
            ↑_________↓
            (环长b=4, 环前a=2)
end note

== 第一阶段：检测环 ==
L → L : slow每次1步, fast每次2步
note right of L
  相遇条件：fast和slow在环内某点相遇
end note

== 第二阶段：找入口 ==
L → L : slow重新指向head
L → L : slow和fast同时走，每次1步
note right of L
  相遇点即为环入口(节点2)
end note

legend center
| 数学推导 | 说明 |
|---|---|
| 设环前长度 | a |
| 设环长度 | b |
| 相遇时slow走了 | a + x |
| 相遇时fast走了 | a + x + k*b |
| 2(a+x) = a+x+k*b | fast两倍速度 |
| a = (k-1)*b + (b-x) | 入口距离 = 从相遇点走环长度的整数倍 |
endlegend
@enduml
```

---

### 反转链表

**原理:**

**方法一：迭代法（三指针）**

- 维护三个指针：`prev`（已反转部分的头）、`curr`（当前处理节点）、`next`（待处理节点）
- 每次迭代：保存 next，逆转当前指针指向，prev 和 curr 后移

**方法二：递归法**

- 递归反转除了头节点之外的链表，返回反转后的新头
- 将当前节点接到反转链表尾部

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：迭代法 O(1)，递归法 O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **反转链表 - 迭代过程**

rectangle "链表" as L #F0F8FF

note right of L
  初始: 1 → 2 → 3 → 4 → NULL
  目标: NULL ← 1 ← 2 ← 3 ← 4
end note

== 迭代过程 ==
L → L : 初始: prev=NULL, curr=1
note right of L
  步骤1: next=2, curr.next=prev(NULL)
end note

L → L : curr=2, prev=1
note right of L
  步骤2: next=3, curr.next=prev(1)
end note

L → L : curr=3, prev=2
note right of L
  步骤3: next=4, curr.next=prev(2)
end note

L → L : curr=4, prev=3
note right of L
  步骤4: next=NULL, curr.next=prev(3)
end note

L → L : curr=NULL, prev=4
note right of L
  完成! prev=4是新的头
  4 → 3 → 2 → 1 → NULL
end note

legend center
| 状态 | prev | curr | next |
|---|---|---|---|
| 初始 | NULL | 1 | 2 |
| 第1步 | 1 | 2 | 3 |
| 第2步 | 2 | 3 | 4 |
| 第3步 | 3 | 4 | NULL |
| 完成 | 4 | NULL | - |
endlegend
@enduml
```

---

### 从尾到头打印链表

**原理:**

**方法一：栈辅助法**

- 遍历链表，所有节点入栈
- 依次弹出栈中元素，实现逆序打印

**方法二：递归法**

- 递归先访问下一个节点，再打印当前节点（函数返回后再打印）
- 本质是系统栈的递归调用

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：栈辅助法 O(n)，递归法 O(n)（递归栈）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **从尾到头打印链表**

rectangle "链表" as L #F0F8FF
rectangle "栈 (辅助)" as S #FFF0F5

note right of L
  链表: 1 → 2 → 3 → 4 → NULL
end note

== 入栈阶段 ==
L → S : 遍历节点，全部入栈
note right of S
  栈底: 1,2,3,4 :栈顶
end note

== 出栈打印 ==
S → L : pop(4) → print 4
S → L : pop(3) → print 3
S → L : pop(2) → print 2
S → L : pop(1) → print 1

note right of L
  输出顺序: 4, 3, 2, 1
end note

== 递归法示意 ==
L → L : 递归调用链
note right of L
  printList(node):
    if node.next != NULL:
      printList(node.next)
    print(node.val)

  调用顺序: 1→2→3→4→打印4→3→2→1
end note

legend center
| 方法 | 空间 | 特点 |
|---|---|---|
| 栈 | O(n) | 非递归，稳妥 |
| 递归 | O(n) | 代码简洁，深度过深可能栈溢出 |
endlegend
@enduml
```

---

### 两个链表的第一个公共节点

**原理:**

**方法：双指针 + 长度对齐**

1. 分别遍历两链表得到长度 len1, len2
2. 让较长的链表先走 |len1-len2| 步，使两链表尾部对齐
3. 然后同时遍历两链表，第一个相同节点即为公共节点

**核心原理：** 若两链表有公共节点，则从公共节点到末尾两链表完全重合。因此尾部对齐后，同时遍历必在公共节点处相遇。

**复杂度分析：**

- 时间复杂度：O(m+n)
- 空间复杂度：O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **两链表第一个公共节点**

rectangle "链表A" as A #F0F8FF
rectangle "链表B" as B #FFE4E1

note right of A
  A: 1 → 2 → 3
          ↓
  B: 4 → 5 ↗
end note

note right of A
  公共部分: 3 → NULL
end note

== 第一步：求长度 ==
A → A : lenA = 5
B → B : lenB = 6

== 第二步：对齐尾部 ==
A → A : 长链表先走 1 步
note right of A
  A剩余: 2 → 3
  B剩余: 5 → 3
end note

== 第三步：同时遍历 ==
A → B : 同时走
loop 直到相遇
  A → A : next
  B → B : next
end

note right of A
  相遇点: 节点3 (第一个公共节点)
end note

legend center
| 步骤 | 操作 |
|---|---|
| 求长度 | lenA=5, lenB=6 |
| 对齐 | A先走1步 |
| 遍历 | 1→2→3 与 5→3 相遇 |
endlegend
@enduml
```

---

### 第一个只出现一次的字符

**原理:**

**方法一：数组/哈希表统计**

- 第一次遍历：统计每个字符出现的次数（数组大小 256 或哈希表）
- 第二次遍历：找到第一个计数为 1 的字符

**方法二：有序哈希（LinkedHashMap）**

- 保持插入顺序的哈希表，插入时若已存在则标记为重复
- 遍历有序哈希，第一个标记为"出现一次"的即为答案

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(字符集大小)，数组法为 O(256)=O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **第一个只出现一次的字符**

rectangle "字符串" as S #F0F8FF
rectangle "计数数组[256]" as A #FFF0F5

note right of S
  字符串: "abaccdeff"
end note

== 第一遍：计数 ==
S → A : 遍历字符串
note right of A
  'a': 2次
  'b': 1次
  'c': 2次
  'd': 1次
  'e': 1次
  'f': 2次
end note

== 第二遍：查找 ==
A → S : 遍历字符串
note right of S
  'a'(2次) - 跳过
  'b'(1次) - 找到！
  返回 'b'
end note

legend center
| 字符 | 计数 | 结果 |
|---|---|---|
| a | 2 | 跳过 |
| b | 1 | ✓ 返回 |
| c | 2 | 跳过 |
| d | 1 | - |
| e | 1 | - |
endlegend
@enduml
```

---

### 最长不含重复字符的子字符串

**原理:**

**核心思想：滑动窗口 + 哈希集合**

- 使用双指针 `left` 和 `right` 维护一个窗口
- 右指针扩展窗口，加入字符时若已存在，则收缩左指针移除重复
- 用哈希集合或数组记录窗口中字符，实时维护"无重复"特性
- 更新最大长度

**优化：记录字符最新位置**

- 不逐个移动 left，而是直接跳到重复字符的下一个位置

**复杂度分析：**

- 时间复杂度：O(n)，每个字符最多被访问两次（left 和 right 各一次）
- 空间复杂度：O(min(m, 字符集大小))，m 为字符串长度

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **最长无重复子串 - 滑动窗口**

rectangle "字符串" as S #F0F8FF
rectangle "哈希集合" as H #FFF0F5

note right of S
  字符串: "abcabcbb"
  目标: 最长无重复子串长度
end note

== 滑动过程 ==
S → H : right=0, 'a'加入, window=[a], max=1
note right of S
  [a]_____
end note

S → H : right=1, 'b'加入, window=[a,b], max=2
note right of S
  [a,b]____
end note

S → H : right=2, 'c'加入, window=[a,b,c], max=3
note right of S
  [a,b,c]___
end note

S → H : right=3, 'a'已存在!
S → H : left右移到'b'(a的下一个), window=[b,c,a], max=3
note right of S
  _[b,c,a]__
end note

S → H : right=6, window=[b,c,a], max=3
note right of S
  __[b,c,a,b] 发现重复'b'
end note

S → H : left右移到'c', window=[a,b,c], max=3
note right of S
  ___[c,a,b]
end note

legend center
| right | 字符 | left调整 | window | max |
|---|---|---|---|---|
| 0 | a | - | [a] | 1 |
| 1 | b | - | [a,b] | 2 |
| 2 | c | - | [a,b,c] | 3 |
| 3 | a | 0→1 | [b,c,a] | 3 |
| 4 | b | 1→2 | [c,a,b] | 3 |
| 5 | c | 2→3 | [a,b,c] | 3 |
| 6 | b | 3→4 | [c,a,b] | 3 |
| 7 | b | 4→5 | [a,b] | 3 |
endlegend
@enduml
```

---

### 字符串的排列

**原理:**

**核心思想：回溯法（Backtracking）**

- 固定第 i 个位置，枚举所有可能的字符
- 通过交换来避免重复使用字符
- 剪枝：跳过相同字符的重复尝试

**递归树：** 对于字符串 s，递归深度为 s.length()，每层处理一个位置的字符选择。

**关键点：**

- 先对字符串排序，使相同字符相邻
- 同一层递归中，跳过与前一个相同的字符（避免重复排列）

**复杂度分析：**

- 时间复杂度：O(n! × n)，n! 个排列，每个排列 O(n) 复制
- 空间复杂度：O(n)（递归栈深度）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **字符串排列 - 回溯树**

rectangle "递归树" as T #F0F8FF

note right of T
  s = "abc" (排序后)
end note

== 第一层 ==
T → T : 固定位置0, 尝试 'a','b','c'
note right of T
  'a' + perm("bc")
  'b' + perm("ac")
  'c' + perm("ab")
end note

== 第二层 ==
T → T : 'a'分支: 固定位置1
note right of T
  'a'+'b' + perm("c")
  'a'+'c' + perm("b")
end note

== 第三层 ==
T → T : 叶子节点: "abc", "acb", "bac", "bca", "cab", "cba"

== 剪枝示例 ==
note right of T
  s = "aab"
  第一层: 'a'(第一次) → 递归
          'a'(第二次) → 跳过! (与前一个相同)
          'b' → 递归
end note

legend center
| 关键 | 说明 |
|---|---|
| 排序 | 相同字符相邻 |
| 剪枝 | 同层跳过重复字符 |
| 交换 | 原地交换，不额外空间 |
endlegend
@enduml
```

---

### 反转字符串

**原理:**

**核心思想：双指针法**

- 左指针指向首字符，右指针指向末字符
- 交换两指针指向的字符
- 左指针右移，右指针左移，重复直到两指针相遇

**复杂度分析：**

- 时间复杂度：O(n)，每个字符最多交换一次
- 空间复杂度：O(1)，原地反转

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **反转字符串 - 双指针**

rectangle "字符串数组" as S #F0F8FF

note right of S
  初始: ['h','e','l','l','o']
end note

== 交换过程 ==
S → S : left=0, right=4 → 交换 'h'和'o'
note right of S
  ['o','e','l','l','h']
end note

S → S : left=1, right=3 → 交换 'e'和'l'
note right of S
  ['o','l','l','e','h']
end note

S → S : left=2, right=2 → 相遇，结束
note right of S
  结果: ['o','l','l','e','h'] → "olleh"
end note

legend center
| 步骤 | left | right | 交换 | 状态 |
|---|---|---|---|---|
| 初始 | 0 | 4 | - | h e l l o |
| 第1次 | 0 | 4 | h↔o | o e l l h |
| 第2次 | 1 | 3 | e↔l | o l l e h |
| 第3次 | 2 | 2 | - | 相遇完成 |
endlegend
@enduml
```

---

### 把数字翻译成字符串

**原理:**

**核心思想：动态规划**

- `dp[i]` 表示以第 i 位（0-indexed，从右向左）结尾的翻译方法数
- 转移方程：
  - `dp[i] = dp[i+1]`（单独翻译第 i 位，0-9 都能单独翻译）
  - 若第 i 位和第 i+1 位组成的两位数在 [10, 25] 范围内，加 `dp[i+2]`
- 最终答案为 `dp[0]`

**边界条件：** `dp[n] = 1`（最后一位只有一种翻译）

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(n) 或 O(1)（空间优化）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **数字翻译成字符串 - DP**

rectangle "数字" as N #F0F8FF
rectangle "DP表" as DP #FFF0F5

note right of N
  数字: 12258
  位置: 0 1 2 3 4
end note

== DP计算 ==
DP → DP : dp[4] = 1 (最后一位'8')
note right of DP
  dp[4]: "8" → 1种
end note

DP → DP : dp[3] = dp[4] = 1 (5在[10,25]外)
note right of DP
  dp[3]: "5" → 1种
end note

DP → DP : dp[2]: '2'+'5'=25在范围内
DP → DP : dp[2] = dp[3] + dp[4] = 2
note right of DP
  dp[2]: "25" → 2种 (2|5, 25)
end note

DP → DP : dp[1]: '2'+'2'=22在范围内
DP → DP : dp[1] = dp[2] + dp[3] = 3
note right of DP
  dp[1]: "22..." → 3种
end note

DP → DP : dp[0]: '1'+'2'=12在范围内
DP → DP : dp[0] = dp[1] + dp[2] = 5
note right of DP
  答案: 5种
end note

legend center
| 位置 | 数字 | 组合范围? | dp值 |
|---|---|---|---|
| 4 | 8 | - | 1 |
| 3 | 5 | 25>25 否 | 1 |
| 2 | 2 | 25√ | 2 |
| 1 | 2 | 22√ | 3 |
| 0 | 1 | 12√ | **5** |
endlegend
@enduml
```

---

### 重建二叉树

**原理:**

**核心思想：递归 + 哈希表定位**

- 前序遍历：根 → 左子树前序 → 右子树前序
- 中序遍历：左子树中序 → 根 → 右子树中序

**重建步骤：**

1. 在中序序列中定位根节点（哈希表 O(1) 查找）
2. 左子树中序长度 = 根节点索引 - 中序起始位置
3. 递归构建左子树和右子树

**关键点：** 每次递归要知道中序的 [in_left, in_right] 范围。

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)（哈希表 + 递归栈）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **重建二叉树**

rectangle "遍历序列" as T #F0F8FF

note right of T
  前序: [1,2,4,7,3,5,6,8]
  中序: [4,7,2,1,5,3,8,6]
end note

== 递归过程 ==
T → T : 根=1 (前序[0])
note right of T
  中序中1的位置=3
  左子树中序=[4,7,2]
  右子树中序=[5,3,8,6]
end note

T → T : 左子树: pre=[2,4,7], in=[4,7,2]
note right of T
  根=2, 左=[4,7], 右=[]
end note

T → T : 右子树: pre=[3,5,6,8], in=[5,3,8,6]
note right of T
  根=3, 左=[5], 右=[8,6]
end note

T → T : 递归终止: 叶子节点

legend center
| 步骤 | preorder | inorder | 根 |
|---|---|---|---|
| 初始 | [1,2,4,7,3,5,6,8] | [4,7,2,1,5,3,8,6] | 1 |
| 左子树 | [2,4,7] | [4,7,2] | 2 |
| 右子树 | [3,5,6,8] | [5,3,8,6] | 3 |
| 左左 | [4,7] | [4,7] | 4 |
| ... | ... | ... | ... |
endlegend
@enduml
```

---

### 二叉树的下一个节点

**原理:**

**核心思想：分两种情况讨论**

**情况一：节点有右子树**
- 中序遍历的下一个节点是右子树中的最左节点
- 沿右孩子一直往左下找

**情况二：节点没有右子树**
- 向上追溯，找第一个是其父节点左孩子的祖先节点
- 该祖先节点的父节点就是中序后继

**复杂度分析：**

- 时间复杂度：O(h)，h 为树高，最坏 O(n)
- 空间复杂度：O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树中序后继节点**

rectangle "二叉树结构" as T #F0F8FF

note right of T
        d
       / \
      b   e
     / \   \
    a   c   f

  中序: a b c d e f
end note

== 情况1: 有右子树 ==
T → T : 节点c有右孩子
note right of T
  后继 = 右子树最左节点 = c的右孩子
end note

== 情况2: 无右子树 ==
T → T : 节点a无右孩子
note right of T
  向上找: a是b的左孩子 → b是a的后继
end note

T → T : 节点b无右孩子
note right of T
  向上找: b是d的左孩子 → d是b的后继
end note

T → T : 节点d有右孩子
note right of T
  后继 = e(右子树最左)
end note

legend center
| 节点 | 情况 | 后继 |
|---|---|---|
| a | 无右子树,父左孩子 | b |
| b | 无右子树,父左孩子 | d |
| c | 有右子树 | c的右孩子 |
| d | 有右子树 | e |
| e | 无右子树 | f |
endlegend
@enduml
```

---

### 树的子结构

**原理:**

**核心思想：递归判断**

1. 先在原树中找到与子树根节点值相同的节点（遍历原树）
2. 以该节点为根，递归判断两棵树是否完全相同

**判断"包含"函数 `isMatch(root1, root2)`:**

- 若 root2 为空，返回 true（匹配完成）
- 若 root1 为空或值不同，返回 false
- 递归判断左子树和右子树

**复杂度分析：**

- 时间复杂度：O(m×n)，m 为原树节点数，n 为子树节点数（最坏情况需匹配 n 次）
- 空间复杂度：O(max(m,n))（递归栈深度）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **树的子结构**

rectangle "原树A" as A #F0F8FF
rectangle "子树B" as B #FFF0F5

note right of A
    A:     8          B:     8
          / \               / \
         8   6             8   6
          \               /
           6             7
end note

== 第一步：查找匹配节点 ==
A → A : 遍历找根节点值相同
note right of A
  A的节点8(根) 与 B的根8 匹配
end note

== 第二步：递归匹配子树 ==
A → B : isMatch(8,8) → true
A → B : isMatch(8的左,8的左) → false (A左为空)
A → B : isMatch(8的右,8的右) → 比较6和7 → false

note right of A
  B不是A的子结构

  (若B='8→6', 则匹配成功)
end note

legend center
| isMatch判断 | 结果 |
|---|---|
| 根节点值相同 | 继续 |
| 左子树递归 | 匹配/不匹配 |
| 右子树递归 | 匹配/不匹配 |
| B为空 | true |
| A为空B非空 | false |
endlegend
@enduml
```

---

### 二叉树展开为链表

**原理:**

**核心思想：递归 + 维护前驱节点**

1. 递归处理左子树，返回展开后的链表头
2. 递归处理右子树，返回展开后的链表头
3. 将左链表接到根节点右孩子位置
4. 将右链表接到左链表尾部

**关键观察：**展开后树变成只有右孩子的链表，中序遍历顺序。

**Morris遍历法（进阶）：** 无需额外空间，在遍历过程中修改指针。

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h 为树高（递归栈），Morris 遍历 O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树展开为链表**

rectangle "原二叉树" as T #F0F8FF
rectangle "展开后" as L #FFF0F5

note right of T
      1
     / \
    2   5
   / \   \
  3   4   6
end note

note right of L
  1 → 2 → 3 → 4 → 5 → 6
  (只有右孩子的链表)
end note

== 递归展开过程 ==
T → T : flatten(3) → 返回3
T → T : flatten(4) → 接在3后 → 3→4
T → T : flatten(2) → 左子树接到2右 → 2→3→4
note right of T
  1的右子树: 5→6
end note

T → T : flatten(6) → 返回6
T → T : flatten(5) → 接在5右 → 5→6
T → T : flatten(1) → 左子树接到1右
note right of T
  1的左子树链: 2→3→4
  1的右子树链: 5→6
end note

T → T : 最终: 1→2→3→4→5→6

legend center
| 步骤 | 操作 |
|---|---|
| 递归处理左 | 返回最左节点 |
| 链接 | root.right = 左链表头 |
| 找尾 | 左链表尾部.next = 右链表 |
| 更新 | root = root.right |
endlegend
@enduml
```

---

### 对称的二叉树

**原理:**

**核心思想：递归比较镜像位置**

- 对称二叉树：左子树和右子树互为镜像
- 递归函数 `isMirror(left, right)` 判断两节点是否镜像
- 终止条件：两节点都为空（true），或其中一个为空（false），或值不同（false）
- 递归比较：`isMirror(left.left, right.right)` 且 `isMirror(left.right, right.left)`

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，h 为树高（递归栈）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **对称二叉树判断**

rectangle "二叉树" as T #F0F8FF

note right of T
    对称树:
        1
       / \
      2   2
     / \ / \
    3  4 4  3
end note

== 递归比较过程 ==
T → T : isMirror(1左=2, 1右=2)
note right of T
  2 vs 2: 值相同，继续递归
end note

T → T : isMirror(2左=3, 2右=4)
note right of T
  3 vs 4: 值不同，返回false
end note

== 对称示例 ==
note right of T
    非对称树:
        1
       / \
      2   2
       \   \
        3   3
    2的右孩子 vs 2的右孩子
    一个有孩子，一个没有 → false
end note

legend center
| isMirror(a,b) | 结果 |
|---|---|
| a=NULL, b=NULL | true |
| a=NULL 或 b=NULL | false |
| a.val != b.val | false |
| isMirror(a.left,b.right) && isMirror(a.right,b.left) | true |
endlegend
@enduml
```

---

### 从上到下打印二叉树

**原理:**

**核心思想：BFS（广度优先遍历）+ 队列**

1. 将根节点入队
2. 循环：队头出队并访问，将左右孩子（非空）入队
3. 直到队列为空

**分层打印变种：** 记录当前层节点数 `levelSize = queue.size()`，处理完一层后换行。

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)，队列最多存储一层节点

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **层序遍历二叉树**

rectangle "队列" as Q #F0F8FF
rectangle "输出" as O #FFF0F5

note right of Q
        1
       / \
      2   3
     / \   \
    4   5   6
end note

== 遍历过程 ==
Q → Q : 入队: [1]
note right of Q
  levelSize = 1
end note

Q → O : 出队1 → 输出1, 入队[2,3]
note right of O
  输出: 1
end note

Q → O : levelSize=2
Q → O : 出队2 → 输出2, 入队[3,4]
Q → O : 出队3 → 输出3, 入队[3,4,5]
note right of O
  输出: 1, 2, 3
end note

Q → O : levelSize=3
Q → O : 出队4,5,3 → 输出4,5,3
note right of O
  输出: 1, 2, 3, 4, 5, 3
end note

Q → O : levelSize=1
Q → O : 出队6 → 输出6
note right of O
  输出: 1, 2, 3, 4, 5, 3, 6
end note

Q → Q : 队列空 → 结束

legend center
| 层 | 节点 | 输出 |
|---|---|---|
| 第1层 | 1 | 1 |
| 第2层 | 2,3 | 2,3 |
| 第3层 | 4,5,6 | 4,5,6 |
endlegend
@enduml
```

---

### 序列化二叉树

**原理:**

**序列化（Encode）：**

- 前序遍历，遇空指针用特殊符号（如 `#`）表示
- 节点值用分隔符（如 `,`）连接

**反序列化（Decode）：**

- 前序遍历恢复：第一个是根节点
- 遇到 `#` 表示空节点
- 递归构建左子树和右子树

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树序列化与反序列化**

rectangle "原树" as T #F0F8FF
rectangle "序列化字符串" as S #FFF0F5

note right of T
        1
       / \
      2   3
       \
        4
end note

== 序列化(前序) ==
T → S : 遍历: 1,2,#,4,#,#,3,#,#
note right of S
  "1,2,#,4,#,#,3,#,#"
end note

== 反序列化 ==
S → T : 解析"1,2,#,4,#,#,3#,#"
note right of S
  第一个'1'是根
  递归构建左右子树
end note

note right of S
  重建成功，树结构一致
end note

legend center
| 节点 | 表示 |
|---|---|
| 非空节点 | "值," |
| 空节点 | "#," |
| 序列示例 | 1,2,#,4,#,#,3,#,# |
endlegend
@enduml
```

---

### 二叉树节点间的最大距离

**原理:**

**核心思想：递归求每个节点的最大距离**

- 经过某节点的最大距离 = 左子树最大深度 + 右子树最大深度 + 1
- 递归函数返回子树的最大深度

**公式：** `maxDistance = max(maxDistance, leftDepth + rightDepth + 1)`

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，h 为树高（递归栈）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树直径 - 最大距离**

rectangle "二叉树" as T #F0F8FF

note right of T
          1
         / \
        2   3
       / \
      4   5
     /
    6
end note

== 计算过程 ==
T → T : 节点6: depth=0, 经过=0
T → T : 节点4: left=0, right=0, depth=1, max=1
note right of T
  经过4的最大距离: 0+0+1=1
end note

T → T : 节点2: left=1, right=1, depth=2, max=2
note right of T
  经过2的最大距离: 1+1+1=3 (6→2→4或6→2→5)
end note

T → T : 节点3: depth=1, max=3
T → T : 节点1: left=2, right=1, max=4
note right of T
  经过1的最大距离: 2+1+1=4 (6→2→1→3)
end note

legend center
| 节点 | 左深 | 右深 | 经过此点最大距离 | 此点深度 |
|---|---|---|---|---|
| 6 | 0 | 0 | 0 | 0 |
| 4 | 0 | 0 | 1 | 1 |
| 5 | 0 | 0 | 1 | 1 |
| 2 | 1 | 1 | 3 | 2 |
| 3 | 0 | 0 | 1 | 1 |
| 1 | 2 | 1 | 4(答案) | 3 |
endlegend
@enduml
```

---

### 二叉树中和为某一值的路径

**原理:**

**核心思想：DFS（前序遍历）回溯**

- 从根节点向下累加路径上的节点值
- 当遇到叶子节点且累加和等于目标值，记录一条路径
- 回溯时减去当前节点值，尝试其他分支

**复杂度分析：**

- 时间复杂度：O(n)，每个节点最多访问一次
- 空间复杂度：O(h)，h 为树高（递归栈 + 路径数组）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树路径和等于目标值**

rectangle "二叉树" as T #F0F8FF
rectangle "路径记录" as P #FFF0F5

note right of T
        5
       / \
      4   8
     /   / \
    11  13   4
   / \     / \
  7   2   5   1
  目标: 22
end note

== DFS搜索 ==
T → P : 5 → 5+4=9 → 9+11=20
note right of P
  路径: [5,4,11]
end note

T → P : 20+7=27 (非叶子) → 回溯
T → P : 20+2=22 ✓ 找到![5,4,11,2]
note right of P
  叶子且和=22 → 记录路径
end note

T → P : 回溯到11 → 回溯到4
T → P : 继续搜索右子树...

legend center
| 路径 | 累加和 | 结果 |
|---|---|---|
| 5→4→11→7 | 27 | 否 |
| 5→4→11→2 | 22 | ✓ |
| 5→8→13 | 26 | 否 |
| 5→8→4→5 | 22 | ✓ |
| 5→8→4→1 | 18 | 否 |
endlegend
@enduml
```

---

### 二叉树的最近公共祖先

**原理:**

**核心思想：递归后序遍历**

从底向上找，遇到 p 或 q 就返回。递归函数 `lowestCommonAncestor(root, p, q)`：

- 若 root 为空或等于 p 或 q，直接返回 root
- 递归左右子树
- 若左右子树返回值都不为空，说明 p、q 分别在左右子树，当前节点是 LCA
- 否则返回非空的那个子树

**关键性质：** 找到的第一个"左右子树都找到节点"的节点就是最近公共祖先。

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(h)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二叉树最近公共祖先**

rectangle "二叉树" as T #F0F8FF

note right of T
        3
       / \
      5   1
     / \ / \
    6  2 8  7
      / \
     4   9

  p=5, q=4 → LCA=5
  p=5, q=1 → LCA=3
end note

== 查找 p=5, q=4 ==
T → T : 递归到节点5
note right of T
  left: 找到6返回
  right: 找到2，继续递归...
  right子树找到4返回
  5的左右都非空 → 5是LCA
end note

== 查找 p=5, q=1 ==
T → T : 递归到节点3
note right of T
  left: 找到5返回 (含p)
  right: 找到1返回 (含q)
  3的左右都非空 → 3是LCA
end note

legend center
| 情况 | left结果 | right结果 | 返回值 |
|---|---|---|---|
| 找到p和q | 非空 | 非空 | 当前节点(LCA) |
| 只找到p/q | 非空 | 空 | 非空那个 |
|都没找到 | 空 | 空 | 空 |
endlegend
@enduml
```

---

### 剪绳子

**原理:**

**方法一：动态规划**

- `dp[i]` 表示长度为 i 的绳子的最大乘积
- `dp[i] = max(dp[i-j] * j, (i-j) * j)`，j 从 1 到 i/2
- 切分为至少两段，所以要比较切与不切的情况

**方法二：数学贪心**

- 证明：最优切分中每段长度为 3（若有剩余 2 则保留）
- 若 n=2，返回 1；n=3，返回 2
- 循环切出尽可能多的 3，最后一段处理：4 时切为 2+2

**复杂度分析：**

- DP: 时间 O(n²)，空间 O(n)
- 贪心: 时间 O(1)，空间 O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **剪绳子求最大乘积**

rectangle "DP表" as DP #F0F8FF
rectangle "贪心" as G #FFF0F5

note right of DP
  n=10, 求最大乘积
end note

== DP递推 ==
DP → DP : dp[2]=1, dp[3]=2
DP → DP : dp[4]: max(1*3,1*dp[3])=2, 2*2=4 → dp[4]=4
DP → DP : dp[5]: 3*2=6 → dp[5]=6
DP → DP : dp[10]: 遍历j → dp[10]=36

note right of DP
  dp[10]=36 = 3+3+4
end note

== 贪心策略 ==
G → G : n=10
note right of G
  切3: 10=3+3+4
  4不继续切
  乘积: 3*3*4=36
end note

G → G : n=8
note right of G
  8=3+3+2
  乘积: 3*3*2=18
end note

G → G : n=4
note right of G
  4=2+2 或 4不切
  乘积: 4
end note

legend center
| n | 最优切法 | 乘积 |
|---|---|---|
| 2 | 不切 | 1 |
| 3 | 不切 | 2 |
| 4 | 2+2 | 4 |
| 5 | 2+3 | 6 |
| 10 | 3+3+4 | 36 |
endlegend
@enduml
```

---

### 二进制中1的个数

**原理:**

**核心算法：Brian Kernighan 算法**

- `n & (n-1)` 操作会消除 n 最右边的 1
- 循环执行直到 n 变为 0，循环次数即为 1 的个数

**原理：** n-1 会将 n 最右边的 1 变成 0，其后所有位变成 1。AND 操作后，最右边的 1 及其后各位都变成 0。

**其他方法：**

- `n & (-n)` 提取最右边 1，但不便于计数
- 逐位移动检查（需要循环 32/64 次）

**复杂度分析：**

- 时间复杂度：O(k)，k 为 1 的个数
- 空间复杂度：O(1)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **二进制1的个数 - Brian Kernighan**

rectangle "操作过程" as O #F0F8FF

note right of O
  n = 11 = 1011 (二进制)
end note

== 迭代过程 ==
O → O : n & (n-1) = 1011 & 1010 = 1010
note right of O
  消除最右1, count=1
end note

O → O : n & (n-1) = 1010 & 1001 = 1000
note right of O
  count=2
end note

O → O : n & (n-1) = 1000 & 0111 = 0000
note right of O
  count=3, n=0, 结束
end note

O → O : 返回 count = 3

legend center
| 迭代 | n | n-1 | n&(n-1) | count |
|---|---|---|---|---|
| 1 | 1011 | 1010 | 1010 | 1 |
| 2 | 1010 | 1001 | 1000 | 2 |
| 3 | 1000 | 0111 | 0000 | 3 |
endlegend
@enduml
```

---

### 矩阵的最小路径和

**原理:**

**核心思想：动态规划**

- `dp[i][j]` 表示从左上角到 (i,j) 的最小路径和
- 转移方程：`dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]`
- 第一行和第一列只有一种路径来源

**空间优化：** 滚动数组，用一行数组代替整个 dp 表。

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)（优化后）或 O(m×n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **矩阵最小路径和**

rectangle "矩阵" as M #F0F8FF
rectangle "DP表" as DP #FFF0F5

note right of M
  grid:
  1  3  1
  1  5  1
  4  2  1
end note

== DP计算 ==
DP → DP : dp[0][0] = 1
DP → DP : dp[0][1] = 1+3=4, dp[0][2]=4+1=5
DP → DP : dp[1][0] = 1+1=2
DP → DP : dp[1][1] = min(4,2)+5=7
DP → DP : dp[1][2] = min(5,7)+1=6
DP → DP : dp[2][0] = 2+4=6
DP → DP : dp[2][1] = min(7,6)+2=8
DP → DP : dp[2][2] = min(6,8)+1=7

note right of DP
  答案: dp[2][2] = 7
  路径: 1→3→1→1→1 (沿对角线)
end note

legend center
| 位置 | dp值 | 来源 |
|---|---|---|
| [0,0] | 1 | 起点 |
| [0,1] | 4 | 左 |
| [0,2] | 5 | 左 |
| [1,0] | 2 | 上 |
| [1,1] | 7 | min(4,2)+5 |
| [1,2] | 6 | min(5,7)+1 |
| [2,0] | 6 | 上 |
| [2,1] | 8 | min(7,6)+2 |
| [2,2] | 7 | min(6,8)+1 |
endlegend
@enduml
```

---

### 换钱的方法数

**原理:**

**核心思想：动态规划（完全背包）**

- `dp[i][j]` 表示使用前 i 种硬币，凑成金额 j 的方法数
- `dp[i][j] = dp[i-1][j] + dp[i][j-coins[i-1]]`
  - 不使用第 i 种硬币 + 使用第 i 种硬币（可重复）
- 初始化：`dp[0][0] = 1`

**空间优化：** 一维数组，从左到右遍历（完全背包特性）

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **换钱的方法数**

rectangle "硬币" as C #F0F8FF
rectangle "DP表" as DP #FFF0F5

note right of C
  coins = [1, 5, 10, 25]
  amount = 100
end note

== DP递推 ==
DP → DP : dp[0] = 1
note right of DP
  金额0: 1种方法(什么都不用)
end note

DP → DP : coin=1: dp[j] = dp[j] + dp[j-1]
note right of DP
  所有金额都可以用1分钱组合
end note

DP → DP : coin=5: dp[j] = dp[j] + dp[j-5]
note right of DP
  累加使用5分硬币的方法
end note

DP → DP : coin=10: dp[j] = dp[j] + dp[j-10]
DP → DP : coin=25: dp[j] = dp[j] + dp[j-25]

note right of DP
  最终 dp[100] 即为答案
end note

legend center
| coin=1 | coin=5 | coin=10 | coin=25 |
|---|---|---|---|
| dp更新 | 累加 | 累加 | 累加 |
| 完全背包 | 顺序遍历 | 顺序遍历 | 顺序遍历 |
endlegend
@enduml
```

---

### 换钱的最小货币数

**原理:**

**核心思想：动态规划**

- `dp[i]` 表示凑成金额 i 所需的最少硬币数
- `dp[i] = min(dp[i-coins[j]] + 1)` 对所有硬币 j
- 初始化：`dp[0] = 0`，其他为 INF

**空间优化：** 一维数组

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **换钱的最少硬币数**

rectangle "硬币" as C #F0F8FF
rectangle "DP表" as DP #FFF0F5

note right of C
  coins = [1, 3, 5]
  amount = 11
end note

== DP递推 ==
DP → DP : dp[0] = 0, 其他=INF
note right of DP
  INF = amount+1 (足够大)
end note

DP → DP : dp[1] = min(dp[0]+1) = 1
DP → DP : dp[2] = min(dp[1]+1) = 2
DP → DP : dp[3] = min(dp[2]+1, dp[0]+1) = min(3,1) = 1
DP → DP : dp[4] = min(dp[3]+1, dp[1]+1, dp[-1]) = 2
note right of DP
  ...继续递推
end note

DP → DP : dp[11] = 3
note right of DP
  最少3枚硬币: 5+5+1
end note

legend center
| 金额 | dp值(最少硬币) | 选择 |
|---|---|---|
| 0 | 0 | - |
| 1 | 1 | 1 |
| 2 | 2 | 1+1 |
| 3 | 1 | 3 |
| 4 | 2 | 3+1 |
| 5 | 1 | 5 |
| ... | ... | ... |
| 11 | 3 | 5+5+1 |
endlegend
@enduml
```

---

### 最长公共子序列问题

**原理:**

**核心思想：二维动态规划**

- `dp[i][j]` 表示 `text1[0..i-1]` 和 `text2[0..j-1]` 的 LCS 长度
- 转移方程：
  - 若 `text1[i-1] == text2[j-1]`：`dp[i][j] = dp[i-1][j-1] + 1`
  - 否则：`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

**空间优化：** 滚动数组，两行即可

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(min(m,n))（优化后）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **最长公共子序列 - LCS**

rectangle "字符串" as S #F0F8FF
rectangle "DP矩阵" as DP #FFF0F5

note right of S
  text1 = "abcde"
  text2 = "ace"
end note

== DP矩阵构建 ==
DP → DP : 初始化 dp[0][*] = 0, dp[*][0] = 0
DP → DP : i=1: 'a' vs 'a','c','e' → dp[1][1]=1
DP → DP : i=2: 'b' vs 'a','c','e' → dp[2][1]=1
DP → DP : i=3: 'c' vs 'c' → dp[3][3]=2 (a,c匹配)
note right of DP
  ...继续填表
end note

DP → DP : 最终 dp[5][3] = 3
note right of DP
  LCS = "ace" 或 "ace" (本身就是)
end note

legend center
|  | "" | a | c | e |
|---|---|---|---|---|
| "" | 0 | 0 | 0 | 0 |
| a | 0 | 1 | 1 | 1 |
| b | 0 | 1 | 1 | 1 |
| c | 0 | 1 | 2 | 2 |
| d | 0 | 1 | 2 | 2 |
| e | 0 | 1 | 2 | 3 |
endlegend
@enduml
```

---

### 最长公共子串问题

**原理:**

**核心思想：二维动态规划**

- `dp[i][j]` 表示以 `str1[i-1]` 和 `str2[j-1]` **结尾**的公共子串长度
- 转移方程：
  - 若 `str1[i-1] == str2[j-1]`：`dp[i][j] = dp[i-1][j-1] + 1`
  - 否则：`dp[i][j] = 0`（必须以当前字符结尾）
- 维护全局最大值 `maxLen`

**空间优化：** 只保存上一行，用一个变量记录当前对角线值

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)（优化后）

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **最长公共子串**

rectangle "字符串" as S #F0F8FF
rectangle "DP矩阵" as DP #FFF0F5

note right of S
  str1 = "abcde"
  str2 = "cdef"
end note

== DP矩阵 ==
DP → DP : 构建dp矩阵
note right of DP
  若相等: dp[i][j] = dp[i-1][j-1] + 1
  否则: dp[i][j] = 0
end note

DP → DP : 找到最大值位置
note right of DP
  maxLen = 3
  位置: str1[2..4]="cde", str2[0..2]="cde"
end note

legend center
|  | "" | c | d | e | f |
|---|---|---|---|---|---|---|
| "" | 0 | 0 | 0 | 0 | 0 |
| a | 0 | 0 | 0 | 0 | 0 |
| b | 0 | 0 | 0 | 0 | 0 |
| c | 0 | 1 | 0 | 0 | 0 |
| d | 0 | 0 | 2 | 0 | 0 |
| e | 0 | 0 | 0 | 3 | 0 |
endlegend
@enduml
```

---

### 数组中的最长连续序列

**原理:**

**核心思想：哈希集合 + O(n) 遍历**

1. 将所有元素加入哈希集合
2. 遍历数组，对每个元素尝试扩展：往左找 `num-1`，往右找 `num+1`
3. 用哈希集合的 O(1) 查询快速判断连续
4. 跳过已被访问过的序列起点

**关键优化：** 只有当 `num-1` 不存在时才从 num 开始扩展，确保每个序列只处理一次。

**复杂度分析：**

- 时间复杂度：O(n)，每个元素最多被访问常数次
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **最长连续序列**

rectangle "数组" as A #F0F8FF
rectangle "哈希集合" as H #FFF0F5

note right of A
  nums = [100, 4, 200, 1, 3, 2]
end note

== 构建哈希集合 ==
A → H : 插入所有元素
note right of H
  {100, 4, 200, 1, 3, 2}
end note

== 遍历查找 ==
H → H : 100: 99不存在, 扩展100→100, len=1
H → H : 4: 3存在, 跳过! (不是起点)
note right of H
  1是序列起点!
end note

H → H : 1: 扩展 1→2→3→4, len=4
note right of H
  {1,2,3,4} 连续
end note

H → H : 200: 199不存在, 扩展200→200, len=1

legend center
| 遍历 | num-1存在? | 是否处理 | 序列长度 |
|---|---|---|---|
| 100 | 否 | ✓ | 1 |
| 4 | 是(3存在) | ✗ | - |
| 200 | 否 | ✓ | 1 |
| 1 | 否 | ✓ | 4 |
| 3 | 是(2存在) | ✗ | - |
| 2 | 是(1存在) | ✗ | - |
endlegend
@enduml
```

---

### 最长递增子序列

**原理:**

**方法一：O(n²) 动态规划**

- `dp[i]` 表示以第 i 个元素结尾的 LIS 长度
- `dp[i] = max(dp[j] + 1)`，其中 `j < i` 且 `nums[j] < nums[i]`

**方法二：O(n log n) 二分查找**

- 维护一个 `tail` 数组，`tail[i]` 表示长度为 i+1 的递增子序列的最小尾部值
- 遍历 nums，用二分查找找到第一个大于等于 num 的位置
- 若在末尾插入；否则替换
- 最终 `tail.size()` 即为 LIS 长度

**复杂度分析：**

- DP: 时间 O(n²)，空间 O(n)
- 二分: 时间 O(n log n)，空间 O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **最长递增子序列 - 二分优化**

rectangle "数组" as A #F0F8FF
rectangle "tail数组" as T #FFF0F5

note right of A
  nums = [10, 9, 2, 5, 3, 7, 101, 18]
end note

== 遍历过程 ==
T → T : num=10: tail=[10], len=1
T → T : num=9: 替换10, tail=[9], len=1
T → T : num=2: 替换9, tail=[2], len=1
T → T : num=5: 追加, tail=[2,5], len=2
T → T : num=3: 替换5前面, tail=[2,3], len=2
T → T : num=7: 追加, tail=[2,3,7], len=3
T → T : num=101: 追加, tail=[2,3,7,101], len=4
T → T : num=18: 替换101前面, tail=[2,3,7,18], len=4

note right of T
  最终 tail.size() = 4
  LIS = [2,3,7,18] (长度4)
end note

legend center
| num | 操作 | tail数组 | 说明 |
|---|---|---|---|
| 10 | 插入 | [10] | 新序列 |
| 9 | 替换 | [9] | 9<10, 保持最小尾 |
| 2 | 替换 | [2] | 更小 |
| 5 | 追加 | [2,5] | 2<5, 增长 |
| 3 | 替换 | [2,3] | 3<5 |
| 7 | 追加 | [2,3,7] | 增长 |
| 101 | 追加 | [2,3,7,101] | 增长 |
| 18 | 替换 | [2,3,7,18] | 18<101 |
endlegend
@enduml
```

---

### 子矩阵的最大累加和问题

**原理:**

**核心思想：降维 + Kadane 算法**

1. 固定矩阵的上下边界 top 和 bottom
2. 将二维压缩成一维：计算每列在 [top, bottom] 区间的累加和
3. 对这个一维数组应用 Kadane 算法求最大子数组和
4. 枚举所有 top-bottom 组合，取全局最大

**Kadane 算法：** 一维数组最大子段和，遍历时维护 `currentSum` 和 `maxSum`。

**复杂度分析：**

- 时间复杂度：O(m²×n)，m 行，n 列
- 空间复杂度：O(n)

**English Explanation:**


**PlantUML:**

```plantuml
@startuml
skinparam dpi 140
skinparam roundcorner 10

title **子矩阵最大累加和**

rectangle "矩阵" as M #F0F8FF
rectangle "压缩数组" as A #FFF0F5

note right of M
  矩阵:
  1  -2  -1  3
  5  -6   2  1
  3  -2   1 -1

  目标: 找最大和子矩阵
end note

== 枚举上下边界 ==
M → A : top=0, bottom=2, 压缩每列
note right of A
  列和: [9, -10, 2, 3]
  Kadane: [9, -1, -1, 3] → max=11
end note

M → A : top=1, bottom=2, 压缩每列
note right of A
  列和: [8, -8, 3, 0]
  Kadane: [8, 0, 3, 3] → max=11
end note

note right of A
  最大子矩阵和 = 11
  对应区域: 第0行全部
end note

legend center
| top | bottom | 压缩后 | Kadane结果 |
|---|---|---|---|
| 0 | 0 | [1,-2,-1,3] | 3 |
| 0 | 1 | [6,-8,1,4] | 6 |
| 0 | 2 | [9,-10,2,3] | **11** |
| 1 | 1 | [5,-6,2,1] | 5 |
| 1 | 2 | [8,-8,3,0] | 8 |
| 2 | 2 | [3,-2,1,-1] | 3 |
endlegend
@enduml
```

