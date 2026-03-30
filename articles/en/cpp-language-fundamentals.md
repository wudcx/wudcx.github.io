---

### How to Avoid Dangling Pointers

**Principle:**
A dangling pointer is a pointer that references memory that has been freed or is otherwise invalid. Its dangers cannot be underestimated—in C++, dangling pointers are one of the primary causes of program crashes, data corruption, and security vulnerabilities. Common scenarios that produce dangling pointers include: pointers not set to `nullptr` after `delete`, returning addresses of local stack variables, pointers not updated after memory migration, etc. Since pointers only store addresses without the ability to sense memory validity, accessing a dangling pointer leads to undefined behavior.

Core strategies to prevent dangling pointers: First, initialize pointers to `nullptr` immediately upon declaration to establish a clear "empty" state. Second, prefer using smart pointers (`std::unique_ptr`, `std::shared_ptr`) for dynamic memory management—they automatically release resources through RAII. Third, immediately set pointers to `nullptr` after deleting objects, making subsequent dereferences predictably crash rather than access garbage data. Fourth, strictly prohibit returning addresses of local stack variables. Fifth, use AddressSanitizer (ASan) and similar tools during development to detect memory issues.

Best practice in modern C++ is to replace raw pointers with **value semantics** and **smart pointers**, making memory ownership explicit and fundamentally eliminating dangling pointer problems.

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

### Difference Between malloc/free and new/delete

**Principle:**
In C++, `malloc`/`free` and `new`/`delete` represent two fundamentally different memory management paradigms. `malloc` is a C standard library function that only allocates raw bytes of a specified size without involving object construction; while `new` is a C++ expression that not only allocates memory but also calls the constructor to complete object initialization. Similarly, `delete` calls the destructor before releasing memory, while `free` only returns the raw memory block. This essential difference causes their behaviors in object-oriented programming to be completely different.

From technical details: `malloc(size)` returns `void*`, requiring manual byte calculation and being type-unsafe; `new Type` automatically calculates size and returns a typed pointer (`Type*`), being type-safe. If you construct C++ objects with `malloc`, constructors are not called and objects remain uninitialized. Upon allocation failure, `malloc` returns `nullptr`, while `new` throws `std::bad_alloc` exception by default (can be changed via `nothrow`). Additionally, `new` can be overloaded to implement custom memory allocation strategies, while `malloc`/`free` cannot be replaced.

Core principle: **Never mix C and C++ memory management APIs**. C++ objects use `new`/`delete`, C-style memory uses `malloc`/`free`. Modern C++ prefers smart pointers and containers to completely avoid raw memory operations.

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

### extern Keyword的作用

**Principle:**
The `extern` keyword in C/C++ is used to declare external linkage and modify linkage behavior. It does not allocate storage space itself but tells the compiler that this variable or function exists elsewhere. There are three main application scenarios for `extern`: First, declaring global variables or functions to share them across multiple source files; Second, restoring external linkage for `const` global variables (otherwise `const` variables have internal linkage by default); Third, declaring functions written in other languages (such as C functions) in C++ or functions to be called by other languages.

When calling C language functions from C++ files, since C++ supports function overloading while C does not, their symbol naming rules differ. At this point, `extern "C"` needs to be used to tell the compiler to handle function names in C style, avoiding linking errors. Conversely, if you want C++ functions to be called by C code, you also need to declare them with `extern "C"` on the C++ side. The `extern` keyword enables programs to establish correct symbol reference relationships between compilation units, forming the foundation for modular programming and mixed-language programming.

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

### Difference Between strcpy, sprintf and memcpy

**Principle:**
`strcpy`, `sprintf`, and `memcpy` are three commonly used memory/string manipulation functions in C/C++, but despite their similar names, they differ significantly in functionality, usage, and safety. Understanding these differences is crucial for writing secure and efficient code.

`strcpy(dest, src)` is a string copy function that copies the complete string from `src` until encountering the null character `\0` to `dest`. This function assumes `dest` has sufficient space and `src` is a valid `\0`-terminated string. The major problem with `strcpy` is that it **does not check destination buffer size**—if the `src` string length exceeds `dest` capacity, buffer overflow occurs, which is a major source of security vulnerabilities. `strcpy_s` is its safe version that checks size and returns an error code.

`sprintf`/`snprintf` are formatted output functions that write formatted data to strings. `sprintf(formatted_str, "value is %d, name is %s", num, str)` is similar to `printf` but outputs to a buffer instead of the terminal. `snprintf` is the safe version, specifying the maximum number of characters to write to avoid buffer overflow. `sprintf` conveniently performs type conversion and formatting but has lower performance and security issues.

`memcpy(dest, src, n)` is a raw memory copy function that copies exactly `n` bytes from `src` to `dest`, **not caring whether the data content is a string or checking for `\0`**. It copies byte-by-byte, suitable for copying arbitrary data types including structures and arrays. `memcpy` is the highest performance among the three, especially in scenarios requiring precise control over copied bytes.

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

### When Default Constructor is Generated

**Principle:**
A default constructor is a constructor automatically generated by the C++ compiler when a class does not explicitly declare any constructors. More precisely, the compiler generates a default constructor **when the class has no user-declared constructors**. This auto-generated default constructor performs default initialization on fundamental type members (built-in types are not initialized, class types call their default constructors).

Five important situations to note: First, if a class contains reference members, `const` members, or class members with parameterized constructors, the compiler will not generate a default constructor. Second, classes with virtual functions generate vtable pointers, and classes with virtual inheritance generate virtual base class pointers. Third, the generation of default constructors is also affected by `= default` and `= delete`—explicitly declaring `= default` generates a default implementation, while explicitly declaring `= delete` prohibits generation. Fourth, if a class is derived from a base class without a default constructor, and the derived class needs to initialize the base class, the default constructor will not be auto-generated. Fifth, template classes also do not auto-generate default constructors in certain situations.

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

### When Default Copy Constructor is Generated

**Principle:**
A default copy constructor is a copy constructor automatically generated by the compiler to create a new object following copy semantics. **When a class does not explicitly declare a copy constructor**, the compiler generates a default copy constructor. This auto-generated copy constructor performs memberwise copy on data members: for built-in types, bytes are directly copied; for class types, their copy constructors are recursively called.

Five important situations to note: First, if a class contains reference members, because references must be bound at initialization and cannot be rebound, the compiler will not generate a default copy constructor. Second, if a class contains `const` members or types with `const` qualification, the generated copy constructor cannot directly modify these members and needs to use `const` qualification in parameters. Third, classes with virtual functions involve copying vtable pointers, which is safe—the new object's vptr will point to the same vtable as the original object. Fourth, if a class declares move constructors or move assignment operators, the copy constructor may not be automatically generated (depending on context). Fifth, when a class involves virtual inheritance, copy constructor generation is more complex and requires proper handling of virtual base subobjects.

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

### Deep Copy vs Shallow Copy

**Principle:**
Deep copy and shallow copy are two different strategies for handling object copying in object-oriented programming. Their core difference lies in how they treat pointer-type data members. In shallow copy, when performing memberwise copy, pointer-type members only copy the address value—that is, both objects' pointer members point to the same heap memory. In deep copy, new memory is allocated for the new object, and data content is copied over, ensuring the new object and original object are completely independent.

Suppose a class contains a pointer member `int* p`. After shallow copy, both objects share the same memory; modifying one object's data affects the other, which leads to potential memory management issues (such as double-free). Deep copy creates an independent copy; modifying one object does not affect the other at all. In C++, if a class contains pointer members and requires correct copy semantics, you should explicitly define copy constructors and copy assignment operators to implement deep copy. If not explicitly defined, the compiler-generated default copy constructor and default copy assignment operator only perform shallow copy.

For modern C++, the better approach is to avoid using raw pointers and instead use RAII containers like `std::vector`, `std::string`, or smart pointers to manage memory. These containers themselves implement correct copy semantics (deep copy) without manual management.

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

