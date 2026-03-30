## gRPC, Common Interview Questions

### gRPC 服务端启动流程

**Principle:**
gRPC server startup: 1) Create ServerBuilder; 2) Register service implementations via AddService(); 3) Optionally add interceptors; 4) Bind port with AddListeningPort(); 5) BuildAndStart() to begin accepting connections; 6) Wait() for shutdown or AwaitTermination() for graceful shutdown.

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

- 动态客户端：无需预编译proto
- gRPC UI工具： grpcurl、Postman
- 服务治理：发现可用服务
- 契约测试：验证服务端接口


gRPC Server Reflection exposes service definitions at runtime. Enable ServerReflection service on server, then clients can query ListServices() to get service names and GetServiceDescriptor() for full proto definitions. Used by grpcurl, Postman, dynamic clients, and service governance tools.

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

