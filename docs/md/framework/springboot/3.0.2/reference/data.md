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

`jOOQ` 面向对象查询 (jOOQ) 是 `Data Geekery` 的一款流行产品，它从您的数据库生成 Java 代码，并允许您通过其流畅的 API 构建类型安全的 SQL 查询。 商业版和开源版都可以与 Spring Boot 一起使用。

#### 1.6.1

#### 1.6.2

#### 1.6.3

#### 1.6.4

### 1.7 使用 R2DBC

## 2. 使用 NoSQL 技术 

### 2.1 Redis

### 2.2 MongoDB

### 2.3 Neo4j

### 2.4 Elasticsearch

### 2.5 Cassandra

### 2.6 Couchbase

### 2.7 LDAP

### 2.8 InfluxDB

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

