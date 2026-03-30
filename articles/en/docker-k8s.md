## Docker/K8s, Common Interview Questions

### What is a Docker Image

**Principle:**
A Docker image is a read-only template that contains everything needed to run a container: the application code, runtime environment, libraries, environment variables, and configuration files. Images use a layered storage architecture where each layer is read-only, and multiple images can share underlying layers, saving storage space and speeding up builds. When a container is created from an image, Docker adds a writable layer on top of the image layers; all modifications to the container are written to this layer without changing the underlying image.

Images are built from Dockerfiles, where each instruction creates a new image layer. Common image operations include: `docker pull` to fetch images from a registry, `docker build` to create images from Dockerfiles, and `docker push` to upload images to a registry. Images are identified by repository name, tag, and digest, with typical format `registry/repository:tag` like `nginx:1.25` or `python:3.11-slim`. Use `docker images` and `docker rmi` to manage local images.

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

### What is a Docker Container

**Principle:**
A Docker container is a running instance of an image — a lightweight, executable software package that contains everything needed to run an application: code, runtime, system tools, libraries, and settings. Containers run directly on the host machine's kernel, sharing the host kernel resources. Compared to virtual machines, containers don't have a separate Guest OS, so they start faster, use fewer resources, and provide isolation that, while weaker than VMs, is sufficient for most application scenarios.

A container's lifecycle includes five states: Created, Running, Paused, Stopped, and Deleted. A container is essentially one or more processes on the host machine, using Linux Namespace mechanisms for resource isolation (PID, Network, Mount, IPC, etc.), Cgroups for resource limits (CPU, memory, I/O, etc.), and UnionFS (such as overlay2) for layered file systems. The relationship between container and image is like object to class: the image is a static template, the container is a dynamic instance.

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

### Docker Container States

**Principle:**
Docker containers have 7 core states: Created, Running, Paused, Restarting, Exited, Dead, and Removed. Created means the container was created with `docker create` but hasn't started yet; filesystem and network resources are allocated but the process hasn't started. Running means the container is active with its main process (PID 1) running. Paused, triggered by `docker pause`, freezes all processes in the container using cgroups freezer, useful for temporary freezing for backup or debugging. Restarting indicates the container is executing a restart policy (like `always` or `on-failure`) with processes stopping or starting. Exited means the container exited normally or abnormally and can be restarted with `docker start`. Dead is a special state, usually appearing when the container can't clean up resources (like undeletable volumes or network endpoints), requiring manual intervention. Removed indicates the container has been deleted from the Docker daemon but may not be fully cleaned up.

In production environments, container state transitions to watch: `docker create` → Created → `docker start` → Running → `docker stop` → Exited → `docker rm` → Removed. The `docker run` command performs create + start in one step. Container exit codes are also important: 0 means normal exit, 125 means Docker daemon error, 126 means the container's ENTRYPOINT/CMD couldn't be executed, 127 means the executable wasn't found, and other non-zero codes mean the process exited due to a signal.

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

### Difference Between COPY and ADD

**Principle:**
`COPY` and `ADD` both copy files from the build context to the image filesystem, but have important differences. `COPY` is the basic copy instruction with syntax `COPY <src> <dest>` — straightforward and clear. `ADD` has all `COPY`'s functionality plus two special abilities: copying from URLs (`ADD http://example.com/file.tar.gz /usr/local/`) and automatically extracting tar files (`ADD app.tar.gz /opt/app/`). Because `ADD`'s behavior is more implicit and can cause unexpected results, official documentation recommends using `COPY` in most cases.

Best practice: prefer `COPY` unless you specifically need `ADD`'s URL download or tar extraction. Benefits of `COPY` include clearer semantics, less ambiguity, and more understandable build logs. For remote URLs, use `RUN curl` or `RUN wget` to download, then `COPY` to the target location — this integrates the download into build cache and is easier to manage. `COPY` supports `--chown` to change file ownership and permissions; `ADD` does not.

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

### Data Copy Between Container and Host

**Principle:**
`docker cp` copies files/directories between containers and hosts with syntax `docker cp <container>:<src_path> <dest_path>` or the reverse. It works while the container is running, making it ideal for log export, config inspection, and backup/restore without stopping the container. `docker cp` supports recursive directory copying and cross-container transfers.

Important notes: paths after the container name (after the colon) are relative to the container. Copying behavior is like standard `cp` — creates if non-existent, overwrites if exists. Docker also provides `docker export`/`docker import` for filesystem snapshots (tar archives) and `docker save`/`docker load` for images. `docker cp` doesn't copy hidden files (starting with `.`), while `docker export` exports the full filesystem. Production environments prefer data Volumes for persistent storage over `docker cp`.

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

### ONBUILD Instruction in Dockerfile

**Principle:**
`ONBUILD` is a special Dockerfile instruction that adds a trigger to an image. When this image is used as a base image (in `FROM`), the trigger executes during the child image's build process. Typical use cases: creating a base image template without application code but with predefined build steps; when users build their app image from this base, triggers automatically execute.

How `ONBUILD` works: `ONBUILD <INSTRUCTION>` stores `<INSTRUCTION>` as a trigger in the image metadata. When a new image references this base in `FROM`, Docker registers all triggers before the build begins, then executes them in order. Each `ONBUILD` trigger fires only once — no nesting (child's `ONBUILD` doesn't trigger grandchild). Common patterns: pre-copy source code (`ONBUILD COPY . /app/src`), pre-execute build commands (`ONBUILD RUN make build`), pre-set entry points (`ONBUILD ENV APP_HOME /app`).

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

### Production Docker Monitoring

**Principle:**
Production Docker monitoring spans three layers: container, host, and application. Container-level metrics include: CPU usage (system vs user), memory usage (Working Set, RSS, Cache), network I/O (in/out traffic, packet loss, connections), disk I/O (speed, IOPS), and container count/state distribution. Common tools: `docker stats` for real-time single-node stats; cAdvisor (Container Advisor) by Google for container-level metrics; Prometheus + Grafana for the most popular monitoring/alerting solution with multi-node support and visualization; Datadog/New Relic for commercial one-click Docker monitoring.

Host-level monitoring covers host CPU/memory/disk/network and Docker daemon status (`docker info`). Application-level monitoring uses sidecar or SDK approaches to expose business metrics (latency, error rates, business logs). Container health checks via `HEALTHCHECK` in Dockerfile let Docker periodically verify and update container health status. Production also needs alert rules (e.g., CPU > 80% for 5 minutes triggers alert) and log collection (ELK/Graylog).

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

### Docker Image Build Principles

**Principle:**
Production-grade Docker image building follows these principles. First, prefer official images as base (security-audited): `python:3.11-slim`, `node:18-alpine`, `nginx:alpine`. Second, keep images minimal — use Alpine/Slim variants, reduce attack surface and storage, avoid unnecessary tools. Third, single responsibility — one process per container; split related services into separate containers orchestrated via Docker Compose or Kubernetes. Fourth, leverage build cache by placing stable instructions (package managers, system deps) early and frequently-changing ones (code, config) later. Fifth, use `.dockerignore` to exclude irrelevant files, reducing build context. Sixth, never run as root (USER instruction) to reduce security risk. Seventh, inject sensitive info via environment variables or runtime (Kubernetes/Docker Secrets), not hardcoded in images. Eighth, always specify version tags instead of `latest` to avoid unpredictable changes. Ninth, use `EXPOSE` to declare ports and `LABEL` for metadata.

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

### Is Data Lost After Container Exits

**Principle:**
By default, data is NOT lost when a container exits. The container's writable layer persists after `docker stop` or exit — only `docker rm` deletes the container and its writable layer. The container filesystem has read-only image layers and a writable container layer. All file modifications during runtime go to the writable layer. Stopping or exiting the container doesn't delete this layer; `docker start` recovers the data. Only `docker rm -v` permanently removes data.

However, the container's writable layer is tied to container lifecycle — not suitable for persistent data. Production uses Docker Volumes or Bind Mounts for persistence. Docker Volumes are managed by Docker in `/var/lib/docker/volumes/`, independent of container lifecycle — data survives container deletion. Bind Mounts map host directories into containers for shared file access. Databases (MySQL, PostgreSQL, Redis), file storage, and log collection should all use Volumes for data persistence.

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

