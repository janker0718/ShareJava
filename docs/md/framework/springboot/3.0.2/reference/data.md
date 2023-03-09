# Data

Spring Boot 集成了许多数据技术，包括 SQL 和 NoSQL。

## 1. SQL数据库

[Spring Framework](https://spring.io/projects/spring-framework) 为使用 SQL 数据库提供了广泛的支持，从使用 `JdbcTemplate` 的直接 JDBC 访问到完整的“对象关系映射”技术（如 Hibernate）。 [Spring Data](https://spring.io/projects/spring-data) 提供了一个额外的功能级别：直接从接口创建 `Repository` 实现并使用约定从您的方法名称生成查询。

### 1.1 配置一个数据源

Java 的 javax.sql.DataSource 接口提供了一种处理数据库连接的标准方法。 传统上，DataSource 使用 URL 和一些凭据来建立数据库连接。

::: tip 提示

有关更高级的示例，请参阅[“操作方法”部分](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-custom-datasource)，通常是为了完全控制 DataSource 的配置。

:::

#### 1.1.1 嵌入式数据库支持

使用内存嵌入式数据库开发应用程序通常很方便。 显然，内存数据库不提供持久存储。 您需要在应用程序启动时填充数据库，并准备好在应用程序结束时丢弃数据。

::: tip 提示

“操作方法”部分包括有关如何初始化数据库的部分。

:::

Spring Boot 可以自动配置嵌入式 H2、HSQL 和 Derby 数据库。 您无需提供任何连接 URL。 您只需要包含对要使用的嵌入式数据库的构建依赖项。 如果类路径上有多个嵌入式数据库，设置 spring.datasource.embedded-database-connection 配置属性来控制使用哪一个。 将该属性设置为 none 会禁用嵌入式数据库的自动配置。

::: info 信息

如果您在测试中使用此功能，您可能会注意到，无论您使用多少应用程序上下文，整个测试套件都会重复使用同一个数据库。 如果您想确保每个上下文都有一个单独的嵌入式数据库，您应该将 `spring.datasource.generate-unique-name` 设置为 `true`。

:::

例如，典型的 POM 依赖项如下：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.hsqldb</groupId>
    <artifactId>hsqldb</artifactId>
    <scope>runtime</scope>
</dependency>
```

::: info 信息

您需要依赖 `spring-jdbc` 才能自动配置嵌入式数据库。 在这个例子中，它是通过 `spring-boot-starter-data-jpa` 传递进来的。

:::



::: tip 提示

如果出于某种原因确实为嵌入式数据库配置了连接 URL，请注意确保禁用数据库的自动关闭。 如果使用 H2，则应使用 `DB_CLOSE_ON_EXIT=FALSE` 来执行此操作。 如果您使用 HSQLDB，您应该确保不使用 `shutdown=true`。 禁用数据库的自动关闭可以让 Spring Boot 控制数据库何时关闭，从而确保一旦不再需要访问数据库就会关闭。

:::

#### 1.1.2 连接到生产数据库

生产数据库连接也可以通过使用池数据源自动配置。

#### 1.1.3 DataSource 配置

DataSource 配置由 `spring.datasource.*` 中的外部配置属性控制。 例如，您可以在 `application.properties` 中声明以下部分：

::: code-tabs#language
@tab Properties

```properties
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
```

@tab Yaml

```yaml
spring:
  datasource:
    url: "jdbc:mysql://localhost/test"
    username: "dbuser"
    password: "dbpass"
```

:::

::: info 信息

您至少应该通过设置 `spring.datasource.url` 属性来指定 URL。 否则，Spring Boot 会尝试自动配置嵌入式数据库。

:::

::: tip 提示

spring Boot 可以从 URL 中推断出大多数数据库的 JDBC 驱动程序类。 如果需要指定特定的类，可以使用 `spring.datasource.driver-class-name` 属性。

:::



::: info 信息

对于要创建的池化 DataSource，我们需要能够验证有效的 Driver 类是否可用，因此我们会在执行任何操作之前进行检查。 换句话说，如果您设置 `spring.datasource.driver-class-name=com.mysql.jdbc.Driver`，那么该类必须是可加载的。

:::

有关更多受支持的选项，请参阅 [`DataSourceProperties`](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jdbc/DataSourceProperties.java)。 这些是无论[实际实施](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#data.sql.datasource.connection-pool)如何都有效的标准选项。 还可以通过使用它们各自的前缀（`spring.datasource.hikari.*`、`spring.datasource.tomcat.*`、`spring.datasource.dbcp2.*` 和 `spring.datasource.oracleucp.*`）来微调特定于实现的设置 ). 有关更多详细信息，请参阅您正在使用的连接池实现的文档。

例如，如果您使用 [Tomcat 连接池](https://tomcat.apache.org/tomcat-10.1-doc/jdbc-pool.html#Common_Attributes)，您可以自定义许多附加设置，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.datasource.tomcat.max-wait=10000
spring.datasource.tomcat.max-active=50
spring.datasource.tomcat.test-on-borrow=true
```



@tab Yaml

```yaml
spring:
  datasource:
    tomcat:
      max-wait: 10000
      max-active: 50
      test-on-borrow: true
```



:::

如果没有可用连接，这将设置池在抛出异常之前等待 10000 毫秒，将最大连接数限制为 50 并在从池中借用之前验证连接。

#### 1.1.4 支持的连接池

Spring Boot 使用以下算法来选择特定的实现：

1. 我们更喜欢 [HikariCP](https://github.com/brettwooldridge/HikariCP)，因为它的性能和并发性。 如果 HikariCP 可用，我们总是选择它。 
2. 否则，如果 Tomcat 池数据源可用，我们将使用它。 
3. 否则，如果 [Commons DBCP2](https://github.com/brettwooldridge/HikariCP) 可用，我们将使用它。 
4. 如果 HikariCP、Tomcat 和 DBCP2 都不可用，但如果 Oracle UCP 可用，我们就使用它。

::: info 信息

如果您使用 `spring-boot-starter-jdbc` 或 `spring-boot-starter-data-jpa “starters”`，您会自动获得对 HikariCP 的依赖。

:::

您可以完全绕过该算法并通过设置 `spring.datasource.type` 属性指定要使用的连接池。 如果您在 Tomcat 容器中运行应用程序，这一点尤为重要，因为默认提供了 `tomcat-jdbc`。 

始终可以使用 `DataSourceBuilder` 手动配置其他连接池。 如果您定义自己的 `DataSource` bean，则不会发生自动配置。 `DataSourceBuilder` 支持以下连接池：

1. HikariCP
2. Tomcat pooling `Datasource`
3. Commons DBCP2
4. Oracle UCP & `OracleDataSource`
5. Spring Framework’s `SimpleDriverDataSource`
6. H2 `JdbcDataSource`
7. PostgreSQL `PGSimpleDataSource`
8. C3P0

#### 1.1.5 连接到 JNDI 数据源

如果将 Spring Boot 应用程序部署到应用程序服务器，您可能希望使用应用程序服务器的内置功能配置和管理数据源，并使用 JNDI 访问它。 

`spring.datasource.jndi-name` 属性可用作 `spring.datasource.url`、`spring.datasource.username` 和 `spring.datasource.password` 属性的替代项，以从特定 JNDI 位置访问数据源。 例如，`application.properties` 中的以下部分显示了如何访问 JBoss AS 定义的数据源：

::: code-tabs#language
@tab Properties

```properties
spring.datasource.jndi-name=java:jboss/datasources/customers
```



@tab Yaml

```yaml
spring:
  datasource:
    jndi-name: "java:jboss/datasources/customers"
```



:::

### 1.2 使用 JdbcTemplate

Spring 的 JdbcTemplate 和 NamedParameterJdbcTemplate 类是自动配置的，您可以将它们直接@Autowire 到您自己的 bean 中，如下例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final JdbcTemplate jdbcTemplate;

    public MyBean(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void doSomething() {
        this.jdbcTemplate ...
    }

}
```



@tab kotlin

```kotlin
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val jdbcTemplate: JdbcTemplate) {

    fun doSomething() {
        jdbcTemplate.execute("delete from customer")
    }

}
```



:::

您可以使用 `spring.jdbc.template.*` 属性自定义模板的一些属性，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.jdbc.template.max-rows=500
```



@tab Yaml

```yaml
spring:
  jdbc:
    template:
      max-rows: 500
```



:::

::: info 信息

`NamedParameterJdbcTemplate` 在幕后重用相同的 `JdbcTemplate` 实例。 如果定义了多个 `JdbcTemplate` 并且不存在主要候选者，则不会自动配置 `NamedParameterJdbcTemplate`。

:::



### 1.3 JPA 和 Spring Data JPA

Java Persistence API 是一种标准技术，可让您将对象“映射”到关系数据库。 `spring-boot-starter-data-jpa` POM 提供了一种快速入门的方法。 它提供了以下关键依赖项：

- Hibernate：最流行的 JPA 实现之一。 
- Spring Data JPA：帮助您实现基于 JPA 的存储库。 
- Spring ORM：来自 Spring Framework 的核心 ORM 支持。

::: tip 提示

我们不会在这里详细介绍 JPA 或 [Spring Data](https://spring.io/projects/spring-data)。 您可以遵循 [spring.io](https://spring.io/) 中的[“使用 JPA 访问数据”](https://spring.io/guides/gs/accessing-data-jpa/)指南并阅读 [Spring Data JPA](https://spring.io/projects/spring-data-jpa) 和 [Hibernate](https://hibernate.org/orm/documentation/) 参考文档。

:::

#### 1.3.1 实体类

传统上，JPA“实体”类在 `persistence.xml` 文件中指定。 使用 Spring Boot，不需要此文件，而是使用“实体扫描”。 默认情况下，搜索主配置类（使用`@EnableAutoConfiguration` 或`@SpringBootApplication` 注解的类）下的所有包。 

考虑使用`@Entity`、`@Embeddable` 或`@MappedSuperclass` 注解的任何类。 典型的实体类类似于以下示例：

::: code-tabs#language
@tab Java

```java
import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class City implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String state;

    // ... additional members, often include @OneToMany mappings

    protected City() {
        // no-args constructor required by JPA spec
        // this one is protected since it should not be used directly
    }

    public City(String name, String state) {
        this.name = name;
        this.state = state;
    }

    public String getName() {
        return this.name;
    }

    public String getState() {
        return this.state;
    }

    // ... etc

}
```



@tab Kotlin

```kotlin
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import java.io.Serializable

@Entity
class City : Serializable {

    @Id
    @GeneratedValue
    private val id: Long? = null

    @Column(nullable = false)
    var name: String? = null
        private set

    // ... etc
    @Column(nullable = false)
    var state: String? = null
        private set

    // ... additional members, often include @OneToMany mappings

    protected constructor() {
        // no-args constructor required by JPA spec
        // this one is protected since it should not be used directly
    }

    constructor(name: String?, state: String?) {
        this.name = name
        this.state = state
    }

}
```



:::

::: tip 提示

您可以使用 @EntityScan 注释自定义实体扫描位置。 请参阅[“howto.html”](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.separate-entity-definitions-from-spring-configuration)操作指南。

:::

#### 1.3.2 Spring Data JPA 存储库

[Spring Data JPA](https://spring.io/projects/spring-data-jpa) 存储库是您可以定义以访问数据的接口。 JPA 查询是根据您的方法名称自动创建的。 例如，CityRepository 接口可能会声明一个 findAllByState(String state) 方法来查找给定状态下的所有城市。 

对于更复杂的查询，您可以使用 Spring Data 的[查询](https://docs.spring.io/spring-data/jpa/docs/3.0.3/api/org/springframework/data/jpa/repository/Query.html)注解来注解您的方法。 

Spring Data 存储库通常从 [`Repository`](https://docs.spring.io/spring-data/commons/docs/3.0.3/api/org/springframework/data/repository/Repository.html) 或 [`CrudRepository`](https://docs.spring.io/spring-data/commons/docs/3.0.3/api/org/springframework/data/repository/CrudRepository.html) 接口扩展。 如果您使用自动配置，则会从包含您的主要配置类（用`@EnableAutoConfiguration` 或`@SpringBootApplication` 注释的那个）的包中向下搜索存储库。 

以下示例显示了典型的 Spring Data 存储库接口定义：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.City;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

    Page<City> findAll(Pageable pageable);

    City findByNameAndStateAllIgnoringCase(String name, String state);

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.City
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository

interface CityRepository : Repository<City?, Long?> {

    fun findAll(pageable: Pageable?): Page<City?>?

    fun findByNameAndStateAllIgnoringCase(name: String?, state: String?): City?

}
```



:::

Spring Data JPA 存储库支持三种不同的引导模式：默认、延迟和惰性。 要启用延迟或延迟引导，请分别将 `spring.data.jpa.repositories.bootstrap-mode` 属性设置为延迟或延迟。 使用延迟或延迟引导时，自动配置的 `EntityManagerFactoryBuilder` 将使用上下文的 `AsyncTaskExecutor`（如果有）作为引导执行程序。 如果存在多个，将使用名为 `applicationTaskExecutor` 的那个。

::: info 信息

使用延迟或延迟引导时，请确保在应用程序上下文引导阶段之后延迟对 JPA 基础结构的任何访问。 您可以使用 `SmartInitializingSingleton` 调用任何需要 JPA 基础结构的初始化。 对于作为 Spring bean 创建的 JPA 组件（例如转换器），如果有的话，使用 `ObjectProvider` 来延迟依赖项的解析。

:::

::: tip 提示

我们仅仅触及了 Spring Data JPA 的皮毛。 有关完整的详细信息，请参阅 [Spring Data JPA 参考文档](https://docs.spring.io/spring-data/jpa/docs/3.0.3/reference/html)。

:::

####  1.3.3 Spring Data Envers 存储库

如果 [Spring Data Envers](https://spring.io/projects/spring-data-envers) 可用，JPA 存储库将自动配置为支持典型的 Envers 查询。 

要使用 Spring Data Envers，请确保您的存储库从 RevisionRepository 扩展，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.Country;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.history.RevisionRepository;

public interface CountryRepository extends RevisionRepository<Country, Long, Integer>, Repository<Country, Long> {

    Page<Country> findAll(Pageable pageable);

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.Country
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository
import org.springframework.data.repository.history.RevisionRepository

interface CountryRepository :
        RevisionRepository<Country?, Long?, Int>,
        Repository<Country?, Long?> {

    fun findAll(pageable: Pageable?): Page<Country?>?

}
```



:::

::: info 信息

有关更多详细信息，请查看 [Spring Data Envers 参考文档](https://docs.spring.io/spring-data/envers/docs/3.0.3/reference/html/)。

:::

#### 1.3.4 创建和删除 JPA 数据库

默认情况下，**仅**当您使用嵌入式数据库（H2、HSQL 或 Derby）时才会自动创建 JPA 数据库。 您可以使用 `spring.jpa.*` 属性显式配置 JPA 设置。 例如，要创建和删除表，您可以将以下行添加到您的 `application.properties`：

::: code-tabs#language
@tab Properties

```properties
spring.jpa.hibernate.ddl-auto=create-drop
```



@tab Yaml

```yaml
spring:
  jpa:
    hibernate.ddl-auto: "create-drop"
```



:::

::: info 提示

为此，Hibernate 自己的内部属性名称（如果您碰巧记得更好的话）是 `hibernate.hbm2ddl.auto`。 您可以使用 `spring.jpa.properties.*` 设置它以及其他 Hibernate 本机属性（在将它们添加到实体管理器之前去除前缀）。 以下行显示了为 Hibernate 设置 JPA 属性的示例：

:::

::: code-tabs#language
@tab Properties

```properties
spring.jpa.properties.hibernate[globally_quoted_identifiers]=true
```



@tab Yaml

```yaml
spring:
  jpa:
    properties:
      hibernate:
        "globally_quoted_identifiers": "true"
```



:::

前面示例中的行将 hibernate.globally_quoted_identifiers 属性的值 `true` 传递给 Hibernate 实体管理器。 

默认情况下，DDL 执行（或验证）被推迟到 `ApplicationContext` 已经启动。 还有一个 `spring.jpa.generate-ddl` 标志，但如果 Hibernate 自动配置处于活动状态，则不会使用它，因为 ddl-auto 设置更细粒度。

#### 1.3.5 在视图中打开 EntityManager

如果您正在运行 Web 应用程序，Spring Boot 默认情况下会注册 [`OpenEntityManagerInViewInterceptor`](https://docs.spring.io/spring-framework/docs/6.0.6/javadoc-api/org/springframework/orm/jpa/support/OpenEntityManagerInViewInterceptor.html) 以应用“在视图中打开 EntityManager”模式，以允许在 Web 视图中进行延迟加载。 如果您不想要这种行为，您应该在您的 `application.properties` 中将 `spring.jpa.open-in-view` 设置为 false。

### 1.4 Spring Data JDBC

Spring Data 包括对 JDBC 的存储库支持，并将自动为 `CrudRepository` 上的方法生成 SQL。 对于更高级的查询，提供了`@Query` 注释。 

当必要的依赖项在类路径上时，Spring Boot 将自动配置 Spring Data 的 JDBC 存储库。 它们可以通过对 `spring-boot-starter-data-jdbc` 的单一依赖性添加到您的项目中。 如有必要，您可以通过向应用程序添加 `@EnableJdbcRepositories` 注释或 `JdbcConfiguration` 子类来控制 Spring Data JDBC 的配置。

::: tip 提示

有关 Spring Data JDBC 的完整详细信息，请参阅[参考文档](https://docs.spring.io/spring-data/jdbc/docs/3.0.3/reference/html/)。

:::

### 1.5 使用 H2 的 Web 控制台

[H2 数据库](https://www.h2database.com/)提供了一个[基于浏览器的控制台](https://www.h2database.com/html/quickstart.html#h2_console)，Spring Boot 可以为您自动配置。 当满足以下条件时，控制台会自动配置：

- 您正在开发基于 servlet 的 Web 应用程序。 

- `com.h2database:h2` 在类路径上。 

- 您正在使用 [Spring Boot 的开发人员工具](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools)。

::: tip 提示

如果您不使用 Spring Boot 的开发人员工具，但仍想使用 H2 的控制台，则可以将 `spring.h2.console.enabled` 属性配置为 true。

:::

::: info 信息

H2 控制台仅供开发期间使用，因此您应注意确保 `spring.h2.console.enabled` 未在生产中设置为 `true`。

:::

#### 1.5.1 更改 H2 控制台的路径

默认情况下，控制台位于 `/h2-console`。 您可以使用 `spring.h2.console.path` 属性自定义控制台的路径。

#### 1.5.2 在安全应用程序中访问 H2 控制台

H2 Console 使用框架，仅供开发使用，未实施 CSRF 保护措施。 如果您的应用程序使用了 Spring Security，则需要将其配置为

- 针对针对控制台的请求禁用 CSRF 保护， 在来自控制台的响应中将标头 
- `X-Frame-Options` 设置为 `SAMEORIGIN`。

有关 [CSRF](https://docs.spring.io/spring-security/reference/6.0.2/features/exploits/csrf.html) 和标头 [X-Frame-Options](https://docs.spring.io/spring-security/reference/6.0.2/features/exploits/headers.html#headers-frame-options) 的更多信息，请参阅 Spring Security 参考指南。 

在简单的设置中，可以使用如下所示的 `SecurityFilterChain`：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Profile("dev")
@Configuration(proxyBeanMethods = false)
public class DevProfileSecurityConfiguration {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(PathRequest.toH2Console());
        http.authorizeHttpRequests(yourCustomAuthorization());
        http.csrf((csrf) -> csrf.disable());
        http.headers((headers) -> headers.frameOptions().sameOrigin());
        return http.build();
    }


}
```



@tab Kotlin

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Profile("dev")
@Configuration(proxyBeanMethods = false)
class DevProfileSecurityConfiguration {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    fun h2ConsoleSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http.authorizeHttpRequests(yourCustomAuthorization())
            .csrf().disable()
            .headers().frameOptions().sameOrigin().and()
            .build()
    }


}
```

:::

::: warning 警告

H2 控制台仅供在开发期间使用。 在生产中，禁用 CSRF 保护或允许网站框架可能会造成严重的安全风险。

:::

::: tip 提示

`PathRequest.toH2Console()` 也会在自定义控制台路径时返回正确的请求匹配器。

:::



### 1.6 使用 jOOQ

`jOOQ` 面向对象查询 ([jOOQ](https://www.jooq.org/)) 是 [`Data Geekery`](https://www.datageekery.com/) 的一款流行产品，它从您的数据库生成 Java 代码，并允许您通过其流畅的 API 构建类型安全的 SQL 查询。 商业版和开源版都可以与 Spring Boot 一起使用。

#### 1.6.1 代码生成

为了使用 jOOQ 类型安全查询，您需要从数据库模式生成 Java 类。 您可以按照 jOOQ 用户手册中的说明进行操作。 如果您使用 jooq-codegen-maven 插件并且还使用 `spring-boot-starter-parent` “parent POM”，您可以安全地省略插件的 `<version>` 标签。 您还可以使用 Spring Boot 定义的版本变量（例如 `h2.version`）来声明插件的数据库依赖项。 以下清单显示了一个示例：

```xml
<plugin>
    <groupId>org.jooq</groupId>
    <artifactId>jooq-codegen-maven</artifactId>
    <executions>
        ...
    </executions>
    <dependencies>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>${h2.version}</version>
        </dependency>
    </dependencies>
    <configuration>
        <jdbc>
            <driver>org.h2.Driver</driver>
            <url>jdbc:h2:~/yourdatabase</url>
        </jdbc>
        <generator>
            ...
        </generator>
    </configuration>
</plugin>
```



#### 1.6.2 使用 DSLContext

jOOQ 提供的流畅 API 是通过 `org.jooq.DSLContext` 接口启动的。 `Spring Boot` 自动将 `DSLContext` 配置为 Spring Bean，并将其连接到您的应用程序数据源。 要使用 `DSLContext`，您可以注入它，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import java.util.GregorianCalendar;
import java.util.List;

import org.jooq.DSLContext;

import org.springframework.stereotype.Component;

import static org.springframework.boot.docs.data.sql.jooq.dslcontext.Tables.AUTHOR;

@Component
public class MyBean {

    private final DSLContext create;

    public MyBean(DSLContext dslContext) {
        this.create = dslContext;
    }


}
```



@tab Kotlin

```kotlin
import org.jooq.DSLContext
import org.springframework.stereotype.Component
import java.util.GregorianCalendar

@Component
class MyBean(private val create: DSLContext) {


}
```



:::

::: tip 提示

`jOOQ` 手册倾向于使用名为 `create` 的变量来保存 `DSLContext`。

:::

然后，您可以使用 DSLContext 构建查询，如以下示例所示：

::: code-tabs#language
@tab Java

```java
public List<GregorianCalendar> authorsBornAfter1980() {
    return this.create.selectFrom(AUTHOR)
            .where(AUTHOR.DATE_OF_BIRTH.greaterThan(new GregorianCalendar(1980, 0, 1)))
            .fetch(AUTHOR.DATE_OF_BIRTH);
}
```



@tab Kotlin

```kotlin
fun authorsBornAfter1980(): List<GregorianCalendar> {
    return create.selectFrom<Tables.TAuthorRecord>(Tables.AUTHOR)
        .where(Tables.AUTHOR?.DATE_OF_BIRTH?.greaterThan(GregorianCalendar(1980, 0, 1)))
        .fetch(Tables.AUTHOR?.DATE_OF_BIRTH)
}
```



:::

#### 1.6.3 jOOQ SQL 方言

除非已配置 `spring.jooq.sql-dialect` 属性，否则 Spring Boot 会确定要用于数据源的 SQL 方言。 如果 Spring Boot 无法检测到方言，它会使用 `DEFAULT`。

::: info 信息

Spring Boot 只能自动配置开源版本的 `jOOQ` 支持的方言。

:::

#### 1.6.4 定制化 jOOQ

可以通过定义您自己的 `DefaultConfigurationCustomizer` bean 来实现更高级的自定义，该 bean 将在创建 `org.jooq.Configuration` `@Bean` 之前调用。 这优先于自动配置应用的任何内容。 

如果你想完全控制 jOOQ 配置，你也可以创建自己的 `org.jooq.Configuration` `@Bean`。

### 1.7 使用 R2DBC

响应式关系数据库连接 ([`R2DBC`](https://r2dbc.io/)) 项目将反应式编程 API 引入关系数据库。 `R2DBC` 的 `io.r2dbc.spi.Connection` 提供了一种使用非阻塞数据库连接的标准方法。 连接是通过使用 `ConnectionFactory` 提供的，类似于带有 jdbc 的数据源。 

`ConnectionFactory` 配置由 `spring.r2dbc.*` 中的外部配置属性控制。 例如，您可以在 `application.properties` 中声明以下部分：

::: code-tabs#language
@tab Properties

```properties
spring.r2dbc.url=r2dbc:postgresql://localhost/test
spring.r2dbc.username=dbuser
spring.r2dbc.password=dbpass
```



@tab Yaml

```yaml
spring:
  r2dbc:
    url: "r2dbc:postgresql://localhost/test"
    username: "dbuser"
    password: "dbpass"
```



:::

::: tip 提示

您不需要指定驱动程序类名，因为 Spring Boot 从 R2DBC 的连接工厂发现中获取驱动程序。

:::

::: info 信息

至少应该提供网址。 URL 中指定的信息优先于个别属性，即`名称`、`用户名`、`密码`和池选项。

:::

::: tip 提示

“操作方法”部分包括有关 [如何初始化数据库的部分](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.using-basic-sql-scripts)。

:::

::: code-tabs#language
@tab Java

```java
import io.r2dbc.spi.ConnectionFactoryOptions;

import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyR2dbcConfiguration {

    @Bean
    public ConnectionFactoryOptionsBuilderCustomizer connectionFactoryPortCustomizer() {
        return (builder) -> builder.option(ConnectionFactoryOptions.PORT, 5432);
    }

}
```



@tab Kotlin

```kotlin
import io.r2dbc.spi.ConnectionFactoryOptions
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyR2dbcConfiguration {

    @Bean
    fun connectionFactoryPortCustomizer(): ConnectionFactoryOptionsBuilderCustomizer {
        return ConnectionFactoryOptionsBuilderCustomizer { builder ->
            builder.option(ConnectionFactoryOptions.PORT, 5432)
        }
    }

}
```



:::

以下示例显示如何设置一些 PostgreSQL 连接选项：

::: code-tabs#language
@tab Java

```java
import java.util.HashMap;
import java.util.Map;

import io.r2dbc.postgresql.PostgresqlConnectionFactoryProvider;

import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyPostgresR2dbcConfiguration {

    @Bean
    public ConnectionFactoryOptionsBuilderCustomizer postgresCustomizer() {
        Map<String, String> options = new HashMap<>();
        options.put("lock_timeout", "30s");
        options.put("statement_timeout", "60s");
        return (builder) -> builder.option(PostgresqlConnectionFactoryProvider.OPTIONS, options);
    }

}
```



@tab Kotlin

```kotlin
import io.r2dbc.postgresql.PostgresqlConnectionFactoryProvider
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyPostgresR2dbcConfiguration {

    @Bean
    fun postgresCustomizer(): ConnectionFactoryOptionsBuilderCustomizer {
        val options: MutableMap<String, String> = HashMap()
        options["lock_timeout"] = "30s"
        options["statement_timeout"] = "60s"
        return ConnectionFactoryOptionsBuilderCustomizer { builder ->
            builder.option(PostgresqlConnectionFactoryProvider.OPTIONS, options)
        }
    }

}
```



:::

当 `ConnectionFactory` bean 可用时，常规的 `JDBC DataSource` 自动配置将退出。 如果您想保留 `JDBC DataSource` 自动配置，并且对在反应式应用程序中使用阻塞 JDBC API 的风险感到满意，请在应用程序的 `@Configuration` 类上添加 `@Import(DataSourceAutoConfiguration.class)` 以重新启用它 .

#### 1.7.1 嵌入式数据库支持

与 [JDBC 支持](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#data.sql.datasource.embedded)类似，Spring Boot 可以自动配置嵌入式数据库以用于响应式使用。 您无需提供任何连接 URL。 您只需要包含对要使用的嵌入式数据库的构建依赖项，如以下示例所示：

```xml
<dependency>
    <groupId>io.r2dbc</groupId>
    <artifactId>r2dbc-h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

::: info 信息

如果您在测试中使用此功能，您可能会注意到，无论您使用多少应用程序上下文，整个测试套件都会重复使用同一个数据库。 如果您想确保每个上下文都有一个单独的嵌入式数据库，您应该将 `spring.r2dbc.generate-unique-name` 设置为 `true`。

:::

#### 1.7.2 使用DatabaseClient

`DatabaseClient` bean 是自动配置的，您可以将它直接`@Autowire` 到您自己的 bean 中，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import java.util.Map;

import reactor.core.publisher.Flux;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final DatabaseClient databaseClient;

    public MyBean(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    public Flux<Map<String, Object>> someMethod() {
        return this.databaseClient.sql("select * from user").fetch().all();
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

@Component
class MyBean(private val databaseClient: DatabaseClient) {

    fun someMethod(): Flux<Map<String, Any>> {
        return databaseClient.sql("select * from user").fetch().all()
    }

}
```



:::

#### 1.7.3 Spring Data R2DBC 存储库

[Spring Data R2DBC](https://spring.io/projects/spring-data-r2dbc) 存储库是您可以定义以访问数据的接口。 查询是根据您的方法名称自动创建的。 例如，CityRepository 接口可能会声明一个 findAllByState(String state) 方法来查找给定状态下的所有城市。 

对于更复杂的查询，您可以使用 Spring Data 的[查询](https://docs.spring.io/spring-data/r2dbc/docs/3.0.3/api/org/springframework/data/r2dbc/repository/Query.html)注解来注解您的方法。

Spring Data 存储库通常从 [Repository](https://docs.spring.io/spring-data/commons/docs/3.0.3/api/org/springframework/data/repository/Repository.html) 或 [CrudRepository](https://docs.spring.io/spring-data/commons/docs/3.0.3/api/org/springframework/data/repository/CrudRepository.html) 接口扩展。 如果您使用自动配置，则会从包含您的主要配置类（用@EnableAutoConfiguration 或@SpringBootApplication 注释的那个）的包中向下搜索存储库。 

以下示例显示了典型的 Spring Data 存储库接口定义：

::: code-tabs#language
@tab Java

```java
import reactor.core.publisher.Mono;

import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

    Mono<City> findByNameAndStateAllIgnoringCase(String name, String state);

}
```



@tab Kotlin

```kotlin
import org.springframework.data.repository.Repository
import reactor.core.publisher.Mono

interface CityRepository : Repository<City?, Long?> {

    fun findByNameAndStateAllIgnoringCase(name: String?, state: String?): Mono<City?>?

}
```



:::

::: tip 提示

我们仅仅触及了 Spring Data R2DBC 的皮毛。 有关完整的详细信息，请参阅 [Spring Data R2DBC 参考文档](https://docs.spring.io/spring-data/r2dbc/docs/3.0.3/reference/html/)。

:::

## 2. 使用 NoSQL 技术 

Spring Data 提供了额外的项目来帮助您访问各种 NoSQL 技术，包括：

- [MongoDB](https://spring.io/projects/spring-data-mongodb)
- [Neo4J](https://spring.io/projects/spring-data-neo4j)
- [Elasticsearch](https://spring.io/projects/spring-data-elasticsearch)
- [Redis](https://spring.io/projects/spring-data-redis)
- [GemFire](https://spring.io/projects/spring-data-gemfire) 和 [Geode](https://spring.io/projects/spring-data-geode)
- [Cassandra](https://spring.io/projects/spring-data-cassandra)
- [Couchbase](https://spring.io/projects/spring-data-couchbase)
- [LDAP](https://spring.io/projects/spring-data-ldap)

Spring Boot 为 Redis、MongoDB、Neo4j、Elasticsearch、Cassandra、Couchbase、LDAP 和 InfluxDB 提供自动配置。 此外，[Apache Geode 的 Spring Boot](https://github.com/spring-projects/spring-boot-data-geode) 为 [Apache Geode 提供了自动配置](https://docs.spring.io/spring-boot-data-geode-build/2.0.x/reference/html5/#geode-repositories)。 您可以使用其他项目，但必须自己配置它们。 请参阅 [spring.io/projects/spring-data](https://spring.io/projects/spring-data) 上的相应参考文档。

### 2.1 Redis

[Redis](https://redis.io/) 是一个缓存、消息代理和功能丰富的键值存储。 Spring Boot 为 [Lettuce](https://github.com/lettuce-io/lettuce-core/) 和 [Jedis](https://github.com/xetorthio/jedis/) 客户端库以及 [Spring Data Redis](https://github.com/spring-projects/spring-data-redis) 提供的基于它们的抽象提供了基本的自动配置。 

有一个 `spring-boot-starter-data-redis` “Starter” 用于以方便的方式收集依赖项。 默认情况下，它使用 [Lettuce](https://github.com/lettuce-io/lettuce-core/)。 该启动器可以处理传统应用程序和响应式应用程序。

::: tip 提示

我们还提供了一个 `spring-boot-starter-data-redis-reactive` “Starter”，以与其他具有反应支持的存储保持一致。

:::

#### 2.1.1 连接到 Redis

您可以像注入任何其他 Spring Bean 一样注入自动配置的 `RedisConnectionFactory`、`StringRedisTemplate` 或 vanilla `RedisTemplate` 实例。 以下清单显示了此类 bean 的示例：

::: code-tabs#language
@tab Java

```java
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final StringRedisTemplate template;

    public MyBean(StringRedisTemplate template) {
        this.template = template;
    }

    public Boolean someMethod() {
        return this.template.hasKey("spring");
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: StringRedisTemplate) {

    fun someMethod(): Boolean {
        return template.hasKey("spring")
    }

}
```



:::

默认情况下，该实例会尝试连接到位于 `localhost:6379` 的 Redis 服务器。 您可以使用 `spring.data.redis.*` 属性指定自定义连接详细信息，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.database=0
spring.data.redis.username=user
spring.data.redis.password=secret
```



@tab Yaml

```yaml
spring:
  data:
    redis:
      host: "localhost"
      port: 6379
      database: 0
      username: "user"
      password: "secret"
```



:::

::: tip 提示

您还可以注册任意数量的 bean，这些 bean 实现 `LettuceClientConfigurationBuilderCustomizer` 以进行更高级的自定义。 也可以使用 `ClientResourcesBuilderCustomizer` 自定义 `ClientResources`。 如果您使用 Jedis，也可以使用 `JedisClientConfigurationBuilderCustomizer`。 或者，您可以注册 RedisStandaloneConfiguration、`RedisSentinelConfiguration` 或 `RedisClusterConfiguration` 类型的 bean 以完全控制配置。

:::

如果您添加自己的任何自动配置类型的@Bean，它将替换默认值（`RedisTemplate` 除外，当排除基于 bean 名称、`redisTemplate` 而不是其类型时）。 

默认情况下，如果 `commons-pool2` 在类路径上，则池连接工厂是自动配置的。

### 2.2 MongoDB

[MongoDB](https://www.mongodb.com/) 是一个开源 NoSQL 文档数据库，它使用类似 JSON 的模式而不是传统的基于表的关系数据。 Spring Boot 为使用 MongoDB 提供了多种便利，包括 `spring-boot-starter-data-mongodb` 和 `spring-boot-starter-data-mongodb-reactive` “Starters”。

#### 2.2.1 连接到 MongoDB

要访问 MongoDB 数据库，您可以注入一个自动配置的 `org.springframework.data.mongodb.MongoDatabaseFactory`。 默认情况下，该实例会尝试连接到位于 `mongodb://localhost/test` 的 MongoDB 服务器。 以下示例显示如何连接到 MongoDB 数据库：

::: code-tabs#language
@tab Java

```java
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final MongoDatabaseFactory mongo;

    public MyBean(MongoDatabaseFactory mongo) {
        this.mongo = mongo;
    }

    public MongoCollection<Document> someMethod() {
        MongoDatabase db = this.mongo.getMongoDatabase();
        return db.getCollection("users");
    }

}
```



@tab Kotlin

```kotlin
import com.mongodb.client.MongoCollection
import org.bson.Document
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.stereotype.Component

@Component
class MyBean(private val mongo: MongoDatabaseFactory) {

    fun someMethod(): MongoCollection<Document> {
        val db = mongo.mongoDatabase
        return db.getCollection("users")
    }

}
```



:::

如果您定义了自己的 `MongoClient`，它将用于自动配置合适的 `MongoDatabaseFactory`。 

自动配置的 MongoClient 是使用 `MongoClientSettings` bean 创建的。 如果您定义了自己的 `MongoClientSettings`，它将不加修改地使用，并且 `spring.data.mongodb` 属性将被忽略。 否则，`MongoClientSettings` 将自动配置，并将应用 `spring.data.mongodb` 属性。 在任何一种情况下，您都可以声明一个或多个 `MongoClientSettingsBuilderCustomizer` beans 以微调 `MongoClientSettings` 配置。 每个将按顺序调用用于构建 `MongoClientSettings` 的 `MongoClientSettings.Builder`。

您可以设置 `spring.data.mongodb.uri` 属性来更改 URL 并配置其他设置，例如副本集，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.data.mongodb.uri=mongodb://user:secret@mongoserver1.example.com:27017,mongoserver2.example.com:23456/test
```



@tab Yaml

```yaml
spring:
  data:
    mongodb:
      uri: "mongodb://user:secret@mongoserver1.example.com:27017,mongoserver2.example.com:23456/test"
```



:::

或者，您可以使用离散属性指定连接详细信息。 例如，您可以在 `application.properties` 中声明以下设置：

::: code-tabs#language
@tab Properties

```properties
spring.data.mongodb.host=mongoserver1.example.com
spring.data.mongodb.port=27017
spring.data.mongodb.additional-hosts[0]=mongoserver2.example.com:23456
spring.data.mongodb.database=test
spring.data.mongodb.username=user
spring.data.mongodb.password=secret
```



@tab Yaml

```yaml
spring:
  data:
    mongodb:
      host: "mongoserver1.example.com"
      port: 27017
      additional-hosts:
      - "mongoserver2.example.com:23456"
      database: "test"
      username: "user"
      password: "secret"
```



:::

::: tip 提示

如果未指定 `spring.data.mongodb.port`，则使用默认值 `27017`。 您可以从前面显示的示例中删除此行。 

您还可以使用 `host:port` 语法将端口指定为主机地址的一部分。 如果您需要更改附加主机条目的端口，则应使用此格式。

:::

::: tip 提示

如果不使用 `Spring Data MongoDB`，则可以注入 `MongoClient` bean 而不是使用 `MongoDatabaseFactory`。 如果您想完全控制建立 `MongoDB` 连接，您还可以声明您自己的 `MongoDatabaseFactory` 或 `MongoClient` bean。

:::

::: info 信息

如果您使用的是响应式驱动程序，则 SSL 需要 Netty。 如果 `Netty` 可用并且尚未自定义要使用的工厂，则自动配置会自动配置此工厂。

:::

#### 2.2.2 MongoTemplate

[`Spring Data MongoDB`](https://spring.io/projects/spring-data-mongodb) 提供了一个 [MongoTemplate](https://docs.spring.io/spring-data/mongodb/docs/4.0.3/api/org/springframework/data/mongodb/core/MongoTemplate.html) 类，其设计与 Spring 的 JdbcTemplate 非常相似。 与 JdbcTemplate 一样，Spring Boot 会自动配置一个 bean 供您注入模板，如下所示：

::: code-tabs#language
@tab Java

```java
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final MongoTemplate mongoTemplate;

    public MyBean(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public MongoCollection<Document> someMethod() {
        return this.mongoTemplate.getCollection("users");
    }

}
```



@tab Kotlin

```kotlin
import com.mongodb.client.MongoCollection
import org.bson.Document
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val mongoTemplate: MongoTemplate) {

    fun someMethod(): MongoCollection<Document> {
        return mongoTemplate.getCollection("users")
    }

}
```



:::

有关完整详细信息，请参阅 [MongoOperations Javadoc](https://docs.spring.io/spring-data/mongodb/docs/4.0.3/api/org/springframework/data/mongodb/core/MongoOperations.html)。

#### 2.2.3 Spring Data MongoDB 存储库

Spring Data 包括对 MongoDB 的存储库支持。 与前面讨论的 JPA 存储库一样，基本原则是查询是根据方法名称自动构造的。

事实上，Spring Data JPA 和 Spring Data MongoDB 共享相同的公共基础设施。 您可以使用前面的 JPA 示例，假设 City 现在是 MongoDB 数据类而不是 JPA @Entity，它的工作方式相同，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

    Page<City> findAll(Pageable pageable);

    City findByNameAndStateAllIgnoringCase(String name, String state);

}
```



@tab Kotlin

```kotlin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository

interface CityRepository :
    Repository<City?, Long?> {
    fun findAll(pageable: Pageable?): Page<City?>?
    fun findByNameAndStateAllIgnoringCase(name: String?, state: String?): City?
}
```



:::

::: tip 提示

您可以使用`@EntityScan` 注释自定义文档扫描位置。

:::

::: tip 提示

有关 Spring Data MongoDB 的完整详细信息，包括其丰富的对象映射技术，请参阅[其参考文档](https://spring.io/projects/spring-data-mongodb)。

:::





### 2.3 Neo4j

[`Neo4j`](https://neo4j.com/) 是一个开源的 NoSQL 图形数据库，它使用由一级关系连接的节点的丰富数据模型，比传统的 RDBMS 方法更适合连接的大数据。 Spring Boot 为使用 Neo4j 提供了多种便利，包括 `spring-boot-starter-data-neo4j` “Starter”。

#### 2.3.1 连接到 Neo4j 数据库

要访问 Neo4j 服务器，您可以注入一个自动配置的 `org.neo4j.driver.Driver`。 默认情况下，实例会尝试使用 Bolt 协议连接到位于 `localhost:7687` 的 `Neo4j` 服务器。 以下示例显示了如何注入 `Neo4j` 驱动程序，使您可以访问 Session 等：

::: code-tabs#language
@tab Java

```java
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;

import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final Driver driver;

    public MyBean(Driver driver) {
        this.driver = driver;
    }

    public String someMethod(String message) {
        try (Session session = this.driver.session()) {
            return session.executeWrite(
                    (transaction) -> transaction
                        .run("CREATE (a:Greeting) SET a.message = $message RETURN a.message + ', from node ' + id(a)",
                                Values.parameters("message", message))
                        .single()
                        .get(0)
                        .asString());
        }
    }

}
```



@tab Kotlin

```kotlin
import org.neo4j.driver.*
import org.springframework.stereotype.Component

@Component
class MyBean(private val driver: Driver) {

    fun someMethod(message: String?): String {
        driver.session().use { session ->
            return@someMethod session.executeWrite { transaction: TransactionContext ->
                transaction
                    .run(
                        "CREATE (a:Greeting) SET a.message = \$message RETURN a.message + ', from node ' + id(a)",
                        Values.parameters("message", message)
                    )
                    .single()[0].asString()
            }
        }
    }

}
```



:::

您可以使用 `spring.neo4j.*` 属性配置驱动程序的各个方面。 以下示例显示了如何配置要使用的 uri 和凭据：

::: code-tabs#language
@tab Properties

```properties
spring.neo4j.uri=bolt://my-server:7687
spring.neo4j.authentication.username=neo4j
spring.neo4j.authentication.password=secret
```



@tab Yaml

```yaml
spring:
  neo4j:
    uri: "bolt://my-server:7687"
    authentication:
      username: "neo4j"
      password: "secret"
```



:::

自动配置的驱动程序是使用 `ConfigBuilder` 创建的。 要微调其配置，请声明一个或多个 `ConfigBuilderCustomizer` bean。 每个将与用于构建驱动程序的 `ConfigBuilder` 一起按顺序调用。

#### 2.3.2 Spring Data Neo4j 存储库

`Spring Data` 包括对 Neo4j 的存储库支持。 有关 `Spring Data Neo4j` 的完整详细信息，请参阅参考文档。 与许多其他 `Spring Data` 模块一样，`Spring Data Neo4j` 与 `Spring Data JPA` 共享公共基础设施。 您可以采用之前的 JPA 示例并将 City 定义为 `Spring Data Neo4j` `@Node` 而不是 JPA `@Entity`，并且存储库抽象以相同的方式工作，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface CityRepository extends Neo4jRepository<City, Long> {

    Optional<City> findOneByNameAndState(String name, String state);

}
```



@tab Kotlin

```kotlin
import org.springframework.data.neo4j.repository.Neo4jRepository
import java.util.Optional

interface CityRepository : Neo4jRepository<City?, Long?> {

    fun findOneByNameAndState(name: String?, state: String?): Optional<City?>?

}
```



:::

`spring-boot-starter-data-neo4j` “Starter” 支持存储库支持和事务管理。 Spring Boot 支持经典和反应式 `Neo4j` 存储库，使用 `Neo4jTemplate` 或 `ReactiveNeo4jTemplate` bean。 当 Project Reactor 在类路径上可用时，反应式样式也会自动配置。 

您可以分别在 `@Configuration`-bean 上使用 `@EnableNeo4jRepositories` 和 `@EntityScan` 来自定义查找存储库和实体的位置。

::: info 信息

在使用反应式风格的应用程序中，`ReactiveTransactionManager` 不是自动配置的。 要启用事务管理，必须在您的配置中定义以下 bean：

::: code-tabs#language
@tab Java

```java
import org.neo4j.driver.Driver;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.ReactiveDatabaseSelectionProvider;
import org.springframework.data.neo4j.core.transaction.ReactiveNeo4jTransactionManager;

@Configuration(proxyBeanMethods = false)
public class MyNeo4jConfiguration {

    @Bean
    public ReactiveNeo4jTransactionManager reactiveTransactionManager(Driver driver,
            ReactiveDatabaseSelectionProvider databaseNameProvider) {
        return new ReactiveNeo4jTransactionManager(driver, databaseNameProvider);
    }

}
```



@tab Kotlin

```kotlin
import org.neo4j.driver.Driver
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.neo4j.core.ReactiveDatabaseSelectionProvider
import org.springframework.data.neo4j.core.transaction.ReactiveNeo4jTransactionManager

@Configuration(proxyBeanMethods = false)
class MyNeo4jConfiguration {

    @Bean
    fun reactiveTransactionManager(driver: Driver,
            databaseNameProvider: ReactiveDatabaseSelectionProvider): ReactiveNeo4jTransactionManager {
        return ReactiveNeo4jTransactionManager(driver, databaseNameProvider)
    }
}
```



:::

:::

### 2.4 Elasticsearch

[Elasticsearch](https://www.elastic.co/products/elasticsearch) 是一个开源、分布式、RESTful 搜索和分析引擎。 Spring Boot 为 Elasticsearch 客户端提供基本的自动配置。

Spring Boot 支持多种客户端： 

- 官方低级 REST 客户端 
- 官方 Java API 客户端 

`Spring Data Elasticsearch` 提供的 `ReactiveElasticsearchClient` Spring Boot 提供了一个专用的“Starter”，`spring-boot-starter-data-elasticsearch`。

#### 2.4.1 使用 REST 客户端连接到 Elasticsearch

Elasticsearch 提供了两种不同的 REST 客户端，您可以使用它们来查询集群：来自 `org.elasticsearch.client:elasticsearch-rest-client` 模块的[低级客户端](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/java-rest-low.html)和来自 co.elastic.clients:elasticsearch-java 的 [Java API 客户端](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/index.html) 模块。 此外，Spring Boot 还为来自 `org.springframework.data:spring-data-elasticsearch` 模块的反应式客户端提供支持。 默认情况下，客户端将以 [`localhost:9200`](http://localhost:9200/) 为目标。 您可以使用 `spring.elasticsearch.*` 属性进一步调整客户端的配置方式，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.elasticsearch.uris=https://search.example.com:9200
spring.elasticsearch.socket-timeout=10s
spring.elasticsearch.username=user
spring.elasticsearch.password=secret
```



@tab Yaml

```yaml
spring:
  elasticsearch:
    uris: "https://search.example.com:9200"
    socket-timeout: "10s"
    username: "user"
    password: "secret"
```



:::

##### 使用 RestClient 连接到 Elasticsearch

如果类路径上有 `elasticsearch-rest-client`，Spring Boot 将自动配置并注册一个 `RestClient` bean。 除了前面描述的属性之外，要微调 `RestClient`，您可以注册任意数量的 bean，这些 bean 实现 `RestClientBuilderCustomizer` 以进行更高级的自定义。 要完全控制客户端的配置，请定义一个 `RestClientBuilder` bean。 

此外，如果 `elasticsearch-rest-client-sniffer` 在类路径上，则会自动配置 Sniffer 以自动从正在运行的 `Elasticsearch` 集群中发现节点并将它们设置在 `RestClient` bean 上。 您可以进一步调整 Sniffer 的配置方式，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.elasticsearch.restclient.sniffer.interval=10m
spring.elasticsearch.restclient.sniffer.delay-after-failure=30s
```



@tab Yaml

```yaml
spring:
  elasticsearch:
    restclient:
      sniffer:
        interval: "10m"
        delay-after-failure: "30s"
```



:::

##### 使用 ElasticsearchClient 连接到 Elasticsearch

如果类路径上有 `co.elastic.clients:elasticsearch-java`，Spring Boot 将自动配置并注册一个 ElasticsearchClient bean。 

`ElasticsearchClient` 使用依赖于前面描述的 RestClient 的传输。 因此，前面描述的属性可用于配置 `ElasticsearchClient`。 此外，您可以定义一个 `TransportOptions` bean 以进一步控制传输行为。

##### 使用 ReactiveElasticsearchClient 连接到 Elasticsearch

[`Spring Data Elasticsearch`](https://spring.io/projects/spring-data-elasticsearch) 提供了 `ReactiveElasticsearchClient` 用于以反应方式查询 `Elasticsearch` 实例。 如果类路径上有 `Spring Data Elasticsearch` 和 `Reactor`，Spring Boot 将自动配置并注册 `ReactiveElasticsearchClient`。

`ReactiveElasticsearchclient` 使用依赖于前面描述的 RestClient 的传输。 因此，前面描述的属性可用于配置 `ReactiveElasticsearchClient`。 此外，您可以定义一个 `TransportOptions` bean 以进一步控制传输行为。

#### 2.4.2 使用 Spring Data 连接到 Elasticsearch

要连接到 `Elasticsearch`，必须定义 `ElasticsearchClient` bean，由 Spring Boot 自动配置或由应用程序手动提供（请参阅前面的部分）。 有了这个配置，一个 `ElasticsearchTemplate` 可以像任何其他 Spring bean 一样被注入，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final ElasticsearchTemplate template;

    public MyBean(ElasticsearchTemplate template) {
        this.template = template;
    }

    public boolean someMethod(String id) {
        return this.template.exists(id, User.class);
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: org.springframework.data.elasticsearch.client.erhlc.ElasticsearchRestTemplate ) {

    fun someMethod(id: String): Boolean {
        return template.exists(id, User::class.java)
    }

}
```



:::

在 `spring-data-elasticsearch` 和 `Reactor` 存在的情况下，Spring Boot 还可以自动配置一个 [`ReactiveElasticsearchClient`](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#data.nosql.elasticsearch.connecting-using-rest.reactiveclient) 和一个 `ReactiveElasticsearchTemplate` 作为 beans。 它们是其他 REST 客户端的反应式等价物。

#### 2.4.3 Spring Data Elasticsearch 存储库

Spring Data 包括对 Elasticsearch 的存储库支持。 与前面讨论的 JPA 存储库一样，基本原则是查询是根据方法名称自动为您构建的。

事实上，Spring Data JPA 和 `Spring Data Elasticsearch` 共享相同的公共基础设施。 您可以使用之前的 JPA 示例，假设 `City` 现在是 `Elasticsearch` @Document 类而不是 JPA `@Entity`，它的工作方式相同。

::: tip 提示

有关 Spring Data Elasticsearch 的完整详细信息，请参阅[参考文档](https://docs.spring.io/spring-data/elasticsearch/docs/current/reference/html/)。

:::

Spring Boot 支持经典和反应式 Elasticsearch 存储库，使用 `ElasticsearchRestTemplate` 或 `ReactiveElasticsearchTemplate` beans。 鉴于存在所需的依赖项，这些 bean 很可能是由 Spring Boot 自动配置的。 

如果您希望使用自己的模板来支持 `Elasticsearch` 存储库，您可以添加自己的 `ElasticsearchRestTemplate` 或 `ElasticsearchOperations` `@Bean`，只要将其命名为`“elasticsearchTemplate”`即可。 同样适用于 `ReactiveElasticsearchTemplate` 和 `ReactiveElasticsearchOperations`，bean 名称为“reactiveElasticsearchTemplate”。 

您可以选择使用以下属性禁用存储库支持：

::: code-tabs#language
@tab Properties

```properties
spring.data.elasticsearch.repositories.enabled=false
```



@tab Yaml

```yaml
spring:
  data:
    elasticsearch:
      repositories:
        enabled: false
```



:::



### 2.5 Cassandra

[Cassandra](https://cassandra.apache.org/) 是一种开源的分布式数据库管理系统，旨在处理许多商用服务器上的大量数据。 Spring Boot 为 Cassandra 和 [Spring Data Cassandra](https://github.com/spring-projects/spring-data-cassandra) 提供的抽象提供了自动配置。 有一个 `spring-boot-starter-data-cassandra` “Starter” 用于以方便的方式收集依赖项。

#### 2.5.1 连接到 Cassandra

您可以像注入任何其他 Spring Bean 一样注入自动配置的 `CassandraTemplate` 或 Cassandra CqlSession 实例。 `spring.cassandra.*` 属性可用于自定义连接。 通常，您提供键空间名称和联系点以及本地数据中心名称，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1:9042,cassandrahost2:9042
spring.cassandra.local-datacenter=datacenter1
```

@tab Yaml

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1:9042,cassandrahost2:9042"
    local-datacenter: "datacenter1"
```

:::

如果所有联系点的端口都相同，您可以使用快捷方式并仅指定主机名，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1,cassandrahost2
spring.cassandra.local-datacenter=datacenter1
```

@tab Yaml

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1,cassandrahost2"
    local-datacenter: "datacenter1"
```

:::

::: tip 提示

这两个示例相同，因为端口默认为 `9042`。如果需要配置端口，请使用 `spring.cassandra.port`。

:::

::: info 注意

Cassandra 驱动程序有自己的配置基础结构，可在类路径的根目录加载 application.conf。

默认情况下，Spring Boot 不会查找此类文件，但可以使用 `spring.cassandra.config` 加载一个文件。 如果一个属性同时存在于 `spring.cassandra.*` 和配置文件中，则 `spring.cassandra.*` 中的值优先。 

对于更高级的驱动程序自定义，您可以注册任意数量的实现 `DriverConfigLoaderBuilderCustomizer` 的 bean。 可以使用 `CqlSessionBuilderCustomizer` 类型的 bean 自定义 CqlSession。

:::

::: info 注意

如果您使用 `CqlSessionBuilder` 创建多个 `CqlSession` beans，请记住构建器是可变的，因此请确保为每个会话注入一个新副本。

:::

以下代码清单显示了如何注入 Cassandra bean：

::: code-tabs#language
@tab Java

```java
import org.springframework.data.cassandra.core.CassandraTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final CassandraTemplate template;

    public MyBean(CassandraTemplate template) {
        this.template = template;
    }

    public long someMethod() {
        return this.template.count(User.class);
    }

}
```

@tab kotlin

```kotlin
import org.springframework.data.cassandra.core.CassandraTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: CassandraTemplate) {

    fun someMethod(): Long {
        return template.count(User::class.java)
    }

}
```

:::

如果您添加自己的 `CassandraTemplate` 类型的 @Bean，它将替换默认值。

#### 2.5.2 Spring Data Cassandra 存储库

Spring Data 包括对 Cassandra 的基本存储库支持。 目前，这比前面讨论的 JPA 存储库更受限制，并且需要 @Query 注释的查找器方法。

::: tip 提示

有关 Spring Data Cassandra 的完整详细信息，请参阅 [参考文档](https://docs.spring.io/spring-data/cassandra/docs/)。

:::





### 2.6 Couchbase

[Couchbase](https://www.couchbase.com/) 是一个开源、分布式、多模型的 NoSQL 面向文档的数据库，针对交互式应用程序进行了优化。 `Spring Boot` 为 `Couchbase` 和 [Spring Data Couchbase](https://github.com/spring-projects/spring-data-couchbase) 提供的抽象提供了自动配置。 有 `spring-boot-starter-data-couchbase` 和 `spring-boot-starter-data-couchbase-reactive` “Starters”，用于以方便的方式收集依赖项。

#### 2.6.1 连接到 Couchbase

您可以通过添加 Couchbase SDK 和一些配置来获得集群。 `spring.couchbase.*` 属性可用于自定义连接。 通常，您提供[连接字符串](https://github.com/couchbaselabs/sdk-rfcs/blob/master/rfc/0011-connection-string.md)、用户名和密码，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.couchbase.connection-string=couchbase://192.168.1.123
spring.couchbase.username=user
spring.couchbase.password=secret
```

@tab Yaml

```yaml
spring:
  couchbase:
    connection-string: "couchbase://192.168.1.123"
    username: "user"
    password: "secret"
```

:::

也可以自定义一些 `ClusterEnvironment` 设置。 例如，以下配置更改了打开新 `Bucket` 的超时时间并启用了 SSL 支持：

::: code-tabs#language
@tab Properties

```properties
spring.couchbase.env.timeouts.connect=3s
spring.couchbase.env.ssl.key-store=/location/of/keystore.jks
spring.couchbase.env.ssl.key-store-password=secret
```

@tab Yaml

```yaml
spring:
  couchbase:
    env:
      timeouts:
        connect: "3s"
      ssl:
        key-store: "/location/of/keystore.jks"
        key-store-password: "secret"
```

:::

::: tip 提示

检查 `spring.couchbase.env.*` 属性以获取更多详细信息。 要获得更多控制，可以使用一个或多个 `ClusterEnvironmentBuilderCustomizer` bean。

:::

#### 2.6.2 Spring Data Couchbase 存储库

Spring Data 包括对 Couchbase 的存储库支持。 有关 Spring Data Couchbase 的完整详细信息，请参阅[参考文档](https://docs.spring.io/spring-data/couchbase/docs/5.0.3/reference/html/)。

如果 `CouchbaseClientFactory` bean 可用，您可以像注入任何其他 Spring Bean 一样注入自动配置的 `CouchbaseTemplate` 实例。 如上所述，当集群可用时会发生这种情况，并且已指定存储桶名称：

::: code-tabs#language
@tab Properties

```properties
spring.data.couchbase.bucket-name=my-bucket
```

@tab Yaml

```yaml
spring:
  data:
    couchbase:
      bucket-name: "my-bucket"
```

:::

以下示例显示了如何注入 CouchbaseTemplate bean：

::: code-tabs#language
@tab Java

```java
import org.springframework.data.couchbase.core.CouchbaseTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final CouchbaseTemplate template;

    public MyBean(CouchbaseTemplate template) {
        this.template = template;
    }

    public String someMethod() {
        return this.template.getBucketName();
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.data.couchbase.core.CouchbaseTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: CouchbaseTemplate) {

    fun someMethod(): String {
        return template.bucketName
    }

}
```

:::

您可以在自己的配置中定义一些 bean 来覆盖自动配置提供的那些 bean：

- 名称为 `couchbaseMappingContext` 的 `CouchbaseMappingContext` @Bean。 
- 一个名为 `couchbaseCustomConversions` 的 `CustomConversions` @Bean。 
- 一个名为 `couchbaseTemplate` 的 `CouchbaseTemplate` @Bean。

为了避免在您自己的配置中对这些名称进行硬编码，您可以重用 `Spring Data Couchbase` 提供的 `BeanNames`。 例如，您可以自定义要使用的转换器，如下所示：

::: code-tabs#language
@tab Java

```java
import org.assertj.core.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.couchbase.config.BeanNames;
import org.springframework.data.couchbase.core.convert.CouchbaseCustomConversions;

@Configuration(proxyBeanMethods = false)
public class MyCouchbaseConfiguration {

    @Bean(BeanNames.COUCHBASE_CUSTOM_CONVERSIONS)
    public CouchbaseCustomConversions myCustomConversions() {
        return new CouchbaseCustomConversions(Arrays.asList(new MyConverter()));
    }

}
```

@tab Kotlin

```kotlin
import org.assertj.core.util.Arrays
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.couchbase.config.BeanNames
import org.springframework.data.couchbase.core.convert.CouchbaseCustomConversions

@Configuration(proxyBeanMethods = false)
class MyCouchbaseConfiguration {

    @Bean(BeanNames.COUCHBASE_CUSTOM_CONVERSIONS)
    fun myCustomConversions(): CouchbaseCustomConversions {
        return CouchbaseCustomConversions(Arrays.asList(MyConverter()))
    }

}
```

:::



### 2.7 LDAP

[LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)（轻量级目录访问协议）是一种开放的、供应商中立的行业标准应用协议，用于通过 IP 网络访问和维护分布式目录信息服务。 Spring Boot 为任何兼容的 LDAP 服务器提供自动配置，并支持来自 [UnboundID](https://ldap.com/unboundid-ldap-sdk-for-java/) 的嵌入式内存中 LDAP 服务器。

LDAP 抽象由 [Spring Data LDAP](https://github.com/spring-projects/spring-data-ldap) 提供。 有一个 spring-boot-starter-data-ldap “Starter” 用于以方便的方式收集依赖项。

#### 2.7.1 连接到 LDAP 服务器

要连接到 LDAP 服务器，请确保声明对 `spring-boot-starter-data-ldap`“Starter”或 spring-ldap-core 的依赖，然后在 `application.properties` 中声明服务器的 URL，如中所示 下面的例子

::: code-tabs#language
@tab Properties

```properties
spring.ldap.urls=ldap://myserver:1235
spring.ldap.username=admin
spring.ldap.password=secret
```

@tab Yaml

```yaml
spring:
  ldap:
    urls: "ldap://myserver:1235"
    username: "admin"
    password: "secret"
```

:::

如果需要自定义连接设置，可以使用 `spring.ldap.base` 和 `spring.ldap.base-environment` 属性。 

`LdapContextSource` 是根据这些设置自动配置的。 如果 `DirContextAuthenticationStrategy` bean 可用，它会关联到自动配置的 `LdapContextSource`。 如果您需要自定义它，例如使用 `PooledContextSource`，您仍然可以注入自动配置的 `LdapContextSource`。 确保将自定义的 `ContextSource` 标记为 `@Primary`，以便自动配置的 `LdapTemplate` 使用它。

#### 2.7.2 Spring Data LDAP 存储库

Spring Data 包括对 LDAP 的存储库支持。 有关 Spring Data LDAP 的完整详细信息，请参阅[参考文档](https://docs.spring.io/spring-data/ldap/docs/1.0.x/reference/html/)。

您还可以像注入任何其他 Spring Bean 一样注入自动配置的 LdapTemplate 实例，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import java.util.List;

import org.springframework.ldap.core.LdapTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final LdapTemplate template;

    public MyBean(LdapTemplate template) {
        this.template = template;
    }

    public List<User> someMethod() {
        return this.template.findAll(User.class);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.ldap.core.LdapTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: LdapTemplate) {

    fun someMethod(): List<User> {
        return template.findAll(User::class.java)
    }

}
```

:::

#### 2.7.3 嵌入式内存 LDAP 服务器

出于测试目的，Spring Boot 支持从 [`UnboundID`](https://ldap.com/unboundid-ldap-sdk-for-java/) 自动配置内存中的 LDAP 服务器。 要配置服务器，请将依赖项添加到 `com.unboundid:unboundid-ldapsdk` 并声明一个 `spring.ldap.embedded.base-dn` 属性，如下所示：

::: code-tabs#language
@tab Properties

```properties
spring.ldap.embedded.base-dn=dc=spring,dc=io
```

@tab Yaml

```yaml
spring:
  ldap:
    embedded:
      base-dn: "dc=spring,dc=io"
```

:::

::: info 注意

可以定义多个 base-dn 值，但是，由于可分辨名称通常包含逗号，因此必须使用正确的符号来定义它们。 

在 yaml 文件中，您可以使用 yaml 列表表示法。 在属性文件中，您必须将索引作为属性名称的一部分包含在内：

::: code-tabs#language
@tab Properties

```properties
spring.ldap.embedded.base-dn[0]=dc=spring,dc=io
spring.ldap.embedded.base-dn[1]=dc=vmware,dc=com
```

@tab Yaml

```yaml
spring.ldap.embedded.base-dn:
  - "dc=spring,dc=io"
  - "dc=vmware,dc=com"
```

:::

:::

默认情况下，服务器在随机端口上启动并触发常规 LDAP 支持。 无需指定 `spring.ldap.urls` 属性。 

如果类路径中有 `schema.ldif` 文件，它用于初始化服务器。 如果你想从不同的资源加载初始化脚本，你也可以使用 `spring.ldap.embedded.ldif` 属性。 

默认情况下，标准架构用于验证 LDIF 文件。 您可以通过设置 `spring.ldap.embedded.validation.enabled` 属性来完全关闭验证。 如果您有自定义属性，您可以使用 `spring.ldap.embedded.validation.schema` 来定义您的自定义属性类型或对象类。



### 2.8 InfluxDB

[InfluxDB](https://www.influxdata.com/) 是一个开源时间序列数据库，针对运营监控、应用程序指标、物联网传感器数据和实时分析等领域的时间序列数据的快速、高可用性存储和检索进行了优化。

#### 2.8.1 连接到 InfluxDB

Spring Boot 自动配置一个 InfluxDB 实例，前提是 influxdb-java 客户端在类路径上并且设置了数据库的 URL，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.influx.url=https://172.0.0.1:8086
```

@tab Yaml

```yaml
spring:
  influx:
    url: "https://172.0.0.1:8086"
```

:::

如果连接到 InfluxDB 需要用户和密码，您可以相应地设置 `spring.influx.user` 和 spring.influx.password 属性。 

InfluxDB 依赖于 OkHttp。 如果您需要调整 InfluxDB 在后台使用的 http 客户端，您可以注册一个 `InfluxDbOkHttpClientBuilderProvider` bean。 

如果您需要对配置进行更多控制，请考虑注册一个 `InfluxDbCustomizer` bean。

