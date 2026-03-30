## 设计模式，常见题型
*   **面对对象中有哪些设计原则**
1. **单一职责原则（SRP）**：一个类只负责一项职责，避免职责混杂导致耦合度过高。

2. **开闭原则（OCP）**：对扩展开放，对修改关闭。通过抽象化实现，依赖抽象而非具体实现。

3. **里氏替换原则（LSP）**：子类必须能够替换其基类，is-a关系成立，保证继承的正确性。

4. **接口隔离原则（ISP）**：使用多个专门的接口，而不是单一臃肿接口，降低耦合度。

5. **依赖倒置原则（DIP）**：高层模块不应依赖低层模块，两者都应依赖抽象。

**English Translation**: The five SOLID principles are: Single Responsibility (one class, one purpose), Open/Closed (open for extension, closed for modification), Liskov Substitution (subclasses replaceable for base classes), Interface Segregation (many specific interfaces vs one general), and Dependency Inversion (depend on abstractions, not concretions).

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

---

*   **简述开闭原则，哪些原则与它相关，分别是什么关系？**

**开闭原则（OCP）**：对扩展开放，对修改关闭。软件实体应通过扩展实现变化，而不是修改已有代码。这是最核心的面向对象设计原则，是所有模式的最终目标。

**与开闭原则相关的原则**：
1. **里氏替换原则（LSP）** 是开闭原则的基础：只有当子类可以替换基类且不影响程序运行时，才能通过继承扩展功能。LSP保证继承体系的正确性，是OCP的**使能器**。

2. **接口隔离原则（ISP）** 帮助实现OCP：通过细粒度接口，解耦不必要的依赖，使得扩展时修改范围最小化。

3. **依赖倒置原则（DIP）** 是OCP的关键手段：依赖抽象而非具体，当需求变化时，只需实现新的抽象具体类，无需修改高层逻辑。

**English Translation**: Open/Closed Principle states that software entities should be open for extension but closed for modification. OCP is the ultimate goal of OO design. LSP enables OCP by ensuring proper inheritance hierarchies. ISP supports OCP by providing fine-grained interfaces. DIP is the key means to achieve OCP by depending on abstractions.

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

---

*   **什么是里氏替换原则**

**里氏替换原则（LSP）**：子类型必须能够替换其基类型，而不改变程序的正确性。简言之，所有使用基类的地方，必然能透明地使用子类对象。核心是"is-a"关系的正确性：子类不是父类的子集，就是父类的扩展。

**违反LSP的典型场景**：
- 子类重写方法后行为与父类期望不一致
- 子类方法前置条件比父类更宽松，后置条件更严格
- 子类新增方法导致父类使用者产生困惑

**English Translation**: Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Subtypes must be substitutable for their base types. The key is proper "is-a" relationship.

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

---

*   **什么是迪米特原则**

**迪米特原则（LoD）/ 最少知识原则**：一个对象应当对其他对象有尽可能少的了解，只与直接的朋友通信。"朋友"指当前对象的成员变量、输入参数、返回值中出现的对象。降低类之间的耦合，提高模块独立性。

**核心要求**：
- 只调用当前对象的成员
- 只调用传入方法参数的对象
- 不在方法内部创建陌生类实例
- 不暴露其他对象的内部结构

**English Translation**: Law of Demeter (Principle of Least Knowledge) states that an object should only interact with its direct friends - objects that are members, parameters, or created locally. It reduces coupling between components.

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

---

*   **什么是依赖倒置原则**

**依赖倒置原则（DIP）**：高层模块不应依赖低层模块，两者都应依赖抽象。抽象不应依赖细节，细节应依赖抽象。核心是"面向接口编程"，通过抽象解耦具体实现。

**实现方式**：
- 模块间通过抽象接口交互
- 变量声明使用抽象类型（接口或抽象类）
- 构造函数注入依赖（Dependency Injection）
- 使用工厂模式或IoC容器管理依赖

**English Translation**: Dependency Inversion Principle states that high-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

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

---

*   **单例模式多线程？**

**单例模式**：保证一个类仅有一个实例，并提供一个全局访问点。线程安全问题至关重要——多线程环境下可能创建多个实例。

**饿汉式（线程安全）**：类加载时直接创建实例，缺点是可能造成资源浪费。

**懒汉式（线程不安全）**：延迟加载，但多线程下会创建多个实例。

**双重检查锁定（线程安全）**：在加锁前后都检查实例是否为空，兼顾性能和线程安全。volatile关键词防止指令重排。

**Meyers单例（推荐）**：利用静态局部变量特性（C++11后线程安全），代码最简洁。

// 双重检查锁定
        if (instance == nullptr) {  // 第一次检查
            if (instance == nullptr) {  // 第二次检查

// Meyers单例（最推荐）
        static Singleton instance;  // C++11线程安全

**English Translation**: Singleton pattern ensures a class has only one instance with global access. Thread safety is critical. Double-checked locking uses volatile and double checking. Meyers singleton leverages static local variable thread safety (C++11+).

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

**English Translation**: Factory Method defines an interface for creating objects, letting subclasses decide. Abstract Factory provides an interface for creating families of related objects without specifying concrete classes.

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

**English Translation**: Proxy pattern provides a surrogate to control access to another object. Types include static, dynamic (JDK/CGLib), virtual (lazy loading), protection (access control), and remote proxy.

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

**应用场景**：延迟加载（图片懒加载）、远程调用（RPC）、安全代理（接口鉴权）、缓存代理。

---

*   **什么是装饰器模式？应用场景是什么？**

**装饰器模式（Decorator）**：动态地给对象添加额外职责，比继承更灵活。将功能组合替代继承，实现运行时装饰。

**核心思想**：装饰器与被装饰对象实现相同接口，装饰器持有被装饰对象引用，可在调用前后添加行为。

**English Translation**: Decorator pattern dynamically adds responsibilities to objects. Decorators implement the same interface as the wrapped object, providing flexible runtime composition instead of inheritance.

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

**应用场景**：
- Java I/O类库（Bufferedxxx包装原生流）
- UI组件装饰（窗口+边框+滚动条）
- Web请求/响应拦截器
- 电商促销叠加计算

---

*   **什么是组合模式，应用场景是什么？**

**组合模式（Composite）**：将对象组合成树形结构以表示"部分-整体"层次。客户端可以统一处理单个对象和组合对象。

**核心**：抽象组件声明通用操作，叶子节点和容器节点都实现它。容器节点可包含叶子或其他容器。

**English Translation**: Composite pattern composes objects into tree structures to represent part-whole hierarchies. Clients can treat individual objects and compositions uniformly.

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

**English Translation**: Chain of Responsibility passes requests along a chain of handlers. Each handler decides to process the request or pass it to the next handler, decoupling sender and receiver.

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

**English Translation**: Template Method defines the skeleton of an algorithm, deferring some steps to subclasses. The base class provides the algorithm structure, subclasses provide specific implementations.

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

**English Translation**: Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategies are independent; clients can select different algorithms.

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

**English Translation**: Observer pattern defines a one-to-many dependency between objects. When the subject's state changes, all its observers are notified automatically.

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

