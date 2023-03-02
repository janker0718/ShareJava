# 核心功能

配置文件、日志记录、国际化、任务执行和调度、测试等。

本节将深入了解 Spring Boot 的详细信息。在这里，您可以了解您可能想要使用和定制的关键功能。如果您还没有这样做，您可能需要阅读 [“入门”](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html#getting-started) 和 [“使用 Spring Boot 开发”](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using) 部分，这样您就有了良好的基础知识。

## 1. SpringApplication

SpringApplication 类提供了一种方便的方法来引导从main() 方法启动的 Spring 应用程序。在许多情况下，可以委托给静态 SpringApplication.run 方法，如下例所示：

**Java**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication


@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}	
```

当应用程序启动时，您应该看到类似于以下输出的内容：

```shell
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.0.2)

2023-01-20T00:27:31.367Z  INFO 21229 --- [           main] o.s.b.d.f.s.MyApplication                : Starting MyApplication using Java 17.0.6 with PID 21229 (/opt/apps/myapp.jar started by myuser in /opt/apps/)
2023-01-20T00:27:31.385Z  INFO 21229 --- [           main] o.s.b.d.f.s.MyApplication                : No active profile set, falling back to 1 default profile: "default"
2023-01-20T00:27:34.696Z  INFO 21229 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2023-01-20T00:27:34.769Z  INFO 21229 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2023-01-20T00:27:34.770Z  INFO 21229 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.5]
2023-01-20T00:27:35.264Z  INFO 21229 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2023-01-20T00:27:35.266Z  INFO 21229 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 3786 ms
2023-01-20T00:27:36.384Z  INFO 21229 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-01-20T00:27:36.401Z  INFO 21229 --- [           main] o.s.b.d.f.s.MyApplication                : Started MyApplication in 6.557 seconds (process running for 7.483)
```

默认情况下，将显示 INFO 日志消息，包括一些相关的启动详细信息，例如启动应用程序的用户。如果您需要除 INFO 之外的日志级别，可以按照日志级别中的描述进行设置。应用程序版本是使用主应用程序类的包中的实现版本确定的。通过将 spring.main.log-startup-info 设置为 false ，可以关闭启动信息日志记录。这还将关闭应用程序活动配置文件的日志记录。

要在启动期间添加额外的日志记录，可以在 SpringApplication 的子类中重写 logStartupInfo(boolean)。

### 1.1 启动失败

如果您的应用程序无法启动，注册的 FailureAnalyzers 将有机会提供专用错误消息和解决问题的具体操作。例如，如果您在端口 8080 上启动一个web 应用程序，并且该端口已在使用中，您应该看到类似于以下消息的内容：

```shell
***************************
APPLICATION FAILED TO START
***************************

Description:

Embedded servlet container failed to start. Port 8080 was already in use.

Action:

Identify and stop the process that is listening on port 8080 or configure this application to listen on another port.
```

> Spring Boot 提供了许多 FailureAnalyzer 实现，您可以添加自己的实现。

如果没有失败分析器能够处理异常，您仍然可以显示完整的状态报告，以更好地了解发生了什么问题。为此，需要为 org.springframework.boot.autoconfigure.loging.ConditionEvaluationReportLoggingListener 启用调试属性或启用 debug 日志记录。

例如，如果您正在使用 java-jar 运行应用程序，则可以按如下方式启用 debug 属性：

```shell
$ java -jar myproject-0.0.1-SNAPSHOT.jar --debug
```

### 1.2 延迟初始化

SpringApplication 允许应用程序延迟初始化。如果启用了延迟初始化，则会根据需要而不是在应用程序启动期间创建bean 。因此，启用延迟初始化可以减少应用程序启动所需的时间。在 web 应用程序中，启用惰性初始化将导致许多 web相关 bean 在收到 HTTP 请求之前无法初始化。

延迟初始化的一个缺点是它会延迟发现应用程序的问题。如果错误配置的 bean 被延迟初始化，那么在启动期间将不再发生故障，只有在初始化bean时，问题才会变得明显。还必须注意确保 JVM 有足够的内存来容纳应用程序的所有 bean，而不仅仅是在启动期间初始化的 bean 。出于这些原因，默认情况下不启用延迟初始化，建议在启用延迟初始化之前对 JVM 的堆大小进行微调。

可以使用 SpringApplicationBuilder 上的 lazyInitialization 方法或 SpringApplication 上的 setLazyInitialize 方法以编程方式启用 Lazy 初始化。或者，可以使用 spring.main.lazy-initialization 属性启用它，如下例所示：

**Properties**

```properties
spring.main.lazy-initialization=true
```

**Yaml**

```yaml
spring:
  main:
    lazy-initialization: true
```



>  如果希望在对应用程序的其余部分使用惰性初始化时禁用某些 bean 的惰性初始化，则可以使用 @lazy(false) 注释将它们的惰性属性显式设置为 false  。

### 1.3 自定义横幅 （Banner）

启动时打印的横幅可以通过将 banner.txt 文件添加到类路径或将 spring.anner.location 属性设置为此类文件的位置来更改。如果文件的编码不是 UTF-8 ，则可以设置 spring.anner.charset 。

在 banner.txt 文件中，可以使用环境中可用的任何键以及以下任何占位符：

*列表 1. Banner 参数*

| 参数                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `${application.version}`                                     | 应用程序的版本号，如 “MANIFEST.MF” 中所声明的。例如，“`Implementation-Version: 1.0`” 打印为“`1.0`”。 |
| `${application.formatted-version}`                           | 应用程序的版本号，如在 “MANIFEST.MF” 中声明的，并格式化为显示（用括号括起来，前缀为“v”）。例如“（`v1.0`）”。 |
| `${spring-boot.version}`                                     | 您正在使用的Spring Boot版本。例如 “`3.0.2`”。                |
| `${spring-boot.formatted-version}`                           | 您正在使用的Spring Boot版本，格式为显示（用括号括起来，前缀为“`v`”）。例如“`（v3.0.2）`”。 |
| `${Ansi.NAME}` (or `${AnsiColor.NAME}`, `${AnsiBackground.NAME}`, `${AnsiStyle.NAME}`) | 其中“NAME”是ANSI转义码的名称。详细信息请参见  [`AnsiPropertySource`](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/ansi/AnsiPropertySource.java) |
| `${application.title}`                                       | 应用程序的标题，如 “MANIFEST.MF” 中声明的。例如，“Implementation-Title: MyApp” 打印为 “MyApp” 。 |

>  `SpringApplication.setBanner（…)`  如果希望以编程方式生成横幅，则可以使用方法。使用 `org.springframework.boot.Banner`  接口并实现自己的`printBanner()` 方法。

您还可以使用 spring.main.banner-mode 属性来确定横幅是否必须在`System.out` (`console`) 打印 、发送到配置的记录器（日志）或根本不生成（关闭）。

打印的横幅以以下名称注册为单例bean： springBootBanner 。



> 只有在使用 SpringBoot 启动程序时，`${application.version}` 和 `${appliation.formatted-version}`  属性才可用。如果您正在运行一个未打包的 jar 并使用`java-cp ＜classpath＞＜mainclass＞`启动它，则不会解析这些值。

> 这就是为什么我们建议您始终使用 `java org.springframework.boot.loader.JarLauncher` 启动未打包的 jar 。这将在构建类路径和启动应用程序之前初始化 `application.*` `banner` 变量。

### 1.4 自定义 SpringApplication

如果 SpringApplication 默认值不符合您的口味，您可以创建一个本地实例并对其进行自定义。例如，要关闭横幅，您可以写下：

**Java**

```java
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(MyApplication.class);
        application.setBannerMode(Banner.Mode.OFF);
        application.run(args);
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.Banner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args) {
        setBannerMode(Banner.Mode.OFF)
    }
}
```

传递给 `SpringApplication` 的构造函数参数是 Spring beans 的配置源。在大多数情况下，这些是对 `@Configuration` 类的引用，但也可以是对 `@Component` 类的直接引用。

也可以使用 `application.properties` 文件配置 SpringApplication 。有关详细信息，请参阅 [外部化配置](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config) 。

有关配置选项的完整列表，请参阅 [SpringApplication Javadoc](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/SpringApplication.html) 。

### 1.5 流畅构建者 API

如果您需要构建 `ApplicationContext` 层次结构（具有父/子关系的多个上下文），或者如果您喜欢使用 “流畅” 的构建器API，则可以使用 `SpringApplicationBuilder` 。

`SpringApplicationBuilder` 允许您将多个方法调用链接在一起，并包括父方法和子方法，以创建层次结构，如以下示例所示：

**Java**

```java
new SpringApplicationBuilder()
        .sources(Parent.class)
        .child(Application.class)
        .bannerMode(Banner.Mode.OFF)
        .run(args);
```

**Kotlin**

```kotlin
SpringApplicationBuilder()
    .sources(Parent::class.java)
    .child(Application::class.java)
    .bannerMode(Banner.Mode.OFF)
    .run(*args)
```

创建 ApplicationContext 层次结构时存在一些限制。例如，Web 组件必须包含在子上下文中，并且相同的环境用于父上下文和子上下文。有关详细信息，请参阅 [SpringApplicationBuilder Javadoc](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/builder/SpringApplicationBuilder.html) 。

#### 1.6 应用程序可用性

当部署在平台上时，应用程序可以使用 Kubernetes Probe 等基础设施向平台提供有关其可用性的信息。Spring Boot 包括对常用的 “活跃” 和 “就绪” 可用状态的开箱即用支持。如果您正在使用 Spring Boot 的 actuator 支持，那么这些状态将作为健康端点组公开。

此外，您还可以通过将 ApplicationAvailability 接口注入到自己的 bean 中来获得可用性状态。

#### 1.6.1 活跃状态

应用程序的 “活跃” 状态告诉它的内部状态是否允许它正常工作，或者如果它当前出现故障，是否可以自行恢复。中断的“活跃”状态意味着应用程序处于无法恢复的状态，基础结构应重新启动应用程序。

> 通常，“活力”状态不应基于外部检查，如 [健康检查](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health) 。如果发生了这种情况，出现故障的外部系统（数据库、Web API、外部缓存 ）将触发整个平台的大规模重启和级联故障。

`Spring Boot` 应用程序的内部状态主要由 `Spring ApplicationContext` 表示。如果应用程序上下文已成功启动，则 `Spring Boot` 假定应用程序处于有效状态。一旦上下文被刷新，应用程序就被认为是活动的，请参阅 [Spring Boot 应用程序生命周期和相关的应用程序事件](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.application-events-and-listeners) 。

#### 1.6.2 准备状态

应用程序的 “就绪” 状态告诉应用程序是否已准备好处理流量。失败的 “就绪” 状态告诉平台现在不应该将流量路由到应用程序。这通常发生在启动过程中，在处理 `CommandLineRunner` 和 `ApplicationRunner` 组件时，或者在应用程序决定太忙而无法处理额外流量时的任何时候。

一旦调用了应用程序和命令行运行程序，就认为应用程序已准备就绪，请参阅 Spring Boot  [应用程序生命周期和相关的应用程序事件](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.application-events-and-listeners) 。

> 启动期间预期运行的任务应由 CommandLineRunner 和 ApplicationRunner 组件执行，而不是使用 Spring 组件生命周期回调（如 @PostConstruct ）。

#### 1.6.3 管理应用程序可用性状态

应用程序组件可以随时通过注入 ApplicationAvailability 接口并调用其上的方法来检索当前可用性状态。更常见的情况是，应用程序希望监听状态更新或更新应用程序的状态。

例如，我们可以将应用程序的“就绪”状态导出到一个文件中，以便 Kubernetes“exec Probe” 可以查看该文件：

**Java**

```java
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MyReadinessStateExporter {

    @EventListener
    public void onStateChange(AvailabilityChangeEvent<ReadinessState> event) {
        switch (event.getState()) {
            case ACCEPTING_TRAFFIC:
                // create file /tmp/healthy
                break;
            case REFUSING_TRAFFIC:
                // remove file /tmp/healthy
                break;
        }
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.availability.AvailabilityChangeEvent
import org.springframework.boot.availability.ReadinessState
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class MyReadinessStateExporter {

    @EventListener
    fun onStateChange(event: AvailabilityChangeEvent<ReadinessState?>) {
        when (event.state) {
            ReadinessState.ACCEPTING_TRAFFIC -> {
                // create file /tmp/healthy
            }
            ReadinessState.REFUSING_TRAFFIC -> {
                // remove file /tmp/healthy
            }
            else -> {
                // ...
            }
        }
    }

}
```

当应用程序中断且无法恢复时，我们还可以更新应用程序的状态：

**Java**

```java
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.LivenessState;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class MyLocalCacheVerifier {

    private final ApplicationEventPublisher eventPublisher;

    public MyLocalCacheVerifier(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void checkLocalCache() {
        try {
            // ...
        }
        catch (CacheCompletelyBrokenException ex) {
            AvailabilityChangeEvent.publish(this.eventPublisher, ex, LivenessState.BROKEN);
        }
    }

}
```

**Kotlin**

```java
import org.springframework.boot.availability.AvailabilityChangeEvent
import org.springframework.boot.availability.LivenessState
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component

@Component
class MyLocalCacheVerifier(private val eventPublisher: ApplicationEventPublisher) {

    fun checkLocalCache() {
        try {
            // ...
        } catch (ex: CacheCompletelyBrokenException) {
            AvailabilityChangeEvent.publish(eventPublisher, ex, LivenessState.BROKEN)
        }
    }

}
```

Spring Boot 提供了 [Kubernetes HTTP 探针，用于执行器健康端点的 “Liveness” 和 “Readiness”](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.kubernetes-probes) 。您可以在专用部分获得有关 [在 Kubernetes 上部署 Spring Boot 应用程序 ](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html#deployment.cloud.kubernetes)的更多指导。

### 1.7 应用程序事件 和 监听器

除了常见的SpringFramework事件（如 [ContextRefreshedEvent](https://docs.spring.io/spring-framework/docs/6.0.4/javadoc-api/org/springframework/context/event/ContextRefreshedEvent.html) ）之外，SpringApplication还会发送一些附加的应用程序事件。

> 有些事件实际上是在创建 ApplicationContext 之前触发的，因此您不能将侦听器注册为 @Bean 。您可以使用 SpringApplication.addListeners(…) 方法或 SpringApplicationBuilder.listers(…) 方法
>
> 如果希望这些侦听器自动注册，无论应用程序的创建方式如何，都可以将 META-INF/spring.factores 文件添加到项目中，并使用 org.springframework.context.ApplicationListener 键引用侦听器，如下例所示：
>
> ```
> org.springframework.context.ApplicationListener=com.example.project.MyListener
> ```

应用程序运行时，应用程序事件按以下顺序发送：

1. `ApplicationStartingEvent` 在运行开始时发送，但在任何处理之前发送，侦听器和初始化器的注册除外。
2. 当上下文中要使用的环境已知但在创建上下文之前，将发送 `ApplicationEnvironmentPreparedEvent` 。
3. 在准备`ApplicationContext` 并且调用了 `ApplicationContextInitializers` 之后，但在加载任何 bean 定义之前，将发送 `ApplicationContextInitializedEvent` 。
4. `ApplicationPreparedEvent` 在刷新开始之前发送，但在加载bean定义之后发送。
5. `ApplicationStartedEvent` 在上下文刷新后但在调用任何应用程序和命令行运行程序之前发送。
6. 在`LivenessState.CORRECT` 之后立即发送 `AvailabilityChangeEvent` ，以指示应用程序被视为活动的。
7. 调用任何 [应用程序和命令行运行程序](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.command-line-runner) 后，将发送 `ApplicationReadyEvent` 。
8. 在 `ReadinessState.ACCEPTING_TRAFFIC` 之后立即发送 `AvailabilityChangeEvent`，以指示应用程序已准备好服务请求。
9. 如果启动时出现异常，将发送 `ApplicationFailedEvent` 。

上面的列表只包括与 `SpringApplication` 相关的 `SpringApplicationEvents`。除此之外，以下事件也会在`ApplicationPreparedEvent` 之后和 `ApplicationStartedEvent` 之前发布：

- `WebServerInitializedEvent` 在 `WebServer` 就绪后发送。`ServletWebServerInitializedEvent` 和`ReactiveWebServerInitializedEvent` 分别是 `servlet` 和 响应式变量。
- 刷新 `ApplicationContext` 时，将发送 `ContextRefreshedEvent` 。

>  您通常不需要使用应用程序事件，但知道它们的存在会很方便。 在内部，Spring Boot 使用事件来处理各种任务。

> 默认情况下，事件监听器不应运行可能很长的任务，因为它们在同一线程中执行。考虑改用 [应用程序和命令行运行程序](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.command-line-runner) 。

应用程序事件通过使用 Spring Framework 的事件发布机制发送。该机制的一部分确保在子上下文中发布给监听器的事件也发布给任何祖先上下文中的监听器。因此，如果您的应用程序使用 SpringApplication 实例的层次体系，则监听器可能会收到同一类型应用程序事件的多个实例。

为了允许监听器区分其上下文的事件和后代上下文的事件 ，它应该请求注入其应用程序上下文，然后将注入的上下文与事件的上下文进行比较。上下文可以通过实现 `ApplicationContextAware` 来注入，如果监听器是 `bean`，则可以使用`@Autowired` 来注入。

### 1.8 Web 环境

pringApplication 试图代表您创建正确类型的 `ApplicationContext` 。用于确定 `WebApplicationType` 的算法如下：

- 如果存在 `Spring MVC`，则使用 `AnnotationConfigServletWebServerApplicationContext`

- 如果 `Spring MVC` 不存在，而`Spring WebFlux` 存在，则使用 `AnnotationConfigReactiveWebServerApplicationContext`
- 否则，将使用 `AnnotationConfigApplicationContext`

这意味着，如果您在同一应用程序中使用 `SpringMVC` 和 从`SpringWebFlux` 中的新 `WebClient`，则默认情况下将使用`SpringMVC`。您可以通过调用 `setWebApplicationType（WebApplicationType`）轻松地覆盖这一点。

还可以完全控制调用 `setApplicationContextClass(…)`.

> 在 JUnit 测试中使用 SpringApplication 时，通常需要调用 `setWebApplicationType（WebApplicationType.NONE）`。

### 1.9 访问应用程序参数

如果您需要访问传递给 `SpringApplication.run(…)` , 可以注入 `org.springframework.boot.ApplicationArguments`  bean。`ApplicationArguments` 接口提供对原始St ring[] 参数以及解析的选项和非选项参数的访问，如下例所示：

**Java**

```
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    public MyBean(ApplicationArguments args) {
        boolean debug = args.containsOption("debug");
        List<String> files = args.getNonOptionArgs();
        if (debug) {
            System.out.println(files);
        }
        // if run with "--debug logfile.txt" prints ["logfile.txt"]
    }

}
```

**Kotlin**

```java
import org.springframework.boot.ApplicationArguments
import org.springframework.stereotype.Component

@Component
class MyBean(args: ApplicationArguments) {

    init {
        val debug = args.containsOption("debug")
        val files = args.nonOptionArgs
        if (debug) {
            println(files)
        }
        // if run with "--debug logfile.txt" prints ["logfile.txt"]
    }

}
```

> Spring Boot 还向 Spring 环境注册 CommandLinePropertySource 。这还允许您使用 @Value 注解注入单个应用程序参数。

### 1.10 使用 ApplicationRunner 或 CommandLineRunner

如果需要在 `SpringApplication` 启动后运行某些特定代码，可以实现 `ApplicationRunner` 或 `CommandLineRunner` 接口。两个接口以相同的方式工作，并提供一个单独的运行方法，该方法在 `SpringApplication.run(…)` 完成。

> 该契约非常适合于在应用程序启动之后但在开始接受流量之前运行的任务。

`CommandLineRunner` 接口以字符串数组的形式提供对应用程序参数的访问，而 `ApplicationRunner` 使用前面讨论的`ApplicationArguments` 接口。以下示例显示了带有 `run` 方法的 `CommandLineRunner` ：

**Java**

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MyCommandLineRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Do something...
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class MyCommandLineRunner : CommandLineRunner {

    override fun run(vararg args: String) {
        // Do something...
    }

}
```

如果定义了必须按特定顺序调用的几个 `CommandLineRunner` 或 `ApplicationRunner` bean，则可以另外实现`org.springframework.core.Ordered` 接口或使用 `org.springframework.core.annotation.Order` 注解。

### 1.11 应用退出

每个 `SpringApplication` 都向 `JVM` 注册一个关闭钩子，以确保 `ApplicationContext` 在退出时正常关闭。可以使用所有标准的 `Spring` 生命周期回调（如 `DisposableBean` 接口或 `@PreDestroy` 注解）。



此外，如果 `bean` 希望在调用`SpringApplication.exit()` 时返回特定的退出代码，则可以实现`org.springframework.boot.ExitCodeGenerator` 接口。然后可以将此退出代码传递给`System.exit()` ，以将其作为状态代码返回，如下例所示：

**Java**

```java
import org.springframework.boot.ExitCodeGenerator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MyApplication {

    @Bean
    public ExitCodeGenerator exitCodeGenerator() {
        return () -> 42;
    }

    public static void main(String[] args) {
        System.exit(SpringApplication.exit(SpringApplication.run(MyApplication.class, args)));
    }

}
```

**Kotlin**

```java
import org.springframework.boot.ExitCodeGenerator
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean

import kotlin.system.exitProcess

@SpringBootApplication
class MyApplication {

    @Bean
    fun exitCodeGenerator() = ExitCodeGenerator { 42 }

}

fun main(args: Array<String>) {
    exitProcess(SpringApplication.exit(
        runApplication<MyApplication>(*args)))
}
```

此外，`ExitCodeGenerator` 接口可以通过异常实现。当遇到这种异常时，`Spring Boot` 返回由实现的 `getExitCode()` 方法提供的退出代码。

如果存在多个 `ExitCodeGenerator`，则使用生成的第一个非零退出代码。要控制调用生成器的顺序，请另外实现`org.springframework.core.Ordered` 接口或使用org.springfframework.core.annotation.Order 注解。

### 1.12 管理功能

通过指定 `spring.application.admin.enabled` 属性，可以为应用程序启用与管理员相关的功能。这将在 `MBeanServer` 平台上公开 `SpringApplicationAdminMXBean`。您可以使用此功能远程管理 `Spring Boot` 应用程序。这个特性对于任何服务包装器实现都很有用。

如果您想知道应用程序正在哪个 `HTTP` 端口上运行，请使用 `local.server.port` 属性键获取属性。

### 1.13 应用程序启动跟踪

在应用程序启动期间，SpringApplication 和ApplicationContext 执行许多与应用程序生命周期、bean 生命周期甚至处理应用程序事件相关的任务。使用 ApplicationStartup ，Spring Framework 允许您使用 StartupStep 对象跟踪应用程序启动顺序。收集这些数据可以用于分析目的，或者只是为了更好地了解应用程序启动过程。

在设置SpringApplication实例时，可以选择ApplicationStartup 实现。例如，要使用 BufferingApplicationStartup ，可以编写：

**Java**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(MyApplication.class);
        application.setApplicationStartup(new BufferingApplicationStartup(2048));
        application.run(args);
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup
import org.springframework.boot.runApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args) {
        applicationStartup = BufferingApplicationStartup(2048)
    }
}
```

第一个可用的实现 `FlightRecorderApplicationStartup` 由 Spring Framework 提供。它将特定于 Spring 的启动事件添加到 Java Flight Recorder 会话中，用于分析应用程序并将其 Spring 上下文生命周期与 JVM 事件（如分配、GC、类加载…). 配置后，您可以在启用飞行记录器的情况下运行应用程序来记录数据：

```shell
$ java -XX:StartFlightRecording:filename=recording.jfr,duration=10s -jar demo.jar
```

Spring Boot 附带 `BufferingApplicationStartup` 变体；此实现用于缓冲启动步骤，并将其排入外部度量系统。应用程序可以在任何组件中请求 `BufferingApplicationStartup` 类型的bean。

Spring Boot还可以配置为公开一个[启动端点](https://docs.spring.io/spring-boot/docs/3.0.2/actuator-api/htmlsingle/#startup)，该端点将此信息作为 JSON 文档提供。

## 2. 外部化配置

`Spring Boot` 允许您将配置外部化，以便您可以在不同的环境中使用相同的应用程序代码。您可以使用各种外部配置源，包括 Java `properties` 文件、`YAML` 文件、环境变量和命令行参数。

属性值可以使用 `@Value` 注解直接注入到 `bean` 中，通过 `Spring` 的 `Environment` 抽象访问，或者通过`@ConfigurationProperties`  [绑定到结构化对象](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties) 。

`Spring Boot` 使用一个非常特殊的 `PropertySource` 顺序，该顺序旨在允许合理地覆盖值。稍后的属性源可以覆盖先前属性源中定义的值。按以下顺序考虑来源：

1. 默认属性（通过设置 `SpringApplication.setDefaultProperties` 指定）。

2. `@Configuration` 类上的 `@PropertySource` 注解。请注意，在刷新应用程序上下文之前，这些属性源不会添加到环境中。现在配置某些属性为时已晚，例如 `logging. *` 和 `spring.main.*`，它们是在刷新开始之前读取的。
3. 配置数据（例如 `application.properties` 文件）。
4. 仅在 random.* 中具有属性的 `RandomValuePropertySource`。
5. OS 环境变量。
6. Java 系统属性（`System.getProperties()` ）。
7. `java:comp/env` 中的 `JNDI` 属性。
8. `ServletContext` 初始化参数。
9. `ServletConfig` 初始化参数。
10. `SPRING_APPLICATION_JSON` 中的属性（嵌入在环境变量或系统属性中的内联 `JSON` ）。
11. 命令行参数。
12. 测试中的 `properties` 属性。可在 [`@SpringBootTest`](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/test/context/SpringBootTest.html) 和用于 [测试应用程序的特定部分获得测试注解](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-tests) 。
13. 测试上的  [`@TestPropertySource`](https://docs.spring.io/spring-framework/docs/6.0.4/javadoc-api/org/springframework/test/context/TestPropertySource.html)  注解。
14. 当 `Devtools` 处于活动状态时，在 `$HOME/.config/spring-boot` 目录中的 [devtools 全局设置属性](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.globalsettings) 。

配置数据文件按以下顺序考虑：

1. jar 中打包的应用程序属性（ `application.properties` 和 `YAML` 变量）。

2. jar 中打包的特定于概要文件的应用程序属性（`application-{Profile}.properties` 和 `YAML` 变量）。

3. 打包 jar 之外的应用程序属性（`application.properties` 和 `YAML` 变量）。
4. 打包 jar 之外的特定于概要文件的应用程序属性（`application-{Profile}.properties` 和 `YAML` 变量）。

> 建议对整个应用程序使用一种格式。如果在同一位置同时具有 `.properties` 和 `.yml` 格式的配置文件，则 `properties` 优先。

提供一个具体的示例，假设您开发了一个使用 `name` 属性的 `@Component`，如下例所示：

`Java`

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @Value("${name}")
    private String name;

    // ...

}
```

**Kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class MyBean {

    @Value("\${name}")
    private val name: String? = null

    // ...

}

```

在应用程序类路径上（例如，在 `jar` 中），可以有一个 `application.properties` 文件，该文件为名称提供合理的默认属性值。在新环境中运行时，可以在 jar 外部提供 `application.properties` 文件，覆盖名称。对于一次性测试，可以使用特定的命令行开关启动（例如，`java -jar app.jar --name="Spring"` ）。

`env` 和 `configprops` 端点可用于确定属性具有特定值的原因。可以使用这两个端点来诊断意外的属性值。有关详细信息，请参阅 [“生产就绪功能”](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints) 部分。

### 2.1 访问命令行属性

默认情况下，`SpringApplication` 将任何命令行选项参数（即以 `--` 开头的参数，例如 `--server.port=9000` ）转换为属性，并将其添加到 `Spring` 环境中。如前所述，命令行属性始终优先于基于文件的属性源。

如果不希望将命令行属性添加到环境中，可以使用 `SpringApplication.setAddCommandLineProperties(false)` 禁用它们。

### 2.2  JSON 应用程序属性

环境变量和系统属性通常有一些限制，这意味着某些属性名称无法使用。为了帮助实现这一点，`SpringBoot` 允许您将属性块编码为单个 `JSON` 结构。

当应用程序启动时，任何`spring.application.json` 或`spring_application_json` 属性都将被解析并添加到 `Environment` 中。

例如，`SPRING_APPLICATION_JSON` 属性可以作为环境变量在 `UNIX shell` 的命令行中提供：

```shell
$ SPRING_APPLICATION_JSON='{"my":{"name":"test"}}' java -jar myapp.jar
```

在前面的示例中，您将在 `Spring` 环境中使用 `my.name=test` 。

同样的 `JSON` 也可以作为系统属性提供：

```shell
$ java -Dspring.application.json='{"my":{"name":"test"}}' -jar myapp.jar
```

或者可以使用命令行参数提供JSON：

```shell
$ java -jar myapp.jar --spring.application.json='{"my":{"name":"test"}}'
```

如果要部署到经典的 `ApplicationServer` ，还可以使用名为 `java:comp/env/spring.application.json` 的 `JNDI` 变量。

> 虽然 `JSON` 中的空值将添加到结果属性源中，但 `PropertySourcesPropertyResolver` 会将空属性视为缺少的值。这意味着 `JSON` 不能用空值覆盖低级属性源中的属性。

### 2.3 拓展应用属性

当应用程序启动时，Spring Boot 将自动从以下位置查找并加载 application.properties 和 application.yaml 文件：

1. 从类路径

- 类路径根

- `classpath/config` 包

2. 从当前目录

- 当前目录
- 当前目录中的 `config/` 子目录
- `config/` 子目录的直接子目录

列表按优先级排序（较低项目的值优先于较早项目的值）。加载文件中的文档将作为 PropertySources 添加到 Spring 环境中。

如果您不喜欢将 `application` 作为配置文件名，可以通过指定 `spring.config.name` 环境属性来切换到其他文件名。例如，要查找 `myproject.properties` 和 `myproject.yaml` 文件，可以按如下方式运行应用程序：

```shell
$ java -jar myproject.jar --spring.config.name=myproject
```

还可以使用 spring.config.location 环境属性来引用显式位置。此属性接受一个或多个要检查的位置的逗号分隔列表。

以下示例显示了如何指定两个不同的文件：

```shell
$ java -jar myproject.jar --spring.config.location=\
    optional:classpath:/default.properties,\
    optional:classpath:/override.properties
```

>  使用可选前缀：如果 [位置是可选](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.optional-prefix) 的，并且您不介意它们是否存在。

> 很早就使用 spring.config.name 、spring.config.location 和 spring.config.additional-location 来确定必须加载哪些文件。它们必须定义为环境属性（通常是 OS 环境变量、系统属性或命令行参数）。

如果 `spring.config.location` 包含目录（而不是文件），它们应该以 `/` 结尾。在运行时，它们将在加载之前附加从`spring.config.name` 生成的名称。直接导入 `spring.config.location` 中指定的文件。

> 目录和文件位置值也会展开，以检查特定于配置文件的文件。例如，如果类路径 `myconfig.properties` 位于`spring.config.location` ，你讲找到对应的 `classpath:myconfig-<profile>.properties` 文件被加载。

在大多数情况下，您添加的每个 `spring.config.location` 项都将引用单个文件或目录。位置按照定义的顺序进行处理，稍后的位置可以覆盖先前位置的值。

如果您有一个复杂的位置设置，并且您使用特定于配置文件的配置文件，那么您可能需要提供进一步的提示，以便 Spring Boot 知道它们应该如何分组。位置组是一组位置，这些位置都被视为处于同一级别。例如，您可能希望对所有类路径位置进行分组，然后对所有外部位置进行分组。位置组中的项目应以 `;` 分隔 。有关详细信息，请参阅 “配置文件特定文件” 部分中的示例。

使用 `spring.config.location` 配置的位置将替换默认位置。例如，如果 `spring.config.location` 配置了可选值： `classpath:/custom-config/` ，可选值：`file:./custom-config/`，考虑的完整位置集是：

1. `optional:classpath:custom-config/`
2. `optional:file:./custom-config/`

如果您喜欢添加其他位置，而不是替换它们，可以使用 `spring.config.additional-location` 。从其他位置加载的属性可以覆盖默认位置中的属性。例如，如果 `spring.config.additional-location` 配置了可选值：`classpath:/custom-config/`，可选值：`file:./custom-config/` ，考虑的完整位置集是：

1. `optional:classpath:/;optional:classpath:/config/`
2. `optional:file:./;optional:file:./config/;optional:file:./config/*/`
3. `optional:classpath:custom-config/`
4. `optional:file:./custom-config/`

这种搜索顺序允许您在一个配置文件中指定默认值，然后选择性地覆盖另一个配置中的这些值。您可以在其中一个默认位置的 `application.properties`（或使用 `spring.config.name` 选择的任何其他 `basename` ）中为应用程序提供默认值。然后，可以在运行时使用位于其中一个自定义位置的不同文件覆盖这些默认值。

> 如果使用环境变量而不是系统属性，大多数操作系统都不允许使用以句点分隔的键名，但可以使用下划线（例如，`SPRING_CONFIG_NAME` 而不是 `SPRING.CONFIG.NAME` ）。有关详细信息，请参阅从 [环境变量绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) 。

> 如果您的应用程序在 servlet 容器或应用程序服务器中运行，那么可以使用 `JNDI` 属性（在 `java:comp/env` 中）或`servlet` 上下文初始化参数来代替环境变量或系统属性。

#### 2.3.1 可选位置

默认情况下，当指定的配置数据位置不存在时，Spring Boot 将抛出 ConfigDataLocationNotFoundException ，应用程序将不会启动。

如果您想指定一个位置，但不介意它是否总是存在，可以使用可选的：前缀。 您可以将此前缀与 `spring.config.location` 和`spring.config.additional-location` properties 以及 [`spring.config.import`](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.importing) 声明一起使用。

例如，`spring.config.import` 值为 `optional:file:/myconfig.properties` 允许应用程序启动，即使 myconfig.properties 文件丢失也是如此。

如果要忽略所有 `ConfigDataLocationNotFoundExceptions` 并始终继续启动应用程序，可以使用 `spring.config.on-not-found` 属性。使用 `SpringApplication.setDefaultProperties(…)`  或使用 系统 / 环境 变量。

#### 2.3.2 通配符位置

如果配置文件位置包含最后一个路径段的 `*` 字符，则将其视为通配符位置。加载配置时会展开通配符，以便同时检查直接子目录。当存在多个配置属性源时，通配符位置在 `Kubernetes` 等环境中特别有用。

例如，如果您有一些 `Redis` 配置和一些 `MySQL` 配置，您可能希望将这两个配置分开，同时要求这两个都存在于`application.properties` 文件中。这可能会导致两个单独的 `application.properties` 文件装载在不同的位置，例如 `/config/redis/application.properties` 和 `/config/mysql/application.properties` 。在这种情况下，通配符位置为`config/*/`将导致两个文件都被处理。

默认情况下，`Spring Boot` 在默认搜索位置包含 `config/*/`。这意味着将搜索 jar 之外的 `/config` 目录的所有子目录。

您可以将通配符位置与 `spring.config.location` 和 `spring.config.additional-location` 属性一起使用。

>  通配符位置只能包含一个 `*` ，对于目录搜索位置，必须以 `*/` 结尾，对于文件搜索位置，则必须以 `*/<filename>` 结尾。带有通配符的位置根据文件名的绝对路径按字母顺序排序。

> 通配符位置仅适用于外部目录。不能在  `classpath: ` location中使用通配符。

#### 2.3.3 特殊配置文件

除了应用程序属性文件之外，Spring Boot 还将尝试使用命名约定 `application-{profile}` 加载特定于概要文件的文件。例如，如果应用程序激活名为 `prod` 的配置文件并使用 `YAML` 文件，那么将同时考虑 `application.yml` 和 `application-prod.yml` 。

特定于概要文件的属性从与标准 `application.properties` 相同的位置加载，特定于概要的文件总是覆盖非特定的文件。如果指定了多个配置文件，则采用最后获胜策略。例如，如果配置文件`prod`、`live` 是由 `spring.profiles.active` 属性指定的，那么 `application-prod.properties` 中的值可以被 `application-live.properties` 中的值覆盖。

> 后获胜策略适用于位置组级别。`classpath:/cfg/` ，`classpath:/ext/` 的 `spring.config.location` 将与 `classpath:/cfg/` 的重写规则不同；类路径：`/ext/` 。
>
> 例如，继续上面的 `prod` 、`live` 示例，我们可能有以下文件：
>
> ```
> /cfg
> application-live.properties
> /ext
> application-live.properties
> application-prod.properties
> ```
>
> 当我们有 `classpath:/cfg/`  的 `spring.config.location` ，`classpath:/ext/` 时，我们在处理所有 `/ext` 文件之前先处理所有 `/cfg` 文件：
>
> 1. `/cfg/application-live.properties`
> 2. `/ext/application-prod.properties`
> 3. `/ext/application-live.properties`
>
> 我们有 `classpath/cfg/; classpath:/ext/`（使用 `;` 分隔符）我们在同一级别处理 `/cfg` 和 `/ext`：
>
> 1. `/ext/application-prod.properties`
> 2. `/cfg/application-live.properties`
> 3. `/ext/application-live.properties`

环境具有一组默认配置文件（默认情况下为 [`default`] ），如果未设置活动配置文件，则使用这些配置文件。换句话说，如果没有显式激活配置文件，那么将考虑应用程序默认的属性。

>  属性文件只加载一次。如果您已经直接导入了特定于配置文件的属性文件，则不会再次导入该文件。

#### 2.3.4 导入其他数据

应用程序属性可以使用 `spring.config.import` 属性从其他位置导入更多配置数据。导入将在发现时进行处理，并被视为插入声明导入的文档下面的附加文档。

例如，类路径 `application.properties` 文件中可能包含以下内容：

**Properties**

```properties
spring.application.name=myapp
spring.config.import=optional:file:./dev.properties
```

**Yaml**

```yaml
spring:
  application:
    name: "myapp"
  config:
    import: "optional:file:./dev.properties"
```

这将触发当前目录中 dev.properties 文件的导入（如果存在这样的文件）。导入的 dev.properties 中的值将优先于触发导入的文件。在上面的示例中， `dev.properties` 可以将 `spring.application.name` 重新定义为不同的值。



无论声明多少次，导入都只能进口一次。导入在 `properties` / `yaml` 文件中的单个文档中定义的顺序无关紧要。例如，以下两个示例产生了相同的结果：

**Properties**

```properties
spring.config.import=my.properties
my.property=value
```

```properties
my.property=value
spring.config.import=my.properties
```

**Yaml**

```yaml
spring:
  config:
    import: "my.properties"
my:
  property: "value"
```

```yaml
my:
  property: "value"
spring:
  config:
    import: "my.properties"
```

在上述两个示例中，`my.properties` 文件中的值将优先于触发其导入的文件。

可以在一个 `spring.config.import`  键下指定多个位置。位置将按照定义的顺序进行处理，以后的导入优先。

>适当时，还考虑导入 [特定于配置文件的变体](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.profile-specific) 。上面的示例将导入 my.properties 以及任何`my-<profile>.properties `变体。

>Spring Boot 包括可插拔 API，允许支持各种不同的位置地址。默认情况下，您可以导入Java properties、YAML 和 [“configuration trees”](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.configtree) 。
>
>第三方 jar 可以提供对其他技术的支持（不要求文件是本地的）。例如，您可以想象配置数据来自 `Consul`、`Apache` `ZooKeeper` 或 `Netflix Archaius` 等外部存储。
>
>如果要支持自己的位置，请参阅 `org.springframework.boot.context.config` 包中的 `ConfigDataLocationResolver` 和`ConfigDataLoader` 类。

#### 2.3.5 导入无扩展名文件

某些云平台无法向卷装载的文件添加文件扩展名。要导入这些无扩展名文件，您需要给 Spring Boot 一个提示，以便它知道如何加载它们。您可以通过在方括号中放置扩展提示来完成此操作。

例如，假设您有一个 `/etc/config/myconfig` 文件，希望将其作为 yaml 导入。您可以使用以下命令从**application.properties** 导入它：

**Properties**

```properties
spring.config.import=file:/etc/config/myconfig[.yaml]
```

**Yaml**

```yaml
spring:
  config:
    import: "file:/etc/config/myconfig[.yaml]"
```

#### 2.3.6 使用配置树

在云平台（如 `Kubernetes` ）上运行应用程序时，通常需要读取平台提供的配置值。出于这种目的使用环境变量并不罕见，但这可能会有缺点，特别是如果值应该保密的话。

作为环境变量的替代方案，许多云平台现在允许您将配置映射到装载的数据卷中。例如，Kubernetes可以卷装载   `ConfigMaps` 和`Secrets` 。

可以使用两种常见的卷装载模式：

- 单个文件包含一组完整的属性（通常写为 YAML ）。
- 多个文件被写入目录树，文件名变为 `“key”` ，内容变为 `“value”` 。

对于第一种情况，可以如上所述使用`spring.config.import` 直接导入 `YAML` 或 `properties` 文件。对于第二种情况，您需要使用 `configtree:` 前缀，以便`Spring Boot` 知道它需要将所有文件公开为属性。

例如，让我们假设 `Kubernetes` 安装了以下卷：

```shell
etc/
  config/
    myapp/
      username
      password
```

用户名文件的内容将是一个配置值，而密码的内容则是一个 秘钥 。

要导入这些属性，可以将以下内容添加到 application.properties 或 application.yaml 文件中：

**Properties**

```properties
spring.config.import=optional:configtree:/etc/config/
```

**Yaml**

```yaml
spring:
  config:
    import: "optional:configtree:/etc/config/"
```

然后，您可以用通常的方式从 `Environment` 中访问或注入 `myapp.username` 和 `myapp.password` 属性。

> 配置树下的文件夹构成属性名称。在上面的示例中，要以 `username` 和 `password` 的形式访问属性，可以将 `spring.config.import` 设置为 `optional:configtree:/etc/config/myapp`。

> 带有点符号的文件名也会正确映射。例如，在上面的示例中，`/etc/config` 中名为 `myapp.username` 的文件将在Environment 中生成 myapp.username 属性。

> 配置树值可以绑定到字符串字符串和字节 `[]` 类型，具体取决于预期的内容。

如果要从同一父文件夹导入多个配置树，则可以使用通配符快捷方式。任何以 `/*/` 结尾的 `configtree:location` 都会将所有直接子级作为配置树导入。

例如，给定以下卷：

```shell
etc/
  config/
    dbconfig/
      db/
        username
        password
    mqconfig/
      mq/
        username
        password
```

您可以使用 `configtree:/etc/config/*/` 作为导入位置：

**Properties**

```properties
spring.config.import=optional:configtree:/etc/config/*/
```

**Yaml**

```yaml
spring:
  config:
    import: "optional:configtree:/etc/config/*/"
```

将添加db.username、db.password、mq.username和mq.password 属性。

>  使用通配符加载的目录按字母顺序排序。如果您需要不同的顺序，则应将每个位置列为单独的导入。

配置树也可以用于`Docker` 秘钥。当 `Docker` 集群服务被授权一个秘钥 访问时，该秘钥被装入容器中。例如，如果名为`db.password` 的秘钥安装在位置 `/run/secrets/` ，则可以使用以下命令使 `db.password` 可用于 Spring 环境：

**Properties**

```
spring.config.import=optional:configtree:/run/secrets/
```

**Yaml**

```yaml
spring:
  config:
    import: "optional:configtree:/run/secrets/"
```

#### 2.3.7 属性占位符

`application.properties` 和 `application.yml` 中的值在使用时会通过现有的 `Environment` 进行过滤，因此您可以引用以前定义的值（例如，从System 属性或环境变量 ）。标准的`${name}`  属性占位符语法可以在值中的任何位置使用。属性占位符还可以使用：指定默认值，以将默认值与属性名称分开，例如 `${name:default}` 。

以下示例显示了带默认值和不带默认值的占位符的使用：

**Properties**

```properties
app.name=MyApp
app.description=${app.name} is a Spring Boot application written by ${username:Unknown}
```

**Yaml**

```yaml
app:
  name: "MyApp"
  description: "${app.name} is a Spring Boot application written by ${username:Unknown}"
```

假设用户名属性未在其他地方设置，`app.description` 将具有值 `MyApp is a Spring Boot application written by Unknown`。

> 您应该始终使用占位符中的规范形式（ `kebab` 大小写仅使用小写字母）引用占位符中的属性名称。这将允许 `Spring Boot` 使用与放松绑定 @ConfigurationProperties 时相同的逻辑。
>
> 例如，`${demo.item-price}` 将从 `application.properties` 文件中获取 `demo.iterm-price` 和 `demo.iitemPrice` 表单，并从系统环境中获取`demo_itemPrice`。如果改用`${demo.itemPrice}`，则不会考虑 `demo.item-price `和 `demo_itemPrice`。

> 您还可以使用此技术创建现有 SpringBoot 属性的 “短” 变体。有关详细信息，请参见 [howto.html](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.importing-extensionless:~:text=You%20can%20also%20use%20this%20technique%20to%20create%20%E2%80%9Cshort%E2%80%9D%20variants%20of%20existing%20Spring%20Boot%20properties.%20See%20the%20howto.html%20how%2Dto%20for%20details.) 。

#### 2.3.8 使用多文档文件

`Spring Boot` 允许您将单个物理文件拆分为多个逻辑文档，每个逻辑文档都是独立添加的。文档按照从上到下的顺序进行处理。后续文档可以覆盖早期文档中定义的属性。

对于 `application.yml` 文件，使用标准的 `YAML` 多文档语法。三个连续的连字符表示一个文档的结尾和下一个文档开始。

例如，以下文件包含两个逻辑文档：

```yaml
spring:
  application:
    name: "MyApp"
---
spring:
  application:
    name: "MyCloudApp"
  config:
    activate:
      on-cloud-platform: "kubernetes"
```

对于 `application.properties` 文件，使用特殊的 `#---` 或 `!---` 注释用于标记文档拆分：

```properties
spring.application.name=MyApp
#---
spring.application.name=MyCloudApp
spring.config.activate.on-cloud-platform=kubernetes
```

> 属性文件分隔符不能有任何前导空格，并且必须正好有三个连字符。分隔符前后的行不能是相同的注释前缀。

> 多文档属性文件通常与激活属性（如 `spring.config.activate.on-profile`）结合使用。有关详细信息，请参阅 [下一节](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.activation-properties) 。

> 无法使用 `@PropertySource` 或 `@TestPropertySource` 注解加载多文档属性文件。

#### 2.3.9 激活属性

当满足某些条件时，仅激活给定的一组属性有时很有用。例如，您可能具有仅在特定配置文件处于活动状态时才相关的属性。

您可以使用 `spring.config.activate.*` 有条件地激活属性文档。

以下激活属性可用：

| 属性                | 注意                                                    |
| :------------------ | :------------------------------------------------------ |
| `on-profile`        | 必须匹配才能激活文档的配置文件表达式。                  |
| `on-cloud-platform` | 要使文档处于活动状态，必须检测到的 `“CloudPlatform”` 。 |

例如，下面指定第二个文档仅在 `Kubernetes` 上运行时有效，并且仅在 `“prod”` 或 `“staging”` 配置文件处于活动状态时有效：

**Properties**

```properties
myprop=always-set
#---
spring.config.activate.on-cloud-platform=kubernetes
spring.config.activate.on-profile=prod | staging
myotherprop=sometimes-set
```

**Yaml**

```yaml
myprop:
  "always-set"
---
spring:
  config:
    activate:
      on-cloud-platform: "kubernetes"
      on-profile: "prod | staging"
myotherprop: "sometimes-set"
```

### 2.4 加密属性

`Spring Boot` 没有为加密属性值提供任何内置支持，但是，它提供了修改 `Spring` 环境中包含的值所需的钩子点。`EnvironmentPostProcessor` 界面允许您在应用程序启动之前操作环境。有关详细信息，请参见 [howto.html](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.application.customize-the-environment-or-application-context)。

如果您需要一种安全的方式来存储凭据和密码，[Spring Cloud Vault](https://cloud.spring.io/spring-cloud-vault/)  项目将支持在 [`HashiCorp Vault`](https://www.vaultproject.io/)  中存储外部化配置。

#### 2.5 与 YAML 结合

`YAML` 是  `JSON` 的超集，因此是指定分层配置数据的方便格式。只要类路径上有 `Snake YAML` 库，`SpringApplication` 类就会自动支持 `YAML` 作为 `properties` 的替代。

> 如果您使用 `“Starters” `，`SnakeYAML` 将由 `spring-boot-starter` 自动提供。

#### 2.5.1 将 YAML 映射到 Properties

YAML 文档需要从其分层格式转换为可用于 Spring 环境的平面结构。例如，考虑以下 YAML 文件：

```yaml
environments:
  dev:
    url: "https://dev.example.com"
    name: "Developer Setup"
  prod:
    url: "https://another.example.com"
    name: "My Cool App"
```

为了从环境中访问这些属性，它们将按以下方式展平：

```properties
environments.dev.url=https://dev.example.com
environments.dev.name=Developer Setup
environments.prod.url=https://another.example.com
environments.prod.name=My Cool App
```

同样，`YAML` 列表也需要扁平化。它们表示为带有 `[index]` 取消引用的属性键。例如，考虑以下 YAML：

```yaml
my:
 servers:
 - "dev.example.com"
 - "another.example.com"
```

上述示例将转换为这些属性：

```properties
my.servers[0]=dev.example.com
my.servers[1]=another.example.com
```

> 使用 `[index]` 表示法的属性可以使用 `Spring Boot` 的 `Binder` 类绑定到 `Java List` 或 `Set` 对象。有关更多详细信息，请参阅下面的 [“类型安全配置属性”](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties) 部分。

>无法使用 @PropertySource 或 @TestPropertySource 注解加载YAML文件。因此，如果需要以这种方式加载值，则需要使用 properties 文件。

#### 2.5.2 直接加载YAML

`Spring Framework` 提供了两个方便的类，可用于加载 `YAML` 文档。`YamlPropertiesFactoryBean` 将 YAML 作为属性加载，`YamlMapFactoryBean` 将 `YAML` 作为 `Map` 加载。

如果要将 `YAML` 作为 `Spring PropertySource` 加载，也可以使用 `YamlPropertySourceLoader` 类。

### 2.6 配置随机值

`RandomValuePropertySource` 用于注入随机值（例如，注入秘钥或测试用例）。它可以生成整数、`longs` 、`uuids` 或 字符串，如下例所示：

**Properties**

```properties
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.uuid=${random.uuid}
my.number-less-than-ten=${random.int(10)}
my.number-in-range=${random.int[1024,65536]}
```

**Yaml**

```yaml
my:
  secret: "${random.value}"
  number: "${random.int}"
  bignumber: "${random.long}"
  uuid: "${random.uuid}"
  number-less-than-ten: "${random.int(10)}"
  number-in-range: "${random.int[1024,65536]}"
```

`random.int*` 语法是 OPEN value (,max) CLOSE ，其中 OPEN ，CLOSE 是任何字符，value ，max 是整数。如果提供了 max ，则 value 是最小值，max 是最大值（不包括）。

#### 2.7 配置系统环境属性

`Spring Boot` 支持为环境属性设置前缀。如果系统环境由具有不同配置要求的多个 `Spring Boot` 应用程序共享，这将非常有用。系统环境属性的前缀可以直接在 `SpringApplication` 上设置。

例如，如果将前缀设置为 `input` ，则诸如 `remote.timeout` 之类的属性也将在系统环境中解析为 `input.remote.timeout` 。

#### 2.8 安全配置属性

使用 `@Value("${property}")` 注释注入配置属性有时会很麻烦，特别是当您使用多个属性或数据本质上是分层的时。`SpringBoot` 提供了另一种使用属性的方法，该方法允许强类型 bean 管理和验证应用程序的配置。

> 另请参阅 [@Value 和类型安全配置属性之间的差异](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.vs-value-annotation) 。

#### 2.8.1 JavaBean 属性绑定

可以绑定声明标准 `JavaBean` 属性的 `bean` ，如下例所示：

**Java**

```java
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my.service")
public class MyProperties {

    private boolean enabled;

    private InetAddress remoteAddress;

    private final Security security = new Security();

    public boolean isEnabled() {
        return this.enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public void setRemoteAddress(InetAddress remoteAddress) {
        this.remoteAddress = remoteAddress;
    }

    public Security getSecurity() {
        return this.security;
    }

    public static class Security {

        private String username;

        private String password;

        private List<String> roles = new ArrayList<>(Collections.singleton("USER"));

        public String getUsername() {
            return this.username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return this.password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public List<String> getRoles() {
            return this.roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }

    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import java.net.InetAddress

@ConfigurationProperties("my.service")
class MyProperties {

    var isEnabled = false

    var remoteAddress: InetAddress? = null

    val security = Security()

    class Security {

        var username: String? = null

        var password: String? = null

        var roles: List<String> = ArrayList(setOf("USER"))

    }

}
```

前面的 POJO 定义了以下属性：

- `my.service.enabled` ，默认值为 `false`。

- `my.service.remote-address` ，类型可以从 `String` 强制。

- `my.service.security.username`，带有一个嵌套的 `“security”` 对象，其名称由属性的名称决定。特别是，该类型根本没有使用，可能是 `SecurityProperties`。

- `my.service.security.password`
- `my.service.security.role` ，带有默认为 `USER` 的字符串集合。

> 映射到 `Spring Boot` 中可用的 `@ConfigurationProperties` 类的属性是公共 API，这些类是通过 `properties` 文件、 `YAML` 文件、环境变量和其他机制配置的，但类本身的访问器（ `getters/setters` ）并不打算直接使用。

> 这种安排依赖于默认的空构造函数，getter 和 setter 通常是强制性的，因为绑定是通过标准的 `JavaBeans` 属性描述符进行的，就像在 `SpringMVC` 中一样。在下列情况下，可以省略 `setter` ：
>
> - 只要映射被初始化，就需要 `getter`，但不一定需要 `setter`，因为它们可以被绑定器改变。
> - 可以通过索引（通常使用 `YAML` ）或使用单个逗号分隔的值（ `properties` ）访问集合和数组。在后一种情况下，`setter` 是必需的。我们建议始终为此类类型添加 `setter`。如果初始化集合，请确保它不是不可变的（如前一个示例所示）。
> - 如果嵌套`POJO` `properties` 已初始化（如前面示例中的 `Security` 字段），则不需要 `setter`。如果希望绑定器使用其默认构造函数动态创建实例，则需要 `setter`。
>
> 有些人使用`Project Lombok` 自动添加 `getter` 和 `setter` 。确保 `Lombok` 不会为此类类型生成任何特定的构造函数，因为容器会自动使用它来实例化对象。
>
> 最后，只考虑标准 JavaBean properties，不支持绑定静态 properties。

#### 2.8.2 构造函数绑定

上一节中的示例可以以不可变的方式重写，如下例所示：

**Java**

```java
import java.net.InetAddress;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("my.service")
public class MyProperties {

    private final boolean enabled;

    private final InetAddress remoteAddress;

    private final Security security;

    public MyProperties(boolean enabled, InetAddress remoteAddress, Security security) {
        this.enabled = enabled;
        this.remoteAddress = remoteAddress;
        this.security = security;
    }

    public boolean isEnabled() {
        return this.enabled;
    }

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public Security getSecurity() {
        return this.security;
    }

    public static class Security {

        private final String username;

        private final String password;

        private final List<String> roles;

        public Security(String username, String password, @DefaultValue("USER") List<String> roles) {
            this.username = username;
            this.password = password;
            this.roles = roles;
        }

        public String getUsername() {
            return this.username;
        }

        public String getPassword() {
            return this.password;
        }

        public List<String> getRoles() {
            return this.roles;
        }

    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.DefaultValue
import java.net.InetAddress

@ConfigurationProperties("my.service")
class MyProperties(val enabled: Boolean, val remoteAddress: InetAddress,
        val security: Security) {

    class Security(val username: String, val password: String,
            @param:DefaultValue("USER") val roles: List<String>)

}
```

在此设置中，存在单个参数化构造函数意味着应使用构造函数绑定。这意味着绑定器将找到一个包含您希望绑定的参数的构造函数。如果类有多个构造函数，则 `@ConstructorBinding` 注解可用于指定要用于构造函数绑定的构造函数。若要选择不使用带有单个参数化构造函数的类的构造函数绑定，必须使用 `@Autowired` 对构造函数进行注解。构造函数绑定可以与记录一起使用。除非您的记录有多个构造函数，否则不需要使用 `@ConstructorBinding`。

构造函数绑定类（如上面示例中的 `Security` ）的嵌套成员也将通过其构造函数绑定。

可以在构造函数参数和记录组件上使用 `@DefaultValue` 指定默认值。转换服务将应用于将注解的 String 值强制为缺少属性的目标类型。

参考前面的示例，如果没有属性绑定到 `Security`，`MyProperties` 实例将包含一个 `null` 安全值。要使其包含 `Security` 的非空实例，即使没有绑定任何属性（使用 `Kotlin` 时，这将要求 `Security` 的用户名和密码参数声明为可以为空，因为它们没有默认值），请使用空的`@DefaultValue` 注解：

**Java**

```java
public MyProperties(boolean enabled, InetAddress remoteAddress, @DefaultValue Security security) {
    this.enabled = enabled;
    this.remoteAddress = remoteAddress;
    this.security = security;
}
```

> 若要使用构造函数绑定，必须使用 `@EnableConfigurationProperties` 或配置属性扫描来启用类。不能将构造函数绑定用于由常规 `Spring` 机制创建的 Bean（例如 `@Component Bean`、使用 @Bean 方法创建的 Bean 或使用`@Import` 加载的Bean）

> 要在本机映像中使用构造函数绑定，必须使用 `-parameters` 编译该类。如果您使用 `Spring Boot` 的 `Gradle` 插件或使用 `Maven` 和 `spring-boot-starter-praent` ，这将自动发生。

> 不建议将 `java.util.Optional` 与 `@ConfigurationProperties` 一起使用，因为它主要用作返回类型。因此，它不太适合配置属性注入。为了与其他类型的属性保持一致，如果您确实声明了一个`Optional` 属性，但该属性没有值，则将绑定 `null` 而不是空 `Optional`。

#### 2.8.3 启用 `@ConfigurationProperties` 注解类型

Spring Boot提供了绑定 `@ConfigurationProperties` 类型并将其注册为 `bean` 的基础设施。您可以逐个类启用配置属性，也可以启用与组件扫描类似的配置属性扫描。

有时，用 `@ConfigurationProperties` 注解的类可能不适合扫描，例如，如果您正在开发自己的自动配置或希望有条件地启用它们。在这些情况下，使用 `@EnableConfigurationProperties` 注解指定要处理的类型列表。这可以在任何`@Configuration` 类上完成，如下例所示：

**Java**

```java
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(SomeProperties.class)
public class MyConfiguration {

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(SomeProperties::class)
class MyConfiguration
```

要使用配置属性扫描，请将 `@ConfigurationPropertiesScan` 注释添加到应用程序中。通常，它被添加到用`@SpringBootApplication` 注解的主应用程序类中，但也可以添加到任何 `@Configuration` 类中。默认情况下，扫描将从声明注解的类的包中进行。如果要定义要扫描的特定包，可以按以下示例所示进行操作：

**Java**

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan({ "com.example.app", "com.example.another" })
public class MyApplication {

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan

@SpringBootApplication
@ConfigurationPropertiesScan("com.example.app", "com.example.another")
class MyApplication
```

> 当使用配置属性扫描或通过 `@EnableConfigurationProperties` 注册 `@ConfigurationProperties` bean 时，bean具有常规名称：`<prefix>-<fqn>`，其中`<prefix>`是 @ConfigurationProperties 注解中指定的环境名称前缀，`<fqn>` 是 bean的完全限定名称。如果注解不提供任何前缀，则只使用bean的完全限定名称。
>
> 上面示例中的 bean 名称是 com.example.app-com.example.app.SomeProperties。

我们建议 `@ConfigurationProperties` 只处理环境，特别是不从上下文注入其他 bean。对于角落情况，可以使用 `setter`注入或框架提供的任何 `*Aware` 接口（如需要访问环境时使用 `EnvironmentAware` ）。如果您仍然想使用构造函数注入其他 bean，那么必须用 @Component 注解配置属性 bean，并使用基于 JavaBean 的属性绑定。

#### 2.8.4 使用 @ConfigurationProperties 注解类型

这种类型的配置在 `SpringApplication` 外部 `YAML` 配置中尤其适用，如下例所示：

```yaml
my:
  service:
    remote-address: 192.168.1.1
    security:
      username: "admin"
      roles:
      - "USER"
      - "ADMIN"
```

要使用 `@ConfigurationProperties` bean，可以以与任何其他 bean 相同的方式注入它们，如下例所示：

**Java**

```java
import org.springframework.stereotype.Service;

@Service
public class MyService {

    private final MyProperties properties;

    public MyService(MyProperties properties) {
        this.properties = properties;
    }

    public void openConnection() {
        Server server = new Server(this.properties.getRemoteAddress());
        server.start();
        // ...
    }

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.stereotype.Service

@Service
class MyService(val properties: MyProperties) {

    fun openConnection() {
        val server = Server(properties.remoteAddress)
        server.start()
        // ...
    }

    // ...

}
```

> 使用 `@ConfigurationProperties` 还可以生成元数据文件，IDE 可以使用这些文件自动完成自己的键。详见 [附录 ](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html#appendix.configuration-metadata)。

#### 2.8.5 第三方配置

除了使用 @ConfigurationProperties 来注解类之外，还可以在公共 @Bean 方法上使用它。当您想将属性绑定到不在您控制范围内的第三方组件时，这样做特别有用。

要从 `Environment` 属性配置bean，请将 @ConfigurationProperties 添加到其 bean 注册中，如以下示例所示：

**Java**

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ThirdPartyConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "another")
    public AnotherComponent anotherComponent() {
        return new AnotherComponent();
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class ThirdPartyConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "another")
    fun anotherComponent(): AnotherComponent = AnotherComponent()

}
```

使用另一个前缀定义的任何 `JavaBean` 属性都以类似于前面的 `SomeProperties` 示例的方式映射到该 `AnotherComponent bean` 上。

#### 2.8.6 宽松的绑定

Spring Boot 使用一些宽松的规则将 `Environment` 属性绑定到 `@ConfigurationProperties` `bean`，因此 `Environment` 属性名称和 `bean` 属性名称之间不需要精确匹配。这很有用的常见示例包括以破折号分隔的环境属性（例如， c`ontext-path` 绑定到 `contextPath` ）和大写的环境属性（例如，`PORT` 绑定到端口）。

例如，仔细考虑以下 `@ConfigurationProperties` 类：

**Java**

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "my.main-project.person")
public class MyPersonProperties {

    private String firstName;

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "my.main-project.person")
class MyPersonProperties {

    var firstName: String? = null

}
```

使用上述代码，可以使用以下属性名称：

*列表 3. 宽松绑定*

| 属性                                | 描述                                                         |
| :---------------------------------- | :----------------------------------------------------------- |
| `my.main-project.person.first-name` | 烤串例子, 建议在 “`.properties`” 和 “`.yml`” 文件中使用。    |
| `my.main-project.person.firstName`  | 标准驼峰命名语法                                             |
| `my.main-project.person.first_name` | 下划线表示法，这是用于 “`.properties`” 和 “`.yml`” 文件的替代格式。 |
| `MY_MAINPROJECT_PERSON_FIRSTNAME`   | 使用系统环境变量时建议使用大写格式。                         |

注解的前缀值必须是kebab大小写（小写并用 `-` 分隔，例如 `my.main-project.person` ）。

*列表4. 每个属性源的宽松绑定规则*

| 属性源          | 示例                                                         | 列表                                                         |
| :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Properties 文件 | 驼峰命名、烤串大小写或者下划线符号                           | 使用 `[]` 或者逗号分隔符的标准的列表语法                     |
| YAML 文件       | 驼峰命名、烤串大小写或者下划线符号                           | 标准 `YAML` 列表语法或逗号分隔值                             |
| 环境变量        | 以下划线作为分隔符的大写格式 (参见  [从环境变量绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) ). | 用下划线包围的数值   (参见  [从环境变量绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) ). |
| 系统属性        | 驼峰命名、烤串大小写或者下划线符号                           | 使用 `[]` 或者逗号分隔符的标准的列表语法                     |

> 我们建议在可能的情况下，将属性存储为小写的烤肉串格式，例如 `my.person.first-name=Rod`。

##### 绑定 Map

绑定到 `Map` 属性时，可能需要使用特殊的括号表示法，以便保留原始键值。如果键未被 `[]` 包围，则为非字母数字、`-` 或 `.` 的任何字符被移除。



例如，考虑将以下属性绑定到Map<String，String>：

**properties**

```properties
my.map.[/key1]=value1
my.map.[/key2]=value2
my.map./key3=value3
```

**yaml**

```yaml
my:
  map:
    "[/key1]": "value1"
    "[/key2]": "value2"
    "/key3": "value3"
```

> 对于YAML文件，括号需要用引号括起来，以便正确解析键。

上面的财产将绑定到一个 Map ，其中 `/key1` 、`/key2` 和 `key3` 作为映射中的键。斜线已从键 3 中删除，因为它没有被方括号包围。

绑定到标量值时，使用键。其中不需要被 `[]` 包围。标量值包括枚举和 `java.lang` 包中除 `Object` 之外的所有类型。将`a.b=c` 绑定到 `Map<String，String>` 将保留。并返回带有条目 `{"a.b"="c"}` 的 `Map` 。对于任何其他类型，如果你的 key 包含 `.`  你必须使用花括号 。例如，将 `a.b=c`  绑定到`Map<String，Object>`将返回条目为 `{"a"＝{"b"＝“c”}}`  的 `Map`，而 `[a.b]=c` 将返回条目 `{"a.b"="c"}` 的 `Map` 。

##### 从环境变量中绑定

大多数操作系统对可用于环境变量的名称施加了严格的规则。 例如，`Linux shell` 变量只能包含字母（`a` 到 `z` 或 `A` 到 `Z`）、数字（ `0`  到  `9 `）或下划线字符 ( `_` )。 按照惯例，`Unix shell` 变量的名称也将以大写形式显示。

`Spring Boot` 宽松的绑定规则，就是为了尽可能兼容这些命名限制而设计的。 要将规范形式的属性名称转换为环境变量名称，您可以遵循以下规则：

- 将点 ( `.` ) 替换为下划线 ( `_` )。
- 删除任何破折号 ( `-` )。
- 转换为大写。

例如，配置属性 `spring.main.log-startup-info` 将是一个名为 `SPRING_MAIN_LOGSTARTUPINFO` 的环境变量。

绑定到对象列表时也可以使用环境变量。 要绑定到列表，元素编号应在变量名称中用下划线括起来。

例如，配置属性 `my.service[0].other` 将使用名为 `MY_SERVICE_0_OTHER` 的环境变量。

#### 2.8.7 合并复杂类型

当列表在多个地方配置时，覆盖通过替换整个列表来工作。

例如，假设一个 `MyPojo` 对象的名称和描述属性默认为空。 以下示例公开了 `MyProperties` 中的 `MyPojo` 对象列表：

**Java**

```java
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my")
public class MyProperties {

    private final List<MyPojo> list = new ArrayList<>();

    public List<MyPojo> getList() {
        return this.list;
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("my")
class MyProperties {

    val list: List<MyPojo> = ArrayList()

}
```

仔细思考一下配置：

```java
my:
  list:
  - name: "my name"
    description: "my description"
---
spring:
  config:
    activate:
      on-profile: "dev"
my:
  list:
  - name: "my another name"
```

如果开发配置文件未激活，则 `MyProperties.list` 包含一个 `MyPojo` 条目，如前所述。 但是，如果启用了开发配置文件，该列表仍然只包含一个条目（名称为我的另一个名字，描述为空）。 此配置不会将第二个 `MyPojo` 实例添加到列表中，也不会合并项目。

当在多个配置文件中指定一个列表时，将使用优先级最高的（并且只有那个）。 考虑以下示例：

**properties**

```properties
my.list[0].name=my name
my.list[0].description=my description
my.list[1].name=another name
my.list[1].description=another description
#---
spring.config.activate.on-profile=dev
my.list[0].name=my another name
```

**yaml**

```yaml
my:
  list:
  - name: "my name"
    description: "my description"
  - name: "another name"
    description: "another description"
---
spring:
  config:
    activate:
      on-profile: "dev"
my:
  list:
  - name: "my another name"
```

在前面的示例中，如果 `dev` 配置文件处于活动状态，则 `MyProperties.list` 包含一个 `MyPojo` 条目（名称为 `my another name` 的 `name` 和 `null` 的 `description` ）。 对于 YAML，逗号分隔列表和 YAML 列表都可用于完全覆盖列表的内容。

对于 Map 属性，您可以绑定从多个来源提取的属性值。 但是，对于多个来源中的同一属性，将使用优先级最高的那个。 以下示例公开了 `MyProperties` 中的 `Map<String, MyPojo>` ：

**Java**

```java
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my")
public class MyProperties {

    private final Map<String, MyPojo> map = new LinkedHashMap<>();

    public Map<String, MyPojo> getMap() {
        return this.map;
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("my")
class MyProperties {

    val map: Map<String, MyPojo> = LinkedHashMap()

}
```

仔细思考一下配置：

**properties**

```properties
my.map.key1.name=my name 1
my.map.key1.description=my description 1
#---
spring.config.activate.on-profile=dev
my.map.key1.name=dev name 1
my.map.key2.name=dev name 2
my.map.key2.description=dev description 2
```

**yaml**

```yaml
my:
  map:
    key1:
      name: "my name 1"
      description: "my description 1"
---
spring:
  config:
    activate:
      on-profile: "dev"
my:
  map:
    key1:
      name: "dev name 1"
    key2:
      name: "dev name 2"
      description: "dev description 2"
```

如果 dev 配置文件未激活，则 `MyProperties.map` 包含一个带有键 `key1` 的条目（`my name 1` 的 name   和 `my description 1` 的描述）。 但是，如果启用了开发配置文件，则映射包含两个条目，键为 `key1`（`dev name 1` 的 name   和 `my description 1` 的描述）和 key2（`dev name 2` 的 name   和 `dev description 2` 的描述） .

> 前面的合并规则适用于所有属性源的属性，而不仅仅是文件。

#### 2.8.8 属性转换

`Spring Boot` 在绑定到 `@ConfigurationProperties` bean 时尝试将外部应用程序属性强制转换为正确的类型。 如果您需要自定义类型转换，您可以提供一个 `ConversionService` bean（带有一个名为 `conversionService` 的 bean）或自定义属性配置器（通过一个 `CustomEditorConfigurer` bean）或自定义转换器（带有注解为 `@ConfigurationPropertiesBinding` 的 bean 定义）。

> 由于在应用程序生命周期的早期请求此 bean，请确保限制您的 `ConversionService` 使用的依赖项。 通常，您需要的任何依赖项在创建时可能未完全初始化。 如果配置键强制不需要自定义 `ConversionService`，并且仅依赖于使用 `@ConfigurationPropertiesBinding` 限定的自定义转换器，您可能需要重命名自定义 `ConversionService`。

##### 转换 Duration

`Spring Boot` 专门支持表达持续时间。 如果公开 `java.time.Duration` 属性，则应用程序属性中的以下格式可用：

- 常规长表示（使用毫秒作为默认单位，除非已指定 `@DurationUnit`）

- `java.time.Duration` 使用的标准 `ISO-8601` 格式

- 值和单位耦合的更具可读性的格式（10s 表示 10 秒）

仔细思考以下示例：

**Java**

```java
import java.time.Duration;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DurationUnit;

@ConfigurationProperties("my")
public class MyProperties {

    @DurationUnit(ChronoUnit.SECONDS)
    private Duration sessionTimeout = Duration.ofSeconds(30);

    private Duration readTimeout = Duration.ofMillis(1000);

    public Duration getSessionTimeout() {
        return this.sessionTimeout;
    }

    public void setSessionTimeout(Duration sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }

    public Duration getReadTimeout() {
        return this.readTimeout;
    }

    public void setReadTimeout(Duration readTimeout) {
        this.readTimeout = readTimeout;
    }

}
```

要指定 30 秒的会话超时，`30`、`PT30S` 和 `30s` 都是等效的。 500 毫秒的读取超时可以指定为以下任何形式：`500`、`PT0.5S` 和 `500ms`。

您还可以使用任何受支持的单位。 这些都是：

- ns 表示纳秒
- us 表示微秒
- ms 表示毫秒
- s 表示秒
- m 表示分钟
- h 表示小时
- d 表示天

默认单位是毫秒，可以使用 `@DurationUnit` 覆盖，如上例所示。

如果您更喜欢使用构造函数绑定，则可以公开相同的属性，如以下示例所示：

**Java**

```java
import java.time.Duration;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.boot.convert.DurationUnit;

@ConfigurationProperties("my")
public class MyProperties {

    private final Duration sessionTimeout;

    private final Duration readTimeout;

    public MyProperties(@DurationUnit(ChronoUnit.SECONDS) @DefaultValue("30s") Duration sessionTimeout,
            @DefaultValue("1000ms") Duration readTimeout) {
        this.sessionTimeout = sessionTimeout;
        this.readTimeout = readTimeout;
    }

    public Duration getSessionTimeout() {
        return this.sessionTimeout;
    }

    public Duration getReadTimeout() {
        return this.readTimeout;
    }

}
```

> 如果要升级 `Long` 属性，请确保定义单位（使用 `@DurationUnit`）（如果它不是毫秒）。 这样做提供了一个透明的升级路径，同时支持更丰富的格式。

##### 转换 Period

除了 `Period` 之外，Spring Boot 还可以使用 `java.time.Period` 类型。 应用程序属性中可以使用以下格式：

- 常规 `int` 表示（使用天作为默认单位，除非已指定 `@PeriodUnit`）

- `java.time.Period` 使用的标准 `ISO-8601` 格式

- 值和单位对耦合的更简单格式（`1y3d` 表示 1 年零 3 天）

简单格式支持以下单位：

- `y` 表示年
- `m` 表示月
- `w` 表示周
- `d` 表示天

> `java.time.Period` 类型从不实际存储周数，它是表示“`7 天`”的快捷方式。

##### 转换数据大小

`Spring Framework` 有一个以字节为单位表示大小的 `DataSize` 值类型。

如果公开 `DataSize` 属性，则应用程序属性中的以下格式可用：

- 常规的 `long` 表示（使用字节作为默认单位，除非已指定 `@DataSizeUnit`）
- 一种更易读的格式，其中值和单位耦合（`10` MB 表示 `10` 兆字节）

考虑以下示例：

**Java**

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;

@ConfigurationProperties("my")
public class MyProperties {

    @DataSizeUnit(DataUnit.MEGABYTES)
    private DataSize bufferSize = DataSize.ofMegabytes(2);

    private DataSize sizeThreshold = DataSize.ofBytes(512);

    public DataSize getBufferSize() {
        return this.bufferSize;
    }

    public void setBufferSize(DataSize bufferSize) {
        this.bufferSize = bufferSize;
    }

    public DataSize getSizeThreshold() {
        return this.sizeThreshold;
    }

    public void setSizeThreshold(DataSize sizeThreshold) {
        this.sizeThreshold = sizeThreshold;
    }

}
```

**kotlin**

```java
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.convert.DataSizeUnit
import org.springframework.util.unit.DataSize
import org.springframework.util.unit.DataUnit

@ConfigurationProperties("my")
class MyProperties {

    @DataSizeUnit(DataUnit.MEGABYTES)
    var bufferSize = DataSize.ofMegabytes(2)

    var sizeThreshold = DataSize.ofBytes(512)

}
```

要指定 `10` 兆字节的缓冲区大小，`10` 和 `10MB` 是等效的。 `256` 字节的大小阈值可以指定为 `256` 或 `256B`。

您还可以使用任何受支持的单位。 这些都是：

- B代表字节
- KB 千字节
- MB 表示兆字节
- GB 为千兆字节
- TB 表示太字节

默认单位是字节，可以使用 `@DataSizeUnit` 覆盖，如上例所示。

如果您更喜欢使用构造函数绑定，则可以公开相同的属性，如以下示例所示：

**Java**

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;

@ConfigurationProperties("my")
public class MyProperties {

    private final DataSize bufferSize;

    private final DataSize sizeThreshold;

    public MyProperties(@DataSizeUnit(DataUnit.MEGABYTES) @DefaultValue("2MB") DataSize bufferSize,
            @DefaultValue("512B") DataSize sizeThreshold) {
        this.bufferSize = bufferSize;
        this.sizeThreshold = sizeThreshold;
    }

    public DataSize getBufferSize() {
        return this.bufferSize;
    }

    public DataSize getSizeThreshold() {
        return this.sizeThreshold;
    }

}
```

**Kotlin**

```java
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.DefaultValue
import org.springframework.boot.convert.DataSizeUnit
import org.springframework.util.unit.DataSize
import org.springframework.util.unit.DataUnit

@ConfigurationProperties("my")
class MyProperties(@param:DataSizeUnit(DataUnit.MEGABYTES) @param:DefaultValue("2MB") val bufferSize: DataSize,
        @param:DefaultValue("512B") val sizeThreshold: DataSize)
```

#### 2.8.9 @ConfigurationProperties 校验

只要使用 `Spring` 的 `@Validated` 注释进行注释，Spring Boot 就会尝试验证 `@ConfigurationProperties` 类。 您可以直接在配置类上使用 `JSR-303` `jakarta.validation` 约束注释。 为此，请确保您的类路径上有一个兼容的 `JSR-303` 实现，然后将约束注释添加到您的字段，如以下示例所示：

**Java**

```java
import java.net.InetAddress;

import jakarta.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties("my.service")
@Validated
public class MyProperties {

    @NotNull
    private InetAddress remoteAddress;

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public void setRemoteAddress(InetAddress remoteAddress) {
        this.remoteAddress = remoteAddress;
    }

}
```

**Kotlin**

```kotlin
import jakarta.validation.Valid
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated
import java.net.InetAddress

@ConfigurationProperties("my.service")
@Validated
class MyProperties {

    var remoteAddress: @NotNull InetAddress? = null

    @Valid
    val security = Security()

    class Security {

        @NotEmpty
        var username: String? = null

    }

}
```

您还可以通过创建名为 `configurationPropertiesValidator` 的 `bean` 定义来添加自定义 `Spring Validator`。 `@Bean` 方法应该声明为静态的。 配置属性验证器是在应用程序生命周期的早期创建的，将 `@Bean` 方法声明为静态方法可以创建 `bean`，而无需实例化 `@Configuration` 类。 这样做可以避免早期实例化可能导致的任何问题。

> `spring-boot-actuator` 模块包含一个暴露所有 `@ConfigurationProperties` `bean` 的端点。 将 `Web` 浏览器指向 `/actuator/configprops` 或使用等效的 `JMX` 端点。 有关详细信息，请参阅 “[生产就绪功能](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints)” 部分。

#### 2.8.10 @ConfigurationProperties 与@Value

`@Value` 注解是核心容器功能，它不提供与类型安全配置属性相同的功能。 下表总结了`@ConfigurationProperties` 和`@Value` 支持的特性：

| 特性                                                         | `@ConfigurationProperties` | `@Value`                                                     |
| :----------------------------------------------------------- | :------------------------- | :----------------------------------------------------------- |
| [宽松绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding) | 是                         | 限制 (详细查看[注意事项](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.vs-value-annotation.note)) |
| [元数据支持](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html#appendix.configuration-metadata) | 是                         | 否                                                           |
| `SpEL` 表达式                                                | 否                         | 是                                                           |

> 如果您确实想使用`@Value`，我们建议您使用其规范形式（`kebab-case` 仅使用小写字母）来引用属性名称。 这将允许 `Spring Boot` 使用与宽松绑定 `@ConfigurationProperties` 时相同的逻辑。
>
> 例如，`@Value("${demo.item-price}")` 将从 `application.properties` 文件中获取 `demo.item-price` 和 `demo.itemPrice` 形式，以及从系统环境中获取 `DEMO_ITEMPRICE`。 如果您改用 `@Value("${demo.itemPrice}")`，则不会考虑 demo.item-price 和 `DEMO_ITEMPRICE`。

如果您为自己的组件定义了一组配置键，我们建议您将它们分组在一个用 `@ConfigurationProperties` 注释的 `POJO` 中。 这样做将为您提供结构化的、类型安全的对象，您可以将其注入到您自己的 `bean` 中。

来自应用程序属性文件的 `SpEL` 表达式在解析这些文件和填充环境时不会被处理。 但是，可以在`@Value` 中编写 `SpEL` 表达式。 如果应用程序属性文件中的属性值是 `SpEL` 表达式，则在通过 `@Value` 使用时将对其求值。

## 3. Profiles

`Spring Profiles` 提供了一种方法来隔离应用程序配置的各个部分，并使其仅在特定环境中可用。 任何`@Component`、`@Configuration` 或`@ConfigurationProperties` 都可以用`@Profile` 标记来限制何时加载，如下例所示：

**Java**

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration(proxyBeanMethods = false)
@Profile("production")
public class ProductionConfiguration {

    // ...

}
```

**Kotlin**

```kotlin
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration(proxyBeanMethods = false)
@Profile("production")
class ProductionConfiguration {

    // ...

}
```

> 如果`@ConfigurationProperties` beans 是通过`@EnableConfigurationProperties` 而不是自动扫描注册的，则需要在具有`@EnableConfigurationProperties` 注解的 `@Configuration` 类上指定`@Profile` 注释。 在扫描`@ConfigurationProperties` 的情况下，可以在 `@ConfigurationProperties` 类本身上指定 `@Profile` 。

您可以使用 `spring.profiles.active` 环境属性来指定哪些配置文件处于活动状态。 您可以使用本章前面描述的任何方式指定属性。 例如，您可以将其包含在您的 `application.properties` 中，如以下示例所示：

**properties**

```properties
spring.profiles.active=dev,hsqldb
```

**yaml**

```yaml
spring:
  profiles:
    active: "dev,hsqldb"
```

您还可以使用以下开关在命令行上指定它：`--spring.profiles.active=dev,hsqldb`。

如果没有配置文件处于活动状态，则会启用默认配置文件。 默认配置文件的名称是 `default` ，可以使用 `spring.profiles.default` `Environment` 属性对其进行调整，如以下示例所示：

**properties**

```properties
spring.profiles.default=none
```

**Yaml**

```java
spring:
  profiles:
    default: "none"
```

`spring.profiles.active` 和 `spring.profiles.default` 只能在非配置文件特定的文档中使用。 这意味着它们不能包含在配置文件特定文件或由 `spring.config.activate.on-profile` 激活的文档中。

例如第二个文件配置无效：

**properties**

```properties
# this document is valid
spring.profiles.active=prod
#---
# this document is invalid
spring.config.activate.on-profile=prod
spring.profiles.active=metrics
```

**Yaml**

```yaml
# this document is valid
spring:
  profiles:
    active: "prod"
---
# this document is invalid
spring:
  config:
    activate:
      on-profile: "prod"
  profiles:
    active: "metrics"
```

### 3.1 添加活动配置文件

`spring.profiles.active` 属性遵循与其他属性相同的排序规则：最高的 `PropertySource` 获胜。 这意味着您可以在 `application.properties` 中指定活动配置文件，然后使用命令行开关替换它们。

有时，将属性添加到活动配置文件而不是替换它们很有用。 `spring.profiles.include` 属性可用于在由 `spring.profiles.active` 属性激活的配置文件之上添加活动配置文件。 `SpringApplication` 入口点还有一个用于设置附加配置文件的 `Java` `API`。 请参阅 [SpringApplication](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/SpringApplication.html) 中的 `setAdditionalProfiles()` 方法。

例如，当运行具有以下属性的应用程序时，即使使用 `--spring.profiles.active` 开关运行，公共配置文件和本地配置文件也会被激活：

**properties**

```properties
spring.profiles.include[0]=common
spring.profiles.include[1]=local
```

**yaml**

```yaml
spring:
  profiles:
    include:
      - "common"
      - "local"
```

> 与 `spring.profiles.active` 类似，`spring.profiles.include` 只能用于非 `profile` 特定的文档中。 这意味着它不能包含在 [配置文件特定文件](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.profile-specific) 或由 `spring.config.activate.on-profile`  [激活的文档](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.activation-properties) 中。

如果给定的配置文件处于活动状态，则下一部分中描述的配置文件组也可用于添加活动配置文件。

### 3.2 配置文件组

有时，您在应用程序中定义和使用的配置文件过于细化，使用起来很麻烦。 例如，您可能拥有用于独立启用数据库和消息传递功能的 `proddb` 和 `prodmq` 配置文件。

为此，Spring Boot 允许您定义配置文件组。 配置文件组允许您为相关的配置文件组定义逻辑名称。

例如，我们可以创建一个由我们的 proddb 和 prodmq 配置文件组成的生产组。



```properties
spring.profiles.group.production[0]=proddb
spring.profiles.group.production[1]=prodmq
```

**Yaml**

```yaml
spring:
  profiles:
    group:
      production:
      - "proddb"
      - "prodmq"
```

我们的应用程序现在可以使用 `--spring.profiles.active=production` 启动，一次激活生产、proddb 和 prodmq 配置文件。

### 3.3 以编程方式设置配置文件

您可以在应用程序运行之前通过调用 `SpringApplication.setAdditionalProfiles(… )` 以编程方式设置活动配置文件。 也可以使用 `Spring` 的 `ConfigurableEnvironment` 接口来激活配置文件。

### 3.4 配置特定的配置文件

`application.properties`（或 `application.yml`）和通过 `@ConfigurationProperties` 引用的文件的特定于配置文件的变体被视为文件并被加载。 有关详细信息，请参阅 [“配置特定文件”](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.profile-specific) 。

## 4. 日志 Logging

`Spring Boot` 将  [`Commons Logging`](https://commons.apache.org/logging)  用于所有内部日志记录，但将底层日志实现保持打开状态。 为 [`Java Util Logging`](https://docs.oracle.com/javase/17/docs/api/java/util/logging/package-summary.html) 、 [`Log4j2`](https://logging.apache.org/log4j/2.x/)  和  [`Logback`](https://logback.qos.ch/)  提供了默认配置。 在每种情况下，记录器都预先配置为使用控制台输出，同时还提供可选的文件输出。

默认情况下，如果您使用“Starters”，`Logback` 用于日志记录。 还包括适当的 `Logback` 路由，以确保使用 Jav`a Util Logging`、`Commons Logging`、`Log4J` 或 `SLF4J` 的依赖库都能正常工作。

> 有很多可用于 Java 的日志记录框架。 如果上面的列表看起来令人困惑，请不要担心。 通常，您不需要更改日志记录依赖项，`Spring Boot` 默认设置就可以正常工作。

> 当您将应用程序部署到 `servlet` 容器或应用程序服务器时，使用 `Java Util Logging` `API` 执行的日志记录不会路由到应用程序的日志中。 这可以防止由容器或已部署到它的其他应用程序执行的日志记录出现在您的应用程序日志中。

### 4.1 日志格式

Spring Boot 的默认日志输出类似于以下示例：

```shell
2023-01-20T00:26:14.338Z  INFO 19468 --- [           main] o.s.b.d.f.s.MyApplication                : Starting MyApplication using Java 17.0.6 with PID 19468 (/opt/apps/myapp.jar started by myuser in /opt/apps/)
2023-01-20T00:26:14.352Z  INFO 19468 --- [           main] o.s.b.d.f.s.MyApplication                : No active profile set, falling back to 1 default profile: "default"
2023-01-20T00:26:20.158Z  INFO 19468 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2023-01-20T00:26:20.196Z  INFO 19468 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2023-01-20T00:26:20.197Z  INFO 19468 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.5]
2023-01-20T00:26:20.416Z  INFO 19468 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2023-01-20T00:26:20.419Z  INFO 19468 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 5536 ms
2023-01-20T00:26:21.337Z  INFO 19468 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-01-20T00:26:21.351Z  INFO 19468 --- [           main] o.s.b.d.f.s.MyApplication                : Started MyApplication in 8.52 seconds (process running for 9.752)
```

输出以下项目：

- 日期和时间：毫秒精度且易于排序。

- 日志级别：`ERROR`、`WARN`、`INFO`、`DEBUG` 或 `TRACE`。

- 进程标识。

- A --- 分隔符，用于区分实际日志消息的开始。

- 线程名称：括在方括号中（对于控制台输出可能会被截断）。

- 日志名称：这通常是源类名称（通常缩写）。

- 日志消息。

> `Logback` 没有 FATAL 级别。 它被映射到 `ERROR`。

### 4.2 控制台输出

默认日志配置在写入消息时将消息回显到控制台。 默认情况下，会记录 `ERROR` 级别、WARN 级别和 `INFO` 级别的消息。 您还可以通过使用 `--debug` 标志启动应用程序来启用 “调试” 模式。

```
$ java -jar myapp.jar --debug
```

> 您还可以在 `application.properties` 中指定 `debug=true`。

当启用调试模式时，选择的核心 loggers（嵌入式容器、`Hibernate` 和 `Spring Boot`）被配置为输出更多信息。 启用调试模式不会将您的应用程序配置为记录所有具有 `DEBUG` 级别的消息。 或者，您可以通过使用 `--trace` 标志（或 `application.properties` 中的 `trace=true`）启动您的应用程序来启用 “跟踪” 模式。 这样做可以为选定的核心记录器（嵌入式容器、`Hibernate` 模式生成和整个 `Spring` 产品组合）启用跟踪日志记录。

#### 4.2.1 颜色编码输出

如果您的终端支持 `ANSI`，则使用颜色输出来提高可读性。 您可以将 `spring.output.ansi.enabled` 设置为支持的值以覆盖自动检测。 颜色编码是使用 `%clr` 转换字配置的。 在其最简单的形式中，转换器根据日志级别为输出着色，如以下示例所示：

```shell
%clr(%5p)
```

下表描述了日志级别到颜色的映射：

| 级别    | 颜色 |
| :------ | :--- |
| `FATAL` | 红色 |
| `ERROR` | 红色 |
| `WARN`  | 黄色 |
| `INFO`  | 绿色 |
| `DEBUG` | 绿色 |
| `TRACE` | 绿色 |

或者，您可以通过将其作为转换选项提供来指定应使用的颜色或样式。 例如，要使文本变为黄色，请使用以下设置：

```shell
%clr(%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}){yellow}
```

支持以下颜色和样式：

- 蓝色

- 青色

- faint

- 绿色

- 紫红

- 红色

- 黄色

### 4.3 文件输出

默认情况下，`Spring Boot` 只记录到控制台，不写入日志文件。 如果除了控制台输出之外还想写入日志文件，则需要设置 `logging.file.name` 或 `logging.file.path` 属性（例如，在您的 `application.properties` 中）。 下表显示了如何一起使用 `logging.*` 属性：

*表 5 日志属性*

| `logging.file.name` | `logging.file.path` | 举例       | 描述                                                         |
| :------------------ | :------------------ | :--------- | :----------------------------------------------------------- |
| *(没有任何)*        | *(没有任何)*        |            | 仅控制台日志记录。                                           |
| 具体文件            | *(没有任何)*        | `my.log`   | 写入指定的日志文件。 名称可以是确切位置或相对于当前目录。    |
| *(没有任何)*        | 具体目录            | `/var/log` | 将 `spring.log` 写入指定目录。 名称可以是确切位置或相对于当前目录。 |

> 日志文件在达到 10 MB 时轮换，并且与控制台输出一样，默认情况下会记录 `ERROR` 级别、`WARN` 级别和 `INFO` 级别的消息。

日志记录属性独立于实际的日志记录基础设施。 因此，特定的配置键（例如 `Logback` 的 `logback.configurationFile`）不由 `spring Boot` 管理。

#### 4.4 文件轮换

如果您使用的是 `Logback`，则可以使用 `application.properties` 或 `application.yaml` 文件微调日志轮换设置。 对于所有其他日志系统，您需要自己直接配置轮换设置（例如，如果您使用 `Log4j2`，则可以添加 `log4j2.xml` 或 `log4j2-spring.xml` 文件）。 支持以下旋转策略属性：

| 名称                                                   | 描述                                         |
| :----------------------------------------------------- | :------------------------------------------- |
| `logging.logback.rollingpolicy.file-name-pattern`      | 用于创建日志存档的文件名模式。               |
| `logging.logback.rollingpolicy.clean-history-on-start` | 应用程序启动时是否应进行日志归档清理。       |
| `logging.logback.rollingpolicy.max-file-size`          | 归档前日志文件的最大大小。                   |
| `logging.logback.rollingpolicy.total-size-cap`         | 日志存档在被删除之前可以占用的最大大小。     |
| `logging.logback.rollingpolicy.max-history`            | 要保留的归档日志文件的最大数量（默认为 7）。 |

### 4.5 日志级别

所有支持的日志系统都可以通过使用 `logging.level.<logger-name>=<level>`  在 `Spring` 环境中设置记录器级别（例如，在 `application.properties` 中），其中级别是 `TRACE`、`DEBUG`、`INFO` ， `WARN`、`ERROR`、`FATAL` 或 `OFF` 之一。 可以使用 `logging.level.root` 配置根记录器。

以下示例显示了 `application.properties` 中的潜在日志记录设置：

**properties**

```properties
logging.level.root=warn
logging.level.org.springframework.web=debug
logging.level.org.hibernate=error
```

**yaml**

```yaml
logging:
  level:
    root: "warn"
    org.springframework.web: "debug"
    org.hibernate: "error"
```

也可以使用环境变量设置日志级别。 例如，`LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_WEB=DEBUG` 会将 `org.springframework.web` 设置为 `DEBUG`。

> 上述方法仅适用于包级别的日志记录。 由于宽松绑定总是将环境变量转换为小写，因此不可能以这种方式为单个类配置日志记录。 如果需要为类配置日志记录，可以使用 [SPRING_APPLICATION_JSON](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.application-json) 变量。

### 4.6 日志组

将相关的记录器分组在一起通常很有用，这样它们就可以同时配置。 例如，您可能经常更改所有与 `Tomcat` 相关的记录器的日志记录级别，但您不能轻易记住顶级包。

为此，`Spring Boot` 允许您在 `Spring` 环境中定义日志记录组。 例如，您可以通过将 `“tomcat”` 组添加到您的 `application.properties` 来定义它：

**properties**

```properties
logging.group.tomcat=org.apache.catalina,org.apache.coyote,org.apache.tomcat
```

**yaml**

```yaml
logging:
  group:
    tomcat: "org.apache.catalina,org.apache.coyote,org.apache.tomcat"
```

定义后，您可以使用一行更改组中所有记录器的级别：

**properties**

```properties
logging.level.tomcat=trace
```

**yaml**

```yaml
logging:
  level:
    tomcat: "trace"
```

`Spring Boot` 包括以下可以开箱即用的预定义日志记录组：

| 名称 | Logger                                                       |
| :--- | :----------------------------------------------------------- |
| web  | `org.springframework.core.codec`, `org.springframework.http`, `org.springframework.web`, `org.springframework.boot.actuate.endpoint.web`, `org.springframework.boot.web.servlet.ServletContextInitializerBeans` |
| sql  | `org.springframework.jdbc.core`, `org.hibernate.SQL`, `org.jooq.tools.LoggerListener` |

### 4.7 使用日志关闭挂钩

为了在您的应用程序终止时释放日志记录资源，提供了一个关闭挂钩，该挂钩将在 `JVM` 退出时触发日志系统清理。 除非您的应用程序部署为 `war` 文件，否则此关闭挂钩会自动注册。 如果您的应用程序具有复杂的上下文层次结构，则关闭挂钩可能无法满足您的需求。 如果没有，请禁用关闭挂钩并调查底层日志系统直接提供的选项。 例如，Logback 提供 [上下文选择器](https://logback.qos.ch/manual/loggingSeparation.html) ，允许每个 `Logger` 在其自己的上下文中创建。 您可以使用 `logging.register-shutdown-hook` 属性来禁用关闭挂钩。 将其设置为 false 将禁用注册。 您可以在 `application.properties` 或 `application.yaml` 文件中设置该属性：

**properties**

```properties
logging.register-shutdown-hook=false
```

**Yaml**

```yaml
logging:
  register-shutdown-hook: false
```

### 4.8 自定义日志配置

可以通过在类路径中包含适当的库来激活各种日志记录系统，并且可以通过在类路径的根目录中或在以下 `Spring Environment` 属性指定的位置提供合适的配置文件来进一步自定义：`logging.config`。

您可以通过使用 `org.springframework.boot.logging.LoggingSystem` 系统属性强制 `Spring Boot` 使用特定的日志记录系统。 该值应该是 `LoggingSystem` 实现的完全限定类名。 您还可以使用 `none` 值完全禁用 `Spring Boot` 的日志记录配置。

由于日志记录是在创建 `ApplicationContext` 之前初始化的，因此无法控制来自 `Spring` `@Configuration` 文件中的 `@PropertySources` 的日志记录。 更改日志记录系统或完全禁用它的唯一方法是通过系统属性。

根据您的日志系统，将加载以下文件：

| 日志系统                  | 定制化                                                       |
| :------------------------ | :----------------------------------------------------------- |
| Logback                   | `logback-spring.xml`, `logback-spring.groovy`, `logback.xml`, 或 `logback.groovy` |
| Log4j2                    | `log4j2-spring.xml` 或 `log4j2.xml`                          |
| JDK (`Java Util Logging`) | `logging.properties`                                         |

> 如果可能，我们建议您为日志记录配置使用 `-spring` 变体（例如，`logback-spring.xml` 而不是 `logback.xml`）。 如果使用标准配置位置，`Spring` 无法完全控制日志初始化。

> `Java Util Logging` 存在已知的类加载问题，当从 “可执行 jar” 运行时会导致问题。 我们建议您在从 “可执行 jar” 运行时尽可能避免使用它。

为了帮助定制，一些其他属性从 Spring 环境转移到系统属性，如下表所述：

| spring 环境                         | 系统属性                        | 备注                                                         |
| :---------------------------------- | :------------------------------ | :----------------------------------------------------------- |
| `logging.exception-conversion-word` | `LOG_EXCEPTION_CONVERSION_WORD` | 记录异常时使用的转换词。                                     |
| `logging.file.name`                 | `LOG_FILE`                      | 如果已定义，它将用于默认日志配置。                           |
| `logging.file.path`                 | `LOG_PATH`                      | 如果已定义，它将用于默认日志配置。                           |
| `logging.pattern.console`           | `CONSOLE_LOG_PATTERN`           | 如果已定义，它将用于默认日志配置。                           |
| `logging.pattern.dateformat`        | `LOG_DATEFORMAT_PATTERN`        | 日志日期格式的附加程序模式。                                 |
| `logging.charset.console`           | `CONSOLE_LOG_CHARSET`           | 用于控制台日志记录的字符集。                                 |
| `logging.pattern.file`              | `FILE_LOG_PATTERN`              | 在文件中使用的日志模式（如果启用了“`LOG_FILE`”）。           |
| `logging.charset.file`              | `FILE_LOG_CHARSET`              | 用于文件日志记录的字符集（如果启用了“`LOG_FILE`”）。         |
| `logging.pattern.level`             | `LOG_LEVEL_PATTERN`             | 呈现日志级别时使用的格式（默认为“`%5p`”）。                  |
| `PID`                               | `PID`                           | 当前进程 ID（如果可能并且在尚未定义为操作系统环境变量时发现）。 |

如果您使用 `Logback`，还会传输以下属性：

| Spring 环境                                            | 系统属性                                       | 备注                                                         |
| :----------------------------------------------------- | :--------------------------------------------- | :----------------------------------------------------------- |
| `logging.logback.rollingpolicy.file-name-pattern`      | `LOGBACK_ROLLINGPOLICY_FILE_NAME_PATTERN`      | 滚动日志文件名的模式（默认为 `${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz`）。 |
| `logging.logback.rollingpolicy.clean-history-on-start` | `LOGBACK_ROLLINGPOLICY_CLEAN_HISTORY_ON_START` | 是否在启动时清理归档日志文件。                               |
| `logging.logback.rollingpolicy.max-file-size`          | `LOGBACK_ROLLINGPOLICY_MAX_FILE_SIZE`          | 最大日志文件大小。                                           |
| `logging.logback.rollingpolicy.total-size-cap`         | `LOGBACK_ROLLINGPOLICY_TOTAL_SIZE_CAP`         | 要保留的日志备份的总大小。                                   |
| `logging.logback.rollingpolicy.max-history`            | `LOGBACK_ROLLINGPOLICY_MAX_HISTORY`            | 要保留的归档日志文件的最大数量。                             |

所有受支持的日志系统在解析其配置文件时都可以查询系统属性。 示例参见 `spring-boot.jar` 中的默认配置：

- [Logback](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml)
- [Log4j 2](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/log4j2/log4j2.xml)
- [Java Util logging](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/java/logging-file.properties)

> 如果你想在日志属性中使用占位符，你应该使用  [`Spring Boot` 的语法](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.property-placeholders) 而不是底层框架的语法。 值得注意的是，如果你使用 `Logback`，你应该使用 : 作为属性名称和它的默认值之间的分隔符，而不是使用 :`-`。

> 您可以通过仅覆盖 `LOG_LEVEL_PATTERN`（或使用 `Logback` 的 `logging.pattern.level`）将 `MDC` 和其他临时内容添加到日志行。 例如，如果您使用 `logging.pattern.level=user:%X{user} %5p`，则默认日志格式包含 “用户” 的 `MDC` 条目（如果存在），如以下示例所示。
>
> ```shell
> 2019-08-30 12:30:04.031 user:someone INFO 22174 --- [  nio-8080-exec-0] demo.Controller
> Handling authenticated request
> ```

### 4.9 Logback 拓展

`Spring Boot` 包含许多对 `Logback` 的扩展，可以帮助进行高级配置。 您可以在 `logback-spring.xml` 配置文件中使用这些扩展。

> 因为标准的 `logback.xml` 配置文件加载得太早，所以你不能在里面使用扩展。 您需要使用 `logback-spring.xml` 或定义 `logging.config` 属性。

> 些扩展不能与 `Logback` 的 [配置扫描](https://logback.qos.ch/manual/configuration.html#autoScan) 一起使用。 如果您尝试这样做，对配置文件进行更改会导致记录类似于以下内容之一的错误：

```shell
ERROR in ch.qos.logback.core.joran.spi.Interpreter@4:71 - no applicable action for [springProperty], current ElementPath is [[configuration][springProperty]]
ERROR in ch.qos.logback.core.joran.spi.Interpreter@4:71 - no applicable action for [springProfile], current ElementPath is [[configuration][springProfile]]
```

#### 4.9.1 配置文件特定的配置

`<springProfile>` 标记允许您根据活动的 `Spring` 配置文件选择性地包含或排除配置部分。 `<configuration>` 元素中的任何位置都支持配置文件部分。 使用 `name` 属性指定哪个配置文件接受配置。 `<springProfile>` 标签可以包含配置文件名称（例如暂存）或配置文件表达式。 配置文件表达式允许表达更复杂的配置文件逻辑，例如 `production & (eu-central | eu-west)`。 查看 `Spring Framework` 参考指南以获取更多详细信息。 以下清单显示了三个示例配置文件：

```xml
<springProfile name="staging">
    <!-- configuration to be enabled when the "staging" profile is active -->
</springProfile>

<springProfile name="dev | staging">
    <!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</springProfile>

<springProfile name="!production">
    <!-- configuration to be enabled when the "production" profile is not active -->
</springProfile>
```

#### 4.9.2 环境属性

`<springProperty>` 标记允许您公开 `Spring` 环境中的属性以在 `Logback` 中使用。 如果您想从 `Logback` 配置中的 `application.properties` 文件访问值，这样做会很有用。 该标签的工作方式与 `Logback` 的标准 `<property>` 标签类似。 但是，不是指定直接值，而是指定属性的来源（来自环境）。 如果您需要将属性存储在本地范围之外的其他地方，您可以使用 `scope` 属性。 如果您需要一个回退值（以防该属性未在环境中设置），您可以使用 `defaultValue` 属性。 以下示例显示了如何公开在 `Logback` 中使用的属性：

```xml
<springProperty scope="context" name="fluentHost" source="myapp.fluentd.host"
        defaultValue="localhost"/>
<appender name="FLUENT" class="ch.qos.logback.more.appenders.DataFluentAppender">
    <remoteHost>${fluentHost}</remoteHost>
    ...
</appender>
```

必须以 kebab 大小写指定来源（例如 `my.property-name`）。 但是，可以使用宽松的规则将属性添加到环境中。

### 4.10  Log4j2 拓展

`Spring Boot` 包含许多对 `Log4j2` 的扩展，可以帮助进行高级配置。 您可以在任何 `log4j2-spring.xml` 配置文件中使用这些扩展。

> 因为标准的 `log4j2.xml` 配置文件加载得太早，所以你不能在里面使用扩展。 您需要使用 `log4j2-spring.xml` 或定义 logging.config 属性。

> 这些扩展取代了 Log4J 提供的 [Spring Boot 支持](https://logging.apache.org/log4j/2.x/log4j-spring-boot/index.html)。 您应该确保不要在构建中包含 org.apache.logging.log4j:log4j-spring-boot 模块。

#### 4.10.1 配置文件特定的配置

`<SpringProfile>` 标记允许您根据活动的 `Spring` 配置文件选择性地包含或排除配置部分。 `<Configuration>` 元素中的任何位置都支持配置文件部分。 使用 `name` 属性指定哪个配置文件接受配置。 `<SpringProfile>` 标签可以包含配置文件名称（例如暂存）或配置文件表达式。 配置文件表达式允许表达更复杂的配置文件逻辑，例如 `production & (eu-central | eu-west)`。 查看 `Spring Framework` 参考指南以获取更多详细信息。 以下清单显示了三个示例配置文件：

```xml
<SpringProfile name="staging">
    <!-- configuration to be enabled when the "staging" profile is active -->
</SpringProfile>

<SpringProfile name="dev | staging">
    <!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</SpringProfile>

<SpringProfile name="!production">
    <!-- configuration to be enabled when the "production" profile is not active -->
</SpringProfile>
```

#### 4.10.2 环境属性查找

如果您想在 `Log4j2` 配置中引用 `Spring` 环境中的属性，您可以使用 `spring:` 前缀查找。 如果您想从 `Log4j2` 配置中的 `application.properties` 文件访问值，这样做会很有用。 以下示例显示如何设置名为 `applicationName` 的 `Log4j2` 属性，该属性从 `Spring` 环境中读取 `spring.application.name`：

```properties
<Properties>
    <Property name="applicationName">${spring:spring.application.name}</Property>
</Properties>
```

> 应在 kebab 大小写中指定查找键（例如 my.property-name）。

#### 4.10.3 Log4j2 系统属性

`Log4j2` 支持许多可用于配置各种项目的系统属性。 例如，`log4j2.skipJansi` 系统属性可用于配置 `ConsoleAppender` 是否会尝试在 `Windows` 上使用 `Jansi` 输出流。

`Log4j2` 初始化后加载的所有系统属性都可以从 `Spring Environment` 中获取。 例如，您可以将 `log4j2.skipJansi=false` 添加到 `application.properties` 文件，让 `ConsoleAppender` 在 `Windows` 上使用 `Jansi`。

> 只有当系统属性和操作系统环境变量不包含正在加载的值时，才会考虑 `Spring` 环境。

> 在早期 `Log4j2` 初始化期间加载的系统属性不能引用 `Spring` 环境。 例如，`Log4j2` 用于允许选择默认 `Log4j2` 实现的属性在 `Spring` 环境可用之前使用。

## 5. 国际化

`Spring Boot` 支持本地化消息，因此您的应用程序可以迎合不同语言偏好的用户。 默认情况下，`Spring Boot` 在类路径的根目录下查找消息资源包。

> 当已配置资源包的默认属性文件可用时（默认为 `messages.properties`），自动配置适用。 如果您的资源包仅包含特定于语言的属性文件，则您需要添加默认值。 如果找不到与任何配置的基本名称匹配的属性文件，则不会有自动配置的 `MessageSource`。

资源包的基本名称以及其他几个属性可以使用 `spring.messages` 命名空间进行配置，如以下示例所示：

**properties**

```properties
spring.messages.basename=messages,config.i18n.messages
spring.messages.fallback-to-system-locale=false
```

**yaml**

```yaml
spring:
  messages:
    basename: "messages,config.i18n.messages"
    fallback-to-system-locale: false
```

> `spring.messages.basename` 支持以逗号分隔的位置列表，可以是包限定符或从类路径根解析的资源。

有关更多受支持的选项，请参阅 [MessageSource 属性](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/context/MessageSourceProperties.java)。

## 6. JSON

`Spring Boot` 提供与三个 `JSON` 映射库的集成：

- Gson
- Jackson
- JSON-B

Jackson 是首选的默认库。

### 6.1 Jackson

提供了 `Jackson` 的自动配置，`Jackson` 是 `spring-boot-starter-json` 的一部分。 当 `Jackson` 在类路径上时，会自动配置一个 `ObjectMapper` bean。 提供了几个配置属性来自定义 `ObjectMapper` 的配置。

#### 6.1.1 自定义序列化器和反序列化器

如果您使用 `Jackson` 序列化和反序列化 `JSON` 数据，您可能想要编写自己的 `JsonSerializer` 和 `JsonDeserializer` 类。 自定义序列化程序通常通过模块向 `Jackson` 注册，但 `Spring Boot` 提供了一个替代的 `@JsonComponent` 注解，可以更轻松地直接注册 `Spring` Beans。 您可以直接在 `JsonSerializer`、`JsonDeserializer` 或 `KeyDeserializer` 实现上使用 `@JsonComponent`  注解。 您还可以在包含序列化器/反序列化器作为内部类的类上使用它，如以下示例所示：

**java**

```java
import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.boot.jackson.JsonComponent;

@JsonComponent
public class MyJsonComponent {

    public static class Serializer extends JsonSerializer<MyObject> {

        @Override
        public void serialize(MyObject value, JsonGenerator jgen, SerializerProvider serializers) throws IOException {
            jgen.writeStartObject();
            jgen.writeStringField("name", value.getName());
            jgen.writeNumberField("age", value.getAge());
            jgen.writeEndObject();
        }

    }

    public static class Deserializer extends JsonDeserializer<MyObject> {

        @Override
        public MyObject deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException {
            ObjectCodec codec = jsonParser.getCodec();
            JsonNode tree = codec.readTree(jsonParser);
            String name = tree.get("name").textValue();
            int age = tree.get("age").intValue();
            return new MyObject(name, age);
        }

    }

}
```

**Kotlin**

```java
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import org.springframework.boot.jackson.JsonComponent
import java.io.IOException

@JsonComponent
class MyJsonComponent {

    class Serializer : JsonSerializer<MyObject>() {
        @Throws(IOException::class)
        override fun serialize(value: MyObject, jgen: JsonGenerator, serializers: SerializerProvider) {
            jgen.writeStartObject()
            jgen.writeStringField("name", value.name)
            jgen.writeNumberField("age", value.age)
            jgen.writeEndObject()
        }
    }

    class Deserializer : JsonDeserializer<MyObject>() {
        @Throws(IOException::class, JsonProcessingException::class)
        override fun deserialize(jsonParser: JsonParser, ctxt: DeserializationContext): MyObject {
            val codec = jsonParser.codec
            val tree = codec.readTree<JsonNode>(jsonParser)
            val name = tree["name"].textValue()
            val age = tree["age"].intValue()
            return MyObject(name, age)
        }
    }

}
```

`ApplicationContext` 中的所有 `@JsonComponent` bean 都会自动向 `Jackson` 注册。 因为`@JsonComponent` 是用`@Component` 进行元注解的，所以通常的组件扫描规则适用。

`Spring Boot` 还提供了 `JsonObjectSerializer` 和 `JsonObjectDeserializer` 基类，它们在序列化对象时为标准 `Jackson` 版本提供了有用的替代方案。 有关详细信息，请参阅 `Javadoc` 中的 `JsonObjectSerializer` 和 `JsonObjectDeserializer`。 上面的示例可以重写为使用 `JsonObjectSerializer` / `JsonObjectDeserializer`，如下所示：

**Java**

```java
import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.boot.jackson.JsonComponent;
import org.springframework.boot.jackson.JsonObjectDeserializer;
import org.springframework.boot.jackson.JsonObjectSerializer;

@JsonComponent
public class MyJsonComponent {

    public static class Serializer extends JsonObjectSerializer<MyObject> {

        @Override
        protected void serializeObject(MyObject value, JsonGenerator jgen, SerializerProvider provider)
                throws IOException {
            jgen.writeStringField("name", value.getName());
            jgen.writeNumberField("age", value.getAge());
        }

    }

    public static class Deserializer extends JsonObjectDeserializer<MyObject> {

        @Override
        protected MyObject deserializeObject(JsonParser jsonParser, DeserializationContext context, ObjectCodec codec,
                JsonNode tree) throws IOException {
            String name = nullSafeValue(tree.get("name"), String.class);
            int age = nullSafeValue(tree.get("age"), Integer.class);
            return new MyObject(name, age);
        }

    }

}
```

**kotlin**

```kotlin
`object`

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.core.ObjectCodec
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializerProvider
import org.springframework.boot.jackson.JsonComponent
import org.springframework.boot.jackson.JsonObjectDeserializer
import org.springframework.boot.jackson.JsonObjectSerializer
import java.io.IOException

@JsonComponent
class MyJsonComponent {

    class Serializer : JsonObjectSerializer<MyObject>() {
        @Throws(IOException::class)
        override fun serializeObject(value: MyObject, jgen: JsonGenerator, provider: SerializerProvider) {
            jgen.writeStringField("name", value.name)
            jgen.writeNumberField("age", value.age)
        }
    }

    class Deserializer : JsonObjectDeserializer<MyObject>() {
        @Throws(IOException::class)
        override fun deserializeObject(jsonParser: JsonParser, context: DeserializationContext,
                codec: ObjectCodec, tree: JsonNode): MyObject {
            val name = nullSafeValue(tree["name"], String::class.java)
            val age = nullSafeValue(tree["age"], Int::class.java)
            return MyObject(name, age)
        }
    }

}
```

#### 6.1.2 Mixins

`Jackson` 支持 `mixin`，可用于将附加注解混合到已在目标类上声明的注解中。 `Spring Boot` 的 `Jackson` 自动配置将扫描应用程序的包以查找使用 `@JsonMixin` 注解的类，并将它们注册到自动配置的 `ObjectMapper`。 注册由 `Spring Boot` 的 `JsonMixinModule` 执行。

### 6.2 Gson

提供了 `Gson` 的自动配置。 当 `Gson` 在类路径上时，会自动配置一个 `Gson` bean。 提供了几个 `spring.gson.*` 配置属性来自定义配置。 要获得更多控制，可以使用一个或多个 `GsonBuilderCustomizer` bean。

### 6.3 JSON-B

提供了 `JSON-B` 的自动配置。 当 `JSON-B API` 和实现在类路径上时，将自动配置一个 `Jsonb` bean。 首选的 JSON-B 实现是 `Eclipse Yasson`，它提供了依赖管理。

## 7. 任务执行和调度

在上下文中没有 `Executor` bean 的情况下，Spring Boot 会自动配置一个具有合理默认值的 `ThreadPoolTaskExecutor`，这些默认值可以自动关联到异步任务执行 (`@EnableAsync`) 和 `Spring MVC` 异步请求处理。

> 如果您在上下文中定义了自定义执行器，常规任务执行（即`@EnableAsync`）将透明地使用它，但不会配置 `Spring MVC` 支持，因为它需要 `AsyncTaskExecutor` 实现（名为 `applicationTaskExecutor`）。 根据您的目标安排，您可以将 `Executor` 更改为 `ThreadPoolTaskExecutor` 或同时定义 `ThreadPoolTaskExecutor` 和包装自定义 `Executor` 的 `AsyncConfigurer`。
>
> 自动配置的 `TaskExecutorBuilder` 允许您轻松创建实例来重现默认情况下自动配置所做的事情。

线程池使用8个核心线程，可以根据负载增长和收缩。 可以使用 `spring.task.execution` 命名空间对这些默认设置进行微调，如以下示例所示：

**properties**

```properties
spring.task.execution.pool.max-size=16
spring.task.execution.pool.queue-capacity=100
spring.task.execution.pool.keep-alive=10s
```

**yaml**

```yaml
spring:
  task:
    execution:
      pool:
        max-size: 16
        queue-capacity: 100
        keep-alive: "10s"
```

这会将线程池更改为使用有界队列，以便当队列已满（`100` 个任务）时，线程池增加到最多 `16` 个线程。 当线程空闲 `10` 秒（而不是默认情况下的 `60` 秒）时，线程会被回收，因此池的收缩更为激进。

如果需要与计划的任务执行相关联（例如使用`@EnableScheduling`），也可以自动配置 `ThreadPoolTaskScheduler`。 线程池默认使用一个线程，其设置可以使用 `spring.task.scheduling` 命名空间进行微调，如下例所示：

**properties**

```properties
spring.task.scheduling.thread-name-prefix=scheduling-
spring.task.scheduling.pool.size=2
```

**yaml**

```yaml
spring:
  task:
    scheduling:
      thread-name-prefix: "scheduling-"
      pool:
        size: 2
```

如果需要创建自定义执行程序或调度程序，则 `TaskExecutorBuilder` bean 和 `TaskSchedulerBuilder` bean 在上下文中可用。

## 8. 测试

`Spring Boot` 提供了许多实用程序和注释来帮助测试您的应用程序。 测试支持由两个模块提供：`spring-boot-test` 包含核心项目，`spring-boot-test-autoconfigure` 支持测试的自动配置。 大多数开发人员使用 `spring-boot-starter-test` `“Starter”`，它导入 `Spring Boot` 测试模块以及 `JUnit Jupiter`、`AssertJ`、`Hamcrest` 和许多其他有用的库。

> 如果您有使用 `JUnit 4` 的测试，则可以使用 `JUnit 5` 的老式引擎来运行它们。 要使用 `vintage` 引擎，请添加对 `junit-vintage-engine` 的依赖，如以下示例所示：
>
> ```java
> <dependency>
>  <groupId>org.junit.vintage</groupId>
>  <artifactId>junit-vintage-engine</artifactId>
>  <scope>test</scope>
>  <exclusions>
>      <exclusion>
>          <groupId>org.hamcrest</groupId>
>          <artifactId>hamcrest-core</artifactId>
>      </exclusion>
>  </exclusions>
> </dependency>
> ```

`hamcrest-core` 被排除在外，支持 `org.hamcrest:hamcrest`，它是 `spring-boot-starter-test` 的一部分。

### 8.1 测试 Scope 依赖

`spring-boot-starter-test` “Starter”（在测试范围内）包含以下提供的库：

- [JUnit 5](https://junit.org/junit5/): 单元测试 Java 应用程序的实际标准。
- [Spring Test](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#integration-testing) & Spring Boot Test: 对 Spring Boot 应用程序的实用程序和集成测试支持。
- [AssertJ](https://assertj.github.io/doc/): 流畅的断言库。
- [Hamcrest](https://github.com/hamcrest/JavaHamcrest): 匹配器对象库（也称为约束或谓词）。
- [Mockito](https://site.mockito.org/): 一个 Java 模拟框架。
- [JSONassert](https://github.com/skyscreamer/JSONassert): JSON 断言库。
- [JsonPath](https://github.com/jayway/JsonPath): JSON 的 XPath。

我们通常会发现这些公共库在编写测试时很有用。 如果这些库不适合您的需要，您可以添加自己的额外测试依赖项。

### 8.2 Spring 应用测试

依赖注入的主要优点之一是它应该使您的代码更容易进行单元测试。 您甚至可以在不涉及 Spring 的情况下使用 new 运算符实例化对象。 您还可以使用模拟对象而不是真正的依赖项。

通常，您需要超越单元测试并开始集成测试（使用 `Spring` `ApplicationContext`）。 能够执行集成测试而不需要部署应用程序或连接到其他基础设施是很有用的。

`Spring Framework` 包含一个专门用于此类集成测试的测试模块。 您可以直接向 org.springframework:spring-test 声明一个依赖项，或者使用 `spring-boot-starter-test` “Starter” 来传递它。

如果您以前没有使用过 `spring-test` 模块，您应该先阅读 Spring Framework 参考文档的 [相关部分](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#testing) 。

### 8.3 Spring Boot 应用测试

一个 Spring Boot 应用程序是一个 `Spring ApplicationContext`，因此除了通常使用 vanilla Spring 上下文所做的之外，无需做任何特别的事情来测试它。

> 仅当您使用 `SpringApplication` 创建它时，默认情况下才会在上下文中安装 `Spring Boot` 的外部属性、日志记录和其他功能。

`Spring Boot` 提供了一个`@SpringBootTest` 注解，当您需要 `Spring Boot` 特性时，可以使用它来替代标准的 `spring-test` `@ContextConfiguration` 注解。 注解 [通过 `SpringApplication` 创建在测试中使用的 ApplicationContext](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.detecting-configuration)  来工作。 除了 `@SpringBootTest` 之外，还提供了许多其他注解来 [测试应用程序的更具体的部分](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-tests) 。

> 如果您使用的是 `JUnit 4`，请不要忘记也将 `@RunWith(SpringRunner.class)` 添加到您的测试中，否则注释将被忽略。 如果您使用的是 `JUnit 5`，则无需添加与 `@SpringBootTest` 等效的 `@ExtendWith(SpringExtension.class)` 并且其他 `@... Test` 注释已使用它进行注解。

默认情况下，`@SpringBootTest` 不会启动服务器。 您可以使用 `@SpringBootTest` 的 `webEnvironment` 属性进一步优化测试的运行方式：

- `MOCK`（默认）：加载 web `ApplicationContext` 并提供模拟 `web` 环境。 使用此注释时不会启动嵌入式服务器。 如果您的类路径上没有可用的 Web 环境，此模式会透明地回退到创建常规的非 `Web` `ApplicationContext`。 它可以与 [`@AutoConfigureMockMvc` 或 `@AutoConfigureWebTestClient`](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.with-mock-environment) 结合使用，以对您的 Web 应用程序进行基于模拟的测试。

- `RANDOM_PORT`：加载一个`WebServerApplicationContext`，提供一个真实的web环境。 嵌入式服务器启动并侦听随机端口。 `DEFINED_PORT`：加载一个`WebServerApplicationContext`，提供一个真实的 `web `环境。 嵌入式服务器启动并侦听定义的端口（来自您的 `application.properties`）或默认端口 `8080`。

- `NONE`：使用 `SpringApplication` 加载 `ApplicationContext` 但不提供任何 `Web` 环境（模拟或其他）。

> 如果您的测试是 `@Transactional` ，默认情况下它会在每个测试方法结束时回滚事务。 但是，由于将这种安排与 `RANDOM_PORT` 或 `DEFINED_PORT` 一起使用隐含地提供了一个真正的 `servlet` 环境，因此 `HTTP` 客户端和服务器在单独的线程中运行，因此在单独的事务中运行。 在这种情况下，服务器上发起的任何事务都不会回滚。

> `@SpringBootTest with webEnvironment` = `WebEnvironment.RANDOM_PORT` 如果您的应用程序为管理服务器使用不同的端口，则还将在单独的随机端口上启动管理服务器。

#### 8.3.1 检测 Web 应用程序类型

如果 Spring MVC 可用，则会配置常规的基于 MVC 的应用程序上下文。 如果您只有 Spring WebFlux，我们将检测到它并配置一个基于 WebFlux 的应用程序上下文。 如果两者都存在，则 Spring MVC 优先。

如果要在这种情况下测试反应式 Web 应用程序，则必须设置 `spring.main.web-application-type` 属性：

**java**

```java
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.main.web-application-type=reactive")
class MyWebFluxTests {

    // ...

}
```

**Kotlin**

```java
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(properties = ["spring.main.web-application-type=reactive"])
class MyWebFluxTests {

    // ...

}
```

#### 8.3.2 检测测试配置

如果您熟悉 `Spring` 测试框架，您可能习惯于使用 `@ContextConfiguration(classes=… )` 来指定要加载哪个 `Spring` `@Configuration`。 或者，您可能经常在测试中使用嵌套的 `@Configuration` 类。

在测试 `Spring Boot` 应用程序时，通常不需要这样做。 `Spring Boot` 的 `@*Test` 注解会在您未明确定义时自动搜索您的主要配置。

搜索算法从包含测试的包开始工作，直到找到用 `@SpringBootApplication` 或 `@SpringBootConfiguration` 注解的类。 只要您以合理的方式 [构建代码](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.structuring-your-code) ，通常就能找到您的[主要配置](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.user-configuration-and-slicing)。

> 如果您使用 [测试注解来测试应用程序的更具体的部分](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-tests) ，则应避免在 `main` 方法的应用程序类上添加特定于特定区域的配置设置。 `@SpringBootApplication` 的底层组件扫描配置定义了用于确保切片按预期工作的排除过滤器。 如果您在 `@SpringBootApplication` 注解类上使用显式 `@ComponentScan` 指令，请注意这些过滤器将被禁用。 如果你正在使用切片，你应该重新定义它们。

如果要自定义主要配置，可以使用嵌套的 `@TestConfiguration` 类。 与嵌套的 `@Configuration` 类不同，嵌套的`@Configuration` 类将用于代替应用程序的主要配置，而嵌套的 `@TestConfiguration` 类除了应用程序的主要配置外还会使用。

> Spring 的测试框架在测试之间缓存应用程序上下文。 因此，只要您的测试共享相同的配置（无论它是如何被发现的），加载上下文的潜在耗时过程只会发生一次。



##### 8.3.3 使用测试配置 Main 方法

通常，@SpringBootTest 发现的测试配置将是您的主要@SpringBootApplication。 在大多数结构良好的应用程序中，此配置类还将包括用于启动应用程序的主要方法。 例如，以下是一个典型的 Spring Boot 应用程序非常常见的代码模式：

**java**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.docs.using.structuringyourcode.locatingthemainclass.MyApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}
```

在上面的示例中，main 方法除了委托给 `SpringApplication.run` 之外没有做任何事情。 但是，可以有一个更复杂的主要方法，在调用 `SpringApplication.run` 之前应用自定义。 例如，这是一个更改横幅模式并设置其他配置文件的应用程序：

**java**

```java
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(MyApplication.class);
        application.setBannerMode(Banner.Mode.OFF);
        application.setAdditionalProfiles("myprofile");
        application.run(args);
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.Banner
import org.springframework.boot.runApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args) {
        setBannerMode(Banner.Mode.OFF)
        setAdditionalProfiles("myprofile");
    }
}
```

由于 main 方法中的自定义会影响生成的 `ApplicationContext`，因此您可能还想使用 `main` 方法来创建在测试中使用的 `ApplicationContext`。 默认情况下，@SpringBootTest 不会调用您的 `main` 方法，而是直接使用类本身来创建 `ApplicationContext`

如果要更改此行为，可以将 `@SpringBootTest` 的 `useMainMethod` 属性更改为 `UseMainMethod.ALWAYS` 或 `UseMainMethod.WHEN_AVAILABLE`。 当设置为 `ALWAYS` 时，如果找不到 `main` 方法，测试将失败。 当设置为 `WHEN_AVAILABLE` 时，如果可用，将使用 `main` 方法，否则将使用标准加载机制。

例如，以下测试将调用 `MyApplication` 的主要方法以创建 `ApplicationContext`。 如果 `main` 方法设置了额外的配置文件，那么这些配置文件将在 `ApplicationContext` 启动时处于活动状态。

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.UseMainMethod;

@SpringBootTest(useMainMethod = UseMainMethod.ALWAYS)
public class MyApplicationTests {

    @Test
    void exampleTest() {
        // ...
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.UseMainMethod
import org.springframework.context.annotation.Import

@SpringBootTest(useMainMethod = UseMainMethod.ALWAYS)
class MyApplicationTests {

    @Test
    fun exampleTest() {
        // ...
    }

}
```

#### 8.3.4 排除测试配置

如果您的应用程序使用组件扫描（例如，如果您使用 `@SpringBootApplication` 或 `@ComponentScan`），您可能会发现您仅为特定测试创建的顶级配置类会意外地随处可见。

正如我们之前所见，`@TestConfiguration` 可用于测试的内部类以自定义主要配置。 当放在顶级类上时，`@TestConfiguration` 表示不应通过扫描拾取 `src/test/java` 中的类。 然后，您可以在需要的地方显式导入该类，如以下示例所示：

**java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(MyTestsConfiguration.class)
class MyTests {

    @Test
    void exampleTest() {
        // ...
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import

@SpringBootTest
@Import(MyTestsConfiguration::class)
class MyTests {

    @Test
    fun exampleTest() {
        // ...
    }

}
```

> 如果直接使用`@ComponentScan`（即不通过`@SpringBootApplication`），则需要向其注册TypeExcludeFilter。 有关详细信息，请参阅 [Javadoc](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/context/TypeExcludeFilter.html)。

#### 8.3.5 使用应用参数

如果您的应用程序需要参数，您可以让`@SpringBootTest` 使用 `args` 属性注入它们。

**java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(args = "--app.test=one")
class MyApplicationArgumentTests {

    @Test
    void applicationArgumentsPopulated(@Autowired ApplicationArguments args) {
        assertThat(args.getOptionNames()).containsOnly("app.test");
        assertThat(args.getOptionValues("app.test")).containsOnly("one");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(args = ["--app.test=one"])
class MyApplicationArgumentTests {

    @Test
    fun applicationArgumentsPopulated(@Autowired args: ApplicationArguments) {
        assertThat(args.optionNames).containsOnly("app.test")
        assertThat(args.getOptionValues("app.test")).containsOnly("one")
    }

}
```

#### 8.3.6 使用模拟环境进行测试

默认情况下，`@SpringBootTest` 不会启动服务器，而是设置一个用于测试 `Web` 端点的模拟环境。

使用 `Spring MVC`，我们可以使用 `MockMvc` 或 `WebTestClient` 查询我们的 Web 端点，如以下示例所示：

**java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MyMockMvcTests {

    @Test
    void testWithMockMvc(@Autowired MockMvc mvc) throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(content().string("Hello World"));
    }

    // If Spring WebFlux is on the classpath, you can drive MVC tests with a WebTestClient
    @Test
    void testWithWebTestClient(@Autowired WebTestClient webClient) {
        webClient
                .get().uri("/")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("Hello World");
    }

}
```

**Kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@SpringBootTest
@AutoConfigureMockMvc
class MyMockMvcTests {

    @Test
    fun testWithMockMvc(@Autowired mvc: MockMvc) {
        mvc.perform(MockMvcRequestBuilders.get("/")).andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.content().string("Hello World"))
    }

    // If Spring WebFlux is on the classpath, you can drive MVC tests with a WebTestClient

    @Test
    fun testWithWebTestClient(@Autowired webClient: WebTestClient) {
        webClient
            .get().uri("/")
            .exchange()
            .expectStatus().isOk
            .expectBody<String>().isEqualTo("Hello World")
    }

}
```

如果你只想关注 `web` 层而不是启动一个完整的 `ApplicationContext`，请考虑使用 `@WebMvcTest`。

借助 `Spring` `WebFlux` 端点，您可以使用 `WebTestClient`，如以下示例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
class MyMockWebTestClientTests {

    @Test
    void exampleTest(@Autowired WebTestClient webClient) {
        webClient
            .get().uri("/")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class).isEqualTo("Hello World");
    }

}
```

**Kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@SpringBootTest
@AutoConfigureWebTestClient
class MyMockWebTestClientTests {

    @Test
    fun exampleTest(@Autowired webClient: WebTestClient) {
        webClient
            .get().uri("/")
            .exchange()
            .expectStatus().isOk
            .expectBody<String>().isEqualTo("Hello World")
    }

}
```

在模拟环境中进行测试通常比在完整的 `servlet` 容器中运行要快。 但是，由于模拟发生在 `Spring MVC` 层，依赖于较低级别 `servlet` 容器行为的代码无法直接使用 `MockMvc` 进行测试。

例如，`Spring Boot` 的错误处理是基于 `servlet` 容器提供的 “错误页面” 支持。 这意味着，虽然您可以测试 `MVC` 层抛出并按预期处理异常，但您无法直接测试特定的 [自定义错误页面](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.error-handling.error-pages) 是否已呈现。 如果您需要测试这些较低级别的问题，您可以启动一个完全运行的服务器，如下一节所述。

#### 8.3.7 使用正在运行的服务器进行测试

如果您需要启动一个完整运行的服务器，我们建议您使用随机端口。 如果您使用`@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)`，则每次测试运行时都会随机选择一个可用端口。

`@LocalServerPort` 注解可用于将 [实际使用的端口注入](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.discover-port) 到您的测试中。 为方便起见，需要对启动的服务器进行 `REST` 调用的测试可以另外 @`Autowire` 一个 [`WebTestClient`](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#webtestclient-tests)，它解析到正在运行的服务器的相关链接，并带有一个专用的 `API` 来验证响应，如下例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MyRandomPortWebTestClientTests {

    @Test
    void exampleTest(@Autowired WebTestClient webClient) {
        webClient
            .get().uri("/")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class).isEqualTo("Hello World");
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MyRandomPortWebTestClientTests {

    @Test
    fun exampleTest(@Autowired webClient: WebTestClient) {
        webClient
            .get().uri("/")
            .exchange()
            .expectStatus().isOk
            .expectBody<String>().isEqualTo("Hello World")
    }

}
```

> `WebTestClient` 可用于实时服务器和 [模拟环境](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.with-mock-environment) 。

此设置需要类路径上的 `spring-webflux`。 如果您不能或不会添加 `webflux`，Spring Boot 还提供了一个 `TestRestTemplate` 工具：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MyRandomPortTestRestTemplateTests {

    @Test
    void exampleTest(@Autowired TestRestTemplate restTemplate) {
        String body = restTemplate.getForObject("/", String.class);
        assertThat(body).isEqualTo("Hello World");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.test.web.client.TestRestTemplate

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MyRandomPortTestRestTemplateTests {

    @Test
    fun exampleTest(@Autowired restTemplate: TestRestTemplate) {
        val body = restTemplate.getForObject("/", String::class.java)
        assertThat(body).isEqualTo("Hello World")
    }

}
```

#### 8.3.8 自定义 WebTestClient

要自定义 `WebTestClient` bean，请配置 `WebTestClientBuilderCustomizer` bean。 使用用于创建 `WebTestClient` 的 `WebTestClient.Builder` 调用任何此类 bean。

#### 8.3.9 使用 JMX

由于测试上下文框架缓存上下文，默认情况下禁用 `JMX` 以防止相同的组件在同一域上注册。 如果此类测试需要访问 `MBeanServer`，请考虑将其标记为脏：

**Java**

```java
import javax.management.MBeanServer;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.jmx.enabled=true")
@DirtiesContext
class MyJmxTests {

    @Autowired
    private MBeanServer mBeanServer;

    @Test
    void exampleTest() {
        assertThat(this.mBeanServer.getDomains()).contains("java.lang");
        // ...
    }

}
```

**kotlin**

```kotlin
import javax.management.MBeanServer

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext

@SpringBootTest(properties = ["spring.jmx.enabled=true"])
@DirtiesContext
class MyJmxTests(@Autowired val mBeanServer: MBeanServer) {

    @Test
    fun exampleTest() {
        assertThat(mBeanServer.domains).contains("java.lang")
        // ...
    }

}
```

#### 8.3.10 使用 Metrics

无论您的类路径如何，在使用`@SpringBootTest` 时，仪表注册表（内存中支持的除外）都不会自动配置。

如果您需要将指标导出到不同的后端作为集成测试的一部分，请使用 `@AutoConfigureObservability` 对其进行注解。

#### 8.3.11 使用 Tracing

无论您的类路径如何，使用@SpringBootTest 时都不会自动配置跟踪。

如果您需要将跟踪作为集成测试的一部分，请使用 `@AutoConfigureObservability` 对其进行注解。

#### 8.3.12 mock 和 spying beans

运行测试时，有时需要在应用程序上下文中模拟某些组件。 例如，您可能有一些在开发期间不可用的远程服务的外观。 当您想要模拟在真实环境中可能难以触发的故障时，模拟也很有用。

`Spring Boot` 包含一个 `@MockBean` 注解，可用于为 `ApplicationContext` 中的 bean 定义 `Mockito` 模拟。 您可以使用注释来添加新的 bean 或替换单个现有的 bean 定义。 注释可以直接用于测试类、测试中的字段或`@Configuration` 类和字段。 当在一个字段上使用时，创建的 `mock` 的实例也会被注入。 模拟 bean 在每个测试方法后自动重置。

> 如果您的测试使用 Spring Boot 的测试注解之一（例如@SpringBootTest），则此功能会自动启用。 要以不同的安排使用此功能，必须显式添加侦听器，如以下示例所示：
>
> **Java**
>
> ```
> import org.springframework.boot.test.mock.mockito.MockitoTestExecutionListener;
> import org.springframework.boot.test.mock.mockito.ResetMocksTestExecutionListener;
> import org.springframework.test.context.ContextConfiguration;
> import org.springframework.test.context.TestExecutionListeners;
> 
> @ContextConfiguration(classes = MyConfig.class)
> @TestExecutionListeners({ MockitoTestExecutionListener.class, ResetMocksTestExecutionListener.class })
> class MyTests {
> 
>  // ...
> 
> }
> ```
>
> **Kotlin**
>
> ```kotlin
> import org.springframework.boot.test.mock.mockito.MockitoTestExecutionListener
> import org.springframework.boot.test.mock.mockito.ResetMocksTestExecutionListener
> import org.springframework.test.context.ContextConfiguration
> import org.springframework.test.context.TestExecutionListeners
> 
> @ContextConfiguration(classes = [MyConfig::class])
> @TestExecutionListeners(
>  MockitoTestExecutionListener::class,
>  ResetMocksTestExecutionListener::class
> )
> class MyTests {
> 
>  // ...
> 
> }
> ```

以下示例将现有的 `RemoteService` bean 替换为模拟实现：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@SpringBootTest
class MyTests {

    @Autowired
    private Reverser reverser;

    @MockBean
    private RemoteService remoteService;

    @Test
    void exampleTest() {
        given(this.remoteService.getValue()).willReturn("spring");
        String reverse = this.reverser.getReverseValue(); // Calls injected RemoteService
        assertThat(reverse).isEqualTo("gnirps");
    }

}
```

`Kotlin`

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean

@SpringBootTest
class MyTests(@Autowired val reverser: Reverser, @MockBean val remoteService: RemoteService) {

    @Test
    fun exampleTest() {
        given(remoteService.value).willReturn("spring")
        val reverse = reverser.reverseValue // Calls injected RemoteService
        assertThat(reverse).isEqualTo("gnirps")
    }

}
```

> `@MockBean` 不能用于模拟在应用程序上下文刷新期间执行的 bean 的行为。 执行测试时，应用程序上下文刷新已完成，配置模拟行为为时已晚。 在这种情况下，我们建议使用 `@Bean` 方法来创建和配置模拟。

此外，您可以使用 `@SpyBean` 将任何现有的 bean 与 `Mockito spy`一起包装。 有关详细信息，请参阅  [Javadoc](https://docs.spring.io/spring-boot/docs/3.0.2/api/org/springframework/boot/test/mock/mockito/SpyBean.html) 。

> `CGLib` 代理，例如为作用域 bean 创建的代理，将代理方法声明为 `final`。 这会阻止 `Mockito` 正常运行，因为它无法在其默认配置中模拟或监视最终方法。 如果您想模拟或监视这样的 bean，请通过将 `org.mockito:mockito-inline` 添加到应用程序的测试依赖项来配置 `Mockito` 以使用其内联模拟制造商。 这允许 `Mockito` 模拟和监视最终方法。

> 虽然 Spring 的测试框架在测试之间缓存应用程序上下文并为共享相同配置的测试重用上下文，但 @MockBean 或 @SpyBean 的使用会影响缓存键，这很可能会增加上下文的数量。

> 如果您使用@SpyBean 来监视具有按名称引用参数的@Cacheable 方法的bean，则您的应用程序必须使用-parameters 进行编译。 这确保一旦侦测到 bean，参数名称就可用于缓存基础结构。

> 当您使用 @SpyBean 监视由 Spring 代理的 bean 时，您可能需要在某些情况下删除 Spring 的代理，例如在使用 given 或 when 设置期望时。 使用 AopTestUtils.getTargetObject(yourProxiedSpy) 来这样做。

#### 8.3.13 自动配置测试

`Spring Boot` 的自动配置系统适用于应用程序，但有时对测试来说有点过分。 它通常有助于仅加载测试应用程序 “切片”所需的配置部分。 例如，您可能想测试 `Spring MVC` 控制器是否正确映射 `URL`，并且您不想在这些测试中涉及数据库调用，或者您可能想测试 JPA 实体，而当那些时您对 `Web` 层不感兴趣 测试运行。

`spring-boot-test-autoconfigure` 模块包含许多可用于自动配置此类“切片”的注解。 它们中的每一个都以类似的方式工作，提供一个加载 `ApplicationContext` 的 `@… Test` 注解、和一个或多个 `@AutoConfigure…` 可用于自定义自动配置设置的注解。

> 每个切片将组件扫描限制在适当的组件上，并加载一组非常有限的自动配置类。 如果您需要排除其中之一，大多数 `@... Test` 注解都提供 `excludeAutoConfiguration` 属性。 或者，您可以使用`@ImportAutoConfiguration#exclude`。

> 不支持通过在一个测试中使用多个 `@... Test` 注解来包含多个“切片”。 如果您需要多个“切片”，请选择一个 `@… Test` 注解并手动包含其他“切片”的 `@AutoConfigure…` 注解。

#### 8.3.14 自动配置的 JSON测试

要测试对象 JSON 序列化和反序列化是否按预期工作，您可以使用 @JsonTest 注释。 @JsonTest 自动配置可用的支持的 JSON 映射器，它可以是以下库之一：

- Jackson `ObjectMapper`、任何`@JsonComponent` bean 和任何 Jackson Modules
- `Gson`
- `Jsonb`

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到 `@JsonTest` 启用的自动配置列表。

如果需要配置自动配置的元素，可以使用`@AutoConfigureJsonTesters` 注解。

`Spring Boot` 包含基于 `AssertJ` 的帮助程序，这些帮助程序与 `JSONAssert` 和 `JsonPath` 库一起工作，以检查 `JSON` 是否按预期显示。 `JacksonTester`、`GsonTester`、`JsonbTester` 和 `BasicJsonTester` 类可分别用于 `Jackson`、`Gson`、`Jsonb` 和字符串。 使用`@JsonTest` 时，测试类上的任何辅助字段都可以是`@Autowired`。 以下示例显示了 `Jackson` 的测试类：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
class MyJsonTests {

    @Autowired
    private JacksonTester<VehicleDetails> json;

    @Test
    void serialize() throws Exception {
        VehicleDetails details = new VehicleDetails("Honda", "Civic");
        // Assert against a `.json` file in the same package as the test
        assertThat(this.json.write(details)).isEqualToJson("expected.json");
        // Or use JSON path based assertions
        assertThat(this.json.write(details)).hasJsonPathStringValue("@.make");
        assertThat(this.json.write(details)).extractingJsonPathStringValue("@.make").isEqualTo("Honda");
    }

    @Test
    void deserialize() throws Exception {
        String content = "{\"make\":\"Ford\",\"model\":\"Focus\"}";
        assertThat(this.json.parse(content)).isEqualTo(new VehicleDetails("Ford", "Focus"));
        assertThat(this.json.parseObject(content).getMake()).isEqualTo("Ford");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester

@JsonTest
class MyJsonTests(@Autowired val json: JacksonTester<VehicleDetails>) {

    @Test
    fun serialize() {
        val details = VehicleDetails("Honda", "Civic")
        // Assert against a `.json` file in the same package as the test
        assertThat(json.write(details)).isEqualToJson("expected.json")
        // Or use JSON path based assertions
        assertThat(json.write(details)).hasJsonPathStringValue("@.make")
        assertThat(json.write(details)).extractingJsonPathStringValue("@.make").isEqualTo("Honda")
    }

    @Test
    fun deserialize() {
        val content = "{\"make\":\"Ford\",\"model\":\"Focus\"}"
        assertThat(json.parse(content)).isEqualTo(VehicleDetails("Ford", "Focus"))
        assertThat(json.parseObject(content).make).isEqualTo("Ford")
    }

}
```

> JSON helper 类也可以直接用于标准单元测试。 为此，如果不使用`@JsonTest`，请在`@Before` 方法中调用助手的`initFields` 方法。

如果您使用 `Spring Boot` 的基于 `AssertJ` 的帮助程序对给定 `JSON` 路径中的数字值进行断言，则可能无法使用 `isEqualTo`，具体取决于类型。 相反，您可以使用 `AssertJ` 的满足来断言该值与给定条件匹配。 例如，以下示例断言实际数字是一个接近 `0.15` 且偏移量为 `0.01` 的浮点值。

**Java**

```java
@Test
void someTest() throws Exception {
    SomeObject value = new SomeObject(0.152f);
    assertThat(this.json.write(value)).extractingJsonPathNumberValue("@.test.numberValue")
            .satisfies((number) -> assertThat(number.floatValue()).isCloseTo(0.15f, within(0.01f)));
}
```

**kotlin**

```kotlin
@Test
fun someTest() {
    val value = SomeObject(0.152f)
    assertThat(json.write(value)).extractingJsonPathNumberValue("@.test.numberValue")
        .satisfies(ThrowingConsumer { number ->
            assertThat(number.toFloat()).isCloseTo(0.15f, within(0.01f))
        })
}
```



#### 8.3.15 自动配置的 Spring MVC 测试

要测试 Spring MVC 控制器是否按预期工作，请使用 `@WebMvcTest` 注解。 `@WebMvcTest` 自动配置 Spring MVC 基础结构并将扫描的 bean 限制为 `@Controller`、@ControllerAdvice、`@JsonComponent`、`Converter`、`GenericConverter`、`Filter`、`HandlerInterceptor`、`WebMvcConfigurer`、`WebMvcRegistrations` 和 `HandlerMethodArgumentResolver`。 使用`@WebMvcTest` 注释时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` beans。

> 可以在附录中找到由 `@WebMvcTest` 启用的自动配置设置列表。

> 如果您需要注册额外的组件，例如 `Jackson` 模块，您可以在测试中使用 `@Import` 导入额外的配置类。

通常，`@WebMvcTest` 仅限于单个控制器，并与 `@MockBean` 结合使用，为所需的协作者提供模拟实现。

`@WebMvcTest` 还自动配置 `MockMvc`。 `Mock MVC` 提供了一种强大的方法来快速测试 `MVC` 控制器，而无需启动完整的 `HTTP` 服务器。

> 您还可以通过使用`@AutoConfigureMockMvc` 注解在非 `@WebMvcTest`（例如`@SpringBootTest`）中自动配置 `MockMvc`。 以下示例使用 `MockMvc`：

**java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserVehicleController.class)
class MyControllerTests {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private UserVehicleService userVehicleService;

    @Test
    void testExample() throws Exception {
        given(this.userVehicleService.getVehicleDetails("sboot"))
            .willReturn(new VehicleDetails("Honda", "Civic"));
        this.mvc.perform(get("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
            .andExpect(status().isOk())
            .andExpect(content().string("Honda Civic"));
    }

}
```

**kotlin**

````kotlin
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@WebMvcTest(UserVehicleController::class)
class MyControllerTests(@Autowired val mvc: MockMvc) {

    @MockBean
    lateinit var userVehicleService: UserVehicleService

    @Test
    fun testExample() {
        given(userVehicleService.getVehicleDetails("sboot"))
            .willReturn(VehicleDetails("Honda", "Civic"))
        mvc.perform(MockMvcRequestBuilders.get("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.content().string("Honda Civic"))
    }

}
````

> 如果您需要配置自动配置的元素（例如，何时应应用 `servlet` 过滤器），您可以在 `@AutoConfigureMockMvc` 注解中使用属性。

如果您使用 `HtmlUnit` 和 Selenium，自动配置还会提供一个 `HtmlUnit` `WebClient` bean 和/或一个 `Selenium` `WebDriver` bean。 以下示例使用 `HtmlUnit`：

**Java**

```java
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@WebMvcTest(UserVehicleController.class)
class MyHtmlUnitTests {

    @Autowired
    private WebClient webClient;

    @MockBean
    private UserVehicleService userVehicleService;

    @Test
    void testExample() throws Exception {
        given(this.userVehicleService.getVehicleDetails("sboot")).willReturn(new VehicleDetails("Honda", "Civic"));
        HtmlPage page = this.webClient.getPage("/sboot/vehicle.html");
        assertThat(page.getBody().getTextContent()).isEqualTo("Honda Civic");
    }

}
```

**kotlin**

```kotlin
import com.gargoylesoftware.htmlunit.WebClient
import com.gargoylesoftware.htmlunit.html.HtmlPage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean

@WebMvcTest(UserVehicleController::class)
class MyHtmlUnitTests(@Autowired val webClient: WebClient) {

    @MockBean
    lateinit var userVehicleService: UserVehicleService

    @Test
    fun testExample() {
        given(userVehicleService.getVehicleDetails("sboot")).willReturn(VehicleDetails("Honda", "Civic"))
        val page = webClient.getPage<HtmlPage>("/sboot/vehicle.html")
        assertThat(page.body.textContent).isEqualTo("Honda Civic")
    }

}
```

> 默认情况下，`Spring Boot` 将 `WebDriver` beans 放在一个特殊的 “范围” 中，以确保驱动程序在每次测试后退出并注入一个新实例。 如果你不想要这种行为，你可以将 `@Scope("singleton")` 添加到你的 `WebDriver` `@Bean` 定义中。

>
>
> `Spring Boot` 创建的 `webDriver` 作用域将替换任何用户定义的同名作用域。 如果您定义自己的 `webDriver` 范围，您可能会发现它在您使用 `@WebMvcTest` 时停止工作。

如果类路径上有 `Spring Security`，`@WebMvcTest` 也会扫描 WebSecurityConfigurer bean。 您可以使用 `Spring Security` 的测试支持，而不是完全禁用此类测试的安全性。 有关如何使用 `Spring Security` 的 MockMvc 支持的更多详细信息，请参见 [howto.html](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.testing.with-spring-security) 操作部分。

> 有时编写 `Spring MVC` 测试是不够的； `Spring Boot` 可以帮助您使用实际服务器运行 [完整的端到端测试](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.with-running-server) 。

#### 8.3.16 自动配置的 Spring WebFlux 测试

要测试 `Spring WebFlux` 控制器是否按预期工作，您可以使用 @WebFluxTest 注解。 `@WebFluxTest` 自动配置 `Spring WebFlux` 基础设施并将扫描的 bean 限制为 `@Controller`、`@ControllerAdvice`、`@JsonComponent、``Converter`、`GenericConverter`、`WebFilter` 和 `WebFluxConfigurer`。 使用`@WebFluxTest` 注解时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> 可以 [在附录中找到](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 由 `@WebFluxTest` 启用的自动配置列表。

> 如果您需要注册额外的组件，例如 `Jackson` 模块，您可以在测试中使用 `@Import` 导入额外的配置类。

通常，`@WebFluxTest` 仅限于单个控制器，并与 `@MockBean` 注解结合使用，为所需的协作者提供模拟实现。

`@WebFluxTest` 还自动配置 [`WebTestClient`](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#webtestclient)，它提供了一种强大的方法来快速测试 `WebFlux` 控制器，而无需启动完整的 `HTTP` 服务器。

> 您还可以通过使用`@AutoConfigureWebTestClient` 注释在非`@WebFluxTest`（例如@SpringBootTest）中自动配置`WebTestClient`。 以下示例显示了一个同时使用 `@WebFluxTest` 和 `WebTestClient` 的类：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.BDDMockito.given;

@WebFluxTest(UserVehicleController.class)
class MyControllerTests {

    @Autowired
    private WebTestClient webClient;

    @MockBean
    private UserVehicleService userVehicleService;

    @Test
    void testExample() {
        given(this.userVehicleService.getVehicleDetails("sboot"))
            .willReturn(new VehicleDetails("Honda", "Civic"));
        this.webClient.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN).exchange()
            .expectStatus().isOk()
            .expectBody(String.class).isEqualTo("Honda Civic");
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@WebFluxTest(UserVehicleController::class)
class MyControllerTests(@Autowired val webClient: WebTestClient) {

    @MockBean
    lateinit var userVehicleService: UserVehicleService

    @Test
    fun testExample() {
        given(userVehicleService.getVehicleDetails("sboot"))
            .willReturn(VehicleDetails("Honda", "Civic"))
        webClient.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN).exchange()
            .expectStatus().isOk
            .expectBody<String>().isEqualTo("Honda Civic")
    }

}
```

> 此设置仅受 `WebFlux` 应用程序支持，因为在模拟 `Web` 应用程序中使用 `WebTestClient` 目前仅适用于 `WebFlux`。

> `@WebFluxTest` 无法检测通过功能性 `Web` 框架注册的路由。 要在上下文中测试 `RouterFunction` bean，请考虑使用 `@Import` 或使用 `@SpringBootTest` 自己导入 `RouterFunction`。

> `@WebFluxTest` 无法检测注册为 `SecurityWebFilterChain` 类型的 `@Bean` 的自定义安全配置。 要将其包含在您的测试中，您将需要使用`@Import` 或使用`@SpringBootTest` 导入注册bean 的配置。

> 有时编写 `Spring WebFlux` 测试是不够的； `Spring Boot` 可以帮助您使用实际服务器运行 [完整的端到端测试](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.with-running-server) 。



#### 8.3.17 自动配置的 Spring GraphQL测试

`Spring GraphQL` 提供了专门的测试支持模块； 你需要将它添加到你的项目中：

*Maven*

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.graphql</groupId>
    <artifactId>spring-graphql-test</artifactId>
    <scope>test</scope>
  </dependency>
  <!-- Unless already present in the compile scope -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

*Gradle*

```
dependencies {
  testImplementation("org.springframework.graphql:spring-graphql-test")
  // Unless already present in the implementation configuration
  testImplementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

这个测试模块附带了 [GraphQlTester](https://docs.spring.io/spring-graphql/docs/1.1.1/reference/html//#testing-graphqltester)。 测试仪在测试中使用较多，一定要熟悉使用。 有 `GraphQlTester` 变体，`Spring Boot` 将根据测试类型自动配置它们：

- `ExecutionGraphQlServiceTester` 在服务器端执行测试，没有客户端也没有传输

- `HttpGraphQlTester` 使用连接到服务器的客户端执行测试，有或没有实时服务器

`Spring Boot` 可帮助您使用 `@GraphQlTest` 注解测试 `Spring GraphQL` 控制器。 `@GraphQlTest` 自动配置 `Spring GraphQL` 基础设施，不涉及任何传输或服务器。 这将扫描的 bean 限制为 `@Controller`、`RuntimeWiringConfigurer`、`JsonComponent`、`Converter`、`GenericConverter`、`DataFetcherExceptionResolver`、`Instrumentation` 和 `GraphQlSourceBuilderCustomizer`。 使用`@GraphQlTest` 注解时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到 @GraphQlTest 启用的自动配置列表。

通常，`@GraphQlTest` 仅限于一组控制器，并与 `@MockBean` 注释结合使用，为所需的协作者提供模拟实现。

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.docs.web.graphql.runtimewiring.GreetingController;
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest;
import org.springframework.graphql.test.tester.GraphQlTester;

@GraphQlTest(GreetingController.class)
class GreetingControllerTests {

    @Autowired
    private GraphQlTester graphQlTester;

    @Test
    void shouldGreetWithSpecificName() {
        this.graphQlTester.document("{ greeting(name: \"Alice\") } ").execute().path("greeting").entity(String.class)
                .isEqualTo("Hello, Alice!");
    }

    @Test
    void shouldGreetWithDefaultName() {
        this.graphQlTester.document("{ greeting } ").execute().path("greeting").entity(String.class)
                .isEqualTo("Hello, Spring!");
    }

}
```

**Kotlin**

```java
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.docs.web.graphql.runtimewiring.GreetingController
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest
import org.springframework.graphql.test.tester.GraphQlTester

@GraphQlTest(GreetingController::class)
internal class GreetingControllerTests {

    @Autowired
    lateinit var graphQlTester: GraphQlTester

    @Test
    fun shouldGreetWithSpecificName() {
        graphQlTester.document("{ greeting(name: \"Alice\") } ").execute().path("greeting").entity(String::class.java)
                .isEqualTo("Hello, Alice!")
    }

    @Test
    fun shouldGreetWithDefaultName() {
        graphQlTester.document("{ greeting } ").execute().path("greeting").entity(String::class.java)
                .isEqualTo("Hello, Spring!")
    }

}
```

`@SpringBootTest` 测试是完整的集成测试，涉及整个应用程序。 使用随机或定义的端口时，会配置实时服务器并自动提供 `HttpGraphQlTester` bean，因此您可以使用它来测试服务器。 配置 `MOCK` 环境后，您还可以通过使用 `@AutoConfigureHttpGraphQlTester` 注解您的测试类来请求 `HttpGraphQlTester` bean：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureHttpGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.HttpGraphQlTester;

@AutoConfigureHttpGraphQlTester
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class GraphQlIntegrationTests {

    @Test
    void shouldGreetWithSpecificName(@Autowired HttpGraphQlTester graphQlTester) {
        HttpGraphQlTester authenticatedTester = graphQlTester.mutate()
                .webTestClient(
                        (client) -> client.defaultHeaders((headers) -> headers.setBasicAuth("admin", "ilovespring")))
                .build();
        authenticatedTester.document("{ greeting(name: \"Alice\") } ").execute().path("greeting").entity(String.class)
                .isEqualTo("Hello, Alice!");
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureHttpGraphQlTester
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.graphql.test.tester.HttpGraphQlTester
import org.springframework.http.HttpHeaders
import org.springframework.test.web.reactive.server.WebTestClient

@AutoConfigureHttpGraphQlTester
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class GraphQlIntegrationTests {

    @Test
    fun shouldGreetWithSpecificName(@Autowired graphQlTester: HttpGraphQlTester) {
        val authenticatedTester = graphQlTester.mutate()
            .webTestClient { client: WebTestClient.Builder ->
                client.defaultHeaders { headers: HttpHeaders ->
                    headers.setBasicAuth("admin", "ilovespring")
                }
            }.build()
        authenticatedTester.document("{ greeting(name: \"Alice\") } ").execute()
            .path("greeting").entity(String::class.java).isEqualTo("Hello, Alice!")
    }
}
```

#### 8.3.18 自动配置的数据 Cassandra 测试

您可以使用`@DataCassandraTest` 来测试 `Cassandra` 应用程序。 默认情况下，它配置 `CassandraTemplate`，扫描 @Table 类，并配置 `Spring Data Cassandra` 存储库。 使用`@DataCassandraTest` 注解时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 `Cassandra` 与 `Spring Boot` 结合使用的更多信息，请参阅“[data.html](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.cassandra)”。）

> 可以在附录中找到由 @DataCassandraTest 启用的自动配置设置列表。

以下示例显示了在 Spring Boot 中使用 `Cassandra` 测试的典型设置：

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.cassandra.DataCassandraTest;

@DataCassandraTest
class MyDataCassandraTests {

    @Autowired
    private SomeRepository repository;

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.cassandra.DataCassandraTest

@DataCassandraTest
class MyDataCassandraTests(@Autowired val repository: SomeRepository)
```

#### 8.3.19 自动配置的数据 Couchbase 测试

您可以使用 `@DataCouchbaseTest` 来测试 `Couchbase` 应用程序。 默认情况下，它配置 `CouchbaseTemplate` 或 `ReactiveCouchbaseTemplate`，扫描 @Document 类，并配置 `Spring Data Couchbase` 存储库。 使用`@DataCouchbaseTest` 注释时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 Couchbase 与 Spring Boot 结合使用的更多信息，请参阅本章前面的“[data.html](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.couchbase)”。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@DataCouchbaseTest` 启用的自动配置设置列表。

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.couchbase.DataCouchbaseTest;

@DataCouchbaseTest
class MyDataCouchbaseTests {

    @Autowired
    private SomeRepository repository;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.couchbase.DataCouchbaseTest

@DataCouchbaseTest
class MyDataCouchbaseTests(@Autowired val repository: SomeRepository) {

    // ...

}
```

#### 8.3.20 自动配置的数据 Elasticsearch 测试

您可以使用`@DataElasticsearchTest` 来测试 `Elasticsearch` 应用程序。 默认情况下，它配置一个 `ElasticsearchRestTemplate`，扫描 @Document 类，并配置 `Spring Data Elasticsearch` 存储库。 使用`@DataElasticsearchTest` 注释时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 `Elasticsearch` 与 Spring Boot 结合使用的更多信息，请参阅本章前面的“[data.html](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.elasticsearch)”。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@DataElasticsearchTest` 启用的自动配置设置列表。

**java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.elasticsearch.DataElasticsearchTest;

@DataElasticsearchTest
class MyDataElasticsearchTests {

    @Autowired
    private SomeRepository repository;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.elasticsearch.DataElasticsearchTest

@DataElasticsearchTest
class MyDataElasticsearchTests(@Autowired val repository: SomeRepository) {

    // ...

}
```

#### 8.3.21 自动配置的数据 JPA 测试

您可以使用 `@DataJpaTest` 注解来测试 `JPA` 应用程序。 默认情况下，它会扫描 `@Entity` 类并配置 `Spring Data JPA` 存储库。 如果嵌入式数据库在类路径上可用，它也会配置一个。 默认情况下，通过将 spring.jpa.show-sql 属性设置为 `true` 来记录 SQL 查询。 这可以使用注解的 `showSql` 属性禁用。 使用`@DataJpaTest` 注释时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@DataJpaTest` 启用的自动配置设置列表。

默认情况下，数据 `JPA` 测试是事务性的，并在每次测试结束时回滚。 有关更多详细信息，请参阅 `Spring Framework` 参考文档中的 [相关部分](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#testcontext-tx-enabling-transactions)。 如果这不是您想要的，您可以为测试或整个班级禁用事务管理，如下所示：

**Java**

```java
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyNonTransactionalTests {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@DataJpaTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyNonTransactionalTests {

    // ...

}
```

数据 `JPA` 测试还可以注入一个 [`TestEntityManager`](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-test-autoconfigure/src/main/java/org/springframework/boot/test/autoconfigure/orm/jpa/TestEntityManager.java) bean，它提供了一种替代标准 `JPA EntityManager` 的方法，该方法专门为测试而设计。

> `TestEntityManager` 也可以通过添加 `@AutoConfigureTestEntityManager` 自动配置到任何基于 `Spring` 的测试类。 这样做时，请确保您的测试在事务中运行，例如通过在您的测试类或方法上添加 `@Transactional`。

如果需要，也可以使用 `JdbcTemplate`。 以下示例显示了正在使用的 `@DataJpaTest` 注解：

**java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MyRepositoryTests {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository repository;

    @Test
    void testExample() {
        this.entityManager.persist(new User("sboot", "1234"));
        User user = this.repository.findByUsername("sboot");
        assertThat(user.getUsername()).isEqualTo("sboot");
        assertThat(user.getEmployeeNumber()).isEqualTo("1234");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager

@DataJpaTest
class MyRepositoryTests(@Autowired val entityManager: TestEntityManager, @Autowired val repository: UserRepository) {

    @Test
    fun testExample() {
        entityManager.persist(User("sboot", "1234"))
        val user = repository.findByUsername("sboot")
        assertThat(user?.username).isEqualTo("sboot")
        assertThat(user?.employeeNumber).isEqualTo("1234")
    }

}
```

内存嵌入式数据库通常适用于测试，因为它们速度快且不需要任何安装。 但是，如果您更喜欢针对真实数据库运行测试，则可以使用 `@AutoConfigureTestDatabase` 注释，如以下示例所示：

**Java**

```java
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class MyRepositoryTests {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MyRepositoryTests {

    // ...

}
```



#### 8.3.22 自动配置的 JDBC 测试

`@JdbcTest` 与`@DataJpaTest` 类似，但适用于只需要数据源且不使用 `Spring Data JDBC` 的测试。 默认情况下，它配置内存中的嵌入式数据库和 `JdbcTemplate`。 使用`@JdbcTest` 注释时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> @JdbcTest 启用的自动配置列表可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到。

默认情况下，`JDBC` 测试是事务性的，并在每次测试结束时回滚。 有关更多详细信息，请参阅 `Spring Framework` 参考文档中的 [相关部分](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#testcontext-tx-enabling-transactions)。 如果这不是您想要的，您可以为测试或整个 class 禁用事务管理，如下所示：

**Java**

```java
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@JdbcTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyTransactionalTests {

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@JdbcTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyTransactionalTests
```

如果您希望测试针对真实数据库运行，则可以使用与 `DataJpaTest` 相同的方式使用 `@AutoConfigureTestDatabase` 注解。 （请参阅 [“自动配置的数据 JPA 测试”](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-spring-data-jpa) 。）



#### 8.3.23 自动配置的数据 JDBC 测试

`@DataJdbcTest` 与@JdbcTest 类似，但用于使用 `Spring Data JDBC` 存储库的测试。 默认情况下，它配置内存中嵌入式数据库、`JdbcTemplate` 和 `Spring Data JDBC` 存储库。 当使用 `@DataJdbcTest` 注释时，只扫描 `AbstractJdbcConfiguration` 子类，不扫描常规的 `@Component` 和 `@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到 @DataJdbcTest 启用的自动配置列表。

默认情况下，数据 `JDBC` 测试是事务性的，并在每次测试结束时回滚。 有关更多详细信息，请参阅 `Spring Framework` 参考文档中的 [相关部分](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#testcontext-tx-enabling-transactions) 。 如果这不是您想要的，您可以为测试或整个测试类禁用事务管理，如 [JDBC 示例](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-jdbc) 所示。

如果您希望测试针对真实数据库运行，则可以使用与 `DataJpaTest` 相同的方式使用 `@AutoConfigureTestDatabase` 注释。 （请参阅 [“自动配置的数据 JPA 测试”](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-spring-data-jpa) 。）



#### 8.3.24 自动配置的 jOOQ 测试

您可以以与 `@JdbcTest` 类似的方式使用 `@JooqTest`，但用于与 `jOOQ` 相关的测试。 由于 `jOOQ` 严重依赖与数据库模式相对应的基于 `Java` 的模式，因此使用现有的 `DataSource`。 如果你想用内存数据库替换它，你可以使用`@AutoConfigureTestDatabase` 来覆盖这些设置。 （有关将 `jOOQ` 与 `Spring Boot` 一起使用的更多信息，请参阅“data.html”。）使用 `@JooqTest` 注解时，不会扫描常规的 `@Component` 和 `@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> `@JooqTest` 启用的自动配置列表可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到。

`@JooqTest` 配置一个 `DSLContext`。 以下示例显示了正在使用的 @JooqTest 注解：

**Java**

```java
import org.jooq.DSLContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jooq.JooqTest;

@JooqTest
class MyJooqTests {

    @Autowired
    private DSLContext dslContext;

    // ...

}
```

**kotlin**

```kotlin
import org.jooq.DSLContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jooq.JooqTest

@JooqTest
class MyJooqTests(@Autowired val dslContext: DSLContext) {

    // ...

}
```

`JOOQ` 测试是事务性的，默认情况下在每个测试结束时回滚。 如果这不是您想要的，您可以为测试或整个测试类禁用事务管理，如 [JDBC 示例](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.autoconfigured-jdbc) 所示。

#### 8.3.25 自动配置的数据 MongoDB 测试

您可以使用`@DataMongoTest` 来测试 `MongoDB` 应用程序。 默认情况下，它配置一个 `MongoTemplate`，扫描 `@Document` 类，并配置 `Spring Data MongoDB` 存储库。 使用`@DataMongoTest` 注解时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 `MongoDB` 与 `Spring Boot` 结合使用的更多信息，请参阅 [“data.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.mongodb) 。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到 `@DataMongoTest` 启用的自动配置设置列表。

以下类显示了正在使用的 `@DataMongoTest` 注解：

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.data.mongodb.core.MongoTemplate;

@DataMongoTest
class MyDataMongoDbTests {

    @Autowired
    private MongoTemplate mongoTemplate;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest
import org.springframework.data.mongodb.core.MongoTemplate

@DataMongoTest
class MyDataMongoDbTests(@Autowired val mongoTemplate: MongoTemplate) {

    // ...

}
```



#### 8.3.26 自动配置的数据 Neo4j 测试

您可以使用`@DataNeo4jTest` 来测试 `Neo4j` 应用程序。 默认情况下，它会扫描 `@Node` 类，并配置 `Spring Data Neo4j` 存储库。 使用 `@DataNeo4jTest` 注解时，不会扫描常规的 `@Component` 和 `@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 `Neo4J` 与 Spring Boot 结合使用的更多信息，请参阅 [“data.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.neo4j) 。）

> `@DataNeo4jTest` 启用的自动配置设置列表可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到。

以下示例显示了在 Spring Boot 中使用 `Neo4J` 测试的典型设置：

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.neo4j.DataNeo4jTest;

@DataNeo4jTest
class MyDataNeo4jTests {

    @Autowired
    private SomeRepository repository;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.neo4j.DataNeo4jTest

@DataNeo4jTest
class MyDataNeo4jTests(@Autowired val repository: SomeRepository) {

    // ...

}
```

默认情况下，`Data Neo4j` 测试是事务性的，并在每次测试结束时回滚。 有关更多详细信息，请参阅 `Spring Framework` 参考文档中的 [相关部分](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/testing.html#testcontext-tx-enabling-transactions) 。 如果这不是您想要的，您可以为测试或整个班级禁用事务管理，如下所示：

**Java**

```java
import org.springframework.boot.test.autoconfigure.data.neo4j.DataNeo4jTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@DataNeo4jTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyDataNeo4jTests {

}
```

**Kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.data.neo4j.DataNeo4jTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@DataNeo4jTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyDataNeo4jTests
```

> 响应式访问不支持事务测试。 如果您使用此模式，则必须如上所述配置 `@DataNeo4jTest` 测试。

#### 8.3.27 自动配置的数据 Redis 测试

您可以使用`@DataRedisTest` 来测试 `Redis` 应用程序。 默认情况下，它会扫描 `@RedisHash` 类并配置 `Spring Data Redis` 存储库。 使用`@DataRedisTest` 注解时，不会扫描常规的 `@Component` 和 `@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 `Redis` 与 Spring Boot 结合使用的更多信息，请参阅 [“data.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.redis) 。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@DataRedisTest` 启用的自动配置设置列表。

以下示例显示了正在使用的 `@DataRedisTest` 注解：

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.redis.DataRedisTest;

@DataRedisTest
class MyDataRedisTests {

    @Autowired
    private SomeRepository repository;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.redis.DataRedisTest

@DataRedisTest
class MyDataRedisTests(@Autowired val repository: SomeRepository) {

    // ...

}
```

#### 8.3.28 自动配置的数据 LDAP 测试

您可以使用`@DataLdapTest` 来测试 `LDAP` 应用程序。 默认情况下，它会配置内存中的嵌入式 `LDAP`（如果可用）、配置 `LdapTemplate`、扫描 `@Entry` 类并配置 `Spring Data LDAP` 存储库。 使用`@DataLdapTest` 注解时，不会扫描常规的`@Component` 和`@ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。 （有关将 LDAP 与 Spring Boot 结合使用的更多信息，请参阅 [“data.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.ldap)。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@DataLdapTest` 启用的自动配置设置列表。

以下示例显示了正在使用的 @DataLdapTest 注解：

**Java**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.ldap.DataLdapTest;
import org.springframework.ldap.core.LdapTemplate;

@DataLdapTest
class MyDataLdapTests {

    @Autowired
    private LdapTemplate ldapTemplate;

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.ldap.DataLdapTest
import org.springframework.ldap.core.LdapTemplate

@DataLdapTest
class MyDataLdapTests(@Autowired val ldapTemplate: LdapTemplate) {

    // ...

}
```

内存中嵌入式 `LDAP` 通常适用于测试，因为它速度快且不需要任何开发人员安装。 但是，如果您更喜欢针对真实 `LDAP` 服务器运行测试，则应排除嵌入式 `LDAP` 自动配置，如以下示例所示：

**Java**

```java
import org.springframework.boot.autoconfigure.ldap.embedded.EmbeddedLdapAutoConfiguration;
import org.springframework.boot.test.autoconfigure.data.ldap.DataLdapTest;

@DataLdapTest(excludeAutoConfiguration = EmbeddedLdapAutoConfiguration.class)
class MyDataLdapTests {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.ldap.embedded.EmbeddedLdapAutoConfiguration
import org.springframework.boot.test.autoconfigure.data.ldap.DataLdapTest

@DataLdapTest(excludeAutoConfiguration = [EmbeddedLdapAutoConfiguration::class])
class MyDataLdapTests {

    // ...

}
```

#### 8.2.29 自动配置的 REST 客户端

您可以使用 `@RestClientTest` 注释来测试 `REST` 客户端。 默认情况下，它会自动配置 `Jackson`、`GSON` 和 `Jsonb` 支持，配置 `RestTemplateBuilder`，并添加对 `MockRestServiceServer` 的支持。 使用`@RestClientTest` 注释时，不会扫描常规的`@Component` 和@`ConfigurationProperties` bean。 `@EnableConfigurationProperties` 可用于包含 `@ConfigurationProperties` bean。

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@RestClientTest` 启用的自动配置设置列表。

您要测试的特定 bean 应使用 `@RestClientTest` 的值或组件属性指定，如以下示例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(RemoteVehicleDetailsService.class)
class MyRestClientTests {

    @Autowired
    private RemoteVehicleDetailsService service;

    @Autowired
    private MockRestServiceServer server;

    @Test
    void getVehicleDetailsWhenResultIsSuccessShouldReturnDetails() {
        this.server.expect(requestTo("/greet/details")).andRespond(withSuccess("hello", MediaType.TEXT_PLAIN));
        String greeting = this.service.callRestService();
        assertThat(greeting).isEqualTo("hello");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest
import org.springframework.http.MediaType
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers
import org.springframework.test.web.client.response.MockRestResponseCreators

@RestClientTest(RemoteVehicleDetailsService::class)
class MyRestClientTests(
    @Autowired val service: RemoteVehicleDetailsService,
    @Autowired val server: MockRestServiceServer) {

    @Test
    fun getVehicleDetailsWhenResultIsSuccessShouldReturnDetails(): Unit {
        server.expect(MockRestRequestMatchers.requestTo("/greet/details"))
            .andRespond(MockRestResponseCreators.withSuccess("hello", MediaType.TEXT_PLAIN))
        val greeting = service.callRestService()
        assertThat(greeting).isEqualTo("hello")
    }

}
```

#### 8.2.30 自动配置的 Spring REST 文档测试

您可以使用 `@AutoConfigureRestDocs` 批注在使用 `Mock MVC`、`REST Assured` 或 `WebTestClient` 的测试中使用 `Spring REST Docs`。 它消除了 `Spring REST Docs` 中对 `JUnit` 扩展的需求。

`@AutoConfigureRestDocs` 可用于覆盖默认输出目录（如果使用 `Maven`，则为 `target/generated-snippets`；如果使用 `Gradle`，则为 `build/generated-snippets`）。 它还可用于配置出现在任何记录的 `URI` 中的主机、方案和端口。

##### 使用 Mock MVC 自动配置的 Spring REST Docs 测试

`@AutoConfigureRestDocs` 自定义 `MockMvc` bean 以在测试基于 `servlet` 的 Web 应用程序时使用 `Spring REST Docs`。 您可以使用 `@Autowired` 注入它，并像通常使用 `Mock MVC` 和 `Spring REST Docs` 时一样在测试中使用它，如以下示例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureRestDocs
class MyUserDocumentationTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void listUsers() throws Exception {
        this.mvc.perform(get("/users").accept(MediaType.TEXT_PLAIN))
            .andExpect(status().isOk())
            .andDo(document("list-users"));
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@WebMvcTest(UserController::class)
@AutoConfigureRestDocs
class MyUserDocumentationTests(@Autowired val mvc: MockMvc) {

    @Test
    fun listUsers() {
        mvc.perform(MockMvcRequestBuilders.get("/users").accept(MediaType.TEXT_PLAIN))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document("list-users"))
    }

}
```

如果您需要比 `@AutoConfigureRestDocs` 的属性提供的更多的 `Spring REST Docs` 配置控制，您可以使用 `RestDocsMockMvcConfigurationCustomizer` bean，如以下示例所示：

**Java**

```java
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsMockMvcConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer;
import org.springframework.restdocs.templates.TemplateFormats;

@TestConfiguration(proxyBeanMethods = false)
public class MyRestDocsConfiguration implements RestDocsMockMvcConfigurationCustomizer {

    @Override
    public void customize(MockMvcRestDocumentationConfigurer configurer) {
        configurer.snippets().withTemplateFormat(TemplateFormats.markdown());
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsMockMvcConfigurationCustomizer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer
import org.springframework.restdocs.templates.TemplateFormats

@TestConfiguration(proxyBeanMethods = false)
class MyRestDocsConfiguration : RestDocsMockMvcConfigurationCustomizer {

    override fun customize(configurer: MockMvcRestDocumentationConfigurer) {
        configurer.snippets().withTemplateFormat(TemplateFormats.markdown())
    }

}
```

如果您想使用 `Spring REST Docs` 对参数化输出目录的支持，您可以创建一个 `RestDocumentationResultHandler` bean。 自动配置调用 `alwaysDo` 使用此结果处理程序，从而导致每个 `MockMvc` 调用自动生成默认片段。 以下示例显示了正在定义的 `RestDocumentationResultHandler`：

**Java**

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation;
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler;

@TestConfiguration(proxyBeanMethods = false)
public class MyResultHandlerConfiguration {

    @Bean
    public RestDocumentationResultHandler restDocumentation() {
        return MockMvcRestDocumentation.document("{method-name}");
    }

}
```

**Kotlin**

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler

@TestConfiguration(proxyBeanMethods = false)
class MyResultHandlerConfiguration {

    @Bean
    fun restDocumentation(): RestDocumentationResultHandler {
        return MockMvcRestDocumentation.document("{method-name}")
    }

}
```

##### 使用 WebTestClient 自动配置的 Spring REST Docs 测试

`@AutoConfigureRestDocs` 也可以在测试反应式 Web 应用程序时与 `WebTestClient` 一起使用。 您可以使用 `@Autowired` 注入它，并像通常使用 `@WebFluxTest` 和 `Spring REST Docs` 时一样在测试中使用它，如以下示例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.document;

@WebFluxTest
@AutoConfigureRestDocs
class MyUsersDocumentationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void listUsers() {
        this.webTestClient
            .get().uri("/")
        .exchange()
        .expectStatus()
            .isOk()
        .expectBody()
            .consumeWith(document("list-users"));
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation
import org.springframework.test.web.reactive.server.WebTestClient

@WebFluxTest
@AutoConfigureRestDocs
class MyUsersDocumentationTests(@Autowired val webTestClient: WebTestClient) {

    @Test
    fun listUsers() {
        webTestClient
            .get().uri("/")
            .exchange()
            .expectStatus()
            .isOk
            .expectBody()
            .consumeWith(WebTestClientRestDocumentation.document("list-users"))
    }

}
```

如果您需要比 `@AutoConfigureRestDocs` 的属性提供的更多的 `Spring REST Docs` 配置控制，您可以使用 `RestDocsWebTestClientConfigurationCustomizer` bean，如以下示例所示：

Java

```java
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsWebTestClientConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentationConfigurer;

@TestConfiguration(proxyBeanMethods = false)
public class MyRestDocsConfiguration implements RestDocsWebTestClientConfigurationCustomizer {

    @Override
    public void customize(WebTestClientRestDocumentationConfigurer configurer) {
        configurer.snippets().withEncoding("UTF-8");
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsWebTestClientConfigurationCustomizer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentationConfigurer

@TestConfiguration(proxyBeanMethods = false)
class MyRestDocsConfiguration : RestDocsWebTestClientConfigurationCustomizer {

    override fun customize(configurer: WebTestClientRestDocumentationConfigurer) {
        configurer.snippets().withEncoding("UTF-8")
    }

}
```

如果要使用 `Spring REST Docs` 对参数化输出目录的支持，可以使用 `WebTestClientBuilderCustomizer` 为每个实体交换结果配置消费者。 以下示例显示了正在定义的此类 `WebTestClientBuilderCustomizer`：

**Java**

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.reactive.server.WebTestClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;

import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.document;

@TestConfiguration(proxyBeanMethods = false)
public class MyWebTestClientBuilderCustomizerConfiguration {

    @Bean
    public WebTestClientBuilderCustomizer restDocumentation() {
        return (builder) -> builder.entityExchangeResultConsumer(document("{method-name}"));
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.web.reactive.server.WebTestClientBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation
import org.springframework.test.web.reactive.server.WebTestClient

@TestConfiguration(proxyBeanMethods = false)
class MyWebTestClientBuilderCustomizerConfiguration {

    @Bean
    fun restDocumentation(): WebTestClientBuilderCustomizer {
        return WebTestClientBuilderCustomizer { builder: WebTestClient.Builder ->
            builder.entityExchangeResultConsumer(
                WebTestClientRestDocumentation.document("{method-name}")
            )
        }
    }

}
```

##### 使用 REST Assured 自动配置的 Spring REST Docs 测试

`@AutoConfigureRestDocs` 制作一个 `RequestSpecification` bean，预配置为使用 `Spring REST Docs`，可用于您的测试。 您可以使用 `@Autowired` 注入它，并像通常使用 `REST Assured` 和 `Spring REST Docs` 时那样在测试中使用它，如以下示例所示：

**Java**

```java
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.springframework.restdocs.restassured.RestAssuredRestDocumentation.document;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestDocs
class MyUserDocumentationTests {

    @Test
    void listUsers(@Autowired RequestSpecification documentationSpec, @LocalServerPort int port) {
        given(documentationSpec)
            .filter(document("list-users"))
        .when()
            .port(port)
            .get("/")
        .then().assertThat()
            .statusCode(is(200));
    }

}
```

**kotlin**

```kotlin
import io.restassured.RestAssured
import io.restassured.specification.RequestSpecification
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.restdocs.restassured.RestAssuredRestDocumentation

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestDocs
class MyUserDocumentationTests {

    @Test
    fun listUsers(@Autowired documentationSpec: RequestSpecification?, @LocalServerPort port: Int) {
        RestAssured.given(documentationSpec)
            .filter(RestAssuredRestDocumentation.document("list-users"))
            .`when`()
            .port(port)["/"]
            .then().assertThat()
            .statusCode(Matchers.`is`(200))
    }
 
}
```

如果您需要比 `@AutoConfigureRestDocs` 的属性提供的对 Spring REST Docs 配置的更多控制，则可以使用 `RestDocsRestAssuredConfigurationCustomizer` bean，如以下示例所示：

**java**

```java
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsRestAssuredConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.restdocs.restassured.RestAssuredRestDocumentationConfigurer;
import org.springframework.restdocs.templates.TemplateFormats;

@TestConfiguration(proxyBeanMethods = false)
public class MyRestDocsConfiguration implements RestDocsRestAssuredConfigurationCustomizer {

    @Override
    public void customize(RestAssuredRestDocumentationConfigurer configurer) {
        configurer.snippets().withTemplateFormat(TemplateFormats.markdown());
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.autoconfigure.restdocs.RestDocsRestAssuredConfigurationCustomizer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.restdocs.restassured.RestAssuredRestDocumentationConfigurer
import org.springframework.restdocs.templates.TemplateFormats

@TestConfiguration(proxyBeanMethods = false)
class MyRestDocsConfiguration : RestDocsRestAssuredConfigurationCustomizer {

    override fun customize(configurer: RestAssuredRestDocumentationConfigurer) {
        configurer.snippets().withTemplateFormat(TemplateFormats.markdown())
    }

}
```

#### 8.2.31 自动配置的 Spring Web 服务测试

##### 自动配置的 Spring Web 服务客户端测试

您可以使用`@WebServiceClientTest` 来测试使用 `Spring Web` 服务项目调用 Web 服务的应用程序。 默认情况下，它配置一个模拟 `WebServiceServer` bean 并自动自定义您的 `WebServiceTemplateBuilder`。 （有关将 Web 服务与 Spring Boot 结合使用的更多信息，请参阅 [“io.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.webservices) 。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@WebServiceClientTest` 启用的自动配置设置列表。

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.webservices.client.WebServiceClientTest;
import org.springframework.ws.test.client.MockWebServiceServer;
import org.springframework.xml.transform.StringSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.ws.test.client.RequestMatchers.payload;
import static org.springframework.ws.test.client.ResponseCreators.withPayload;

@WebServiceClientTest(SomeWebService.class)
class MyWebServiceClientTests {

    @Autowired
    private MockWebServiceServer server;

    @Autowired
    private SomeWebService someWebService;

    @Test
    void mockServerCall() {
        this.server
            .expect(payload(new StringSource("<request/>")))
            .andRespond(withPayload(new StringSource("<response><status>200</status></response>")));
        assertThat(this.someWebService.test())
            .extracting(Response::getStatus)
            .isEqualTo(200);
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.webservices.client.WebServiceClientTest
import org.springframework.ws.test.client.MockWebServiceServer
import org.springframework.ws.test.client.RequestMatchers
import org.springframework.ws.test.client.ResponseCreators
import org.springframework.xml.transform.StringSource

@WebServiceClientTest(SomeWebService::class)
class MyWebServiceClientTests(@Autowired val server: MockWebServiceServer, @Autowired val someWebService: SomeWebService) {

    @Test
    fun mockServerCall() {
        server
            .expect(RequestMatchers.payload(StringSource("<request/>")))
            .andRespond(ResponseCreators.withPayload(StringSource("<response><status>200</status></response>")))
        assertThat(this.someWebService.test()).extracting(Response::status).isEqualTo(200)
    }

}
```

#### 自动配置的 Spring Web 服务服务器测试

您可以使用`@WebServiceServerTest` 来测试使用 `Spring Web` 服务项目实现 Web 服务的应用程序。 默认情况下，它配置一个可用于调用 Web 服务端点的 `MockWebServiceClient` bean。 （有关将 Web 服务与 Spring Boot 结合使用的更多信息，请参阅 [“io.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.webservices) 。）

> 可以在 [附录](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) 中找到由 `@WebServiceServerTest` 启用的自动配置设置列表。

以下示例显示了正在使用的 `@WebServiceServerTest` 注解：

**Java**

```
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.webservices.server.WebServiceServerTest;
import org.springframework.ws.test.server.MockWebServiceClient;
import org.springframework.ws.test.server.RequestCreators;
import org.springframework.ws.test.server.ResponseMatchers;
import org.springframework.xml.transform.StringSource;

@WebServiceServerTest(ExampleEndpoint.class)
class MyWebServiceServerTests {

    @Autowired
    private MockWebServiceClient client;

    @Test
    void mockServerCall() {
        this.client
            .sendRequest(RequestCreators.withPayload(new StringSource("<ExampleRequest/>")))
            .andExpect(ResponseMatchers.payload(new StringSource("<ExampleResponse>42</ExampleResponse>")));
    }

}
```

**kotlin**

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.webservices.server.WebServiceServerTest
import org.springframework.ws.test.server.MockWebServiceClient
import org.springframework.ws.test.server.RequestCreators
import org.springframework.ws.test.server.ResponseMatchers
import org.springframework.xml.transform.StringSource

@WebServiceServerTest(ExampleEndpoint::class)
class MyWebServiceServerTests(@Autowired val client: MockWebServiceClient) {

    @Test
    fun mockServerCall() {
        client
            .sendRequest(RequestCreators.withPayload(StringSource("<ExampleRequest/>")))
            .andExpect(ResponseMatchers.payload(StringSource("<ExampleResponse>42</ExampleResponse>")))
    }

}
```



#### 8.2.32 额外的自动配置和切片

每个切片提供一个或多个 `@AutoConfigure…` 注解，即定义应作为切片的一部分包含的自动配置。 通过创建自定义`@AutoConfigure…` 注解或通过将`@ImportAutoConfiguration` 添加到测试中，可以在逐个测试的基础上添加额外的自动配置，如以下示例所示：

**Java**

```java
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;

@JdbcTest
@ImportAutoConfiguration(IntegrationAutoConfiguration.class)
class MyJdbcTests {

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.ImportAutoConfiguration
import org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest

@JdbcTest
@ImportAutoConfiguration(IntegrationAutoConfiguration::class)
class MyJdbcTests
```

> 确保不使用常规的 `@Import` 注释来导入自动配置，因为它们由 `Spring Boot` 以特定方式处理。

或者，可以通过在存储在 META-INF/spring 中的文件中注册它们来为切片注释的任何使用添加额外的自动配置，如以下示例所示：

*META-INF/spring/org.springframework.boot.test.autoconfigure.jdbc.JdbcTest.imports*

```
com.example.IntegrationAutoConfiguration
```

在此示例中，`com.example.IntegrationAutoConfiguration` 在每个使用 `@JdbcTest` 注释的测试上启用。

> 您可以在此文件中使用带# 的注释。

> 切片或 `@AutoConfigure…` 注解可以通过这种方式定制，只要它使用 `@ImportAutoConfiguration` 进行元注解。



#### 8.2.33 用户配置和切片

如果您以合理的方式构建代码，则默认情况下您的`@SpringBootApplication` 类将用作测试的配置。

然后，重要的是不要在应用程序的主类中乱扔特定于其功能特定区域的配置设置。

假设您正在使用 `Spring Batch` 并且您依赖于它的自动配置。 您可以按如下方式定义您的 `@SpringBootApplication`：

**Java**

```java
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableBatchProcessing
public class MyApplication {

    // ...

}
```

**Kotlin**

```kotlin
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
@EnableBatchProcessing
class MyApplication {

    // ...

}
```

因为这个类是测试的源配置，所以任何切片测试实际上都会尝试启动 `Spring Batch`，这绝对不是你想要做的。 推荐的方法是将该特定于区域的配置移动到与您的应用程序处于同一级别的单独的 `@Configuration` 类，如以下示例所示：

**Java**

```java
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableBatchProcessing
public class MyBatchConfiguration {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
@EnableBatchProcessing
class MyBatchConfiguration {

    // ...

}
```

> 根据您的应用程序的复杂性，您可以为您的自定义设置一个 `@Configuration` 类，也可以为每个域区域一个类。 后一种方法允许您在其中一个测试中启用它，如有必要，使用 `@Import` 注解。 有关何时可能希望为切片测试启用特定 `@Configuration` 类的更多详细信息，请 [参阅此操作方法部分](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.testing.slice-tests) 。

测试切片从扫描中排除 `@Configuration` 类。 例如，对于`@WebMvcTest`，以下配置不会在测试切片加载的应用程序上下文中包含给定的 `WebMvcConfigurer` bean：

**java**

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
public class MyWebConfiguration {

    @Bean
    public WebMvcConfigurer testConfigurer() {
        return new WebMvcConfigurer() {
            // ...
        };
    }

}
```

**kotlin**

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration(proxyBeanMethods = false)
class MyWebConfiguration {

    @Bean
    fun testConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            // ...
        }
    }

}
```

但是，下面的配置将导致自定义 `WebMvcConfigurer` 被测试切片加载。

**Java**

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
public class MyWebMvcConfigurer implements WebMvcConfigurer {

    // ...

}	
```

**Kotlin**

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class MyWebMvcConfigurer : WebMvcConfigurer {

    // ...

}
```

另一个混淆来源是类路径扫描。 假设，当您以合理的方式构建代码时，您需要扫描一个额外的包。 您的应用程序可能类似于以下代码：

**Java**

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({ "com.example.app", "com.example.another" })
public class MyApplication {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.ComponentScan

@SpringBootApplication
@ComponentScan("com.example.app", "com.example.another")
class MyApplication {

    // ...

}
```

这样做会有效地覆盖默认组件扫描指令，并产生扫描这两个包的副作用，而不管您选择的切片如何。 例如，`@DataJpaTest` 似乎突然扫描应用程序的组件和用户配置。 同样，将自定义指令移至单独的类是解决此问题的好方法。

> 如果这不适合您，您可以在测试层次结构中的某处创建一个 `@SpringBootConfiguration` 以便使用它。 或者，您可以为您的测试指定一个源，这会禁用查找默认源的行为。

#### 8.2.34 使用 Spock 测试 Spring Boot 应用程序

`Spock 2.2` 或更高版本可用于测试 `Spring Boot` 应用程序。 为此，请将对 `Spock` 的 spock-spring 模块的 `-groovy-4.0` 版本的依赖项添加到应用程序的构建中。 `spock-spring` 将 `Spring` 的测试框架集成到 `Spock` 中。 有关详细信息，请[参阅 Spock 的 Spring 模块的文档](https://spockframework.org/spock/docs/2.2-M1/modules.html#_spring_module)。

### 8.4 测试实用程序

一些在测试您的应用程序时通常有用的测试实用程序类被打包为 spring-boot 的一部分。

#### 8.4.1 ConfigDataApplicationContextInitializer

`ConfigDataApplicationContextInitializer` 是一个 `ApplicationContextInitializer`，您可以将其应用于测试以加载 Spring Boot `application.properties` 文件。 当您不需要@SpringBootTest 提供的全套功能时，您可以使用它，如以下示例所示：

Java

```java
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(classes = Config.class, initializers = ConfigDataApplicationContextInitializer.class)
class MyConfigFileTests {

    // ...

}
```

**kotlin**

```kotlin
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer
import org.springframework.test.context.ContextConfiguration

@ContextConfiguration(classes = [Config::class], initializers = [ConfigDataApplicationContextInitializer::class])
class MyConfigFileTests {

    // ...

}
```

> 单独使用 `ConfigDataApplicationContextInitializer` 不支持 `@Value("${... }")` 注入。 它唯一的工作是确保将 `application.properties` 文件加载到 `Spring` 的环境中。 对于 `@Value` 支持，您需要另外配置一个 `PropertySourcesPlaceholderConfigurer` 或使用 `@SpringBootTest`，它会为您自动配置一个。



#### 8.4.2 TestPropertyValues

`TestPropertyValues` 让您可以快速将属性添加到 `ConfigurableEnvironment` 或 `ConfigurableApplicationContext`。 您可以使用 `key=value` 字符串调用它，如下所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class MyEnvironmentTests {

    @Test
    void testPropertySources() {
        MockEnvironment environment = new MockEnvironment();
        TestPropertyValues.of("org=Spring", "name=Boot").applyTo(environment);
        assertThat(environment.getProperty("name")).isEqualTo("Boot");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.mock.env.MockEnvironment

class MyEnvironmentTests {

    @Test
    fun testPropertySources() {
        val environment = MockEnvironment()
        TestPropertyValues.of("org=Spring", "name=Boot").applyTo(environment)
        assertThat(environment.getProperty("name")).isEqualTo("Boot")
    }

}
```

#### 8.4.3 OutputCapture

`OutputCapture` 是一个 `JUnit` 扩展，可用于捕获 `System.out` 和 `System.err` 输出。 要使用它，请添加 `@ExtendWith(OutputCaptureExtension.class)` 并将 `CapturedOutput` 作为参数注入到您的测试类构造函数或测试方法中，如下所示：

**java**

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class MyOutputCaptureTests {

    @Test
    void testName(CapturedOutput output) {
        System.out.println("Hello World!");
        assertThat(output).contains("World");
    }

}
```

**kotlin**

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.system.CapturedOutput
import org.springframework.boot.test.system.OutputCaptureExtension

@ExtendWith(OutputCaptureExtension::class)
class MyOutputCaptureTests {

    @Test
    fun testName(output: CapturedOutput?) {
        println("Hello World!")
        assertThat(output).contains("World")
    }

}
```

#### 8.4.4 TestRestTemplate

`TestRestTemplate` 是 `Spring` 的 `RestTemplate` 的便捷替代品，在集成测试中很有用。 您可以获得普通模板或发送基本 `HTTP` 身份验证（使用用户名和密码）的模板。 在任何一种情况下，模板都是容错的。 这意味着它不会在 `4xx` 和 `5xx` 错误上抛出异常，以测试友好的方式运行。 相反，可以通过返回的 `ResponseEntity` 及其状态代码检测此类错误。

> `Spring Framework 5.0` 提供了一个新的 `WebTestClient`，适用于 [`WebFlux` 集成测试](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.spring-webflux-tests)以及 [`WebFlux` 和 `MVC` 端到端测试](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.with-running-server)。 与 `TestRestTemplate` 不同，它为断言提供了流畅的 `API`。

建议但不强制使用 `Apache` `HTTP` 客户端（`5.1` 版或更高版本）。 如果您的类路径中有它，`TestRestTemplate` 会通过适当配置客户端进行响应。 如果你确实使用 Apache 的 HTTP 客户端，一些额外的测试友好特性被启用：

- 不遵循重定向（因此您可以断言响应位置）。
- `Cookies` 被忽略（因此模板是无状态的）。

`TestRestTemplate` 可以直接在您的集成测试中实例化，如以下示例所示：

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class MyTests {

    private final TestRestTemplate template = new TestRestTemplate();

    @Test
    void testRequest() {
        ResponseEntity<String> headers = this.template.getForEntity("https://myhost.example.com/example", String.class);
        assertThat(headers.getHeaders().getLocation()).hasHost("other.example.com");
    }

}
```

Kotlin

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.TestRestTemplate

class MyTests {

    private val template = TestRestTemplate()

    @Test
    fun testRequest() {
        val headers = template.getForEntity("https://myhost.example.com/example", String::class.java)
        assertThat(headers.headers.location).hasHost("other.example.com")
    }

}
```

或者，如果您将 `@SpringBootTest` 注释与 `WebEnvironment.RANDOM_PORT` 或 `WebEnvironment.DEFINED_PORT` 一起使用，则可以注入完全配置的 `TestRestTemplate` 并开始使用它。 如有必要，可以通过 `RestTemplateBuilder` bean 应用其他自定义。 任何未指定主机和端口的 `URL` 都会自动连接到嵌入式服务器，如以下示例所示：

**Java**

```java
import java.time.Duration;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MySpringBootTests {

    @Autowired
    private TestRestTemplate template;

    @Test
    void testRequest() {
        HttpHeaders headers = this.template.getForEntity("/example", String.class).getHeaders();
        assertThat(headers.getLocation()).hasHost("other.example.com");
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class RestTemplateBuilderConfiguration {

        @Bean
        RestTemplateBuilder restTemplateBuilder() {
            return new RestTemplateBuilder().setConnectTimeout(Duration.ofSeconds(1))
                    .setReadTimeout(Duration.ofSeconds(1));
        }

    }

}
```

## 9. 创建您自己的自动配置

如果您在开发共享库的公司工作，或者如果您在开源或商业库上工作，您可能想要开发自己的自动配置。 自动配置类可以捆绑在外部 jar 中，并且仍然可以由 Spring Boot 获取。 自动配置可以与提供自动配置代码以及您将使用它的典型库的“启动器”相关联。 我们首先介绍构建您自己的自动配置所需了解的内容，然后我们继续介绍创建 [自定义启动器所需的典型步骤](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.custom-starter) 。

### 9.1 了解自动配置的 Bean

实现自动配置的类使用`@AutoConfiguration` 注解。 这个注解本身是用`@Configuration` 进行元注解的，使自动配置成为标准的`@Configuration` 类。 额外的 `@Conditional` 注解用于限制何时应用自动配置。 通常，自动配置类使用`@ConditionalOnClass` 和`@ConditionalOnMissingBean` 注解。 这确保自动配置仅在找到相关类并且您尚未声明自己的`@Configuration` 时应用。

您可以浏览 [spring-boot-autoconfigure](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure) 的源代码以查看 Spring 提供的 `@AutoConfiguration` 类（参见 [META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports) 文件）。

### 9.2 定位自动配置候选者

`Spring Boot` 检查已发布的 jar 中是否存在 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件。 该文件应列出您的配置类，每行一个类名，如以下示例所示：

```shell
com.mycorp.libx.autoconfigure.LibXAutoConfiguration
com.mycorp.libx.autoconfigure.LibXWebAutoConfiguration
```

> 您可以使用 # 字符向导入文件添加注释。

> 必须仅通过在导入文件中命名来加载自动配置。 确保它们是在特定的包空间中定义的，并且它们永远不是组件扫描的目标。 此外，自动配置类不应启用组件扫描来查找其他组件。 应该改用特定的`@Import` 注解。

如果您的配置需要按特定顺序应用，您可以在[`@AutoConfiguration`](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/AutoConfiguration.java) 注释或专用的[`@AutoConfigureBefore`](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/AutoConfigureBefore.java) 和[`@AutoConfigureAfter`](https://github.com/spring-projects/spring-boot/tree/v3.0.2/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/AutoConfigureAfter.java) 注释上使用`before`、`beforeName`、`after` 和`afterName` 属性。 例如，如果您提供特定于 `Web` 的配置，则您的类可能需要在 `WebMvcAutoConfiguration` 之后应用。

如果你想订购某些相互之间不应该有任何直接知识的自动配置，你也可以使用`@AutoConfigureOrder`。 该注释与常规 `@Order` 注释具有相同的语义，但为自动配置类提供了专用顺序。

与标准的 `@Configuration` 类一样，应用自动配置类的顺序只会影响它们的 bean 的定义顺序。 随后创建这些 bean 的顺序不受影响，并由每个 bean 的依赖项和任何 `@DependsOn` 关系确定。

### 9.3 条件注解

您几乎总是希望在自动配置类中包含一个或多个 `@Conditional` 注解。 `@ConditionalOnMissingBean` 注解是一个常见示例，用于允许开发人员在对您的默认设置不满意时覆盖自动配置。

`Spring Boot` 包含许多 `@Conditional` 注解，您可以通过注释 @Configuration 类或单个 `@Bean` 方法在您自己的代码中重用这些注解。 这些注解包括：

- [Class Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.class-conditions)
- [Bean Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.bean-conditions)
- [Property Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.property-conditions)
- [Resource Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.resource-conditions)
- [Web Application Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.web-application-conditions)
- [SpEL Expression Conditions](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations.spel-conditions)

#### 9.4.1 Class Conditions

`@ConditionalOnClass` 和`@ConditionalOnMissingClass` 注解允许根据特定类的存在或不存在来包含`@Configuration` 类。 由于注解元数据是使用 [ASM](https://asm.ow2.io/) 解析的，因此您可以使用 value 属性来引用真实的类，即使该类实际上可能不会出现在正在运行的应用程序类路径中。 如果您更喜欢使用 String 值指定类名，也可以使用 name 属性。

这种机制不适用于 `@Bean` 方法，通常返回类型是条件的目标：在方法的条件应用之前，`JVM` 将加载类和可能处理的方法引用，如果类不存在。

要处理这种情况，可以使用单独的 `@Configuration` 类来隔离这种情况，如以下示例所示：

Java

```java
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@AutoConfiguration
// Some conditions ...
public class MyAutoConfiguration {

    // Auto-configured beans ...

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(SomeService.class)
    public static class SomeServiceConfiguration {

        @Bean
        @ConditionalOnMissingBean
        public SomeService someService() {
            return new SomeService();
        }

    }

}
```

kotlin

```kotlin
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
// Some conditions ...
class MyAutoConfiguration {

    // Auto-configured beans ...
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(SomeService::class)
    class SomeServiceConfiguration {

        @Bean
        @ConditionalOnMissingBean
        fun someService(): SomeService {
            return SomeService()
        }

    }

}
```

> 如果您使用 `@ConditionalOnClass` 或 `@ConditionalOnMissingClass` 作为元注解的一部分来编写您自己的组合注解，则必须使用名称作为在这种情况下不处理的类的引用。

#### 9.3.2 Bean Conditions

`@ConditionalOnBean` 和`@ConditionalOnMissingBean` 注解允许根据特定 bean 的存在或不存在来包含 bean。 您可以使用 value 属性按类型或名称指定 beans 以按名称指定 beans。 search 属性允许您限制在搜索 bean 时应考虑的 `ApplicationContext` 层次结构。

当放置在 `@Bean` 方法上时，目标类型默认为方法的返回类型，如以下示例所示：

**Java**

```java
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class MyAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public SomeService someService() {
        return new SomeService();
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    fun someService(): SomeService {
        return SomeService()
    }

}
```

在前面的示例中，如果 `ApplicationContext` 中还没有包含 `SomeService` 类型的 bean，则将创建 `someService` bean。

> 您需要非常注意添加 bean 定义的顺序，因为这些条件是根据目前已处理的内容进行评估的。 出于这个原因，我们建议仅在自动配置类上使用 `@ConditionalOnBean` 和 `@ConditionalOnMissingBean` 注解（因为这些可以保证在添加任何用户定义的 bean 定义后加载）。

> `@ConditionalOnBean` 和`@ConditionalOnMissingBean` 不会阻止创建`@Configuration` 类。 在类级别使用这些条件与使用注解标记每个包含的 `@Bean` 方法之间的唯一区别是，如果条件不匹配，前者会阻止将 `@Configuration` 类注册为 bean。

> 声明`@Bean` 方法时，在方法的返回类型中提供尽可能多的类型信息。 例如，如果你的 bean 的具体类实现了一个接口，bean 方法的返回类型应该是具体类而不是接口。 在使用 bean 条件时，在 `@Bean` 方法中提供尽可能多的类型信息尤为重要，因为它们的评估只能依赖于方法签名中可用的类型信息。

#### 9.3.3 Property Conditions

`@ConditionalOnProperty` 注解允许基于 `Spring Environment` 属性包含配置。 使用前缀和名称属性指定应检查的属性。 默认情况下，匹配任何存在且不等于 false 的属性。 您还可以使用 `havingValue` 和 `matchIfMissing` 属性创建更高级的检查。

#### 9.3.4 Resource Conditions

`@ConditionalOnResource` 注解允许仅在存在特定资源时包含配置。 可以使用常用的 Spring 约定来指定资源，如以下示例所示：`file:/home/user/test.dat`。

#### 9.3.5 Web Application Conditions

`@ConditionalOnWebApplication` 和`@ConditionalOnNotWebApplication` 注解允许根据应用程序是否为“Web 应用程序”来包含配置。 基于 servlet 的 Web 应用程序是任何使用 `Spring WebApplicationContext`、定义会话范围或具有 `ConfigurableWebEnvironment` 的应用程序。 反应式 Web 应用程序是任何使用 `ReactiveWebApplicationContext` 或具有 `ConfigurableReactiveWebEnvironment` 的应用程序。

`@ConditionalOnWarDeployment` 注解允许根据应用程序是否是部署到容器的传统 WAR 应用程序来包含配置。 此条件与使用嵌入式服务器运行的应用程序不匹配。

#### 9.3.6 SpEL Expression Conditions

`@ConditionalOnExpression` 注解允许根据 [SpEL 表达式](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/core.html#expressions)的结果包含配置。

> 在表达式中引用一个 bean 将导致该 bean 在上下文刷新处理中很早就被初始化。 因此，bean 将不符合后处理（例如配置属性绑定）的条件，并且其状态可能不完整。

### 9.4 测试你的自动配置

自动配置会受到许多因素的影响：用户配置（@Bean 定义和环境定制）、条件评估（特定库的存在）等。 具体来说，每个测试都应该创建一个定义良好的 `ApplicationContext`，它表示这些自定义的组合。 `ApplicationContextRunner` 提供了一种很好的方法来实现这一点。

`ApplicationContextRunner` 通常定义为测试类的一个字段，用于收集基本的通用配置。 以下示例确保始终调用 `MyServiceAutoConfiguration`：

**Java**

```java
private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
        .withConfiguration(AutoConfigurations.of(MyServiceAutoConfiguration.class));
```

**kotlin**

```kotlin
val contextRunner = ApplicationContextRunner()
    .withConfiguration(AutoConfigurations.of(MyServiceAutoConfiguration::class.java))
```

> 如果必须定义多个自动配置，则无需对它们的声明进行排序，因为它们的调用顺序与运行应用程序时的顺序完全相同。

每个测试都可以使用运行器来表示特定的用例。 例如，下面的示例调用用户配置 (`UserConfiguration`) 并检查自动配置是否正确退出。 调用 run 提供了一个可以与 `AssertJ` 一起使用的回调上下文。

**Java**

```java
@Test
void defaultServiceBacksOff() {
    this.contextRunner.withUserConfiguration(UserConfiguration.class).run((context) -> {
        assertThat(context).hasSingleBean(MyService.class);
        assertThat(context).getBean("myCustomService").isSameAs(context.getBean(MyService.class));
    });
}

@Configuration(proxyBeanMethods = false)
static class UserConfiguration {

    @Bean
    MyService myCustomService() {
        return new MyService("mine");
    }

}
```

**kotlin**

```kotlin
@Test
fun defaultServiceBacksOff() {
    contextRunner.withUserConfiguration(UserConfiguration::class.java)
        .run { context: AssertableApplicationContext ->
            assertThat(context).hasSingleBean(MyService::class.java)
            assertThat(context).getBean("myCustomService")
                .isSameAs(context.getBean(MyService::class.java))
        }
}

@Configuration(proxyBeanMethods = false)
internal class UserConfiguration {

    @Bean
    fun myCustomService(): MyService {
        return MyService("mine")
    }

}
```

还可以轻松自定义环境，如以下示例所示：

**Java**

```java
@Test
void serviceNameCanBeConfigured() {
    this.contextRunner.withPropertyValues("user.name=test123").run((context) -> {
        assertThat(context).hasSingleBean(MyService.class);
        assertThat(context.getBean(MyService.class).getName()).isEqualTo("test123");
    });
}
```

**kotlin**

```kotlin
@Test
fun serviceNameCanBeConfigured() {
    contextRunner.withPropertyValues("user.name=test123").run { context: AssertableApplicationContext ->
        assertThat(context).hasSingleBean(MyService::class.java)
        assertThat(context.getBean(MyService::class.java).name).isEqualTo("test123")
    }
}
```

跑步者也可用于显示 `ConditionEvaluationReport`。 可以在 `INFO` 或 `DEBUG` 级别打印报告。 以下示例显示如何使用 `ConditionEvaluationReportLoggingListener` 在自动配置测试中打印报告。

**Java**

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener;
import org.springframework.boot.logging.LogLevel;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class MyConditionEvaluationReportingTests {

    @Test
    void autoConfigTest() {
        new ApplicationContextRunner()
            .withInitializer(ConditionEvaluationReportLoggingListener.forLogLevel(LogLevel.INFO))
            .run((context) -> {
                    // Test something...
            });
    }

}
```

#### 9.4.1 模拟 Web 上下文

如果您需要测试仅在 servlet 或反应式 Web 应用程序上下文中运行的自动配置，请分别使用 WebApplicationContextRunner 或 ReactiveWebApplicationContextRunner。

#### 9.4.2 覆盖类路径

也可以测试当特定类和/或包在运行时不存在时会发生什么。 Spring Boot 附带了一个 `Filtered ClassLoader`，运行者可以轻松使用它。 在下面的示例中，我们断言如果 MyService 不存在，则自动配置被正确禁用：

**java**

```java
@Test
void serviceIsIgnoredIfLibraryIsNotPresent() {
    this.contextRunner.withClassLoader(new FilteredClassLoader(MyService.class))
            .run((context) -> assertThat(context).doesNotHaveBean("myService"));
}
```

**kotlin**

```kotlin
@Test
fun serviceIsIgnoredIfLibraryIsNotPresent() {
    contextRunner.withClassLoader(FilteredClassLoader(MyService::class.java))
        .run { context: AssertableApplicationContext? ->
            assertThat(context).doesNotHaveBean("myService")
        }
}
```

### 9.5 创建你自己的 starter

一个典型的 Spring Boot starter 包含自动配置和定制给定技术基础设施的代码，我们称之为“acme”。 为了使其易于扩展，可以将专用命名空间中的许多配置键暴露给环境。 最后，提供了一个单一的“启动器”依赖项，以帮助用户尽可能轻松地入门。

具体来说，自定义启动器可以包含以下内容：

- 包含“acme”的自动配置代码的自动配置模块。

- 提供对自动配置模块以及“acme”和通常有用的任何其他依赖项的依赖项的启动模块。 简而言之，添加启动器应该提供开始使用该库所需的一切。

两个模块的这种分离是没有必要的。 如果“acme”有多种风格、选项或可选功能，那么最好将自动配置分开，因为您可以清楚地表达某些功能是可选的。 此外，您还可以制作一个 starter 来提供关于这些可选依赖项的意见。 同时，其他人也只能依靠autoconfigure模块，打造自己的starter，各有各的看法。

如果自动配置相对简单并且没有可选功能，那么在启动器中合并这两个模块绝对是一个选择。

#### 9.5.1 命名

你应该确保为你的启动器提供一个合适的命名空间。 不要以 spring-boot 开头你的模块名称，即使你使用不同的 Maven groupId。 我们可能会为您将来自动配置的东西提供官方支持。

根据经验，您应该以启动器命名组合模块。 例如，假设您正在为 “acme” 创建 `starter` ，并将自动配置模块命名为 `acme-spring-boot` 和启动器 `acme-spring-boot-starter`。 如果只有一个模块结合了两者，请将其命名为 `acme-spring-boot-starter`。

#### 9.5.2 配置键

如果您的启动器提供配置密钥，请为它们使用唯一的命名空间。 特别是，不要将您的密钥包含在 Spring Boot 使用的命名空间中（例如服务器、管理、spring 等）。 如果您使用相同的命名空间，我们将来可能会以破坏您的模块的方式修改这些命名空间。 根据经验，在所有键前加上您拥有的名称空间（例如 `acme`）。

确保通过为每个属性添加字段 `javadoc` 来记录配置键，如以下示例所示：

**Java**

```java
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("acme")
public class AcmeProperties {

    /**
     * Whether to check the location of acme resources.
     */
    private boolean checkLocation = true;

    /**
     * Timeout for establishing a connection to the acme server.
     */
    private Duration loginTimeout = Duration.ofSeconds(3);

    public boolean isCheckLocation() {
        return this.checkLocation;
    }

    public void setCheckLocation(boolean checkLocation) {
        this.checkLocation = checkLocation;
    }

    public Duration getLoginTimeout() {
        return this.loginTimeout;
    }

    public void setLoginTimeout(Duration loginTimeout) {
        this.loginTimeout = loginTimeout;
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties("acme")
class AcmeProperties(

    /**
     * Whether to check the location of acme resources.
     */
    var isCheckLocation: Boolean = true,

    /**
     * Timeout for establishing a connection to the acme server.
     */
    var loginTimeout:Duration = Duration.ofSeconds(3))
```

> 您应该只将纯文本与 `@ConfigurationProperties` 字段 `Javadoc` 一起使用，因为它们在添加到 `JSON` 之前不会被处理。

以下是我们在内部遵循的一些规则，以确保描述一致：

- 不要以“The”或“A”开始描述。

- 对于布尔类型，以 `“Whether”` 或 `“Enable”` 开始描述。

-  对于基于集合的类型，以“逗号分隔列表”开始描述

- 使用 `java.time.Duration` 而不是 `long`，如果它与毫秒不同，则描述默认单位，例如“如果未指定持续时间后缀，将使用秒”。

- 不要在描述中提供默认值，除非它必须在运行时确定。

确保触发元数据生成，以便 `IDE` 帮助也可用于您的密钥。 您可能想要查看生成的元数据 (`META-INF/spring-configuration-metadata.json`) 以确保正确记录了您的密钥。 在兼容的 IDE 中使用您自己的启动程序也是验证元数据质量的好主意。

#### 9.5.3 “自动配置” 模块

自动配置模块包含开始使用该库所需的一切。 它还可能包含配置键定义（例如 `@ConfigurationProperties` ）和任何可用于进一步自定义组件初始化方式的回调接口。

> 您应该将库的依赖项标记为可选，以便您可以更轻松地在项目中包含自动配置模块。 如果您这样做，则不会提供该库，并且默认情况下，Spring Boot 会退出。

`Spring Boot` 使用注解处理器收集元数据文件 (`META-INF/spring-autoconfigure-metadata.properties`) 中的自动配置条件。 如果该文件存在，它将用于急切地过滤不匹配的自动配置，这将缩短启动时间。

使用 `Maven` 构建时，建议在包含自动配置的模块中添加以下依赖项：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-autoconfigure-processor</artifactId>
    <optional>true</optional>
</dependency>
```

如果您直接在应用程序中定义了自动配置，请确保配置 `spring-boot-maven-plugin` 以防止重新打包目标将依赖项添加到 fat jar 中：

```xml
<project>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.springframework.boot</groupId>
                            <artifactId>spring-boot-autoconfigure-processor</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

使用 `Gradle`，应该在 `annotationProcessor` 配置中声明依赖项，如以下示例所示：

```shell
dependencies {
    annotationProcessor "org.springframework.boot:spring-boot-autoconfigure-processor"
}
```

#### 9.5.4 Starter 模块

`starter` 实际上是一个空罐子。 它的唯一目的是提供必要的依赖关系以使用该库。 您可以将其视为对开始所需内容的固执己见的看法。

不要对添加了启动器的项目做出假设。 如果您要自动配置的库通常需要其他启动器，请同时提及它们。 如果可选依赖项的数量很多，那么提供一组适当的默认依赖项可能会很困难，因为您应该避免包含库的典型使用所不需要的依赖项。 换句话说，您不应该包含可选的依赖项。

无论哪种方式，您的启动器都必须直接或间接引用核心 `Spring Boot` 启动器（`spring-boot-starter`）（如果您的启动器依赖于另一个启动器，则无需添加它）。 如果项目仅使用您的自定义启动器创建，则 `Spring Boot` 的核心功能将因核心启动器的存在而受到尊重。

## 10 Kotlin 支持

[`Kotlin`](https://kotlinlang.org/) 是一种针对 `JVM`（和其他平台）的静态类型语言，它允许编写简洁优雅的代码，同时提供与用 Java 编写的现有库的 [互操作性](https://kotlinlang.org/docs/reference/java-interop.html) 。

Spring Boot 通过利用 `Spring Framework`、`Spring Data` 和 `Reactor` 等其他 `Spring` 项目中的支持来提供 `Kotlin` 支持。 有关详细信息，请参阅 [Spring Framework Kotlin 支持文档](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/languages.html#kotlin)。

开始使用 `Spring Boot` 和 `Kotlin` 的最简单方法是遵循这个 [综合教程](https://spring.io/guides/tutorials/spring-boot-kotlin/) 。 您可以使用 [`start.spring.io`](https://start.spring.io/#!language=kotlin) 创建新的 `Kotlin` 项目。 如果您需要支持，请随时加入 [Kotlin Slack](https://slack.kotlinlang.org/) 的#spring 频道或在 [Stack Overflow](https://stackoverflow.com/questions/tagged/spring+kotlin) 上使用 spring 和 kotlin 标签提问。

### 10.1 要求

`Spring Boot` 至少需要 `Kotlin 1.7.x`，并通过依赖管理来管理合适的 `Kotlin` 版本。 要使用 Kotlin，`org.jetbrains.kotlin:kotlin-stdlib` 和 `org.jetbrains.kotlin:kotlin-reflect` 必须存在于类路径中。 也可以使用 `kotlin-stdlib` 变体 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8`。

由于 [`Kotlin` 类在默认情况下是最终的](https://discuss.kotlinlang.org/t/classes-final-by-default/166)，您可能希望配置 [`kotlin-spring`](https://kotlinlang.org/docs/reference/compiler-plugins.html#spring-support) 插件以自动打开 `Spring` 注解的类，以便它们可以被代理。

在 `Kotlin` 中序列化/反序列化 JSON 数据需要 [`Jackson` 的 Kotlin 模块](https://github.com/FasterXML/jackson-module-kotlin)。 当在类路径中找到时，它会自动注册。 如果 `Jackson` 和 `Kotlin` 存在但 `Jackson` `Kotlin` 模块不存在，则会记录一条警告消息。

> 如果在 `start.spring.io` 上引导 Kotlin 项目，则默认提供这些依赖项和插件。

### 10.2 Null-safety

Kotlin 的关键特性之一是 [null-safety](https://kotlinlang.org/docs/reference/null-safety.html)。 它在编译时处理空值而不是将问题推迟到运行时并遇到 NullPointerException。 这有助于消除常见的错误来源，而无需支付 Optional 等包装器的成本。 Kotlin 还允许使用具有可为 null 值的函数构造，如本 Kotlin 中的 [空安全综合指南](https://www.baeldung.com/kotlin-null-safety) 中所述。

尽管 Java 不允许在其类型系统中表达空值安全性，但 Spring Framework、Spring Data 和 Reactor 现在通过工具[友好的注释提供了它们的 API 的空值安全性。 默认情况下，Kotlin 中使用的 Java API 中的类型被识别为放宽空值检查的 平台类型](https://kotlinlang.org/docs/reference/java-interop.html#null-safety-and-platform-types) 。 [Kotlin 对 JSR 305 注解的支持](https://kotlinlang.org/docs/reference/java-interop.html#jsr-305-support)与可空性注解相结合，为 Kotlin 中的相关 Spring API 提供了空安全性。

可以通过使用以下选项添加 `-Xjsr305` 编译器标志来配置 `JSR 305` 检查：`-Xjsr305={strict|warn|ignore}`。 默认行为与 `-Xjsr305=warn` 相同。 在从 `Spring API` 推断的 Kotlin 类型中需要使用 strict 值来考虑 `null-safety`，但在使用时应了解 `Spring API` 可空性声明甚至可以在次要版本之间演变，并且将来可能会添加更多检查）。

> 尚不支持通用类型参数、可变参数和数组元素可空性。 有关最新信息，请参阅 [SPR-15942](https://jira.spring.io/browse/SPR-15942)。 还要注意 Spring Boot 自己的 API [还没有注解](https://github.com/spring-projects/spring-boot/issues/10712)。

### 10.3 Kotlin API

#### 10.3.1 运行应用

`Spring Boot` 提供了一种使用 `runApplication<MyApplication>(*args)` 运行应用程序的惯用方式，如以下示例所示：

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}
```

这是 `SpringApplication.run(MyApplication::class.java, *args)` 的直接替代品。 它还允许自定义应用程序，如以下示例所示：

```kotlin
runApplication<MyApplication>(*args) {
    setBannerMode(OFF)
}
```

#### 10.3.2 拓展

`Kotlin` [扩展](https://kotlinlang.org/docs/reference/extensions.html)提供了使用附加功能扩展现有类的能力。 `Spring Boot Kotlin API` 利用这些扩展为现有 API 添加新的 Kotlin 特定便利。

提供了`TestRestTemplate` 扩展，类似于`Spring Framework` 为`Spring Framework` 中的`RestOperations` 提供的扩展。 除其他外，这些扩展使得利用 `Kotlin` 具体化类型参数成为可能。

### 10.4 依赖管理

为了避免在类路径上混合不同版本的 `Kotlin` 依赖项，Spring Boot 导入了 `Kotlin BOM`。

使用 `Maven`，可以通过设置 `kotlin.version` 属性来自定义 `Kotlin` 版本，并为 `kotlin-maven-plugin` 提供插件管理。 使用 `Gradle`，Spring Boot 插件会自动将 `kotlin.version` 与 Kotlin 插件的版本对齐。

Spring Boot 还通过导入 `Kotlin` 协程 BOM 来管理协程依赖项的版本。 可以通过设置 `kotlin-coroutines.version` 属性来自定义版本。

> `org.jetbrains.kotlinx:kotlinx-coroutines-reactor` 依赖项是默认提供的，如果引导一个 `Kotlin` 项目至少有一个对 `start.spring.io` 的反应依赖项。

### 10.5 @ConfigurationProperties

`@ConfigurationProperties` 与 [构造函数绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.constructor-binding) 结合使用时支持具有不可变 val 属性的类，如以下示例所示：

```kotlin
@ConfigurationProperties("example.kotlin")
data class KotlinExampleProperties(
        val name: String,
        val description: String,
        val myService: MyService) {

    data class MyService(
            val apiToken: String,
            val uri: URI
    )
}
```

要使用注解处理器生成您自己的元数据，应该使用 `spring-boot-configuration-processor` 依赖项配置 `kapt`。 请注意，由于 kapt 提供的模型的限制，某些功能（例如检测默认值或已弃用的项目）无法正常工作。

### 10.6 测试

虽然可以使用 JUnit 4 来测试 `Kotlin` 代码，但 `JUnit 5` 是默认提供的，建议使用。 JUnit 5 使测试类能够被实例化一次并重新用于该类的所有测试。 这使得在非静态方法上使用@BeforeAll 和`@AfterAll` 注解成为可能，这非常适合 Kotlin。

要模拟 `Kotlin` 类，建议使用 `MockK`。 如果您需要 `Mockito` 特定的 `@MockBean` 和 `@SpyBean` 注解的 `MockK` 等效项，您可以使用提供类似 `@MockkBean` 和 `@SpykBean` 注解的 `SpringMockK`。

### 10.7 Resources

#### 10.7.1 延伸阅读

- [Kotlin 语言参考](https://kotlinlang.org/docs/reference/)
- [Kotlin Slack](https://kotlinlang.slack.com/) (有专门的#spring 频道)
- [带有 `spring` 和 `kotlin` 标签的 Stack Overflow](https://stackoverflow.com/questions/tagged/spring+kotlin)
- [在浏览器中试用 Kotlin](https://try.kotlinlang.org/)
- [Kotlin blog](https://blog.jetbrains.com/kotlin/)
- [Awesome Kotlin](https://kotlin.link/)
- [教程：使用 Spring Boot 和 Kotlin 构建 Web 应用程序](https://spring.io/guides/tutorials/spring-boot-kotlin/)
- [使用 Kotlin 开发 Spring Boot 应用程序](https://spring.io/blog/2016/02/15/developing-spring-boot-applications-with-kotlin)
- [使用 Kotlin、Spring Boot 和 PostgreSQL 的地理空间信使](https://spring.io/blog/2016/03/20/a-geospatial-messenger-with-kotlin-spring-boot-and-postgresql)
- [在 Spring Framework 5.0 中引入 Kotlin 支持](https://spring.io/blog/2017/01/04/introducing-kotlin-support-in-spring-framework-5-0)
- [Spring Framework 5 Kotlin API，功能方式](https://spring.io/blog/2017/08/01/spring-framework-5-kotlin-apis-the-functional-way)

#### 10.7.2 示例

- [spring-boot-kotlin-demo](https://github.com/sdeleuze/spring-boot-kotlin-demo): 常规 Spring Boot + Spring Data JPA 项目
- [mixit](https://github.com/mixitconf/mixit): Spring Boot 2 + WebFlux + 响应式 Spring Data MongoDB
- [spring-kotlin-fullstack](https://github.com/sdeleuze/spring-kotlin-fullstack): 使用 Kotlin2js 作为前端而不是 JavaScript 或 TypeScript 的 WebFlux Kotlin 全栈示例
- [spring-petclinic-kotlin](https://github.com/spring-petclinic/spring-petclinic-kotlin): Spring PetClinic 示例应用程序的 Kotlin 版本
- [spring-kotlin-deepdive](https://github.com/sdeleuze/spring-kotlin-deepdive): 从 Boot 1.0 + Java 逐步迁移到 Boot 2.0 + Kotlin
- [spring-boot-coroutines-demo](https://github.com/sdeleuze/spring-boot-coroutines-demo): 协程示例项目