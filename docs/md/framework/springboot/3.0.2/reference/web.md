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

#### 1.1.9 模板引擎

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

默认情况下，`Spring Boot` 提供一个 `/error` 映射，以合理的方式处理所有错误，并在 `servlet` 容器中注册为“全局”错误页面。 对于机器客户端，它会生成一个包含错误详细信息、`HTTP` 状态和异常消息的 `JSON` 响应。 对于浏览器客户端，有一个 “whitelabel” 错误视图以 `HTML` 格式呈现相同的数据（要自定义它，添加一个解析为错误的视图）。

如果要自定义默认错误处理行为，可以设置许多 `server.error` 属性。 请参阅附录的 [“服务器属性”](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.server) 部分。 

要完全替换默认行为，您可以实现 `ErrorController` 并注册该类型的 `bean` 定义或添加 `ErrorAttributes` 类型的 `bean` 以使用现有机制但替换内容。

::: tip 提示

`BasicErrorController` 可以用作自定义 `ErrorController` 的基类。 如果您想为新的内容类型添加处理程序（默认是专门处理 text/html 并为其他所有内容提供回退），这将特别有用。 为此，扩展 `BasicErrorController`，添加一个带有带有 `produces` 属性的 `@RequestMapping` 的公共方法，并创建一个新类型的 bean。

:::

从 `Spring Framework 6.0` 开始，支持 [`RFC 7807` 问题详细](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-ann-rest-exceptions) 信息。 `Spring MVC` 可以使用 `application/problem+json` 媒体类型生成自定义错误消息，例如：

```json
{
  "type": "https://example.org/problems/unknown-project",
  "title": "Unknown project",
  "status": 404,
  "detail": "No project found for id 'spring-unknown'",
  "instance": "/projects/spring-unknown"
}
```

可以通过将 `spring.mvc.problemdetails.enabled` 设置为 `true` 来启用此支持。 您还可以定义一个用 `@ControllerAdvice` 注释的类来自定义 `JSON` 文档以返回特定的控制器和/或异常类型，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice(basePackageClasses = SomeController.class)
public class MyControllerAdvice extends ResponseEntityExceptionHandler {

    @ResponseBody
    @ExceptionHandler(MyException.class)
    public ResponseEntity<?> handleControllerException(HttpServletRequest request, Throwable ex) {
        HttpStatus status = getStatus(request);
        return new ResponseEntity<>(new MyErrorBody(status.value(), ex.getMessage()), status);
    }

    private HttpStatus getStatus(HttpServletRequest request) {
        Integer code = (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        HttpStatus status = HttpStatus.resolve(code);
        return (status != null) ? status : HttpStatus.INTERNAL_SERVER_ERROR;
    }

}
```

@tab Kotlin

```kotlin
import jakarta.servlet.RequestDispatcher
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@ControllerAdvice(basePackageClasses = [SomeController::class])
class MyControllerAdvice : ResponseEntityExceptionHandler() {

    @ResponseBody
    @ExceptionHandler(MyException::class)
    fun handleControllerException(request: HttpServletRequest, ex: Throwable): ResponseEntity<*> {
        val status = getStatus(request)
        return ResponseEntity(MyErrorBody(status.value(), ex.message), status)
    }

    private fun getStatus(request: HttpServletRequest): HttpStatus {
        val code = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE) as Int
        val status = HttpStatus.resolve(code)
        return status ?: HttpStatus.INTERNAL_SERVER_ERROR
    }

}
```

:::

在前面的示例中，如果 `MyException` 由与 `SomeController` 在同一包中定义的控制器抛出，则使用 `MyErrorBody` `POJO` 的 `JSON` 表示而不是 `ErrorAttributes` 表示。 

在某些情况下，在控制器级别处理的错误不会被 [度量基础结构](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.metrics.supported.spring-mvc) 记录下来。 应用程序可以通过将已处理的异常设置为请求属性来确保将此类异常记录在请求指标中：

::: code-tabs#language
@tab Java

```java
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Controller
public class MyController {

    @ExceptionHandler(CustomException.class)
    String handleCustomException(HttpServletRequest request, CustomException ex) {
        request.setAttribute(ErrorAttributes.ERROR_ATTRIBUTE, ex);
        return "errorView";
    }

}
```

@tab Kotlin

```kotlin
import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.web.servlet.error.ErrorAttributes
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.ExceptionHandler

@Controller
class MyController {

    @ExceptionHandler(CustomException::class)
    fun handleCustomException(request: HttpServletRequest, ex: CustomException?): String {
        request.setAttribute(ErrorAttributes.ERROR_ATTRIBUTE, ex)
        return "errorView"
    }

}
```

:::

##### 自定义错误页面

如果要为给定状态代码显示自定义 `HTML` 错误页面，可以将文件添加到 `/error` 目录。 错误页面可以是静态 `HTML`（即添加到任何静态资源目录下），也可以使用模板构建。 文件名应该是准确的状态代码或系列掩码。

 例如，要将 `404` 映射到静态 `HTML` 文件，您的目录结构将如下所示：

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

要使用 `FreeMarker` 模板映射所有 `5xx` 错误，您的目录结构将如下所示：

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- templates/
             +- error/
             |   +- 5xx.ftlh
             +- <other templates>
```

对于更复杂的映射，您还可以添加实现 `ErrorViewResolver` 接口的 bean，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.ErrorPageRegistrar;
import org.springframework.boot.web.server.ErrorPageRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration(proxyBeanMethods = false)
public class MyErrorPagesConfiguration {

    @Bean
    public ErrorPageRegistrar errorPageRegistrar() {
        return this::registerErrorPages;
    }

    private void registerErrorPages(ErrorPageRegistry registry) {
        registry.addErrorPages(new ErrorPage(HttpStatus.BAD_REQUEST, "/400"));
    }

}
```

@tab Kotlin

```java
import org.springframework.boot.web.server.ErrorPage
import org.springframework.boot.web.server.ErrorPageRegistrar
import org.springframework.boot.web.server.ErrorPageRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus

@Configuration(proxyBeanMethods = false)
class MyErrorPagesConfiguration {

    @Bean
    fun errorPageRegistrar(): ErrorPageRegistrar {
        return ErrorPageRegistrar { registry: ErrorPageRegistry -> registerErrorPages(registry) }
    }

    private fun registerErrorPages(registry: ErrorPageRegistry) {
        registry.addErrorPages(ErrorPage(HttpStatus.BAD_REQUEST, "/400"))
    }

}
```

:::

:::  info

如果你注册一个 ErrorPage 的路径最终被过滤器处理（这在一些非 Spring web 框架中很常见，比如 Jersey 和 Wicket），那么过滤器必须被显式注册为错误调度程序，如下所示 以下示例：

:::

::: code-tabs#language
@tab Java

```java
import java.util.EnumSet;

import jakarta.servlet.DispatcherType;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyFilterConfiguration {

    @Bean
    public FilterRegistrationBean<MyFilter> myFilter() {
        FilterRegistrationBean<MyFilter> registration = new FilterRegistrationBean<>(new MyFilter());
        // ...
        registration.setDispatcherTypes(EnumSet.allOf(DispatcherType.class));
        return registration;
    }

}
```

@tab Kotlin

```kotlin
import jakarta.servlet.DispatcherType
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.EnumSet

@Configuration(proxyBeanMethods = false)
class MyFilterConfiguration {

    @Bean
    fun myFilter(): FilterRegistrationBean<MyFilter> {
        val registration = FilterRegistrationBean(MyFilter())
        // ...
        registration.setDispatcherTypes(EnumSet.allOf(DispatcherType::class.java))
        return registration
    }

}
```

:::

##### WAR 部署中的错误处理

当部署到 `servlet` 容器时，`Spring Boot` 使用其错误页面过滤器将具有错误状态的请求转发到适当的错误页面。 这是必要的，因为 `servlet` 规范不提供用于注册错误页面的 `API`。 根据您将 war 文件部署到的容器以及您的应用程序使用的技术，可能需要一些额外的配置。 

如果尚未提交响应，错误页面过滤器只能将请求转发到正确的错误页面。 默认情况下，`WebSphere Application Server 8.0` 及更高版本在成功完成 `servlet` 的服务方法后提交响应。 您应该通过将 `com.ibm.ws.webcontainer.invokeFlushAfterService` 设置为 `false` 来禁用此行为。

#### 1.1.11 CORS 支持

[跨源资源共享](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) (CORS) 是 [大多数浏览器](https://caniuse.com/#feat=cors) 实现的 [W3C 规范](https://www.w3.org/TR/cors/)，它允许您以灵活的方式指定授权什么样的跨域请求，而不是使用一些不太安全和不太强大的方法，如 IFRAME 或 JSONP。 

从 4.2 版开始，Spring MVC [支持 CORS](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-cors)。 在 Spring Boot 应用程序中使用带有 [`@CrossOrigin`](https://docs.spring.io/spring-framework/docs/6.0.5/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html) 注解的 [控制器方法 CORS 配置](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-cors-controller) 不需要任何特定配置。 可以通过使用自定义的 `addCorsMappings(CorsRegistry)` 方法注册 `WebMvcConfigurer` bean 来定义[全局 `CORS` 配置](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-cors-global)，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
public class MyCorsConfiguration {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**");
            }

        };
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration(proxyBeanMethods = false)
class MyCorsConfiguration {

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/api/**")
            }
        }
    }

}
```

:::

### 1.2 JAX-RS 和 Jersey

如果您更喜欢 `REST` 端点的 JAX-RS 编程模型，您可以使用一种可用的实现来代替 `Spring MVC`。 [`Jersey`](https://jersey.github.io/) 和 [Apache CXF](https://cxf.apache.org/) 开箱即用。 `CXF` 要求您在应用程序上下文中将其 `Servlet` 或 `Filter` 注册为 @Bean。 `Jersey` 有一些原生的 `Spring` 支持，所以我们也在 Spring Boot 中为它提供自动配置支持，连同一个启动器。 

要开始使用 `Jersey`，请将 `spring-boot-starter-jersey` 作为依赖项包括在内，然后您需要一个类型为 `ResourceConfig` 的 `@Bean`，您可以在其中注册所有端点，如以下示例所示：

```java
@Component
public class MyJerseyConfig extends ResourceConfig {

    public MyJerseyConfig() {
        register(MyEndpoint.class);
    }

}
```

::: warning

`Jersey` 对扫描可执行档案的支持相当有限。 例如，当运行可执行 `war` 文件时，它无法在完全可执行的 `jar` 文件或 `WEB-INF/classes` 中找到的包中扫描端点。 为避免此限制，不应使用 `packages` 方法，而应使用 `register` 方法单独注册端点，如前面的示例所示。

:::

对于更高级的自定义，您还可以注册任意数量的实现 `ResourceConfigCustomizer` 的 bean。 所有注册的端点都应该是带有 `HTTP` 资源注释（`@GET` 和其他）的 `@Components`，如以下示例所示：

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import org.springframework.stereotype.Component;

@Component
@Path("/hello")
public class MyEndpoint {

    @GET
    public String message() {
        return "Hello";
    }

}
```

由于 `Endpoint` 是一个 Spring `@Component`，它的生命周期由 Spring 管理，您可以使用 `@Autowired` 注解注入依赖，使用 `@Value` 注解注入外部配置。 默认情况下，`Jersey` `servlet` 已注册并映射到 `/*`。 您可以通过将 @ApplicationPath 添加到 `ResourceConfig` 来更改映射。

默认情况下，`Jersey` 在名为 `jerseyServletRegistration` 的 `ServletRegistrationBean` 类型的@Bean 中设置为 servlet。 默认情况下，`servlet` 是延迟初始化的，但您可以通过设置 `spring.jersey.servlet.load-on-startup` 来自定义该行为。 您可以通过创建一个您自己的同名来禁用或覆盖该 `bean`。 您还可以通过设置 `spring.jersey.type=filter` 使用过滤器而不是 `servlet`（在这种情况下，要替换或覆盖的 `@Bean` 是 `jerseyFilterRegistration`）。 该过滤器有一个`@Order`，您可以使用 `spring.jersey.filter.order` 对其进行设置。 当使用 `Jersey` 作为过滤器时，必须存在一个 servlet 来处理任何未被 `Jersey` 拦截的请求。 如果您的应用程序不包含此类 `servlet`，您可能希望通过将 `server.servlet.register-default-servlet` 设置为 `true` 来启用默认 `servlet`。 通过使用 `spring.jersey.init.*` 指定属性映射，可以为 servlet 和过滤器注册提供初始化参数。

### 1.3 嵌入式 Servlet 容器支持

对于 servlet 应用程序，`Spring Boot` 包括对嵌入式 `[Tomcat`](https://tomcat.apache.org/)、[`Jetty`](https://www.eclipse.org/jetty/) 和 [`Undertow`](https://github.com/undertow-io/undertow) 服务器的支持。 大多数开发人员使用适当的 `“Starter”` 来获得完全配置的实例。 默认情况下，嵌入式服务器在端口 `8080` 上侦听 `HTTP` 请求。

#### 1.3.1 Servlets, Filters, and Listeners

使用嵌入式 `servlet` 容器时，您可以通过使用 Spring bean 或扫描 `servlet` 组件来注册 `servlet`、过滤器和所有来自 servlet 规范的侦听器（例如 `HttpSessionListener`）。

##### 将 Servlet、过滤器和侦听器注册为 Spring Bean

任何作为 Spring bean 的 `Servlet`、`Filter` 或 `servlet` `*Listener` 实例都在嵌入式容器中注册。 如果您想在配置期间引用 `application.properties` 中的值，这会特别方便。

默认情况下，如果上下文只包含一个 Servlet，它会映射到 /。 在多个 servlet bean 的情况下，bean 名称用作路径前缀。 过滤器映射到 `/*`。 

如果基于约定的映射不够灵活，您可以使用 `ServletRegistrationBean`、`FilterRegistrationBean` 和 `ServletListenerRegistrationBean` 类进行完全控制。 

将过滤器 `bean` 无序放置通常是安全的。 如果需要特定的顺序，您应该使用 `@Order` 注释过滤器或使其实现 `Ordered`。 您不能通过使用 `@Order` 注释其 bean 方法来配置 `Filter` 的顺序。 如果您无法更改 Filter 类以添加 `@Order` 或实现 `Ordered`，则必须为 `Filter` 定义一个 `FilterRegistrationBean` 并使用 `setOrder(int)` 方法设置注册 bean 的顺序。 避免配置在 `Ordered.HIGHEST_PRECEDENCE` 处读取请求正文的过滤器，因为它可能违反应用程序的字符编码配置。 如果 servlet 过滤器包装请求，则应使用小于或等于 `OrderedFilter.REQUEST_WRAPPER_FILTER_MAX_ORDER` 的顺序配置它。

::: tip 

要查看应用程序中每个过滤器的顺序，请为 `Web` [日志组](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging.log-groups)启用调试级别日志记录 (`logging.level.web=debug`)。 然后将在启动时记录已注册过滤器的详细信息，包括它们的顺序和 `URL` 模式。

:::

::: warning

注册 `Filter` bean 时要小心，因为它们在应用程序生命周期的早期就已初始化。 如果您需要注册一个与其他 `bean` 交互的过滤器，请考虑改用 [`DelegatingFilterProxyRegistrationBean`](https://docs.spring.io/spring-boot/docs/3.0.3/api/org/springframework/boot/web/servlet/DelegatingFilterProxyRegistrationBean.html) 。

:::

#### 1.3.2 Servlet 上下文初始化

嵌入式 `servlet` 容器不直接执行 `jakarta.servlet.ServletContainerInitializer` 接口或 Spring 的 `org.springframework.web.WebApplicationInitializer` 接口。 这是一个有意的设计决策，旨在降低设计为在战争中运行的第三方库可能破坏 `Spring Boot` 应用程序的风险。

如果您需要在 Spring Boot 应用程序中执行 servlet 上下文初始化，您应该注册一个实现 `org.springframework.boot.web.servlet.ServletContextInitializer` 接口的 bean。 单个 `onStartup` 方法提供对 `ServletContext` 的访问，并且在必要时可以轻松用作现有 `WebApplicationInitializer` 的适配器。

##### 扫描 Servlet、过滤器和监听器

使用嵌入式容器时，可以通过使用`@ServletComponentScan` 启用使用`@WebServlet`、`@WebFilter` 和`@WebListener` 注解的类的自动注册。

::: tip

`@ServletComponentScan` 在独立容器中不起作用，而是使用容器的内置发现机制。

:::

#### 1.3.3 ServletWebServerApplicationContext

在底层，`Spring Boot` 使用不同类型的 `ApplicationContext` 来支持嵌入式 `servlet` 容器。 `ServletWebServerApplicationContext` 是一种特殊类型的 `WebApplicationContext`，它通过搜索单个 `ServletWebServerFactory` bean 来引导自己。 通常 `TomcatServletWebServerFactory`、`JettyServletWebServerFactory` 或 `UndertowServletWebServerFactory` 已自动配置。

::: info

您通常不需要了解这些实现类。 大多数应用程序都是自动配置的，并且会代表您创建适当的 `ApplicationContext` 和 `ServletWebServerFactory`。

:::

在嵌入式容器设置中，`ServletContext` 被设置为在应用程序上下文初始化期间发生的服务器启动的一部分。 因此，无法使用 `ServletContext` 可靠地初始化 `ApplicationContext` 中的 bean。 解决这个问题的一种方法是将 `ApplicationContext` 作为 bean 的依赖项注入，并仅在需要时访问 `ServletContext`。 另一种方法是在服务器启动后使用回调。 这可以使用 `ApplicationListener` 来完成，它侦听 `ApplicationStartedEvent`，如下所示：

```java
import jakarta.servlet.ServletContext;

import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.web.context.WebApplicationContext;

public class MyDemoBean implements ApplicationListener<ApplicationStartedEvent> {

    private ServletContext servletContext;

    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {
        ApplicationContext applicationContext = event.getApplicationContext();
        this.servletContext = ((WebApplicationContext) applicationContext).getServletContext();
    }

}
```

#### 1.3.4 自定义嵌入式 Servlet 容器

可以使用 Spring 环境属性配置常见的 servlet 容器设置。 通常，您会在 application.properties 或 application.yaml 文件中定义属性。

常见的服务器设置包括：

- 网络设置：传入 HTTP 请求的侦听端口 (`server.port`)、绑定到 `server.address` 的接口地址等。 
- 会话设置：会话是否持久化（`server.servlet.session.persistent`）、会话超时（`server.servlet.session.timeout`）、会话数据的位置（`server.servlet.session.store-dir`）、session-cookie 配置（`server.servlet.session.cookie.*`）。 
- 错误管理：错误页面的位置（`server.error.path`）等。

- [SSL](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.configure-ssl)
- [HTTP 压缩](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.enable-response-compression)

Spring Boot 尽可能多地尝试公开公共设置，但这并不总是可能的。 对于这些情况，专用名称空间提供特定于服务器的自定义（请参阅 `server.tomcat` 和 server.undertow）。 例如，可以使用嵌入式 servlet 容器的特定功能配置 [访问日志](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.configure-access-logs) 。

::: tip 提示

有关完整列表，请参阅 [`ServerProperties`](https://github.com/spring-projects/spring-boot/tree/v3.0.3/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/web/ServerProperties.java) 类。

:::

##### SameSite Cookies

Web 浏览器可以使用 `SameSite` cookie 属性来控制是否以及如何在跨站点请求中提交 `cookie`。 该属性与现代 Web 浏览器特别相关，现代 Web 浏览器已经开始更改缺少该属性时使用的默认值。 

如果要更改会话 cookie 的 `SameSite` 属性，可以使用 `server.servlet.session.cookie.same-site` 属性。 自动配置的 `Tomcat`、`Jetty` 和 `Undertow` 服务器支持此属性。 它还用于配置基于 `SessionRepository` beans 的 Spring Session servlet。 

例如，如果您希望会话 cookie 的 `SameSite` 属性为 None，则可以将以下内容添加到 application.properties 或 `application.yaml` 文件中：

::: code-tabs#language
@tab Properties

```properties
server.servlet.session.cookie.same-site=none
```

@tab Yaml

```yaml
server:
  servlet:
    session:
      cookie:
        same-site: "none"
```

:::

如果要更改添加到 `HttpServletResponse` 的其他 cookie 的 `SameSite` 属性，可以使用 `CookieSameSiteSupplier`。 向 `CookieSameSiteSupplier` 传递一个 `Cookie`，并可能返回一个 `SameSite` 值或 null。

您可以使用多种便利工厂和过滤方法来快速匹配特定的 `cookie`。 例如，添加以下 bean 将自动为名称与正则表达式 `myapp.*` 匹配的所有 cookie 应用 `Lax` 的 `SameSite`。

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MySameSiteConfiguration {

    @Bean
    public CookieSameSiteSupplier applicationCookieSameSiteSupplier() {
        return CookieSameSiteSupplier.ofLax().whenHasNameMatching("myapp.*");
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MySameSiteConfiguration {

    @Bean
    fun applicationCookieSameSiteSupplier(): CookieSameSiteSupplier {
        return CookieSameSiteSupplier.ofLax().whenHasNameMatching("myapp.*")
    }

}
```

:::

##### 程序化定制

如果您需要以编程方式配置您的嵌入式 `servlet` 容器，您可以注册一个实现 `WebServerFactoryCustomizer` 接口的 Spring bean。 `WebServerFactoryCustomizer` 提供对 `ConfigurableServletWebServerFactory` 的访问，其中包括许多自定义 `setter` 方法。 以下示例显示了以编程方式设置端口：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.stereotype.Component;

@Component
public class MyWebServerFactoryCustomizer implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory server) {
        server.setPort(9000);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory
import org.springframework.stereotype.Component

@Component
class MyWebServerFactoryCustomizer : WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    override fun customize(server: ConfigurableServletWebServerFactory) {
        server.setPort(9000)
    }

}
```

:::

`TomcatServletWebServerFactory`、`JettyServletWebServerFactory` 和 `UndertowServletWebServerFactory` 是 `ConfigurableServletWebServerFactory` 的专用变体，它们分别具有针对 `Tomcat`、`Jetty` 和 `Undertow` 的额外自定义设置方法。 以下示例显示如何自定义 `TomcatServletWebServerFactory` 以提供对 `Tomcat` 特定配置选项的访问：

::: code-tabs#language
@tab Java

```java
import java.time.Duration;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class MyTomcatWebServerFactoryCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory server) {
        server.addConnectorCustomizers((connector) -> connector.setAsyncTimeout(Duration.ofSeconds(20).toMillis()));
    }

}
```



@tab Kotlin

```java
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class MyTomcatWebServerFactoryCustomizer : WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    override fun customize(server: TomcatServletWebServerFactory) {
        server.addConnectorCustomizers({ connector -> connector.asyncTimeout = Duration.ofSeconds(20).toMillis() })
    }

}
```

:::

##### 直接定制 ConfigurableServletWebServerFactory

对于需要您从 `ServletWebServerFactory` 进行扩展的更高级的用例，您可以自己公开此类类型的 bean。

为许多配置选项提供了设置器。 如果您需要做一些更奇特的事情，还提供了几个受保护的方法“钩子”。 有关详细信息，请参阅 [源代码文档](https://docs.spring.io/spring-boot/docs/3.0.3/api/org/springframework/boot/web/servlet/server/ConfigurableServletWebServerFactory.html) 。

::: info

自动配置的定制器仍然应用于您的自定义工厂，因此请谨慎使用该选项。

:::



#### 1.3.5 JSP 限制

当运行使用嵌入式 `servlet` 容器（并打包为可执行存档）的 Spring Boot 应用程序时，JSP 支持存在一些限制。 

- 使用 `Jetty` 和 `Tomcat`，如果您使用 war 包装，它应该可以工作。 当使用 `java -jar` 启动时，可执行的 `war` 将起作用，并且还可以部署到任何标准容器。 使用可执行 jar 时不支持 `JSP`。
- `Undertow` 不支持 JSP。
- 创建自定义 `error.jsp` 页面不会覆盖 [错误处理](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.error-handling) 的默认视图。 应该改用[自定义错误页面](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.error-handling.error-pages)。

## 2. 响应式 Web 应用

Spring Boot 通过为 `Spring Webflux` 提供自动配置来简化反应式 `Web` 应用程序的开发。

### 2.1 Spring WebFlux 框架

`Spring WebFlux` 是 `Spring Framework 5.0` 中引入的新的反应式 Web 框架。 与Spring MVC不同，它不需要`servlet` API，完全异步非阻塞，通过 [`Reactor` 项目](https://projectreactor.io/)实现了 [`Reactive Streams`](https://www.reactive-streams.org/)  规范。

`Spring WebFlux` 有两种风格：函数式和基于注解的。 基于注解的模型非常接近 `Spring MVC` 模型，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
    public Mono<User> getUser(@PathVariable Long userId) {
        return this.userRepository.findById(userId);
    }

    @GetMapping("/{userId}/customers")
    public Flux<Customer> getUserCustomers(@PathVariable Long userId) {
        return this.userRepository.findById(userId).flatMapMany(this.customerRepository::findByUser);
    }

    @DeleteMapping("/{userId}")
    public Mono<Void> deleteUser(@PathVariable Long userId) {
        return this.userRepository.deleteById(userId);
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/users")
class MyRestController(private val userRepository: UserRepository, private val customerRepository: CustomerRepository) {

    @GetMapping("/{userId}")
    fun getUser(@PathVariable userId: Long): Mono<User?> {
        return userRepository.findById(userId)
    }

    @GetMapping("/{userId}/customers")
    fun getUserCustomers(@PathVariable userId: Long): Flux<Customer> {
        return userRepository.findById(userId).flatMapMany { user: User? ->
            customerRepository.findByUser(user)
        }
    }

    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: Long): Mono<Void> {
        return userRepository.deleteById(userId)
    }

}
```



:::

功能变体 `“WebFlux.fn”` 将路由配置与请求的实际处理分开，如下例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RequestPredicate;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.accept;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration(proxyBeanMethods = false)
public class MyRoutingConfiguration {

    private static final RequestPredicate ACCEPT_JSON = accept(MediaType.APPLICATION_JSON);

    @Bean
    public RouterFunction<ServerResponse> monoRouterFunction(MyUserHandler userHandler) {
        return route()
                .GET("/{user}", ACCEPT_JSON, userHandler::getUser)
                .GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
                .DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
                .build();
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.server.RequestPredicates.DELETE
import org.springframework.web.reactive.function.server.RequestPredicates.GET
import org.springframework.web.reactive.function.server.RequestPredicates.accept
import org.springframework.web.reactive.function.server.RouterFunction
import org.springframework.web.reactive.function.server.RouterFunctions
import org.springframework.web.reactive.function.server.ServerResponse

@Configuration(proxyBeanMethods = false)
class MyRoutingConfiguration {

    @Bean
    fun monoRouterFunction(userHandler: MyUserHandler): RouterFunction<ServerResponse> {
        return RouterFunctions.route(
            GET("/{user}").and(ACCEPT_JSON), userHandler::getUser).andRoute(
            GET("/{user}/customers").and(ACCEPT_JSON), userHandler::getUserCustomers).andRoute(
            DELETE("/{user}").and(ACCEPT_JSON), userHandler::deleteUser)
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
import reactor.core.publisher.Mono;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

@Component
public class MyUserHandler {

    public Mono<ServerResponse> getUser(ServerRequest request) {
        ...
    }

    public Mono<ServerResponse> getUserCustomers(ServerRequest request) {
        ...
    }

    public Mono<ServerResponse> deleteUser(ServerRequest request) {
        ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import reactor.core.publisher.Mono

@Component
class MyUserHandler {

    fun getUser(request: ServerRequest?): Mono<ServerResponse> {
        return ServerResponse.ok().build()
    }

    fun getUserCustomers(request: ServerRequest?): Mono<ServerResponse> {
        return ServerResponse.ok().build()
    }

    fun deleteUser(request: ServerRequest?): Mono<ServerResponse> {
        return ServerResponse.ok().build()
    }

}
```

:::

WebFlux 是 Spring Framework 的一部分，详细信息可在其 [参考文档](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web-reactive.html#webflux-fn) 中找到。

::: tip

您可以根据需要定义任意数量的 `RouterFunction` bean 以模块化路由器的定义。 如果您需要申请优先级，可以订购 Bean。

:::

首先，将 `spring-boot-starter-webflux` 模块添加到您的应用程序中。

::: tip

在应用程序中同时添加 `spring-boot-starter-web` 和 `spring-boot-starter-webflux` 模块会导致 Spring Boot 自动配置 `Spring MVC`，而不是 `WebFlux`。 选择此行为是因为许多 Spring 开发人员将 `spring-boot-starter-webflux` 添加到他们的 Spring MVC 应用程序中以使用反应式 `WebClient`。 您仍然可以通过将所选应用程序类型设置为 `SpringApplication.setWebApplicationType(WebApplicationType.REACTIVE)` 来强制执行您的选择。

::: 

#### 2.1.1 Spring WebFlux 自动配置

Spring Boot 为 `Spring WebFlux` 提供自动配置，适用于大多数应用程序。

自动配置在 `Spring` 的默认值之上添加了以下功能：

- 为 `HttpMessageReader` 和 `HttpMessageWriter` 实例配置编解码器（在[本文档后面](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.reactive.webflux.httpcodecs)描述）。 
- 支持提供静态资源，包括对 `WebJar` 的支持（在[本文档后面](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.static-content)描述）。

如果你想保留 `Spring Boot WebFlux` 特性并且你想添加额外的 [`WebFlux` 配置](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web-reactive.html#webflux-config)，你可以添加你自己的 `WebFluxConfigurer` 类型的 `@Configuration` 类，但没有 `@EnableWebFlux`。 

如果你想完全控制 `Spring WebFlux`，你可以添加你自己的 `@Configuration` 并用 `@EnableWebFlux` 注解。

#### 2.1.2 带有 HttpMessageReaders 和 HttpMessageWriters 的 HTTP 编解码器

`Spring WebFlux` 使用 `HttpMessageReader` 和 `HttpMessageWriter` 接口来转换 `HTTP` 请求和响应。 通过查看类路径中可用的库，它们使用 `CodecConfigurer` 配置为具有合理的默认值。 

Spring Boot 为编解码器 spring.codec.* 提供了专用的配置属性。 它还通过使用 `CodecCustomizer` 实例应用进一步的自定义。 例如，`spring.jackson.*` 配置键应用于 `Jackson` 编解码器。 

如果您需要添加或自定义编解码器，您可以创建自定义 `CodecCustomizer` 组件，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.codec.CodecCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerSentEventHttpMessageReader;

@Configuration(proxyBeanMethods = false)
public class MyCodecsConfiguration {

    @Bean
    public CodecCustomizer myCodecCustomizer() {
        return (configurer) -> {
            configurer.registerDefaults(false);
            configurer.customCodecs().register(new ServerSentEventHttpMessageReader());
            // ...
        };
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.web.codec.CodecCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.http.codec.CodecConfigurer
import org.springframework.http.codec.ServerSentEventHttpMessageReader

class MyCodecsConfiguration {

    @Bean
    fun myCodecCustomizer(): CodecCustomizer {
        return CodecCustomizer { configurer: CodecConfigurer ->
            configurer.registerDefaults(false)
            configurer.customCodecs().register(ServerSentEventHttpMessageReader())
        }
    }

}
```



:::

#### 2.1.3 静态内容

默认情况下，Spring Boot 从类路径中名为 `/static`（或 `/public` 或 `/resources` 或 `/META-INF/resources`）的目录中提供静态内容。 它使用来自 `Spring WebFlux` 的 `ResourceWebHandler`，因此您可以通过添加自己的 `WebFluxConfigurer` 并覆盖 `addResourceHandlers` 方法来修改该行为。

默认情况下，资源映射到 `/**`，但您可以通过设置 `spring.webflux.static-path-pattern` 属性来调整它。 例如，将所有资源重定位到 `/resources/**` 可以通过以下方式实现：

::: code-tabs#language
@tab Properties

```properties
spring.webflux.static-path-pattern=/resources/**
```



@tab Yaml

```yaml
spring:
  webflux:
    static-path-pattern: "/resources/**"
```



:::

您还可以使用 `spring.web.resources.static-locations` 自定义静态资源位置。 这样做会将默认值替换为目录位置列表。 如果您这样做，默认的欢迎页面检测将切换到您的自定义位置。 因此，如果在启动时您的任何位置有一个 index.html，它就是应用程序的主页。

除了前面列出的“标准”静态资源位置之外，还为 [`Webjars` 内容](https://www.webjars.org/)制作了一个特例。 默认情况下，如果资源以 `Webjars` 格式打包，则路径在 `/webjars/**` 中的任何资源都是从 jar 文件提供的。 可以使用 `spring.webflux.webjars-path-pattern` 属性自定义路径。

::: tip

`Spring WebFlux` 应用程序不严格依赖 `servlet` API，因此不能部署为 `war` 文件，不使用 `src/main/webapp` 目录。

:::

#### 2.1.4 欢迎页

`Spring Boot` 支持静态和模板化的欢迎页面。 它首先在配置的静态内容位置查找 `index.html` 文件。 如果没有找到，它会寻找一个索引模板。 如果找到任何一个，它会自动用作应用程序的欢迎页面。

#### 2.1.5 模板引擎

除了 `REST Web` 服务，您还可以使用 `Spring WebFlux` 来提供动态 `HTML` 内容。 Spring WebFlux 支持多种模板技术，包括 `Thymeleaf`、`FreeMarker` 和 `Mustache`。 

Spring Boot 包括对以下模板引擎的自动配置支持：

- [FreeMarker](https://freemarker.apache.org/docs/)
- [Thymeleaf](https://www.thymeleaf.org/)
- [Mustache](https://mustache.github.io/)

当您使用这些模板引擎之一的默认配置时，您的模板会自动从 `src/main/resources/templates` 中获取。

#### 2.1.6 错误处理

Spring Boot 提供了一个 `WebExceptionHandler` 以合理的方式处理所有错误。 它在处理顺序中的位置紧接在 `WebFlux` 提供的处理程序之前，被认为是最后一个。 对于机器客户端，它会生成一个包含错误详细信息、`HTTP` 状态和异常消息的 `JSON` 响应。 对于浏览器客户端，有一个“whitelabel”错误处理程序以 `HTML` 格式呈现相同的数据。 您还可以提供自己的 `HTML` 模板来显示错误（请参阅[下一节](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.reactive.webflux.error-handling.error-pages)）。

在直接在 Spring Boot 中自定义错误处理之前，您可以利用 `Spring WebFlux` 中的 [RFC 7807](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web-reactive.html#webflux-ann-rest-exceptions) 问题详细信息支持。 Spring `WebFlux` 可以使用 `application/problem+json` 媒体类型生成自定义错误消息，例如：

```json
{
  "type": "https://example.org/problems/unknown-project",
  "title": "Unknown project",
  "status": 404,
  "detail": "No project found for id 'spring-unknown'",
  "instance": "/projects/spring-unknown"
}
```

可以通过将 `spring.webflux.problemdetails.enabled` 设置为 `true` 来启用此支持。

自定义此功能的第一步通常涉及使用现有机制，但替换或扩充错误内容。 为此，您可以添加一个 `ErrorAttributes` 类型的 bean。

要更改错误处理行为，您可以实现 `ErrorWebExceptionHandler` 并注册该类型的 bean 定义。 因为 `ErrorWebExceptionHandler` 非常低级，Spring Boot 还提供了一个方便的 `AbstractErrorWebExceptionHandler` 让您以 `WebFlux` 功能方式处理错误，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import reactor.core.publisher.Mono;

import org.springframework.boot.autoconfigure.web.WebProperties.Resources;
import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.reactive.function.server.ServerResponse.BodyBuilder;

@Component
public class MyErrorWebExceptionHandler extends AbstractErrorWebExceptionHandler {

    public MyErrorWebExceptionHandler(ErrorAttributes errorAttributes, Resources resources,
            ApplicationContext applicationContext) {
        super(errorAttributes, resources, applicationContext);
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        return RouterFunctions.route(this::acceptsXml, this::handleErrorAsXml);
    }

    private boolean acceptsXml(ServerRequest request) {
        return request.headers().accept().contains(MediaType.APPLICATION_XML);
    }

    public Mono<ServerResponse> handleErrorAsXml(ServerRequest request) {
        BodyBuilder builder = ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR);
        // ... additional builder calls
        return builder.build();
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.web.WebProperties
import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler
import org.springframework.boot.web.reactive.error.ErrorAttributes
import org.springframework.context.ApplicationContext
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.RouterFunction
import org.springframework.web.reactive.function.server.RouterFunctions
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import reactor.core.publisher.Mono

@Component
class MyErrorWebExceptionHandler(errorAttributes: ErrorAttributes?, resources: WebProperties.Resources?,
    applicationContext: ApplicationContext?) : AbstractErrorWebExceptionHandler(errorAttributes, resources, applicationContext) {

    override fun getRoutingFunction(errorAttributes: ErrorAttributes): RouterFunction<ServerResponse> {
        return RouterFunctions.route(this::acceptsXml, this::handleErrorAsXml)
    }

    private fun acceptsXml(request: ServerRequest): Boolean {
        return request.headers().accept().contains(MediaType.APPLICATION_XML)
    }

    fun handleErrorAsXml(request: ServerRequest?): Mono<ServerResponse> {
        val builder = ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
        // ... additional builder calls
        return builder.build()
    }

}
```



:::

为了获得更完整的画面，您还可以直接继承 `DefaultErrorWebExceptionHandler` 并覆盖特定方法。 

在某些情况下，在控制器或处理函数级别处理的错误不会被[度量基础结构](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.metrics.supported.spring-webflux)记录下来。 应用程序可以通过将已处理的异常设置为请求属性来确保将此类异常记录在请求指标中：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.reactive.result.view.Rendering;
import org.springframework.web.server.ServerWebExchange;

@Controller
public class MyExceptionHandlingController {

    @GetMapping("/profile")
    public Rendering userProfile() {
        // ...
        throw new IllegalStateException();
    }

    @ExceptionHandler(IllegalStateException.class)
    public Rendering handleIllegalState(ServerWebExchange exchange, IllegalStateException exc) {
        exchange.getAttributes().putIfAbsent(ErrorAttributes.ERROR_ATTRIBUTE, exc);
        return Rendering.view("errorView").modelAttribute("message", exc.getMessage()).build();
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.web.reactive.error.ErrorAttributes
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.reactive.result.view.Rendering
import org.springframework.web.server.ServerWebExchange

@Controller
class MyExceptionHandlingController {

    @GetMapping("/profile")
    fun userProfile(): Rendering {
        // ...
        throw IllegalStateException()
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalState(exchange: ServerWebExchange, exc: IllegalStateException): Rendering {
        exchange.attributes.putIfAbsent(ErrorAttributes.ERROR_ATTRIBUTE, exc)
        return Rendering.view("errorView").modelAttribute("message", exc.message ?: "").build()
    }

}
```

:::

##### 自定义错误页面

如果要为给定状态代码显示自定义 `HTML` 错误页面，可以将文件添加到 `/error` 目录。 错误页面可以是静态 `HTML`（即添加到任何静态资源目录下）或使用模板构建。 文件名应该是准确的状态代码或系列掩码。 

例如，要将 `404` 映射到静态 `HTML` 文件，您的目录结构将如下所示：

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

要使用 `Mustache` 模板映射所有 `5xx` 错误，您的目录结构将如下所示：

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- templates/
             +- error/
             |   +- 5xx.mustache
             +- <other templates>
```





#### 2.1.7 Web 过滤器

`Spring WebFlux` 提供了一个 `WebFilter` 接口，可以实现它来过滤 HTTP 请求-响应交换。 在应用程序上下文中找到的 `WebFilter` beans 将自动用于过滤每个交换。 

在过滤器的顺序很重要的地方，它们可以实现 `Ordered` 或使用 `@Order` 进行注解。 Spring Boot 自动配置可以为您配置 `Web` 过滤器。 执行此操作时，将使用下表中显示的命令：

| Web Filter                                               | Order                            |
| :------------------------------------------------------- | :------------------------------- |
| `ServerHttpObservationFilter` (Micrometer Observability) | `Ordered.HIGHEST_PRECEDENCE + 1` |
| `WebFilterChainProxy` (Spring Security)                  | `-100`                           |
| `HttpExchangesWebFilter`                                 | `Ordered.LOWEST_PRECEDENCE - 10` |



### 2.2 嵌入式响应式服务器支持

Spring Boot 包括对以下嵌入式响应式 `Web` 服务器的支持：`Reactor Netty`、`Tomcat`、`Jetty` 和 `Undertow`。 大多数开发人员使用适当的 `“Starter”` 来获得完全配置的实例。 默认情况下，嵌入式服务器在端口 `8080` 上侦听 `HTTP` 请求。

### 2.3 响应式服务器资源配置

当自动配置 `Reactor Netty` 或 `Jetty` 服务器时，Spring Boot 将创建特定的 bean 来为服务器实例提供 HTTP 资源：`ReactorResourceFactory` 或 `JettyResourceFactory`。

默认情况下，这些资源也将与 `Reactor Netty` 和 `Jetty` 客户端共享以获得最佳性能，前提是： 

- 服务器和客户端使用相同的技术 

- 客户端实例是使用 Spring Boot 自动配置的 `WebClient.Builder` bean 构建的 

开发人员可以通过提供自定义 `ReactorResourceFactory` 或 `JettyResourceFactory` bean 来覆盖 `Jetty` 和 `Reactor Netty` 的资源配置——这将应用于客户端和服务器。 

您可以在 [`WebClient` 运行时部分](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.rest-client.webclient.runtime)了解有关客户端资源配置的更多信息。

## 3 优雅关机

所有四种嵌入式 Web 服务器（`Jetty`、`Reactor Netty`、`Tomcat` 和 `Undertow`）以及反应式和基于 `servlet` 的 Web 应用程序都支持正常关闭。 它作为关闭应用程序上下文的一部分出现，并在停止 `SmartLifecycle` bean 的最早阶段执行。 此停止处理使用超时提供宽限期，在此期间允许完成现有请求但不允许新请求。 不允许新请求的确切方式因所使用的 Web 服务器而异。 `Jetty`、`Reactor Netty` 和 `Tomcat` 将停止在网络层接受请求。 `Undertow` 将接受请求，但会立即响应服务不可用 (`503`) 响应。

::: tip

使用 `Tomcat` 正常关闭需要 `Tomcat 9.0.33` 或更高版本。

:::

要启用正常关机，请配置 `server.shutdown` 属性，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
server.shutdown=graceful
```



@tab Yaml

```yaml
server:
  shutdown: "graceful"
```



:::

要配置超时时间，请配置 `spring.lifecycle.timeout-per-shutdown-phase` 属性，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.lifecycle.timeout-per-shutdown-phase=20s
```



@tab Yaml

```yaml
spring:
  lifecycle:
    timeout-per-shutdown-phase: "20s"
```



:::

::: danger 重要

如果您的 IDE 没有发送正确的 `SIGTERM` 信号，那么使用正常关机可能无法正常工作。 有关详细信息，请参阅 `IDE` 的文档。

::: 

## 4. Spring Security

如果 [`Spring Security`](https://spring.io/projects/spring-security) 在类路径上，则默认情况下 Web 应用程序是安全的。 `Spring Boot` 依赖于 `Spring Security` 的内容协商策略来确定是使用 `httpBasic` 还是 `formLogin`。 要向 Web 应用程序添加方法级安全性，您还可以使用所需的设置添加 `@EnableGlobalMethodSecurity`。 可以在 [`Spring Security` 参考指南](https://docs.spring.io/spring-security/reference/6.0.2/servlet/authorization/method-security.html)中找到更多信息。

默认的 `UserDetailsService` 有一个用户。 用户名为`user`，密码是随机的，在应用程序启动时打印`WARN`级别，如下例所示：

```
Using generated security password: 78fa095d-3f4c-48b1-ad50-e24c31d5cf35

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

::: info 信息

如果您微调日志记录配置，请确保将 `org.springframework.boot.autoconfigure.security` 类别设置为记录 `WARN` 级别的消息。 否则，不会打印默认密码。

:::

您可以通过提供 `spring.security.user.name` 和 `spring.security.user.password` 来更改用户名和密码。 

您在 Web 应用程序中默认获得的基本功能是：

- 具有内存存储的 `UserDetailsService`（或 `ReactiveUserDetailsService`，如果是 `WebFlux` 应用程序）bean 和具有生成密码的单个用户（有关用户的属性，请参阅 [`SecurityProperties.User`](https://docs.spring.io/spring-boot/docs/3.0.3/api/org/springframework/boot/autoconfigure/security/SecurityProperties.User.html)）。 
- 整个应用程序的基于表单的登录或 HTTP 基本安全（取决于请求中的 `Accept` 标头）（如果执行器在类路径上，则包括执行器端点）。 
- 用于发布身份验证事件的 `DefaultAuthenticationEventPublisher`。 

您可以通过为它添加一个 bean 来提供不同的 `AuthenticationEventPublisher`。



### 4.1 MVC Security

默认安全配置在 `SecurityAutoConfiguration` 和 `UserDetailsServiceAutoConfiguration` 中实现。 `SecurityAutoConfiguration` 导入 `SpringBootWebSecurityConfiguration` 用于 Web 安全，`UserDetailsServiceAutoConfiguration` 配置身份验证，这在非 Web 应用程序中也相关。 要完全关闭默认的 Web 应用程序安全配置或组合多个 `Spring Security` 组件（例如 `OAuth2` 客户端和资源服务器），请添加一个 `SecurityFilterChain` 类型的 bean（这样做不会禁用 `UserDetailsService` 配置或 `Actuator` 的安全性）。

 要同时关闭 `UserDetailsService` 配置，您可以添加 `UserDetailsService`、`AuthenticationProvider` 或 `AuthenticationManager` 类型的 bean。 

可以通过添加自定义 `SecurityFilterChain` bean 来覆盖访问规则。 Spring Boot 提供了方便的方法，可用于覆盖执行器端点和静态资源的访问规则。 `EndpointRequest` 可用于创建基于 `management.endpoints.web.base-path` 属性的 `RequestMatcher`。 `PathRequest` 可用于为常用位置的资源创建 `RequestMatcher`。

### 4.2 WebFlux Security

与 Spring MVC 应用程序类似，您可以通过添加 `spring-boot-starter-security` 依赖项来保护您的 WebFlux 应用程序。 默认安全配置在 `ReactiveSecurityAutoConfiguration` 和 `UserDetailsServiceAutoConfiguration` 中实现。 `ReactiveSecurityAutoConfiguration` 导入 WebFluxSecurityConfiguration 用于 Web 安全，`UserDetailsServiceAutoConfiguration` 配置身份验证，这在非 Web 应用程序中也相关。 要完全关闭默认的 Web 应用程序安全配置，您可以添加一个 `WebFilterChainProxy` 类型的 bean（这样做不会禁用 `UserDetailsService` 配置或 `Actuator` 的安全性）。

 要同时关闭 `UserDetailsService` 配置，您可以添加类型为 `ReactiveUserDetailsService` 或 `ReactiveAuthenticationManager` 的 bean。 

可以通过添加自定义 `SecurityWebFilterChain` bean 来配置访问规则和多个 Spring Security 组件（例如 `OAuth 2` 客户端和资源服务器）的使用。 Spring Boot 提供了方便的方法，可用于覆盖执行器端点和静态资源的访问规则。 `EndpointRequest` 可用于创建基于 `management.endpoints.web.base-path` 属性的 `ServerWebExchangeMatcher`。 

`PathRequest` 可用于为常用位置的资源创建 `ServerWebExchangeMatcher`。 

例如，您可以通过添加如下内容来自定义您的安全配置：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.autoconfigure.security.reactive.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration(proxyBeanMethods = false)
public class MyWebFluxSecurityConfiguration {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http.authorizeExchange((exchange) -> {
            exchange.matchers(PathRequest.toStaticResources().atCommonLocations()).permitAll();
            exchange.pathMatchers("/foo", "/bar").authenticated();
        });
        http.formLogin(withDefaults());
        return http.build();
    }

}
```



@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.security.reactive.PathRequest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.web.server.SecurityWebFilterChain

@Configuration(proxyBeanMethods = false)
class MyWebFluxSecurityConfiguration {

    @Bean
    fun springSecurityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        http.authorizeExchange { spec ->
            spec.matchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
            spec.pathMatchers("/foo", "/bar").authenticated()
        }
        http.formLogin()
        return http.build()
    }

}
```



:::

###  4.3. OAuth2

[OAuth2](https://oauth.net/2/) 是 Spring 支持的广泛使用的授权框架。

#### 4.3.1. Client

如果你的类路径上有 `spring-security-oauth2-client`，你可以利用一些自动配置来设置 `OAuth2/Open ID Connect` 客户端。 此配置使用 `OAuth2ClientProperties` 下的属性。 相同的属性适用于 servlet 和反应式应用程序。 

您可以在 `spring.security.oauth2.client` 前缀下注册多个 `OAuth2` 客户端和提供者，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.client.registration.my-client-1.client-id=abcd
spring.security.oauth2.client.registration.my-client-1.client-secret=password
spring.security.oauth2.client.registration.my-client-1.client-name=Client for user scope
spring.security.oauth2.client.registration.my-client-1.provider=my-oauth-provider
spring.security.oauth2.client.registration.my-client-1.scope=user
spring.security.oauth2.client.registration.my-client-1.redirect-uri=https://my-redirect-uri.com
spring.security.oauth2.client.registration.my-client-1.client-authentication-method=basic
spring.security.oauth2.client.registration.my-client-1.authorization-grant-type=authorization_code

spring.security.oauth2.client.registration.my-client-2.client-id=abcd
spring.security.oauth2.client.registration.my-client-2.client-secret=password
spring.security.oauth2.client.registration.my-client-2.client-name=Client for email scope
spring.security.oauth2.client.registration.my-client-2.provider=my-oauth-provider
spring.security.oauth2.client.registration.my-client-2.scope=email
spring.security.oauth2.client.registration.my-client-2.redirect-uri=https://my-redirect-uri.com
spring.security.oauth2.client.registration.my-client-2.client-authentication-method=basic
spring.security.oauth2.client.registration.my-client-2.authorization-grant-type=authorization_code

spring.security.oauth2.client.provider.my-oauth-provider.authorization-uri=https://my-auth-server/oauth/authorize
spring.security.oauth2.client.provider.my-oauth-provider.token-uri=https://my-auth-server/oauth/token
spring.security.oauth2.client.provider.my-oauth-provider.user-info-uri=https://my-auth-server/userinfo
spring.security.oauth2.client.provider.my-oauth-provider.user-info-authentication-method=header
spring.security.oauth2.client.provider.my-oauth-provider.jwk-set-uri=https://my-auth-server/token_keys
spring.security.oauth2.client.provider.my-oauth-provider.user-name-attribute=name
```



@tab Yaml

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          my-client-1:
            client-id: "abcd"
            client-secret: "password"
            client-name: "Client for user scope"
            provider: "my-oauth-provider"
            scope: "user"
            redirect-uri: "https://my-redirect-uri.com"
            client-authentication-method: "basic"
            authorization-grant-type: "authorization_code"

          my-client-2:
            client-id: "abcd"
            client-secret: "password"
            client-name: "Client for email scope"
            provider: "my-oauth-provider"
            scope: "email"
            redirect-uri: "https://my-redirect-uri.com"
            client-authentication-method: "basic"
            authorization-grant-type: "authorization_code"

        provider:
          my-oauth-provider:
            authorization-uri: "https://my-auth-server/oauth/authorize"
            token-uri: "https://my-auth-server/oauth/token"
            user-info-uri: "https://my-auth-server/userinfo"
            user-info-authentication-method: "header"
            jwk-set-uri: "https://my-auth-server/token_keys"
            user-name-attribute: "name"
```



:::

对于支持 OpenID Connect 发现的 [OpenID Connect 提供者](https://openid.net/specs/openid-connect-discovery-1_0.html)，可以进一步简化配置。 提供者需要配置一个 `issuer-uri`，它是断言为其 Issuer 标识符的 URI。 例如，如果提供的 `issuer-uri` 是“https://example.com”，那么将向“https://example.com/.well-known/openid-configuration”发出“OpenID 提供商配置请求” . 结果预计是“OpenID 提供商配置响应”。 以下示例显示了如何使用 `issuer-uri` 配置 OpenID Connect 提供程序：

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.client.provider.oidc-provider.issuer-uri=https://dev-123456.oktapreview.com/oauth2/default/
```

@tab Yaml

```yaml
spring:
  security:
    oauth2:
      client:
        provider:
          oidc-provider:
            issuer-uri: "https://dev-123456.oktapreview.com/oauth2/default/"
```



:::

默认情况下，Spring Security 的 `OAuth2LoginAuthenticationFilter` 只处理匹配 /login/oauth2/code/* 的 URL。 如果你想自定义 `redirect-uri` 以使用不同的模式，你需要提供配置来处理该自定义模式。 例如，对于 servlet 应用程序，您可以添加自己的类似于以下内容的 `SecurityFilterChain`：

::: code-tabs#language
@tab Java

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
public class MyOAuthClientConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((requests) -> requests.anyRequest().authenticated());
        http.oauth2Login((login) -> login.redirectionEndpoint().baseUri("custom-callback"));
        return http.build();
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration(proxyBeanMethods = false)
class MyOAuthClientConfiguration {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests().anyRequest().authenticated()
        http.oauth2Login().redirectionEndpoint().baseUri("custom-callback")
        return http.build()
    }

}
```

:::

::: tip 提示

Spring Boot 自动配置一个 `InMemoryOAuth2AuthorizedClientService` ，Spring Security 使用它来管理客户端注册。 `InMemoryOAuth2AuthorizedClientService` 的功能有限，我们建议仅将其用于开发环境。 对于生产环境，请考虑使用 `JdbcOAuth2AuthorizedClientService` 或创建您自己的 `OAuth2AuthorizedClientService` 实现。

:::

##### 普通提供商的 OAuth2 客户端注册

对于常见的 OAuth2 和 OpenID 提供者，包括 Google、Github、Facebook 和 Okta，我们提供了一组提供者默认值（分别为 `google`、`github`、`facebook` 和 `okta`）。 

如果您不需要自定义这些提供程序，您可以将提供程序属性设置为您需要推断默认值的属性。 此外，如果客户端注册的密钥与默认支持的提供程序匹配，Spring Boot 也会推断出这一点。 

换句话说，以下示例中的两个配置使用了 Google 提供程序：

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.client.registration.my-client.client-id=abcd
spring.security.oauth2.client.registration.my-client.client-secret=password
spring.security.oauth2.client.registration.my-client.provider=google
spring.security.oauth2.client.registration.google.client-id=abcd
spring.security.oauth2.client.registration.google.client-secret=password
```



@tab Yaml

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          my-client:
            client-id: "abcd"
            client-secret: "password"
            provider: "google"
          google:
            client-id: "abcd"
            client-secret: "password"
```

:::

#### 4.3.2 资源服务 （Resource Server）

如果你的类路径上有 `spring-security-oauth2-resource-server`，Spring Boot 可以设置一个 OAuth2 资源服务器。 对于 JWT 配置，需要指定 JWK Set URI 或 OIDC Issuer URI，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://example.com/oauth2/default/v1/keys
```



@tab Yaml

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: "https://example.com/oauth2/default/v1/keys"
```

:::

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://dev-123456.oktapreview.com/oauth2/default/
```



@tab Yaml

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "https://dev-123456.oktapreview.com/oauth2/default/"
```

:::

::: info 信息

如果授权服务器不支持 JWK Set URI，您可以使用用于验证 JWT 签名的公钥配置资源服务器。 这可以使用 `spring.security.oauth2.resourceserver.jwt.public-key-location` 属性来完成，其中的值需要指向包含 PEM 编码 x509 格式的公钥的文件。

:::

相同的属性适用于 servlet 和反应式应用程序。 

或者，您可以为 servlet 应用程序定义自己的 JwtDecoder bean，或者为反应式应用程序定义 ReactiveJwtDecoder。 

在使用不透明令牌而不是 JWT 的情况下，您可以配置以下属性以通过自省验证令牌：

::: code-tabs#language
@tab Properties

```properties
spring.security.oauth2.resourceserver.opaquetoken.introspection-uri=https://example.com/check-token
spring.security.oauth2.resourceserver.opaquetoken.client-id=my-client-id
spring.security.oauth2.resourceserver.opaquetoken.client-secret=my-client-secret
```



@tab Yaml

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          introspection-uri: "https://example.com/check-token"
          client-id: "my-client-id"
          client-secret: "my-client-secret"
```

:::

同样，相同的属性适用于 servlet 和反应式应用程序。 

或者，您可以为 servlet 应用程序定义自己的 `OpaqueTokenIntrospector` bean，或者为反应式应用程序定义 `ReactiveOpaqueTokenIntrospector`。

#### 4.3.3 授权服务（Authorization Server）

您可以使用 [Spring Authorization Server](https://spring.io/projects/spring-authorization-server) 项目来实现 OAuth 2.0 授权服务器。

### 4.4 SAML 2.0

#### 4.4.1 依赖方

如果您的类路径上有 `spring-security-saml2-service-provider`，您可以利用一些自动配置来设置 SAML 2.0 依赖方。 此配置使用 `Saml2RelyingPartyProperties` 下的属性。 

依赖方注册表示身份提供者 IDP 和服务提供者 SP 之间的配对配置。 您可以在 `spring.security.saml2.relyingparty` 前缀下注册多个依赖方，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.security.saml2.relyingparty.registration.my-relying-party1.signing.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party1.signing.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party1.decryption.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party1.decryption.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.url=https://myapp/logout/saml2/slo
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.response-url=https://remoteidp2.slo.url
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.binding=POST
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.verification.credentials[0].certificate-location=path-to-verification-cert
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.entity-id=remote-idp-entity-id1
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.sso-url=https://remoteidp1.sso.url

spring.security.saml2.relyingparty.registration.my-relying-party2.signing.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party2.signing.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party2.decryption.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party2.decryption.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.verification.credentials[0].certificate-location=path-to-other-verification-cert
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.entity-id=remote-idp-entity-id2
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.sso-url=https://remoteidp2.sso.url
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.url=https://remoteidp2.slo.url
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.response-url=https://myapp/logout/saml2/slo
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.binding=POST
```



@tab Yaml

```yaml
spring:
  security:
    saml2:
      relyingparty:
        registration:
          my-relying-party1:
            signing:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            decryption:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            singlelogout:
               url: "https://myapp/logout/saml2/slo"
               response-url: "https://remoteidp2.slo.url"
               binding: "POST"
            assertingparty:
              verification:
                credentials:
                - certificate-location: "path-to-verification-cert"
              entity-id: "remote-idp-entity-id1"
              sso-url: "https://remoteidp1.sso.url"

          my-relying-party2:
            signing:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            decryption:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            assertingparty:
              verification:
                credentials:
                - certificate-location: "path-to-other-verification-cert"
              entity-id: "remote-idp-entity-id2"
              sso-url: "https://remoteidp2.sso.url"
              singlelogout:
                url: "https://remoteidp2.slo.url"
                response-url: "https://myapp/logout/saml2/slo"
                binding: "POST"
```

:::



对于 SAML2 退出，默认情况下，Spring Security 的 `Saml2LogoutRequestFilter` 和 `Saml2LogoutResponseFilter` 仅处理匹配 `/logout/saml2/slo` 的 URL。 如果您想自定义 AP 发起的注销请求发送到的 url 或 AP 将注销响应发送到的 `response-url`，以使用不同的模式，您需要提供配置来处理该自定义模式。 例如，对于 servlet 应用程序，您可以添加自己的类似于以下内容的 `SecurityFilterChain`：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
public class MySamlRelyingPartyConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests().anyRequest().authenticated();
        http.saml2Login();
        http.saml2Logout((saml2) -> saml2.logoutRequest((request) -> request.logoutUrl("/SLOService.saml2"))
            .logoutResponse((response) -> response.logoutUrl("/SLOService.saml2")));
        return http.build();
    }

}
```



## 5. Spring 会话 （Spring Session）

Spring Boot 为各种数据存储提供 [Spring Session](https://spring.io/projects/spring-session) 自动配置。 在构建 servlet web 应用程序时，可以自动配置以下存储：

- Redis

- JDBC

- Hazelcast

- MongoDB

此外[，Apache Geode 为 Spring Boot](https://github.com/spring-projects/spring-boot-data-geode) 提供了使用 Apache Geode 作为[会话存储的自动配置](https://docs.spring.io/spring-boot-data-geode-build/2.0.x/reference/html5/#geode-session)。

`servlet` 自动配置取代了使用`@Enable*HttpSession` 的需要。

如果类路径中存在单个 Spring Session 模块，则 Spring Boot 会自动使用该存储实现。 如果您有多个实现，Spring Boot 使用以下顺序来选择特定的实现：

1. Redis
2. JDBC
3. Hazelcast
4. MongoDB
5. 如果 Redis、JDBC、Hazelcast 和 MongoDB 都不可用，我们不配置 `SessionRepository`。

在构建响应式 Web 应用程序时，可以自动配置以下存储：

- Redis
- MongoDB

反应式自动配置取代了使用@Enable*WebSession 的需要。 

与 servlet 配置类似，如果您有多个实现，Spring Boot 使用以下顺序来选择特定的实现：

- Redis
- MongoDB
- 如果 Redis 和 MongoDB 都不可用，我们不配置 `ReactiveSessionRepository`。 

每个存储都有特定的附加设置。 例如，可以为 JDBC 存储自定义表的名称，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.session.jdbc.table-name=SESSIONS
```

@tab Yaml

```yaml
spring:
  session:
    jdbc:
      table-name: "SESSIONS"
```

:::

要设置会话超时，您可以使用 `spring.session.timeout` 属性。 如果该属性未使用 servlet web 应用程序设置，则自动配置回退到 `server.servlet.session.timeout` 的值。 

您可以使用`@Enable*HttpSession（servlet）`或`@Enable*WebSession`（反应式）来控制 Spring Session 的配置。 这将导致自动配置退出。 然后可以使用注解的属性而不是前面描述的配置属性来配置 Spring Session。

## 6. 用于 GraphQL 的 Spring

如果你想构建 GraphQL 应用程序，你可以利用 Spring Boot 的 `Spring for GraphQL` 自动配置。 `Spring for GraphQL` 项目基于 `GraphQL Java`。 您至少需要 `spring-boot-starter-graphql starter`。 因为 GraphQL 是传输不可知的，你还需要在你的应用程序中有一个或多个额外的启动器来通过网络公开你的 GraphQL API：

| Starter                         | 传输            | 实现                              |
| :------------------------------ | :-------------- | :-------------------------------- |
| `spring-boot-starter-web`       | HTTP            | Spring MVC                        |
| `spring-boot-starter-websocket` | WebSocket       | 用于 Servlet 应用程序的 WebSocket |
| `spring-boot-starter-webflux`   | HTTP, WebSocket | Spring WebFlux                    |
| `spring-boot-starter-rsocket`   | TCP, WebSocket  | Reactor Netty 上的 Spring WebFlux |

### 6.1 GraphQL Schema

Spring GraphQL 应用程序在启动时需要一个已定义的模式。 默认情况下，您可以在 `src/main/resources/graphql/**` 下编写`“.graphqls”`或`“.gqls”`模式文件，Spring Boot 会自动获取它们。 您可以使用 `spring.graphql.schema.locations` 自定义位置，使用 `spring.graphql.schema.file-extensions` 自定义文件扩展名。

::: info 信息

如果您希望 Spring Boot 检测所有应用程序模块中的模式文件和该位置的依赖项，您可以将 `spring.graphql.schema.locations` 设置为`“classpath*:graphql/**/”`（注意 `classpath*: 前缀`）。

:::

在接下来的部分中，我们将考虑这个示例 GraphQL 模式，定义两种类型和两个查询：

```json
type Query {
    greeting(name: String! = "Spring"): String!
    project(slug: ID!): Project
}

""" A Project in the Spring portfolio """
type Project {
    """ Unique string id used in URLs """
    slug: ID!
    """ Project name """
    name: String!
    """ URL of the git repository """
    repositoryUrl: String!
    """ Current support status """
    status: ProjectStatus!
}

enum ProjectStatus {
    """ Actively supported by the Spring team """
    ACTIVE
    """ Supported by the community """
    COMMUNITY
    """ Prototype, not officially supported yet  """
    INCUBATING
    """ Project being retired, in maintenance mode """
    ATTIC
    """ End-Of-Lifed """
    EOL
}
```

::: info 信息

默认情况下，将允许在模式上进行[字段自省](https://spec.graphql.org/draft/#sec-Introspection)，因为它是 GraphiQL 等工具所必需的。 如果您不希望公开有关模式的信息，可以通过将 `spring.graphql.schema.introspection.enabled` 设置为 `false` 来禁用内省。

:::

### 6.2 GraphQL 运行时写入

`GraphQL Java RuntimeWiring.Builder` 可用于注册自定义标量类型、指令、类型解析器、`DataFetcher` 等。 您可以在 Spring 配置中声明 `RuntimeWiringConfigurer` beans 以访问 `RuntimeWiring.Builder`。 Spring Boot 检测到此类 beans 并将它们添加到 [GraphQlSource 构建器](https://docs.spring.io/spring-graphql/docs/1.1.2/reference/html/#execution-graphqlsource)中。 

然而，应用程序通常不会直接实现 DataFetcher，而是创建[带注解的控制器](https://docs.spring.io/spring-graphql/docs/1.1.2/reference/html/#controllers)。 Spring Boot 将自动检测带有注释的处理程序方法的 `@Controller` 类，并将它们注册为 `DataFetcher`。 这是我们使用 @Controller 类的问候语查询的示例实现：

::: code-tabs#language
@tab Java

```java
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GreetingController {

    @QueryMapping
    public String greeting(@Argument String name) {
        return "Hello, " + name + "!";
    }

}
```

@tab Kotlin

```kotlin
;

import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class GreetingController {

    @QueryMapping
    fun greeting(@Argument name: String): String {
        return "Hello, $name!"
    }

}
```



:::

### 6.3 Querydsl 和 QueryByExample 存储库支持

Spring Data 提供对 Querydsl 和 QueryByExample 存储库的支持。 Spring GraphQL 可以[将 Querydsl 和 QueryByExample 存储库配置为 DataFetcher](https://docs.spring.io/spring-graphql/docs/1.1.2/reference/html/#data)。 

使用 `@GraphQlRepository` 注释并扩展以下之一的 Spring Data 存储库：

- `QuerydslPredicateExecutor`
- `ReactiveQuerydslPredicateExecutor`
- `QueryByExampleExecutor`
- `ReactiveQueryByExampleExecutor`

被 Spring Boot 检测到，并被视为 `DataFetcher` 匹配顶级查询的候选者。

### 6.4 传输

#### 6.4.1 HTTP 和 WebSocket

GraphQL HTTP 端点默认位于 HTTP POST `/graphql`。 可以使用 spring.graphql.path 自定义路径。

::: tip 提示

Spring MVC 和 `Spring WebFlux` 的 HTTP 端点由 `@Order` 为 0 的 `RouterFunction` bean 提供。如果您定义自己的 `RouterFunction` beans，您可能需要添加适当的 `@Order` 注释以确保它们被正确排序。

:::

默认情况下，GraphQL WebSocket 端点处于关闭状态。 要启用它： 

- 对于 Servlet 应用程序，添加 WebSocket starter `spring-boot-starter-websocket` 
- 对于 WebFlux 应用程序，不需要额外的依赖 
- 对于两者，必须设置 `spring.graphql.websocket.path` 应用程序属性 

Spring GraphQL 提供了一个 [Web 拦截](https://docs.spring.io/spring-graphql/docs/1.1.2/reference/html/#web-interception)模型。 这对于从 HTTP 请求标头中检索信息并将其设置在 GraphQL 上下文中或从同一上下文中获取信息并将其写入响应标头非常有用。 使用 Spring Boot，您可以声明一个 `WebInterceptor` bean 以将其注册到 Web 传输。 

[Spring MVC](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web.html#mvc-cors) 和 [Spring WebFlux](https://docs.spring.io/spring-framework/docs/6.0.5/reference/html/web-reactive.html#webflux-cors) 支持 CORS（跨源资源共享）请求。 CORS 是从使用不同域的浏览器访问的 GraphQL 应用程序的 Web 配置的关键部分。 

Spring Boot 支持 `spring.graphql.cors.*` 命名空间下的许多配置属性； 这是一个简短的配置示例：

::: code-tabs#language
@tab Properties

```properties
spring.graphql.cors.allowed-origins=https://example.org
spring.graphql.cors.allowed-methods=GET,POST
spring.graphql.cors.max-age=1800s
```



@tab Yaml

```yaml
spring:
  graphql:
    cors:
      allowed-origins: "https://example.org"
      allowed-methods: GET,POST
      max-age: 1800s
```

:::

#### 6.4.2 RSocket

在 `WebSocket` 或 `TCP` 之上，还支持 `RSocket` 作为一种传输方式。 [配置 RSocket 服务器](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.rsocket.server-auto-configuration)后，我们可以使用 `spring.graphql.rsocket.mapping` 在特定路由上配置 `GraphQL` 处理程序。 例如，将该映射配置为 `“graphql”` 意味着我们可以在使用 `RSocketGraphQlClient` 发送请求时将其用作路由。 

Spring Boot 自动配置一个 `RSocketGraphQlClient.Builder<?>` bean，你可以将它注入到你的组件中：

::: code-tabs#language
@tab Java

```java
@Component
public class RSocketGraphQlClientExample {

    private final RSocketGraphQlClient graphQlClient;

    public RSocketGraphQlClientExample(RSocketGraphQlClient.Builder<?> builder) {
        this.graphQlClient = builder.tcp("example.spring.io", 8181).route("graphql").build();
    }
}
```



@tab Kotlin

```kotlin
@Component
class RSocketGraphQlClientExample(private val builder: RSocketGraphQlClient.Builder<*>) {

}
```

:::

然后发送请求：

::: code-tabs#language
@tab Java

```java
Mono<Book> book = this.graphQlClient.document("{ bookById(id: \"book-1\"){ id name pageCount author } }")
    .retrieve("bookById")
    .toEntity(Book.class);
```



@tab Kotlin

```kotlin
val book = graphQlClient.document(
    """
    {
        bookById(id: "book-1"){
            id
            name
            pageCount
            author
        }
    }               
    """
)
    .retrieve("bookById").toEntity(Book::class.java)

```

:::

### 6.5 异常处理

Spring GraphQL 使应用程序能够注册一个或多个按顺序调用的 Spring `DataFetcherExceptionResolver` 组件。 Exception 必须解析为 `graphql.GraphQLError` 对象列表，请参阅 [`Spring GraphQL` 异常处理文档](https://docs.spring.io/spring-graphql/docs/1.1.2/reference/html/#execution-exceptions)。 Spring Boot 将自动检测 `DataFetcherExceptionResolver` bean 并将它们注册到 GraphQlSource.Builder。

### 6.6 GraphiQL 和 Schema 打印

Spring GraphQL 提供了基础设施来帮助开发人员使用或开发 GraphQL API。 

Spring GraphQL 附带一个默认的 [GraphiQL](https://github.com/graphql/graphiql) 页面，默认情况下在 `“/graphiql”` 中公开。 默认情况下禁用此页面，可以使用 `spring.graphql.graphiql.enabled` 属性打开。 许多公开此类页面的应用程序将更喜欢自定义构建。 默认实现在开发过程中非常有用，这就是为什么在开发过程中使用 [`spring-boot-devtools`](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) 自动公开它的原因。 

当启用 `spring.graphql.schema.printer.enabled` 属性时，您还可以选择在 `/graphql/schema` 以文本格式公开 GraphQL 模式。

## Spring HATEOAS

如果您开发一个使用超媒体的 RESTful API，Spring Boot 会为 Spring HATEOAS 提供自动配置，它适用于大多数应用程序。 自动配置取代了使用`@EnableHypermediaSupport` 的需要，并注册了许多 bean 以简化构建基于超媒体的应用程序，包括一个 `LinkDiscoverers`（用于客户端支持）和一个配置为将响应正确编组为所需表示的 `ObjectMapper`。 `ObjectMapper` 是通过设置各种 spring.jackson.* 属性来定制的，或者如果存在的话，通过 `Jackson2ObjectMapperBuilder` bean 来定制。 

您可以使用 `@EnableHypermediaSupport` 控制 Spring HATEOAS 的配置。 请注意，这样做会禁用前面描述的 `ObjectMapper` 自定义。

::: warning 警告

`spring-boot-starter-hateoas` 特定于 Spring MVC，不应与 Spring WebFlux 结合使用。 为了将 Spring HATEOAS 与 Spring WebFlux 一起使用，您可以添加对 `org.springframework.hateoas:spring-hateoas` 以及 `spring-boot-starter-webflux` 的直接依赖。

:::