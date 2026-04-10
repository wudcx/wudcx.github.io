## 1. SOLID设计原则概述

SOLID是面向对象设计的五个基本原则，帮助开发者创建易维护、可扩展的软件系统。

**五大原则详解**：

- **单一职责原则（SRP）**
  - 一个类只负责一项职责
  - 避免职责混杂导致耦合度过高
  - 提高类的内聚性和可复用性

- **开闭原则（OCP）**
  - 对扩展开放，对修改关闭
  - 通过抽象化实现，依赖抽象而非具体实现
  - 是所有设计模式的最终目标

- **里氏替换原则（LSP）**
  - 子类必须能够替换其基类
  - 保证is-a关系成立
  - 是继承体系正确性的基础

- **接口隔离原则（ISP）**
  - 使用多个专门的接口，而不是单一臃肿接口
  - 降低耦合度，减少不必要的依赖
  - 专用接口优于通用接口

- **依赖倒置原则（DIP）**
  - 高层模块不应依赖低层模块，两者都应依赖抽象
  - 抽象不应依赖细节，细节应依赖抽象
  - 核心是"面向接口编程"


SOLID原则核心对比：

| 原则 | 缩写 | 核心目标 | 典型问题 |
|-----|------|---------|---------|
| 单一职责原则 | SRP | 单一职责，高内聚 | 类过大，职责过多 |
| 开闭原则 | OCP | 扩展优于修改 | 修改影响已有功能 |
| 里氏替换原则 | LSP | 继承体系正确 | 子类破坏父类契约 |
| 接口隔离原则 | ISP | 接口专用化 | 臃肿接口，过度依赖 |
| 依赖倒置原则 | DIP | 依赖抽象 | 高层依赖低层实现 |

通过图示理解SOLID五大原则的关系与层次：

```plantuml

@startuml
title SOLID设计原则体系（优化版：层次 + 因果 + 实战导向）

top to bottom direction
skinparam rectangle {
    RoundCorner 20
    Padding 12
}
skinparam shadowing false
skinparam ArrowThickness 1.5

' ===== 层级定义 =====
rectangle "🎯 终极目标\n可维护｜可扩展｜可复用" as GOAL #FFFDE7

rectangle "OCP 开闭原则\n核心：扩展而非修改" as OCP #E3F2FD

rectangle "LSP 里氏替换\n保证继承正确性" as LSP #FFE0B2
rectangle "ISP 接口隔离\n避免臃肿接口" as ISP #F8BBD0
rectangle "DIP 依赖倒置\n面向抽象编程" as DIP #E1BEE7

rectangle "SRP 单一职责\n高内聚｜低耦合" as SRP #C8E6C9

' ===== 主干关系（强调主线）=====
GOAL -down-> OCP : 🎯 核心目标

OCP -down-> DIP : 关键手段
OCP -down-> LSP : 继承保障
OCP -down-> ISP : 接口解耦

' ===== 底层支撑 =====
DIP -down-> SRP
LSP -down-> SRP
ISP -down-> SRP

' ===== 强调DIP核心地位 =====
DIP -[thickness=2]-> OCP : ⭐最关键实现路径

' ===== 核心说明 =====
note right of GOAL
  【设计主线】

  SRP → 解耦基础
  DIP/ISP/LSP → 实现手段
  OCP → 最终目标

  👉 本质：控制“变化的影响范围”
end note

note left of SRP
  【SRP判断标准】

  ✔ 是否只有一个变化原因？
  ✔ 是否容易单独测试？
  ✔ 是否职责清晰？

  ❌ 多职责 = 隐式耦合源头
end note

note right of OCP
  【OCP本质】

  扩展：新增类（策略/继承）
  修改：改已有代码

  👉 用“多态”消灭 if/else
end note

note right of DIP
  【DIP是核心】

  高层模块 → 不依赖实现
  低层模块 → 实现抽象

  👉 依赖方向反转 = 解耦关键
end note

note right of LSP
  【LSP关键点】

  子类 ≈ 父类（行为一致）

  ❌ 重写破坏语义
  ✔ 保持契约一致
end note

note right of ISP
  【ISP核心】

  不要强迫实现不用的方法

  ❌ 大接口（万能接口）
  ✔ 小接口（按需组合）
end note

@enduml
```

---

## 2. 开闭原则（OCP）及相关原则关系

开闭原则是面向对象设计中最核心的原则，是所有设计模式追求的最终目标。

**开闭原则（OCP）定义**：
- 对扩展开放：软件实体应该允许通过继承、组合等方式扩展新行为
- 对修改关闭：已有的代码不应被修改，以保持稳定性

**与开闭原则相关的三大原则**：

| 相关原则 | 与OCP的关系 | 作用机制 |
|---------|------------|---------|
| 里氏替换原则（LSP） | 使能器（Enabler） | 保证继承体系正确，子类可透明替换父类 |
| 接口隔离原则（ISP） | 支持者（Supporter） | 细粒度接口减少不必要的依赖，扩展时修改范围最小化 |
| 依赖倒置原则（DIP） | 实现手段（Implementation） | 依赖抽象而非具体，需求变化时只需实现新抽象类 |


通过图示理解OCP与相关原则的逻辑关系：

```plantuml
@startuml
title 开闭原则(OCP)与相关原则的关系（使能器模型）

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 中心OCP =====
rectangle "🎯 OCP 开闭原则\n\n对扩展开放\n对修改关闭\n\n所有设计模式的终极目标" as OCP #E3F2FD

' ===== 三大支撑原则 =====
rectangle "LSP 里氏替换原则\n\n使能器（Enable）\n\n继承体系正确性\n子类可透明替换父类" as LSP #FFF3E0

rectangle "ISP 接口隔离原则\n\n支持者（Support）\n\n细粒度接口解耦\n减少不必要的依赖" as ISP #FCE4EC

rectangle "DIP 依赖倒置原则\n\n实现手段（Means）\n\n依赖抽象而非具体\n面向接口编程" as DIP #F3E5F5

' ===== 扩展示例 =====
rectangle "📦 扩展示例\n\n通过继承扩展新行为\n不修改已有代码" as EXTEND #E8F5E9

rectangle "🔧 抽象层次\n\nAbstract Base Class\nInterface" as ABSTRACT #F5F5F5

' ===== 连接关系 =====
OCP <-[dashed,thickness=2]-> LSP : 使能关系\nOCP <-[dashed,thickness=2]-> ISP : 支撑关系\nOCP <-[dashed,thickness=2]-> DIP : 实现关系

LSP --> ABSTRACT : 保证继承正确性
ISP --> ABSTRACT : 提供细粒度接口
DIP --> ABSTRACT : 依赖抽象层

EXTEND --> OCP : 扩展行为

' ===== 核心说明 =====
note right of OCP
  **OCP的核心思想**

  扩展 ≠ 修改已有代码
  新增 = 通过扩展而非改动

  👉 策略模式、工厂模式、模板方法
     都是OCP的体现
end note

note left of LSP
  **LSP如何使能OCP**

  如果子类不能替换父类：
  ❌ 继承扩展会破坏程序
  ❌ 无法通过子类扩展功能

  如果子类可以透明替换：
  ✔ 新增子类 = 扩展功能
  ✔ 不影响已有代码

  👉 LSP是OCP的基石
end note

note left of ISP
  **ISP如何支持OCP**

  臃肿接口的问题：
  ❌ 客户被迫依赖不需要的方法
  ❌ 修改一处影响多个客户

  专用接口的好处：
  ✔ 客户只依赖它用的方法
  ✔ 扩展时影响范围小

  👉 ISP减少连锁反应
end note

note left of DIP
  **DIP如何实现OCP**

  依赖具体的缺点：
  ❌ 需求变化 → 修改高层代码
  ❌ 无法替换实现细节

  依赖抽象的好处：
  ✔ 需求变化 → 新增实现类
  ✔ 高层逻辑保持不变

  👉 依赖倒置是OCP的关键手段
end note

' ===== 总结 =====
legend bottom
  | 关系类型 | 含义 |
  |---------|------|
  | 使能器 | LSP保证继承正确，OCP才能通过继承扩展 |
  | 支持者 | ISP提供细粒度，OCP扩展时修改范围最小 |
  | 实现手段 | DIP解耦依赖，OCP扩展不影响高层逻辑 |
endlegend

@enduml
```

---

## 3. 里氏替换原则（LSP）

里氏替换原则是继承体系正确性的基石，保证子类可以透明替换父类而不影响程序正确性。

**里氏替换原则（LSP）定义**：
- 子类型必须能够替换其基类型，而不改变程序的正确性
- 所有使用基类的地方，必然能透明地使用子类对象
- 核心是"is-a"关系的正确性：子类不是父类的子集，就是父类的扩展

**违反LSP的典型场景**：

| 违反类型 | 具体表现 | 后果 |
|---------|---------|------|
| 方法行为改变 | 子类重写方法后行为与父类期望不一致 | 调用者预期被破坏 |
| 前置条件违反 | 子类方法前置条件比父类更宽松 | 父类契约被打破 |
| 后置条件违反 | 子类方法后置条件比父类更严格 | 调用者无法正常工作 |
| 类型能力丧失 | 子类失去父类的某种能力（如企鹅不会飞） | is-a关系不成立 |


通过图示理解LSP的正确的继承与违反LSP的反面教材：

```plantuml
@startuml
title 里氏替换原则(LSP) — 正确继承 vs 违反LSP

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 正确示例 =====
package "✅ 正确继承（符合LSP）" #E8F5E9 {
    rectangle "Bird (基类)\n\n+ fly()\n+ eat()\n\n契约：会飞的鸟" as Bird #E3F2FD

    rectangle "Sparrow (麻雀)\n\n+ fly()  // 正常实现\n+ eat()\n\nis-a: 是鸟，能飞" as Sparrow #C8E6C9

    Bird <|-- Sparrow
}

' ===== 错误示例 =====
package "❌ 违反LSP（企鹅问题）" #FFEBEE {
    rectangle "Bird (基类)\n\n+ fly()\n\n契约：会飞" as Bird2 #E3F2FD

    rectangle "Penguin (企鹅)\n\n+ fly() { 空实现/抛异常 }\n\n⚠️ is-a: 是鸟但不会飞！\n契约被打破！" as Penguin #FFECB3

    Bird2 <|-- Penguin
}

' ===== 正确示例说明 =====
note right of Sparrow
  **符合LSP的设计**

  Sparrow继承Bird：
  ✔ fly()正常实现
  ✔ 可以替换Bird使用
  ✔ is-a关系成立

  调用bird.fly()时：
  → 麻雀正常飞翔
end note

' ===== 错误示例说明 =====
note right of Penguin
  **违反LSP的设计**

  Penguin继承Bird：
  ❌ fly()空实现或抛异常
  ❌ 不能透明替换Bird
  ❌ is-a关系不成立

  调用bird.fly()时：
  → 企鹅...什么也不做？
  → 还是抛出异常？
  ⚠️ 程序行为不可预测
end note

' ===== 修正方案 =====
package "🔧 修正方案：接口隔离" #FFF3E0 {
    rectangle "IFlyable (接口)\n\n+ fly()" as IFlyable #FCE4EC

    rectangle "Bird (基类)\n\n+ eat()\n\n不要求一定会飞" as Bird3 #E8F5E9

    rectangle "Sparrow\n\n+ fly()\n+ eat()" as Sparrow2 #C8E6C9

    rectangle "Penguin\n\n+ eat()\n\n不实现fly" as Penguin2 #C8E6C9

    Bird3 <|-- Sparrow2
    Bird3 <|-- Penguin2
    IFlyable <|.. Sparrow2
}

note right of IFlyable
  **修正方案**

  提取IFlyable接口：
  ✔ 会飞的鸟实现IFlyable
  ✔ 企鹅只继承Bird
  ✔ is-a关系正确
  ✔ LSP得到满足
end note

' ===== LSP核心原则 =====
legend right
  | LSP核心 | 说明 |
  |---------|------|
  | 前置条件 | 子类方法不能比父类更宽松 |
  | 后置条件 | 子类方法不能比父类更严格 |
  | 契约设计 | 用接口隔离不相关的行为 |
endlegend

@enduml
```

---

## 4. 迪米特原则（LoD）/ 最少知识原则

迪米特原则强调对象只应与直接的朋友通信，降低类之间的耦合，提高模块独立性。

**迪米特原则（LoD）定义**：
- 一个对象应当对其他对象有尽可能少的了解
- 只与直接的朋友通信，不与陌生人说话
- "朋友"指：成员变量、输入参数、返回值中出现的对象

**核心要求详解**：

| 通信对象 | 是否可以直接调用 | 说明 |
|---------|----------------|------|
| 自身成员 | ✅ 可以 | 调用自己的方法、字段 |
| 创建的局部对象 | ✅ 可以 | 在方法内部创建的对象 |
| 传入的参数对象 | ✅ 可以 | 方法参数 |
| 成员的成员 | ❌ 不可以 | 通过引用间接访问 |
| 返回的对象 | ✅ 可以 | 方法返回值 |


通过图示理解迪米特原则的正确实现与违反示例：

```plantuml
@startuml
title 迪米特原则(Law of Demeter) — 直接朋友 vs 链式调用

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 正确示例 =====
package "✅ 符合迪米特原则" #E8F5E9 {
    rectangle "Client (客户)\n\n只认识Teacher\n不需要知道Student/Printer" as Client #E3F2FD

    rectangle "Teacher (老师)\n\nstudent: Student\n\n📌 只与直接朋友通信" as Teacher #C8E6C9

    rectangle "Student (学生)\n\n📌 只调用自己的方法" as Student #FFF3E0

    rectangle "Printer (打印机)\n\n📌 是Student的成员" as Printer #FCE4EC

    Client --> Teacher : 调用
    Teacher --> Student : 调用
    Student --> Printer : 调用
}

note right of Teacher
  **正确的调用链**

  Client调用Teacher
  Teacher调用Student
  Student调用Printer

  ✅ 每一步都是直接朋友
  ✅ 不跨越多层访问
end note

' ===== 错误示例 =====
package "❌ 违反迪米特原则" #FFEBEE {
    rectangle "Client (客户)\n\n⚠️ 知道太多细节" as Client2 #E3F2FD

    rectangle "Teacher (老师)" as Teacher2 #C8E6C9

    rectangle "Student" as Student2 #FFF3E0

    rectangle "Printer" as Printer2 #FCE4EC

    Client2 --> Teacher2 : 调用
}

note right of Client2
  **链式调用的问题**

  Client.getTeacher()
    .getStudent()
    .getPrinter()
    .print()

  ❌ Client需要知道
     Teacher/Student/Printer
  ❌ Printer是"陌生人"
  ❌ Teacher内部结构暴露
  ❌ 耦合度极高
end note

Teacher2 --> Student2 :
Student2 --> Printer2 :

' ===== 后果说明 =====
note bottom of Client2
  **违反迪米特原则的后果**

  ❌ Student类变化 → 必须通知Client
  ❌ Printer接口变化 → Client也要改
  ❌ 无法单元测试Teacher
  ❌ 代码脆弱，难以维护
end note

' ===== 正确模式总结 =====
legend right
  | 调用类型 | 是否符合 |
  |---------|---------|
  | this.成员() | ✅ |
  | param.方法() | ✅ |
  | new对象.方法() | ✅ |
  | returnObj.方法() | ✅ |
  | this.getX().getY().do() | ❌ |
endlegend

@enduml
```

---

## 5. 依赖倒置原则（DIP）

依赖倒置原则是实现开闭原则的关键手段，通过依赖抽象而非具体来实现解耦。

**依赖倒置原则（DIP）定义**：
- 高层模块不应依赖低层模块，两者都应依赖抽象
- 抽象不应依赖细节，细节应依赖抽象
- 核心是"面向接口编程"，通过抽象解耦具体实现

**实现方式对比**：

| 实现方式 | 描述 | 优点 | 缺点 |
|---------|------|------|------|
| 构造函数注入 | 通过构造函数传入依赖 | 依赖明确，强制注入 | 构造函数参数多时复杂 |
| Setter注入 | 通过setter方法传入依赖 | 灵活，可更换实现 | 依赖可选，可能为null |
| 接口注入 | 依赖实现注入接口 | 最灵活 | 需要额外接口 |
| 工厂模式 | 通过工厂创建依赖 | 可延迟创建 | 增加工厂类 |


通过图示理解依赖倒置的解耦模型：


---

## 6. 单例模式（Singleton）

单例模式保证一个类仅有一个实例，并提供一个全局访问点。线程安全是多线程环境下的核心问题。

**单例模式核心概念**：
- 保证一个类只有一个实例
- 提供全局访问点
- 线程安全问题至关重要

**三种实现方式对比**：

| 方式 | 线程安全 | 延迟加载 | 性能 | 推荐场景 |
|-----|---------|---------|------|---------|
| 饿汉式 | ✅ 安全 | ❌ 立即加载 | 高 | 确定需要实例时 |
| 懒汉式 | ❌ 不安全 | ✅ 延迟加载 | 低 | 单线程环境 |
| 双重检查锁定 | ✅ 安全 | ✅ 延迟加载 | 中高 | 多线程慎选 |
| Meyers单例 | ✅ 安全(C++11+) | ✅ 延迟加载 | 高 | **推荐方式** |


通过图示理解单例模式的多种实现与内存模型：

- **饿汉式（Eager Loading）**

类加载时直接创建实例，利用类加载机制保证线程安全。

```plantuml
@startuml
title 单例模式（Singleton - 饿汉式）

skinparam shadowing false
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #E3F2FD
    BorderColor #1E88E5
}

skinparam note {
    BackgroundColor #F5F5F5
    BorderColor #BDBDBD
}

class Singleton {
    - Singleton()
    - Singleton(const Singleton&) = delete
    - Singleton& operator=(const Singleton&) = delete
    --
    - instance : Singleton <<static>>
    --
    + getInstance() : Singleton& <<static>>
}

note right of Singleton
<<Eager Singleton (C++17)>>

#pragma once

class Singleton {
private:
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

    inline static Singleton instance{};

public:
    static Singleton& getInstance() {
        return instance;
    }
};

✔ 线程安全（类初始化阶段完成）
✔ header-only 实现
✔ 无锁高性能

❌ 不支持延迟加载
end note

@enduml
```

- **懒汉式（Lazy Loading）- 线程不安全**

延迟加载实例，但多线程环境下存在严重安全问题。

```plantuml
@startuml
title 单例模式（Singleton - 懒汉式）

skinparam shadowing false
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #E8F5E9
    BorderColor #43A047
}

skinparam note {
    BackgroundColor #F5F5F5
    BorderColor #BDBDBD
}

class Singleton {
    - Singleton()
    - Singleton(const Singleton&) = delete
    - Singleton& operator=(const Singleton&) = delete
    --
    - instance : Singleton* <<static>>
    --
    + getInstance() : Singleton* <<static>>
}

note right of Singleton
<<Lazy Singleton (Not Thread Safe)>>

#pragma once

class Singleton {
private:
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

    inline static Singleton* instance = nullptr;

public:
    static Singleton* getInstance() {
        if (instance == nullptr) {
            instance = new Singleton();
        }
        return instance;
    }
};

✔ 支持延迟加载（Lazy Initialization）
✔ 只有在第一次调用时才创建实例

❌ 非线程安全（多线程会创建多个实例）
❌ 存在内存释放问题（需额外处理）
end note

@enduml
```

- **双重检查锁定（Double-Checked Locking）**

在懒加载基础上加锁，但普通实现仍有指令重排问题，需配合volatile。

```plantuml
@startuml
title 单例模式（Singleton - 双重检查锁 DCL）

skinparam shadowing false
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #FFF3E0
    BorderColor #FB8C00
}

skinparam note {
    BackgroundColor #F5F5F5
    BorderColor #BDBDBD
}

class Singleton {
    - Singleton()
    - Singleton(const Singleton&) = delete
    - Singleton& operator=(const Singleton&) = delete
    --
    - instance : Singleton* <<static>>
    - mtx : std::mutex <<static>>
    --
    + getInstance() : Singleton* <<static>>
}

note right of Singleton
<<Double-Checked Locking (C++11)>>

#pragma once
#include <mutex>

class Singleton {
private:
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

    inline static Singleton* instance = nullptr;
    inline static std::mutex mtx;

public:
    static Singleton* getInstance() {
        if (instance == nullptr) {              // 第一次检查
            std::lock_guard<std::mutex> lock(mtx);
            if (instance == nullptr) {          // 第二次检查
                instance = new Singleton();
            }
        }
        return instance;
    }
};

✔ 支持延迟加载
✔ 线程安全（C++11 内存模型保证）

✔ 减少锁开销（只在初始化时加锁）

⚠ 实现复杂度高
⚠ 仍存在生命周期管理问题（new 出来的对象）
end note

@enduml
```

- **Meyers单例**

利用C++11静态局部变量线程安全特性，最简洁、最安全的实现方式。

```plantuml
@startuml
title 单例模式（Singleton - Meyers）

skinparam shadowing false
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #E1F5FE
    BorderColor #039BE5
}

skinparam note {
    BackgroundColor #F5F5F5
    BorderColor #BDBDBD
}

class Singleton {
    - Singleton()
    - Singleton(const Singleton&) = delete
    - Singleton& operator=(const Singleton&) = delete
    --
    + getInstance() : Singleton& <<static>>
}

note right of Singleton
<<Meyers Singleton (C++11)>>

#pragma once

class Singleton {
private:
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

public:
    static Singleton& getInstance() {
        static Singleton instance;  // 局部静态变量
        return instance;
    }
};

✔ 延迟加载（第一次调用时初始化）
✔ 线程安全（C++11 保证局部 static 初始化一次）
✔ 无锁实现（性能最佳）
✔ 自动析构（无内存泄漏）

✔ 实现最简单（推荐使用）
end note

@enduml
```

## 7. 工厂方法与抽象工厂

工厂模式用于创建对象，核心是将对象的创建与使用分离。抽象工厂是工厂方法的扩展，处理产品族的创建。

**工厂模式核心概念**：

| 模式类型 | 核心思想 | 适用场景 | 复杂度 |
|---------|---------|---------|-------|
| 简单工厂 | 根据参数创建对象 | 对象种类少，稳定 | 低 |
| 工厂方法 | 子类决定创建哪个对象 | 需要扩展，适合OCP | 中 |
| 抽象工厂 | 创建产品族 | 多个产品线，需要产品一致性 | 高 |

**工厂方法 vs 抽象工厂对比**：

| 对比维度 | 工厂方法 | 抽象工厂 |
|---------|---------|---------|
| 产品维度 | 单个产品 | 多个相关产品（产品族） |
| 实现方式 | 继承 | 对象组合 |
| 扩展方式 | 新增产品子类 | 新增工厂子类 |
| 典型应用 | 数据库连接 | UI主题、跨平台组件 |

**工厂方法结构图**：

定义创建对象的接口，让子类决定实例化哪个类。

```plantuml
@startuml
title 工厂方法（Factory Method）

skinparam class {
    BackgroundColor #E3F2FD
    BorderColor #1E88E5
}

class Product {
    + operation()
}

class ConcreteProduct {
    + operation()
}

class Creator {
    + factoryMethod() : Product <<abstract>>
    + anOperation()
}

class ConcreteCreator {
    + factoryMethod() : Product
}

Product <|.. ConcreteProduct
Creator <|-- ConcreteCreator
ConcreteCreator .> ConcreteProduct : creates

legend right
  ✔ 子类决定创建哪个对象
  ✔ 符合 OCP 原则
endlegend
@enduml
```

**抽象工厂结构图**：

提供一个创建一系列相关或互相依赖对象的接口，而无需指定它们具体的类。

```plantuml
@startuml
title 抽象工厂（Abstract Factory）

skinparam class {
    BackgroundColor #E8F5E9
    BorderColor #43A047
}

class AbstractProductA {
    + operationA()
}

class AbstractProductB {
    + operationB()
}

class ConcreteFactory1 {
    + createProductA() : AbstractProductA
    + createProductB() : AbstractProductB
}

class ConcreteFactory2 {
    + createProductA() : AbstractProductA
    + createProductB() : AbstractProductB
}

class ProductA1 {
    + operationA()
}

class ProductB1 {
    + operationB()
}

class ProductA2 {
    + operationA()
}

class ProductB2 {
    + operationB()
}

AbstractProductA <|.. ProductA1
AbstractProductA <|.. ProductA2
AbstractProductB <|.. ProductB1
AbstractProductB <|.. ProductB2

AbstractFactory <|.. ConcreteFactory1
AbstractFactory <|.. ConcreteFactory2

ConcreteFactory1 .> ProductA1 : creates
ConcreteFactory1 .> ProductB1 : creates
ConcreteFactory2 .> ProductA2 : creates
ConcreteFactory2 .> ProductB2 : creates

legend right
  ✔ 创建产品族（一组相关产品）
  ✔ 保证产品兼容性
endlegend
@enduml
```

**工厂方法 vs 抽象工厂**：

| 特征 | 工厂方法 | 抽象工厂 |
|-----|---------|---------|
| 产品维度 | 单个产品 | 多个相关产品（产品族） |
| 实现方式 | 继承 | 对象组合 |
| 扩展方式 | 新增产品子类 | 新增工厂子类 |
| 典型应用 | 数据库连接 | UI主题、跨平台组件 |
| 核心目标 | 将创建延迟到子类 | 保证产品兼容性 |

## 8. 代理模式（Proxy）

代理模式为其他对象提供一种代理以控制对这个对象的访问，代理与原对象实现相同接口，客户端无感知。

**代理模式核心概念**：

| 代理类型 | 作用 | 典型应用 |
|---------|------|---------|
| 虚代理（Virtual Proxy） | 延迟加载大对象 | 图片懒加载 |
| 保护代理（Protection Proxy） | 权限控制 | API访问限制 |
| 远程代理（Remote Proxy） | 访问远程对象 | RPC分布式调用 |
| 智能引用（Smart Reference） | 访问时额外处理 | 引用计数、缓存 |
| 日志代理（Logging Proxy） | 方法调用审计 | 调试追踪 |

**代理模式 vs 装饰器模式对比**：

| 对比维度 | 代理模式 | 装饰器模式 |
|---------|---------|-----------|
| 目的 | 控制访问 | 添加职责 |
| 接口 | 与原对象相同 | 与原对象相同 |
| 关系 | 持有原对象引用 | 持有原对象引用 |
| 编译时 | 静态代理/动态代理 | 通常静态 |
| 透明性 | 对客户端透明 | 对客户端透明 |


通过图示理解代理模式的多种类型与执行流程：

```plantuml
@startuml
title 代理模式(Proxy) — 类型分类 + 执行流程

top to bottom direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 代理模式核心结构" #E3F2FD {
    rectangle "Subject (抽象接口)\n\n+ request()\n\n📌 代理和真实对象实现同一接口" as Subject #E3F2FD

    rectangle "RealSubject (真实对象)\n\n+ request()\n  // 真正的业务逻辑" as Real #C8E6C9

    rectangle "Proxy (代理对象)\n\n+ request()\n  // 可在调用前后做处理\n  // 持有RealSubject引用" as Proxy #FFF3E0

    Subject <|.. Real
    Subject <|.. Proxy
    Proxy --> Real : 持有引用\n(可能lazy创建)
}

note right of Proxy
  **代理的核心职责**

  ✅ 控制对RealSubject的访问
  ✅ 可以在调用前/后做额外处理
  ✅ 客户端无感知（接口相同）

  常见增强：
  📌 延迟加载
  📌 权限检查
  📌 日志记录
  📌 缓存结果
end note

' ===== 虚代理 =====
package "🖼️ 虚代理（延迟加载）" #E8F5E9 {
    rectangle "ImageProxy\n\n📌 仅存储URL\n📌 真正需要时才加载\n📌 大图/大文件场景" as VP #E8F5E9

    rectangle "RealImage\n\n📌 真正加载图片\n📌 占用内存" as RI #C8E6C9

    VP --> RI : 延迟创建
}

note right of VP
  **虚代理执行流程**

  1️⃣ Client请求ImageProxy
  2️⃣ ImageProxy返回（不加载）
  3️⃣ 首次调用display()
  4️⃣ Proxy创建RealImage
  5️⃣ 加载并显示

  ✅ 节省内存
end note

' ===== 保护代理 =====
package "🔐 保护代理（权限控制）" #FCE4EC {
    rectangle "ProtectionProxy\n\n📌 检查调用者权限\n📌 权限不足则拒绝\n📌 敏感资源保护" as PP #FCE4EC

    rectangle "SensitiveObject\n\n📌 真正敏感操作" as SO #C8E6C9

    PP --> SO : 权限验证后调用
}

note right of PP
  **保护代理执行流程**

  1️⃣ Client请求ProtectionProxy
  2️⃣ Proxy检查权限
  3️⃣ 权限验证通过
  4️⃣ 调用真实对象
  ❌ 权限不足 → 拒绝访问

  📌 典型应用：API鉴权
end note

' ===== 远程代理 =====
package "🌐 远程代理（RPC）" #FFF3E0 {
    rectangle "RemoteProxy\n\n📌 本地代理对象\n📌 负责网络通信\n📌 序列化/反序列化" as RP #FFF3E0

    rectangle "RemoteService\n\n📌 实际在远程服务器\n📌 真正执行业务" as RS #C8E6C9

    RP --> RS : 网络调用
}

note right of RP
  **远程代理执行流程**

  1️⃣ Client调用本地Proxy
  2️⃣ Proxy序列化请求
  3️⃣ 通过网络发送
  4️⃣ 远程服务处理
  5️⃣ 返回结果序列化
  6️⃣ Proxy反序列化返回

  📌 典型应用：gRPC、Dubbo
end note

' ===== 动态代理 =====
package "⚡ 动态代理（运行时生成）" #E1F5FE {
    rectangle "JDK Proxy\n\n📌 Java反射机制\n📌 要求实现接口\n📌 InvocationHandler" as JDKP #E1F5FE

    rectangle "CGLib Proxy\n\n📌 继承实现\n📌 字节码生成\n📌 可代理无接口类" as CGLIB #E3F2FD
}

legend right
  | 代理类型 | 何时创建 | 实现方式 |
  |---------|---------|---------|
  | 静态代理 | 编译时 | 代码生成 |
  | JDK动态代理 | 运行时 | 反射+接口 |
  | CGLib动态代理 | 运行时 | 继承+字节码 |
endlegend

@enduml
```

---

## 9. 装饰器模式（Decorator）

装饰器模式动态地给对象添加额外职责，比继承更灵活。将功能组合替代继承，实现运行时装饰。

**装饰器模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| Component（抽象组件） | 定义接口 | 核心功能 |
| ConcreteComponent | 具体组件 | 被装饰的对象 |
| Decorator（装饰器） | 持有组件引用 | 转发请求，可添加行为 |
| ConcreteDecorator | 具体装饰器 | 添加具体职责 |

**装饰器模式 vs 代理模式 vs 继承对比**：

| 对比维度 | 装饰器模式 | 代理模式 | 继承 |
|---------|-----------|---------|------|
| 目的 | 添加职责 | 控制访问 | 扩展功能 |
| 灵活性 | 运行时可叠加 | 编译时确定 | 编译时确定 |
| 类数量 | O(n)装饰器 | O(n)代理 | O(n)子类 |
| 组合 | 可无限叠加 | 通常一对一 | 单一继承 |


通过图示理解装饰器模式的叠加效果与执行流程：

```plantuml
@startuml
title 装饰器模式(Decorator) — 叠加效果 + 执行流程

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 装饰器模式核心结构" #E3F2FD {
    rectangle "Component (抽象接口)\n\n+ operation()\n\n📌 核心功能定义" as Comp #E3F2FD

    rectangle "ConcreteComponent\n\n+ operation()\n  // 核心业务逻辑" as CC #C8E6C9

    rectangle "Decorator (装饰器)\n\n+ operation()\n  // 转发给组件\n  // 可添加额外行为" as Dec #FFF3E0

    rectangle "ConcreteDecoratorA\n\n+ operation()\n  // 添加行为A" as CDA #E8F5E9

    rectangle "ConcreteDecoratorB\n\n+ operation()\n  // 添加行为B" as CDB #FCE4EC

    Comp <|.. CC
    Comp <|.. Dec
    Dec <|-- CDA
    Dec <|-- CDB
    Dec --> Comp : wraps\n(持有引用)
}

note right of Dec
  **装饰器的关键**

  📌 Decorator实现Component接口
  📌 持有Component引用（被装饰对象）
  📌 可以在调用前后添加行为
  📌 可以无限叠加装饰器

  ✅ 组合优于继承
end note

' ===== 叠加效果 =====
package "🧅 装饰器叠加效果（I/O流示例）" #E8F5E9 {
    rectangle "Client\n\nBufferedInputStream\n  .read()\n\n📌 最外层装饰器" as Client #E3F2FD

    rectangle "BufferedInputStream\n\n📌 装饰器B\n📌 提供缓冲功能" as Buffered #FFF3E0

    rectangle "DataInputStream\n\n📌 装饰器A\n📌 提供数据类型转换" as Data #FCE4EC

    rectangle "FileInputStream\n\n📌 被装饰的核心组件\n📌 真正读取文件" as File #C8E6C9

    Client --> Buffered
    Buffered --> Data
    Data --> File
}

note right of Client
  **叠加执行流程**

  1️⃣ Client调用buffered.read()
  2️⃣ BufferedDecorator:
     - 先检查缓冲区
     - 有数据直接返回
     - 无数据调用内层
  3️⃣ DataDecorator:
     - 数据类型转换
     - 调用内层读取
  4️⃣ FileInputStream:
     - 从文件读取原始字节

  ✅ 职责可以任意组合
end note

' ===== 叠加顺序 =====
package "🔄 不同叠加顺序" #FFF3E0 {
    rectangle "顺序A：缓冲→压缩\n\nBufferedOutputStream\n  → GzipOutputStream\n  → FileOutputStream\n\n效果：先缓冲，后压缩" as OrderA #E8F5E9

    rectangle "顺序B：压缩→缓冲\n\nGzipOutputStream\n  → BufferedOutputStream\n  → FileOutputStream\n\n效果：先压缩，后缓冲" as OrderB #FCE4EC
}

note right of OrderA
  **顺序影响效果**

  A：数据→缓冲→压缩→文件
     压缩率高（整块压缩）

  B：数据→压缩→缓冲→文件
     传输效率高（压缩后缓冲）

  📌 装饰顺序影响最终效果
end note

' ===== Java I/O示例 =====
package "☕ Java I/O装饰器示例" #E1F5FE {
    rectangle "new BufferedReader(\n  new InputStreamReader(\n    new FileInputStream(\"a.txt\")\n  )\n)\n\n📌 三层装饰器叠加\n📌 FileInputStream核心\n📌 InputStreamReader编码转换\n📌 BufferedReader缓冲" as JavaIO #F3E5F5
}

legend right
  | 特性 | 装饰器模式 |
  |------|---------|
  | 扩展方式 | 运行时组合 |
  | 类数量 | O(n)个装饰器 |
  | 灵活性 | ✅ 任意顺序叠加 |
  | 透明性 | ✅ 接口相同 |
  | vs继承 | ✅ 避免类爆炸 |
endlegend

@enduml
```

---

## 10. 组合模式（Composite）

组合模式将对象组合成树形结构以表示"部分-整体"层次，客户端可以统一处理单个对象和组合对象。

**组合模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| Component（抽象组件） | 声明通用操作 | Leaf和Composite的公共接口 |
| Leaf（叶子节点） | 树的端点 | 没有子节点 |
| Composite（组合节点） | 容器节点 | 可包含Leaf或其他Composite |

**组合模式 vs 装饰器模式对比**：

| 对比维度 | 组合模式 | 装饰器模式 |
|---------|---------|-----------|
| 目的 | 统一处理单个/组合对象 | 添加额外职责 |
| 结构 | 树形层次 | 链式包装 |
| 子节点 | 管理子组件 | 无子节点概念 |
| 典型应用 | 文件系统、组织架构 | I/O流、日志增强 |


通过图示理解组合模式的树形结构与统一处理流程：

```plantuml
@startuml
title 组合模式(Composite) — 树形结构 + 统一处理

top to bottom direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 组合模式核心结构" #E3F2FD {
    rectangle "Component (抽象组件)\n\n+ operation()\n+ add(c: Component)\n+ remove(c: Component)\n+ getChild(i): Component\n\n📌 Leaf和Composite的共同接口" as Component #E3F2FD

    rectangle "Leaf (叶子节点)\n\n+ operation()\n  // 实现具体操作\n  // 子节点操作不支持" as Leaf #C8E6C9

    rectangle "Composite (组合节点)\n\n+ operation()\n  // 调用所有子节点的operation()\n+ add/remove/getChild\n  // 管理子节点" as Composite #FFF3E0

    Component <|-- Leaf
    Component <|-- Composite
    Composite o-> Component : children\n(包含多个子组件)
}

note right of Component
  **组合模式的关键**

  📌 Component定义统一接口
  📌 Leaf实现端点操作
  📌 Composite管理子节点
  📌 递归组合形成树结构

  ✅ 客户端统一处理
     (不关心是Leaf还是Composite)
end note

' ===== 文件系统示例 =====
package "📁 文件系统示例" #E8F5E9 {
    rectangle "FileSystem (抽象)\n\n+ display()\n+ getSize()" as FS #E3F2FD

    rectangle "File (文件)\n\n+ name\n+ size\n+ display() → 打印文件\n+ getSize() → 返回size" as File #C8E6C9

    rectangle "Folder (文件夹)\n\n+ name\n+ children[]\n+ display() → 递归显示\n+ getSize() → 累加子项大小" as Folder #FFF3E0

    FS <|-- File
    FS <|-- Folder
    Folder o-> FS : contains
}

note right of File
  **File（叶子节点）**

  📌 没有子节点
  📌 实现具体业务
  📌 operation()直接完成
end note

note right of Folder
  **Folder（组合节点）**

  📌 管理children[]
  📌 operation() = 遍历所有子组件
  📌 递归处理子项

  Folder
  ├── File: report.pdf (100KB)
  └── SubFolder/
      ├── File: data.xlsx (50KB)
      └── File: chart.png (30KB)

  Folder.getSize() = 100+50+30 = 180KB
end note

' ===== 树形结构 =====
package "🌳 树形结构示意" #FFF3E0 {
    rectangle "根文件夹 /\n\n总大小=所有文件累加" as Root #E3F2FD

    rectangle "子文件夹 src/\n\n大小=子项累加" as Src #C8E6C9

    rectangle "子文件夹 docs/" as Docs #C8E6C9

    rectangle "main.cpp\n100行" as Main #E8F5E9
    rectangle "utils.cpp\n80行" as Utils #E8F5E9
    rectangle "readme.md\n20行" as Readme #E8F5E9

    Root o-> Src
    Root o-> Docs
    Src o-> Main
    Src o-> Utils
    Docs o-> Readme
}

note right of Root
  **统一处理的好处**

  Client调用任意FileSystem的display()

  → File时：直接显示
  → Folder时：递归显示所有子项

  ✅ Client代码无需判断类型
  ✅ 扩展新类型无需修改Client
end note

' ===== 应用场景 =====
legend right
  | 场景 | Component | Leaf | Composite |
  |------|-----------|------|-----------|
  | 文件系统 | FileSystem | File | Folder |
  | UI容器 | Component | Button | Panel |
  | 组织架构 | Employee | 员工 | 部门 |
  | 命令菜单 | MenuItem | 命令 | Menu |
endlegend

@enduml
```

---

## 11. 责任链模式（Chain of Responsibility）

责任链模式将请求沿着处理者链传递，直到有一个处理者处理它。发送者和接收者解耦。

**责任链模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| Handler（抽象处理者） | 定义处理接口，持有后继者 | 公共抽象 |
| ConcreteHandler | 处理请求或传递下家 | 具体处理逻辑 |

**责任链模式 vs 命令模式对比**：

| 对比维度 | 责任链模式 | 命令模式 |
|---------|-----------|---------|
| 目的 | 请求传递 | 请求封装 |
| 发送者 | 不知道谁处理 | 明确指定接收者 |
| 处理 | 链上任一处理者处理 | 单一命令对象 |
| 扩展 | 添加新处理器 | 添加新命令 |


通过图示理解责任链模式的执行流程与变体：

```plantuml
@startuml
title 责任链模式(Chain of Responsibility) — 执行流程 + 变体

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 责任链核心结构" #E3F2FD {
    rectangle "Handler (抽象处理者)\n\n+ handleRequest(request)\n+ setNext(handler)\n\n📌 持有后继者引用\n📌 定义处理接口" as Handler #E3F2FD

    rectangle "ConcreteHandlerA\n\n+ handleRequest(request)\n  if (canHandle) → 处理\n  else → next.handleRequest()\n\n📌 能处理则处理\n📌 不能则传递" as HA #C8E6C9

    rectangle "ConcreteHandlerB" as HB #FFF3E0
    rectangle "ConcreteHandlerC" as HC #E8F5E9

    Handler <|-- HA
    Handler <|-- HB
    Handler <|-- HC

    HA --> Handler : successor\n(指向下一个处理器)
    HB --> Handler
    HC --> Handler
}

note right of HA
  **责任链的核心思想**

  📌 每个Handler持有后继者引用
  📌 能处理则处理，不能则传递
  📌 链尾可以做默认处理

  ✅ 发送者和接收者解耦
  ✅ 处理器可独立扩展
end note

' ===== Web中间件示例 =====
package "🌐 Web中间件示例（洋葱模型）" #E8F5E9 {
    rectangle "Client\n\n请求 →" as Client #E3F2FD

    rectangle "① AuthMiddleware\n\n📌 认证检查\n📌 失败则返回401" as Auth #FFF3E0

    rectangle "② LoggingMiddleware\n\n📌 请求日志\n📌 响应日志" as Log #C8E6C9

    rectangle "③ RateLimitMiddleware\n\n📌 限流检查\n📌 失败则返回429" as Rate #FCE4EC

    rectangle "④ BusinessHandler\n\n📌 真正业务处理" as Biz #E8F5E9

    Client --> Auth : 请求
    Auth --> Log : 传递
    Log --> Rate : 传递
    Rate --> Biz : 传递
    Biz --> Rate : 响应
    Rate --> Log : 响应
    Log --> Auth : 响应
    Auth --> Client : 响应
}

note right of Auth
  **请求处理流程**

  1️⃣ Client发送请求
  2️⃣ Auth检查认证
     → 失败：直接返回401
     → 成功：传递给下一个
  3️⃣ Log记录日志
  4️⃣ Rate检查限流
     → 失败：直接返回429
     → 成功：传递给下一个
  5️⃣ Biz执行业务
  6️⃣ 响应沿链返回

  📌 洋葱模型：层层进入，层层返回
end note

' ===== 审批流程示例 =====
package "📋 审批流程示例" #FFF3E0 {
    rectangle "请求：请假3天" as Req #E3F2FD

    rectangle "组长Handler\n\n审批≤1天\n超期→传递" as L1 #C8E6C9

    rectangle "经理Handler\n\n审批≤3天\n超期→传递" as L2 #FFF3E0

    rectangle "总监Handler\n\n审批≤7天\n超期→拒绝" as L3 #FCE4EC

    rectangle "CEOHandler\n\n审批>7天" as CEO #E8F5E9

    Req --> L1
    L1 --> L2
    L2 --> L3
    L3 --> CEO
}

note right of L1
  **审批链执行**

  请求：请假3天

  组长：>1天 → 传递给经理
  经理：≤3天 → ✅ 审批通过
  总监：不需处理
  CEO：不需处理

  📌 每个层级处理力所能及的
  📌 不能则传递给上级
end note

' ===== 变体对比 =====
package "🔄 责任链变体" #E1F5FE {
    rectangle "纯责任链\n\n📌 Handler要么处理，要么传递\n📌 不能处理时必须传递\n📌 链尾必须有处理者" as Pure #E3F2FD

    rectangle "混合责任链\n\n📌 Handler可以处理后继续传递\n📌 多个Handler处理同一请求\n📌 更灵活但复杂度增加" as Hybrid #FFF3E0
}

legend right
  | 特性 | 纯责任链 | 混合责任链 |
  |------|---------|-----------|
  | 处理方式 | 单一处理 | 可多重处理 |
  | 链尾 | 必须处理 | 可不处理 |
  | 复杂度 | 低 | 高 |
  | 灵活性 | 中 | 高 |
endlegend

@enduml
```

---

## 12. 模板方法模式（Template Method）

模板方法定义算法骨架，将某些步骤延迟到子类。基类负责算法结构，子类负责具体实现。

**模板方法模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| AbstractClass | 定义模板方法(final)，声明抽象方法 | 算法骨架 |
| ConcreteClass | 实现抽象方法 | 具体步骤 |

**模板方法 vs 策略模式对比**：

| 对比维度 | 模板方法 | 策略模式 |
|---------|---------|---------|
| 复用方式 | 继承 | 组合 |
| 算法结构 | 父类控制 | 子类控制 |
| 扩展点 | 抽象方法/Hook | 整个算法 |
| 运行时刻 | 编译时确定 | 运行时可切换 |


通过图示理解模板方法的骨架结构与执行流程：

```plantuml
@startuml
title 模板方法模式(Template Method) — 算法骨架 + 执行流程

top to bottom direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 模板方法核心结构" #E3F2FD {
    rectangle "AbstractClass (抽象类)\n\n+ templateMethod() : final\n  ────────────────────\n  step1()      // 抽象\n  step2()      // 抽象\n  hook()       // 可选覆盖\n  ────────────────────\n  📌 final防止子类修改算法结构" as AC #E3F2FD

    rectangle "ConcreteClassA" as CA #C8E6C9
    rectangle "ConcreteClassB" as CB #FFF3E0

    AC <|-- CA
    AC <|-- CB
}

note right of AC
  **模板方法的关键**

  📌 templateMethod()是final的
     不能被子类重写
     保证算法结构不变

  📌 step1()、step2()是抽象方法
     必须由子类实现

  📌 hook()是钩子方法
     子类可选择覆盖

  ✅ 父类控制算法骨架
  ✅ 子类实现具体步骤
end note

' ===== 执行流程 =====
package "🔄 模板方法执行流程" #E8F5E9 {
    rectangle "① Client调用\n\nsubClass.templateMethod()" as Step1 #E3F2FD

    rectangle "② 调用step1()\n\n抽象方法 → 调用子类实现" as Step2 #FFF3E0

    rectangle "③ 调用step2()\n\n抽象方法 → 调用子类实现" as Step3 #FCE4EC

    rectangle "④ 可选调用hook()\n\n钩子方法 → 子类可覆盖" as Step4 #E8F5E9

    rectangle "⑤ 算法完成" as Step5 #C8E6C9

    Step1 -down-> Step2
    Step2 -down-> Step3
    Step3 -down-> Step4
    Step4 -down-> Step5
}

note right of Step2
  **执行流程说明**

  1️⃣ Client调用子类的templateMethod()
  2️⃣ 父类templateMethod()控制流程
  3️⃣ step1()调用 → 子类A的实现
  4️⃣ step2()调用 → 子类A的实现
  5️⃣ hook()调用 → 子类A的实现或默认
  6️⃣ 返回结果

  📌 算法结构由父类控制
end note

' ===== 排序示例 =====
package "📊 排序算法示例" #FFF3E0 {
    rectangle "Sorter (抽象排序器)\n\n+ sort(data[]) : final\n  ─────────────────\n  compare(a, b)   // 抽象\n  swap(i, j)     // 具体\n  ─────────────────\n  模板方法控制：\n  for i=0 to n\n    for j=i+1 to n\n      if compare(data[i], data[j]) > 0\n        swap(data[i], data[j])" as Sorter #E3F2FD

    rectangle "QuickSorter\n\n+ compare(a, b)\n  return a < b ? -1 : 1\n\n📌 快速排序算法" as Quick #C8E6C9

    rectangle "MergeSorter\n\n+ compare(a, b)\n  return a < b ? -1 : 1\n\n📌 归并排序算法" as Merge #FFF3E0

    Sorter <|-- Quick
    Sorter <|-- Merge
}

note right of Sorter
  **排序算法模板**

  模板方法sort():
  📌 控制比较排序流程
  📌 compare()由子类实现
  📌 swap()是具体方法

  QuickSorter:
  → compare实现快排比较逻辑

  MergeSorter:
  → compare实现归并比较逻辑

  ✅ 算法复用，细节扩展
end note

' ===== Hook方法 =====
package "🪝 Hook方法示例" #E1F5FE {
    rectangle " CaffeineBeverage\n  (咖啡因饮料)\n\n+ prepare() : final\n  ────────────────\n  boil()\n  brew()     // 抽象\n  addCondiments()\n  hook(): 是否加调料？\n  pour()\n\n📌 hook()默认空实现\n   子类可覆盖" as CB #E3F2FD

    rectangle "Coffee\n\n+ brew() → 冲泡咖啡\n+ hook() → 加牛奶/糖？" as Coffee #C8E6C9

    rectangle "Tea\n\n+ brew() → 泡茶\n+ hook() → 加柠檬？" as Tea #FFF3E0

    CB <|-- Coffee
    CB <|-- Tea
}

note right of CB
  **Hook方法的作用**

  📌 可选扩展点
  📌 默认空实现
  📌 子类选择是否覆盖

  Coffee:
  → hook()返回true
  → 加牛奶糖

  Tea:
  → hook()返回false
  → 不加调料

  ✅ 提供灵活扩展点
end note

' ===== 应用场景 =====
legend right
  | 场景 | AbstractClass | ConcreteClass |
  |------|--------------|----------------|
  | 排序 | Sorter | QuickSorter, MergeSorter |
  | 测试框架 | TestCase | 具体测试用例 |
  | 框架生命周期 | Framework | 应用 |
  | 数据加工 | Processor | 具体处理器 |
endlegend

@enduml
```

---

## 13. 策略模式（Strategy）

策略模式定义一系列算法，将每个算法封装起来，使它们可以互换。策略是独立的，客户端可选择不同算法。

**策略模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| Strategy（抽象策略） | 定义算法接口 | 公共抽象 |
| ConcreteStrategy | 具体算法实现 | 封装具体算法 |
| Context（上下文） | 持有策略引用，执行算法 | 不关心算法细节 |

**策略模式 vs 状态模式对比**：

| 对比维度 | 策略模式 | 状态模式 |
|---------|---------|---------|
| 目的 | 算法互换 | 状态切换 |
| 算法关系 | 相互独立，可互换 | 状态相互关联 |
| 上下文影响 | 不影响策略 | 策略可能改变上下文 |
| 扩展方式 | 新增策略类 | 新增状态类 |
| 使用场景 | 算法选择 | 状态机 |


通过图示理解策略模式的结构与执行流程：

```plantuml
@startuml
title 策略模式(Strategy) — 算法封装 + 执行流程

left to right direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 策略模式核心结构" #E3F2FD {
    rectangle "Strategy (抽象策略)\n\n+ algorithm()\n\n📌 定义算法接口\n📌 所有策略实现此接口" as Strategy #E3F2FD

    rectangle "ConcreteStrategyA\n\n+ algorithm()\n  // 算法A实现\n\n📌 策略A：快排" as CSA #C8E6C9

    rectangle "ConcreteStrategyB\n\n+ algorithm()\n  // 算法B实现\n\n📌 策略B：归并排序" as CSB #FFF3E0

    rectangle "ConcreteStrategyC\n\n+ algorithm()\n  // 算法C实现\n\n📌 策略C：堆排序" as CSC #E8F5E9

    rectangle "Context (上下文)\n\n- strategy: Strategy*\n+ setStrategy(s)\n+ execute() → 调用algorithm()\n\n📌 持有策略引用\n📌 不关心具体算法" as Context #FCE4EC

    Strategy <|.. CSA
    Strategy <|.. CSB
    Strategy <|.. CSC
    Context --> Strategy : uses
}

note right of Context
  **策略模式的关键**

  📌 Context持有Strategy指针
  📌 不实现算法，只调用算法
  📌 算法可以运行时切换

  ✅ 算法独立，可复用
  ✅ 客户端与算法解耦
end note

' ===== 执行流程 =====
package "🔄 策略切换执行流程" #E8F5E9 {
    rectangle "Client\n\ncontext.setStrategy(\n  new QuickSort()\n)\ncontext.execute()\n\n📌 运行时选择策略" as Client #E3F2FD

    rectangle "Context\n\nstrategy->algorithm()\n\n📌 调用当前策略的算法\n📌 策略可动态切换" as Ctx #FFF3E0

    rectangle "QuickSort\n\nalgorithm() → 快排" as QS #C8E6C9

    Client --> Ctx : setStrategy
    Ctx --> QS : algorithm()
}

note right of Client
  **策略切换示例**

  场景：数据量<1000时

  1️⃣ Client设置策略为QuickSort
  2️⃣ Context.execute()调用快排
  3️⃣ 数据量>10000时
  4️⃣ Client切换策略为MergeSort
  5️⃣ Context.execute()调用归并

  ✅ 根据情况动态选择算法
end note

' ===== 支付示例 =====
package "💳 支付系统示例" #FFF3E0 {
    rectangle "PaymentStrategy\n(支付策略接口)\n\n+ pay(amount)" as PS #E3F2FD

    rectangle "AlipayStrategy\n\n+ pay(amount)\n  → 调用支付宝SDK" as Alipay #C8E6C9

    rectangle "WechatPayStrategy\n\n+ pay(amount)\n  → 调用微信支付SDK" as Wechat #FFF3E0

    rectangle "CreditCardStrategy\n\n+ pay(amount)\n  → 调用银行卡SDK" as Credit #FCE4EC

    rectangle "OrderContext\n\n- strategy: PaymentStrategy\n+ checkout(amount)" as Order #E8F5E9

    PS <|.. Alipay
    PS <|.. Wechat
    PS <|.. Credit
    Order --> PS : uses
}

note right of Order
  **支付策略示例**

  用户选择支付方式：
  → 选择支付宝
  → Order设置AlipayStrategy
  → checkout()调用支付宝支付

  切换支付方式：
  → 选择微信支付
  → Order.setStrategy(WechatPay)
  → 下次checkout()用微信

  ✅ 支付方式可扩展
  ✅ 用户可自由选择
end note

' ===== 策略 vs 状态 =====
package "⚖️ 策略 vs 状态 关键区别" #E1F5FE {
    rectangle "策略模式\n\n📌 算法之间相互独立\n📌 Context不改变策略\n📌 客户端决定用哪个策略\n📌 like: 不同排序算法" as StrategyP #E3F2FD

    rectangle "状态模式\n\n📌 状态之间相互关联\n📌 状态可能改变Context\n📌 Context内部决定状态转换\n📌 like: 订单状态机" as StateP #FFF3E0
}

legend right
  | 区别 | 策略模式 | 状态模式 |
  |------|---------|---------|
  | 算法关系 | 独立，可互换 | 关联，可能转换 |
  | 决定者 | 客户端 | Context内部 |
  | 扩展方式 | 新增策略类 | 新增状态类 |
  | 典型应用 | 算法选择 | 状态机 |
endlegend

@enduml
```

---

## 14. 观察者模式（Observer）

观察者模式定义对象间一对多依赖，当一个对象状态变化，所有依赖它的对象都会收到通知。

**观察者模式核心概念**：

| 组成元素 | 职责 | 说明 |
|---------|------|------|
| Subject（主题/被观察者） | 维护观察者列表，状态变化通知 | 管理观察者 |
| Observer（观察者） | 定义更新接口 | 接收通知 |

**推模型 vs 拉模型对比**：

| 模型 | 通知方式 | 数据传递 | 优点 | 缺点 |
|-----|---------|---------|------|------|
| 推模型 | 主动推送 | 完整数据 | 高效，减少请求 | 可能传递不需要的数据 |
| 拉模型 | 被动拉取 | 仅通知 | 按需获取 | 需要额外请求 |


通过图示理解观察者模式的发布-订阅流程与内存模型：

```plantuml
@startuml
title 观察者模式(Observer) — 发布-订阅流程 + 内存模型

top to bottom direction
skinparam rectangle {
    RoundCorner 15
    Padding 10
}
skinparam shadowing false

' ===== 核心结构 =====
package "📐 观察者模式核心结构" #E3F2FD {
    rectangle "Subject (主题/被观察者)\n\n- observers: list<Observer*>\n\n+ attach(o)\n+ detach(o)\n+ notify()\n\n📌 维护观察者列表\n📌 状态变化时通知" as Subject #E3F2FD

    rectangle "Observer (抽象观察者)\n\n+ update(data)\n\n📌 定义通知接口" as Observer #C8E6C9

    rectangle "ConcreteSubject\n\n- state\n+ getState()\n+ setState() → 触发notify()" as CS #FFF3E0

    rectangle "ConcreteObserverA\n\n+ update(data)\n  // 处理通知" as COA #E8F5E9

    rectangle "ConcreteObserverB\n\n+ update(data)\n  // 处理通知" as COB #FCE4EC

    Subject o-> Observer : observers
    Subject <|-- CS
    Observer <|.. COA
    Observer <|.. COB
}

note right of Subject
  **观察者模式的关键**

  📌 Subject维护观察者列表
  📌 attach()添加观察者
  📌 detach()移除观察者
  📌 notify()通知所有观察者

  ✅ 一对多依赖
  ✅ 自动通知，无需轮询
end note

' ===== 执行流程 =====
package "🔔 通知执行流程" #E8F5E9 {
    rectangle "① Client\n\nsubject.attach(observerA)\nsubject.attach(observerB)\nsubject.setState(newState)" as Step1 #E3F2FD

    rectangle "② Subject.setState()\n\n📌 状态变更\n📌 调用notify()" as Step2 #FFF3E0

    rectangle "③ Subject.notify()\n\n遍历observers列表\n逐个调用observer.update()" as Step3 #FCE4EC

    rectangle "④ ObserverA.update()\n\n处理通知\n获取最新数据" as Step4 #E8F5E9

    rectangle "⑤ ObserverB.update()\n\n处理通知\n获取最新数据" as Step5 #C8E6C9

    Step1 -down-> Step2
    Step2 -down-> Step3
    Step3 -down-> Step4
    Step3 -down-> Step5
}

note right of Step3
  **notify()执行细节**

  for each observer in observers:
      observer->update(data)

  📌 遍历所有观察者
  📌 逐个发送通知
  📌 观察者独立处理

  ⚠️ 注意线程安全
end note

' ===== 推拉模型 =====
package "📨 推模型 vs 拉模型" #FFF3E0 {
    rectangle "推送模型 (Push)\n\nnotify(data):\n  observer->update(data)\n\n📌 Subject主动推送数据\n📌 传递完整数据\n📌 可能造成数据浪费" as Push #E3F2FD

    rectangle "拉取模型 (Pull)\n\nnotify():\n  observer->update(this)\n\n📌 仅发送通知\n📌 Observer主动拉取数据\n📌 调用subject->getState()" as Pull #C8E6C9
}

note right of Push
  **推模型**

  subject.notify(data)
  → observer收到完整数据
  → 无需再次请求

  ✅ 高效（减少请求）
  ❌ 可能传递不需要的数据
end note

note right of Pull
  **拉模型**

  subject.notify(this)
  → observer收到subject引用
  → observer主动获取需要的数据

  ✅ 按需获取
  ❌ 需要额外请求
end note

' ===== MVC应用 =====
package "📊 MVC架构应用" #E1F5FE {
    rectangle "Model (Subject)\n\n- data\n- views: list<Observer>\n\n📌 数据是Subject\n📌 状态变化通知视图" as Model #E3F2FD

    rectangle "ViewA (Observer)\n\n+ update()\n  重新渲染页面A" as ViewA #C8E6C9

    rectangle "ViewB (Observer)\n\n+ update()\n  重新渲染页面B" as ViewB #FFF3E0

    rectangle "Controller\n\n📌 处理用户输入\n📌 修改Model\n📌 Model自动通知所有View" as Ctrl #FCE4EC

    Model o-> ViewA
    Model o-> ViewB
    Ctrl --> Model : 修改数据
}

note right of Model
  **MVC中的观察者模式**

  用户操作 → Controller
  Controller → Model.setData()
  Model.notify() → 所有View更新

  ✅ Model与View解耦
  ✅ 一个Model供多个View
  ✅ 实时同步更新
end note

' ===== Java内置支持 =====
package "☕ Java/Observable示例" #F5F5F5 {
    rectangle "java.util.Observable\n\n+ addObserver(o)\n+ removeObserver(o)\n+ notifyObservers()\n\n📌 JDK内置被观察者" as JavaObs #E3F2FD

    rectangle "java.util.Observer\n\n+ update(o, arg)\n\n📌 JDK内置观察者接口\n📌 Java 9已废弃\n📌 建议使用PropertyChangeSupport" as JavaObs2 #C8E6C9
}

legend right
  | 特性 | 说明 |
  |------|------|
  | 一对多 | 一个Subject，多个Observer |
  | 自动通知 | 状态变化自动通知 |
  | 动态注册 | 运行时添加/移除观察者 |
  | 线程安全 | 注意并发问题 |
endlegend

@enduml
```

---

## 总结：设计模式分类与对比

三大类设计模式的核心对比：

| 分类 | 目的 | 核心思想 | 典型模式 |
|-----|------|---------|---------|
| **创建型** | 对象创建 | 封装创建细节，解耦构造 | 单例、工厂、抽象工厂 |
| **结构型** | 对象组合 | 组合优于继承 | 代理、装饰器、组合 |
| **行为型** | 交互分离 | 关注对象职责 | 责任链、模板方法、策略、观察者 |

**模式选择指南**：

| 场景 | 推荐模式 |
|------|---------|
| 全局唯一实例 | 单例模式 |
| 对象创建解耦 | 工厂模式 |
| 多产品族创建 | 抽象工厂 |
| 控制访问权限 | 代理模式 |
| 动态添加职责 | 装饰器模式 |
| 树形结构处理 | 组合模式 |
| 请求传递处理 | 责任链模式 |
| 算法骨架复用 | 模板方法模式 |
| 算法灵活切换 | 策略模式 |
| 状态变化通知 | 观察者模式 |
