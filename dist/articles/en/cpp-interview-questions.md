好的，已为您生成带有 Markdown 加粗语法的完整目录。

# C/C++面试通用攻略 - 题目目录

## C/C++ Language, Common Interview Questions
*   **如何避免野指针**
*   **malloc free和new delete的区别**
*   **extern 关键字作用**
*   **简述 strcpy、sprintf 与 memcpy 的区别**
*   **c/c++ 中强制类型转换使用场景？**
*   **c++ 什么时候生成默认构造函数**


*   **c++ 什么时候生成默认拷贝构造函数**
*   **c++ 什么是深拷贝，什么是浅拷贝**

---

### 如何避免野指针 / How to Avoid Dangling Pointers

**Principle:**
A dangling pointer is a pointer that references memory that has been freed or is otherwise invalid. Its dangers cannot be underestimated—in C++, dangling pointers are one of the primary causes of program crashes, data corruption, and security vulnerabilities. Common scenarios that produce dangling pointers include: pointers not set to `nullptr` after `delete`, returning addresses of local stack variables, pointers not updated after memory migration, etc. Since pointers only store addresses without the ability to sense memory validity, accessing a dangling pointer leads to undefined behavior.

Core strategies to prevent dangling pointers: First, initialize pointers to `nullptr` immediately upon declaration to establish a clear "empty" state. Second, prefer using smart pointers (`std::unique_ptr`, `std::shared_ptr`) for dynamic memory management—they automatically release resources through RAII. Third, immediately set pointers to `nullptr` after deleting objects, making subsequent dereferences predictably crash rather than access garbage data. Fourth, strictly prohibit returning addresses of local stack variables. Fifth, use AddressSanitizer (ASan) and similar tools during development to detect memory issues.

Best practice in modern C++ is to replace raw pointers with **value semantics** and **smart pointers**, making memory ownership explicit and fundamentally eliminating dangling pointer problems.

**中文:**

野指针（Dangling Pointer）是指向已释放或无效内存的指针，其危害不容小觑。在 C++ 中，野指针是引发程序崩溃、数据损坏和安全漏洞的主要元凶之一。野指针的产生场景包括：对象被 `delete` 后指针未置空、返回栈上局部变量的地址、指针指向的内存已迁移但指针未更新等。由于指针仅存储地址而无法感知内存有效性，一旦访问野指针指向的无效区域，将导致未定义行为。

防止野指针的核心策略如下：第一，指针声明时立即初始化为 `nullptr`，使其明确处于"空"状态；第二，优先采用智能指针（`std::unique_ptr`、`std::shared_ptr`）管理动态内存，它们通过 RAII 机制自动释放资源；第三，删除对象后即刻将指针赋值为 `nullptr`，使后续解引用操作可预测地崩溃而非访问垃圾数据；第四，严禁返回局部栈变量的地址；第五，开发阶段使用 AddressSanitizer（ASan）等工具检测内存问题。

现代 C++ 的最佳实践是以**值语义**和**智能指针**替代原始指针，将内存所有权明确化，从根本上消除野指针问题。



**PlantUML Diagram:**

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

title **野指针生命周期与避免 / Dangling Pointer Lifecycle & Prevention**

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
  ⚠️ 危险：p 现在指向
  已释放的内存（野指针！）
end note
P -> P : p 仍持有地址\n但内存已无效！
deactivate P

D -> P : *p (解引用)
note right of D #FF9999
  🚨 未定义行为！
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
  ✅ 安全：内存被释放，
  p 自动失效
end note
deactivate S

== 避免野指针最佳实践 ==

legend center
**如何避免野指针**
1️⃣ 声明时将所有指针初始化为 **nullptr**。  
2️⃣ 使用 **智能指针**（unique_ptr / shared_ptr）。  
3️⃣ **delete** 后立即设置：p = nullptr。  
4️⃣ 切勿返回指向 **局部栈变量** 的指针。  
5️⃣ 开发时使用 **AddressSanitizer** 检测。
endlegend
@enduml
```

---

### malloc free和new delete的区别 / Difference Between malloc/free and new/delete

**Principle:**
In C++, `malloc`/`free` and `new`/`delete` represent two fundamentally different memory management paradigms. `malloc` is a C standard library function that only allocates raw bytes of a specified size without involving object construction; while `new` is a C++ expression that not only allocates memory but also calls the constructor to complete object initialization. Similarly, `delete` calls the destructor before releasing memory, while `free` only returns the raw memory block. This essential difference causes their behaviors in object-oriented programming to be completely different.

From technical details: `malloc(size)` returns `void*`, requiring manual byte calculation and being type-unsafe; `new Type` automatically calculates size and returns a typed pointer (`Type*`), being type-safe. If you construct C++ objects with `malloc`, constructors are not called and objects remain uninitialized. Upon allocation failure, `malloc` returns `nullptr`, while `new` throws `std::bad_alloc` exception by default (can be changed via `nothrow`). Additionally, `new` can be overloaded to implement custom memory allocation strategies, while `malloc`/`free` cannot be replaced.

Core principle: **Never mix C and C++ memory management APIs**. C++ objects use `new`/`delete`, C-style memory uses `malloc`/`free`. Modern C++ prefers smart pointers and containers to completely avoid raw memory operations.

**中文:**

在 C++ 中，`malloc`/`free` 与 `new`/`delete` 代表两种截然不同的内存管理范式。`malloc` 是 C 语言标准库函数，仅负责分配指定大小的原始字节，不涉及对象构造；而 `new` 是 C++ 表达式，不仅分配内存，还会调用构造函数完成对象初始化。类似地，`delete` 会先调用析构函数再释放内存，而 `free` 仅归还原始内存块。这种本质差异导致两者在面向对象编程中的行为截然不同。

从技术细节来看，`malloc(size)` 返回 `void*`，需要手动计算字节数且类型不安全；`new Type` 自动计算大小并返回类型化指针（`Type*`），是类型安全的。如果用 `malloc` 构造 C++ 对象，不会调用构造函数，对象处于未初始化状态。内存分配失败时，`malloc` 返回 `nullptr`，而 `new` 默认抛出 `std::bad_alloc` 异常（可通过 `nothrow` 改变行为）。此外，`new` 可以重载以实现自定义内存分配策略，`malloc`/`free` 则无法被替换。

核心原则：**绝对不要混用 C 与 C++ 的内存管理API**。C++ 对象用 `new`/`delete` 管理，C 风格内存用 `malloc`/`free` 处理。现代 C++ 更推荐使用智能指针和容器，完全规避原始内存操作。



**PlantUML Diagram:**

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
  ⚠️ 不调用析构函数！
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
| 构造函数 | ❌ 不调用 | ✅ 调用 |
| 析构函数 | ❌ 不调用 | ✅ 调用 |
| 失败处理 | 返回 nullptr | 抛出 bad_alloc |
| 数组 | malloc(size*count) | new Type[n] / delete[] |
| 重载 | 困难 | 可重载 new |
| 混用 | ❌ 绝对不要混用！ | 应一致使用 |
endlegend
@enduml
```

---

### extern 关键字作用 / extern Keyword的作用

**Principle:**
The `extern` keyword in C/C++ is used to declare external linkage and modify linkage behavior. It does not allocate storage space itself but tells the compiler that this variable or function exists elsewhere. There are three main application scenarios for `extern`: First, declaring global variables or functions to share them across multiple source files; Second, restoring external linkage for `const` global variables (otherwise `const` variables have internal linkage by default); Third, declaring functions written in other languages (such as C functions) in C++ or functions to be called by other languages.

When calling C language functions from C++ files, since C++ supports function overloading while C does not, their symbol naming rules differ. At this point, `extern "C"` needs to be used to tell the compiler to handle function names in C style, avoiding linking errors. Conversely, if you want C++ functions to be called by C code, you also need to declare them with `extern "C"` on the C++ side. The `extern` keyword enables programs to establish correct symbol reference relationships between compilation units, forming the foundation for modular programming and mixed-language programming.

**中文:**

`extern` 是 C/C++ 中用于声明外部链接性和改变连接方式的关键字，它本身不分配存储空间，只是告诉编译器这个变量或函数存在于别处。`extern` 的主要应用场景有三个：第一，声明全局变量或函数，使其可以在多个源文件之间共享；第二，声明 `const` 全局变量时恢复其外部链接性（否则 `const` 变量默认具有内部链接性）；第三，在 C++ 中声明其他语言编写的函数（如 C 函数）或被其他语言调用的函数。

当在 C++ 文件中需要调用 C 语言编写的函数时，由于 C++ 支持函数重载而 C 不支持，两者的符号命名规则不同。此时需要使用 `extern "C"` 告诉编译器按 C 语言的方式处理函数名，避免链接错误。反过来，如果要使 C++ 函数被 C 代码调用，也需要在 C++ 侧用 `extern "C"` 声明。`extern` 关键字使得程序可以在编译单元之间建立正确的符号引用关系，是模块化编程和语言混合编程的基础。



**PlantUML Diagram:**

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

title **extern 关键字作用 / extern Keyword Mechanism**

package "多文件共享 / Multi-file Sharing" <<Frame>> {
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

package "C/C++ 混合编程 / C/C++ Interop" <<Frame>> {
  class "C++ 代码" as CPP #FEFEFE
  class "C 函数库" as CLIB #FFFBEA
  
  CPP -> CLIB : extern "C" void c_func();
  note bottom of CPP
    extern "C" 告诉编译器：
    • 按 C 风格命名（无名字修饰）
    • 不进行函数重载处理
    • 产生纯 C 符号
  end note
  
  note bottom of CLIB
    常见场景：
    • 调用 C 标准库
    • 调用第三方 C 库
    • 被 C 代码调用
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

### 简述 strcpy、sprintf 与 memcpy 的区别 / Difference Between strcpy, sprintf and memcpy

**Principle:**
`strcpy`, `sprintf`, and `memcpy` are three commonly used memory/string manipulation functions in C/C++, but despite their similar names, they differ significantly in functionality, usage, and safety. Understanding these differences is crucial for writing secure and efficient code.

`strcpy(dest, src)` is a string copy function that copies the complete string from `src` until encountering the null character `\0` to `dest`. This function assumes `dest` has sufficient space and `src` is a valid `\0`-terminated string. The major problem with `strcpy` is that it **does not check destination buffer size**—if the `src` string length exceeds `dest` capacity, buffer overflow occurs, which is a major source of security vulnerabilities. `strcpy_s` is its safe version that checks size and returns an error code.

`sprintf`/`snprintf` are formatted output functions that write formatted data to strings. `sprintf(formatted_str, "value is %d, name is %s", num, str)` is similar to `printf` but outputs to a buffer instead of the terminal. `snprintf` is the safe version, specifying the maximum number of characters to write to avoid buffer overflow. `sprintf` conveniently performs type conversion and formatting but has lower performance and security issues.

`memcpy(dest, src, n)` is a raw memory copy function that copies exactly `n` bytes from `src` to `dest`, **not caring whether the data content is a string or checking for `\0`**. It copies byte-by-byte, suitable for copying arbitrary data types including structures and arrays. `memcpy` is the highest performance among the three, especially in scenarios requiring precise control over copied bytes.

**中文:**

`strcpy`、`sprintf` 与 `memcpy` 是 C/C++ 中常用的三种内存/字符串操作函数，尽管名称相似，但它们在功能、用途和安全性上存在显著差异。理解这些差异对于编写安全、高效的代码至关重要。

`strcpy(dest, src)` 是字符串复制函数，它从 `src` 复制直到遇到空字符 `\0` 为止的完整字符串到 `dest`。该函数假设 `dest` 有足够的空间，且 `src` 是以 `\0` 结尾的有效字符串。`strcpy` 的最大问题是**不检查目标缓冲区大小**，如果 `src` 字符串长度超过 `dest` 容量，会导致缓冲区溢出，这是安全漏洞的主要来源。`strcpy_s` 是其安全版本，会检查大小并返回错误码。

`sprintf`/`snprintf` 是格式化输出函数，将格式化的数据写入字符串。`sprintf(formatted_str, "value is %d, name is %s", num, str)` 类似于 `printf` 但输出到缓冲区而非终端。`snprintf` 是安全版本，指定最多写入的字符数，避免缓冲区溢出。`sprintf` 可以方便地进行类型转换和格式化，但性能较低且存在安全问题。

`memcpy(dest, src, n)` 是原始内存复制函数，从 `src` 复制精确的 `n` 个字节到 `dest`，**不关心数据内容是否为字符串，也不检查 `\0`**。它按字节复制，适合任意类型数据的复制，包括结构体、数组等。`memcpy` 是三者中性能最高的，尤其在需要精确控制复制字节数的场景。



**PlantUML Diagram:**

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
  ❌ 不检查 dest 容量
  ❌ 缓冲区溢出风险
  ❌ 假设 src 以 \0 结尾
  ✅ 简单字符串复制场景可用
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
  ✅ 支持格式化（%d, %s 等）
  ❌ 不检查缓冲区大小（sprintf）
  ⚠️ snprintf 更安全
  ❌ 性能较低
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
  ✅ 任意数据类型（struct, int[]...）
  ✅ 不关心 \0，按字节精确复制
  ✅ 性能最高
  ❌ 不处理字符串终止符
end note

MEM -> MEM : 按字节复制 n 个
note right of MEM
  适合：
  • 结构体复制
  • 数组复制
  • 精确字节数控制
end note

== 安全性对比 ==

legend center
| 函数 | 终止条件 | 类型感知 | 安全性 | 性能 |
|------|---------|---------|--------|------|
| strcpy | 遇到 \0 | 字符串专用 | ⚠️ 危险 | 中 |
| sprintf | 格式串决定 | 格式化输出 | ⚠️ 需用 snprintf | 低 |
| memcpy | 精确 n 字节 | 原始内存 | ✅ 安全 | 高 |

**选择建议：**
1️⃣ 字符串复制 → strcpy_s 或 snprintf
2️⃣ 格式化字符串 → snprintf
3️⃣ 任意数据复制 → memcpy（已知长度时）
endlegend
@enduml
```

---

### c/c++ 中强制类型转换使用场景 / Type Casting Scenarios in C/C++

**Principle:**
In C/C++, type casting is an essential part of program design. C++ provides four type casting operators: `static_cast`, `dynamic_cast`, `const_cast`, and `reinterpret_cast`, each with specific use cases and behavioral characteristics. Understanding the underlying principles of these casts is crucial for writing safe and efficient code.

`static_cast` is primarily used for conversions between basic types and for up/down casting in class hierarchies with inheritance relationships. It performs type checking at compile time and is suitable for scenarios with clearly defined conversion rules, such as `int` to `double` conversions or base class pointer to derived class pointer conversions. `dynamic_cast` is mainly used for safe downcasting, performing type checking at runtime through RTTI (Run-Time Type Information). If the conversion is unsafe, it returns `nullptr` (for pointers) or throws a `bad_cast` exception (for references). `const_cast` is used to remove or add `const` qualifiers, and it is the only cast that can modify the value of a `const` variable. `reinterpret_cast` is the most dangerous cast, reinterpreting the bit pattern of one type as another type, typically used for low-level operations such as conversions between pointers and integers.

**中文:**

在 C/C++ 中，类型转换是程序设计中不可或缺的一环。C++ 提供了四种类型转换操作符：`static_cast`、`dynamic_cast`、`const_cast` 和 `reinterpret_cast`，每种都有其特定的使用场景和行为特点。理解这些转换的底层原理对于写出安全、高效的代码至关重要。

`static_cast` 主要用于基本类型之间的转换以及具有继承关系的类层次结构中的上向下转换。它在编译时完成类型检查，适用于明确定义了转换规则的场景，例如 `int` 转 `double`、父类指针转子类指针等。`dynamic_cast` 则主要用于安全的向下转型，它在运行时通过 RTTI（运行时类型信息）进行类型检查，如果转换不安全则返回 `nullptr`（对指针）或抛出 `bad_cast` 异常（对引用）。`const_cast` 用于移除或添加 `const` 限定符，这是唯一可以修改 `const` 变量值的转换方式。`reinterpret_cast` 则是最危险的一种转换，它将一种类型的位模式重新解释为另一种类型，通常用于底层操作如指针与整数之间的转换。



**PlantUML Diagram:**

```plantuml
@startuml
' =================== 全局样式 ===================
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 12
skinparam classAttributeIconSize 0
skinparam ParticipantPadding 10
skinparam BoxPadding 10

title **C++ Type Casting Hierarchy / C++类型转换层次图**

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

### c++ 什么时候生成默认构造函数 / When Default Constructor is Generated

**Principle:**
A default constructor is a constructor automatically generated by the C++ compiler when a class does not explicitly declare any constructors. More precisely, the compiler generates a default constructor **when the class has no user-declared constructors**. This auto-generated default constructor performs default initialization on fundamental type members (built-in types are not initialized, class types call their default constructors).

Five important situations to note: First, if a class contains reference members, `const` members, or class members with parameterized constructors, the compiler will not generate a default constructor. Second, classes with virtual functions generate vtable pointers, and classes with virtual inheritance generate virtual base class pointers. Third, the generation of default constructors is also affected by `= default` and `= delete`—explicitly declaring `= default` generates a default implementation, while explicitly declaring `= delete` prohibits generation. Fourth, if a class is derived from a base class without a default constructor, and the derived class needs to initialize the base class, the default constructor will not be auto-generated. Fifth, template classes also do not auto-generate default constructors in certain situations.

**中文:**

默认构造函数是 C++ 编译器自动生成的构造函数，当类没有显式声明任何构造函数时，编译器会生成一个公有的默认构造函数。但更准确地说，**当类没有任何用户声明的构造函数时**，编译器才会生成默认构造函数。这个自动生成的默认构造函数会对基本类型成员进行默认初始化（内置类型不初始化，类类型调用其默认构造函数）。

需要特别注意的五种情况：第一，如果类中包含引用成员、`const` 成员或带有带参数构造函数的类成员，编译器不会生成默认构造函数；第二，带有虚函数的类会生成虚表指针，带有虚继承的类会生成虚基类指针；第三，默认构造函数的生成还受到 `= default` 和 `= delete` 的影响——显式声明为 `= default` 会生成默认实现，显式声明为 `= delete` 则禁止生成；第四，如果类派生于一个没有默认构造函数的基类，派生类如果需要初始化基类，则不会自动生成默认构造函数；第五，模板类在某些情况下也不会自动生成默认构造函数。



**PlantUML Diagram:**

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

title **默认构造函数生成规则 / Default Constructor Generation Rules**

actor Compiler as C #EAF5FF
participant "class Empty {}" as E #FEFEFE
participant "class WithMembers" as WM #FFFBEA
participant "生成的默认构造函数" as DC #FDFCEB

== 规则一：无用户声明构造函数时生成 ==

C -> E : class Empty {}
note right of C #E8F5E9
  ✅ 编译器生成默认构造函数
  Empty() = default;
end note

E -> DC : 生成: Empty() {}

== 规则二：显式 = default / = delete ==

C -> WM : class Demo { Demo() = default; }
note right of C
  ✅ 显式要求生成默认构造
end note

C -> WM : class Forbidden { Forbidden() = delete; }
note right of C
  ❌ 禁止生成默认构造
end note

== 规则三：特殊情况阻止生成 ==

C -> WM : class HasRef { int& ref; }
note right of WM #FFCCCC
  ❌ 引用成员阻止默认构造生成
  必须在构造函数的初始化列表中初始化
end note

C -> WM : class HasConst { const int x; }
note right of WM #FFCCCC
  ❌ const 成员阻止默认构造生成
  必须使用初始化列表
end note

C -> WM : class HasComplex { std::string s; }
note right of WM #E8F5E9
  ✅ std::string 有默认构造，
  编译器会生成默认构造调用它
end note

== 规则四：基类约束 ==

C -> WM : class Derived : Base { Base(int); }
note right of WM #FFCCCC
  ❌ 基类无默认构造，
  派生类不自动生成默认构造
  除非显式声明: Derived() : Base(0) {}
end note

== 规则五：虚函数与虚继承 ==

C -> WM : class Virtual { virtual void f(); }
note right of WM #E8F5E9
  ✅ 生成默认构造（隐式）
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
| 无任何构造函数 | ✅ 生成 | 空默认构造 |
| 只有带参构造 | ❌ 不生成 | 必须显式定义 |
| = default | ✅ 生成 | 显式请求 |
| = delete | ❌ 不生成 | 禁止生成 |
| 有引用成员 | ❌ 不生成 | 需初始化列表 |
| 有 const 成员 | ❌ 不生成 | 需初始化列表 |
| 基类无默认构造 | ❌ 不生成 | 需显式调用基类构造 |
endlegend
@enduml
```

---

### c++ 什么时候生成默认拷贝构造函数 / When Default Copy Constructor is Generated

**Principle:**
A default copy constructor is a copy constructor automatically generated by the compiler to create a new object following copy semantics. **When a class does not explicitly declare a copy constructor**, the compiler generates a default copy constructor. This auto-generated copy constructor performs memberwise copy on data members: for built-in types, bytes are directly copied; for class types, their copy constructors are recursively called.

Five important situations to note: First, if a class contains reference members, because references must be bound at initialization and cannot be rebound, the compiler will not generate a default copy constructor. Second, if a class contains `const` members or types with `const` qualification, the generated copy constructor cannot directly modify these members and needs to use `const` qualification in parameters. Third, classes with virtual functions involve copying vtable pointers, which is safe—the new object's vptr will point to the same vtable as the original object. Fourth, if a class declares move constructors or move assignment operators, the copy constructor may not be automatically generated (depending on context). Fifth, when a class involves virtual inheritance, copy constructor generation is more complex and requires proper handling of virtual base subobjects.

**中文:**

默认拷贝构造函数是编译器自动生成的拷贝构造函数，用于按照复制语义创建一个新对象。**当类没有显式声明拷贝构造函数时**，编译器会生成一个默认拷贝构造函数。这个自动生成的拷贝构造函数会对数据成员进行逐成员拷贝（memberwise copy）：对内置类型直接复制字节，对类类型递归调用其拷贝构造函数。

需要特别注意的五种情况：第一，如果类中包含引用成员，由于引用必须在初始化时绑定且不能重新绑定，编译器不会生成默认拷贝构造函数；第二，如果类中包含 `const` 成员或带有 `const` 限定的类型，生成的拷贝构造函数不能直接修改这些成员，需要在参数中使用 `const` 限定；第三，带有虚函数的类会涉及虚表指针的复制，这是安全的——新对象的 vptr 会指向与原对象相同的虚表；第四，如果类声明了移动构造函数或移动赋值运算符，拷贝构造函数可能不会被自动生成（具体取决于上下文）；第五，当类涉及虚继承时，拷贝构造函数的生成更为复杂，需要正确处理虚基类子对象。



**PlantUML Diagram:**

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

title **默认拷贝构造函数生成规则 / Default Copy Constructor Generation Rules**

actor Compiler as C #EAF5FF
participant "class Person { string name; }" as P #FEFEFE
participant "生成的拷贝构造" as CC #FDFCEB
participant "逐成员拷贝" as MW #FFFBEA

== 默认生成条件 ==

C -> P : class Person { string name; }
note right of C #E8F5E9
  ✅ 无显式拷贝构造函数声明
  编译器生成默认拷贝构造
  Person(const Person& other);
end note

P -> CC : 生成: Person(const Person&)

== 逐成员拷贝过程 ==

CC -> MW : 调用成员拷贝构造函数
note right of MW
  **逐成员拷贝 (Memberwise Copy):**
  • 内置类型(int, float*): 直接复制字节
  • 类类型(string): 调用string的拷贝构造
  • 数组: 递归逐成员拷贝
end note

MW -> MW : name.other.name 复制
note right of MW
  调用 std::string 的拷贝构造
end note

== 特殊成员处理 ==

C -> P : class HasRef { int& ref; }
note right of P #FFCCCC
  ❌ 引用成员阻止生成！
  引用不能重新绑定
end note

C -> P : class HasConst { const int x; }
note right of P #FFF3E0
  ✅ const 成员可拷贝
  但不能修改
  参数应为 const Person&
end note

C -> P : class HasVFunc { virtual void f(); }
note right of P #E8F5E9
  ✅ 虚函数类可生成拷贝构造
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

### c++ 什么是深拷贝，什么是浅拷贝 / Deep Copy vs Shallow Copy

**Principle:**
Deep copy and shallow copy are two different strategies for handling object copying in object-oriented programming. Their core difference lies in how they treat pointer-type data members. In shallow copy, when performing memberwise copy, pointer-type members only copy the address value—that is, both objects' pointer members point to the same heap memory. In deep copy, new memory is allocated for the new object, and data content is copied over, ensuring the new object and original object are completely independent.

Suppose a class contains a pointer member `int* p`. After shallow copy, both objects share the same memory; modifying one object's data affects the other, which leads to potential memory management issues (such as double-free). Deep copy creates an independent copy; modifying one object does not affect the other at all. In C++, if a class contains pointer members and requires correct copy semantics, you should explicitly define copy constructors and copy assignment operators to implement deep copy. If not explicitly defined, the compiler-generated default copy constructor and default copy assignment operator only perform shallow copy.

For modern C++, the better approach is to avoid using raw pointers and instead use RAII containers like `std::vector`, `std::string`, or smart pointers to manage memory. These containers themselves implement correct copy semantics (deep copy) without manual management.

**中文:**

深拷贝和浅拷贝是面向对象编程中处理对象复制时的两种不同策略，它们的核心区别在于如何对待指针类型的数据成员。浅拷贝是指逐成员复制时，指针类型的成员只复制地址值，即两个对象的指针成员指向同一块堆内存；而深拷贝则会为新对象重新分配内存，并将数据内容复制过去，确保新对象与原对象完全独立。

假设一个类包含指针成员 `int* p`，浅拷贝后两个对象共享同一块内存，修改其中一个对象的数据会影响另一个，这会导致潜在的内存管理问题（如重复释放）。深拷贝则创建独立的副本，修改一个对象完全不影响另一个。在 C++ 中，如果类包含指针成员且需要正确的复制语义，应该显式定义拷贝构造函数和拷贝赋值运算符来实现深拷贝。如果不显式定义，编译器生成的默认拷贝构造函数和默认拷贝赋值运算符只进行浅拷贝。

对于现代 C++ 来说，更好的做法是避免使用原始指针，改用 `std::vector`、`std::string` 或智能指针等 RAII 容器来管理内存，这些容器本身实现了正确的拷贝语义（深拷贝），无需手动管理。



**PlantUML Diagram:**

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

title **深拷贝 vs 浅拷贝 / Deep Copy vs Shallow Copy**

actor Developer as D #EAF5FF
participant "原对象\nOriginal Object" as ORIG #FEFEFE
participant "浅拷贝结果\nShallow Copy" as SHALLOW #FFFBEA
participant "深拷贝结果\nDeep Copy" as DEEP #FDFCEB
participant "堆内存\nHeap Memory" as H #EAF5FF

== 原始状态 ==

D -> ORIG : class Buffer { int* data; }
note right of ORIG
  原始对象状态：
  data 指向堆内存 0x1000
end note

ORIG -> H : data = new int[10]
note right of H
  堆内存 0x1000:
  [1, 2, 3, 4, 5, ...]
end note

== 浅拷贝 ==

D -> SHALLOW : 拷贝构造 (默认)
note right of SHALLOW #FFCCCC
  浅拷贝：只复制指针值
  • data 指针复制为 0x1000
  • 与原对象指向同一内存！
end note

ORIG -> SHALLOW : data 指针值复制
note right of SHALLOW
  0x1000 → 0x1000
  两个指针指向相同地址
end note

note right of SHALLOW #FF9999
  🚨 问题：
  • 修改一处影响另一处
  • 销毁时重复释放！
  • 内存错误 / 程序崩溃
end note

== 深拷贝 ==

D -> DEEP : 拷贝构造 (显式定义)
note right of DEEP #E8F5E9
  深拷贝：分配新内存
  • new 新内存 0x2000
  • 复制所有数据内容
end note

DEEP -> DEEP : new int[10] → 0x2000
DEEP -> H : 复制数据内容
note right of DEEP
  0x2000: [1, 2, 3, 4, 5, ...]
  完全独立的内存副本
end note

== 对比总结 ==

legend center
**深拷贝 vs 浅拷贝**
| 特性 | 浅拷贝 | 深拷贝 |
|------|-------|--------|
| 指针成员 | 只复制地址 | 分配新内存复制内容 |
| 内存关系 | 共享堆内存 | 各自独立 |
| 修改影响 | 相互影响 | 互不影响 |
| 析构安全 | ⚠️ 重复释放风险 | ✅ 安全 |
| 实现方式 | 编译器默认生成 | 需显式定义 |

**深拷贝实现示例：**
Buffer(const Buffer& other) : data(new int[10]) {
    memcpy(data, other.data, 10 * sizeof(int));
}

**现代 C++ 建议：**
使用 std::vector<int> data; 
自动实现深拷贝语义
endlegend
@enduml
```

---

## C/C++ Standard Library, Common Interview Questions
*   **vector 底层实现原理**


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

---

*   **vector 内存增长机制**
*   **vector中reserve和resize的区别**
*   **vector 的元素类型为什么不能是引用**
*   **list 极速底层实现原理**
*   **deque 底层实现原理**
*   **什么时候使用vector list deque**
*   **priority_queue 的底层实现原理**
*   **multiset 的底层实现原理**
*   **unordered_map 的底层实现原理**

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
*   **迭代器底层实现原理？及其有哪些种类？**
*   **迭代器失效？连续和非连续存储容器的失效？**
*   **STL 容器线程安全性**

## C++ Object-Oriented Programming, Common Interview Questions
*   **面对对象的三大特征**
*   **简述多态实现原理**
*   **怎么解决菱形继承**
*   **关键字override,final的作用**
*   **c++ 类型推导用法**
*   **function,lambda,bind之间的关系**
*   **继承下的构造函数和析构函数执行顺序**
*   **虚函数表和虚函数表指针的创建时机**
*   **虚析构函数的作用**
*   **智能指针种类以及使用场景**
*   **c++11用过哪些特性？**
*   **动态库与静态库的区别？**
*   **左值引用与右值引用的区别？右值引用的意义？**

---

### 面对对象的三大特征 / Three Pillars of OOP

**Principle:**
Encapsulation organizes data and operations into an independent unit (class) and uses access specifiers to restrict direct access to internal members. Inheritance creates hierarchical class relationships, allowing subclasses to reuse data and behavior from parent classes. Polymorphism allows the same operation to produce different results on different objects through static or dynamic binding.

**中文:**

**封装（Encapsulation）** 是将数据和操作数据的methods组织成一个独立的单元（类），并通过访问控制符（public、protected、private）来限制外部对内部成员的直接访问。封装的目的是**信息隐藏**，只暴露必要的接口给外部使用。合理的封装可以保护对象内部状态的完整性和一致性，同时降低代码耦合度，提高代码的可维护性和可复用性。

**继承（Inheritance）** 是面向对象最核心的特征之一，它允许创建分层次的类关系。通过继承，子类可以复用父类的数据和行为（成员变量和函数），无需重新编写。继承体现了"is-a"的关系。C++支持单继承、多继承以及虚继承。继承大大提高了代码的复用性和可扩展性。

**多态（Polymorphism）** 是指同一操作作用于不同对象可以产生不同的行为结果。多态分为**编译时多态（静态多态）**和**运行时多态（动态多态）**。编译时多态通过函数重载和模板实现；运行时多态通过虚函数和继承关系实现。C++的多态性使得我们可以使用基类指针或引用来操作子类对象，实现了接口与实现分离的设计原则。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **面向对象三大特征 / Three Pillars of OOP**

package "封装 / Encapsulation" {
  class "类 (Class)" as CLASS #E8F5E9 {
    + public: 接口
    - private: 数据
    # protected: 受限
  }
  
  note right of CLASS
    **信息隐藏**
    只暴露必要接口
    保护内部状态
  end note
}

package "继承 / Inheritance" {
  class "基类 (Base)" as BASE #E3F2FD {
    + 数据成员
    + 成员函数
  }
  
  class "派生类 (Derived)" as DERIVED #E3F2FD {
    + 复用基类成员
    + 可重写方法
  }
  
  BASE <|-- DERIVED : 继承
}

package "多态 / Polymorphism" {
  class "基类指针" as BASEPTR #FFF3E0
  class "子类对象" as DERIVEDOBJ #FFF3E0
  
  BASEPTR ..> DERIVEDOBJ : 运行时\n动态绑定
}

legend center
| 特征 | 目的 | 实现方式 |
|------|------|---------|
| 封装 | 信息隐藏 | 访问控制符 |
| 继承 | 代码复用 | 类派生 |
| 多态 | 接口分离 | 虚函数 |
endlegend

@enduml
```

---

### 简述多态实现原理 / Polymorphism Implementation Principle

**Principle:**
C++ polymorphism relies on **vtables (virtual function tables)** and **vptrs (virtual function table pointers)**. When a class contains at least one virtual function, the compiler creates a vtable for that class. Each object contains a hidden vptr at the start of its memory layout, pointing to the class's vtable.

**中文:**

C++ 多态的实现依赖于**虚函数表（vtable）**和**虚函数表指针（vptr）**。当类中包含至少一个虚函数时，编译器会为该类创建一个虚函数表。虚函数表是一个存储函数指针的数组，每个虚函数对应表中一个槽位，指向实际要调用的函数地址。

每个包含虚函数的类的对象都会包含一个隐藏的**虚函数表指针（vptr）**，位于对象内存布局的起始位置。当通过基类指针或引用调用虚函数时，程序首先通过对象头部的vptr找到对应的vtable，然后在vtable中查找函数的实际地址，最后跳转到该地址执行。

**动态绑定的过程**：Base* ptr = new Derived(); ptr->virtualFunc(); 编译器生成的代码大致为：(*(ptr->vptr)[slot])()。这就是C++运行时多态的底层机制。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **多态实现原理 / Polymorphism Implementation**

package "对象内存布局 / Object Memory Layout" {
  object "对象 obj" as OBJ #E8F5E9 {
    {field} vptr (隐藏) → 指向 vtable
    {field} 成员变量1
    {field} 成员变量2
  }
}

package "虚函数表 / vtable" {
  class "Base vtable" as BASE_VTBL #E3F2FD {
    + slot[0]: Base::func1()
    + slot[1]: Base::func2()
  }
  
  class "Derived vtable" as DERIVED_VTBL #E3F2FD {
    + slot[0]: Derived::func1() ← 重写
    + slot[1]: Base::func2()
  }
}

package "动态绑定过程 / Dynamic Binding" {
  actor "调用者" as CALLER #FFF3E0
  participant "Base* ptr" as PTR #FCE4EC
  participant "vptr 查找" as VLOOKUP #EAF5FF
  participant "vtable 派发" as VDISPATCH #EAF5FF
  participant "实际函数" as FUNC #F8F8F8
}

== 动态绑定流程 ==

CALLER -> PTR : ptr->virtualFunc()
PTR -> VLOOKUP : 通过 vptr 找到 vtable
VLOOKUP -> VDISPATCH : 查找 slot[index]
VDISPATCH -> FUNC : 跳转到函数地址
FUNC --> CALLER : 执行实际函数

legend center
| 概念 | 说明 |
|------|------|
| vptr | 对象中的隐藏指针，指向 vtable |
| vtable | 类级别的函数指针数组 |
| slot | vtable 中每个虚函数的索引 |
| 动态绑定 | 运行时通过 vptr 查找实际函数 |
endlegend

@enduml
```

---

### 怎么解决菱形继承 / Diamond Inheritance Problem

**Principle:**
Diamond inheritance occurs when class A is base, B and C inherit from A, and D inherits from both B and C, creating two copies of A's members. **Virtual inheritance** using the `virtual` keyword ensures the common base class has only **one shared instance**.

**中文:**

**菱形继承**是多继承时出现的一种结构问题。假设类A是基类，B和C都继承自A，D同时继承自B和C。这种继承结构会导致D对象中存在**两份A的成员**，造成数据冗余和二义性问题。

**虚继承**是C++解决菱形继承问题的标准方案。通过在继承时使用`virtual`关键字，可以确保公共基类A在派生类D中只有**一份共享的实例**。虚继承的语法是`class B : virtual public A`。

虚继承的原理是：编译器为虚继承的类创建**虚基类表（vbptr）**，每个虚继承的子类对象包含一个指向虚基类表的指针。虚基类表记录了从当前子类到虚基类的偏移量。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **菱形继承与虚继承 / Diamond Inheritance & Virtual Inheritance**

package "菱形继承问题 (有歧义)" {
  class "A" as A1 #FFCCCC {
    + int data
  }
  
  class "B" as B1 #FFCCCC {
  }
  
  class "C" as C1 #FFCCCC {
  }
  
  class "D" as D1 #FFCCCC {
  }
  
  A1 <|-- B1
  A1 <|-- C1
  B1 <|-- D1
  C1 <|-- D1
}

package "虚继承解决方案 (唯一实例)" {
  class "A" as A2 #E8F5E9 {
    + int data (唯一)
  }
  
  class "B" as B2 #E8F5E9 {
    + vbptr → 虚基类表
  }
  
  class "C" as C2 #E8F5E9 {
    + vbptr → 虚基类表
  }
  
  class "D" as D2 #E8F5E9 {
    + 共享 A 实例
  }
  
  A2 <|.. B2 : <<virtual>>
  A2 <|.. C2 : <<virtual>>
  B2 <|-- D2
  C2 <|-- D2
}

legend right
| 问题 | 解决方案 |
|------|---------|
| 两份 A 实例 | 虚继承 → 一份共享实例 |
| 访问歧义 | vbptr 间接寻址 |
| 额外开销 | vbptr 指针 + 偏移量计算 |
endlegend

@enduml
```

---

### 关键字 override, final 的作用 / override and final Keywords

**Principle:**
**override** (C++11) explicitly marks a derived class function as overriding a base class virtual function. The compiler checks if the function actually overrides; if not, it produces an error. **final** (C++11) restricts inheritance or overriding.

**中文:**

**override** 是C++11引入的关键字，用于显式标识派生类的成员函数是对基类虚函数的重写。当在派生类函数后添加`override`说明符时，编译器会检查该函数是否确实重写了基类中的某个虚函数。如果没有匹配的重写，编译器会报错。这大大提高了代码的安全性和可读性。

**final** 是C++11引入的另一个关键字，它可以用于限制类或虚函数的重写/继承。如果将final用于类，则该类不能被继承；如果将final用于虚函数，则该函数不能在派生类中被重写。final提供了更强的设计控制，帮助程序员明确表达设计意图。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **override 与 final / override and final Keywords**

package "override 使用示例" {
  class "Base" as BASE #E8F5E9 {
    + virtual void func(int)
  }
  
  class "Derived" as DERIVED #E3F2FD {
    + void func(int) override ✅
    + void func(double) override ❌
      → 编译错误！签名不匹配
  }
  
  BASE <|-- DERIVED
}

package "final 使用示例" {
  class "Base" as BASE2 #FFF3E0 {
    + virtual void run()
  }
  
  class "Middle" as MID #FCE4EC {
    + void run() final ❌
      → 不能再被重写
  }
  
  class "Child" as CHILD #EAF5FF {
    + void run() 
      → 编译错误！run() 已 final
  }
  
  BASE2 <|-- MID
  MID <|-- CHILD
}

package "final 类示例" {
  class "FinalClass" as FINAL #E8F5E9 {
    + class FinalClass final
  }
  
  class "TryInherit" as TRY #FFCCCC {
    + class TryInherit : public FinalClass
      → 编译错误！FinalClass 不可继承
  }
  
  FINAL <|-- TRY
}

legend center
| 关键字 | 作用 | 效果 |
|--------|------|------|
| override | 检查重写 | 签名不匹配则编译错误 |
| final | 禁止重写 | 阻止派生类重写该函数 |
| final (类) | 禁止继承 | 阻止其他类继承此类 |
endlegend

@enduml
```

---

### C++ 类型推导用法 / C++ Type Deduction

**Principle:**
**auto** (C++11) deduces variable type from initializer, ignoring references and cv-qualifiers. **decltype** (C++11) deduces type from expressions, preserving references and cv-qualifiers. **decltype(auto)** (C++14) combines both.

**中文:**

C++ 提供了三种主要的类型推导机制：**auto**、**decltype** 和模板类型推导。

**auto** 是C++11引入的自动类型推导关键字。编译器根据初始化表达式推断变量类型。重要规则：auto会**忽略引用和cv限定符**（const/volatile）。例如`auto&`才能推导为引用类型。auto不能用于函数参数声明，不能用于非静态成员变量。

**decltype** 是C++11引入的表达式类型推导机制。它根据表达式推断类型，但**不会执行表达式**（编译时完成）。关键区别于auto的是，decltype会**完整保留引用和cv限定符**。

**decltype(auto)** 是C++14引入的语法，结合两者优点——用decltype规则推断类型，但保持auto的语法形式。最重要的特性是**保留表达式的引用语义**，在完美转发场景中非常有用。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **C++ 类型推导机制 / C++ Type Deduction**

actor "开发者" as DEV #EAF5FF
participant "auto\n(C++11)" as AUTO #E8F5E9
participant "decltype\n(C++11)" as DECLTYPE #E3F2FD
participant "decltype(auto)\n(C++14)" as DDA #FFF3E0

== auto 类型推导 ==

DEV -> AUTO : auto x = expr
note right of AUTO
  **auto 规则:**
  ❌ 忽略引用
  ❌ 忽略 cv 限定符
end note
AUTO --> DEV : T (值类型)

DEV -> AUTO : auto& rx = expr
note right of AUTO
  **auto& 规则:**
  ✅ 保留引用
  ✅ 保留 cv 限定符
end note

== decltype 类型推导 ==

DEV -> DECLTYPE : decltype(expr)
note right of DECLTYPE
  **decltype 规则:**
  ✅ 保留引用
  ✅ 保留 cv 限定符
  1️⃣ 变量名 → 变量类型
  2️⃣ 变量(括号) → 引用
  3️⃣ 其他 → 结果类型
end note

== decltype(auto) ==

DEV -> DDA : decltype(auto) x = expr
note right of DDA
  **decltype(auto):**
  ✅ decltype 推断规则
  ✅ auto 语法形式
  ✅ 保留引用语义
  用于完美转发
end note

legend center
| 机制 | 保留引用 | 保留 cv | 典型用途 |
|------|---------|--------|---------|
| auto | ❌ | ❌ | 简化代码 |
| decltype | ✅ | ✅ | 获取表达式类型 |
| decltype(auto) | ✅ | ✅ | 完美转发 |
endlegend

@enduml
```

---

### function, lambda, bind 之间的关系 / Relationship Between function, lambda, bind

**Principle:**
**std::function** is a type-erased wrapper storing any callable matching a signature. **Lambda** (C++11) creates anonymous callables at compile time with zero-cost abstraction for uncaptured lambdas. **std::bind** (C++11) creates function objects with pre-bound arguments.

**中文:**

`std::function`、`lambda`表达式和`std::bind`是C++中三种重要的可调用对象机制。

**std::function** 是**类型擦除的包装器**，可以存储、复制和调用任何符合指定函数签名的可调用对象。类型擦除意味着它隐藏了具体类型，只保留统一接口。但类型擦除有代价：对于有捕获的lambda需要堆分配，以及虚函数调用的运行时开销。

**lambda** 是C++11引入的**匿名可调用对象**创建语法。编译时生成闭包类，实例化闭包对象。其优势是**零成本抽象**——无捕获时（`[]`）可转为函数指针，无额外开销。

**std::bind** 是C++11的**函数适配器**，创建预绑定部分参数的函数对象。主要用于将成员函数转为可调用对象，或绑定自由函数的部分参数。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **function, lambda, bind 关系 / function, lambda, bind Relationship**

package "可调用对象 / Callable Objects" {
  class "普通函数\nvoid f(int)" as FUNC #E8F5E9
  class "Lambda\n[capture](args){body}" as LAMBDA #E3F2FD
  class "Bind 结果\nbind(fn, args)" as BIND #FFF3E0
  class "函数对象\nclass Operator()" as FUNCTOR #FCE4EC
  class "成员函数" as MEMFUNC #EAF5FF
}

package "std::function (类型擦除包装器)" {
  class "std::function<R(Args...)>\n统一接口" as FUNCTION #FEFEFE
  
  note right of FUNCTION
    **特性:**
    ✅ 存储任意可调用对象
    ❌ 类型擦除开销
    ❌ 堆分配 (有捕获)
    ❌ 虚函数调用
  end note
}

FUNC --> FUNCTION : 可存储
LAMBDA --> FUNCTION : 可存储
BIND --> FUNCTION : 可存储
FUNCTOR --> FUNCTION : 可存储
MEMFUNC --> FUNCTION : 可存储

LAMBDA --> FUNC : 无捕获时\n转函数指针
note right of LAMBDA
  **Lambda 优势:**
  ✅ 零成本抽象
  ✅ 语法简洁
end note

BIND ..> LAMBDA : 可用 lambda 替代
note left of BIND
  **bind 特点:**
  ⚠️ C++11 引入
  ⚠️ 语法较复杂
end note

legend center
| 类型 | 存储开销 | 调用开销 | 灵活性 |
|------|---------|---------|--------|
| 函数指针 | 无 | 最低 | 低 |
| lambda (无捕获) | 无 | 低 | 中 |
| std::function | 有 | 中 | 高 |
endlegend

@enduml
```

---

### 继承下的构造函数和析构函数执行顺序 / Constructor and Destructor Execution Order

**Principle:**
**Constructor order**: Base → Member objects → Derived. **Destructor order**: Derived → Member objects → Base (reverse of construction). During base construction, virtual function calls don't reach derived overrides.

**中文:**

**构造函数的执行顺序**：当创建派生类对象时，构造顺序是**基类→成员对象→派生类**。首先执行基类的构造函数，然后执行成员对象的构造函数，最后执行派生类自己的构造函数。

**析构函数的执行顺序**：与构造顺序**完全相反**——**派生类→成员对象→基类**。这个逆序确保了派生类的资源在其基类之前被释放。

**虚函数调用问题**：在构造函数和析构函数中调用虚函数不会实现运行时多态。因为在基类构造期间，派生类部分还未初始化，此时对象实际是基类类型。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **构造/析构函数执行顺序 / Constructor/Destructor Order**

actor "派生类对象创建" as CREATE #EAF5FF
actor "派生类对象销毁" as DESTROY #FFCCCC

participant "基类 (Base)" as BASE #E8F5E9
participant "成员对象 (Members)" as MEMBER #E3F2FD
participant "派生类 (Derived)" as DERIVED #FFF3E0

== 构造顺序 / Construction Order ==

CREATE -> BASE : 1️⃣ 执行基类构造函数
note right of BASE
  初始化基类成员
end note

BASE -> MEMBER : 2️⃣ 执行成员构造函数
note right of MEMBER
  按声明顺序构造
end note

MEMBER -> DERIVED : 3️⃣ 执行派生类构造函数
note right of DERIVED
  初始化派生类成员
end note

DERIVED --> CREATE : 对象创建完成

== 析构顺序 / Destruction Order ==

DESTROY -> DERIVED : 1️⃣ 执行派生类析构函数
note left of DERIVED
  清理派生类资源
end note

DERIVED -> MEMBER : 2️⃣ 执行成员析构函数
note left of MEMBER
  逆序销毁
end note

MEMBER -> BASE : 3️⃣ 执行基类析构函数
note left of BASE
  最后清理基类
end note

BASE --> DESTROY : 对象销毁完成

legend center
| 阶段 | 构造函数顺序 | 析构函数顺序 |
|------|-------------|-------------|
| 1 | 基类 | 派生类 |
| 2 | 成员对象 | 成员对象 |
| 3 | 派生类 | 基类 |
endlegend

@enduml
```

---

### 虚函数表和虚函数表指针的创建时机 / vtable and vptr Creation Timing

**Principle:**
**vtable creation**: At **compile time**, per-class, storing virtual function addresses. **vptr initialization**: During **object construction**, set to point to current class's vtable. In multiple inheritance, multiple vptrs exist—one per direct base class.

**中文:**

**vtable的创建时机**：虚函数表在**编译时**创建，属于类而不是对象。每个包含虚函数的类在编译阶段都会生成一个唯一的vtable，存储该类所有虚函数的地址。

**vptr的创建时机**：虚函数表指针在**对象构造过程中**初始化。在基类的构造函数中，vptr被设置为指向基类的vtable；在派生类的构造函数开始执行前，vptr被更新为指向派生类的vtable。

**多重继承与多个vptr**：在多重继承情况下，每个直接基类都可能有自己独立的vptr。派生类对象会包含多个vptr，指向各自的vtable。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **vtable 与 vptr 创建时机 / vtable & vptr Creation Timing**

package "编译时 / Compile Time" {
  class "Base 类" as BASE_CLASS #E8F5E9 {
    + virtual void func1()
    + virtual void func2()
  }
  
  class "Derived 类" as DERIVED_CLASS #E3F2FD {
    + virtual void func1() ← 重写
    + virtual void func2()
    + virtual void func3() ← 新增
  }
  
  note right of BASE_CLASS
    **Base vtable:**
    slot[0] → Base::func1
    slot[1] → Base::func2
  end note
  
  note right of DERIVED_CLASS
    **Derived vtable:**
    slot[0] → Derived::func1
    slot[1] → Base::func2
    slot[2] → Derived::func3
  end note
}

package "运行时 - 构造过程中 / Runtime - During Construction" {
  actor "派生类对象构造" as CTOR #FFF3E0
  participant "vptr (初始)" as VPTR1 #FCE4EC
  participant "vptr (更新后)" as VPTR2 #FCE4EC
  
  CTOR -> VPTR1 : 基类构造阶段
  note left of VPTR1
    vptr → Base vtable
    调用虚函数 → Base 版本
  end note
  
  CTOR -> VPTR2 : 派生类构造阶段
  note left of VPTR2
    vptr → Derived vtable
    调用虚函数 → Derived 版本
  end note
}

package "多重继承情况" {
  class "Derived 多继承" as MULTI #EAF5FF {
    + vptr_A → A vtable
    + vptr_B → B vtable
  }
  
  note bottom of MULTI
    **每个直接基类一个 vptr**
    指向各自的 vtable
  end note
}

legend center
| 阶段 | vptr 状态 | 虚函数调用目标 |
|------|----------|--------------|
| 编译时 | 不存在 | vtable 生成 |
| 基类构造 | → Base vtable | Base 版本 |
| 派生类构造 | → Derived vtable | Derived 版本 |
| 析构函数 | → 当前类 vtable | 当前类版本 |
endlegend

@enduml
```

---

### 虚析构函数的作用 / Virtual Destructor Purpose

**Principle:**
**Virtual destructors** ensure proper cleanup when deleting derived objects through base pointers. If ~Base() is non-virtual, only ~Base() executes, leaking derived resources. Making the destructor virtual enables the full destruction chain through vtable dispatch.

**中文:**

虚析构函数是C++面向对象编程中确保资源正确释放的关键机制。

**问题场景**：当通过基类指针删除派生类对象时，如果基类的析构函数不是虚函数，只会调用基类的析构函数，派生类特有的资源将不会被释放，导致**内存泄漏**。例如，`Base* p = new Derived(); delete p;` 如果Base的析构函数非虚，则只会调用~Base()而不会调用~Derived()。

**虚析构函数原理**：将基类的析构函数声明为虚函数后，析构函数就进入了类的虚函数表。通过基类指针删除对象时，运行时通过vptr找到实际对象的vtable，调用派生类的析构函数。派生类的析构函数执行完后，会自动调用基类的析构函数，形成完整的析构链。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **虚析构函数作用 / Virtual Destructor Purpose**

package "非虚析构函数问题" {
  class "Base (非虚析构)" as BASE_NONVIRT #FFCCCC {
    + ~Base() ❌ 非虚
  }
  
  class "Derived" as DERIVED_NONVIRT #FFCCCC {
    + ~Derived()
    + 分配了资源
  }
  
  note bottom of BASE_NONVIRT
    **问题:**
    Base* p = new Derived();
    delete p; // 只调用 ~Base()
    // ~Derived() 不会被调用！
    // 内存泄漏
  end note
}

package "虚析构函数解决方案" {
  class "Base (虚析构)" as BASE_VIRT #E8F5E9 {
    + virtual ~Base() ✅
  }
  
  class "Derived" as DERIVED_VIRT #E8F5E9 {
    + ~Derived()
    + 释放资源
  }
  
  note bottom of BASE_VIRT
    **解决方案:**
    Base* p = new Derived();
    delete p; // 通过 vptr 调用
    // ~Derived() → ~Base()
    // 完整析构链！
  end note
}

package "删除对象时" {
  actor "delete p" as DELETE #FFF3E0
  participant "~Derived()" as DTOR_D #FCE4EC
  participant "~Base()" as DTOR_B #FCE4EC
  
  DELETE -> DTOR_D : 通过 vptr 找到
  DTOR_D -> DTOR_B : 自动调用
  DTOR_B --> DELETE : 资源全部释放
}

legend center
| 析构函数类型 | delete 基类指针 | 析构链 |
|-------------|-----------------|-------|
| 非虚 | 只调用基类析构 | ❌ 不完整 |
| 虚 | 先派生后基类 | ✅ 完整 |
endlegend

@enduml
```

---

### 智能指针种类以及使用场景 / Smart Pointer Types and Use Cases

**Principle:**
**std::unique_ptr** - exclusive ownership, auto-deletes on destruction, non-copyable but movable. **std::shared_ptr** - shared ownership via reference counting. **std::weak_ptr** - non-owning observer of shared_ptr, solves circular reference problems.

**中文:**

C++11 引入了三种智能指针来自动管理动态内存：`std::unique_ptr`、`std::shared_ptr` 和 `std::weak_ptr`。

**std::unique_ptr** 是独占所有权的智能指针，同一时刻只能有一个 unique_ptr 拥有对象。当 unique_ptr 被销毁时，它所管理的对象也会被自动删除。unique_ptr 不能复制但可以移动。适用于单独拥有对象、不需要共享的场景。

**std::shared_ptr** 是共享所有权的智能指针，通过引用计数来管理对象。多个 shared_ptr 可以共享同一个对象的所有权，当最后一个 shared_ptr 被销毁时，对象才会被删除。适用于需要多个所有者共享对象的场景。

**std::weak_ptr** 是 shared_ptr 的观察者，不参与引用计数。它主要用于解决 shared_ptr 的循环引用问题。适用于观察 shared_ptr 的对象但不拥有它。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **智能指针种类 / Smart Pointer Types**

package "unique_ptr (独占所有权)" {
  class "unique_ptr<T>" as UNIQUE #E8F5E9 {
    + T* ptr
    + 独占对象
  }
  
  note bottom of UNIQUE
    **特点:**
    ✅ 独占所有权
    ✅ 自动释放
    ✅ 无引用计数开销
    ❌ 不可复制
    ✅ 可移动
  end note
  
  UNIQUE -> [T] : 拥有
}

package "shared_ptr (共享所有权)" {
  class "shared_ptr<T>" as SHARED1 #E3F2FD {
    + T* ptr
    + 控制块 (ref count)
  }
  
  class "shared_ptr<T>" as SHARED2 #E3F2FD {
    + T* ptr
    + 控制块 (ref count)
  }
  
  class "T 对象" as TOK #FFF3E0
  
  SHARED1 -> TOK : 共享所有权
  SHARED2 -> TOK : 共享所有权
  
  note bottom of SHARED1
    **特点:**
    ✅ 共享所有权
    ✅ 引用计数
    ❌ 引用计数开销
    ✅ 可复制
  end note
}

package "weak_ptr (观察者)" {
  class "weak_ptr<T>" as WEAK #FCE4EC {
    + 不参与引用计数
    + 观察 shared_ptr
  }
  
  class "shared_ptr<T>" as SHARED3 #E3F2FD
  class "T 对象" as TOBJ #FFF3E0
  
  WEAK --> SHARED3 : 观察
  SHARED3 --> TOBJ : 拥有
  
  note bottom of WEAK
    **特点:**
    ✅ 不参与引用计数
    ✅ 打破循环引用
    ⚠️ 需 lock() 转换为 shared_ptr
  end note
}

package "使用场景" {
  object "单独拥有对象" as USE1 #F8F8F8
  object "多个所有者" as USE2 #F8F8F8
  object "打破循环引用" as USE3 #F8F8F8
  
  USE1 ..> UNIQUE : unique_ptr
  USE2 ..> SHARED1 : shared_ptr
  USE3 ..> WEAK : weak_ptr
}

legend center
| 类型 | 所有权 | 复制 | 移动 | 引用计数 | 典型场景 |
|------|-------|------|------|---------|---------|
| unique_ptr | 独占 | ❌ | ✅ | 无 | 单所有者 |
| shared_ptr | 共享 | ✅ | ✅ | 有 | 多所有者 |
| weak_ptr | 无 | ✅ | ✅ | 无 | 观察者 |
endlegend

@enduml
```

---

### C++11 用过哪些特性 / C++11 Features

**Principle:**
**Key C++11 features**: Rvalue references and move semantics enable resource stealing from temporaries. auto and decltype provide type deduction. Lambda expressions create anonymous function objects. Smart pointers automate memory management. nullptr solves NULL ambiguity.

**中文:**

C++11 是 C++ 语言的一次重大革新，引入了大量新特性。

**右值引用与移动语义**：C++11 引入了右值引用（`T&&`）和移动构造函数、移动赋值运算符。移动语义允许"窃取"临时对象的资源，避免不必要的拷贝。`std::move()` 用于将左值转换为右值引用。

**auto 和 decltype**：`auto` 自动推导变量类型，`decltype` 推导表达式类型。`decltype(auto)` (C++14) 结合两者优点，用于完美转发返回值。

**lambda 表达式**：lambda 允许在需要的地方直接定义匿名函数对象。语法：`[capture](params) -> ret { body }`。lambda 实现了零成本抽象，无捕获时可转为函数指针。

**智能指针**：`std::unique_ptr`、`std::shared_ptr`、`std::weak_ptr`。

**其他重要特性**：范围 for 循环、`nullptr`、委托构造函数、override 和 final 关键字、`static_assert`、`std::thread` 等。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **C++11 核心特性 / C++11 Core Features**

package "语言核心 / Language Core" {
  class "右值引用\nT&&" as RREF #E8F5E9 {
    + 移动语义
    + 完美转发
    + std::move()
  }
  
  class "类型推导\nauto, decltype" as TYPE #E3F2FD {
    + 编译时类型推断
    + decltype(auto)
  }
  
  class "Lambda\n[capture](args){body}" as LAMBDA #FFF3E0 {
    + 匿名函数对象
    + 零成本抽象
  }
}

package "智能指针 / Smart Pointers" {
  class "unique_ptr\n独占所有权" as UNIQUE #FCE4EC
  class "shared_ptr\n共享所有权" as SHARED #FCE4EC
  class "weak_ptr\n观察者" as WEAK #FCE4EC
}

package "其他重要特性 / Other Features" {
  class "nullptr\n空指针" as NULLPTR #EAF5FF
  class "范围for\nfor(auto x : c)" as RANGEFOR #EAF5FF
  class "override/final\n控制继承" as OVERRIDE #EAF5FF
  class "default/delete\n特殊成员" as SPECMEM #EAF5FF
}

package "标准库增强 / Library" {
  class "std::thread\n线程" as THREAD #F8F8F8
  class "std::function\n函数包装" as FUNCTION #F8F8F8
  class "std::bind\n参数绑定" as BIND #F8F8F8
  class "容器增强\ninitializer_list" as CONTAINER #F8F8F8
}

legend center
| 类别 | 特性 | 解决的问题 |
|------|------|---------|
| 内存管理 | 智能指针 | 内存泄漏 |
| 性能 | 移动语义 | 不必要的拷贝 |
| 简洁性 | auto/lambda | 冗长代码 |
| 安全 | nullptr | NULL 二义性 |
| 设计 | override/final | 意外重写/继承 |
endlegend

@enduml
```

---

### 动态库与静态库的区别 / Dynamic vs Static Libraries

**Principle:**
**Static libraries** are linked at compile time—object code is copied into the executable. **Dynamic libraries** are loaded at runtime—only references are stored. Static libraries offer simpler deployment but less flexibility; dynamic libraries save memory through sharing.

**中文:**

**静态库（Static Library）**：在编译链接阶段，链接器将静态库中的目标代码直接复制到最终可执行文件中。文件扩展名为`.a`（Linux）或`.lib`（Windows）。优点：运行时无需额外依赖，部署简单。缺点：多个程序使用同一静态库会存在多份代码副本，更新库需要重新编译链接。

**动态库（Dynamic Library）**：在程序运行时加载，链接器仅在可执行文件中存储对动态库的引用。文件扩展名为`.so`（Linux）或`.dll`（Windows）。优点：多个程序共享同一份代码，可以独立更新库而无需重新编译主程序。缺点：运行时需要库文件存在。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **静态库 vs 动态库 / Static vs Dynamic Libraries**

package "静态链接 / Static Linking" {
  file "libxxx.a" as STATIC_LIB #E8F5E9
  file "main.o" as OBJ #E8F5E9
  file "program (可执行文件)" as EXEC_STATIC #E8F5E9
  
  STATIC_LIB --> EXEC_STATIC : 链接器复制
  OBJ --> EXEC_STATIC : 链接器合并
}

package "动态链接 / Dynamic Linking" {
  file "libxxx.so" as DYN_LIB #E3F2FD
  file "main.o" as OBJ_DYN #E3F2FD
  file "program" as EXEC_DYN #E3F2FD
  
  DYN_LIB ..> EXEC_DYN : 运行时加载\n(引用关系)
  OBJ_DYN --> EXEC_DYN : 链接器记录
}

package "运行时对比" {
  object "程序A" as PROG_A #FFF3E0
  object "程序B" as PROG_B #FFF3E0
  object "libxxx.so (共享)" as SHARED_LIB #FCE4EC
  
  PROG_A --> SHARED_LIB : 共享
  PROG_B --> SHARED_LIB : 共享
  
  note bottom of SHARED_LIB
    **动态库优点:**
    ✅ 内存共享
    ✅ 独立更新
    ❌ 需部署 .so 文件
  end note
}

legend center
| 特性 | 静态库 | 动态库 |
|------|-------|-------|
| 链接时机 | 编译时 | 运行时 |
| 代码存储 | 复制到可执行文件 | 独立文件 |
| 内存占用 | 多程序多副本 | 共享一份 |
| 更新维护 | 需重新编译 | 可独立更新 |
| 部署 | 简单 (自包含) | 需带库文件 |
endlegend

@enduml
```

---

### 左值引用与右值引用的区别 / Lvalue vs Rvalue References

**Principle:**
**Lvalue references** (`T&`) bind to persistent objects. **Rvalue references** (`T&&`, C++11) bind to temporaries, enabling move semantics—transferring resources instead of copying, significantly improving performance.

**中文:**

**左值引用（Lvalue Reference）**：使用单个 `&` 声明，必须绑定到一个有持久地址的对象。左值引用是 C++98 就有的语法，常见的如 `T&`、`const T&`。左值引用不能绑定到右值。

**右值引用（Rvalue Reference）**：使用双 `&&` 声明，C++11 引入。右值引用只能绑定到临时对象（即将被销毁的对象、没有名字的对象）。右值引用使得我们可以利用临时对象的资源，避免不必要的拷贝。

**移动语义**：传统的拷贝构造需要复制数据，而移动构造"窃取"源对象的资源，将源对象置于有效但可析构的状态。这就是移动语义提升性能的核心原因。

**完美转发**：`std::forward<T>()` 可以保持参数的左值/右值属性。`std::move()` 则无条件地将参数转换为右值引用。


**PlantUML Diagram:**

```plantuml
@startuml
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

title **左值引用 vs 右值引用 / Lvalue vs Rvalue References**

package "左值引用 / Lvalue Reference" {
  class "T&" as LREF #E8F5E9 {
    + 必须绑定左值
    + 持久存在的对象
    + 可读可写 (非const)
  }
  
  note bottom of LREF
    **左值特点:**
    ✅ 有持久地址
    ✅ 表达式结束后仍存在
    ✅ 可取地址 (&)
    示例: 变量、返回左值引用的函数
  end note
}

package "右值引用 / Rvalue Reference" {
  class "T&&" as RREF #E3F2FD {
    + 必须绑定右值
    + 临时对象 / 将销毁的对象
    + 可"窃取"其资源
  }
  
  note bottom of RREF
    **右值特点:**
    ✅ 无持久地址
    ✅ 表达式结束即销毁
    ❌ 不可取地址
    示例: 函数返回值、表达式结果
  end note
}

package "移动语义 / Move Semantics" {
  class "拷贝构造\nCopy Constructor" as COPY #FFF3E0 {
    + 深拷贝数据
    + 分配新内存
    + 开销大
  }
  
  class "移动构造\nMove Constructor" as MOVE #FCE4EC {
    + 转移指针所有权
    + 不分配新内存
    + 开销小
  }
  
  note bottom of MOVE
    **移动语义优势:**
    ✅ 零拷贝转移大数据
    ✅ 源对象置于可析构状态
    ✅ 对 unique_ptr 尤为重要
  end note
}

package "std::move vs std::forward" {
  object "std::move(x)\n无条件转右值" as MOVE_FUNC #EAF5FF
  object "std::forward<T>()\n保持属性转发" as FWD_FUNC #EAF5FF
}

legend center
| 引用类型 | 语法 | 绑定对象 | 典型用途 |
|---------|------|---------|---------|
| 左值引用 | T& | 左值 | 修改对象、避免拷贝 |
| 右值引用 | T&& | 右值 | 移动语义、窃取资源 |
| const T& | const T& | 左值或右值 | 泛型参数、只读访问 |
endlegend

@enduml
```

---

## Design Patterns, Common Interview Questions
**English Translation**: The five SOLID principles are: Single Responsibility (one class, one purpose), Open/Closed (open for extension, closed for modification), Liskov Substitution (subclasses replaceable for base classes), Interface Segregation (many specific interfaces vs one general), and Dependency Inversion (depend on abstractions, not concretions).

**中文:**
*   **面对对象中有哪些设计原则**
1. **单一职责原则（SRP）**：一个类只负责一项职责，避免职责混杂导致耦合度过高。

2. **开闭原则（OCP）**：对扩展开放，对修改关闭。通过抽象化实现，依赖抽象而非具体实现。

3. **里氏替换原则（LSP）**：子类必须能够替换其基类，is-a关系成立，保证继承的正确性。

4. **接口隔离原则（ISP）**：使用多个专门的接口，而不是单一臃肿接口，降低耦合度。

5. **依赖倒置原则（DIP）**：高层模块不应依赖低层模块，两者都应依赖抽象。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "SOLID Principles" {
  class "SRP\n单一职责" as SRP #E8F5E9
  class "OCP\n开闭原则" as OCP #E3F2FD
  class "LSP\n里氏替换" as LSP #FFF3E0
  class "ISP\n接口隔离" as ISP #FCE4EC
  class "DIP\n依赖倒置" as DIP #F3E5F5

  SRP -[hidden]down-> OCP
  LSP -[hidden]down-> ISP
  OCP -[hidden]right-> LSP
  ISP -[hidden]right-> DIP
}

note right of SRP
  一个类只做一件事
  提高内聚、降低耦合
end note

note right of OCP
  扩展优于修改
  抽象化是关键
end note

note right of LSP
  子类is-a父类
  可替换性保证正确性
end note

note right of ISP
  专用接口优于通用
  减少不必要的依赖
end note

note right of DIP
  依赖抽象层
  高层不依赖低层
end note
@enduml
```
**English Translation**: Open/Closed Principle states that software entities should be open for extension but closed for modification. OCP is the ultimate goal of OO design. LSP enables OCP by ensuring proper inheritance hierarchies. ISP supports OCP by providing fine-grained interfaces. DIP is the key means to achieve OCP by depending on abstractions.

**中文:**

---

*   **简述开闭原则，哪些原则与它相关，分别是什么关系？**

**开闭原则（OCP）**：对扩展开放，对修改关闭。软件实体应通过扩展实现变化，而不是修改已有代码。这是最核心的面向对象设计原则，是所有模式的最终目标。

**与开闭原则相关的原则**：
1. **里氏替换原则（LSP）** 是开闭原则的基础：只有当子类可以替换基类且不影响程序运行时，才能通过继承扩展功能。LSP保证继承体系的正确性，是OCP的**使能器**。

2. **接口隔离原则（ISP）** 帮助实现OCP：通过细粒度接口，解耦不必要的依赖，使得扩展时修改范围最小化。

3. **依赖倒置原则（DIP）** 是OCP的关键手段：依赖抽象而非具体，当需求变化时，只需实现新的抽象具体类，无需修改高层逻辑。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **开闭原则(OCP) 与相关原则关系**

rectangle "开闭原则 OCP\n目标：扩展优于修改" as OCP #E3F2FD

rectangle "里氏替换 LSP\n使能器：继承体系正确性" as LSP #FFF3E0
rectangle "接口隔离 ISP\n支持：细粒度接口解耦" as ISP #FCE4EC
rectangle "依赖倒置 DIP\n手段：依赖抽象" as DIP #F3E5F5

OCP <-[dashed]-> LSP : 基础关系
OCP <-[dashed]-> ISP : 支撑关系
OCP <-[dashed]-> DIP : 实现手段

note bottom of OCP
  OCP是目标
  LSP/ISP/DIP是实现OCP的途径
end note
@enduml
```
**English Translation**: Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Subtypes must be substitutable for their base types. The key is proper "is-a" relationship.

**中文:**

---

*   **什么是里氏替换原则**

**里氏替换原则（LSP）**：子类型必须能够替换其基类型，而不改变程序的正确性。简言之，所有使用基类的地方，必然能透明地使用子类对象。核心是"is-a"关系的正确性：子类不是父类的子集，就是父类的扩展。

**违反LSP的典型场景**：
- 子类重写方法后行为与父类期望不一致
- 子类方法前置条件比父类更宽松，后置条件更严格
- 子类新增方法导致父类使用者产生困惑


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

class "Bird (基类)" as Bird #E3F2FD
class "Penguin (企鹅)" as Penguin #FFECB3
class "Sparrow (麻雀)" as Sparrow #C8E6C9

Bird <|-- Penguin
Bird <|-- Sparrow

Bird : +fly() // 父类方法
Sparrow : +fly() // 正常扩展

note right of Penguin
  企鹅继承Bird
  但不能飞（行为改变）
  违反LSP！
end note

note right of Sparrow
  麻雀会飞
  正常继承fly()
end note

note right of Bird
  LSP: 所有使用Bird的地方
  必须能用Penguin/Sparrow替换
end note
@enduml
```
**English Translation**: Law of Demeter (Principle of Least Knowledge) states that an object should only interact with its direct friends - objects that are members, parameters, or created locally. It reduces coupling between components.

**中文:**

---

*   **什么是迪米特原则**

**迪米特原则（LoD）/ 最少知识原则**：一个对象应当对其他对象有尽可能少的了解，只与直接的朋友通信。"朋友"指当前对象的成员变量、输入参数、返回值中出现的对象。降低类之间的耦合，提高模块独立性。

**核心要求**：
- 只调用当前对象的成员
- 只调用传入方法参数的对象
- 不在方法内部创建陌生类实例
- 不暴露其他对象的内部结构


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

class "Client" as Client #E3F2FD
class "Teacher" as Teacher #C8E6C9
class "Student" as Student #FFF3E0
class "Printer" as Printer #FCE4EC

Client -> Teacher
Teacher -> Student
Student -> Printer

note right of Client
  Client只认识Teacher
  不需要知道Printer存在
end note

note right of Teacher
  Teacher只调用Student方法
  不直接操作Printer
end note

note as N1
  **迪米特原则示例**
  Teacher调用Student.printHomework()
  而非Teacher.getStudent().getPrinter().print()
  只与直接朋友Student通信
end note
@enduml
```
**English Translation**: Dependency Inversion Principle states that high-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

**中文:**

---

*   **什么是依赖倒置原则**

**依赖倒置原则（DIP）**：高层模块不应依赖低层模块，两者都应依赖抽象。抽象不应依赖细节，细节应依赖抽象。核心是"面向接口编程"，通过抽象解耦具体实现。

**实现方式**：
- 模块间通过抽象接口交互
- 变量声明使用抽象类型（接口或抽象类）
- 构造函数注入依赖（Dependency Injection）
- 使用工厂模式或IoC容器管理依赖


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

interface "ICar (抽象)" as ICar #E3F2FD
class "BMW (具体)" as BMW #C8E6C9
class "Benz (具体)" as Benz #FFF3E0
class "Driver (高层)" as Driver #FCE4EC

Driver --> ICar
ICar <|.. BMW
ICar <|.. Benz

note right of Driver
  Driver依赖ICar抽象
  不依赖BMW或Benz
end note

note right of ICar
  抽象不依赖细节
  细节(BMW/Benz)依赖抽象
end note

note as N1
  **依赖倒置示例**
  Driver.drive(ICar* car)
  传入任何ICar实现都可以
end note
@enduml
```
    static Singleton* getInstance() {
        if (instance == nullptr) {  // 第一次检查
            lock();
            if (instance == nullptr) {  // 第二次检查
                instance = new Singleton();
            }
            unlock();
        }
        return instance;
    }
private:
    static volatile Singleton* instance;
};

// Meyers单例（最推荐）
class Singleton {
public:
    static Singleton& getInstance() {
        static Singleton instance;  // C++11线程安全
        return instance;
    }
};
```

**English Translation**: Singleton pattern ensures a class has only one instance with global access. Thread safety is critical. Double-checked locking uses volatile and double checking. Meyers singleton leverages static local variable thread safety (C++11+).

**中文:**

---

*   **单例模式多线程？**

**单例模式**：保证一个类仅有一个实例，并提供一个全局访问点。线程安全问题至关重要——多线程环境下可能创建多个实例。

**饿汉式（线程安全）**：类加载时直接创建实例，缺点是可能造成资源浪费。

**懒汉式（线程不安全）**：延迟加载，但多线程下会创建多个实例。

**双重检查锁定（线程安全）**：在加锁前后都检查实例是否为空，兼顾性能和线程安全。volatile关键词防止指令重排。

**Meyers单例（推荐）**：利用静态局部变量特性（C++11后线程安全），代码最简洁。

```cpp
// 双重检查锁定
class Singleton {
public:

**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

class "Singleton" as S #E3F2FD
class "双重检查锁定" as DCL #C8E6C9
class "Meyers单例" as Meyers #FFF3E0

S <|-- DCL
S <|-- Meyers

note right of DCL
  第一次检查：无锁快速判断
  加锁：保证创建过程原子
  第二次检查：防止重复创建
end note

note right of Meyers
  静态局部变量
  C++11后线程安全
  局部变量初始化线程安全
end note
@enduml
```
**English Translation**: Factory Method defines an interface for creating objects, letting subclasses decide. Abstract Factory provides an interface for creating families of related objects without specifying concrete classes.

**中文:**

**应用场景**：配置管理类、日志类、数据库连接池、线程池等全局唯一资源。

---

*   **什么是工厂模式？什么是抽象工厂？应用场景是什么？**

**工厂模式（Factory Method）**：定义创建对象的接口，让子类决定实例化哪个类。将对象创建与使用解耦。

**抽象工厂（Abstract Factory）**：提供一个创建一系列相关对象的接口，而无需指定具体类。适用于产品族场景。

**核心区别**：
| 工厂方法 | 抽象工厂 |
|---------|---------|
| 一个产品等级 | 多个产品等级 |
| 一个工厂创建一种产品 | 一个工厂创建一族产品 |
| 扩展产品 | 扩展产品族 |


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

interface "Factory" as F #E3F2FD
interface "Product" as P #C8E6C9
class "ConcreteFactory" as CF #FFF3E0
class "ConcreteProduct" as CP #C8E6C9

F <|-- CF
P <|.. CP
CF --> P : creates

note right of F
  Factory Method
  创建单一产品
end note

package "Abstract Factory" {
  interface "AbstractFactory" as AF #FCE4EC
  interface "ProductA" as PA #E8F5E9
  interface "ProductB" as PB #E3F2FD
  class "ConcreteFactory1" as CF1 #FFF3E0
  class "ConcreteFactory2" as CF2 #FFECB3
  
  AF <|-- CF1
  AF <|-- CF2
  CF1 --> PA : creates A1
  CF1 --> PB : creates B1
  CF2 --> PA : creates A2
  CF2 --> PB : creates B2
}

note right of AF
  Abstract Factory
  创建产品族
end note
@enduml
```
**English Translation**: Proxy pattern provides a surrogate to control access to another object. Types include static, dynamic (JDK/CGLib), virtual (lazy loading), protection (access control), and remote proxy.

**中文:**

**应用场景**：
- 工厂方法：数据库Driver创建、日志器创建
- 抽象工厂：跨平台UI组件（Windows/Mac按钮+文本框+菜单）、游戏皮肤系统

---

*   **什么是代理模式？应用场景是什么？**

**代理模式（Proxy）**：为其他对象提供一种代理以控制对这个对象的访问。代理与原对象实现相同接口，客户端无感知。

**类型**：
- **静态代理**：编译时生成代理类，代码冗余
- **动态代理**：运行时生成（JDK Proxy/CGLib），更灵活
- **虚代理**：延迟加载大对象
- **保护代理**：权限控制
- **远程代理**：分布式对象访问


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

interface "Subject" as S #E3F2FD
class "RealSubject" as Real #C8E6C9
class "Proxy" as Proxy #FFF3E0

S <|.. Real
S <|.. Proxy
Proxy --> Real : 持有引用

note right of Proxy
  代理控制对RealSubject的访问
  可在访问前后做额外处理
end note

package "Proxy Types" {
  class "VirtualProxy\n(虚代理-延迟加载)" as VP #E8F5E9
  class "ProtectionProxy\n(保护代理-权限控制)" as PP #FCE4EC
  class "RemoteProxy\n(远程代理-RPC)" as RP #E3F2FD
}

note bottom of Proxy
  **应用场景**
  - 延迟加载：大图/大文件
  - 权限控制：API访问限制
  - 日志记录：方法调用审计
  - 缓存代理：减少重复计算
end note
@enduml
```
**English Translation**: Decorator pattern dynamically adds responsibilities to objects. Decorators implement the same interface as the wrapped object, providing flexible runtime composition instead of inheritance.

**中文:**

**应用场景**：延迟加载（图片懒加载）、远程调用（RPC）、安全代理（接口鉴权）、缓存代理。

---

*   **什么是装饰器模式？应用场景是什么？**

**装饰器模式（Decorator）**：动态地给对象添加额外职责，比继承更灵活。将功能组合替代继承，实现运行时装饰。

**核心思想**：装饰器与被装饰对象实现相同接口，装饰器持有被装饰对象引用，可在调用前后添加行为。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

interface "Component" as C #E3F2FD
class "ConcreteComponent" as CC #C8E6C9
class "Decorator" as D #FFF3E0
class "ConcreteDecoratorA" as CDA #E8F5E9
class "ConcreteDecoratorB" as CDB #FCE4EC

C <|.. CC
C <|.. D
D <|-- CDA
D <|-- CDB
D --> C : wraps

note right of D
  Decorator持有Component引用
  可在调用前后添加行为
end note

note bottom of C
  **应用场景**
  - Java I/O流：BufferedInputStream包装FileInputStream
  - UI装饰：边框、滚动条
  - 日志增强：加密、压缩
  - 收费系统：满减、折扣、积分叠加
end note
@enduml
```
**English Translation**: Composite pattern composes objects into tree structures to represent part-whole hierarchies. Clients can treat individual objects and compositions uniformly.

**中文:**

**应用场景**：
- Java I/O类库（Bufferedxxx包装原生流）
- UI组件装饰（窗口+边框+滚动条）
- Web请求/响应拦截器
- 电商促销叠加计算

---

*   **什么是组合模式，应用场景是什么？**

**组合模式（Composite）**：将对象组合成树形结构以表示"部分-整体"层次。客户端可以统一处理单个对象和组合对象。

**核心**：抽象组件声明通用操作，叶子节点和容器节点都实现它。容器节点可包含叶子或其他容器。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

abstract "Component" as C #E3F2FD
class "Leaf" as L #C8E6C9
class "Composite" as Comp #FFF3E0

C <|-- L
C <|-- Comp
Comp o-> C : children

note right of L
  Leaf: 叶子节点
  没有子节点
end note

note right of Comp
  Composite: 容器节点
  可包含Leaf和其他Composite
end note

note bottom of C
  **应用场景**
  - 文件系统：文件夹/文件
  - UI容器：窗口/面板/控件
  - 组织架构：部门/员工
  - XML/HTML DOM树
end note
@enduml
```
**English Translation**: Chain of Responsibility passes requests along a chain of handlers. Each handler decides to process the request or pass it to the next handler, decoupling sender and receiver.

**中文:**

**应用场景**：
- 文件系统（Folder与File统一操作）
- GUI容器（Window包含Panel，Panel包含Button）
- 组织架构系统（Company包含Department）
- 命令菜单（MenuItem和Menu组合）

---

*   **什么是责任链模式？应用场景是什么？**

**责任链模式（Chain of Responsibility）**：将请求沿着处理者链传递，直到有一个处理者处理它。发送者和接收者解耦。

**组成**：
- Handler（抽象处理者）：定义处理接口，持有后继者引用
- ConcreteHandler（具体处理者）：处理请求或传递给下家


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

abstract "Handler" as H #E3F2FD
class "HandlerA" as HA #C8E6C9
class "HandlerB" as HB #FFF3E0
class "HandlerC" as HC #E8F5E9

H <|-- HA
H <|-- HB
H <|-- HC
HA --> H : successor
HB --> H : successor
HC --> H : successor

note right of HA
  HandlerA处理请求
  或传递给HandlerB
end note

note bottom of H
  **应用场景**
  - Web中间件：认证→日志→限流→业务
  - Java过滤器链
  - 审批流程：组长→经理→总监
  - 事件捕获：冒泡与捕获
end note
@enduml
```
**English Translation**: Template Method defines the skeleton of an algorithm, deferring some steps to subclasses. The base class provides the algorithm structure, subclasses provide specific implementations.

**中文:**

**应用场景**：
- Web框架中间件（Express/Koa洋葱模型）
- Java Servlet Filter
- 审批流程系统
- 异常处理链

---

*   **什么是模板方法？应用场景是什么？**

**模板方法（Template Method）**：定义算法骨架，将某些步骤延迟到子类。基类负责算法结构，子类负责具体实现。

**核心**：在抽象类中定义final的模板方法，内调用的抽象方法由子类实现。

**Hook方法**：子类可覆盖的钩子方法，不强制但提供扩展点。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

abstract "AbstractClass" as AC #E3F2FD
class "ConcreteClassA" as CA #C8E6C9
class "ConcreteClassB" as CB #FFF3E0

AC <|-- CA
AC <|-- CB

note right of AC
  templateMethod() : final
  —————————————
  step1()
  step2()
  hook() // 可选覆盖
end note

note right of CA
  实现必要步骤
  可覆盖hook()
end note

note bottom of AC
  **应用场景**
  - 框架生命周期：init()→run()→destroy()
  - 排序算法骨架
  - 单元测试框架（setup→test→teardown）
  - 咖啡/茶冲泡流程
end note
@enduml
```
**English Translation**: Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategies are independent; clients can select different algorithms.

**中文:**

**应用场景**：
- Spring框架模板（JdbcTemplate、HibernateTemplate）
- JUnit测试框架（setUp→test→tearDown）
- 支付流程（验证→下单→支付→回调）
- 数据加工流程（读取→解析→处理→输出）

---

*   **什么是策略模式？应用场景是什么？**

**策略模式（Strategy）**：定义一系列算法，将每个算法封装起来，使它们可以互换。策略是独立的，客户端可选择不同算法。

**核心**：策略接口、具体策略实现、Context持有策略引用。

**与状态模式区别**：策略模式算法之间相互独立；状态模式状态之间相互关联。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

interface "Strategy" as S #E3F2FD
class "ConcreteStrategyA" as CSA #C8E6C9
class "ConcreteStrategyB" as CSB #FFF3E0
class "ConcreteStrategyC" as CSC #E8F5E9
class "Context" as C #FCE4EC

S <|.. CSA
S <|.. CSB
S <|.. CSC
C --> S : strategy

note right of C
  Context持有Strategy引用
  调用strategy.algorithm()
end note

note bottom of S
  **应用场景**
  - 排序算法切换：快排/归并/堆排
  - 支付方式：支付宝/微信/银行卡
  - 出行路线：驾车/公交/步行
  - 压缩算法：ZIP/RAR/7Z
end note
@enduml
```
**English Translation**: Observer pattern defines a one-to-many dependency between objects. When the subject's state changes, all its observers are notified automatically.

**中文:**

**应用场景**：
- 排序策略选择（根据数据量自动切换）
- 支付系统（支付宝/微信/信用卡）
- 出行规划（自驾/公交/骑行）
- 图像压缩算法选择

---

*   **什么是观察者模式？应用场景是什么？**

**观察者模式（Observer）**：定义对象间一对多依赖，当一个对象状态变化，所有依赖它的对象都会收到通知。

**组成**：
- Subject（主题/被观察者）：维护观察者列表，状态变化通知
- Observer（观察者）：定义更新接口

**推模型 vs 拉模型**：推模型主动推送数据；拉模型被动拉取数据。


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

class "Subject" as S #E3F2FD
interface "Observer" as O #C8E6C9
class "ConcreteSubject" as CS #FFF3E0
class "ConcreteObserverA" as COA #E8F5E9
class "ConcreteObserverB" as COB #FCE4EC

S <|-- CS
S --> O : observers
O <|.. COA
O <|.. COB

note right of S
  attach() / detach()
  notify() : 通知所有观察者
end note

note right of O
  update() : 接收通知
end note

note bottom of S
  **应用场景**
  - MVC架构：Model变化通知View
  - 事件系统：点击/键盘事件
  - 消息推送：新闻订阅
  - GUI更新：数据模型变化刷新界面
end note
@enduml
```

**应用场景**：
- MVC/MVVM架构（Model变化更新View）
- GUI事件系统（按钮点击监听）
- 消息订阅发布系统
- 股票行情推送
- 邮件/消息订阅通知

## Data Structures & Algorithms, Common Interview Questions

### 用两个栈实现队列 / Implement Queue with Two Stacks

**Principle:**
Use two stacks to simulate queue operations. Stack_in handles enqueue, stack_out handles dequeue. When stack_out is empty, transfer all elements from stack_in to stack_out (reversing order to achieve FIFO).

**中文:**

**核心思想：** 用两个栈 `stack_in` 和 `stack_out` 模拟队列操作。入口栈负责接收 push 操作，出口栈负责 pop 操作。当出口栈为空时，将入口栈所有元素依次弹出并压入出口栈，实现"先进先出"顺序。

**关键操作：**

- `push`：元素直接压入 `stack_in`，时间复杂度 **O(1)**
- `pop`：若 `stack_out` 不空，弹出栈顶；若为空，将 `stack_in` 所有元素倒入 `stack_out` 后再弹。均摊复杂度 **O(1)**
- `peek`：与 pop 类似，但只查看出口栈栈顶元素
- `empty`：两个栈都为空时队列为空

**复杂度分析：**

- 时间复杂度：push O(1)，pop 均摊 O(1)
- 空间复杂度：O(n)，n 为队列中元素个数




**PlantUML Diagram:**

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

### 包含min函数的栈 / Stack with Min Function

**Principle:**
Maintain an auxiliary stack that stores the minimum value at each level. When pushing, also push the current minimum to min_stack. When popping, pop from both stacks. The top of min_stack is always the current minimum.

**中文:**

**核心思想：** 使用主栈和辅助栈同步维护。主栈正常执行所有操作；辅助栈（名为 `min_stack`）同步压入当前最小值。**辅助栈栈顶永远保存当前栈中的最小元素**。

**关键操作：**

- `push(x)`：主栈正常压入；辅助栈压入 `min(x, 当前最小值)`
- `pop()`：两栈同时弹出
- `top()`：返回主栈栈顶
- `min()`：返回辅助栈栈顶

**复杂度分析：**

- 时间复杂度：所有操作均为 **O(1)**
- 空间复杂度：O(n)，最坏情况每个元素都需在辅助栈中存储




**PlantUML Diagram:**

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

### 队列的最大值 / Queue with Max

**Principle:**
Use a deque to store indices of elements in descending order of their values. The front of deque is always the index of current maximum. When pushing, remove all smaller elements from back. When popping, if the popped index equals deque front, remove it too.

**中文:**

**核心思想：** 维护一个双端队列（deque）作为辅助结构，存储可能成为最大值的元素下标。队列中所有元素按入队顺序排列，deque 队头始终是当前队列最大值的下标。

**关键操作：**

- `push_back(x)`：入队，同时从 deque 队尾移除所有小于 x 的元素（它们永无出头之日），将 x 下标加入 deque
- `pop_front()`：出队，若出队元素下标等于 deque 队头，则同步移除 deque 队头
- `max_value()`：返回 deque 队头对应的队列元素值

**复杂度分析：**

- 时间复杂度：均摊 O(1)，每个元素最多被 push 和 pop 一次
- 空间复杂度：O(n)




**PlantUML Diagram:**

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

### 用一个栈实现另一个栈的排序 / Sort Stack Using Single Auxiliary Stack

**Principle:**
Use one auxiliary stack. Pop from input stack, if auxiliary is empty or top <= popped element, push to auxiliary. Otherwise, pop from auxiliary back to input until the condition is met. Auxiliary stack maintains descending order.

**中文:**

**核心思想：** 借助一个辅助栈，每次从原栈弹出栈顶元素，将其与辅助栈栈顶比较。若辅助栈为空或栈顶元素小于等于弹出元素，则直接压入；否则将辅助栈栈顶元素逐个弹回原栈，直到可以放入弹出元素。

**核心不变性：** 辅助栈从栈底到栈顶始终是**降序排列**的。

**复杂度分析：**

- 时间复杂度：最坏 O(n²)，每个元素最多被 push/pop 2n 次
- 空间复杂度：O(n)




**PlantUML Diagram:**

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

### 仅用递归和栈操作逆序一个栈 / Reverse Stack Using Recursion Only

**Principle:**
Use recursion to reverse. `getAndRemoveBottom()` recursively pops all elements until stack is empty, then returns the bottom element. `reverseStack()` first reverses the stack recursively, then uses `insertBottom()` to place each element at bottom.

**中文:**

**核心思想：** 递归函数 `reverseStack()` 完成两件事：
1. 递归将栈中除栈底元素外的所有元素逆序（通过递归调用自己）
2. 将栈底元素移到栈顶（通过另一个递归函数 `insertBottom()`）

**关键函数：**

- `getAndRemoveBottom(stack)`：递归弹出并返回栈底元素，同时逆序恢复其他元素
- `reverseStack(stack)`：递归逆序整个栈

**复杂度分析：**

- 时间复杂度：O(n²)，每个元素被递归处理多次
- 空间复杂度：O(n)，递归栈深度




**PlantUML Diagram:**

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

### 链表中倒数第 k 个节点 / Kth Node from End

**Principle:**
Use two pointers. Move fast pointer k steps ahead first. Then move both pointers together until fast reaches the end. Slow pointer is now at the kth node from the end.

**中文:**

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




**PlantUML Diagram:**

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

### 链表中环的入口节点 / Linked List Cycle Entry

**Principle:**
Floyd's cycle detection. First use slow and fast pointers to detect if cycle exists. If they meet, reset slow to head and move both pointers one step at a time. Meeting point is cycle entry.

**中文:**

**核心思想：Floyd 判圈算法**

- 第一步（判断是否有环）：快指针 `fast` 每次走两步，慢指针 `slow` 每次走一步。若存在环，两者必相遇。
- 第二步（找环入口）：相遇后，将 slow 重新指向 head，然后 fast 和 slow 同时每次走一步，再次相遇点即为环入口。

**数学证明：** 设环前长度为 a，环长度为 b。相遇时 slow 走了 a+x，fast 走了 a+x+k*b。fast 速度是 slow 两倍，所以 2(a+x) = a+x+k*b → a+x = k*b → a = (k-1)*b + (b-x)。即从 head 走到环入口的距离 a，等于从相遇点继续走到环入口的距离。

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)




**PlantUML Diagram:**

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

### 反转链表 / Reverse Linked List

**Principle:**
Iterative: Use three pointers to reverse links in place. Save next, point current.next to prev, advance prev and curr. Recursive: Reverse rest of list recursively, then attach current node to the end of reversed list.

**中文:**

**方法一：迭代法（三指针）**

- 维护三个指针：`prev`（已反转部分的头）、`curr`（当前处理节点）、`next`（待处理节点）
- 每次迭代：保存 next，逆转当前指针指向，prev 和 curr 后移

**方法二：递归法**

- 递归反转除了头节点之外的链表，返回反转后的新头
- 将当前节点接到反转链表尾部

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：迭代法 O(1)，递归法 O(n)




**PlantUML Diagram:**

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

### 从尾到头打印链表 / Print List from End

**Principle:**
Use stack: push all nodes, then pop and print. Or use recursion: recursively visit next node first, then print current node (post-order-like behavior using call stack).

**中文:**

**方法一：栈辅助法**

- 遍历链表，所有节点入栈
- 依次弹出栈中元素，实现逆序打印

**方法二：递归法**

- 递归先访问下一个节点，再打印当前节点（函数返回后再打印）
- 本质是系统栈的递归调用

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：栈辅助法 O(n)，递归法 O(n)（递归栈）




**PlantUML Diagram:**

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

### 两个链表的第一个公共节点 / First Common Node of Two Linked Lists

**Principle:**
Get lengths of both lists, advance the longer list's pointer by the difference. Then traverse both simultaneously; first common node encountered is the answer.

**中文:**

**方法：双指针 + 长度对齐**

1. 分别遍历两链表得到长度 len1, len2
2. 让较长的链表先走 |len1-len2| 步，使两链表尾部对齐
3. 然后同时遍历两链表，第一个相同节点即为公共节点

**核心原理：** 若两链表有公共节点，则从公共节点到末尾两链表完全重合。因此尾部对齐后，同时遍历必在公共节点处相遇。

**复杂度分析：**

- 时间复杂度：O(m+n)
- 空间复杂度：O(1)




**PlantUML Diagram:**

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

### 第一个只出现一次的字符 / First Non-Repeating Character

**Principle:**
First pass: count occurrences of each character using array of size 256. Second pass: find first character with count == 1. Or use ordered hash map to maintain insertion order.

**中文:**

**方法一：数组/哈希表统计**

- 第一次遍历：统计每个字符出现的次数（数组大小 256 或哈希表）
- 第二次遍历：找到第一个计数为 1 的字符

**方法二：有序哈希（LinkedHashMap）**

- 保持插入顺序的哈希表，插入时若已存在则标记为重复
- 遍历有序哈希，第一个标记为"出现一次"的即为答案

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(字符集大小)，数组法为 O(256)=O(1)




**PlantUML Diagram:**

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

### 最长不含重复字符的子字符串 / Longest Substring Without Repeating

**Principle:**
Sliding window approach. Expand window with right pointer, add character to set. If duplicate found, shrink from left until duplicate removed. Track maximum window size. Optimized version records latest position to skip directly.

**中文:**

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




**PlantUML Diagram:**

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

### 字符串的排列 / String Permutation

**Principle:**
Use backtracking. Fix each position and try all possible characters by swapping. Sort string first to group identical characters. Skip duplicates at the same recursion level to avoid duplicate permutations.

**中文:**

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




**PlantUML Diagram:**

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

### 反转字符串 / Reverse String

**Principle:**
Two-pointer technique. Left pointer at start, right pointer at end. Swap characters at both pointers, then move pointers toward center until they meet.

**中文:**

**核心思想：双指针法**

- 左指针指向首字符，右指针指向末字符
- 交换两指针指向的字符
- 左指针右移，右指针左移，重复直到两指针相遇

**复杂度分析：**

- 时间复杂度：O(n)，每个字符最多交换一次
- 空间复杂度：O(1)，原地反转




**PlantUML Diagram:**

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

### 把数字翻译成字符串 / Number to String Translation

**Principle:**
DP where dp[i] is the number of ways to translate suffix starting at position i. If current digit can be translated alone, add dp[i+1]. If it can combine with next digit to form number in [10,25], add dp[i+2].

**中文:**

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




**PlantUML Diagram:**

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

### 重建二叉树 / Rebuild Binary Tree from Preorder/Inorder

**Principle:**
Preorder's first element is root. Find root in inorder (use hash map). Left inorder elements before root form left subtree, right inorder elements form right subtree. Recursively build both subtrees.

**中文:**

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




**PlantUML Diagram:**

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

### 二叉树的下一个节点 / Next Node in Binary Tree (Inorder Successor)

**Principle:**
If node has right subtree, successor is the leftmost node in right subtree. If no right subtree, go up to find the first ancestor where node is in its left subtree. That ancestor's parent is the successor.

**中文:**

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




**PlantUML Diagram:**

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

### 树的子结构 / Subtree Matching

**Principle:**
First find node in tree A that matches tree B's root (traverse A). Then recursively check if subtree rooted at that node is identical to tree B (call isMatch).

**中文:**

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




**PlantUML Diagram:**

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

### 二叉树展开为链表 / Flatten Binary Tree to Linked List

**Principle:**
Recursively flatten left and right subtrees. Connect flattened left subtree to root's right child, then connect flattened right subtree to end of left subtree. Use prev pointer to track tail.

**中文:**

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




**PlantUML Diagram:**

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

### 对称的二叉树 / Symmetric Binary Tree

**Principle:**
A symmetric tree's left and right subtrees are mirrors. Recursively compare mirrored node pairs: left's left child with right's right child, and left's right child with right's left child.

**中文:**

**核心思想：递归比较镜像位置**

- 对称二叉树：左子树和右子树互为镜像
- 递归函数 `isMirror(left, right)` 判断两节点是否镜像
- 终止条件：两节点都为空（true），或其中一个为空（false），或值不同（false）
- 递归比较：`isMirror(left.left, right.right)` 且 `isMirror(left.right, right.left)`

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，h 为树高（递归栈）




**PlantUML Diagram:**

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

### 从上到下打印二叉树 / Level Order Traversal

**Principle:**
BFS using queue. Enqueue root, then loop: dequeue node, visit it, enqueue its children. For level-order with levels, track queue size before each level.

**中文:**

**核心思想：BFS（广度优先遍历）+ 队列**

1. 将根节点入队
2. 循环：队头出队并访问，将左右孩子（非空）入队
3. 直到队列为空

**分层打印变种：** 记录当前层节点数 `levelSize = queue.size()`，处理完一层后换行。

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)，队列最多存储一层节点




**PlantUML Diagram:**

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

### 序列化二叉树 / Serialize and Deserialize Binary Tree

**Principle:**
Serialization: Preorder traversal, use `#` for null nodes, `,` as delimiter. Deserialization: Recreate tree from preorder sequence using same traversal pattern.

**中文:**

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




**PlantUML Diagram:**

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

### 二叉树节点间的最大距离 / Maximum Distance Between Nodes (Diameter)

**Principle:**
Maximum distance passing through a node = left height + right height + 1 (edges between). Recursively compute height and update global max distance.

**中文:**

**核心思想：递归求每个节点的最大距离**

- 经过某节点的最大距离 = 左子树最大深度 + 右子树最大深度 + 1
- 递归函数返回子树的最大深度

**公式：** `maxDistance = max(maxDistance, leftDepth + rightDepth + 1)`

**复杂度分析：**

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，h 为树高（递归栈）




**PlantUML Diagram:**

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

### 二叉树中和为某一值的路径 / Path Sum in Binary Tree

**Principle:**
DFS from root, accumulate sum along path. When reaching leaf with sum == target, record path. Backtrack by subtracting current node value before trying other branches.

**中文:**

**核心思想：DFS（前序遍历）回溯**

- 从根节点向下累加路径上的节点值
- 当遇到叶子节点且累加和等于目标值，记录一条路径
- 回溯时减去当前节点值，尝试其他分支

**复杂度分析：**

- 时间复杂度：O(n)，每个节点最多访问一次
- 空间复杂度：O(h)，h 为树高（递归栈 + 路径数组）




**PlantUML Diagram:**

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

### 二叉树的最近公共祖先 / Lowest Common Ancestor

**Principle:**
Post-order traversal. Return node when found p or q. If both left and right recursive results are non-null, current node is LCA. Otherwise return the non-null result.

**中文:**

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




**PlantUML Diagram:**

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

### 剪绳子 / Cut Rope for Maximum Product

**Principle:**
DP: dp[i] = max product for length i. For each j, try cutting j and (i-j). Greedy: optimal segments are mostly 3s. Mathematically prove that 3^k * 4 is optimal strategy.

**中文:**

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




**PlantUML Diagram:**

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

### 二进制中1的个数 / Count Ones in Binary

**Principle:**
Brian Kernighan's algorithm: `n & (n-1)` clears the lowest set bit. Count how many times until n becomes 0. Each iteration removes one bit 1.

**中文:**

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




**PlantUML Diagram:**

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

### 矩阵的最小路径和 / Minimum Path Sum in Matrix

**Principle:**
DP where dp[i][j] is min path sum to (i,j). Only can come from top or left. dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j].

**中文:**

**核心思想：动态规划**

- `dp[i][j]` 表示从左上角到 (i,j) 的最小路径和
- 转移方程：`dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]`
- 第一行和第一列只有一种路径来源

**空间优化：** 滚动数组，用一行数组代替整个 dp 表。

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)（优化后）或 O(m×n)




**PlantUML Diagram:**

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

### 换钱的方法数 / Ways to Exchange Money

**Principle:**
- `dp[i][j] = dp[i-1][j] + dp[i][j-coins[i-1]]`
  - 不使用第 i 种硬币 + 使用第 i 种硬币（可重复）
- 初始化：`dp[0][0] = 1`

**空间优化：** 一维数组，从左到右遍历（完全背包特性）

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)


DP where dp[j] is number of ways to make amount j. For each coin, add dp[j-coin] (can use same coin multiple times). Classic unbounded knapsack problem.

**中文:**

**核心思想：动态规划（完全背包）**

- `dp[i][j]` 表示使用前 i 种硬币，凑成金额 j 的方法数


**PlantUML Diagram:**

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

### 换钱的最小货币数 / Minimum Coins for Exchange

**Principle:**
DP where dp[j] is minimum coins needed for amount j. For each coin, try using it and take minimum. Initialize dp[0]=0, others=INF. Classic bounded knapsack/coin change problem.

**中文:**

**核心思想：动态规划**

- `dp[i]` 表示凑成金额 i 所需的最少硬币数
- `dp[i] = min(dp[i-coins[j]] + 1)` 对所有硬币 j
- 初始化：`dp[0] = 0`，其他为 INF

**空间优化：** 一维数组

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(n)




**PlantUML Diagram:**

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

### 最长公共子序列问题 / Longest Common Subsequence (LCS)

**Principle:**
2D DP where dp[i][j] is LCS length of first i chars of text1 and first j chars of text2. If characters match, extend previous LCS. Otherwise, take max of excluding either char.

**中文:**

**核心思想：二维动态规划**

- `dp[i][j]` 表示 `text1[0..i-1]` 和 `text2[0..j-1]` 的 LCS 长度
- 转移方程：
  - 若 `text1[i-1] == text2[j-1]`：`dp[i][j] = dp[i-1][j-1] + 1`
  - 否则：`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

**空间优化：** 滚动数组，两行即可

**复杂度分析：**

- 时间复杂度：O(m×n)
- 空间复杂度：O(min(m,n))（优化后）




**PlantUML Diagram:**

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

### 最长公共子串问题 / Longest Common Substring

**Principle:**
DP where dp[i][j] is length of common substring ending at str1[i-1] and str2[j-1]. If chars match, extend; otherwise reset to 0. Track global maximum length.

**中文:**

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




**PlantUML Diagram:**

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

### 数组中的最长连续序列 / Longest Consecutive Sequence

**Principle:**
Put all numbers in hash set. For each number, only start counting if num-1 doesn't exist (ensures each sequence starts once). Expand both directions using hash set O(1) lookup.

**中文:**

**核心思想：哈希集合 + O(n) 遍历**

1. 将所有元素加入哈希集合
2. 遍历数组，对每个元素尝试扩展：往左找 `num-1`，往右找 `num+1`
3. 用哈希集合的 O(1) 查询快速判断连续
4. 跳过已被访问过的序列起点

**关键优化：** 只有当 `num-1` 不存在时才从 num 开始扩展，确保每个序列只处理一次。

**复杂度分析：**

- 时间复杂度：O(n)，每个元素最多被访问常数次
- 空间复杂度：O(n)




**PlantUML Diagram:**

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

### 最长递增子序列 / Longest Increasing Subsequence (LIS)

**Principle:**
DP O(n²): dp[i] = max(dp[j]+1) for all j<i with nums[j]<nums[i]. Binary search O(n log n): maintain tail array representing smallest tail for each length. Use binary search to find position.

**中文:**

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




**PlantUML Diagram:**

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

### 子矩阵的最大累加和问题 / Maximum Submatrix Sum

**Principle:**
Fix top and bottom rows. Compress 2D to 1D by summing columns between rows. Apply Kadane's algorithm to find max subarray sum. Try all row combinations.

**中文:**

**核心思想：降维 + Kadane 算法**

1. 固定矩阵的上下边界 top 和 bottom
2. 将二维压缩成一维：计算每列在 [top, bottom] 区间的累加和
3. 对这个一维数组应用 Kadane 算法求最大子数组和
4. 枚举所有 top-bottom 组合，取全局最大

**Kadane 算法：** 一维数组最大子段和，遍历时维护 `currentSum` 和 `maxSum`。

**复杂度分析：**

- 时间复杂度：O(m²×n)，m 行，n 列
- 空间复杂度：O(n)




**PlantUML Diagram:**

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

## Operating Systems, Common Interview Questions
*   **进程和线程的区别？**

*   **操作系统中进程与线程的切换过程**
*   **请描述系统调用整个流程**
*   **后台进程有什么特点**
*   **进程间通信有哪几种方式**
*   **操作系统中进程调度策略有哪几种**
*   **线程同步的方式**
*   **CAS是怎样的一种同步机制**
*   **CPU 是怎么执行指令的**
*   **用户态和内核态的区别**
*   **内存管理有哪几种方式**
*   **malloc 是如何分配内存的**
*   **页面置换算法有哪些**
*   **谈谈 cpu cache 一致性工作原理**
*   **写文件时进程宕机，数据会丢失吗**
*   **磁盘调度算法有哪些**

### 进程和线程的区别？ / Process vs Thread

**Principle:**
A process is the basic unit of resource allocation with its own address space, file descriptors, and memory page tables. A thread is the basic unit of CPU scheduling, sharing the process's address space and resources while having independent stack, registers, and program counter. Processes are isolated; threads share memory.

**中文:**

进程是资源分配的基本单位，拥有独立的地址空间、文件描述符、内存页表；线程是CPU调度的基本单位，同一进程内的线程共享进程的地址空间和资源，仅有独立的栈、寄存器和程序计数器。进程间隔离，线程间共享。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "Process A" as PA #E3F2FD {
  rectangle "地址空间" as AS_A #F5F5F5
  rectangle "PCB\n(进程控制块)" as PCB_A #FFECB3
  rectangle "文件描述符" as FD_A #C8E6C9
  
  AS_A -[hidden]down-> PCB_A
  PCB_A -[hidden]down-> FD_A
}

package "Process B" as PB #E3F2FD {
  rectangle "地址空间" as AS_B #F5F5F5
  rectangle "PCB\n(进程控制块)" as PCB_B #FFECB3
  rectangle "文件描述符" as FD_B #C8E6C9
  
  AS_B -[hidden]down-> PCB_B
  PCB_B -[hidden]down-> FD_B
}

PA <-[dashed,thickness=2]-> PB : 进程间隔离

package "Process C (多线程)" as PC #FCE4EC {
  rectangle "地址空间(共享)" as AS_C #F5F5F5
  rectangle "Thread 1\n栈+寄存器+PC" as T1 #C8E6C9
  rectangle "Thread 2\n栈+寄存器+PC" as T2 #FFF3E0
  rectangle "Thread 3\n栈+寄存器+PC" as T3 #E8F5E9
  
  AS_C -- T1
  AS_C -- T2
  AS_C -- T3
}

note right of PA
  **进程特点**
  • 独立地址空间
  • 资源分配单位
  • 进程间通信开销大
end note

note right of PC
  **线程特点**
  • 共享地址空间
  • CPU调度单位
  • 线程间通信开销小
end note
@enduml
```

---

### 操作系统中进程与线程的切换过程 / Process and Thread Context Switch

**Principle:**
Process switch saves full context: kernel stack, user stack, address space, registers, PC. It traps to kernel mode, saves current PCB, restores target process context, costing thousands of CPU cycles. Thread switch only saves registers, stack, and PC; same-process threads avoid address space switch, reducing cost to ~1/10 of process switch.

**中文:**

进程切换需要保存完整上下文：内核栈、用户栈、地址空间、寄存器、程序计数器等，从用户态陷入内核态，保存当前进程PCB，恢复目标进程上下文，开销数千个CPU周期。线程切换仅保存寄存器、栈和程序计数器，同一进程内线程切换无需切换地址空间，开销仅为进程切换的1/10左右。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **进程/线程切换流程**

state "用户态" as USR #E8F5E9
state "内核态" as KERN #FFECB3

USR -> KERN : 触发切换\n(时间片到期/系统调用/中断)
activate KERN

KERN -> KERN : 保存当前进程/线程上下文\n(寄存器/PC/栈指针)

note right of KERN
  **进程切换额外操作**
  • 切换内核栈
  • 切换地址空间(page table)
  • 刷新TLB缓存
end note

note right of KERN
  **线程切换额外操作**
  • 仅切换栈和寄存器
  • 无需切换地址空间
end note

KERN -> KERN : 选择目标进程/线程
KERN -> KERN : 恢复目标上下文

KERN -> USR : 切换到目标\n进程/线程执行
deactivate KERN

legend right
  **开销对比**
  进程切换：数千CPU周期
  线程切换：数百CPU周期
endlegend
@enduml
```

---

### 请描述系统调用整个流程 / System Call Flow

**Principle:**
User program triggers transition to kernel mode via software interrupt or syscall instruction. CPU fetches kernel entry from interrupt vector table, looks up the service routine by syscall number, performs permission checks, executes the kernel function, then returns via iret instruction to user mode with results in user registers.

**中文:**

用户程序通过软中断或syscall指令触发从用户态到内核态的切换，CPU从中断向量表获取内核入口，查找syscall号对应的内核服务例程，执行权限检查后调用内核函数，完成后通过iret指令返回用户态，结果写回用户寄存器。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **系统调用完整流程**

actor "用户程序" as U #E3F2FD
participant "用户态\nUser Space" as US #E8F5E9
participant "内核态\nKernel Space" as KS #FFECB3
participant "系统调用表\nSyscall Table" as ST #C8E6C9

U -> US : 调用库函数\n(如read(fd, buf, n))

note over US
  库函数负责:
  1. 准备参数
  2. 执行syscall指令\n   (或软中断int 0x80)
end note

US -> KS : **触发异常/中断**\n从用户态进入内核态
activate KS

KS -> ST : 根据syscall号\n查找内核服务例程
ST --> KS : 返回服务例程地址

KS -> KS : 权限检查\n(文件描述符/内存权限)

KS -> KS : 执行内核服务\n(如文件系统读写)

note right of KS
  **常见系统调用**
  • read/write - 文件操作
  • fork/clone - 进程创建
  • mmap/brk - 内存管理
  • pipe/socket - IPC
end note

KS -> US : 执行iret返回\n结果写入用户寄存器
deactivate KS

U <-- US : 库函数返回\n(-1表示错误,>0表示成功)

legend center
  **关键点**
  1. 用户态→内核态通过特殊指令
  2. syscall号作为索引查表
  3. 内核检查权限后执行
  4. 结果通过寄存器返回
endlegend
@enduml
```

---

### 后台进程有什么特点 / Daemon Process Characteristics

**Principle:**
A daemon (background process) runs in background without a controlling terminal, typically with parent init/systemd. Created by: fork, parent exits, child calls setsid to detach from terminal and become session leader. Characteristics: long-lived, independent session, no terminal, inherited FDs that can be closed.

**中文:**

后台进程又称守护进程，运行于后台，无控制终端，父进程通常为init或systemd。创建方式：fork后父进程退出，子进程调用setsid脱离终端，成为会话leader。特点：长寿命、独立会话、无终端关联、文件描述符继承但可关闭。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **守护进程创建流程**

|#FFECB3|终端/Shell|
start
:执行后台程序启动命令;
:fork()创建子进程;
|#FFF3E0|子进程|
:父进程exit()退出;
:子进程调用setsid();
note right
  setsid()效果:
  • 成为新会话session leader
  • 脱离控制终端
  • 创建新进程组
end note

|#C8E6C9|守护进程|
:切换工作目录到/\n或指定目录;
:关闭标准输入输出错误\n(STDIN/STDOUT/STDERR);
:忽略SIGHUP信号;\n(可选:重新打开\n/dev/null);
:执行实际服务任务;\n:进入主循环;

stop

note left of终端/Shell
  父进程退出后:
  子进程被init收养
  成为孤儿进程
end note

note right of守护进程
  **守护进程特点**
  • 无控制终端
  • 父进程为init(1)
  • 长寿命运行
  • 输出可重定向到日志
end note
@enduml
```

---

### 进程间通信有哪几种方式 / IPC Methods

**Principle:**
IPC methods include: pipe for related processes, byte-stream unstructured; FIFO named pipes for unrelated processes; message queue for type-based receiving; shared memory fastest but requires synchronization; semaphore for synchronization; socket for cross-host communication.

**中文:**

进程间通信方式包括：管道（pipe）用于亲缘进程，字节流无结构；FIFO命名管道可用于无亲缘进程；消息队列（msgqueue）按类型接收；共享内存（shared memory）最高效但需同步；信号量（semaphore）用于同步；套接字（socket）支持不同主机进程通信。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **进程间通信方式**

package "管道(Pipe)" #E8F5E9 {
  rectangle "匿名管道\npipe()" as PIPE
  rectangle "命名管道\nFIFO" as FIFO
  note right of PIPE
    亲缘进程间通信
    字节流无结构
  end note
  note right of FIFO
    无亲缘进程
    有文件名标识
  end note
}

package "消息队列" #FFF3E0 {
  rectangle "msgqueue" as MSG
  note right of MSG
    按类型接收
    消息持久化
  end note
}

package "共享内存" #C8E6C9 {
  rectangle "shared memory\nmmap/shmget" as SHM
  note right of SHM
    最高效的IPC
    需配合信号量
  end note
}

package "信号量" #FCE4EC {
  rectangle "semaphore" as SEM
  note right of SEM
    进程/线程同步
    P/V操作
  end note
}

package "套接字" #E3F2FD {
  rectangle "socket" as SOCK
  note right of SOCK
    本地/网络通信
    支持不同主机
  end note
}

legend center
  **选择建议**
  同主机同进程→共享内存
  同主机无亲缘→FIFO/消息队列
  需网络通信→Socket
  简单同步→信号量
endlegend
@enduml
```

---

### 操作系统中进程调度策略有哪几种 / Process Scheduling Algorithms

**Principle:**
Common scheduling: FCFS (first-come-first-served), SJF (shortest-job-first reduces average wait but may starve long jobs), RR (round-robin with time quantum, fair but throughput depends on quantum), priority scheduling (preemptive or non-preemptive), multilevel queue combining strategies for different process types.

**中文:**

常见调度算法：FCFS按到达顺序，先来先服务；SJF最短作业优先，利于平均等待时间但可能导致长作业饥饿；RR时间片轮转，公平但吞吐量依赖时间片大小；优先级调度可抢占或非抢占；多级队列结合多种策略，适用于不同进程类型。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **进程调度算法对比**

package "FCFS\n先来先服务" #E8F5E9 {
  rectangle "P1(0) → P2(3) → P3(6)" as FCFS1
  rectangle "P1等待0 P2等待P1 P3等待P2" as FCFS2
}

package "SJF\n最短作业优先" #FFF3E0 {
  rectangle "按执行时间排序\nP2(2) → P1(5) → P3(8)" as SJF1
  note right of SJF1
    平均等待时间最优
    长作业可能饥饿
  end note
}

package "RR\n时间片轮转" #C8E6C9 {
  rectangle "时间片=2\nP1→P2→P3→P1→..." as RR1
  note right of RR1
    公平性好
    吞吐量随时间片变化
  end note
}

package "优先级调度" #FCE4EC {
  rectangle "高优先级\n先执行" as PRIO1
  rectangle "可抢占式\n高优先级立即执行" as PRIO2
}

package "多级队列" #E3F2FD {
  rectangle "前台交互\n(RR)" as MQ1
  rectangle "后台批处理\n(FCFS)" as MQ2
  rectangle "系统进程\n(优先级)" as MQ3
}

legend center
  **算法选择**
  批处理→SJF/FCFS
  交互系统→RR/优先级
  通用系统→多级队列
endlegend
@enduml
```

---

### 线程同步的方式 / Thread Synchronization Methods

**Principle:**
Thread sync methods: mutex (mutual exclusion, one thread at a time), semaphore (counting, controls concurrency level), condition variable (wait for specific conditions), barrier (threads block until all arrive), spinlock (busy-wait, suitable for short critical sections).

**中文:**

线程同步方式：互斥锁（mutex）独占资源，一次只允许一个线程访问；信号量（semaphore）计数，可控制并发数量；条件变量（condition variable）用于线程等待特定条件；屏障（barrier）使线程阻塞直到所有线程到达；自旋锁（spinlock）忙等，适用于短临界区。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

title **线程同步方式**

package "互斥锁 Mutex" #E8F5E9 {
  rectangle "lock()\nunlock()" as M1
  note right of M1
    独占访问
    一次只有一个线程
  end note
}

package "信号量 Semaphore" #FFF3E0 {
  rectangle "P() / V()" as S1
  note right of S1
    计数信号量
    控制并发数量N
  end note
}

package "条件变量 Condition Variable" #C8E6C9 {
  rectangle "wait() / signal() / broadcast()" as CV1
  note right of CV1
    等待特定条件
    需配合mutex使用
  end note
}

package "屏障 Barrier" #FCE4EC {
  rectangle "pthread_barrier_wait()" as B1
  note right of B1
    所有线程到达\n才继续执行
  end note
}

package "自旋锁 Spinlock" #E3F2FD {
  rectangle "while(flag) ;" as SP1
  note right of SP1
    忙等不睡眠
    适用于短临界区
  end note
}

legend center
  **选择原则**
  独占资源→Mutex
  控制并发数→Semaphore
  等待条件→Condition Variable
  汇合点→Barrier
  极短临界区→Spinlock
endlegend
@enduml
```

---

## Distributed Systems Theory, Common Interview Questions

### 什么是 CAP 理论

**Principle:**
CAP theorem states that a distributed system can only provide at most two of the three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are unavoidable in distributed systems, designers must choose between strong consistency (CP) or high availability (AP). ZooKeeper prioritizes consistency, while Eureka prioritizes availability.

**中文:**

CAP理论是分布式系统领域的核心理论，由加州大学伯克利分校的Eric Brewer教授在2000年提出。该理论指出：一个分布式系统最多只能同时满足一致性（Consistency）、可用性（Availability）和分区容错性（Partition tolerance）这三个特性中的两个。

- **一致性（Consistency）**：所有节点在同一时刻看到的数据完全一致
- **可用性（Availability）**：每个请求都能在合理时间内获得响应
- **分区容错性（Partition tolerance）**：系统能够容忍网络分区故障

由于在分布式系统中网络分区不可避免，因此实际上需要在C和A之间做出权衡：要么选择强一致性和分区容错（CP），要么选择可用性和分区容错（AP）。

CAP理论广泛应用于分布式数据库、分布式存储系统、分布式锁服务等场景。例如：Zookeeper采用CP模型，Eureka采用AP模型。




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

**中文:**

Base理论是对CAP定理中一致性和可用性权衡的实践总结，由eBay架构师Dan Pritchett在2008年提出。Base是"Basically Available, Soft state, Eventually consistent"三个短语的缩写。

- **基本可用（Basically Available）**：系统在大部分时间可用，允许在故障时降级服务
- **软状态（Soft state）**：系统的状态可以是临时的、中间的，不要求实时一致
- **最终一致性（Eventually consistent）**：系统在一段时间后达到一致状态，不需要实时强一致

Base理论的核心思想是：通过牺牲实时一致性，换取系统的高可用性和可扩展性。最终一致性允许数据在短暂的不一致状态后，通过异步修复机制达到一致。典型的应用场景包括：消息队列、分布式缓存、最终一致性的分布式数据库等。




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

**中文:**

2PC（Two-Phase Commit）是一种分布式事务协议，用于确保在分布式环境中多个节点上的事务要么全部提交成功，要么全部回滚。协议分为两个阶段：

**第一阶段（投票阶段）**：
- 协调者向所有参与者发送Prepare请求
- 参与者执行事务操作，但不会提交
- 参与者返回Yes或No投票

**第二阶段（提交阶段）**：
- 如果所有参与者都投Yes，协调者发送Commit请求，所有参与者提交事务
- 如果有任何参与者投No或超时，协调者发送Rollback请求，所有参与者回滚事务

2PC的优点是实现简单，能保证事务的原子性。缺点是同步阻塞、单点故障和数据不一致风险。当协调者在发送Commit后宕机，部分参与者可能已提交而部分未提交，导致数据不一致。




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

**中文:**

Raft是一种分布式一致性算法，由Diego Ongaro和John Ousterhout在2014年提出，旨在解决分布式系统中日志复制和领导者选举问题。Raft通过将问题分解为三个子问题：领导者选举、日志复制和安全性。

**领导者选举**：集群中的节点初始为Follower，如果Follower在一段时间内未收到Leader的心跳，则转为Candidate发起选举。获得多数票的Candidate成为新的Leader。

**日志复制**：Leader接收客户端请求，将日志条目附加到本地日志，然后并行发送给所有Follower。当多数Follower确认接收后，Leader将条目应用到状态机并返回成功。

**安全性**：Raft通过以下机制保证安全：只有拥有最新且完整的日志条目的节点才能成为Leader；Leader永远不会覆盖或删除自己的日志条目。

Raft相对于Paxos更易于理解和实现，被广泛应用于etcd、Consul、CockroachDB等分布式系统。




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

## Kafka, Common Interview Questions

### kafka是什么？解决了什么问题？

**Principle:**
Kafka is a distributed streaming platform developed by Apache, originally at LinkedIn. It provides a high-throughput, persistent, distributed messaging system. Key use cases include asynchronous processing, traffic smoothing, log collection, and event-driven architectures. Kafka uses publish-subscribe model with persistent storage, partitioned topics, and replication for fault tolerance.

**中文:**

Kafka是由Apache软件基金会开发的分布式流处理平台，最初由LinkedIn公司开发并开源。它是一个高性能、持久化、分布式的消息队列和流处理系统。Kafka主要用于以下场景：

**解决的核心问题**：
1. **异步处理**：解耦生产者和消费者，提高系统响应速度
2. **削峰填谷**：缓解突发流量压力，平滑系统负载
3. **日志收集**：收集各类日志信息进行实时分析
4. **消息通信**：支持应用间的异步通信
5. **事件源**：作为事件驱动架构的核心组件

Kafka采用发布-订阅模型，支持消息持久化、分区存储、多副本备份，通过顺序写磁盘和零拷贝技术实现高吞吐量，被广泛应用于大数据实时处理、日志采集、监控报警等场景。




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "Kafka Cluster" {
    rectangle "Broker 1\n(Topic-Partition)" as B1
    rectangle "Broker 2\n(Topic-Partition)" as B2
    rectangle "Broker N\n(Topic-Partition)" as BN
}

rectangle "Producer\n生产者" as P
rectangle "Consumer Group\n消费者组" as C

P --> B1: **Publish Message**
P --> B2: **Publish Message**
P --> BN: **Publish Message**

B1 --> C: **Subscribe**
B2 --> C: **Subscribe**
BN --> C: **Subscribe**

note right of P
    Decouples sender\nand receiver
end note

note left of C
    Multiple consumers\n同一消息可被多组消费
end note

@enduml
```

---

### zk对于kafka的作用是什么

**Principle:**
Zookeeper serves several critical roles in Kafka: cluster metadata management (broker list, topic configs), leader election for the Controller node, distributed locking, consumer group tracking, and quota management. Since Kafka 2.8, the optional KRaft mode allows running Kafka without Zookeeper for simplified architecture.

**中文:**

Zookeeper在Kafka架构中扮演着非常重要的角色，主要负责以下几个方面：

**1. 集群元数据管理**：保存Kafka集群的Broker列表、Topic配置、Partition分布等元信息

**2. Leader选举**：当Kafka的Controller（控制器）节点宕机时，Zookeeper负责选举新的Controller

**3. 分布式锁服务**：用于Broker注册、Topic注册等分布式协调场景

**4. 消费者组管理**：记录消费者组的offset信息和成员变化

**5. 配额管理**：存储客户端配额配置

不过值得注意的是，从Kafka 2.8版本开始，引入了KRaft模式，可以不依赖Zookeeper实现元数据管理，这是Kafka架构的重要演进方向。




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "Zookeeper" {
    rectangle "ZooKeeper\nEnsemble" as ZK {
        card "/brokers/ids" as ZK1
        card "/controllers" as ZK2
        card "/consumer/offsets" as ZK3
        card "/config/topics" as ZK4
    }
}

package "Kafka Cluster" {
    rectangle "Controller\n控制器" as C
    rectangle "Broker 1" as B1
    rectangle "Broker 2" as B2
}

ZK <- C: **选举**
ZK <- B1: **注册/心跳**
ZK <- B2: **注册/心跳**

note bottom of ZK
    Stores metadata,\nmanages elections,\ncoordinates
end note

@enduml
```

---

### kafka如何判断一个节点是否还活着

**Principle:**
Kafka determines node liveness through: 1) Zookeeper ephemeral nodes - broker creates temp node under /brokers/ids, session timeout means death; 2) Controller heartbeat - controller sends heartbeats to all brokers; 3) Replica sync detection - follower must send FetchRequest within replica.lag.time.max.ms, otherwise considered dead.

**中文:**

Kafka通过心跳机制来判断节点是否存活，主要依靠Zookeeper和Kafka内置的心跳检测：

**Zookeeper层面**：
- Broker启动时会在Zookeeper创建临时节点（/brokers/ids/{broker_id}）
- Broker与Zookeeper保持会话，通过心跳维持连接
- 会话超时或临时节点消失，Zookeeper认为该Broker宕机

**Kafka内部心跳**：
- Controller定期向所有Broker发送心跳
- Broker通过Zookeeper的临时节点机制报告健康状态
- 如果Broker在配置的时间（replica.lag.time.max.ms）内未响应，被认为是宕机

**副本同步检测**：
- Follower定期向Leader发送FetchRequest请求同步数据
- 如果Follower在指定时间内没有发送请求，Leader认为其宕机
- 只有活跃的ISR（In-Sync Replicas）才能参与Leader选举




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

participant "ZooKeeper\n注册中心" as ZK
participant "Controller\n控制器" as C
participant "Broker Leader\nLeader节点" as L
participant "Broker Follower\nFollower节点" as F

ZK -> F: **会话保持\n(心跳)**
C -> F: **心跳检测**
L -> F: **FetchRequest\n同步检测**

alt 节点存活
    F -> ZK: **心跳续约**
    F -> L: **同步数据**
else 节点宕机
    ZK -> C: **会话超时\n临时节点消失**
    C -> L: **ISR收缩\n重新选举**
end

note right of F
    replica.lag.time.max.ms\n配置时间内无响应\n则判定为宕机
end note

@enduml
```

---

### 简述kafka的ack三种机制

**Principle:**
Kafka's ack mechanism controls message durability: acks=0 (fire-and-forget, highest performance, may lose data), acks=1 (wait for leader only, balanced), acks=all (wait for all ISRs, highest durability but higher latency). The trade-off is between reliability and throughput.

**中文:**

Kafka的消息确认机制（acks）是生产者发送消息时的重要配置，直接影响消息的可靠性和性能。Kafka提供三种acks配置：

**1. acks=0（异步发送，不等待确认）**：
- 生产者发送消息后不等待任何确认
- 性能最高但可能丢失数据
- 适用于对数据丢失不敏感的场景（如日志收集）

**2. acks=1（Leader确认）**：
- 生产者等待Leader节点确认写入成功
- 如果Leader宕机且未同步到Follower，数据会丢失
- 平衡了可靠性和性能，是常用配置

**3. acks=all/-1（全部ISR确认）**：
- 生产者等待所有ISR（同步副本）确认写入成功
- 只有Leader和Follower都写入后才确认
- 最高可靠性，但延迟较高
- 适用于对数据一致性要求高的场景




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Producer\n生产者" as P

rectangle "Kafka Cluster" {
    rectangle "Leader\nISR中" as L
    rectangle "Follower 1\nISR中" as F1
    rectangle "Follower 2\nISR中" as F2
}

== acks=0 ==

P -> L: **发送消息\n(不等待确认)**

== acks=1 ==

P -> L: **发送消息**
L -> P: **Leader写入成功**

== acks=all ==

P -> L: **发送消息**
L -> F1: **同步**
L -> F2: **同步**
F1 -> L: **写入成功**
F2 -> L: **写入成功**
L -> P: **所有ISR写入成功**

note bottom of P
    acks配置越高，可靠性越强\n但延迟也越高
end note

@enduml
```

---

### kafka如何控制消费位置

**Principle:**
Kafka allows precise control over consumption position: auto-commit (background, configurable interval), manual sync commit (blocking, exact), manual async commit (non-blocking), and seek() to jump to specific offsets. The __consumer_offsets topic tracks progress. Manual control enables exactly-once semantics and recovery from failures.

**中文:**

Kafka支持灵活的消费位置控制，消费者可以控制从哪个offset开始消费消息：

**1. 自动提交（默认）**：
- 设置enable.auto.commit=true
- 消费者在后台自动提交offset
- 提交周期由auto.commit.interval.ms控制
- 可能导致重复消费或漏消费

**2. 手动同步提交**：
- 调用consumer.commitSync()手动提交当前最大offset
- 阻塞直到提交成功或失败
- 更精确控制消费位置

**3. 手动异步提交**：
- 调用consumer.commitAsync()异步提交
- 不会阻塞，提高吞吐量
- 但失败不会重试

**4. 指定offset消费**：
- 使用seek()方法指定从特定offset开始
- 可配合消费者拦截器实现精准消费
- 支持从最早、最晚、指定时间等位置消费

**5. 消费进度追踪**：
- __consumer_offsets主题记录消费位置
- 支持重启后从上次位置继续消费




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Kafka Topic\nPartition" as TP

rectangle "Consumer\n消费者" as C {
    card "current offset\n当前消费位置" as offset
}

TP -> C: **消息流**

note left of TP
    Partition: [0][1][2][3][4][5][6][7]
    Position:    ↑     ↑
              consumed  next
end note

C -> C: **commitSync()**
C -> C: **commitAsync()**
C -> C: **seek(offset)**

note right of C
    控制消费位置支持：\n- 从头消费\n- 从最新开始\n- 从指定offset\n- 从时间戳开始
end note

@enduml
```

---

### 在分布式场景下如何保证消息的顺序消费

**Principle:**
Kafka guarantees ordering within a partition only. To ensure ordered consumption: 1) send related messages with same key to same partition; 2) one consumer per partition in consumer group; 3) process messages strictly in partition order; 4) handle failures carefully without skipping. Global ordering across partitions is not supported by Kafka's design.

**中文:**

在分布式场景下保证Kafka消息的顺序消费是一个重要问题，需要从多个层面考虑：

**1. 分区内有序**：
- Kafka的Partition内消息是有序的
- 同一Partition内的消息按append顺序消费
- 通过将相关消息发送到同一Partition实现有序

**2. 单Partition单消费者**：
- 一个Partition只能被消费者组内一个消费者消费
- 确保消息顺序不被破坏
- 通过设置partitions数量控制并发

**3. 生产者端控制**：
- 使用key相同的消息发送到同一Partition
- 相同key的消息保持顺序
- 避免因重试导致的消息乱序

**4. 消费者端处理**：
- 严格按照Partition顺序消费
- 处理失败不要简单跳过，建议暂存后重试
- 使用单线程处理或按Partition分桶

**5. 注意事项**：
- acks设置不当可能导致数据丢失
- Broker故障可能触发Leader选举，影响短暂有序
- 网络乱序可能导致消息乱序




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "Producer" {
    card "相同Key\n→ 同一Partition" as K1
    card "不同Key\n→ 任意Partition" as K2
}

package "Kafka Topic" {
    rectangle "Partition 0\n[msg1, msg2, msg3]" as P0
    rectangle "Partition 1\n[msg4, msg5, msg6]" as P1
    rectangle "Partition N\n[msg7, msg8]" as PN
}

package "Consumer Group" {
    card "Consumer 1\n→ Partition 0\n(顺序消费)" as C1
    card "Consumer 2\n→ Partition 1\n(顺序消费)" as C2
    card "Consumer N\n→ Partition N\n(顺序消费)" as CN
}

K1 --> P0
K1 --> P0
K2 --> P1

P0 --> C1
P1 --> C2
PN --> CN

note right of C1
    单Partition内保证有序\n跨Partition不保证
end note

@enduml
```

---

### kafka的高可用机制是什么

**Principle:**
Kafka's HA mechanism includes: replication (multiple copies of data), ISR (in-sync replicas that can become leaders), Controller (manages leader elections via Zookeeper), and fast failover (millisecond recovery). Only ISR members can become new leaders, ensuring data consistency.

**中文:**

Kafka的高可用机制通过多副本冗余和故障转移实现，主要包括：

**1. 副本机制（Replication）**：
- 每个Topic可以配置多个副本（replication.factor）
- 副本分为Leader和Follower角色
- 只有Leader处理读写请求，Follower异步同步

**2. ISR机制（In-Sync Replicas）**：
- ISR是当前与Leader保持同步的副本集合
- 由replica.lag.time.max.ms参数控制同步超时
- 只有ISR中的副本才有资格被选为新Leader

**3. Controller控制器**：
- 集群中选举一个Broker作为Controller
- 负责管理分区的Leader选举和副本状态变化
- 使用Zookeeper的临时节点实现选举

**4. 故障转移（Failover）**：
- 当Leader宕机，Controller从ISR中选举新Leader
- 选举过程快速（毫秒级）
- 通过 unclean.leader.election.enable控制是否允许非ISR选举

**5. 数据持久化**：
- 消息持久化到磁盘
- 多副本冗余保证数据不丢失
- 配置合理清理策略保留数据




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

package "Kafka Cluster" {
    rectangle "Controller" as Ctrl
    
    rectangle "Partition 0 (Topic-A)" as P0 {
        card "Leader\nBroker-1" as L1
        card "Follower\nBroker-2" as F1
        card "Follower\nBroker-3" as F2
    }
}

note bottom of P0
    ISR = {Broker-1, Broker-2, Broker-3}\n(假设全部同步中)
end note

alt Leader宕机
    Ctrl -> F1: **选举为新Leader**
    Ctrl -> F2: **同步通知**
end

note right of Ctrl
    Controller使用\nZookeeper选举\n管理所有分区状态
end note

@enduml
```

---

### kafka如何减少数据丢失

**Principle:**
To minimize data loss in Kafka: 1) Producer: use acks=all, retries>0, idempotent producer; 2) Broker: replication.factor>=3, min.insync.replicas>=2, disable unclean leader election; 3) Consumer: manual offset commit after processing, idempotent processing logic; 4) Monitor ISR changes and replica lag.

**中文:**

Kafka通过多个层面的机制来减少数据丢失：

**1. 生产者端配置**：
- 设置acks=all，确保所有ISR确认
- 配置retries大于0，失败自动重试
- 使用幂等性生产者和事务保证精确一次
- 推荐配合max.in.flight.requests.per.connection=1

**2. Broker端配置**：
- 设置replication.factor>=3，增加冗余
- 设置min.insync.replicas>=2，确保最小同步副本
- 合理配置flush策略，不完全依赖OS缓存
- 启用 unclean.leader.election.enable=false

**3. 消费者端配置**：
- 手动提交offset，不使用自动提交
- 确保消息处理完成后再提交
- 消费逻辑采用幂等设计

**4. 监控告警**：
- 监控ISR变化，及时发现异常
- 监控副本 lag，发现同步延迟
- 设置合理的告警阈值




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Producer" as P {
    card "acks=all" as A1
    card "retries>0" as A2
    card "幂等生产者" as A3
}

rectangle "Broker" as B {
    card "replication.factor=3" as B1
    card "min.insync.replicas=2" as B2
    card "unclean.leader.election=false" as B3
}

rectangle "Consumer" as C {
    card "手动提交offset" as C1
    card "幂等处理逻辑" as C2
}

P -> B: **可靠写入**
B -> C: **可靠消费**

note bottom of P
    生产者层面：acks=all + 重试
end note

note bottom of B
    Broker层面：多副本 + 拒绝脏选
end note

note bottom of C
    消费者层面：手动提交 + 幂等
end note

@enduml
```

---

### kafka如何确保不消费重复数据

**Principle:**
Kafka cannot guarantee exactly-once delivery by itself. Solutions include: 1) message deduplication using unique IDs stored in Redis/DB; 2) idempotent consumer logic (e.g., INSERT ON DUPLICATE KEY); 3) Kafka transactions with idempotent producer; 4) careful offset management. Best practice: design for at-least-once delivery and handle duplicates idempotently.

**中文:**

Kafka无法完全保证消息不重复消费，需要消费者端配合实现幂等消费：

**1. 消息去重策略**：
- 业务方生成唯一消息ID（message key或business key）
- 消费者维护已消费消息ID的记录（如Redis或数据库）
- 消费前检查是否已处理，处理过则跳过

**2. 幂等消费设计**：
- 将消费逻辑设计为幂等操作
- 同一消息处理多次结果一致
- 例如：使用数据库的INSERT ON DUPLICATE KEY UPDATE

**3. 事务支持**：
- 使用Kafka事务保证"生产-消费"原子性
- 配置enable.idempotence=true启用幂等生产者
- 结合消费者事务实现精确一次语义

**4. 消费offset管理**：
- 先提交offset再处理消息（可能漏消费）
- 先处理消息再提交offset（可能重复消费）
- 业务处理成功后手动提交offset

**5. 最佳实践**：
- 优先保证数据不丢失，重复消费靠幂等处理
- 关键业务场景使用分布式唯一ID去重
- 定期清理去重表，避免无限膨胀




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Kafka" as K {
    card "消息\nmsg_id=xxx" as M
}

rectangle "Consumer" as C {
    card "检查Redis\n已处理表" as R
    card "处理业务逻辑\n(幂等)" as B
    card "提交offset" as O
}

M -> R: **查询是否已处理**
R -> B: **未处理**
B -> O: **处理成功**
O -> R: **记录msg_id**

alt 重复消息
    R -> R: **已存在，跳过**
end

note right of C
    消费流程：\n1. 查询去重表\n2. 未处理则执行业务\n3. 成功后记录并提交offset
end note

@enduml
```

---

### kafka为什么性能这么高

**Principle:**

Kafka之所以能达到极高的吞吐量，主要归功于以下几个核心设计：

**1. 顺序写磁盘**：
- Kafka追加写入日志文件，充分利用磁盘顺序I/O
- 顺序写入速度接近内存，远快于随机写入
- 配合OS的预读和写缓存优化

**2. 零拷贝技术**：
- 使用sendfile系统调用，数据从磁盘到网络无需经过应用层
- 避免内核空间和用户空间之间的数据拷贝
- 显著减少CPU开销和上下文切换

**3. 页缓存（Page Cache）**：
- 利用OS内存作为消息缓存
- 热数据保持在内存中
- 读取时优先从缓存获取

**4. 分区并行处理**：
- 消息按Partition分布式存储
- 每个Partition可独立消费
- 消费者组内并行消费不同Partition

**5. 批量处理**：
- 生产者批量发送消息，减少网络往返
- 消费者批量拉取，提高吞吐量
- 消息压缩（批量压缩更高效）

**6. 高效序列化**：
- 使用高效的二进制协议
- 减少网络传输开销


Kafka achieves high throughput through: sequential disk writes (接近内存速度), zero-copy (sendfile eliminates kernel-user space copies), page cache (OS memory caching), partition parallelism (parallel consumption), batch processing (batched send/receive), and efficient binary serialization. These optimizations together enable millions of messages/second throughput.



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Producer" as P {
    card "批量发送" as B1
    card "消息压缩" as B2
}

rectangle "Kafka Broker" as K {
    card "顺序写入\n磁盘" as D1
    card "页缓存\nPageCache" as P1
    card "分区\nPartition" as P2
}

rectangle "Consumer" as C {
    card "批量拉取" as B3
    card "零拷贝\nsendfile" as Z1
}

P -> K: **网络传输\n(批量+压缩)**
K -> D1: **顺序写入**
D1 <-> P1: **缓存**
K -> C: **零拷贝传输**

note bottom of K
    顺序写 + 页缓存 = 高效持久化\n分区分区 = 并行处理
end note

note right of C
    sendfile系统调用\n数据直达网卡\n无需拷贝到用户空间
end note

@enduml
```

---

## gRPC, Common Interview Questions

### gRPC 服务端启动流程

**Principle:**
gRPC server startup: 1) Create ServerBuilder; 2) Register service implementations via AddService(); 3) Optionally add interceptors; 4) Bind port with AddListeningPort(); 5) BuildAndStart() to begin accepting connections; 6) Wait() for shutdown or AwaitTermination() for graceful shutdown.

**中文:**

gRPC服务端启动流程主要分为以下几个步骤：

**1. 创建Server实例**：
- 调用gRPC::CreateServerBuilder()创建Server构建器
- 配置监听端口和线程池参数

**2. 注册服务**：
- 将实现的服务类注册到ServerBuilder
- 通过AddService()方法添加proto生成的服务
- 支持添加多个服务到同一Server

**3. 配置拦截器**：
- 添加ServerInterceptor实现认证、日志等功能
- 可为所有方法或特定方法添加拦截器

**4. 绑定端口**：
- 调用builder.AddListeningPort()绑定监听地址
- 支持Unix Domain Socket

**5. 启动Server**：
- 调用builder.BuildAndStart()创建并启动Server
- Server开始接收客户端连接

**6. 等待终止**：
- 调用Server->Wait()阻塞等待
- 或使用Shutdown()和AwaitTermination()优雅关闭




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

|Server|
start
:CreateServerBuilder();
:AddService(serviceImpl);
:AddInterceptor();
:AddListeningPort(address);
:BuildAndStart();
:Wait/Shutdown();

stop

note right of Server
    1. 创建构建器\n2. 注册服务\n3. 配置拦截器\n4. 绑定端口\n5. 启动服务\n6. 等待终止
end note

@enduml
```

---

### gRPC 服务类型有哪些

**Principle:**
gRPC supports 4 RPC types: Unary (single request-response), Server Streaming (one request, stream responses), Client Streaming (stream requests, one response), and Bidirectional Streaming (both sides stream). Each serves different scenarios from simple calls to real-time communication.

**中文:**

gRPC支持四种服务类型，也称为RPC风格：

**1. Unary RPC（单项RPC）**：
- 客户端发送单个请求，服务端返回单个响应
- 最常用的模式，类似传统函数调用
- 例如：GetUser(UserRequest) -> UserResponse

**2. Server Streaming RPC（服务端流式RPC）**：
- 客户端发送单个请求，服务端返回多个响应组成的流
- 适用于批量数据返回、实时推送场景
- 例如：GetLogs(LogRequest) -> stream LogResponse

**3. Client Streaming RPC（客户端流式RPC）**：
- 客户端发送多个请求组成的流，服务端返回单个响应
- 适用于文件上传、批量提交场景
- 例如：UploadFile(stream FileChunk) -> UploadResult

**4. Bidirectional Streaming RPC（双向流式RPC）**：
- 客户端和服务端都可以发送多个请求/响应组成的流
- 双方可以独立地以任意顺序发送消息
- 适用于实时交互、聊天应用等
- 例如：Chat(stream Message) -> stream Message




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Unary RPC" as U {
    card "Client\n请求→" as U1
    card "←响应\nServer" as U2
}

rectangle "Server Streaming" as SS {
    card "Client\n请求→" as SS1
    card "←流响应\nServer" as SS2
}

rectangle "Client Streaming" as CS {
    card "流请求→\nClient" as CS1
    card "←响应\nServer" as CS2
}

rectangle "Bidirectional Streaming" as BS {
    card "流请求→\nClient" as BS1
    card "←流响应\nServer" as BS2
}

note right of U
    1:1\n传统请求响应
end note

note right of SS
    1:N\n批量数据推送
end note

note right of CS
    N:1\n文件上传
end note

note right of BS
    N:N\n实时交互
end note

@enduml
```

---

### keepalive 是针对连接设置

**Principle:**
gRPC Keepalive is a connection health check mechanism for HTTP/2. It uses ping frames to detect if the connection is alive, prevent idle connections from being closed by intermediaries, and detect failures quickly. Key configs: keepalive_time (default 2h), keepalive_timeout, and keepalive_without_calls.

**中文:**

gRPC的Keepalive是一种保活机制，用于检测连接是否仍然活跃，主要针对HTTP/2连接设置：

**作用**：
1. **检测连接存活**：定期发送ping帧检测对端是否存活
2. **保持连接活跃**：防止空闲连接被中间设备（如负载均衡器、防火墙）关闭
3. **及时发现故障**：快速检测网络故障或对端崩溃

**配置参数**：
- keepalive_time：空闲多长时间后发送ping（默认2小时）
- keepalive_timeout：ping后等待多长时间未响应则关闭连接
- keepalive_without_calls：是否在没有活跃调用时发送ping

**应用场景**：
- 长连接应用需要保持连接活跃
- 客户端需要检测服务端是否存活
- 穿透NAT或防火墙
- 通过代理或负载均衡器的场景

**注意事项**：
- 频繁的Keepalive会影响性能
- 需要根据网络环境合理配置
- 有些云服务商会限制Keepalive行为




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

participant "Client\n客户端" as C
participant "Server\n服务端" as S

note over C
    keepalive_time 间隔
    发送Ping帧
end note

loop 定期保活
    C -> S: **PING**
    S -> C: **PING_ACK**
end

alt 连接无响应
    C -> C: **keepalive_timeout后\n关闭连接**
end

note right of C
    keepalive配置：\n- 时间间隔\n- 超时时间\n- 无调用时是否发送
end note

@enduml
```

---

### gRPC多路复用指的是什么

**Principle:**
gRPC multiplexing uses HTTP/2 streams to multiplex multiple requests/responses over a single TCP connection. Each stream has a unique ID, allowing parallel requests without HOL blocking. Benefits: connection reuse, parallelism, resource efficiency, and lower latency compared to HTTP/1.1.

**中文:**

gRPC多路复用（Multiplexing）是指在单个HTTP/2连接上同时处理多个独立的Stream（流），是gRPC高性能的核心特性之一：

**技术原理**：
- HTTP/2支持多路复用，通过Stream ID区分不同的请求/响应
- 多个Stream共享同一个TCP连接
- 同一个连接上可以同时存在多个未完成的请求

**优势**：
1. **连接复用**：避免频繁建立TCP连接的开销
2. **并行处理**：多个请求可以并行发送和接收
3. **资源节省**：减少连接数，降低服务器资源消耗
4. **低延迟**：避免等待连接建立

**与HTTP/1.1对比**：
- HTTP/1.1需要Pipeline或多个连接实现并发
- HTTP/1.1存在HOL（队头阻塞）问题
- HTTP/2/gRPC通过Stream ID完全避免HOL

**Unary vs Streaming**：
- Unary：一个请求对应一个响应
- Streaming：多个请求/响应可以交错在同一个连接上




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Single TCP Connection\n单一TCP连接" as TCP

rectangle "Stream 1" as S1 {
    card "Request A" as R1
    card "Response A" as P1
}

rectangle "Stream 2" as S2 {
    card "Request B" as R2
    card "Response B" as P2
}

rectangle "Stream N" as SN {
    card "Request N" as RN
    card "Response N" as PN
}

TCP <-> S1: **Stream ID: 1**
TCP <-> S2: **Stream ID: 3**
TCP <-> SN: **Stream ID: N**

note bottom of TCP
    HTTP/2多路复用\n同一连接并行传输多个Stream\n避免队头阻塞
end note

@enduml
```

---

### gRPC 如何自定义 resolver

**Principle:**
class CustomResolver : public Resolver {
public:
    void Resolve(const resolve_args&) override {
        // 查询服务发现获取地址
        std::vector<Address> addresses = Discover();
        // 更新Channel
        channel_->UpdateState(Connected, addresses);
    }
};
```


gRPC custom resolver lets you implement service discovery by implementing the Resolver interface. Override Resolve() to discover addresses (from Consul, etcd, DNS, etc.) and call UpdateState() to notify the Channel. Register via ResolverFactory. Used for dynamic service discovery and complex load balancing.

**中文:**

gRPC自定义Resolver允许开发者实现服务发现逻辑，将服务名解析为具体的地址列表：

**Resolver接口**：
- 实现grpc::Resolver接口
- 主要方法：Resolve(resolve_args)、Shutdown()
- 调用ClientChannel的UpdateState()更新地址

**核心步骤**：
1. **创建Resolver Factory**：注册到全局FactoryMap
2. **实现Resolver类**：实现服务发现逻辑
3. **解析地址**：查询注册中心或DNS
4. **更新地址**：将结果通过Channel返回

**常用场景**：
- **服务注册中心**：从Consul、etcd、Nacos发现服务
- **负载均衡策略**：配合自定义LB实现复杂策略
- **动态配置**：运行时更改服务端点

**代码示例**：
```cpp


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "gRPC Channel" as Ch
rectangle "Custom Resolver\n自定义Resolver" as Res

rectangle "Service Discovery\n服务发现中心" as SD {
    card "Consul/etcd\n/DNS/Nacos" as SD1
}

Ch -> Res: **Resolve()**
Res -> SD: **查询服务地址**
SD -> Res: **返回地址列表**
Res -> Ch: **UpdateState(addresses)**

note right of Res
    自定义解析逻辑：\n1. 实现Resolver接口\n2. 查询服务发现\n3. 更新Channel地址
end note

@enduml
```

---

### gRPC如何自定义 balancer

**Principle:**
gRPC custom load balancer implements the LoadBalancer interface to choose which subchannel handles each request. Work with Resolver: Resolver discovers addresses, Balancer chooses which address. Implement Pick() to return PickResult. Common strategies: round_robin, random, weighted, consistent hashing.

**中文:**

gRPC自定义负载均衡器允许开发者实现各种负载均衡策略：

**LoadBalancer接口**：
- 实现grpc::LoadBalancer接口
- 处理客户端请求的服务器选择
- 管理subchannel（子通道）生命周期

**核心组件**：
1. **LoadBalancer**：决定选择哪个Subchannel处理请求
2. **Subchannel**：到某个服务端的物理连接
3. **Picker**：实际选择Subchannel的策略对象

**常用策略实现**：
- **RoundRobin**：轮询选择
- **Random**：随机选择
- **WeightedRoundRobin**：加权轮询
- **一致性哈希**：相同请求路由到相同服务器

**与Resolver配合**：
- Resolver负责"在哪找"（地址发现）
- Balancer负责"选哪个"（负载选择）

**实现步骤**：
1. 实现LoadBalancer类
2. 实现SubchannelPicker的PickResult
3. 注册到全局LoadBalancerRegistry




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "gRPC Channel" as Ch
rectangle "Custom LoadBalancer\n自定义Balancer" as LB

rectangle "Subchannel Pool" as SP {
    card "Subchannel 1\n(Server A)" as SC1
    card "Subchannel 2\n(Server B)" as SC2
    card "Subchannel N\n(Server N)" as SCN
}

Ch -> LB: **请求**
LB -> SP: **选择Subchannel**
SP -> LB: **返回Picker**
LB -> Ch: **PickResult**

note right of LB
    负载均衡策略：\n- RoundRobin\n- Random\n- Weighted\n- 一致性哈希
end note

@enduml
```

---

### 如何实现 gRPC 全链路追踪

**Principle:**
gRPC distributed tracing tracks requests across service boundaries using Trace IDs and Spans. Implement via interceptors that extract/inject trace context from metadata. Use OpenCensus or OpenTracing with exporters like Zipkin/Jaeger. Each RPC creates spans with timing and metadata for end-to-end visibility.

**中文:**

gRPC全链路追踪用于监控和调试分布式请求的完整调用链：

**核心概念**：
- **Trace**：一次完整的请求链路
- **Span**：链路中的一个操作单元
- **Trace ID**：串联整个链路的唯一ID

**实现机制**：
1. **拦截器注入**：Client/ServerInterceptor提取或生成TraceContext
2. **上下文传播**：通过Metadata携带Trace信息
3. **Span记录**：记录每个操作的开始、结束时间
4. **上报追踪系统**：将数据发送到Zipkin、Jaeger等

**gRPC追踪支持**：
- 内置OpenCensus和OpenTracing支持
- 支持W3C Trace Context标准
- 可配合gRPC插件实现详细追踪

**实现步骤**：
1. 配置追踪Exporter（如Zipkin、Jaeger）
2. 添加ClientInterceptor和ServerInterceptor
3. 在拦截器中提取/注入Context
4. 为每个RPC创建Span并记录元数据




**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

actor "Client\n客户端" as C

box "Service A" #LightBlue
rectangle "Interceptor A" as IA
rectangle "Span A1" as SA1
end box

box "Service B" #LightGreen
rectangle "Interceptor B" as IB
rectangle "Span B1" as SB1
end box

box "Service C" #LightYellow
rectangle "Interceptor C" as IC
rectangle "Span C1" as SC1
end box

C -> IA: **RPC请求\n(TraceID=xxx)**
IA -> SA1: **创建Span**
SA1 -> IB: **转发\n(Metadata携带)**
IB -> SB1: **创建Span**
SB1 -> IC: **转发**
IC -> SC1: **创建Span**

note bottom of C
    Trace ID贯穿整个链路\n每个服务创建Span\n形成完整调用链
end note

@enduml
```

---

### 客户端连接状态有哪些

**Principle:**
- READY → TRANSIENT_FAILURE → CONNECTING
- 任意状态 → SHUTDOWN


gRPC channel states: IDLE (initial), CONNECTING (establishing), READY (connected, ready for RPC), TRANSIENT_FAILURE (recoverable error, will retry), SHUTDOWN (closed permanently). Transitions happen based on network conditions and explicit shutdown calls.

**中文:**

gRPC客户端连接状态反映了底层HTTP/2连接的健康状况，主要有以下状态：

**1. IDLE（空闲状态）**：
- 初始状态，Channel未建立连接
- 开始发起RPC时将尝试建立连接

**2. CONNECTING（连接中）**：
- 正在与服务器建立TCP连接和HTTP/2握手
- 可能涉及TLS握手

**3. READY（就绪状态）**：
- 连接已建立，可以正常处理RPC
- 收发数据正常

**4. TRANSIENT_FAILURE（瞬时失败）**：
- 连接遇到可恢复的错误（如网络抖动）
- 会自动重试建立连接

**5. SHUTDOWN（已关闭）**：
- Channel被显式关闭
- 不会再进行任何连接尝试

**状态转换**：
- IDLE → CONNECTING → READY


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

state "IDLE\n空闲" as IDLE
state "CONNECTING\n连接中" as CONN
state "READY\n就绪" as READY
state "TRANSIENT_FAILURE\n瞬时失败" as FAIL
state "SHUTDOWN\n已关闭" as DOWN

IDLE --> CONN: **开始RPC**
CONN --> READY: **连接成功**
CONN --> FAIL: **连接失败**
READY --> FAIL: **网络错误**
FAIL --> CONN: **重试**
READY --> DOWN: **Shutdown()**
FAIL --> DOWN: **Shutdown()**
IDLE --> DOWN: **Shutdown()**

@enduml
```

---

### 客户端如何获取服务端的服务函数列表

**Principle:**
auto stub = ServerReflection::NewStub(channel);

// 查询所有服务
ListServicesRequest request;
ListServicesResponse response;
stub->ListServices(&context, request, &response);

// 获取服务名列表
for (auto& svc : response.service_list()) {
    std::string name = svc.name();
    // 查询具体服务定义...
}
```

**应用场景**：
- 动态客户端：无需预编译proto
- gRPC UI工具： grpcurl、Postman
- 服务治理：发现可用服务
- 契约测试：验证服务端接口


gRPC Server Reflection exposes service definitions at runtime. Enable ServerReflection service on server, then clients can query ListServices() to get service names and GetServiceDescriptor() for full proto definitions. Used by grpcurl, Postman, dynamic clients, and service governance tools.

**中文:**

gRPC服务端通过gRPC Reflection协议暴露服务定义，客户端可以动态获取服务列表：

**Server Reflection**：
- 需要在服务端启用ServerReflection服务
- 服务名为grpc.reflection.v1alpha.ServerReflection
- 支持查询服务名列表、具体服务定义

**ProtoDescriptor服务**：
- grpc.reflection.v1.ServerReflection：正式版本
- 返回完整的service proto描述

**客户端使用**：
```cpp
// 创建reflection stub


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "gRPC Server\n(启用Reflection)" as S {
    card "ServerReflection\nService" as SR
    card "Service Descriptors\n服务定义" as SD
}

rectangle "gRPC Client\n(动态发现)" as C {
    card "Reflection Stub" as RS
    card "Service List\n服务列表" as SL
}

C -> S: **ListServices()**
S -> C: **返回服务名列表**

C -> S: **GetServiceDescriptor()**
S -> C: **返回proto定义**

note right of C
    无需预编译proto\n运行时动态获取\n支持grpcurl等工具
end note

@enduml
```

---

### 如何为每个stream进行限流

**Principle:**
class RateLimitInterceptor : public grpc::experimental::Interceptor {
    std::shared_ptr<RateLimiter> limiter_;
    
    void Intercept() override {
        if (!limiter_->TryAcquire()) {
            // 拒绝请求
            return Fail(Status::RESOURCE_EXHAUSTED);
        }
        Proceed();
    }
};
```


Rate limiting per stream can be implemented using token bucket or leaky bucket algorithms via Interceptors. Check rate limit before allowing request to proceed. Dimensions: global (shared limiter), per-connection, or per-stream. Use Fail(Status::RESOURCE_EXHAUSTED) to reject requests when limit exceeded.

**中文:**

gRPC可以为每个Stream（流）实现限流，控制并发和资源使用：

**限流策略**：
1. **令牌桶算法**：按速率生成令牌，获取令牌才能处理请求
2. **漏桶算法**：按固定速率处理请求，平滑流量
3. **滑动窗口**：基于时间窗口统计请求数

**实现方式**：
- **Client Interceptor**：在发送请求前检查限流
- **Server Interceptor**：在处理请求前检查限流

**限流维度**：
- **全局限流**：整个进程共享限流器
- **单连接限流**：每个连接独立限流
- **单Stream限流**：每个Stream独立限流

**代码示例**：
```cpp


**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam shadowing false
skinparam roundcorner 15

rectangle "Rate Limiter\n限流器" as RL {
    card "令牌桶/漏桶\n算法" as ALG
    card "当前可用额度" as CUR
}

rectangle "Stream 1" as S1
rectangle "Stream 2" as S2
rectangle "Stream N" as SN

S1 -> RL: **请求限流检查**
RL -> S1: **令牌→允许**
S2 -> RL: **请求限流检查**
RL -> S2: **拒绝(无可用令牌)**

note bottom of RL
    限流维度：\n- 全局限流\n- 单连接限流\n- 单Stream限流\n\n算法：\n- 令牌桶\n- 漏桶\n- 滑动窗口
end note

@enduml
```

---

## etcd, Common Interview Questions

### etcd 中一个任期是什么意思

**Principle:**
In etcd's Raft implementation, a Term is a logical clock - a monotonically increasing integer starting from 0. Each election increments the term. Terms help distinguish election cycles, identify stale information, resolve conflicts, and are embedded in log entries. During network partitions, multiple terms may exist, and nodes with lower terms must step down.

**中文:**

在etcd的Raft协议实现中，"任期"（Term）是一个逻辑时钟概念，用于解决分布式系统中的时间问题和识别过期的信息：

**任期的定义**：
- 任期是一个单调递增的整数，从0开始
- 每个新选举开始时，候选者会将自己的Term加1
- 任期贯穿整个选举和正常工作的全周期

**任期的作用**：
1. **区分选举周期**：每个任期最多有一个Leader
2. **识别过期信息**：旧任期的消息会被忽略
3. **解决冲突**：通过Term比较解决冲突
4. **日志条目属性**：每个日志条目都包含其创建时的Term号

**Term的流转**：
- 正常情况下，Term随时间单调递增
- 选举时，候选者将自己的Term加1
- 网络分区时，可能出现多个不同的Term
- 当节点发现更高Term时，自动转为Follower




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

**中文:**

etcd基于Raft协议实现，节点在三种状态之间切换：Leader（领导者）、Follower（追随者）、Candidate（候选者）：

**状态转换规则**：

**Follower → Candidate**：
- 条件：选举超时时间内未收到Leader心跳
- 动作：增加Term，转为Candidate，发起选举

**Candidate → Leader**：
- 条件：获得集群多数节点的投票
- 动作：成为新Leader，开始处理请求

**Candidate → Follower**：
- 条件1：选举超时，重新开始新选举
- 条件2：发现新的Leader（更高Term）
- 条件3：发现更高Term的日志

**Leader → Follower**：
- 条件：发现更高Term的节点
- 动作：主动降级为Follower

**状态机核心逻辑**：
```cpp
// 伪代码
switch(state) {
case Follower:


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

**中文:**

Raft协议通过投票限制（Vote Restriction）机制，确保只有拥有最新日志的候选者才能赢得选举：

**核心机制：投票前检查**：
- 候选者请求投票时，会携带自己的lastLogTerm和lastLogIndex
- 投票者会比较候选者的日志是否比自己更新
- 如果候选者日志不如自己新，拒绝投票

**日志比较规则**：
- 首先比较lastLogTerm：Term大的日志更新
- 如果Term相同，比较lastLogIndex：索引大的日志更新
- 只有日志"不旧于"投票者的节点才能获得投票

**为什么这样有效**：
- 新Leader必须包含所有已提交的日志条目
- 未同步的候选者无法获得多数投票
- 保证了Leader的数据完整性

**实际实现**：
- Raft论文中的描述：If votesReceived ≥ majority, become leader
- 但实际需要检查：me.lastLog >= peer.lastLog
- etcd/Consul等实现都遵循此规则




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

**数据恢复**：
- 节点恢复后，从Leader获取缺失的日志条目
- 通过Raft日志重放恢复状态机状态
- 如果日志损坏，需要从快照恢复

**网络分区**：
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

**中文:**

Raft算法设计时选择不考虑拜占庭将军问题，这是基于实际应用场景和工程权衡的考虑：

**拜占庭将军问题**：
- 拜占庭容错（BFT）要求系统能容忍恶意节点
- 节点可能发送虚假、篡改或伪造的消息
- 需要复杂的签名和多数冗余机制

**Raft的设计假设**：
1. **诚实节点**：节点只会崩溃或停止工作，不会恶意行为
2. **可信网络**：网络中的消息不会被篡改
3. **简化实现**：避免复杂密码学操作，提高性能

**为什么不考虑**：
- **性能开销**：BFT算法（如PBFT）复杂度高，性能差
- **实现复杂**：BFT需要签名、验证、多轮共识
- **场景匹配**：数据中心内部的协调服务通常可信
- **可替代方案**：有专门的BFT库可用于高安全场景

**实际应用**：
- etcd/Consul等用于服务发现的系统采用Raft
- 金融等高安全场景使用专门的BFT实现（如Hyperledger Fabric）
- Kubernetes使用etcd，正是基于数据中心可信假设




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

**中文:**

etcd使用Raft协议的领导者选举机制，通过投票和超时机制选出Leader：

**选举触发条件**：
- Follower在选举超时（election timeout）内未收到Leader心跳
- 选举超时时间通常是100-500ms的随机值（避免同时发起选举）

**选举流程**：
1. **状态转换**：Follower → Candidate
2. **增加Term**：Candidate将自己的Term加1
3. **投票请求**：向所有节点发送RequestVote RPC
4. **等待响应**：等待多数节点的投票

**投票规则**：
- 节点投出票后，重置自己的选举超时计时器
- 每个Term只能投一票
- 只有日志比自己的新的候选者才能获得投票

**赢得选举**：
- 获得集群多数节点（含自己）的投票
- 成为新Leader，开始发送心跳
- 其他节点收到心跳后转为Follower

**选举失败**：
- 未获得多数票，选举超时后重新发起选举
- 发现更高Term的Leader，自动转为Follower




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

**中文:**

etcd通过Raft共识算法保证分布式数据的一致性，主要机制包括：

**1. 日志复制**：
- 客户端写请求先写入Leader的本地日志
- Leader并行发送给所有Follower（AppendEntries RPC）
- 只有多数节点确认写入后，日志才被视为已提交
- 已提交日志应用到底层状态机

**2. 领导人完整性（Leader Completeness）**：
- 只有包含所有已提交日志的节点才能成为Leader
- 通过投票限制机制保证
- 新Leader包含最新的数据

**3. 日志匹配（Log Matching）**：
- 如果两个节点的日志在某一索引相同，则之前的所有日志也相同
- 通过AppendEntries一致性检查实现
- 确保数据不丢失、不重复

**4. 状态机匹配**：
- 已提交的操作最终会应用到所有状态机
- 使用预写日志（WAL）和快照机制
- 崩溃恢复后通过重放日志恢复

**5. 读请求处理**：
- 默认情况下读请求由Leader处理，保证最新数据
- 可配置线性读取（Linearizable Read）
- 使用ReadIndex机制确保读取最新已提交数据




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

## Docker/K8s, Common Interview Questions

### 什么是 docker 镜像 / What is a Docker Image

**Principle:**
A Docker image is a read-only template that contains everything needed to run a container: the application code, runtime environment, libraries, environment variables, and configuration files. Images use a layered storage architecture where each layer is read-only, and multiple images can share underlying layers, saving storage space and speeding up builds. When a container is created from an image, Docker adds a writable layer on top of the image layers; all modifications to the container are written to this layer without changing the underlying image.

Images are built from Dockerfiles, where each instruction creates a new image layer. Common image operations include: `docker pull` to fetch images from a registry, `docker build` to create images from Dockerfiles, and `docker push` to upload images to a registry. Images are identified by repository name, tag, and digest, with typical format `registry/repository:tag` like `nginx:1.25` or `python:3.11-slim`. Use `docker images` and `docker rmi` to manage local images.

**中文:**

Docker 镜像是一个只读的模板，包含了运行容器所需的文件系统、代码、依赖库、环境变量和配置信息。镜像采用了分层（Layer）的存储结构，每个镜像层都是只读的，多个镜像之间可以共享底层层，从而节省存储空间和加快构建速度。当基于镜像创建容器时，Docker会在镜像层之上添加一个可写层（Container Layer），所有对容器的修改都发生在这个可写层中，而不会影响底层的镜像本身。

Docker 镜像通过 Dockerfile 定义构建流程，每条指令都会创建一个新的镜像层。常见的镜像操作包括：`docker pull` 从仓库拉取镜像，`docker build` 根据 Dockerfile 构建镜像，`docker push` 将镜像推送到仓库。镜像的标识由仓库名、标签和摘要组成，典型的镜像名称格式为 `registry/repository:tag`，如 `nginx:1.25` 或 `python:3.11-slim`。使用 `docker images` 和 `docker rmi` 可以管理本地镜像。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E6E6FA
    borderColor #9370DB
    fontSize 12
}

skinparam file {
    backgroundColor #FFFACD
    borderColor #DAA520
}

rectangle "Dockerfile" as Dockerfile
file "Base Image Layer
(Ubuntu 20.04)" as Layer1
file "Runtime Layer
(Python 3.11)" as Layer2
file "Dependencies Layer
(Flask 2.3)" as Layer3
file "Application Layer
(App Code)" as Layer4
file "Config Layer
(Config.yaml)" as Layer5
file "EntryPoint Layer
( CMD)" as Layer6

Dockerfile --> Layer1
Dockerfile --> Layer2
Dockerfile --> Layer3
Dockerfile --> Layer4
Dockerfile --> Layer5
Dockerfile --> Layer6

note right of Layer1
  只读镜像层
  Read-only Image Layer
end note

note right of Layer6
  最终镜像
  Final Image
end note

@enduml
```

---

### 什么是 docker 容器 / What is a Docker Container

**Principle:**
A Docker container is a running instance of an image — a lightweight, executable software package that contains everything needed to run an application: code, runtime, system tools, libraries, and settings. Containers run directly on the host machine's kernel, sharing the host kernel resources. Compared to virtual machines, containers don't have a separate Guest OS, so they start faster, use fewer resources, and provide isolation that, while weaker than VMs, is sufficient for most application scenarios.

A container's lifecycle includes five states: Created, Running, Paused, Stopped, and Deleted. A container is essentially one or more processes on the host machine, using Linux Namespace mechanisms for resource isolation (PID, Network, Mount, IPC, etc.), Cgroups for resource limits (CPU, memory, I/O, etc.), and UnionFS (such as overlay2) for layered file systems. The relationship between container and image is like object to class: the image is a static template, the container is a dynamic instance.

**中文:**

Docker 容器是镜像的运行实例，是一个轻量级、可执行的独立软件包。容器包含了运行某个应用所需的全部内容：代码、运行时、系统工具、系统库和设置。容器在宿主机的内核上直接运行，共享宿主机的内核资源，与虚拟机相比，容器没有独立的 Guest OS，因此启动更快、资源占用更少、隔离性虽然弱于虚拟机但足以满足大多数应用场景。

容器的生命周期包括：创建（Created）、运行（Running）、暂停（Paused）、停止（Stopped）和删除（Deleted）五种状态。容器的本质是在宿主机上的一个或多个进程，通过 Linux Namespace 机制实现资源隔离（如 PID、Network、Mount、IPC 等），通过 Cgroups 实现资源限制（如 CPU、内存、I/O 等），通过 UnionFS（如 overlay2）实现分层文件系统。容器与镜像的关系就像是对象与类的关系：镜像是静态的模板，容器是动态的实例。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #E0F0FF
    borderColor #4169E1
    fontSize 12
}

rectangle "宿主机 / Host Machine
(Ubuntu 22.04 Kernel)" as Host
rectangle "Docker Engine" as DockerEngine

rectangle "Container A
(Nginx)" as ContainerA {
    rectangle "可写层
Writable Layer" as WriteLayerA
    rectangle "镜像层叠
Image Layers (RO)" as ImageLayersA
}
rectangle "Container B
(Python App)" as ContainerB {
    rectangle "可写层
Writable Layer" as WriteLayerB
    rectangle "镜像层叠
Image Layers (RO)" as ImageLayersB
}

rectangle "Namespaces
(PID/Net/Mount/IPC)" as NS
rectangle "Cgroups
(CPU/Mem/IO)" as CG
rectangle "OverlayFS
(File System)" as FS

Host --> DockerEngine
DockerEngine --> ContainerA
DockerEngine --> ContainerB
ContainerA --> WriteLayerA
ContainerA --> ImageLayersA
ContainerB --> WriteLayerB
ContainerB --> ImageLayersB
DockerEngine --> NS
DockerEngine --> CG
DockerEngine --> FS

note bottom of Host
  共享宿主机内核
  Shared Host Kernel
end note

note right of NS
  资源隔离
  Resource Isolation
end note

note right of CG
  资源限制
  Resource Limitation
end note

@enduml
```

---

### docker 容器有几种状态 / Docker Container States

**Principle:**
Docker containers have 7 core states: Created, Running, Paused, Restarting, Exited, Dead, and Removed. Created means the container was created with `docker create` but hasn't started yet; filesystem and network resources are allocated but the process hasn't started. Running means the container is active with its main process (PID 1) running. Paused, triggered by `docker pause`, freezes all processes in the container using cgroups freezer, useful for temporary freezing for backup or debugging. Restarting indicates the container is executing a restart policy (like `always` or `on-failure`) with processes stopping or starting. Exited means the container exited normally or abnormally and can be restarted with `docker start`. Dead is a special state, usually appearing when the container can't clean up resources (like undeletable volumes or network endpoints), requiring manual intervention. Removed indicates the container has been deleted from the Docker daemon but may not be fully cleaned up.

In production environments, container state transitions to watch: `docker create` → Created → `docker start` → Running → `docker stop` → Exited → `docker rm` → Removed. The `docker run` command performs create + start in one step. Container exit codes are also important: 0 means normal exit, 125 means Docker daemon error, 126 means the container's ENTRYPOINT/CMD couldn't be executed, 127 means the executable wasn't found, and other non-zero codes mean the process exited due to a signal.

**中文:**

Docker 容器有 7 种核心状态，分别是：Created（已创建）、Running（运行中）、Paused（暂停）、Restarting（重启中）、Exited（已退出）、Dead（已死亡）和 Removed（已删除）。Created 状态表示容器已经过 `docker create` 创建但尚未启动，此时容器已分配了文件系统和网络资源但进程尚未启动。Running 状态表示容器正在运行，容器内的主进程（PID 1）处于活跃状态。Paused 状态通过 `docker pause` 命令触发，容器内所有进程被暂停（使用 cgroups freezer），适用于临时冻结容器进行备份或调试。Restarting 状态表示容器正在执行重启策略（如 `always` 或 `on-failure`），进程正在停止或启动过程中。Exited 状态表示容器正常或异常退出，可以通过 `docker start` 重新启动。Dead 状态是一个特殊状态，通常出现在容器无法清理资源时（如无法删除的存储卷或网络端点），需要手动干预。Removed 状态表示容器已从 Docker daemon 中删除但可能尚未完全清理。

在实际生产环境中，容器的状态转换需要关注：`docker create` → Created → `docker start` → Running → `docker stop` → Exited → `docker rm` → Removed。`docker run` 命令会直接完成 create + start 的两步操作。容器的退出码（exit code）也很重要：0 表示正常退出，125 表示 Docker daemon 本身出错，126 表示无法执行容器的 ENTRYPOINT/CMD，127 表示找不到可执行文件，其他非零退出码表示容器内进程因信号退出。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #F0F8FF
    borderColor #4169E1
    fontSize 11
}

state "Created\n已创建" as Created
state "Running\n运行中" as Running
state "Paused\n暂停" as Paused
state "Restarting\n重启中" as Restarting
state "Exited\n已退出" as Exited
state "Dead\n已死亡" as Dead
state "Removed\n已删除" as Removed

[*] --> Created : docker create
Created --> Running : docker start
Running --> Paused : docker pause
Paused --> Running : docker unpause
Running --> Restarting : docker restart\nrestart policy
Restarting --> Running : (start)
Running --> Exited : docker stop\nexit code
Exited --> Running : docker start
Exited --> Dead : cleanup failed
Dead --> Removed : daemon cleanup
Exited --> Removed : docker rm -v
Removed --> [*]

note right of Running
  进程活跃
  Process Active
end note

note right of Paused
  进程冻结\ncgroups freezer
end note

note right of Exited
  可重新启动
  Restartable
end note

@enduml
```

---

### copy和add命令的区别 / Difference Between COPY and ADD

**Principle:**
`COPY` and `ADD` both copy files from the build context to the image filesystem, but have important differences. `COPY` is the basic copy instruction with syntax `COPY <src> <dest>` — straightforward and clear. `ADD` has all `COPY`'s functionality plus two special abilities: copying from URLs (`ADD http://example.com/file.tar.gz /usr/local/`) and automatically extracting tar files (`ADD app.tar.gz /opt/app/`). Because `ADD`'s behavior is more implicit and can cause unexpected results, official documentation recommends using `COPY` in most cases.

Best practice: prefer `COPY` unless you specifically need `ADD`'s URL download or tar extraction. Benefits of `COPY` include clearer semantics, less ambiguity, and more understandable build logs. For remote URLs, use `RUN curl` or `RUN wget` to download, then `COPY` to the target location — this integrates the download into build cache and is easier to manage. `COPY` supports `--chown` to change file ownership and permissions; `ADD` does not.

**中文:**

`COPY` 和 `ADD` 都是 Dockerfile 中用于将文件从构建上下文复制到镜像文件系统的指令，但两者存在重要区别。`COPY` 是最基础的文件复制指令，语法为 `COPY <src> <dest>`，功能简单明确——将构建上下文中的文件或目录复制到镜像内指定路径。`ADD` 除了具备 `COPY` 的全部功能外，还额外支持两种特殊能力：可以从 URL 复制文件（`ADD http://example.com/file.tar.gz /usr/local/`）和可以自动解压 tar 文件（`ADD app.tar.gz /opt/app/`）。由于 `ADD` 的行为较为隐式且可能导致非预期的结果（如下载的如果是压缩包则不解压而直接复制），官方文档推荐在大多数情况下使用 `COPY`。

选择使用 `COPY` 还是 `ADD` 的最佳实践是：优先使用 `COPY`，除非明确需要 `ADD` 的 URL 下载或 tar 自动解压功能。使用 `COPY` 的好处包括：语义清晰、不容易产生歧义、构建日志更容易理解。对于需要从远程 URL 获取资源的场景，建议先用 `RUN curl` 或 `RUN wget` 下载，再用 `COPY` 复制到目标位置，这样可以将下载过程纳入构建缓存，并且易于理解和管理。`COPY` 指令支持 `--chown` 参数来改变文件的所有权和权限，而 `ADD` 不支持此参数。



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

skinparam arrow {
    Color #696969
}

rectangle "Dockerfile\n构建上下文" as BuildContext {
    file "本地文件\nLocal Files" as LocalFile
    file "远程URL\nRemote URL" as RemoteURL
    file "tar.gz包\nTar Archive" as TarFile
}

rectangle "COPY 指令\n基础复制" as COPY {
    rectangle "✅ 本地文件 → 镜像\nLocal → Image" as COPYLocal
    rectangle "✅ 可指定 --chown\nOwnership Control" as COPYChown
}

rectangle "ADD 指令\n增强复制" as ADD {
    rectangle "✅ 本地文件 → 镜像\nLocal → Image" as ADDLocal
    rectangle "✅ URL → 镜像\nURL → Image" as ADDURL
    rectangle "✅ tar自动解压\nAuto-extract" as ADDTar
}

BuildContext --> COPYLocal : COPY
BuildContext --> ADDLocal : ADD
BuildContext --> ADDURL : ADD
BuildContext --> ADDTar : ADD

note bottom of COPY
  推荐优先使用\nPrefer COPY
end note

note bottom of ADD
  仅在需要时使用\nUse only when needed
end note

@enduml
```

---

### 容器与主机之间的数据拷贝命令 / Data Copy Between Container and Host

**Principle:**
`docker cp` copies files/directories between containers and hosts with syntax `docker cp <container>:<src_path> <dest_path>` or the reverse. It works while the container is running, making it ideal for log export, config inspection, and backup/restore without stopping the container. `docker cp` supports recursive directory copying and cross-container transfers.

Important notes: paths after the container name (after the colon) are relative to the container. Copying behavior is like standard `cp` — creates if non-existent, overwrites if exists. Docker also provides `docker export`/`docker import` for filesystem snapshots (tar archives) and `docker save`/`docker load` for images. `docker cp` doesn't copy hidden files (starting with `.`), while `docker export` exports the full filesystem. Production environments prefer data Volumes for persistent storage over `docker cp`.

**中文:**

`docker cp` 是 Docker 提供的用于在容器和宿主机之间复制文件或目录的命令，语法为 `docker cp <container>:<src_path> <dest_path>` 或 `docker cp <src_path> <container>:<dest_path>`。这个命令可以在容器运行时动态复制文件，不需要停止容器，因此非常适合用于日志导出、配置文件查看、备份恢复等场景。`docker cp` 支持递归复制目录，并且可以跨容器进行文件传输（从容器A到容器B）。

使用 `docker cp` 时需要注意的是：源路径和目标路径都是相对于宿主机而言的（容器名后的冒号用于指定容器内的路径）。复制的行为类似于标准的 `cp` 命令：如果目标不存在则创建，如果目标存在则覆盖。Docker 还提供了 `docker export` 和 `docker import` 命令用于导出/导入容器的文件系统快照（作为 tar 归档），以及 `docker save` 和 `docker load` 用于保存/加载镜像。虽然 `docker cp` 不会复制隐藏文件（以 `.` 开头的文件），但 `docker export` 可以导出完整的文件系统。生产环境中更推荐使用数据卷（Volume）来持久化容器数据，而不是依赖 `docker cp`。



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

rectangle "宿主机文件系统\nHost Filesystem" as HostFS {
    file "app.log" as HostLog
    file "config.yaml" as HostConfig
    file "/backup/data/" as HostBackup
}

rectangle "Container:myapp\n容器文件系统" as ContainerFS {
    file "/app/data/output.log" as ContainerLog
    file "/app/config/settings.yaml" as ContainerConfig
    file "/app/uploads/" as ContainerUploads
}

rectangle "docker cp 命令\nData Transfer" as DockerCP

HostFS --> DockerCP : docker cp\n<container>:/app/log app.log
ContainerFS --> DockerCP : docker cp\nmyapp:/app/config ./
DockerCP --> HostFS : docker cp\n./data <container>:/app/backup
DockerCP --> ContainerFS : docker cp\n<container>:/app/logs ./logs

note bottom of DockerCP
  运行时复制\n  无需停止容器
  Run-time copy
  No container stop needed
end note

@enduml
```

---

### dockerfile的onbuild指令 / ONBUILD Instruction in Dockerfile

**Principle:**
`ONBUILD` is a special Dockerfile instruction that adds a trigger to an image. When this image is used as a base image (in `FROM`), the trigger executes during the child image's build process. Typical use cases: creating a base image template without application code but with predefined build steps; when users build their app image from this base, triggers automatically execute.

How `ONBUILD` works: `ONBUILD <INSTRUCTION>` stores `<INSTRUCTION>` as a trigger in the image metadata. When a new image references this base in `FROM`, Docker registers all triggers before the build begins, then executes them in order. Each `ONBUILD` trigger fires only once — no nesting (child's `ONBUILD` doesn't trigger grandchild). Common patterns: pre-copy source code (`ONBUILD COPY . /app/src`), pre-execute build commands (`ONBUILD RUN make build`), pre-set entry points (`ONBUILD ENV APP_HOME /app`).

**中文:**

`ONBUILD` 是 Dockerfile 中的一个特殊指令，它为镜像添加一个触发器（trigger），当这个镜像被作为其他镜像的基础镜像（FROM）时，触发器会在子镜像的构建过程中执行。`ONBUILD` 的典型使用场景是创建一个基础镜像模板，这个模板本身不包含应用代码，但定义好了构建应用所需的构建步骤，当使用者基于这个基础镜像构建自己的应用镜像时，触发器会自动执行预定义的构建命令。

`ONBUILD` 的工作原理是：Dockerfile 中的 `ONBUILD <INSTRUCTION>` 会将 `<INSTRUCTION>` 存储为镜像的元数据中的一个触发器。当新的镜像在 `FROM` 指令中引用这个镜像时，Docker 会在开始构建之前将所有触发器注册到新镜像的构建过程中，然后按照注册顺序依次执行。每个 `ONBUILD` 触发器只能使用一次，不支持嵌套（子镜像的 `ONBUILD` 不会自动触发孙镜像）。常见的 `ONBUILD` 使用模式包括：预复制源代码目录（`ONBUILD COPY . /app/src`）、预执行构建命令（`ONBUILD RUN make build`）、预设置入口点（`ONBUILD ENV APP_HOME /app`）。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #FFF0F5
    borderColor #DB7093
    fontSize 11
}

rectangle "Base Image\nDockerfile\n(带ONBUILD触发器)" as BaseImage {
    file "FROM ubuntu:20.04" as FromBase
    file "RUN apt-get install -y python3" as RunBase
    file "ONBUILD COPY . /app/src" as Onbuild1
    file "ONBUILD RUN make build" as Onbuild2
    file "ONBUILD CMD [\"python3\", \"app.py\"]" as Onbuild3
}

rectangle "Child Image\n构建阶段" as BuildStage {
    rectangle "触发器注册\nTriggers Registered" as Triggers
    rectangle "执行 ONBUILD COPY\nTrigger 1 Executes" as Trigger1
    rectangle "执行 ONBUILD RUN make\nTrigger 2 Executes" as Trigger2
    rectangle "执行 ONBUILD CMD\nTrigger 3 Executes" as Trigger3
}

rectangle "Child Image\nDockerfile" as ChildDockerfile {
    file "FROM base-image:1.0" as FromChild
    file "# 应用自定义内容\n# Custom App Content" as CustomContent
}

BaseImage --> Onbuild1
BaseImage --> Onbuild2
BaseImage --> Onbuild3

FromChild --> BuildStage
BuildStage --> Triggers
Triggers --> Trigger1
Triggers --> Trigger2
Triggers --> Trigger3

note right of BaseImage
  ONBUILD触发器存储在\n镜像元数据中
  Triggers stored in\nimage metadata
end note

note right of BuildStage
  仅执行一次\n不嵌套传递
  Fires once\nNot inherited
end note

@enduml
```

---

### 如何在生产中监控 docker / Production Docker Monitoring

**Principle:**
Production Docker monitoring spans three layers: container, host, and application. Container-level metrics include: CPU usage (system vs user), memory usage (Working Set, RSS, Cache), network I/O (in/out traffic, packet loss, connections), disk I/O (speed, IOPS), and container count/state distribution. Common tools: `docker stats` for real-time single-node stats; cAdvisor (Container Advisor) by Google for container-level metrics; Prometheus + Grafana for the most popular monitoring/alerting solution with multi-node support and visualization; Datadog/New Relic for commercial one-click Docker monitoring.

Host-level monitoring covers host CPU/memory/disk/network and Docker daemon status (`docker info`). Application-level monitoring uses sidecar or SDK approaches to expose business metrics (latency, error rates, business logs). Container health checks via `HEALTHCHECK` in Dockerfile let Docker periodically verify and update container health status. Production also needs alert rules (e.g., CPU > 80% for 5 minutes triggers alert) and log collection (ELK/Graylog).

**中文:**

生产环境中 Docker 监控通常从三个层面展开：容器层面、宿主机层面和应用层面。容器层面的监控核心指标包括：CPU 使用率（区分系统 CPU 和用户 CPU）、内存使用量（含 Working Set、RSS、Cache）、网络 I/O（入站/出站流量、丢包率、连接数）、磁盘 I/O（读写速度、IOPS）、容器数量和状态分布。常用的容器监控工具有：`docker stats` 提供实时的单节点容器资源使用情况；cAdvisor（Container Advisor）是 Google 开发的开源容器监控工具，可收集容器级别的资源使用和性能指标；Prometheus + Grafana 组合是目前最流行的监控告警解决方案，支持多节点、长时间序列数据存储和可视化仪表盘；Datadog、New Relic 等商业监控平台也提供一键式的 Docker 监控集成。

宿主机层面的监控需要关注宿主机的 CPU、内存、磁盘和网络资源，以及 Docker daemon 的运行状态（`docker info` 可查看 Docker 系统信息）。应用层面的监控则需要结合业务特点，通常使用带外监控（Sidecar 模式）或库嵌入（SDK 方式）来实现应用级指标的暴露（如请求延迟、错误率、业务日志）。容器健康检查通过 `HEALTHCHECK` 指令在 Dockerfile 中定义，Docker 会定期执行检查命令并根据返回结果更新容器健康状态。生产环境中还应配置告警规则（如 CPU > 80% 持续 5 分钟触发告警）和日志收集（ELK/Graylog 等）。



**PlantUML Diagram:**

```plantuml
@startuml
skinparam dpi 160
skinparam roundcorner 10
hide stereotype

skinparam rectangle {
    backgroundColor #F5F5DC
    borderColor #8B8B00
    fontSize 11
}

rectangle "监控数据采集层\nMetrics Collection" as Collection {
    rectangle "docker stats\n实时统计" as DockerStats
    rectangle "cAdvisor\n容器指标" as Cadvisor
    rectangle "Node Exporter\n主机指标" as NodeExporter
    rectangle "应用SDK\nApp SDK" as AppSDK
}

rectangle "监控数据存储层\nMetrics Storage" as Storage {
    rectangle "Prometheus\n时序数据库" as Prometheus
    rectangle "InfluxDB\n时序数据库" as InfluxDB
}

rectangle "监控展示告警层\nVisualization & Alerting" as Display {
    rectangle "Grafana\n可视化仪表盘" as Grafana
    rectangle "AlertManager\n告警通知" as AlertManager
    rectangle "ELK Stack\n日志收集" as ELK
}

Collection --> Prometheus : pull/push
Collection --> InfluxDB : push
Prometheus --> Grafana : query
Prometheus --> AlertManager : alert rules
AlertManager --> Grafana : notification
ELK --> Grafana : log analysis

rectangle "关键监控指标\nKey Metrics" as Metrics {
    file "CPU % / Memory Usage" as CPUMem
    file "Network I/O / Packet Loss" as Network
    file "Disk I/O / Block I/O" as DiskIO
    file "Container Health State" as Health
    file "Application Latency" as AppLatency
}

Metrics -up-> Collection

@enduml
```

---

### 构建docker镜像应该遵循哪些原则 / Docker Image Build Principles

**Principle:**
Production-grade Docker image building follows these principles. First, prefer official images as base (security-audited): `python:3.11-slim`, `node:18-alpine`, `nginx:alpine`. Second, keep images minimal — use Alpine/Slim variants, reduce attack surface and storage, avoid unnecessary tools. Third, single responsibility — one process per container; split related services into separate containers orchestrated via Docker Compose or Kubernetes. Fourth, leverage build cache by placing stable instructions (package managers, system deps) early and frequently-changing ones (code, config) later. Fifth, use `.dockerignore` to exclude irrelevant files, reducing build context. Sixth, never run as root (USER instruction) to reduce security risk. Seventh, inject sensitive info via environment variables or runtime (Kubernetes/Docker Secrets), not hardcoded in images. Eighth, always specify version tags instead of `latest` to avoid unpredictable changes. Ninth, use `EXPOSE` to declare ports and `LABEL` for metadata.

**中文:**

构建生产级 Docker 镜像应遵循以下核心原则。第一，优先选用官方镜像作为基础镜像，官方镜像通常经过安全审计和最佳实践验证，如 `python:3.11-slim`、`node:18-alpine`、`nginx:alpine` 等。第二，镜像层级要尽量精简（Use Small Base Images），推荐使用 Alpine 或 Slim 变体，减少攻击面和存储空间，避免安装不必要的工具和调试程序。第三，单一职责原则（One Image One Concern），每个容器只运行一个进程，将关联服务拆分到不同容器中，通过 Docker Compose 或 Kubernetes 进行编排。第四，利用构建缓存（Build Cache），将不常变化的指令（如包管理器安装、系统依赖）放在 Dockerfile 前部，将频繁变化的指令（如代码复制、配置文件）放在后部。第五，使用 `.dockerignore` 文件排除无关文件，减小构建上下文大小。第六，勿使用 root 用户运行容器（USER 指令），以减少安全风险。第七，敏感信息通过环境变量或运行时注入（Kubernetes Secret、Docker Secret），而非硬编码在镜像中。第八，标签（TAG）要明确指定版本号，避免使用 `latest` 标签导致不可预测的版本变更。第九，在 Dockerfile 中使用 `EXPOSE` 声明容器监听端口，使用 `LABEL` 添加元数据。



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

rectangle "Dockerfile 构建原则\nBuild Principles" as Principles {
    rectangle "1. 官方精简镜像\nSmall Official Base" as P1
    rectangle "2. 单一职责\nSingle Concern" as P2
    rectangle "3. 利用构建缓存\nUse Build Cache" as P3
    rectangle "4. .dockerignore\n减小构建上下文" as P4
    rectangle "5. 非root用户\nNon-root User" as P5
    rectangle "6. 敏感信息外部注入\nSecrets External" as P6
    rectangle "7. 明确版本标签\nSpecific Tags" as P7
    rectangle "8. 多阶段构建\nMulti-stage Build" as P8
}

rectangle "优化效果\nOptimization Effects" as Effects {
    rectangle "镜像体积小\nSmaller Size" as E1
    rectangle "构建速度快\nFaster Builds" as E2
    rectangle "安全性高\nHigher Security" as E3
    rectangle "可维护性强\nMaintainable" as E4
}

P1 --> E1
P2 --> E4
P3 --> E2
P4 --> E1
P5 --> E3
P6 --> E3
P7 --> E4
P8 --> E1

note bottom of Principles
  多阶段构建示例：
  FROM golang:1.21 AS builder
  COPY . .
  RUN go build -o app
  
  FROM alpine:3.18
  COPY --from=builder /app .
  CMD ["./app"]
end note

@enduml
```

---

### 容器退出后数据会丢失么 / Is Data Lost After Container Exits

**Principle:**
By default, data is NOT lost when a container exits. The container's writable layer persists after `docker stop` or exit — only `docker rm` deletes the container and its writable layer. The container filesystem has read-only image layers and a writable container layer. All file modifications during runtime go to the writable layer. Stopping or exiting the container doesn't delete this layer; `docker start` recovers the data. Only `docker rm -v` permanently removes data.

However, the container's writable layer is tied to container lifecycle — not suitable for persistent data. Production uses Docker Volumes or Bind Mounts for persistence. Docker Volumes are managed by Docker in `/var/lib/docker/volumes/`, independent of container lifecycle — data survives container deletion. Bind Mounts map host directories into containers for shared file access. Databases (MySQL, PostgreSQL, Redis), file storage, and log collection should all use Volumes for data persistence.

**中文:**

默认情况下，容器退出（Exited）后数据不会丢失，但容器被删除（`docker rm`）后数据会丢失。容器的文件系统分为多层结构：只读的镜像层（Image Layers）和可写层（Container Layer）。当容器运行时，所有文件修改都写入可写层，包括应用创建的日志、数据库文件、临时数据等。容器停止（`docker stop`）或退出（`docker exit`）时，可写层依然存在，只是容器不再运行。重新启动容器（`docker start`）可以恢复之前的数据，因为可写层没有被删除。只有执行 `docker rm -v` 删除容器时，可写层才会被清理。

然而，容器的可写层是绑定在容器生命周期上的，不适合存储需要持久化的数据。生产环境中的正确做法是使用 Docker Volume 或绑定挂载（Bind Mount）来持久化数据。Docker Volume 由 Docker 管理，存储在宿主机的 `/var/lib/docker/volumes/` 目录下，数据独立于容器生命周期，即使删除容器数据依然保留。绑定挂载则将宿主机上的特定目录映射到容器内部，适用于需要宿主机和容器共享文件的场景。数据库（MySQL、PostgreSQL、Redis）、文件存储、日志收集等场景都应使用 Volume 来持久化数据。



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

rectangle "容器数据持久化方案\nData Persistence Options" as Options {
    rectangle "Docker Volume\nDocker管理卷" as Volume
    rectangle "Bind Mount\n绑定挂载" as BindMount
    rectangle "tmpfs Mount\n内存文件系统" as TmpfsMount
}

rectangle "数据生命周期对比\nData Lifecycle Comparison" as Compare {
    file "容器可写层\nContainer Writable Layer" as ContainerLayer {
        note bottom
          容器删除后丢失
          Lost after container rm
        end note
    }
    
    file "Docker Volume\n/var/lib/docker/volumes/" as VolData {
        note bottom
          独立于容器生命周期
          Independent of container lifecycle
        end note
    }
    
    file "Bind Mount\n/host/path → /container/path" as BindData {
        note bottom
          宿主机与容器共享
          Shared host and container
        end note
    }
}

ContainerLayer -[hidden]-> Volume
Volume --> VolData
BindMount --> BindData
TmpfsMount -[hidden]-> Options

rectangle "典型使用场景\nTypical Use Cases" as UseCases {
    file "Volume: 数据库存储\nDatabase Storage" as DBVolume
    file "Bind Mount: 配置文件\nConfig Files" as ConfigBind
    file "tmpfs: 敏感临时数据\nSensitive Temp Data" as Tempfs
}

Volume --> DBVolume
BindMount --> ConfigBind
TmpfsMount --> Tempfs

note bottom of Compare
  生产环境：数据库、日志等持久化数据必须使用 Volume
  Production: Use Volume for databases, logs, persistent data
end note

@enduml
```

---

## Database Clustering, Common Interview Questions

### MySQL主从复制原理 / MySQL Master-Slave Replication Principle

**Principle:**
MySQL Master-Slave Replication is MySQL's built-in data synchronization mechanism, asynchronously replicating DDL and DML operations from a master database to one or more slaves for redundancy, read/write splitting, and load balancing. The core principle: the master writes all data changes to Binary Log; the slave's I/O thread connects to master, fetches binary log content into local Relay Log; the slave's SQL thread reads Relay Log and replays SQL statements locally, achieving data synchronization with the master.

Key technical points include: binary log format (STATEMENT, ROW, MIXED — affects data volume and precision), replication filtering rules (`replicate-do-db`, `replicate-wild-do-table`), causes of replication lag and monitoring (`Seconds_Behind_Master` in `Show Slave Status\G`), and GTID (Global Transaction Identifier) replication mode (uses unique transaction identifiers, no need to specify log file names/positions, simplifies failover). Production Master-Slave typically works with connection pools and read/write splitting middleware (MySQL Proxy, Atlas, ShardingSphere) for automatic query distribution.

**中文:**

MySQL 主从复制（Master-Slave Replication）是 MySQL 内置的数据同步机制，通过将主库（Master）的数据变更操作（DDL、DML）异步复制到一个或多个从库（Slave），实现数据冗余备份、读写分离和负载均衡。主从复制的核心原理是：主库将所有数据变更记录到二进制日志（Binary Log）中，从库通过 I/O 线程连接主库，请求并拉取主库的二进制日志内容，写入到本地中继日志（Relay Log）；从库再通过 SQL 线程读取中继日志，在本地重放（Replay）这些 SQL 语句，从而实现与主库的数据同步。

主从复制的关键技术点包括：二进制日志格式（STATEMENT、ROW、MIXED三种模式，影响复制的数据量和精度）、主从复制的过滤规则（`replicate-do-db`、`replicate-wild-do-table` 等）、主从延迟的成因与监控（`Show Slave Status\G` 中的 `Seconds_Behind_Master`）、GTID（Global Transaction Identifier）复制模式（基于事务唯一标识符，无需指定日志文件名和位置，简化了故障切换）。主从复制架构在生产环境中通常配合连接池、读写分离中间件（如 MySQL Proxy、Atlas、ShardingSphere）一起使用，实现查询负载的自动分发。



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

### MySQL分库分表 / MySQL Database and Table Sharding

**Principle:**
MySQL sharding (horizontal partitioning) addresses explosive data growth by splitting data across multiple tables/databases based on rules (hash, modulo, range), breaking through single-table/database performance bottlenecks. Database sharding distributes data across separate database instances, each with independent connections and storage. Table sharding splits one large table into multiple structurally identical tables. Sharding solves write bottlenecks, storage limits, and connection bottlenecks, but introduces complexity: cross-shard queries, distributed transactions, and routing.

Core concepts: Sharding Key — the critical field determining data distribution, typically high-frequency and evenly distributed in query conditions. Sharding algorithms: hash sharding (hash modulo, good for uniform distribution), range sharding (by time/ID range, good for ordered access), and directory sharding (mapping table, high flexibility but query overhead). Implementation approaches: middleware layer (ShardingSphere, MyCAT, Cobar) and application layer (client SDKs like Hibernate Shards, MyBatis Sharding). Production also needs global ID generation (Snowflake, UUID), cross-shard JOINs (denormalization, multiple queries), and distributed transactions (2PC, TCC, Saga).

**中文:**

MySQL 分库分表是应对数据量爆发式增长的一种水平扩展策略，核心思想是将一张大表的数据按照某种规则（如哈希、取模、范围）拆分到多张子表甚至多个数据库实例中，从而突破单表或单库的性能瓶颈。分库（Database Sharding）将数据分散到多个数据库实例，每个实例有独立的连接和存储；分表（Table Sharding / Sharding）将单张数据表拆分为多张结构相同的子表。分库分表解决了单库单表的写入瓶颈、存储容量限制和连接数瓶颈问题，但同时也引入了跨库查询、分布式事务、路由定位等复杂度。

分库分表的核心概念包括：分片键（Sharding Key）——决定数据分配到哪个分片的关键字段，通常选择查询条件中频率高且分布均匀的字段；分片算法——常见的包括哈希分片（Sharding Key 的哈希值取模，适合均匀分布的场景）、范围分片（按时间或ID范围划分，适合有序访问模式）和目录分片（维护映射表，灵活性高但增加查询开销）；分片方案——中间件层（ShardingSphere、MyCAT、Cobar）和应用层（客户端SDK如 Hibernate Shards、MyBatis Sharding）两种主流实现方式。生产环境中还需要考虑分片后的全局ID生成（雪花算法、UUID）、跨分片JOIN（宽表冗余、多次查询）、分布式事务（两阶段提交、TCC、Saga）等挑战。



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

### 简述redis高可用的方案 / Redis High Availability Solutions

**Principle:**
Three main Redis HA solutions: Master-Slave Replication, Sentinel, and Cluster. Master-Slave Replication is the basic approach — data asynchronously replicates from master to slaves for redundancy and read/write splitting. Master is read/write, slaves are read-only (default). When master fails, manual failover is needed. This solves backup and read scaling but not automatic failover.

Sentinel (Redis 2.8+) adds automatic failure detection and failover on top of Master-Slave. Sentinel processes monitor master/slave health (PING commands), notify applications of failures, and perform automatic failover (Raft-based election of new master, slaves redirect). A Sentinel cluster can monitor multiple Redis master-slave instances. Sentinel solves automatic failover but may have data loss during failover (async replication).

Cluster mode (Redis 3.0+) is a distributed solution using data sharding (16384 slots) across nodes with master-slave replicas per shard. Cluster provides both sharding and HA — when a slave detects master failure, it votes/elects a new master to continue serving. Cluster also supports online rescaling and automatic failover.

**中文:**

Redis 高可用方案主要有三种：主从复制（Master-Slave Replication）、哨兵模式（Sentinel）和集群模式（Cluster）。主从复制是最基础的高可用方案，通过将数据从主节点（Master）异步复制到从节点（Slave），实现数据冗余和读写分离。主节点可读可写，从节点只读（默认），当主节点故障时，需要手动进行主从切换（Failover）。主从复制解决了数据备份和读负载分担的问题，但不提供自动故障切换能力。

哨兵模式（Sentinel）在主从复制基础上增加了自动故障检测和故障切换能力，是 Redis 2.8+ 引入的高可用解决方案。哨兵是一个独立的进程，负责监控主从节点的存活状态（通过定期发送 PING 命令）、通知（当节点下线时通知应用方）和自动故障转移（当主节点下线时，通过 Raft 协议选举出新的主节点，并更新配置使从节点指向新主节点）。一个哨兵集群可以监控多个 Redis 主从实例。哨兵模式解决了自动 Failover 的问题，但在故障切换期间可能存在数据丢失（异步复制导致）。

集群模式（Cluster）是 Redis 3.0+ 引入的分布式解决方案，通过数据分片（Slot，16384个槽）将数据分布到多个节点上，每个分片可设置主从副本。集群模式同时实现了数据分片和高可用——当某个节点的从节点发现主节点下线时，会发起投票选举（通过PFAIL/FAIL消息），获得多数票的从节点会晋升为主节点，继续提供服务。集群模式还支持在线扩容（重新分片）和自动故障转移。



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

### 简述redis-cluster集群的原理 / Redis-Cluster Cluster Principle

**Principle:**
Redis Cluster (Redis 3.0+) distributes data across nodes using hash slots (16384 total), computed as `CRC16(key) mod 16384`. Each node is responsible for a subset of slots. For a 6-node cluster (3 masters, 3 slaves), slots are roughly distributed: Node A 0-5460, Node B 5461-10922, Node C 10923-16383. When a client connects to any node, it receives full slot mapping (propagated via Gossip protocol), so clients can directly target the correct node without a proxy.

Redis Cluster HA uses master-slave replication and automatic failover. Each master can have one or more slaves. When a master fails, its slave initiates an election: slave requests votes from reachable nodes; if it receives a majority (> N/2 + 1), it promotes to master and starts accepting requests. Cluster also supports online resharding via `redis-trib` or `redis-cli --cluster` for horizontal scaling. Nodes communicate via Gossip protocol (port 16800) to propagate node liveness and topology changes.

**中文:**

Redis Cluster 是 Redis 3.0 引入的分布式数据库集群方案，核心原理是通过哈希槽（Hash Slot）机制将数据自动分布到多个节点上，同时通过主从副本机制实现高可用。Redis Cluster 将整个数据库分为 16384（2^14）个槽（Slot），每个键通过公式 `CRC16(key) mod 16384` 计算其所属的槽编号，然后将这条数据存储在负责该槽的节点上。例如，对于一个 6 节点的集群（3主3从），槽的分配大致为：节点A负责 0-5460，节点B负责 5461-10922，节点C负责 10923-16383。当客户端连接集群中的任意一个节点时，该节点会告知客户端完整的槽分布信息（集群节点信息通过 Gossip 协议在节点间传播），客户端可以直接连接目标节点进行操作，无需经过代理层。

Redis Cluster 的高可用机制基于主从副本和自动故障转移。每个主节点可以有一个或多个从节点，当某个主节点故障时，其对应的从节点会发起选举流程：从节点向集群中所有可达节点发送请求，希望成为新的主节点；如果在投票周期内从节点获得了多数派（> N/2 + 1）节点的投票认可，则晋升为主节点，并开始接收客户端请求。Redis Cluster 还支持在线迁移槽和数据（resharding），通过 `redis-trib` 或 `redis-cli --cluster` 命令可以在线调整槽的分布，实现集群的横向扩容。集群节点间通过 Gossip 协议（基于端口 16800）进行通信，传播节点存活状态、槽分布信息和集群拓扑变化。



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

## System Design, Common Interview Questions

### 2G内存在20亿个整数中找出现次数最多的数 / Find the Most Frequent Integer with 2GB Memory Among 2 Billion

**Principle:**
This classic big data problem tests handling massive data with limited memory. The core approach uses HashMap for frequency counting, but 2 billion integers × 4 bytes = 8GB, far exceeding 2GB. Solution: range partitioning (bucket division) into smaller files, or external sorting + merging.

Better approach: BitMap + segmentation. First determine integer range (32-bit unsigned: 0~2^32-1), divide into 65536 buckets (each bucket = 2^16 consecutive integers). First pass: use 65536 counters (8 bytes each ≈ 512KB) to determine which bucket has the highest count. Second pass: for the heaviest bucket (~30K+ numbers), build a HashMap for precise frequency, return the most frequent number.

Alternative: Divide and Conquer + Hash. Split 2 billion numbers into 1000 small files (~2 million each), use HashMap per file to get each file's TOP1, then merge the 1000 TOP1s to get the global TOP1. Time O(n), space O(bucket_count).

**中文:**

这是一道经典的大数据处理问题，考察的是如何利用有限内存处理海量数据。核心思路是使用哈希表（Hash Table）进行词频统计：将每个整数作为 key 插入哈希表，value 为该整数出现的次数。但 20 亿个整数（假设每个整数 4 字节）直接存入内存需要约 8GB 空间，远超 2GB 限制。解决方案是：先对数据进行范围划分（桶划分），将 20 亿个整数分成多个小文件（桶），使得每个小文件中的数据能够被 2GB 内存处理；或者使用外排序（External Sort）结合归并。

更优的解法是使用 BitMap（位图）结合分段策略：首先确定整数的大致范围（假设为 32 位无符号整数，范围 0~2^32-1），将其划分为多个桶（如 2^16=65536 个桶，每个桶代表 2^16 个连续整数值）。第一次遍历：使用 65536 个计数器（每个计数器 8 字节，约 512KB），确定每个数落在哪个桶中以及该桶的计数。第二次遍历：对于计数最大的桶（如桶内约 3 万多个数），构建一个 HashMap 精确统计频率，返回出现次数最多的数。

另一种经典思路：分而治之 + 哈希。将 20 亿个数划分到 1000 个小文件中（每个文件约 200 万个数），对每个文件用哈希表统计词频，得到每个文件的 TOP1，然后对这 1000 个数进行归并，得到全局 TOP1。时间复杂度 O(n)，空间复杂度 O(bucket_count)。



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

### 100亿个URL中重复词汇的TOPK问题 / TOPK Problem: Finding Most Frequent Words Among 10 Billion URLs

**Principle:**
TOPK is a frequent interview topic — finding the K most frequent elements in massive data. For 10 billion URLs, directly counting all frequencies requires enormous memory. Standard solution: "Divide and Conquer + Hash + Min-Heap" in 3 steps.

Step 1 (Divide and Conquer): Use a hash function (`hash(url) % 1000`) to distribute 10 billion URLs into 1000 small files. Each file averages ~10 million URLs. Identical URLs must go to the same file (hash property).

Step 2 (Frequency Count per file): Use HashMap for each file (~10M entries). If average URL is 100 bytes, each file is ~1GB — manageable. After processing each file, get its TOP 100 most frequent URLs using a min-heap.

Step 3 (Merge for Global TOPK): Merge TOP100 from all 1000 files. The global TOPK must be within all files' local TOPKs. Use a min-heap of size K to merge, resulting in global TOPK.

Time O(n), space O(file_count × K). K depends on memory: with K=100, min-heap holds just 100 elements ≈ 10KB.

**中文:**

TOPK 问题是面试中的高频考点，核心需求是在海量数据中找到出现频率最高的 K 个元素（如 URL、词汇、IP等）。对于 100 亿个 URL 的场景，直接进行全局词频统计需要消耗巨大的内存空间。标准解法是"分而治之 + 哈希 + 小顶堆"的三步走策略。

第一步（分而治之）：将 100 亿个 URL 通过哈希函数（如 `hash(url) % 1000`）分配到 1000 个小文件中。每个小文件平均包含约 1000 万个 URL。此时所有相同的 URL 必定被分到同一个小文件（哈希的性质保证了相同元素必定落在相同桶）。

第二步（词频统计）：对每个小文件（1000万条）使用 HashMap 统计词频。假设平均每个 URL 长度为 100 字节，1000万条 × 100字节 = 1GB，1000 个文件 × 1GB = 1TB，但每个文件本身只有 1GB，可以逐文件处理。每处理完一个小文件，就得到该文件中词频最高的 100 个 URL（用小顶堆/小根堆实现）。

第三步（归并取 TOPK）：将 1000 个小文件各自得到的 TOP100 合并，因为最终的 TOPK 必定在所有文件的局部 TOPK 中。合并时使用一个大小为 K 的小顶堆，遍历所有局部 TOPK 元素，最终得到全局 TOPK。

时间复杂度 O(n)，空间复杂度 O(文件数 × K)。K 的选择根据内存限制：假设 K=100，小顶堆维护 100 个元素，只需约 100 × (URL长度+计数) ≈ 10KB。



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

### 40亿个非负整数中找到未出现的数 / Find Missing Number Among 400 Million Non-negative Integers

**Principle:**
Classic "missing number" problem testing BitMap and binary search. Key info: 400 million non-negative integers (32-bit unsigned range is 0~2^32-1, about 4.3 billion). 400M given means ~300M are missing.

Solution 1: BitMap. Use a 2^32-bit bit map (~512MB) to mark each number's presence. Traverse 400M numbers, set corresponding bit to 1. After traversal, find first bit that is 0 — that's the missing number. For smaller memory (10MB), segment the 2^32 range into buckets and process bucket by bucket.

Solution 2: Binary search (requires data can be fully loaded or read multiple times). If 400M numbers can be read into an array, use binary search: count numbers in range [0, 2^31-1]. If count < 2^31, the missing number is in the high bits; otherwise low bits. Recursively binary search until found. Time O(n log M), space O(1), where M is range size. No extra storage but needs multiple data reads.

**中文:**

这是一道经典的"缺失数"问题，考察的是位图（BitMap）和二分法的应用。关键信息：40 亿个非负整数，内存限制（假设为 1GB 或更小）。32 位无符号整数的范围是 0 ~ 2^32-1（约 43 亿），而题目中只给出 40 亿个数，意味着有约 3 亿个数字是缺失的。

解法一：位图法（BitMap）。使用一个 2^32 bit 的位图（约 512MB）来标记 0~2^32-1 范围内每个数是否出现。遍历 40 亿个数，将对应的 bit 位置为 1。遍历完成后，从头开始找到第一个 bit 为 0 的位置，即为缺失的数。位图法需要 2^32 bits = 4GB/8 = 512MB。如果内存更小（如 10MB），可以分段处理：将 2^32 范围划分为多个桶，每次只处理一个桶。

解法二：二分法（前提：数据可以全部加载到内存或多次读取）。如果 40 亿个数可以直接读取到数组中，可以利用二分查找的思想：统计出现在范围 [0, 2^31-1] 内的数的个数，如果 count < 2^31，则缺失数在高位桶；否则在低位桶。递归二分，直到找到缺失的位。这种方法时间复杂度 O(n log M)，空间复杂度 O(1)，其中 M 是范围大小。二分法不需要额外的位图存储，但需要能够多次读取原始数据。



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

### 40亿个非负整数中算中位数和找出现两次的数 / Find Median and Numbers Appearing Twice in 400 Million Non-negative Integers

**Principle:**
Two sub-problems: median and finding numbers appearing twice.

Part 1: Find median — the 2 billionth largest number (or average of 2Bth and 2Bth+1th for even count). Can't load all 40B into memory. Use binary search + counting: for 32-bit unsigned, range 0~2^32-1. For median m, at least 2B numbers ≤ m and at least 2B ≥ m. For each candidate mid, count numbers ≤ mid (count). If count > 2B, median ≤ mid; otherwise median > mid. Binary search until found. Time O(n log M), where M = 2^32.

Part 2: Find numbers appearing twice. Use BitMap (2^32 bits) or binary bit manipulation. The clever binary approach: for each bit position (0~31), count total 1s across all numbers. If 1s count > 4B (total numbers), some bit was set by a duplicate number (since identical numbers have identical bits). Use this property with range partitioning to narrow down and locate specific duplicates.

**中文:**

这道题有两个子问题：中位数计算和找出出现两次的数。两个问题都可以用类似的分治思想来解决。

第一部分：找中位数。40 亿个数找中位数，即找第 20 亿大的数（或第 20 亿和第 20 亿+1 大的两个数的平均值，如果是偶数个数的话）。由于数据量巨大，无法全部加载到内存中使用排序。解法是使用二分 + 计数的方法：对于 32 位非负整数，范围是 0~2^32-1。对中位数 m，它满足：范围内有至少 20 亿个数 ≤ m，且有至少 20 亿个数 ≥ m。具体做法：对每个候选值 mid，统计小于等于 mid 的数的个数 count。如果 count > 20亿，说明中位数 ≤ mid，否则中位数 > mid。通过二分不断缩小范围，直到找到精确的中位数。时间复杂度 O(n log M)，其中 M 是范围大小（2^32）。

第二部分：找出现两次的数（也称"重复数"）。思路是使用位图或者基于二进制的位操作。如果使用位图，可以用 2^32 bits 的位图来标记每个数是否出现。但更巧妙的方法是利用二进制位本身的特性：对于 0~2^32-1 范围内的每个数，其二进制表示的每一位（0~31 位），如果某一位上 1 的总个数超过 32 亿（因为每个数出现一次），则说明有重复（因为相同的数该位必定相同，多出来的 1 必定来自重复的数）。更进一步，可以用类似的方法分段缩小范围，逐步定位到具体的重复数。



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

### 岛问题 / Island Problem

**Principle:**
The Island Problem is a classic 2D matrix search problem. Given a 2D array (M×N grid) with values 0 (water) or 1 (land), count all connected land regions ("islands"). Islands are defined as land cells (1) connected via up/down/left/right.

Direct solution: DFS or BFS. Traverse each cell; if an unvisited land cell (1) is found, do DFS/BFS to mark all connected land as visited (set to 0 or use visited array). Increment island count per DFS/BFS. Time O(M×N), space O(M×N) for visited or O(M+N) for recursion stack (worst O(M×N)).

Advanced: Union-Find. Treat each cell as a node, union adjacent land cells. Count independent sets (root nodes) = island count. Union-Find excels in dynamic scenarios (matrix updates), supporting near O(α(n)) merge and query.

Advanced variant: Divide and Conquer. Split matrix by row/column, process sub-regions in parallel, handle boundary merging. Particularly important for distributed computing scenarios.

**中文:**

岛问题（Island Problem）是二维矩阵搜索的经典题目。给定一个二维数组（如 M×N 的网格），每个格子的值为 0（代表水）或 1（代表陆地），找到所有陆地的连通区域数量，即"岛屿"的数量。岛屿的定义为：陆地格子（1）通过上下左右四个方向相连形成的一片区域。

最直接的解法是深度优先搜索（DFS）或广度优先搜索（BFS）：遍历矩阵中的每个格子，如果遇到未访问的陆地（值为1），就以该格子为起点进行 DFS/BFS，将所有与之相连的陆地格子标记为已访问（通常改为0或使用 visited 数组），每完成一次 DFS/BFS 岛屿计数加1。这种方法的时间复杂度 O(M×N)，空间复杂度 O(M×N)（用于 visited 数组）或 O(M+N)（递归栈深度，最坏情况为 O(M×N)）。

进阶解法：并查集（Union-Find）方法。将每个格子视为一个节点，相邻的陆地格子进行 union 操作，最后数有多少个独立的集合（根节点数量）即为岛屿数量。并查集方法在动态场景（矩阵不断变化）中更有优势，支持 O(α(n)) 的近乎常数时间的合并和查询操作。

高级变形：分治法解决岛问题（参考 LeetCode "Number of Islands II"）。将矩阵按行或列进行分割，每个子区域独立计算岛屿数量，然后处理边界相邻情况（需要跨边界合并的格子对）。这种分治方法在分布式计算场景中尤为重要，可以并行处理各个子区域。



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

### Redis和MySQL缓存一致性 / Redis-MySQL Cache Consistency

**Principle:**
When Redis serves as MySQL's cache, the core challenge is maintaining consistency between Redis cached data and MySQL source data. Three common patterns: Cache Aside, Read Through, and Write Through, each with pros and cons.

Cache Aside (most common): Read — check cache first, return if hit; on miss, query DB, then write to cache. Write — update DB first, then delete cache key (not update). Delete is lighter than update and avoids the "double write" inconsistency problem under concurrency.

Read Through: Application only interacts with cache; cache service loads from DB on miss. Write Through: Writes update both cache and DB synchronously before returning success.

In distributed/high-concurrency scenarios, Cache Aside faces additional issues: cache penetration (大量请求查询不存在的数据 → use Bloom Filter), cache breakdown (热点 key 过期瞬间大量请求 → use mutex or never-expire strategy), cache avalanche (大量 key 同时过期 → use random TTL or eternal TTL for hot data).

**中文:**

Redis 作为 MySQL 的缓存层时，最核心的问题是如何保证 Redis 缓存数据和 MySQL 原始数据的一致性。常见的方案有三种：Cache Aside、Read Through 和 Write Through，各有优缺点。

Cache Aside（旁路缓存）是最常用的方案。读操作流程：先查缓存（Redis），缓存命中则直接返回；缓存未命中则查数据库（MySQL），并将数据写入缓存。写操作流程：先更新数据库（MySQL），再删除缓存（Delete Key）。注意这里是"删除"而非"更新"，因为删除操作比更新更轻量，且避免了并发场景下缓存更新值与数据库值不一致的问题（双写问题）。

Read Through（读穿透）：应用只与缓存层交互，缓存层负责查询和填充数据（类似代理）。当缓存未命中时，由缓存服务从数据库加载数据并写入缓存。Write Through（写穿透）：写入时同时更新缓存和数据库，两者同步完成后才返回写入成功。

在分布式和高并发场景下，Cache Aside 还可能遇到的问题包括：缓存穿透（大量请求查询不存在的数据）、缓存击穿（热点 key 过期瞬间大量请求击穿到数据库）、缓存雪崩（大量 key 同时过期）。对应的解决方案分别是：布隆过滤器（Bloom Filter）防止缓存穿透、互斥锁或永不过期策略防止缓存击穿、随机 TTL 或热点数据永不过期防止雪崩。



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

### 现场手撕定时器 / Implement a Timer (Live Coding)

**Principle:**
Timer is a core component in backend development, executing tasks at specified times or periodically. Live coding a timer tests understanding of Time Wheel, Min-Heap, or Time Chain data structures and high-performance I/O models (epoll/select).

Solution 1: Min-Heap. Timer node contains deadline and callback function. Store all timer nodes in min-heap; check heap top for expiration each tick. If expired, execute callback and pop; if not, calculate wait time. Insert/delete O(log n), expiry check O(1).

Solution 2: Time Wheel (used in Linux kernel). Ring array where each slot holds a timer linked list. A tick pointer advances periodically; each slot check triggers expired timers. Insert by computing slot from delay. Ordinary time wheel insert/delete O(1); multi-level time wheels (Linux kernel) handle larger delay ranges.

Solution 3: epoll + Min-Heap hybrid. epoll listens on a pipe/eventfd read end; timer writes to pipe on expiry, epoll triggers handler. Ideal for combining with network I/O frameworks — common pattern in high-performance servers like Nginx.

Key points for timer implementation: struct design (deadline + callback + extra data), expiration check logic, time complexity analysis, and thread safety.

**中文:**

定时器（Timer）是后台开发中的核心组件，用于在指定时间或周期性地执行任务。面试中手撕定时器通常考察对时间轮（Time Wheel）、最小堆（Min-Heap）或时间链等数据结构的理解，以及对高性能 I/O 模型（epoll/select）的掌握。

方案一：最小堆实现。定时器节点包含 deadline（到期时间）和回调函数，将所有定时器节点存入最小堆，每次取堆顶检查是否到期，若到期则执行回调并弹出，若未到期则计算等待时间。这种实现插入和删除的时间复杂度为 O(log n)，查询到期定时器为 O(1)。

方案二：时间轮实现（Linux 内核级定时器使用）。时间轮是一个环形数组，每个槽（slot）维护一个定时器链表。指针（tick）周期性推进，每推进一个槽就检查该槽的链表是否有到期定时器。插入定时器时，根据延迟时间计算应落在哪个槽。普通时间轮插入/删除为 O(1)，但多级时间轮（Linux 内核使用）可以处理更大的延迟范围。

方案三：epoll + 最小堆结合。epoll 监听一个管道/eventfd 的读端，定时器到期时向管道写入数据，epoll 返回可读事件后处理定时器。这种方式适合与网络 I/O 框架结合，是高性能服务器（如 Nginx）的常用模式。

手撕定时器的核心要点：结构体设计（deadline + callback + 额外数据）、到期检查逻辑、时间复杂度分析和线程安全性。



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
