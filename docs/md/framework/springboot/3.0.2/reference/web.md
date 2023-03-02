# Web

`Spring Boot` 非常适合 Web 应用程序开发。 您可以使用嵌入式 `Tomcat`、`Jetty`、`Undertow` 或 `Netty` 创建独立的 `HTTP` 服务器。 大多数 `Web` 应用程序使用 `spring-boot-starter-web` 模块来快速启动和运行。 您还可以选择使用 `spring-boot-starter-webflux` 模块构建响应式 Web 应用程序。

如果你还没有开发过Spring Boot web应用，可以按照 Hello World! [入门](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html#getting-started.first-application) 部分中的示例。

## 1 Servlet 网络应用程序

如果您想构建基于 `servlet` 的 `Web` 应用程序，您可以利用 `Spring Boot` 的 Spring MVC 或 `Jersey` 自动配置。

### 1.1 Spring Web MVC 框架

[`Spring Web MVC` 框架](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc)（通常称为“`Spring MVC`”）是一个丰富的“模型视图控制器”Web 框架。 `Spring MVC` 允许您创建特殊的 `@Controller` 或 @RestController bean 来处理传入的 HTTP 请求。 控制器中的方法通过使用 `@RequestMapping` 注释映射到 HTTP。

以下代码显示了提供 `JSON` 数据的典型 `@RestController`：

::: code-tabs#language

@tab Java

```java
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class MyRestController {

    private final UserRepository userRepository;

    private final CustomerRepository customerRepository;

    public MyRestController(UserRepository userRepository, CustomerRepository customerRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/{userId}")
    public User getUser(@PathVariable Long userId) {
        return this.userRepository.findById(userId).get();
    }

    @GetMapping("/{userId}/customers")
    public List<Customer> getUserCustomers(@PathVariable Long userId) {
        return this.userRepository.findById(userId).map(this.customerRepository::findByUser).get();
    }

    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        this.userRepository.deleteById(userId);
    }

}
```
@tab kotlin

```kotlin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/users")
class MyRestController(private val userRepository: UserRepository, private val customerRepository: CustomerRepository) {

    @GetMapping("/{userId}")
    fun getUser(@PathVariable userId: Long): User {
        return userRepository.findById(userId).get()
    }

    @GetMapping("/{userId}/customers")
    fun getUserCustomers(@PathVariable userId: Long): List<Customer> {
        return userRepository.findById(userId).map(customerRepository::findByUser).get()
    }

    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: Long) {
        userRepository.deleteById(userId)
    }

}
```
:::

功能变体 `“WebMvc.fn”` 将路由配置与请求的实际处理分开，如下例所示：


::: code-tabs#language

@tab Java

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RequestPredicate;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.web.servlet.function.RequestPredicates.accept;
import static org.springframework.web.servlet.function.RouterFunctions.route;

@Configuration(proxyBeanMethods = false)
public class MyRoutingConfiguration {

    private static final RequestPredicate ACCEPT_JSON = accept(MediaType.APPLICATION_JSON);

    @Bean
    public RouterFunction<ServerResponse> routerFunction(MyUserHandler userHandler) {
        return route()
                .GET("/{user}", ACCEPT_JSON, userHandler::getUser)
                .GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
                .DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
                .build();
    }

}
```
@tab kotlin

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.web.servlet.function.RequestPredicates.accept
import org.springframework.web.servlet.function.RouterFunction
import org.springframework.web.servlet.function.RouterFunctions
import org.springframework.web.servlet.function.ServerResponse

@Configuration(proxyBeanMethods = false)
class MyRoutingConfiguration {

    @Bean
    fun routerFunction(userHandler: MyUserHandler): RouterFunction<ServerResponse> {
        return RouterFunctions.route()
            .GET("/{user}", ACCEPT_JSON, userHandler::getUser)
            .GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
            .DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
            .build()
    }

    companion object {
        private val ACCEPT_JSON = accept(MediaType.APPLICATION_JSON)
    }

}
```
:::

::: code-tabs#language

@tab Java

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

@Component
public class MyUserHandler {

    public ServerResponse getUser(ServerRequest request) {
        ...
        return ServerResponse.ok().build();
    }

    public ServerResponse getUserCustomers(ServerRequest request) {
        ...
        return ServerResponse.ok().build();
    }

    public ServerResponse deleteUser(ServerRequest request) {
        ...
        return ServerResponse.ok().build();
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.servlet.function.ServerRequest
import org.springframework.web.servlet.function.ServerResponse

@Component
class MyUserHandler {

    fun getUser(request: ServerRequest?): ServerResponse {
        return ServerResponse.ok().build()
    }

    fun getUserCustomers(request: ServerRequest?): ServerResponse {
        return ServerResponse.ok().build()
    }

    fun deleteUser(request: ServerRequest?): ServerResponse {
        return ServerResponse.ok().build()
    }

}
```

:::

`Spring MVC` 是核心 `Spring Framework` 的一部分，详细信息可在 [参考文档](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc) 中找到。 在 [`spring.io/guides`](https://spring.io/guides) 上还有一些涵盖 `Spring MVC` 的指南。

::: tip

您可以根据需要定义任意数量的 RouterFunction bean 以模块化路由器的定义。 如果您需要申请优先级，可以订购 Bean。

:::

#### 1.1.1 Spring MVC 自动配置

`Spring Boot` 为 `Spring MVC` 提供自动配置，适用于大多数应用程序。

自动配置在 `Spring` 的默认设置之上添加了以下功能：

- 包括`ContentNegotiatingViewResolver`和`BeanMameViewResolver` Bean。
- 支持服务静态资源，包括对 `WebJars` 的支持（[本文档后面介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#web.servlet.spring-mvc.static-content)）。
- 转换器，通用会员和格式豆的自动注册。
- 支持 `HttpMessageConverters`（[本文档后面介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#web.servlet.spring-mvc.message-converters)）。
- MessageCodesolver的自动注册（[本文档后面介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#web.servlet.spring-mvc.message-codes)）。
- 静态 `index.html` 支持。
- 自动使用可配置的初始化器bean（[本文档后面介绍](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#web.servlet.spring-mvc.binding-initializer)）。

如果您想保留那些 `Spring Boot MVC` 自定义并进行更多 [MVC 自定义](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc)（拦截器、格式化程序、视图控制器和其他功能），您可以添加自己的 `WebMvcConfigurer` 类型的 `@Configuration` 类，但不添加 `@EnableWebMvc`。

如果您想提供 `RequestMappingHandlerMapping`、`RequestMappingHandlerAdapter` 或 `ExceptionHandlerExceptionResolver` 的自定义实例，并且仍然保留 `Spring Boot MVC` 自定义，您可以声明一个 `WebMvcRegistrations` 类型的 bean 并使用它来提供这些组件的自定义实例。

如果你想完全控制 `Spring MVC`，你可以添加你自己的带有`@EnableWebMvc` 注释的`@Configuration`，或者添加你自己的带有`@Configuration` 注释的`DelegatingWebMvcConfiguration`，如`@EnableWebMvc` 的`Javadoc` 中所述。

> `Spring MVC` 使用不同的 `ConversionService` 来转换来自 `application.properties` 或 `application.yaml` 文件的值。 这意味着 `Period`、`Duration` 和 `DataSize` 转换器不可用，`@DurationUnit` 和 `@DataSizeUnit` 注释将被忽略。
>
> 如果您想自定义 `Spring MVC` 使用的 ConversionService，您可以提供一个带有 `addFormatters` 方法的 `WebMvcConfigurer` bean。 通过此方法，您可以注册任何您喜欢的转换器，或者您可以委托给 `ApplicationConversionService` 上可用的静态方法。

#### 1.1.2 HttpMessageConverters

Spring MVC 使用 `HttpMessageConverter` 接口来转换 HTTP 请求和响应。 开箱即用的合理默认值。 例如，对象可以自动转换为 `JSON`（通过使用 Jackson 库）或 XML（通过使用 `Jackson` `XML` 扩展，如果可用，或者如果 `Jackson` `XML` 扩展不可用，则使用 `JAXB`）。 默认情况下，字符串以 UTF-8 编码。

如果需要添加或自定义转换器，可以使用 `Spring Boot` 的 `HttpMessageConverters` 类，如以下清单所示：

::: code-tabs#language

@tab Java

```java
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;

@Configuration(proxyBeanMethods = false)
public class MyHttpMessageConvertersConfiguration {

    @Bean
    public HttpMessageConverters customConverters() {
        HttpMessageConverter<?> additional = new AdditionalHttpMessageConverter();
        HttpMessageConverter<?> another = new AnotherHttpMessageConverter();
        return new HttpMessageConverters(additional, another);
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.http.HttpMessageConverters
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverter

@Configuration(proxyBeanMethods = false)
class MyHttpMessageConvertersConfiguration {

    @Bean
    fun customConverters(): HttpMessageConverters {
        val additional: HttpMessageConverter<*> = AdditionalHttpMessageConverter()
        val another: HttpMessageConverter<*> = AnotherHttpMessageConverter()
        return HttpMessageConverters(additional, another)
    }

}
```

:::

上下文中存在的任何 `HttpMessageConverter` bean 都会添加到转换器列表中。 您也可以以相同的方式覆盖默认转换器。

####  1.1.3 MessageCodesResolver

Spring MVC 有一个生成错误信息的策略，用于从绑定错误中呈现错误信息：`MessageCodesResolver`。 如果您设置 `spring.mvc.message-codes-resolver-format` 属性 `PREFIX_ERROR_CODE` 或 `POSTFIX_ERROR_CODE`，`Spring Boot` 会为您创建一个（请参阅 [`DefaultMessageCodesResolver.Format`](https://docs.spring.io/spring-framework/docs/6.0.5/javadoc-api/org/springframework/validation/DefaultMessageCodesResolver.Format.html) 中的枚举）。

#### 1.1.4 静态内容

默认情况下，`Spring Boot` 从类路径中名为 `/static`（或 `/public` 或 `/resources` 或 `/META-INF/resources`）的目录或 ServletContext 的根目录中提供静态内容。 它使用 Spring MVC 中的 `ResourceHttpRequestHandler`，因此您可以通过添加自己的 `WebMvcConfigurer` 并覆盖 `addResourceHandlers` 方法来修改该行为。
在独立的 Web 应用程序中，容器中的默认 `servlet` 未启用。 它可以使用 `server.servlet.register-default-servlet` 属性启用。

如果 Spring 决定不处理它，默认的 servlet 充当后备，从 `ServletContext` 的根提供内容。 大多数时候，这不会发生（除非你修改默认的 MVC 配置），因为 Spring 总是可以通过 `DispatcherServlet` 处理请求。

默认情况下，资源映射到 `/**`，但您可以使用 `spring.mvc.static-path-pattern` 属性对其进行调整。 例如，将所有资源重定位到 `/resources/**` 可以通过以下方式实现：

::: code-tabs#language

@tab Properties

```properties
spring.mvc.static-path-pattern=/resources/**
```

@tab Yaml

```yaml
spring:
  mvc:
    static-path-pattern: "/resources/**"
```

:::

您还可以使用 `spring.web.resources.static-locations` 属性自定义静态资源位置（用目录位置列表替换默认值）。 根 servlet 上下文路径 `"/"` 也会自动添加为一个位置。

除了前面提到的“标准”静态资源位置之外，还为 Webjars 内容制作了一个特例。 默认情况下，如果资源以 `Webjars` 格式打包，则路径在 `/webjars/**` 中的任何资源都是从 jar 文件提供的。 可以使用 `spring.mvc.webjars-path-pattern` 属性自定义路径。

::: tip 提示

如果您的应用程序打包为 `jar`，请不要使用 `src/main/webapp` 目录。 虽然这个目录是一个通用标准，但它只适用于 `war` 打包，如果你生成一个 `jar`，它会被大多数构建工具默默地忽略。

:::


`Spring Boot` 还支持 `Spring MVC` 提供的高级资源处理功能，允许使用缓存破坏静态资源或使用 `Webjars` 版本无关 `URL` 等用例。

要为 `Webjars` 使用版本不可知的 `URL`，请添加 `webjars-locator-core` 依赖项。 然后声明您的 `Webjar`。 以 `jQuery` 为例，添加 `"/webjars/jquery/jquery.min.js"` 会导致 `"/webjars/jquery/x.y.z/jquery.min.js"`，其中 `x.y.z` 是 `Webjar` 版本。


::: info Note

如果您使用 `JBoss`，则需要声明 `webjars-locator-jboss-vfs` 依赖项而不是 `webjars-locator-core`。 否则，所有 `Webjars` 都会解析为 `404`。

:::

要使用缓存清除，以下配置为所有静态资源配置缓存清除解决方案，有效地在 `URL` 中添加内容哈希，例如 `<link href="/css/spring-2a2d595e6ed9a0b24f027f2b63b134d6.css"/>`：

::: code-tabs#language
@tab Properties
```properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**

```
@tab Yaml
```properties
spring:
  web:
    resources:
      chain:
        strategy:
          content:
            enabled: true
            paths: "/**"
```
@tab 
:::

::: info Note

由于为 `Thymeleaf` 和 `FreeMarker` 自动配置的 `ResourceUrlEncodingFilter`，指向资源的链接在运行时在模板中被重写。 使用 `JSP` 时，您应该手动声明此过滤器。 目前不自动支持其他模板引擎，但可以使用自定义模板宏/帮助程序和 `ResourceUrlProvider` 的使用。

:::

当使用例如 `JavaScript` 模块加载器动态加载资源时，重命名文件不是一个选项。 这就是为什么其他策略也受到支持并可以组合的原因。  “固定” 策略在不更改文件名的情况下在 `URL` 中添加静态版本字符串，如以下示例所示：


::: code-tabs#language
@tab Properties
```properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
spring.web.resources.chain.strategy.fixed.enabled=true
spring.web.resources.chain.strategy.fixed.paths=/js/lib/
spring.web.resources.chain.strategy.fixed.version=v12
```
@tab Yaml
```yaml
spring:
  web:
    resources:
      chain:
        strategy:
          content:
            enabled: true
            paths: "/**"
          fixed:
            enabled: true
            paths: "/js/lib/"
            version: "v12"
```
:::

使用此配置，位于 `"/js/lib/"` 下的 `JavaScript` 模块使用固定的版本控制策略（ `"/v12/js/lib/mymodule.js"` ），而其他资源仍然使用内容（ `<link href="/ CSS/spring-2a2d595e6ed9a0b24f027f2b63b134d6.css"/>` ）。

有关更多受支持的选项，请参阅 [WebProperties.Resources](https://github.com/spring-projects/spring-boot/tree/v3.0.3/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/web/WebProperties.java)。

::: tip 提示

此功能已在专门的 [博客文章](https://spring.io/blog/2014/07/24/spring-framework-4-1-handling-static-web-resources) 和 Spring Framework 的 [参考文档](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-config-static-resources) 中进行了详细描述。

:::

#### 1.1.5 欢迎页

`Spring Boot` 支持静态和模板化的欢迎页面。 它首先在配置的静态内容位置查找 `index.html` 文件。 如果没有找到，它会寻找一个索引模板。 如果找到任何一个，它会自动用作应用程序的欢迎页面。

#### 1.1.6 自定义图标

与其他静态资源一样，`Spring Boot` 在配置的静态内容位置检查 `favicon.ico`。 如果存在这样的文件，它会自动用作应用程序的图标。

#### 1.1.7 路径匹配和内容协商

`Spring MVC` 可以通过查看请求路径并将其与应用程序中定义的映射（例如，控制器方法上的@GetMapping 注释）相匹配，将传入的 `HTTP` 请求映射到处理程序。

`Spring Boot` 默认选择禁用后缀模式匹配，这意味着像 `"GET /projects/spring-boot.json"` 这样的请求不会匹配到 `@GetMapping("/projects/spring-boot")` 映射。 这被认为是 [`Spring MVC` 应用程序的最佳实践](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-ann-requestmapping-suffix-pattern-match)。 此功能过去主要用于未发送正确“接受”请求标头的 `HTTP` 客户端； 我们需要确保向客户端发送正确的内容类型。 如今，内容协商更加可靠。

还有其他方法可以处理不能始终如一地发送正确的“接受”请求标头的 `HTTP` 客户端。 除了使用后缀匹配，我们可以使用查询参数来确保像 `"GET /projects/spring-boot?format=json"` 这样的请求将被映射到 `@GetMapping("/projects/spring-boot")`：

::: code-tabs#language
@tab Properties
```properties
spring.mvc.contentnegotiation.favor-parameter=true
```

@tab Yaml
```yaml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
```
:::

或者，如果您更喜欢使用不同的参数名称：

::: code-tabs#language
@tab Properties
```properties
spring.mvc.contentnegotiation.favor-parameter=true
spring.mvc.contentnegotiation.parameter-name=myparam
```

@tab Yaml
```yaml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
      parameter-name: "myparam"
```
:::

大多数标准媒体类型都支持开箱即用，但您也可以定义新媒体类型：

::: code-tabs#language
@tab Properties
```properties
spring.mvc.contentnegotiation.media-types.markdown=text/markdown
```

@tab Yaml
```yaml
spring:
  mvc:
    contentnegotiation:
      media-types:
        markdown: "text/markdown"
```
:::

从 `Spring Framework 5.3` 开始，`Spring MVC` 支持多种用于将请求路径与控制器处理程序匹配的实现策略。 它以前只支持 `AntPathMatcher` 策略，但现在它还提供了 `PathPatternParser`。` Spring Boot` 现在提供了一个配置属性来选择和选择新策略：
::: code-tabs#language
@tab Properties
```properties
spring.mvc.pathmatch.matching-strategy=path-pattern-parser
```

@tab Yaml
```yaml
spring:
  mvc:
    pathmatch:
      matching-strategy: "path-pattern-parser"
```
:::

有关为什么要考虑这个新实现的更多详细信息，请参阅 [专门的博客文章](https://spring.io/blog/2020/06/30/url-matching-with-pathpattern-in-spring-mvc) 。

::: info Note

`PathPatternParser` 是一个优化的实现，但限制了 [某些路径模式](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-ann-requestmapping-uri-templates) 变体的使用。 它与后缀模式匹配或使用 `servlet` 前缀 (`spring.mvc.servlet.path`) 映射 `DispatcherServlet` 不兼容。

:::


默认情况下，如果找不到请求的处理程序，`Spring MVC` 将发送 `404 Not Found` 错误响应。 要改为抛出 `NoHandlerFoundException`，请将 `configprop:spring.mvc.throw-exception-if-no-handler-found` 设置为 `true`。 请注意，默认情况下，静态内容的服务映射到 `/**` ，因此将为所有请求提供处理程序。 对于要抛出的 `NoHandlerFoundException`，您还必须将 `spring.mvc.static-path-pattern` 设置为更具体的值，例如 `/resources/**` 或将 `spring.web.resources.add-mappings` 设置为 `false` 以禁用静态服务内容完全。

#### 1.1.8 ConfigurableWebBindingInitializer
Spring MVC 使用 `WebBindingInitializer` 为特定请求初始化 `WebDataBinder`。 如果您创建自己的 `ConfigurableWebBindingInitializer` `@Bean`，`Spring Boot` 会自动配置` Spring MVC` 以使用它。

#### 1.1.8 模板引擎

除了 `REST Web` 服务，您还可以使用 Spring MVC 来提供动态 `HTML` 内容。 Spring MVC 支持多种模板技术，包括 `Thymeleaf`、`FreeMarker` 和 `JSP`。 此外，许多其他模板引擎包括它们自己的 `Spring MVC` 集成。 `Spring Boot` 包括对以下模板引擎的自动配置支持：

- [FreeMarker](https://freemarker.apache.org/docs/)
- [Groovy](https://docs.groovy-lang.org/docs/next/html/documentation/template-engines.html#_the_markuptemplateengine)
- [Thymeleaf](https://www.thymeleaf.org/)
- [Mustache](https://mustache.github.io/)

::: tip 提示

如果可能，应避免使用 JSP。 将它们与嵌入式 servlet 容器一起使用时有几个 [已知的限制](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.embedded-container.jsp-limitations) 。

:::

当您使用这些模板引擎之一的默认配置时，您的模板会自动从 `src/main/resources/templates` 中获取。

::: tip 提示

根据您运行应用程序的方式，您的 `IDE` 可能会对类路径进行不同的排序。 在 `IDE` 中从其 `main` 方法运行应用程序会导致与使用 `Maven` 或 `Gradle` 或从其打包的 `jar` 运行应用程序时不同的顺序。 这会导致 `Spring Boot` 无法找到预期的模板。 如果遇到这个问题，可以在 IDE 中重新排序类路径，将模块的类和资源放在首位。

:::

#### 1.1.10 错误处理



