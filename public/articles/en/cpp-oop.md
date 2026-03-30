## C++ Object-Oriented Programming, Common Interview Questions

---

### Three Pillars of OOP

**Principle:**
Encapsulation organizes data and operations into an independent unit (class) and uses access specifiers to restrict direct access to internal members. Inheritance creates hierarchical class relationships, allowing subclasses to reuse data and behavior from parent classes. Polymorphism allows the same operation to produce different results on different objects through static or dynamic binding.

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

### Polymorphism Implementation Principle

**Principle:**
C++ polymorphism relies on **vtables (virtual function tables)** and **vptrs (virtual function table pointers)**. When a class contains at least one virtual function, the compiler creates a vtable for that class. Each object contains a hidden vptr at the start of its memory layout, pointing to the class's vtable.

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

### Diamond Inheritance Problem

**Principle:**
Diamond inheritance occurs when class A is base, B and C inherit from A, and D inherits from both B and C, creating two copies of A's members. **Virtual inheritance** using the `virtual` keyword ensures the common base class has only **one shared instance**.

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

### override and final Keywords

**Principle:**
**override** (C++11) explicitly marks a derived class function as overriding a base class virtual function. The compiler checks if the function actually overrides; if not, it produces an error. **final** (C++11) restricts inheritance or overriding.

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

### C++ Type Deduction

**Principle:**
**auto** (C++11) deduces variable type from initializer, ignoring references and cv-qualifiers. **decltype** (C++11) deduces type from expressions, preserving references and cv-qualifiers. **decltype(auto)** (C++14) combines both.

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

### Relationship Between function, lambda, bind

**Principle:**
**std::function** is a type-erased wrapper storing any callable matching a signature. **Lambda** (C++11) creates anonymous callables at compile time with zero-cost abstraction for uncaptured lambdas. **std::bind** (C++11) creates function objects with pre-bound arguments.

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

### Constructor and Destructor Execution Order

**Principle:**
**Constructor order**: Base → Member objects → Derived. **Destructor order**: Derived → Member objects → Base (reverse of construction). During base construction, virtual function calls don't reach derived overrides.

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

### vtable and vptr Creation Timing

**Principle:**
**vtable creation**: At **compile time**, per-class, storing virtual function addresses. **vptr initialization**: During **object construction**, set to point to current class's vtable. In multiple inheritance, multiple vptrs exist—one per direct base class.

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

### Virtual Destructor Purpose

**Principle:**
**Virtual destructors** ensure proper cleanup when deleting derived objects through base pointers. If ~Base() is non-virtual, only ~Base() executes, leaking derived resources. Making the destructor virtual enables the full destruction chain through vtable dispatch.

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

### Smart Pointer Types and Use Cases

**Principle:**
**std::unique_ptr** - exclusive ownership, auto-deletes on destruction, non-copyable but movable. **std::shared_ptr** - shared ownership via reference counting. **std::weak_ptr** - non-owning observer of shared_ptr, solves circular reference problems.

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

### C++11 Features

**Principle:**
**Key C++11 features**: Rvalue references and move semantics enable resource stealing from temporaries. auto and decltype provide type deduction. Lambda expressions create anonymous function objects. Smart pointers automate memory management. nullptr solves NULL ambiguity.

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

### Dynamic vs Static Libraries

**Principle:**
**Static libraries** are linked at compile time—object code is copied into the executable. **Dynamic libraries** are loaded at runtime—only references are stored. Static libraries offer simpler deployment but less flexibility; dynamic libraries save memory through sharing.

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

### Lvalue vs Rvalue References

**Principle:**
**Lvalue references** (`T&`) bind to persistent objects. **Rvalue references** (`T&&`, C++11) bind to temporaries, enabling move semantics—transferring resources instead of copying, significantly improving performance.

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

