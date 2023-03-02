# 文档概述

关于文档，第一步以及更多。

本节简要概述了Spring Boot参考文档。它作为文档其余部分的地图。

该文档的最新副本可从 [docs.spring.io/spring-boot/docs/current/reference/](https://docs.spring.io/spring-boot/docs/current/reference/) 获得。

## 1 第一步

如果您开始使用 Spring Boot 或  'Spring' ，请从 [以下主题](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html#getting-started) 开始：

- 从头开始：概述 | 要求 | 安装
- 教程：第1部分 | 第2部分
- 运行示例：第1部分 | 第2部分

## 2 从一个更早的版本升级

您应该始终确保运行的是[受支持的 Spring Boot 版本](https://github.com/spring-projects/spring-boot/wiki/Supported-Versions)。

根据您要升级到的版本，您可以在此处找到一些其他提示：

- 从1.x开始：[从1.x升级](https://docs.spring.io/spring-boot/docs/current/reference/html/upgrading.html#upgrading.from-1x)
- 到新的功能版本：[升级到新功能版本](https://docs.spring.io/spring-boot/docs/current/reference/html/upgrading.html#upgrading.to-feature)
- Spring Boot CLI：[升级 Spring Boot CLI](https://docs.spring.io/spring-boot/docs/current/reference/html/upgrading.html#upgrading.cli)

## 3 使用 SpringBoot 开发

准备好真正开始使用Spring Boot了吗？我们[为您提供](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using)了：

- 构建系统：[Maven](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.maven) | [Gradle](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.gradle) | [Ant](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.ant) | [Starters](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters)
- 最佳实践：[代码结构](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.structuring-your-code) | [@Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.configuration-classes) |  [@EnableAutoConfiguration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration)  |  [Beans和依赖注入](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.spring-beans-and-dependency-injection)
- 运行代码：[IDE](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.running-your-application.from-an-ide) | [打包](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.running-your-application.as-a-packaged-application) | [Maven](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.running-your-application.with-the-maven-plugin) | [Gradle](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.running-your-application.with-the-gradle-plugin)
- 包装应用程序：[生产 jar 包](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.packaging-for-production)
- Spring Boot CLI：[使用CLI](https://docs.spring.io/spring-boot/docs/current/reference/html/cli.html#cli)

## 4 了解SpringBoot 相关功能

需要更多有关Spring Boot核心功能的详细信息吗？[以下内容适合您](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features)：

- Spring应用程序：[SpringApplication](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application)
- 外部配置：[外部配置](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- 配置文件：[配置文件](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles)
- 日志记录：[日志记录](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)

## 5 Web

如果您开发Spring Boot web应用程序，请查看以下内容：

- Servlet Web应用程序：[Spring MVC、Jersey、嵌入式Servlet容器](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet)
- 响应式Web应用程序：[Spring Webflux、嵌入式Servlet容器](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.reactive)
- 优雅停机：[优雅停机](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.graceful-shutdown)
- Spring Security：[默认安全配置，OAuth2的自动配置，SAML](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.security)
- Spring Session：[Spring Session 的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.spring-session)
- Spring HATEOAS：[Spring HATEOAS 的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.spring-hateoas)

## 6 数据

如果您的应用程序处理数据存储，您可以在此处查看如何配置：

- SQL：[配置SQL数据存储、嵌入式数据库支持、连接池等。](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql)
- NOSQL：[自动配置NOSQL存储，如Redis、MongoDB、Neo4j等。](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql)

## 7 消息

如果应用程序使用任何消息传递协议，请参阅以下一节或多节：

- JMS：[ActiveMQ 和 Artemis 的自动配置，通过 JMS 发送和接收消息](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.jms)
- AMQP：[RabbitMQ 的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.amqp)
- Kafka：[Spring Kafka 的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.kafka)
- RSocket：[SpringFramework 的 RSocket 支持的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.rsocket)
- Spring集成：[Spring 集成的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.spring-integration)

## 8 IO

如果应用程序需要IO功能，请参阅以下一节或多节：

- 缓存：[EhCache、Hazelcast、Infinispan等的缓存支持](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching)
- Quartz：[Quartz 调度](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.quartz)
- 邮件：[发送电子邮件](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)
- 验证：[JSR-303 验证](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.validation)
- REST客户端：[使用 RestTemplate 和 WebClient 调用 REST 服务](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.rest-client)
- Web服务：[SpringWeb 服务的自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.webservices)
- JTA：[与 JTA 的分布式事务](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.jta)

## 9 容器镜像

Spring Boot为构建高效的容器映像提供了一流的支持。您可以在此处阅读更多信息：

- 高效容器镜像：[优化容器镜像（如 Docker 镜像）的提示](https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html#container-images.efficient-images)
- Dockerfiles: [使用 Dockerfiles 构建容器镜像](https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html#container-images.dockerfiles)
- Cloud Native Buildpacks: [支持带有 Maven 和 Gradle 的 Cloud Native Build packs。](https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html#container-images.buildpacks)

## 10 GraalVM 原生镜像

可以使用 GraalVM 将 Spring Boot 应用程序转换为本地可执行文件。您可以在此处阅读有关我们的本地映像支持的更多信息：

- GraalVM本机映像：[简介](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.introducing-graalvm-native-images) | [与JVM的关键区别](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.introducing-graalvm-native-images.key-differences-with-jvm-deployments) | [提前处理](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.introducing-graalvm-native-images.understanding-aot-processing)
- 入门：[Buildpacks](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.developing-your-first-application.buildpacks)  |  [原生构建工具](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.developing-your-first-application.native-build-tools)
- 测试：[JVM](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.testing.with-the-jvm) | [原生构建工具](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.testing.with-the-jvm)
- 高级主题： [嵌套配置属性](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.advanced.nested-configuration-properties) | [转换 JAR](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.advanced.converting-executable-jars)  | [已知限制](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.advanced.known-limitations)

## 11 高级专题

最后，我们为高级用户提供了几个主题：

- Spring Boot 应用程序部署：[云部署](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html#deployment.cloud) |  [OS服务](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html#deployment.installing.nix-services)
- 构建工具插件：[Maven](https://docs.spring.io/spring-boot/docs/current/reference/html/build-tool-plugins.html#build-tool-plugins.maven) | [Gradle](https://docs.spring.io/spring-boot/docs/current/reference/html/build-tool-plugins.html#build-tool-plugins.gradle)

附录：[应用属性](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties) | [配置元数据](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html#appendix.configuration-metadata) | [自动配置类](https://docs.spring.io/spring-boot/docs/current/reference/html/auto-configuration-classes.html#appendix.auto-configuration-classes) | [测试自动配置注解](https://docs.spring.io/spring-boot/docs/current/reference/html/test-auto-configuration.html#appendix.test-auto-configuration) | [可执行Jars](https://docs.spring.io/spring-boot/docs/current/reference/html/executable-jar.html#appendix.executable-jar)  | [依赖关系版本](