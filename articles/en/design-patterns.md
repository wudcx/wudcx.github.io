## Design Patterns, Common Interview Questions
**English Translation**: The five SOLID principles are: Single Responsibility (one class, one purpose), Open/Closed (open for extension, closed for modification), Liskov Substitution (subclasses replaceable for base classes), Interface Segregation (many specific interfaces vs one general), and Dependency Inversion (depend on abstractions, not concretions).

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

- MVC/MVVM架构（Model变化更新View）
- GUI事件系统（按钮点击监听）
- 消息订阅发布系统
- 股票行情推送
- 邮件/消息订阅通知

