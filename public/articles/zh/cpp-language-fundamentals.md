## 1. c/c++ 中强制类型转换使用场景

C++ 四种类型转换操作符，各有不同的使用场景和安全性：

- **static_cast**
  - 编译时类型检查
  - 用于基本类型转换（int→double）、上下转型（Base*→Derived*）

- **dynamic_cast**
  - 运行时类型检查（RTTI）
  - 用于安全向下转型，失败返回 nullptr

- **const_cast**
  - 唯一可修改 const 值的转换
  - 用于移除或添加 const 限定符

- **reinterpret_cast**
  - 位级重解释，最危险的转换
  - 仅限底层操作（指针↔整数）

四种 cast 的核心差异对比如下：

| 转换类型 | 检查时机 | 安全性 | 典型用途 |
|---------|---------|-------|---------|
| static_cast | 编译时 | 中 | 基本类型、上下转换 |
| dynamic_cast | 运行时 | 高 | 安全向下转型 |
| const_cast | 编译时 | 低 | const移除/添加 |
| reinterpret_cast | 无 | 极高风险 | 底层位操作 |

通过图示理解类型转换的层次关系和适用场景：

```plantuml
@startuml
title C/C++ 强制类型转换（内存模型 + 指针变化 + 安全性）

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ================== 内存布局 ==================
rectangle "Derived 对象内存布局\n\n起始地址: 0x1000\n----------------------\n[vptr]\n----------------------\nBase 子对象 (0x1000)\n----------------------\nDerived 子对象 (0x1010)" as OBJ #E3F2FD

rectangle "Base* p\n\n静态类型: Base*\n指向地址: 0x1000" as BASEPTR #BBDEFB

OBJ -down-> BASEPTR : 指向 Base 子对象

' ================== 转换 ==================
rectangle "static_cast\n\n【编译期】\n输入: Base*\n\n✔ 计算偏移 (+0x10)\n✖ 无运行时校验\n\n输出: Derived* (0x1010)\n⚠️ 非真实 Derived → UB" as SC #E8F5E9

rectangle "dynamic_cast\n\n【运行时】\n输入: Base*\n\n✔ RTTI 类型检查\n✔ 安全偏移\n\n输出: Derived* (0x1010)\n或 nullptr（失败）\n✔ 安全" as DC #FFF3E0

rectangle "const_cast\n\n【编译期】\n输入: const Base*\n\n✔ 去除 const/volatile\n✔ 地址不变\n\n输出: Base* (0x1000)\n⚠️ 修改只读对象 → UB" as CC #F3E5F5

rectangle "reinterpret_cast\n\n【编译期】\n输入: Base*\n\n✖ 无类型检查\n✖ 不做偏移\n\n输出: 任意类型指针 (0x1000)\n❌ 不改变地址\n❌ 不保证对象语义\n仅按目标类型解释内存\n⚠️ 仅当内存布局兼容时才可能正确" as RC #FFEBEE

' ================== 连接 ==================
BASEPTR --> SC : Base* → Derived*
BASEPTR --> DC : Base* → Derived*
BASEPTR --> CC : const Base* → Base*
BASEPTR --> RC : Base* → 任意类型*

' ================== 安全等级 ==================
rectangle "安全性排序\n\n1️⃣ dynamic_cast  （运行时校验）\n2️⃣ static_cast   （仅偏移）\n3️⃣ const_cast    （仅去修饰）\n4️⃣ reinterpret_cast（仅重解释）" as SAFE #FFFDE7

SC -down-> SAFE
DC -down-> SAFE
CC -down-> SAFE
RC -down-> SAFE

@enduml
```

---

## 2. c++ 什么时候生成默认构造函数

当类没有任何用户声明的构造函数时，编译器自动生成默认构造函数。生成后会调用成员类的默认构造，但**不初始化内置类型**。

以下情况**阻止生成**：

- 包含引用成员（必须在初始化列表初始化）
- 包含 const 成员（需初始化列表）
- 基类无默认构造且未在派生类初始化列表显式调用
- `= delete` 声明

显式 `= default` 可要求生成。

是否生成默认构造函数的判断条件：

| 情况 | 是否生成 |
|-----|---------|
| 无任何构造函数 | 生成 |
| = default | 生成 |
| = delete | 禁止 |
| 有引用/const 成员 | 需初始化列表 |
| 基类无默认构造 | 需显式调用 |

用图示理解编译器生成默认构造的完整规则：

```plantuml
@startuml
title C++ 默认构造函数生成规则（纵向精修版）

top to bottom direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 起点 =====
rectangle "① 定义类 A" as START #E3F2FD

rectangle "② 是否声明过构造函数？" as USER #E8F5E9

START --> USER

note right of USER
结论：
声明“任意构造函数”
→ 不再自动生成默认构造
end note

' ===== 分支 =====
rectangle "③ 未声明\n→ 自动生成（implicit）" as GEN #E8F5E9

rectangle "③ 已声明\n→ 默认构造不会生成" as NO_GEN #FFEEEE

USER --> GEN : 否
USER --> NO_GEN : 是

' ===== explicit =====
rectangle "④ 是否显式声明\nA() = default ?" as EXPLICIT #FFFDE7

NO_GEN --> EXPLICIT : 可选

note right of EXPLICIT
关键点：
=default 是“请求生成”
≠ 一定可用
end note

' ===== 合流 =====
rectangle "⑤ 是否拥有默认构造？" as MERGE #E1F5FE

GEN --> MERGE : implicit
EXPLICIT --> MERGE : explicit

note right of MERGE
来源不同：
implicit / explicit
👉 语义完全一致
end note

' ===== 条件 =====
rectangle "⑥ 是否满足构造条件？" as CHECK #FFF3E0

MERGE --> CHECK

note right of CHECK
必须满足：
✔ 成员可默认构造
✔ 基类可默认构造
✔ const 成员已初始化
✔ 引用成员已绑定
end note

' ===== 结果 =====
rectangle "⑦ 可用\n→ 可以调用 A()" as OK #E8F5E9

rectangle "⑦ 不可用\n→ A() = delete" as DEL #FFCCCC

CHECK --> OK : 满足
CHECK --> DEL : 不满足

note right of DEL
本质：
函数“被生成但被删除”
≠ 不存在
end note

' ===== 总结 =====
note bottom
面试核心逻辑（三层）：

1️⃣ 是否生成（看有没有声明构造函数）
2️⃣ 是否存在（implicit / =default）
3️⃣ 是否可用（是否满足约束）

👉 生成 ≠ 存在 ≠ 可用（核心考点）
end note

@enduml
```

---

## 3. c++ 什么时候生成默认拷贝构造函数

当类没有显式声明拷贝构造函数时，编译器生成默认拷贝构造函数，执行**逐成员拷贝**（memberwise copy）：内置类型直接复制字节，类类型递归调用其拷贝构造。

以下情况**阻止生成**：

- 包含引用成员（引用不可重新绑定）
- `= delete` 声明
- C++11 声明了移动构造或移动赋值

拷贝构造参数签名必须是 `ClassName(const ClassName&)` 或 `ClassName(ClassName&)`。

不生成拷贝构造的典型场景：

| 情况 | 原因 |
|-----|------|
| 显式声明了拷贝构造 | 用户已定义 |
| 声明了移动构造/赋值 | C++11+ 规则 |
| 包含引用成员 | 引用不可重新绑定 |
| = delete 声明 | 显式禁止拷贝 |

通过图示理解逐成员拷贝的执行过程：

```plantuml
@startuml
title C++ 默认拷贝构造函数生成规则（高信息密度优化版）

top to bottom direction
skinparam rectangle {
    RoundCorner 12
    Padding 8
}
skinparam shadowing false

' ===== 主流程 =====
rectangle "类 A 定义" as START #E3F2FD
rectangle "① 是否声明拷贝构造？" as Q1 #E8F5E9
rectangle "② 是否拥有拷贝构造？" as Q2 #E1F5FE
rectangle "③ 是否可用？" as Q3 #FFF3E0
rectangle "可用（可拷贝）" as OK #C8E6C9
rectangle "delete（不可用）" as DEL #EF9A9A

START --> Q1

' ===== 分支 =====
rectangle "implicit 生成\nA(const A&)" as GEN #C8E6C9
rectangle "不生成（被抑制）" as NO_GEN #FFCDD2
rectangle "=default 显式恢复" as EXPLICIT #FFF9C4

Q1 --> GEN : 否（未声明）
Q1 --> NO_GEN : 是（已声明）

NO_GEN --> EXPLICIT : 可选

GEN --> Q2 : implicit
EXPLICIT --> Q2 : explicit

Q2 --> Q3
Q3 --> OK : 是
Q3 --> DEL : 否

' ===== 结构化注释（左）=====
note left of Q1
【声明判定（关键入口）】

以下任一出现都算“已声明”：
✔ 自定义拷贝构造
✔ A(const A&) = delete
✔ A(const A&) = default

👉 结果：
不再触发 implicit 生成
end note

note left of GEN
【implicit 拷贝构造】

编译器自动生成：
A(const A&)

特点：
✔ public
✔ inline
✔ 成员逐个拷贝（浅拷贝）

⚠ 不保证一定“可用”
end note

' ===== 结构化注释（右）=====
note right of EXPLICIT
【=default】

语义：
请求编译器生成拷贝构造

作用：
✔ 恢复被抑制的构造函数
✔ 行为 ≈ implicit

常见用途：
✔ 配合移动语义控制
end note

note right of Q2
【是否拥有（Existence）】

来源仅两种：
✔ implicit（自动生成）
✔ explicit（=default）

👉 本质：
函数是否“被定义出来”
end note

note right of Q3
【可用性（Viability）】

即使“存在”，也可能：

👉 被隐式 delete

触发条件：
❌ 成员不可拷贝（unique_ptr）
❌ 基类不可拷贝
❌ 成员引用无法绑定
❌ 成员被 delete

👉 编译期检查
end note

note right of DEL
【delete 语义】

函数存在但：

✔ 不可调用
✔ 编译直接报错

👉 常见面试点
“为什么编译器生成了却不能用？”
end note

' ===== 总结 =====
note bottom
三阶段模型（核心）：

① Generation（是否生成）
② Existence（是否存在）
③ Viability（是否可用）

关键理解：

✔ implicit ≠ 一定存在
✔ 存在 ≠ 可用

👉 编译器是“逐层筛选”的
end note
@enduml
```

---

## 4. c++ 什么是深拷贝，什么是浅拷贝

浅拷贝只复制指针地址值，两个对象共享同一块堆内存；深拷贝为新对象重新分配内存并复制内容，各对象完全独立。

两者的核心区别：

- **浅拷贝**：只复制指针地址，修改一方会影响另一方，析构时可能导致重复释放
- **深拷贝**：分配新内存复制内容，各对象独立，互不影响

指针成员类需**显式定义**拷贝构造和拷贝赋值运算符实现深拷贝。编译器默认生成的是浅拷贝。现代 C++ 推荐用 `vector`/`string` 等 RAII 容器替代原始指针。

深拷贝与浅拷贝的全面对比：

| 特性 | 浅拷贝 | 深拷贝 |
|------|-------|--------|
| 指针成员 | 只复制地址 | 分配新内存 |
| 内存关系 | 共享堆内存 | 各自独立 |
| 析构安全 | 重复释放风险 | 安全 |

用图示理解深浅拷贝的内存模型差异：

```plantuml
@startuml
title 浅拷贝 vs 深拷贝（内存模型）

' ===== 全局风格 =====
skinparam shadowing false
skinparam linetype ortho
skinparam defaultTextAlignment center

skinparam rectangle {
    RoundCorner 20
    BorderColor #444
}

skinparam note {
    BackgroundColor #F9F9F9
    BorderColor #AAAAAA
}

' ===== 栈区 =====
rectangle "🧱 栈区（对象）" #EAF2FF {

    rectangle "对象 A\n──────────\ndata_ptr" as A #FFFFFF

    rectangle "对象 B\n（浅拷贝）\n──────────\ndata_ptr" as B1 #FFF4E6

    rectangle "对象 B\n（深拷贝）\n──────────\ndata_ptr" as B2 #E8FFF0
}

' ===== 堆区 =====
rectangle "🧠 堆区（数据）" #FFFBEA {

    rectangle "内存块 #1\n──────────\n值 = 10" as H1 #FFFFFF
    rectangle "内存块 #2\n──────────\n值 = 10" as H2 #FFFFFF
}

' ===== 布局控制（关键）=====
A -[hidden]-> B1
B1 -[hidden]-> B2
H1 -[hidden]-> H2

' ===== 指针关系 =====
A --> H1 : 指向
B1 --> H1 : 共享地址

B2 --> H2 : 独立副本

' ===== 说明 =====
note bottom of B1
【浅拷贝】
• 仅复制指针地址
• 多个对象共享同一块内存
⚠ 可能导致 double free / 数据污染
end note

note bottom of B2
【深拷贝】
• 分配新的内存空间
• 复制数据内容
✔ 对象之间完全独立
end note
@enduml
```

---

## 5. extern 关键字作用

`extern` 用于声明外部链接性（不分配存储空间），使变量/函数可跨文件共享。

三个核心用法：

- **声明全局变量/函数**
  - 告诉编译器这个变量/函数存在于其他编译单元

- **extern const**
  - const 变量默认内部链接性
  - extern 恢复外部链接性，使其可被其他文件访问

- **extern "C"**
  - 告诉 C++ 按 C 风格处理函数名（无名字修饰、无重载）
  - 用于调用 C 库或被 C 代码调用

extern 的典型用法汇总：

| 用法 | 作用 |
|-----|------|
| extern int x; | 声明外部全局变量 |
| extern const int y; | 恢复 const 外部链接性 |
| extern "C" f(); | C 风格链接声明 |

通过图示理解 extern 在多文件场景和混合编程中的作用：

```plantuml
@startuml
title extern 关键字作用全景（优化精炼版）

left to right direction
skinparam rectangle {
    RoundCorner 12
    Padding 10
}
skinparam shadowing false

rectangle "extern（核心语义）\n\n👉 声明符号具有“外部链接”（external linkage）\n👉 默认不分配存储（除非初始化）" as CORE #E3F2FD

rectangle "① 跨文件引用（变量）\n\nextern int a;\n\n✔ 引用外部定义\n✔ 不分配内存" as V1 #C8E6C9

rectangle "② 函数声明\n\nvoid foo();\n(默认 extern)\n\n✔ 可跨文件调用\n✔ extern 可省略" as V2 #E1F5FE

rectangle "③ C/C++ 互操作\n\nextern \"C\"\n\n✔ 禁止 name mangling\n✔ 保持 C 链接方式" as V3 #FFF3E0

rectangle "④ 特殊情况：带初始化\n\nextern int a = 10;\n\n⚠ 实际是定义\n✔ 分配存储" as V4 #FFCDD2

rectangle "⑤ 链接属性对比\n\nextern → 外部链接（跨文件）\nstatic → 内部链接（仅本文件）" as V5 #F3E5F5

CORE --> V1
CORE --> V2
CORE --> V3
CORE --> V4
CORE --> V5

note right
统一理解（关键）：

extern 的本质 = 控制“符号在链接阶段的可见性”

👉 所有用法都是这个核心语义的不同体现：

- 跨文件访问（变量/函数）
- C/C++ 兼容（extern "C"）
- 链接范围控制（vs static）

⚠ 编译通过 ≠ 链接成功（可能 undefined reference）
end note
@enduml
```

---

## 6. malloc free和new delete的区别

两者代表两种截然不同的内存管理范式：

- **malloc / free**
  - C 语言标准库函数
  - 仅分配指定大小原始字节，返回 `void*`
  - 不调用构造/析构函数
  - 失败返回 `nullptr`

- **new / delete**
  - C++ 操作符
  - 分配内存并调用构造函数，返回类型化指针
  - delete 先调用析构函数再释放内存
  - 失败抛出 `std::bad_alloc`

**核心原则：绝不混用 C 与 C++ 的内存管理 API。**

两者的核心差异对比：

| 特性 | malloc/free | new/delete |
|---------|-------------|------------|
| 语言 | C 语言库函数 | C++ 操作符 |
| 构造/析构 | 不调用 | 调用 |
| 失败处理 | 返回 nullptr | 抛出 bad_alloc |
| 类型安全 | void* | 类型化指针 |

通过图示理解 malloc/free 与 new/delete 的执行流程差异：

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

title **malloc/free vs new/delete 对比**

actor Developer as D #EAF5FF
participant "malloc() / free()\n(C 语言库函数)" as M #FEFEFE
participant "new / delete\n(C++ 操作符)" as N #FEFEFE
participant "构造函数\n/ 析构函数" as C #FFFBEA
participant "堆内存" as H #FDFCEB

== malloc/free 流程 ==

D -> M : malloc(size_t size)
activate M
M -> H : 分配原始字节
H --> M : 返回 void*
M --> D : void* ptr
note right of M
  仅分配内存。
  不调用构造函数。
  不知道对象类型。
end note
deactivate M

D -> M : free(ptr)
activate M
M -> H : 释放内存
note right of M #FFCCCC
  不调用析构函数！
  对象清理被跳过。
end note
M --> D : 内存已释放
deactivate M

== new/delete 流程 ==

D -> N : new Type
activate N
N -> H : 为 Type 分配内存
N -> C : 调用构造函数\n(初始化对象)
C --> N : 对象已初始化
N --> D : Type* ptr (类型化指针)
deactivate N

D -> N : delete ptr
activate N
N -> C : 调用析构函数\n(清理资源)
C --> N : 析构函数完成
N -> H : 释放内存
N --> D : 内存已释放
deactivate N

== 关键区别 ==

legend center
| 特性 | malloc/free | new/delete |
|---------|-------------|------------|
| 语言 | C 语言库函数 | C++ 操作符 |
| 类型安全 | 返回 void* | 类型安全 |
| 构造函数 | 不调用 | 调用 |
| 析构函数 | 不调用 | 调用 |
| 失败处理 | 返回 nullptr | 抛出 bad_alloc |
| 数组 | malloc(size*count) | new Type[n] / delete[] |
| 重载 | 困难 | 可重载 new |
| 混用 | 绝对不要混用！ | 应一致使用 |
endlegend
@enduml
```

---

## 7. 简述 strcpy、sprintf 与 memcpy 的区别

三者虽名称相似，但用途和安全性截然不同：

- **strcpy(dest, src)**
  - 字符串复制，遇 `\0` 停止
  - 不检查目标缓冲区大小，有溢出风险
  - 替代：`strcpy_s`

- **sprintf / snprintf**
  - 格式化输出到字符串
  - 不检查缓冲区大小（sprintf）
  - 替代：`snprintf`

- **memcpy(dest, src, n)**
  - 按精确字节数复制，不关心数据内容
  - 适合任意类型（结构体、数组等）
  - 性能最高

日常开发中的选择建议：首选 `strcpy_s`/`snprintf`，已知长度的内存复制用 `memcpy`。

三者安全性与性能对比：

| 函数 | 终止条件 | 安全性 | 性能 |
|------|---------|--------|------|
| strcpy | 遇到 \0 | 危险 | 中 |
| sprintf | 格式串决定 | 需snprintf | 低 |
| memcpy | 精确 n 字节 | 安全 | 高 |

通过图示理解三种函数的工作机制和应用场景：

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

title **strcpy vs sprintf vs memcpy 区别**

actor Developer as D #EAF5FF
participant "strcpy(dest, src)" as STR #FEFEFE
participant "sprintf/snprintf" as SPRINTF #FFFBEA
participant "memcpy(dest, src, n)" as MEM #FDFCEB

== strcpy 字符串复制 ==

D -> STR : strcpy(dest, src)
note right of STR
  **行为：**
  复制直到 \0 的完整字符串
  遇到 \0 停止

  **特点：**
  - 不检查 dest 容量
  - 缓冲区溢出风险
  - 假设 src 以 \0 结尾
  - 简单字符串复制场景可用
end note

STR -> STR : 查找 \0
note right of STR
  src: "Hello\0World..."
  复制 "Hello" + \0
end note

== sprintf 格式化复制 ==

D -> SPRINTF : sprintf(buf, "%d-%s", num, str)
note right of SPRINTF
  **行为：**
  格式化输出到字符串缓冲区

  **特点：**
  - 支持格式化（%d, %s 等）
  - 不检查缓冲区大小（sprintf）
  - snprintf 更安全
  - 性能较低
end note

SPRINTF -> SPRINTF : 解析格式串\n格式化参数
note right of SPRINTF
  输出: "42-helloworld"
end note

== memcpy 内存复制 ==

D -> MEM : memcpy(dest, src, n)
note right of MEM
  **行为：**
  精确复制 n 个字节

  **特点：**
  - 任意数据类型（struct, int[]...）
  - 不关心 \0，按字节精确复制
  - 性能最高
  - 不处理字符串终止符
end note

MEM -> MEM : 按字节复制 n 个
note right of MEM
  适合：
  - 结构体复制
  - 数组复制
  - 精确字节数控制
end note

== 安全性对比 ==

legend center
| 函数 | 终止条件 | 类型感知 | 安全性 | 性能 |
|------|---------|---------|--------|------|
| strcpy | 遇到 \0 | 字符串专用 | 危险 | 中 |
| sprintf | 格式串决定 | 格式化输出 | 需用 snprintf | 低 |
| memcpy | 精确 n 字节 | 原始内存 | 安全 | 高 |

**选择建议：**
1. 字符串复制 → strcpy_s 或 snprintf
2. 格式化字符串 → snprintf
3. 任意数据复制 → memcpy（已知长度时）
endlegend
@enduml
```

---

## 8. 如何避免野指针

野指针是指向已释放或无效内存的指针，访问会导致未定义行为（崩溃、数据损坏）。

**野指针的常见成因：**

- `delete` 后指针未置空
- 返回栈上局部变量地址
- 指针指向内存迁移后未更新

**防治野指针的核心策略：**

- 声明时初始化为 `nullptr`
- 优先使用智能指针（`unique_ptr`/`shared_ptr`）
- `delete` 后立即置空，使后续解引用可预测崩溃
- 严禁返回栈变量地址
- 开发用 AddressSanitizer（ASan）检测

最佳实践一览：

| 策略 | 说明 |
|-----|------|
| 初始化为 nullptr | 使野指针可预测崩溃 |
| 使用智能指针 | RAII 自动释放 |
| delete 后置空 | 防止重复访问 |
| 禁用返回栈地址 | 从源头杜绝 |

通过图示理解野指针的危险模式与安全模式：

```plantuml
@startuml
title 野指针产生 vs 避免（统一内存模型）

' ===== 全局风格 =====
skinparam shadowing false
skinparam linetype ortho
skinparam defaultTextAlignment center

skinparam rectangle {
    RoundCorner 20
    BorderColor #444
}

skinparam note {
    BackgroundColor #F9F9F9
    BorderColor #AAAAAA
}

left to right direction

' ===== 栈区 =====
rectangle "🧱 栈区（指针变量）" #EAF2FF {

    rectangle "p（未置空）\n──────────\nint*" as P_bad #FFECEC
    rectangle "p（已置空）\n──────────\nint*" as P_good #E8FFF0
}

' ===== 堆区 =====
rectangle "🧠 堆区（内存）" #FFFBEA {

    rectangle "内存块\n──────────\nvalue = 10" as H_valid #FFFFFF
    rectangle "已释放内存\n──────────\n❌ 无效" as H_free #FFF0F0
}

' ===== 布局控制 =====
P_bad -[hidden]-> P_good
H_valid -[hidden]-> H_free

' ===== 分配 =====
P_bad --> H_valid : new
P_good --> H_valid : new

' ===== 释放（垂直更清晰）=====
H_valid --> H_free : delete

' ===== 分叉（避免重叠）=====
P_bad -down-> H_free : ❌ 仍然指向（野指针）
P_good -right-> P_good : ✔ p = nullptr

' ===== 说明 =====
note left of P_bad
【野指针产生】
• 内存已释放（delete）
• 指针仍保存原地址
→ 指向无效内存
⚠ 未定义行为
end note

note right of P_good
【避免方式】
• delete 后置 nullptr
• 初始化为 nullptr
• 不返回局部变量地址
• 使用智能指针（unique_ptr / shared_ptr）
end note
@enduml
```
