# 一.vector 底层实现原理
1. **连续内存模型**
   `std::vector` 内部维护一个指向堆内存的指针 `_data`，以及 `_size`（当前元素数）和 `_capacity`（已分配容量）。所有元素存储在连续内存中，保证随机访问的常数时间复杂度。

2. **动态扩容机制**
   当 `push_back()` 插入新元素时：

   * 若 `_size < _capacity`，直接在现有内存中构造新元素；
   * 若容量不足，则**分配更大内存（通常为 2 倍）**，再将旧元素移动或拷贝过去，最后释放旧内存。
     扩容会导致迭代器、引用、指针失效。

3. **内存管理与 RAII**
   元素的构造、析构由 `vector` 自动管理。离开作用域时，析构函数会依次销毁所有元素并释放堆内存，符合 RAII 原则。

4. **容量与大小控制**

   * `reserve(n)`：仅修改容量，预留空间以避免频繁扩容。
   * `resize(n)`：调整逻辑大小，大于当前 size 则构造新元素，小于则析构多余部分。
   * `shrink_to_fit()`：尝试收缩容量以减少内存占用。

5. **元素访问与边界检查**

   * `operator[]` 直接访问元素，**无边界检查**；
   * `at()` 提供检查，越界时抛出 `std::out_of_range` 异常。

6. **清空与回收策略**

   * `clear()` / `pop_back()` 仅析构元素但不释放内存。
   * 再次插入时可直接复用已分配的空间。


```plantuml
@startuml
' =================== 全局样式 ===================
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15
skinparam sequenceArrowThickness 1.3
skinparam sequenceMessageAlign center
skinparam ParticipantPadding 15
skinparam BoxPadding 15
skinparam ArrowColor #666
skinparam ArrowThickness 1.2
skinparam SequenceLifeLineBorderColor #AAAAAA
skinparam SequenceLifeLineBackgroundColor #F8F8F8
skinparam NoteBackgroundColor #FFFFFB
skinparam NoteBorderColor #AAA
skinparam ParticipantFontSize 13
skinparam ActorFontSize 14
skinparam SequenceDividerFontSize 14

title **std::unordered_map<K,V> 底层机制时序图**

actor User as U #EAF5FF
participant "unordered_map<K,V>" as M #FEFEFE
participant "哈希函数 (Hash)" as H #FFFBEA
participant "桶数组 (Bucket Array)" as B #FDFCEB
participant "节点链表 (NodeList)" as N #EAF5FF

== 插入流程 ==
U -> M : insert(key, value)
activate M
M -> H : hash = hash_function(key)
H --> M : 返回哈希值

M -> M : bucket_index = hash % bucket_count
M -> B : 定位到对应桶 bucket[bucket_index]
alt 桶为空
  M -> N : 创建新节点 Node(key,value)
  N --> B : 节点插入到桶中
  note right of N
    每个桶维护一个链表头指针，
    新元素直接插入链表头部。
  end note
else 桶非空（哈希冲突）
  B -> N : 遍历链表节点比较 key
  alt 找到相同 key
    N -> M : 插入失败 / 更新值（取决于接口）
  else 没有相同 key
    M -> N : 创建新节点并链入链表
  end
end

M -> M : size++
M -> M : 检查负载因子 (size / bucket_count)
alt 超过最大负载因子
  M -> M : 触发 rehash()
  M -> B : 分配更大桶数组
  M -> N : 重新分配所有节点
  note right of M
    rehash：扩容并重新分布元素
    所有迭代器失效。
  end note
end
deactivate M

== 查找流程 ==
U -> M : find(key)
activate M
M -> H : hash = hash_function(key)
H --> M
M -> B : 定位到 bucket[hash % bucket_count]
B -> N : 遍历链表匹配 key
alt 找到
  N -> M : 返回 value 的引用
else 未找到
  N -> M : 返回 end()
end
deactivate M

== 删除流程 ==
U -> M : erase(key)
activate M
M -> H : hash = hash_function(key)
M -> B : 找到桶
B -> N : 遍历链表删除匹配节点
note right of B
  仅移除链表节点，
  不会立即收缩桶数组。
end note
M -> M : size--
deactivate M

legend center
**说明**
1️⃣ 使用哈希函数将 key 映射到桶索引。
2️⃣ 每个桶存储一个节点链表，用于处理哈希冲突。
3️⃣ 插入或删除时，当负载因子超标，触发 **rehash()**。
4️⃣ rehash 扩容并重新分配所有元素，迭代器全部失效。
5️⃣ 查找、插入、删除平均复杂度为 **O(1)**，最坏为 **O(n)**。
endlegend
@enduml
```
