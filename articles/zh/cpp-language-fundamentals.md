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
' =================== 全局样式 ===================
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 12
skinparam classAttributeIconSize 0
skinparam ParticipantPadding 10
skinparam BoxPadding 10

title **C++ Type Casting Hierarchy

package "C++ Type Casts" <<Frame>> {
    class "static_cast<T>" as SC #E8F5E9 {
        + Compile-time type checking
        + Basic type conversions
        + Upcast/Downcast in inheritance
    }

    class "dynamic_cast<T>" as DC #E3F2FD {
        + Runtime type checking via RTTI
        + Safe downcasting
        + Returns nullptr on failure
    }

    class "const_cast<T>" as CC #FFF3E0 {
        + Add/Remove const qualifier
        + Only cast that can modify const
    }

    class "reinterpret_cast<T>" as RC #FCE4EC {
        + Bit-level reinterpretation
        + Pointer/Integer conversion
        + Highly dangerous
    }
}

package "Use Scenarios" <<Frame>> {
    class "Numeric Types" as NT #F5F5F5
    class "Inheritance Hierarchy" as IH #F5F5F5
    class "const Correctness" as CC2 #F5F5F5
    class "Low-level Operations" as LO #F5F5F5
}

SC --> NT : int → double\nvoid* → T*
SC --> IH : Base* → Derived*\n(upcast safe)
DC --> IH : Base* → Derived*\n(runtime checked)
CC --> CC2 : remove_const\nadd_const
RC --> LO : pointer ↔ int\nbit reinterpretation

legend center
**C++ 四种类型转换操作符**
| 转换类型 | 检查时机 | 安全性 | 典型用途 |
|---------|---------|-------|---------|
| static_cast | 编译时 | 中 | 基本类型、上下转换 |
| dynamic_cast | 运行时 | 高 | 安全向下转型 |
| const_cast | 编译时 | 低 | const移除/添加 |
| reinterpret_cast | 无 | 极高风险 | 底层位操作 |
endlegend
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

title **默认构造函数生成规则

actor Compiler as C #EAF5FF
participant "class Empty {}" as E #FEFEFE
participant "class WithMembers" as WM #FFFBEA
participant "生成的默认构造函数" as DC #FDFCEB

== 规则一：无用户声明构造函数时生成 ==

C -> E : class Empty {}
note right of C #E8F5E9
  编译器生成默认构造函数
  Empty() = default;
end note

E -> DC : 生成: Empty() {}

== 规则二：显式 = default / = delete ==

C -> WM : class Demo { Demo() = default; }
note right of C
  显式要求生成默认构造
end note

C -> WM : class Forbidden { Forbidden() = delete; }
note right of C
  禁止生成默认构造
end note

== 规则三：特殊情况阻止生成 ==

C -> WM : class HasRef { int& ref; }
note right of WM #FFCCCC
  引用成员阻止默认构造生成
  必须在构造函数的初始化列表中初始化
end note

C -> WM : class HasConst { const int x; }
note right of WM #FFCCCC
  const 成员阻止默认构造生成
  必须使用初始化列表
end note

C -> WM : class HasComplex { std::string s; }
note right of WM #E8F5E9
  std::string 有默认构造，
  编译器会生成默认构造调用它
end note

== 规则四：基类约束 ==

C -> WM : class Derived : Base { Base(int); }
note right of WM #FFCCCC
  基类无默认构造，
  派生类不自动生成默认构造
  除非显式声明: Derived() : Base(0) {}
end note

== 规则五：虚函数与虚继承 ==

C -> WM : class Virtual { virtual void f(); }
note right of WM #E8F5E9
  生成默认构造（隐式）
  负责初始化 vptr（虚表指针）
end note

C -> WM : class VirtualBase : virtual Base {};
note right of WM #FFF3E0
  虚继承时：
  编译器生成默认构造
  负责初始化虚基类指针
end note

legend center
**默认构造函数生成条件**
| 情况 | 是否生成 | 说明 |
|-----|---------|------|
| 无任何构造函数 | 生成 | 空默认构造 |
| 只有带参构造 | 不生成 | 必须显式定义 |
| = default | 生成 | 显式请求 |
| = delete | 不生成 | 禁止生成 |
| 有引用成员 | 不生成 | 需初始化列表 |
| 有 const 成员 | 不生成 | 需初始化列表 |
| 基类无默认构造 | 不生成 | 需显式调用基类构造 |
endlegend
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

title **默认拷贝构造函数生成规则

actor Compiler as C #EAF5FF
participant "class Person { string name; }" as P #FEFEFE
participant "生成的拷贝构造" as CC #FDFCEB
participant "逐成员拷贝" as MW #FFFBEA

== 默认生成条件 ==

C -> P : class Person { string name; }
note right of C #E8F5E9
  无显式拷贝构造函数声明
  编译器生成默认拷贝构造
  Person(const Person& other);
end note

P -> CC : 生成: Person(const Person&)

== 逐成员拷贝过程 ==

CC -> MW : 调用成员拷贝构造函数
note right of MW
  **逐成员拷贝 (Memberwise Copy):**
  - 内置类型(int, float*): 直接复制字节
  - 类类型(string): 调用string的拷贝构造
  - 数组: 递归逐成员拷贝
end note

MW -> MW : name.other.name 复制
note right of MW
  调用 std::string 的拷贝构造
end note

== 特殊成员处理 ==

C -> P : class HasRef { int& ref; }
note right of P #FFCCCC
  引用成员阻止生成！
  引用不能重新绑定
end note

C -> P : class HasConst { const int x; }
note right of P #FFF3E0
  const 成员可拷贝
  但不能修改
  参数应为 const Person&
end note

C -> P : class HasVFunc { virtual void f(); }
note right of P #E8F5E9
  虚函数类可生成拷贝构造
  vptr 被复制，指向相同虚表
end note

== 不生成的场景 ==

legend center
**默认拷贝构造函数不生成的场景**
| 情况 | 原因 |
|-----|------|
| 显式声明了拷贝构造 | 用户已定义 |
| 声明了移动构造 | C++11+ 规则 |
| 声明了移动赋值 | C++11+ 规则 |
| 包含引用成员 | 引用不可重新绑定 |
| = delete 声明 | 显式禁止拷贝 |

**拷贝构造参数签名必须是：**
ClassName(const ClassName&) 或 ClassName(ClassName&)
endlegend
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

title **extern 关键字作用 / extern Keyword Mechanism

package "多文件共享
  file "file1.cpp" as F1 #FEFEFE
  file "file2.cpp" as F2 #FEFEFE

  F1 -> F2 : extern int global_var;
  note right of F1
    extern 声明：
    "global_var 定义在别处"
    不分配空间，只声明存在
  end note

  F1 -> F2 : extern void func();
  note right of F1
    声明函数存在于其他文件
  end note
}

package "extern const 链接性 / extern const Linkage" <<Frame>> {
  file "module.cpp" as M #E8F5E9
  file "main.cpp" as MAIN #E3F2FD

  M -> MAIN : extern const int BUFFER_SIZE;
  note right of M
    const 默认内部链接性
    extern 恢复外部链接性
    使其可被其他文件访问
  end note
}

package "C/C++ 混合编程
  class "C++ 代码" as CPP #FEFEFE
  class "C 函数库" as CLIB #FFFBEA

  CPP -> CLIB : extern "C" void c_func();
  note bottom of CPP
    extern "C" 告诉编译器：
    - 按 C 风格命名（无名字修饰）
    - 不进行函数重载处理
    - 产生纯 C 符号
  end note

  note bottom of CLIB
    常见场景：
    - 调用 C 标准库
    - 调用第三方 C 库
    - 被 C 代码调用
  end note
}

legend center
**extern 核心用法**
| 用法 | 作用 |
|-----|------|
| extern int x; | 声明外部全局变量 |
| extern void f(); | 声明外部函数 |
| extern const int y; | 恢复 const 外部链接性 |
| extern "C" f(); | C 风格链接声明 |

**注意：** extern 仅是声明，不定义，不分配空间
endlegend
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

title **野指针生命周期与避免

actor Developer as D #EAF5FF
participant "原始指针\n*p = new Obj" as P #FEFEFE
participant "堆内存\n[new Obj]" as H #FFFBEA
participant "智能指针\nunique_ptr" as S #FDFCEB
participant "nullptr" as N #EAF5FF

== 危险模式：原始指针 ==

D -> P : p = new Obj
activate P
P -> H : 分配堆内存
H --> P : 返回地址
deactivate P

D -> P : delete p
activate P
P -> H : 释放内存
note right of P #FFCCCC
  危险：p 现在指向
  已释放的内存（野指针！）
end note
P -> P : p 仍持有地址\n但内存已无效！
deactivate P

D -> P : *p (解引用)
note right of D #FF9999
  未定义行为！
  程序崩溃或数据损坏
end note

== 安全模式：智能指针 ==

D -> S : auto p = make_unique<Obj>()
activate S
S -> S : 创建 unique_ptr\n包装原始指针
note right of S
  unique_ptr 拥有对象。
  无需手动 delete。
end note
deactivate S

D -> S : (退出作用域)
activate S
S -> S : unique_ptr 析构函数\n自动调用
S -> H : delete p (自动)
note right of S
  安全：内存被释放，
  p 自动失效
end note
deactivate S

== 避免野指针最佳实践 ==

legend center
**如何避免野指针**
1. 声明时将所有指针初始化为 **nullptr**。
2. 使用 **智能指针**（unique_ptr / shared_ptr）。
3. **delete** 后立即设置：p = nullptr。
4. 切勿返回指向 **局部栈变量** 的指针。
5. 开发时使用 **AddressSanitizer** 检测。
endlegend
@enduml
```
