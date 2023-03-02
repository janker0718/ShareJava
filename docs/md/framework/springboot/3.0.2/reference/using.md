# 使用 Spring Boot

构建系统、构建代码、配置、SpringBeans和依赖注入、DevTools等等。

本节将详细介绍如何使用 Spring Boot 。它涵盖了构建系统、自动配置以及如何运行应用程序等主题。我们还介绍了一些Spring Boot 最佳实践。虽然 Spring Boot 没有什么特别的地方（它只是您可以使用的另一个库），但有一些建议可以让您的开发过程稍微简单一些。

如果您刚开始使用Spring Boot，那么在进入本节之前，您可能应该阅读《入门指南》。

## 1. 构建系统

强烈建议您选择一个支持[依赖关系管理](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.dependency-management)并且可以使用发布到 “MavenCentral” 存储库的工件的构建系统。我们建议您选择Maven 或 Gradle。可以让 Spring Boot 与其他构建系统（例如Ant）一起工作，但它们不是特别受支持。

### 1.1 依赖管理

Spring Boot 的每一个版本都提供了它支持的依赖项列表。实际上，您不需要在构建配置中为任何这些依赖项提供版本，因为 Spring Boot 为您管理这些依赖项。当您升级 Spring Boot 本身时，这些依赖关系也会以一致的方式升级。

> 如果需要，您仍然可以指定一个版本并覆盖Spring Boot的建议。

精心策划的列表包含您可以与 Spring Boot 一起使用的所有 Spring 模块以及第三方库的详细列表。该列表作为标准的 BOM 表（spring-boot-dependencies）提供，可用于 [Maven](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.maven) 和 [Gradle](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.gradle) 。

> Spring Boot的每个版本都与 Spring Framework 的基础版本相关联。我们强烈建议您不要指定其版本。

### 1.2 Maven

要了解如何将Spring Boot与Maven一起使用，请参阅 Spring Boot 的Maven插件的文档：

- 参考（ [HTML ](https://docs.spring.io/spring-boot/docs/3.0.2/maven-plugin/reference/htmlsingle/)和 [PDF](https://docs.spring.io/spring-boot/docs/3.0.2/maven-plugin/reference/pdf/spring-boot-maven-plugin-reference.pdf) ）
- [API](https://docs.spring.io/spring-boot/docs/3.0.2/maven-plugin/api/)

### 1.3  Gradle

要了解如何将 Spring Boot 与 Gradle 一起使用，请参阅Spring Boot Gradle插件的文档：

- 参考 ([HTML](https://docs.spring.io/spring-boot/docs/3.0.2/gradle-plugin/reference/htmlsingle/) 和 [PDF](https://docs.spring.io/spring-boot/docs/3.0.2/gradle-plugin/reference/pdf/spring-boot-gradle-plugin-reference.pdf))
- [API](https://docs.spring.io/spring-boot/docs/3.0.2/gradle-plugin/api/)

### 1.4 Ant

可以使用 Apache Ant + Ivy 构建一个 Spring Boot 项目。`spring-boot-antlib` “antlib” 模块也可用于帮助 Ant 创建可执行 jar 。

要声明依赖项，典型的 “ivy.xml” 文件类似于以下示例：

```xml
<ivy-module version="2.0">
    <info organisation="org.springframework.boot" module="spring-boot-sample-ant" />
    <configurations>
        <conf name="compile" description="everything needed to compile this module" />
        <conf name="runtime" extends="compile" description="everything needed to run this module" />
    </configurations>
    <dependencies>
        <dependency org="org.springframework.boot" name="spring-boot-starter"
            rev="${spring-boot.version}" conf="compile" />
    </dependencies>
</ivy-module>
```

典型的 “build.xml” 如下所示：

```xml
<project
    xmlns:ivy="antlib:org.apache.ivy.ant"
    xmlns:spring-boot="antlib:org.springframework.boot.ant"
    name="myapp" default="build">

    <property name="spring-boot.version" value="3.0.2" />

    <target name="resolve" description="--> retrieve dependencies with ivy">
        <ivy:retrieve pattern="lib/[conf]/[artifact]-[type]-[revision].[ext]" />
    </target>

    <target name="classpaths" depends="resolve">
        <path id="compile.classpath">
            <fileset dir="lib/compile" includes="*.jar" />
        </path>
    </target>

    <target name="init" depends="classpaths">
        <mkdir dir="build/classes" />
    </target>

    <target name="compile" depends="init" description="compile">
        <javac srcdir="src/main/java" destdir="build/classes" classpathref="compile.classpath" />
    </target>

    <target name="build" depends="compile">
        <spring-boot:exejar destfile="build/myapp.jar" classes="build/classes">
            <spring-boot:lib>
                <fileset dir="lib/runtime" />
            </spring-boot:lib>
        </spring-boot:exejar>
    </target>
</project>
```

> 如果不想使用“spring-boot-antlib”模块，请参阅 [howto.html](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.build.build-an-executable-archive-with-ant-without-using-spring-boot-antlib)  “How to”。

### 1.5 Starters

Starters 是一组方便的依赖描述符，可以包含在应用程序中。您可以一站式拥有所需的所有 Spring 和相关技术，而无需搜索示例代码和复制粘贴依赖描述符。例如，如果您想开始使用 Spring 和 JPA 进行数据库访问，请在项目中包含`spring-boot-starter-data-jpa` 依赖项。



starters 包含许多依赖项，以至于你可以快速启动和运行项目，并且具有一组一致的、受支持的托管传递依赖项。

> 名字里有什么
>
> 所有官方首发球员都遵循类似的命名模式；`spring-boot-starter-*` ，其中 * 是特定类型的应用程序。此命名结构旨在帮助您找到初学者。许多 IDE 中的 Maven 集成允许您按名称搜索依赖项。例如，安装了适当的 Eclipse 或 Spring Tools 插件后，您可以在 POM 编辑器中按 ctrl 空格并键入 “Spring boot starter” 以获取完整列表。
>
>
>
> 正如在“[创建自己的 starters](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.custom-starter)”一节中所解释的，第三方初学者不应该从 spring boot 开始，因为它是为官方的 spring boot 工件保留的。相反，第三方启动器通常以项目名称开头。例如，一个名为  thirdpartyproject 的第三方启动项目通常会被命名为`thirdpartyproject-spring-boot-starter`。

以下应用程序启动器由 Spring Boot 在 org.springframework.boot 组下提供：

| 名称                                          | 描述                                                         |
| :-------------------------------------------- | :----------------------------------------------------------- |
| `spring-boot-starter`                         | 核心 starters ，包括自动配置支持、日志记录和YAML             |
| `spring-boot-starter-amqp`                    | 使用 Spring AMQP 和 Rabbit MQ 的 starter                     |
| `spring-boot-starter-aop`                     | 使用 Spring AOP 和 AspectJ 进行面向切面编程的 starter        |
| `spring-boot-starter-artemis`                 | 使用Apache Artemis 的 JMS 消息传递 starter                   |
| `spring-boot-starter-batch`                   | 使用Spring Batch的 starter                                   |
| `spring-boot-starter-cache`                   | 使用Spring Framework缓存支持的 starter                       |
| `spring-boot-starter-data-cassandra`          | 使用 Cassandra 分布式数据库和 Spring Data Cassandra 的 starter |
| `spring-boot-starter-data-cassandra-reactive` | 使用 Cassandra 分布式数据库和 Spring Data Cassandra Reactive 的 starter |
| `spring-boot-starter-data-couchbase`          | 使用 Couchbase 面向文档的数据库 和 Spring Data Couchbase 的 starter |
| `spring-boot-starter-data-couchbase-reactive` | 使用Couchbase 面向文档的数据库和Spring Data Couchbase Reactive的 starter |
| `spring-boot-starter-data-elasticsearch`      | 使用 Elasticsearch 搜索和分析引擎和 Spring Data Elasticsearch |
| `spring-boot-starter-data-jdbc`               | 使用Spring Data JDBC的 starter                               |
| `spring-boot-starter-data-jpa`                | 用于在 Hibernate 中使用Spring Data JPA的 starter             |
| `spring-boot-starter-data-ldap`               | 使用Spring Data LDAP的 starter                               |
| `spring-boot-starter-data-mongodb`            | 使用 MongoDB 面向文档的数据库和 Spring Data MongoDB          |
| `spring-boot-starter-data-mongodb-reactive`   | 使用 MongoDB 面向文档的数据库和 Spring Data MongoDB Reactive |
| `spring-boot-starter-data-neo4j`              | 使用 Neo4j 图形数据库和 Spring Data Neo4j 的 starter         |
| `spring-boot-starter-data-r2dbc`              | 使用Spring Data R2DBC的 starter                              |
| `spring-boot-starter-data-redis`              | 用于将 Redis 键值数据存储与 Spring data Redis 和 Lettuce 客户端一起使用的 starter |
| `spring-boot-starter-data-redis-reactive`     | 使用 Redis 键值数据存储与 Spring data Redis reactive 和 Lettuce 客户端的 starter |
| `spring-boot-starter-data-rest`               | 使用Spring Data REST 通过REST 暴露 Spring data 仓库的 starter |
| `spring-boot-starter-freemarker`              | 使用 FreeMarker 视图构建 MVC web 应用程序的 starter          |
| `spring-boot-starter-graphql`                 | 使用 Spring GraphQL 构建 GraphQL 应用程序的 starter          |
| `spring-boot-starter-groovy-templates`        | 使用 Groovy 模板视图构建 MVC web 应用程序的 starter          |
| `spring-boot-starter-hateoas`                 | 使用 Spring MVC 和Spring HATEOAS 构建基于超媒体的 RESTful web 应用程序的starters |
| `spring-boot-starter-integration`             | 使用 Spring内置 的 starter                                   |
| `spring-boot-starter-jdbc`                    | 用于在 HikariCP 连接池中使用 JDBC 的 starter                 |
| `spring-boot-starter-jersey`                  | 使用 JAX-RS 和 Jersey 构建 RESTful web 应用程序的 starter。  [`spring-boot-starter-web`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-web) 一种替代方案。 |
| `spring-boot-starter-jooq`                    | 使用 jOOQ 通过 JDBC 访问 SQL 数据库的 starter。. [`spring-boot-starter-data-jpa`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-data-jpa) 或 [`spring-boot-starter-jdbc`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-jdbc) 一种替代方案。 |
| `spring-boot-starter-json`                    | 用于读写json的 starter                                       |
| `spring-boot-starter-mail`                    | 使用 Java Mail 和Spring Framework的电子邮件发送支持的 starter |
| `spring-boot-starter-mustache`                | 使用Mustache视图构建web应用程序的 starter。                  |
| `spring-boot-starter-oauth2-client`           | 使用 Spring Security 的 OAuth2/OpenID Connect 客户端功能的 starter |
| `spring-boot-starter-oauth2-resource-server`  | 使用 SpringSecurity 的OAuth2 资源服务器特性功能的 starter    |
| `spring-boot-starter-quartz`                  | 使用Quartz调度程序的 starter                                 |
| `spring-boot-starter-rsocket`                 | 用于构建RSocket客户端和服务器的 starter                      |
| `spring-boot-starter-security`                | 使用 Spring Security 的 starter                              |
| `spring-boot-starter-test`                    | 使用JUnit Jupiter、Hamcrest 和 Mockito 等库测试 Spring Boot 应用程序的 starter |
| `spring-boot-starter-thymeleaf`               | 使用 Thymelaf 视图构建 MVC web 应用程序的 starter            |
| `spring-boot-starter-validation`              | 使用Hibernate验证器进行Java Bean验证的 starter               |
| `spring-boot-starter-web`                     | 使用 SpringMVC 构建 web（包括RESTful）应用程序的 starter 。使用 Tomcat 作为默认嵌入式容器 |
| `spring-boot-starter-web-services`            | 使用Spring Web Services的 starter                            |
| `spring-boot-starter-webflux`                 | 使用 Spring Framework 的反应式 Web 支持构建 WebFlux 应用程序的 starter |
| `spring-boot-starter-websocket`               | 使用 Spring Framework 的 MVC WebSocket 支持构建 WebSocket 应用程序的 starter |

除了应用程序启动器外，还可以使用以下启动器添加 [生产就绪](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator) 功能:

| 名称                           | 描述                                                         |
| :----------------------------- | :----------------------------------------------------------- |
| `spring-boot-starter-actuator` | 用于使用 Spring Boot 的actuator，该 actuator提供生产就绪功能，帮助您监控和管理应用程序 |

最后，Spring Boot 也包括以下 starter ，如果您想排除或替换特定的技术方面，可以使用这些 starter：

| 名称                                | 描述                                                         |
| :---------------------------------- | :----------------------------------------------------------- |
| `spring-boot-starter-jetty`         | 使用 Jetty 作为嵌入式 servlet 容器的 starter。   [`spring-boot-starter-tomcat`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-tomcat) 的一种替换方案。 |
| `spring-boot-starter-log4j2`        | 使用 Log4j2 进行日志记录的 starter。  [`spring-boot-starter-logging`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-logging) 的一种替换方案。 |
| `spring-boot-starter-logging`       | 使用 Logback 进行日志记录的 starter 。默认日志记录 starter   |
| `spring-boot-starter-reactor-netty` | 使用Reactor Netty 作为嵌入式反应式 HTTP 服务器的 starter     |
| `spring-boot-starter-tomcat`        | 使用 Tomcat 作为嵌入式 servlet 容器的 starter。 [`spring-boot-starter-web`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-web) 默认的 Servlet 容器 starter。 |
| `spring-boot-starter-undertow`      | 使用 Undertow 作为嵌入式servlet容器的 starter。  [`spring-boot-starter-tomcat`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#spring-boot-starter-tomcat) 的一种替换方案。 |

要了解如何替换技术组件 ，请参阅 [交换web服务器](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.use-another) 和 [日志系统](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.logging.log4j) 的操作文档

有关其他社区贡献的 starter 的列表，请参阅 GitHub 上 `spring-boot-starters` 模块中的 [README 文件](https://github.com/spring-projects/spring-boot/tree/main/spring-boot-project/spring-boot-starters/README.adoc)。

## 2. 构建你的代码

Spring Boot 不需要任何特定的代码布局即可工作。然而，有一些最佳实践是有帮助的。

### 2.1 使用默认的 包 （package）

当一个类不包含包声明时，它被认为是在 “默认包” 中。通常不鼓励使用 “默认包” ，应避免使用。对于使用@ComponentScan、@ConfigurationPropertiesScan、@EntityScan 或 @SpringBootApplication 注解的Spring Boot应用程序，这可能会导致特殊问题，因为每个 jar 中的每个类都会被读取。

> 我们建议您遵循Java推荐的包命名约定，并使用反向域名（例如 com.example.project ）。

### 2.2 查找主应用程序类

们通常建议您将主应用程序类放在根包中的其他类之上。@SpringBootApplication 注解通常放在主类上，它隐式地为某些项定义了一个基本的“搜索包”。例如，如果您正在编写 JPA 应用程序，则使用 @SpringBootApplication 注解类的包来扫描 @Entity 项。使用根包还允许组件扫描仅应用于项目。

> 如果您不想使用 @SpringBootApplication ，它导入的 @EnableAutoConfiguration 和 @ComponentScan 注解将定义该行为，因此您也可以使用这些注解。

以下列表显示了典型布局：

```shell
com
 +- example
     +- myapplication
         +- MyApplication.java
         |
         +- customer
         |   +- Customer.java
         |   +- CustomerController.java
         |   +- CustomerService.java
         |   +- CustomerRepository.java
         |
         +- order
             +- Order.java
             +- OrderController.java
             +- OrderService.java
             +- OrderRepository.java
```

MyApplication.java 文件将声明 main 方法以及基本的 @SpringBootApplication ，如下所示：

**Java**

```
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

## 3. 配置类

`Spring Boot` 支持基于 `Java`的配置 。虽然可以将 `SpringApplication` 与 `XML` 源一起使用，但我们通常建议您的主要源是一个 `@Configuration` 类。通常，定义 `main` 方法的类是一个作为主 `@Configuration` 的好候选类。

> 网上已经发布了很多使用 `XML` 配置的 `Spring` 配置示例。 如果可能，请始终尝试使用等效的基于 `Java` 的配置。 搜索 `Enable*` 注释可能是一个很好的起点。

### 3.1 导入其他配置类

您不需要将所有 @Configuration 放到一个类中。 `@Import` 注解可用于导入其他配置类。或者，您可以使用@ComponentScan 自动扫描所有 Spring 组件，包括 @Configuration 类。

### 3.2 导入 XML 配置

如果您绝对必须使用基于 XML 的配置，我们建议您仍然从 @configuration 类开始。然后可以使用 @ImportResource 注解加载 XML 配置文件。

## 4. 自动配置

Spring Boot 自动配置尝试根据您添加的 jar 依赖关系自动配置您的 Spring 应用程序。例如，如果 HSQLDB 位于类路径中，并且您没有手动配置任何数据库连接 bean，那么 Spring Boot 会自动配置内存中的数据库。

您需要通过向 @configuration 类之一添加 `@EnableAutoConfiguration` 或 `@SpringBootApplication` 注解来选择自动配置。

> 您应该只添加一个@SpringBootApplication或@EnableAutoConfiguration 注解。我们通常建议您仅将一个或另一个添加到主 @Configuration 类。

### 4.1 逐步替换自动配置

自动配置是非侵入式的。在任何时候，您都可以开始定义自己的配置来替换自动配置的特定部分。例如，如果您添加了自己的 DataSource bean，则默认的嵌入式数据库支持将退出。

如果您需要了解当前正在应用什么自动配置，以及为什么，请使用 `--debug` 开关启动应用程序。这样做可以为选定的核心记录器启用调试日志，并将条件报告记录到控制台。

### 4.2 禁用特定自动配置类

如果您发现不希望应用的特定自动配置类，可以使用 `@SpringBootApplication` 的 `exclude` 属性禁用它们，如下例所示：

**Java**

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class MyApplication {

}
```

**Kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration

@SpringBootApplication(exclude = [DataSourceAutoConfiguration::class])
class MyApplication

```

如果类不在类路径中，则可以使用注释的 `excludeName` 属性并指定完全限定的名称。如果您更喜欢使用@EnableAutoConfiguration 而不是 @SpringBootApplication，则 exclude 和 excludeName 也可用。最后，您还可以使用 spring.autoconfigure.exclude 属性控制要排除的自动配置类的列表。

> 可以在注解级别和使用特性定义排除。

> 尽管自动配置类是公共的，但该类唯一被认为是公共 API 的方面是可用于禁用自动配置的类的名称。这些类的实际内容（如嵌套配置类或 bean 方法）仅供内部使用，我们不建议直接使用。

## 5. Spring Beans和依赖注入

您可以自由使用任何标准的 SpringFramework 技术来定义 bean 及其注入的依赖项。我们通常建议使用构造函数注入来连接依赖项，并使用 `@ComponentScan` 来查找 bean。

如果您按照上面的建议构造代码（在顶级包中定位应用程序类），您可以在没有任何参数的情况下添加`@ComponentScan`，或者使用隐式包含它的 `@SpringBootApplication` 注解。所有应用程序组件（`@Component` 、`@Service` 、`@Repository` 、@Controller 等）都会自动注册为Spring Beans。

以下示例显示了一个`@Service` Bean，它使用构造函数注入来获取所需的`RiskAssessor` Bean：

**Java**

```java
import org.springframework.stereotype.Service;

@Service
public class MyAccountService implements AccountService {

    private final RiskAssessor riskAssessor;

    public MyAccountService(RiskAssessor riskAssessor) {
        this.riskAssessor = riskAssessor;
    }

    // ...

}

```

**Kotlin**

```kotlin
import org.springframework.stereotype.Service

@Service
class MyAccountService(private val riskAssessor: RiskAssessor) : AccountService

```

如果一个 bean 有多个构造函数，则需要标记一个要 Spring 与 @Autowired 一起使用的构造函数：

**Java**

```java
import java.io.PrintStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MyAccountService implements AccountService {

    private final RiskAssessor riskAssessor;

    private final PrintStream out;

    @Autowired
    public MyAccountService(RiskAssessor riskAssessor) {
        this.riskAssessor = riskAssessor;
        this.out = System.out;
    }

    public MyAccountService(RiskAssessor riskAssessor, PrintStream out) {
        this.riskAssessor = riskAssessor;
        this.out = out;
    }

    // ...

}

```

**Kotlin**

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.io.PrintStream

@Service
class MyAccountService : AccountService {

    private val riskAssessor: RiskAssessor

    private val out: PrintStream

    @Autowired
    constructor(riskAssessor: RiskAssessor) {
        this.riskAssessor = riskAssessor
        out = System.out
    }

    constructor(riskAssessor: RiskAssessor, out: PrintStream) {
        this.riskAssessor = riskAssessor
        this.out = out
    }

    // ...

}

```

> 请注意，使用构造函数注入是如何将 riskAssessor 字段标记为 final 的，这表明它随后无法更改。

## 6. 使用 @SpringBootApplication 注解

许多 Spring Boot 开发人员喜欢他们的应用程序使用自动配置、组件扫描，并能够在“应用程序类”上定义额外的配置。可以使用一个 @SpringBootApplication 注解来启用这三个功能，即：

- @EnableAutoConfiguration：启用 [Spring Boot 的自动配置机制](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration)
- @ComponentScan：在应用程序所在的包上启用 @Component 扫描（请参阅 [最佳实践](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.structuring-your-code) ）
- @SpringBootConfiguration：允许在上下文中注册额外的 bean 或导入额外的配置类。Spring 标准 `@Configuration` 的替代方案，可帮助您在集成测试中进行 [配置检测](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.detecting-configuration) 。

**Java**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Same as @SpringBootConfiguration @EnableAutoConfiguration @ComponentScan
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

// same as @SpringBootConfiguration @EnableAutoConfiguration @ComponentScan
@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}
```

> @SpringBootApplication 还提供别名来自定义 @EnableAutoConfiguration 和 @ComponentScan 的属性。

> 些功能都不是强制性的，您可以选择用它启用的任何功能替换此单个注解。例如，您可能不想在应用程序中使用组件扫描或配置属性扫描：
>
> **Java**
>
> ```java
> import org.springframework.boot.SpringApplication;
> import org.springframework.boot.SpringBootConfiguration;
> import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
> import org.springframework.context.annotation.Import;
> 
> @SpringBootConfiguration(proxyBeanMethods = false)
> @EnableAutoConfiguration
> @Import({ SomeConfiguration.class, AnotherConfiguration.class })
> public class MyApplication {
> 
>  public static void main(String[] args) {
>      SpringApplication.run(MyApplication.class, args);
>  }
> 
> }
> ```
>
> **Kotlin**
>
> ```
> import org.springframework.boot.SpringBootConfiguration
> import org.springframework.boot.autoconfigure.EnableAutoConfiguration
> import org.springframework.boot.docs.using.structuringyourcode.locatingthemainclass.MyApplication
> import org.springframework.boot.runApplication
> import org.springframework.context.annotation.Import
> 
> @SpringBootConfiguration(proxyBeanMethods = false)
> @EnableAutoConfiguration
> @Import(SomeConfiguration::class, AnotherConfiguration::class)
> class MyApplication
> 
> fun main(args: Array<String>) {
>  runApplication<MyApplication>(*args)
> }
> ```
>
> 在本例中，MyApplication 与任何其他 Spring Boot 应用程序一样，只是@Component 注解类和@ConfigurationProperties 注解类不会自动检测到，并且用户定义的bean是显式导入的（请参见@Import）。

### 7. 运行你的应用

将应用程序打包为 jar 并使用嵌入式HTTP服务器的最大优点之一是可以像运行其他应用程序一样运行应用程序。该示例适用于调试 Spring Boot 应用程序。您不需要任何特殊的 IDE 插件或扩展。

> 本节仅介绍基于 jar 打包。如果选择将应用程序打包为war文件，请参阅服务器和 IDE 文档。

### 7.1 从 IDE 中运行

您可以将 Spring Boot 应用程序作为 Java 应用程序从 IDE 运行。但是，您首先需要导入项目。导入步骤因 IDE 和构建系统而异。大多数 IDE 可以直接导入 Maven 项目。例如，Eclipse 用户可以选择导入… → 文件菜单中的现有 Maven 项目。

如果无法直接将项目导入 IDE ，则可以使用构建插件生成 IDE 元数据。Maven 包括 Eclipse 和 IDEA 的插件。Gradle 为各种 IDE 提供插件。

如果不小心运行了两次 web 应用程序，则会出现 “端口已在使用中” 错误。SpringTools 用户可以使用 “重新启动” 按钮而不是 “运行” 按钮来确保关闭任何现有实例。

### 7.2 作为打包应用程序运行

如果使用 Spring Boot Maven 或 Gradle 插件创建可执行 jar，则可以使用 java-jar 运行应用程序，如下例所示：

```shell
$ java -jar target/myapplication-0.0.1-SNAPSHOT.jar
```

还可以在启用远程调试支持的情况下运行打包的应用程序。这样做可以将调试器附加到打包的应用程序，如下例所示：

```shell
$ java -Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n \
       -jar target/myapplication-0.0.1-SNAPSHOT.jar
```

### 7.3 使用 Maven 插件

Spring Boot Maven 插件包含一个运行目标，可用于快速编译和运行应用程序。应用程序以分解形式运行，就像在 IDE 中一样。以下示例显示了运行 Spring Boot 应用程序的典型 Maven 命令：

```shell
$ mvn spring-boot:run
```

您可能还希望使用 `MAVEN_OPTS` 操作系统环境变量，如下例所示：

```shell
$ export MAVEN_OPTS=-Xmx1024m
```

### 7.4 使用 Gradle 插件

Spring Boot Gradle 插件还包括一个 bootRun 任务，该任务可用于以分解形式运行应用程序。每当您应用org.springframework.boot 和 java 插件时，就会添加 bootRun 任务并显示在以下示例中：

```
$ gradle bootRun
```

### 7.5 热交换（热部署）

由于 Spring Boot 应用程序是普通的 Java 应用程序，所以 JVM 热交换应该是现成的。JVM 热交换在某种程度上受限于它可以替换的字节码。对于更完整的解决方案，可以使用 JRebel 。

spring-boot-devtools 模块还支持快速重启应用程序。有关详细信息，请参阅 [“如何”热插拔](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.hotswapping) 。

## 8. 开发工具

Spring Boot包括一组额外的工具，可以让应用程序开发体验更加愉快。spring-boot-devtools 模块可以包含在任何项目中，以提供额外的开发时特性。要包含 devtools 支持，请将模块依赖项添加到构建中，如以下 Maven 和 Gradle 清单所示：

*Maven*

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

*Gradle*

```
dependencies {
    developmentOnly("org.springframework.boot:spring-boot-devtools")
}
```

>  Devtools 可能会导致类加载问题，特别是在多模块项目中。[诊断类加载问题](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.diagnosing-classloading-issues) 解释了如何诊断和解决它们。

> 运行完全打包的应用程序时，开发人员工具将自动禁用。如果您的应用程序是从 java-jar 启动的，或者是从一个特殊的类加载器启动的，那么它就被认为是一个“生产应用程序”。您可以使用 spring.devtools.restart.enabled 系统属性来控制此行为。要启用 devtools ，无论用于启动应用程序的类加载器是什么，请设置-Dspring.devtools.restart.enabled=true 系统属性。在运行 devtools 存在安全风险的生产环境中，不能这样做。要禁用devtools，请排除依赖项或设置 -Dspring.devtools.restart.enabled=false 系统属性。

> 在 Maven 中将依赖项标记为可选，或者在 Gradle 中使用 developmentOnly 配置（如上所示），可以防止 devtools被过渡应用到使用项目的其他模块。

> 默认情况下，重新打包的归档文件不包含 devtools 。如果你想使用某个远程 devtools 功能，你需要包含它。当使用Maven 插件时，将 excludeDevtools 属性设置为false。使用 Gradle 插件时，将任务的类路径配置为包含developmentOnly 配置。

### 8.1 诊断类加载问题

如Restart vs Reload 部分所述，通过使用两个类加载器来实现重启功能。对于大多数应用程序，这种方法效果很好。然而，它有时会导致类加载问题，特别是在多模块项目中。

要诊断类加载问题是否确实由 devtools 及其两个类加载器引起，请尝试禁用重启。如果这解决了您的问题，请自定义重新启动类加载器以包括整个项目。

### 8.2 默认属性

Spring Boot 支持的几个库使用缓存来提高性能。例如，模板引擎缓存编译的模板，以避免重复分析模板文件。此外，SpringMVC 可以在提供静态资源时向响应添加 HTTP 缓存头。

虽然缓存在生产中非常有益，但在开发过程中可能会产生反作用，从而阻止您看到刚刚在应用程序中所做的更改。因此，spring-boot-devtools 默认禁用缓存选项。

缓存选项通常由application.properties 文件中的设置配置。例如，Thymeleaf 提供了 spring.thymeleaf.cache 属性。spring-boot-devtools 模块无需手动设置这些属性，而是自动应用合理的开发时配置。

下表列出了应用的所有属性：

| 名称                                             | 默认值   |
| :----------------------------------------------- | :------- |
| `server.error.include-binding-errors`            | `always` |
| `server.error.include-message`                   | `always` |
| `server.error.include-stacktrace`                | `always` |
| `server.servlet.jsp.init-parameters.development` | `true`   |
| `server.servlet.session.persistent`              | `true`   |
| `spring.freemarker.cache`                        | `false`  |
| `spring.graphql.graphiql.enabled`                | `true`   |
| `spring.groovy.template.cache`                   | `false`  |
| `spring.h2.console.enabled`                      | `true`   |
| `spring.mustache.servlet.cache`                  | `false`  |
| `spring.mvc.log-resolved-exception`              | `true`   |
| `spring.template.provider.cache`                 | `false`  |
| `spring.thymeleaf.cache`                         | `false`  |
| `spring.web.resources.cache.period`              | `0`      |
| `spring.web.resources.chain.cache`               | `false`  |

> 如果不希望应用属性默认值，可以在application.properties 中将 spring.devtools.add-properties 设置为 false。

由于在开发 SpringMVC 和SpringWebFlux 应用程序时需要更多有关 web 请求的信息，开发人员工具建议您为 web 日志组启用 DEBUG 日志记录。这将为您提供有关传入请求、哪个处理程序正在处理该请求、响应结果和其他详细信息的信息。如果您希望记录所有请求详细信息（包括潜在的敏感信息），可以打开spring.mvc.log-request-details 或 spring.codec.log-request-details 配置属性。

### 8.3 自动重启

每当类路径上的文件发生更改时，使用spring-boot-devtools 的应用程序就会自动重新启动。当在 IDE 中工作时，这可能是一个有用的特性，因为它为代码更改提供了一个非常快速的反馈循环。默认情况下，将监控类路径上指向目录的任何条目的更改。请注意，某些资源（如静态资产和视图模板） [不需要重新启动应用程序](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart.excluding-resources) 。

> **触发重新启动**
>
> 当DevTools监视类路径资源时，触发重启的唯一方法是更新类路径。无论您使用的是IDE还是构建插件，修改后的文件都必须重新编译才能触发重新启动。更新类路径的方式取决于您使用的工具：
>
> - 在Eclipse中，保存修改后的文件会导致类路径更新并触发重新启动。
> - 在IntelliJ IDEA中，构建项目（构建+→+ Build Project）具有相同的效果。
> - 如果使用构建插件，运行 mvn compile for Maven 或 gradle build for gradle 将触发重新启动。

> **注意**
>
> 如果您使用构建插件使用 Maven 或 Gradle 重新启动，则必须将分叉设置保持为启用状态。如果禁用分叉，则不会创建 devtools 使用的隔离应用程序类加载器，并且重新启动将无法正常运行。

>  与 LiveReload 一起使用时，自动重新启动非常有效。有关详细信息，请参阅 LiveReload 部分。如果使用 JRebel，自动重新启动将被禁用，以支持动态类重新加载。其他 devtools 功能（如 LiveReload 和属性重写）仍然可以使用。

> DevTools 依赖于应用程序上下文的关闭钩子在重新启动时关闭它。如果您禁用了关机钩子（ SpringApplication.setRegisterShutdownHook(false) ），它将无法正常工作。

> DevTools 需要自定义 ApplicationContext 使用的 ResourceLoader。如果您的应用程序已经提供了一个，那么它将被包装。不支持在 ApplicationContext 上直接重写 getResource 方法。

> 使用 AspectJ 编织时不支持自动重新启动。

> **重新启动与重新加载**
>
> Spring Boot 提供的重启技术通过使用两个类加载器来工作。不会更改的类（例如，来自第三方 jar 的类）被加载到基类加载器中。您正在积极开发的类将加载到重新启动类加载器中。当应用程序重新启动时，重新启动类加载器将被丢弃，并创建一个新的类加载器。这种方法意味着应用程序重新启动通常比 “冷启动” 快得多，因为基类加载器已经可用并填充。
>
> 如果您发现应用程序的重新启动速度不够快，或者遇到类加载问题，可以考虑从 ZeroTurnaround 重新加载 JRebel 等技术。这些方法通过在类加载时重写类，使它们更易于重新加载。

#### 8.3.1 记录条件评估中的更改

默认情况下，每次应用程序重新启动时，都会记录一个显示条件评估增量的报告。当您进行更改（例如添加或删除 bean 以及设置配置属性）时，该报告会显示对应用程序自动配置的更改。

要禁用报告的日志记录，请设置以下属性：

**Properties**

```properties
spring.devtools.restart.log-condition-evaluation-delta=false
```

**Yaml**

```yaml
spring:
  devtools:
    restart:
      log-condition-evaluation-delta: false
```

#### 8.3.2 排除资源

某些资源在更改时不一定需要触发重新启动。例如，可以就地编辑 Thymelaf 模板。默认情况下，更改 /META-INF/maven 、 /META-IINF/resources 、/resources 、/static、/public 或 /templates 中的资源不会触发重新启动，但会触发实时重新加载。如果要自定义这些排除项，可以使用 spring.devtools.restart.exclude属性。例如，要仅排除 /static 和 /public，需要设置以下属性：

**Properties**

```properties
spring.devtools.restart.exclude=static/**,public/**
```

**Yaml**

```yaml
spring:
  devtools:
    restart:
      exclude: "static/**,public/**"
```

>  如果要保留这些默认值并添加其他排除项，请改用 spring.devtools.restart.additional-exclude 属性。

#### 8.3.3 监视其他路径

当您对不在类路径中的文件进行更改时，您可能希望重新启动或重新加载应用程序。为此，请使用     spring.devtools.restart.additional-paths 属性配置其他路径以查看更改。您可以使用前面描述的spring.devtools.restart.exclude 属性来控制附加路径下的更改是触发完全重新启动还是实时重新加载。

#### 8.3.4 禁用重启

如果不想使用重新启动功能，可以使用 spring.devtools.restart.enabled 属性禁用它。在大多数情况下，您可以在application.properties 中设置此属性（这样做仍会初始化重新启动类加载器，但它不会监视文件更改）。

如果需要完全禁用重启支持（例如，因为它不适用于特定的库），则需要在调用 SpringApplication.run（…), 如下例所示：

**Java**

```
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        System.setProperty("spring.devtools.restart.enabled", "false");
        SpringApplication.run(MyApplication.class, args);
    }

}
```

**Kotlin**

```java
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
object MyApplication {

    @JvmStatic
    fun main(args: Array<String>) {
        System.setProperty("spring.devtools.restart.enabled", "false")
        SpringApplication.run(MyApplication::class.java, *args)
    }

}
```

#### 8.3.5 使用触发器文件

如果您使用的 IDE 持续编译更改的文件，您可能更希望只在特定时间触发重新启动。为此，您可以使用 “触发器文件” ，这是一个特殊的文件，当您想要实际触发重新启动检查时，必须对其进行修改。

> 对文件的任何更新都会触发检查，但只有当 Devtools 检测到它有什么事情要做时，才会实际重新启动。

要使用触发器文件，请将 spring.vtools.restart.trigger-file 属性设置为触发器文件的名称（不包括任何路径）。触发器文件必须出现在类路径的某个位置。

例如，如果您的项目具有以下结构：

```shell
src
+- main
   +- resources
      +- .reloadtrigger
```

那么您的触发器文件属性将是：

**Properties**

```properties
spring.devtools.restart.trigger-file=.reloadtrigger
```

**Yaml**

```yaml
spring:
  devtools:
    restart:
      trigger-file: ".reloadtrigger"
```

现在，只有当 src/main/resources/.reloadtrigger 更新时，才会重新启动。

> 您可能希望将 spring.devtools.restart.trigger-file 设置为全局设置，以便所有项目都以相同的方式运行。

有些IDE具有一些功能，可以让您不必手动更新触发器文件。[Spring Tools for Eclipse](https://spring.io/tools) 和 [IntelliJ IDEA（Ultimate Edition）](https://www.jetbrains.com/idea/) 都有这样的支持。使用 Spring Tools，您可以从控制台视图中使用 “reload” 按钮（只要触发器文件名为 `.reloadtrigger` ）。对于 IntelliJ IDEA，您可以按照其 [文档中的说明 ](https://www.jetbrains.com/help/idea/spring-boot.html#application-update-policies)进行操作。

#### 8.3.6 自定义Restart Classloader

正如前面的 Restart vs Reload 部分所述，通过使用两个类加载器来实现重启功能。如果这导致问题，您可能需要自定义哪个类加载器加载了什么。

默认情况下，IDE中任何打开的项目都用 “restart” 类加载器加载，任何常规 .jar 文件都用 “base” 类加载器装载。如果您使用 mvn spring boot:run 或 gradle bootRun，情况也是如此：包含 @SpringBootApplication 的项目使用 “restart” 类加载器加载，其他所有内容都使用“base”类加载器。

您可以通过创建 META-INF/Spring-devtools.properties 文件，指示SpringBoot 使用不同的类加载器加载项目的部分内容。spring-devtools.properties 文件可以包含前缀为 restart.exclude 和 restart.include 的属性。包含元素是应该拉入“restart” 类加载器的项，而排除元素是应该下推到 “base” 类加加器的项。该属性的值是应用于类路径的正则表达式模式，如下例所示：

**Properties**

```properties
restart.exclude.companycommonlibs=/mycorp-common-[\\w\\d-\\.]+\\.jar
restart.include.projectcommon=/mycorp-myproj-[\\w\\d-\\.]+\\.jar
```

**Yaml**

```yaml
restart:
  exclude:
    companycommonlibs: "/mycorp-common-[\\w\\d-\\.]+\\.jar"
  include:
    projectcommon: "/mycorp-myproj-[\\w\\d-\\.]+\\.jar"
```

> 所有属性键必须唯一。只要属性以 restart.include. 或 restart.exclude. 开头，就会被顾及。

> 将加载类路径中的所有 META-INF/spring-devtools.properties 。您可以在项目内部或项目使用的库中打包文件。

#### 9.3.7 已知限制

重新启动功能不能很好地处理使用标准 ObjectInputStream 反序列化的对象。如果需要反序列化数据，可能需要将 Spring 的 ConfigurationObjectInputStream 与 Thread.currentThread().getContextClassLoader()  结合使用。

不幸的是，几个第三方库在不考虑上下文类加载器的情况下反序列化。如果您发现这样的问题，您需要向原作者请求修复。

### 8.4 LiveReload

spring-boot-devtools 模块包括一个嵌入式 LiveReload 服务器，当资源发生更改时，该服务器可用于触发浏览器刷新。LiveReload 浏览器扩展可从 [livereload.com](http://livereload.com/extensions/) 免费提供给 Chrome、Firefox 和 Safari 。

如果您不想在应用程序运行时启动 LiveReload 服务器，可以将 spring.devtools.livereload.enabled 属性设置为false。

> 一次只能运行一台 LiveReload 服务器。启动应用程序之前，请确保没有其他 LiveReload 服务器正在运行。如果从 IDE 启动多个应用程序，则只有第一个应用程序支持 LiveReload。

要在文件更改时触发 LiveReload，必须启用 [自动重新启动](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart) 。

### 8.5 全局设置

您可以通过将以下任何文件添加到 $HOME/.config/spring 引导目录来配置全局 devtools 设置：

1. `spring-boot-devtools.properties`
2. `spring-boot-devtools.yaml`
3. `spring-boot-devtools.yml`

添加到这些文件中的任何属性都适用于您机器上使用 devtool 的所有 Spring Boot 应用程序。例如，要将restart 配置为始终使用触发器文件，您需要将以下属性添加到 spring-boot-devtools 文件中：

**Properties**

```properties
spring.devtools.restart.trigger-file=.reloadtrigger
```

**Yaml**

```yaml
spring:
  devtools:
    restart:
      trigger-file: ".reloadtrigger"
```

默认情况下，$HOME 是用户的主目录。要自定义此位置，请设置 `SPRING_DEVTOOLS_HOME` 环境变量或`spring.devtools.home` 系统属性。

> 如果在 `$HOME/.config/spring-boot` 中找不到 devtools 配置文件，则会在 `$HOME` 目录的根目录中搜索是否存在 `.spring-boot-devtools.properties` 文件。这允许您与不支持 `$HOME/.config/Spring` 引导位置的旧版本 Spring Boot上的应用程序共享 devtools 全局配置。

> devtools properties/yaml文件中不支持 Profiles。
>
> 在.spring-boot-devtools.properties 中激活的任何概要文件都不会影响 [特定于概要文件的配置文件 ](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files.profile-specific)的加载。 YAML 和properties 文件中不支持特定于配置文件的文件名（格式为`spring-boot-devtools-<Profile>.properties`）和spring.config.activate.on-profile 文档。

#### 8.5.1 配置文件系统观察者

FileSystemWatcher 的工作方式是以一定的时间间隔轮询类更改，然后等待预定义的静默期以确保没有更多更改。由于Spring Boot 完全依赖于 IDE 来编译文件并将其复制到 Spring Boot 可以读取文件的位置，因此您可能会发现，在devtools 重新启动应用程序时，有时某些更改没有反映出来。如果您经常观察到这样的问题，请尝试将spring.devtools.restart.poll-interval 和 spring.devools.restart.quiet-period 参数增加到适合您的开发环境的值：

**Properties**

```properties
spring.devtools.restart.poll-interval=2s
spring.devtools.restart.quiet-period=1s
```

**Yaml**

```yaml
spring:
  devtools:
    restart:
      poll-interval: "2s"
      quiet-period: "1s"
```

现在，监视的类路径目录每 2 秒轮询一次以查看更改，并保持 1 秒的静默期以确保没有其他类更改。



### 8.6 远程应用程序

Spring Boot 开发人员工具不限于本地开发。远程运行应用程序时，还可以使用几个功能。远程支持是可选的，因为启用它可能会带来安全风险。仅当在受信任的网络上运行或使用 SSL 进行安全保护时才应启用它。如果这两个选项都不可用，则不应使用 DevTools 的远程支持。您不应在生产部署上启用支持。

要启用它，您需要确保 devtools 包含在重新打包的存档中，如以下列表所示：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludeDevtools>false</excludeDevtools>
            </configuration>
        </plugin>
    </plugins>
</build>
```

然后需要设置 spring.devtools.remote.secret 属性。像任何重要的密码或秘密一样，该值应该是唯一的和强大的，这样它就不会被猜测或暴力强迫。

远程 devtools 支持分为两部分：接受连接的服务器端端点和在 IDE 中运行的客户端应用程序。当设置了spring.devtools.remote.secret 属性时，服务器组件将自动启用。必须手动启动客户端组件。

> Spring WebFlux 应用程序不支持远程 devtools。

#### 8.6.1 运行远程客户端应用程序

远程客户端应用程序设计为在 IDE 中运行。您需要使用与所连接的远程项目相同的类路径运行 `org.springframework.boot.devtools.RemoteSpringApplication` 。 该应用程序的唯一必需参数是其连接的远程 URL 。

例如，如果您使用的是Eclipse或Spring工具，并且您有一个名为 my-app 的项目已部署到 CloudFoundry ，您将执行以下操作：

- 选择运行配置… 从“运行”菜单中选择。

- 创建新的Java应用程序“启动配置”。

- 浏览我的应用程序项目。

使用 `org.springframework.boot.devtools.RemoteSpringApplication` 作为主类。

添加 `https://myapp.cfapps.io` 程序参数（或任何远程URL）。

正在运行的远程客户端可能类似于以下列表：

```
  .   ____          _                                              __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _          ___               _      \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` |        | _ \___ _ __  ___| |_ ___ \ \ \ \
 \\/  ___)| |_)| | | | | || (_| []::::::[]   / -_) '  \/ _ \  _/ -_) ) ) ) )
  '  |____| .__|_| |_|_| |_\__, |        |_|_\___|_|_|_\___/\__\___|/ / / /
 =========|_|==============|___/===================================/_/_/_/
 :: Spring Boot Remote ::  (v3.0.2)

2023-01-20T00:27:27.936Z  INFO 21137 --- [           main] o.s.b.devtools.RemoteSpringApplication   : Starting RemoteSpringApplication v3.0.2 using Java 17.0.6 with PID 21137 (/Users/myuser/.m2/repository/org/springframework/boot/spring-boot-devtools/3.0.2/spring-boot-devtools-3.0.2.jar started by myuser in /opt/apps/)
2023-01-20T00:27:28.064Z  INFO 21137 --- [           main] o.s.b.devtools.RemoteSpringApplication   : No active profile set, falling back to 1 default profile: "default"
2023-01-20T00:27:28.839Z  INFO 21137 --- [           main] o.s.b.d.a.OptionalLiveReloadServer       : LiveReload server is running on port 35729
2023-01-20T00:27:28.879Z  INFO 21137 --- [           main] o.s.b.devtools.RemoteSpringApplication   : Started RemoteSpringApplication in 2.785 seconds (process running for 4.125)
```

> 因为远程客户端使用与实际应用程序相同的类路径，所以它可以直接读取应用程序属性。这是如何读取spring.devtools.remote.secret 属性并将其传递给服务器进行身份验证的。

>  建议始终使用 `https://` 作为连接协议，以便对流量进行加密，并且不会拦截密码。

>  如果需要使用代理来访问远程应用程序，请配置 spring.devtools.remote.proxy.host 和spring.devtools.remote.proxy.port 属性。

#### 8.6.2 远程更新

远程客户端以与 [本地重启 ](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart)相同的方式监视应用程序类路径的更改。任何更新的资源都会推送到远程应用程序，并（如果需要）触发重新启动。如果您迭代使用本地没有的云服务的功能，这将非常有用。通常，远程更新和重新启动比完整的重建和部署周期快得多。

在较慢的开发环境中，可能会发生这样的情况：静默期不够，类中的更改可能会分为多个批次。在上载第一批类更改后，服务器将重新启动。无法将下一批发送到应用程序，因为服务器正在重新启动。

这通常表现为 RemoteSpringApplication 日志中关于未能上载某些类的警告，以及随后的重试。但这也可能导致应用程序代码不一致，在第一批更改上传后无法重新启动。如果您经常观察到这样的问题，请尝试将 spring.devtools.restart.poll-interval和spring.devools.restart.quiet-period 参数增加到适合您的开发环境的值。有关配置这些属性的信息，请参阅 [配置文件系统观察程序](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.globalsettings.configuring-file-system-watcher) 部分。

> 文件仅在远程客户端运行时被监视。如果在启动远程客户端之前更改了文件，则不会将其推送到远程服务器。

## 9. 为生产打包应用程序

可执行jar可用于生产部署。由于它们是独立的，因此也非常适合基于云的部署。

对于其他“生产就绪”特性，如健康检查、审计 和metric REST 或 JMX 端点，请考虑添加 `spring-boot-actuator`。有关详细信息，请参见 [actuator.html](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator) 。