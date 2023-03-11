# 消息

Spring Framework 为与消息系统集成提供了广泛的支持，从使用 `JmsTemplate` 简化 JMS API 的使用到完整的基础设施以异步接收消息。 Spring AMQP 为高级消息队列协议提供了类似的功能集。 Spring Boot 还为 `RabbitTemplate` 和 RabbitMQ 提供了自动配置选项。 Spring WebSocket 原生包含对 STOMP 消息传递的支持，而 Spring Boot 通过启动器和少量自动配置支持该功能。 Spring Boot 还支持 Apache Kafka。

## 1. JMS

### 1.1 ActiveMQ Artemis 支持

Spring Boot 可以在检测到 ActiveMQ Artemis 在类路径上可用时自动配置 `ConnectionFactory`。 如果代理存在，嵌入式代理会自动启动和配置（除非已显式设置模式属性）。 支持的模式是嵌入式的（明确表示需要嵌入式代理，如果代理在类路径上不可用，则应该发生错误）和本机的（使用 netty 传输协议连接到代理）。 配置后者时，Spring Boot 配置一个 `ConnectionFactory`，它使用默认设置连接到在本地计算机上运行的代理。

::: info 信息

如果您使用 `spring-boot-starter-artemis`，则会提供连接到现有 `ActiveMQ Artemis` 实例所需的依赖项，以及与 JMS 集成的 Spring 基础设施。 将 `org.apache.activemq:artemis-jakarta-server` 添加到您的应用程序可让您使用嵌入式模式。

:::

ActiveMQ Artemis 配置由 `spring.artemis.*` 中的外部配置属性控制。 例如，您可以在 `application.properties` 中声明以下部分：

::: code-tabs#language
@tab Properties

```properties
spring.artemis.mode=native
spring.artemis.broker-url=tcp://192.168.1.210:9876
spring.artemis.user=admin
spring.artemis.password=secret
```

@tab Yaml

```yaml
spring:
  artemis:
    mode: native
    broker-url: "tcp://192.168.1.210:9876"
    user: "admin"
    password: "secret"
```

:::

嵌入代理时，您可以选择是否要启用持久性并列出应该可用的目的地。 这些可以指定为逗号分隔列表以使用默认选项创建它们，或者您可以定义类型为 `org.apache.activemq.artemis.jms.server.config.JMSQueueConfiguration` 或 `org.apache.activemq` 的 bean。 `artemis.jms.server.config.TopicConfiguration`，分别用于高级队列和主题配置。

默认情况下，`CachingConnectionFactory` 使用合理的设置包装本机 `ConnectionFactory`，您可以通过 `spring.jms.*` 中的外部配置属性控制这些设置：

::: code-tabs#language
@tab Properties

```properties
spring.jms.cache.session-cache-size=5
```

@tab Yaml

```yaml
spring:
  jms:
    cache:
      session-cache-size: 5
```

:::

如果您更愿意使用本机池，您可以通过添加对 `org.messaginghub:pooled-jms` 的依赖并相应地配置 `JmsPoolConnectionFactory` 来实现，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.artemis.pool.enabled=true
spring.artemis.pool.max-connections=50
```

@tab Yaml

```yaml
spring:
  artemis:
    pool:
      enabled: true
      max-connections: 50
```

:::

有关更多受支持的选项，请参阅 [ArtemisProperties](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jms/artemis/ArtemisProperties.java)。 

不涉及 JNDI 查找，目的地是根据它们的名称解析的，使用 Artemis 配置中的名称属性或通过配置提供的名称。

### 1.2 使用 JNDI ConnectionFactory

如果您在应用程序服务器中运行应用程序，Spring Boot 会尝试使用 JNDI 定位 `JMS ConnectionFactory`。 默认情况下，会检查 `java:/JmsXA` 和 `java:/XAConnectionFactory` 位置。 如果需要指定替代位置，可以使用 `spring.jms.jndi-name` 属性，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.jms.jndi-name=java:/MyConnectionFactory
```

@tab Yaml

```yaml
spring:
  jms:
    jndi-name: "java:/MyConnectionFactory"
```

:::

### 1.3 发送消息

Spring 的 `JmsTemplate` 是自动配置的，您可以将其直接自动装配到您自己的 bean 中，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final JmsTemplate jmsTemplate;

    public MyBean(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void someMethod() {
        this.jmsTemplate.convertAndSend("hello");
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val jmsTemplate: JmsTemplate) {

    fun someMethod() {
        jmsTemplate.convertAndSend("hello")
    }

}
```

:::

::: info 信息

`JmsMessagingTemplate` 可以以类似的方式注入。 如果定义了 `DestinationResolver` 或 `MessageConverter` bean，它会自动关联到自动配置的 `JmsTemplate`。

:::

### 1.4 接收消息

当存在 JMS 基础结构时，任何 bean 都可以使用 `@JmsListener` 进行注解创建侦听器端点。 如果未定义 `JmsListenerContainerFactory`，则会自动配置默认值。 如果定义了 `DestinationResolver`、`MessageConverter` 或 `jakarta.jms.ExceptionListener` bean，它们将自动与默认工厂相关联。

默认情况下，默认工厂是事务性的。 如果您在存在 `JtaTransactionManager` 的基础架构中运行，则默认情况下它与侦听器容器相关联。 如果不是，则启用 `sessionTransacted` 标志。 在后一种情况下，您可以通过在侦听器方法（或其委托）上添加 `@Transactional` 将本地数据存储事务关联到传入消息的处理。 这确保在本地事务完成后传入消息得到确认。 这还包括发送已在同一 JMS 会话上执行的响应消息。

以下组件在 `someQueue` 目标上创建一个侦听器端点：

::: code-tabs#language
@tab Java

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @JmsListener(destination = "someQueue")
    public void processMessage(String content) {
        // ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

    @JmsListener(destination = "someQueue")
    fun processMessage(content: String?) {
        // ...
    }

}
```

:::

::: tip 提示

有关详细信息，请参阅 [@EnableJms 的 Javadoc](https://docs.spring.io/spring-framework/docs/6.0.6/javadoc-api/org/springframework/jms/annotation/EnableJms.html) 。

:::

如果您需要创建更多 `JmsListenerContainerFactory` 实例，或者如果您想要覆盖默认值，Spring Boot 提供了一个 `DefaultJmsListenerContainerFactoryConfigurer`，您可以使用它来初始化一个 `DefaultJmsListenerContainerFactory`，其设置与自动配置的设置相同。 

例如，以下示例公开了另一个使用特定 `MessageConverter` 的工厂：

::: code-tabs#language
@tab Java

```java
import jakarta.jms.ConnectionFactory;

import org.springframework.boot.autoconfigure.jms.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

@Configuration(proxyBeanMethods = false)
public class MyJmsConfiguration {

    @Bean
    public DefaultJmsListenerContainerFactory myFactory(DefaultJmsListenerContainerFactoryConfigurer configurer) {
        DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
        ConnectionFactory connectionFactory = getCustomConnectionFactory();
        configurer.configure(factory, connectionFactory);
        factory.setMessageConverter(new MyMessageConverter());
        return factory;
    }

    private ConnectionFactory getCustomConnectionFactory() {
        return ...
    }

}
```

@tab Kotlin

```kotlin
import jakarta.jms.ConnectionFactory
import org.springframework.boot.autoconfigure.jms.DefaultJmsListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.config.DefaultJmsListenerContainerFactory

@Configuration(proxyBeanMethods = false)
class MyJmsConfiguration {

    @Bean
    fun myFactory(configurer: DefaultJmsListenerContainerFactoryConfigurer): DefaultJmsListenerContainerFactory {
        val factory = DefaultJmsListenerContainerFactory()
        val connectionFactory = getCustomConnectionFactory()
        configurer.configure(factory, connectionFactory)
        factory.setMessageConverter(MyMessageConverter())
        return factory
    }

    fun getCustomConnectionFactory() : ConnectionFactory? {
        return ...
    }

}
```

:::

然后你可以在任何 `@JmsListener` 注解的方法中使用工厂，如下所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @JmsListener(destination = "someQueue", containerFactory = "myFactory")
    public void processMessage(String content) {
        // ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

    @JmsListener(destination = "someQueue", containerFactory = "myFactory")
    fun processMessage(content: String?) {
        // ...
    }

}
```

:::

## 2. AMQP

高级消息队列协议 (AMQP) 是面向消息的中间件的平台中立的线路级协议。 Spring AMQP 项目将核心 Spring 概念应用于基于 AMQP 的消息传递解决方案的开发。 Spring Boot 为通过 `RabbitMQ` 使用 AMQP 提供了多种便利，包括 `spring-boot-starter-amqp` “Starter”。

### 2.1 RabbitMQ 支持

[`RabbitMQ`](https://www.rabbitmq.com/) 是一种基于 AMQP 协议的轻量级、可靠、可扩展且可移植的消息代理。 Spring 使用 RabbitMQ 通过 AMQP 协议进行通信。 

RabbitMQ 配置由 `spring.rabbitmq.*` 中的外部配置属性控制。 例如，您可以在 `application.properties` 中声明以下部分：

::: code-tabs#language
@tab Properties

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=secret
```

@tab Yaml

```yaml
spring:
  rabbitmq:
    host: "localhost"
    port: 5672
    username: "admin"
    password: "secret"
```

:::

或者，您可以使用地址属性配置相同的连接：

::: code-tabs#language
@tab Properties

```properties
spring.rabbitmq.addresses=amqp://admin:secret@localhost
```

@tab Yaml

```yaml
spring:
  rabbitmq:
    addresses: "amqp://admin:secret@localhost"
```

:::

::: info 信息

以这种方式指定地址时，将忽略主机和端口属性。 如果该地址使用 amqps 协议，则会自动启用 `SSL` 支持。

:::

有关更多受支持的基于属性的配置选项，请参阅 [`RabbitProperties`](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/amqp/RabbitProperties.java)。 要配置 Spring AMQP 使用的 RabbitMQ `ConnectionFactory` 的较低级别详细信息，请定义一个 `ConnectionFactoryCustomizer` bean。 

如果上下文中存在 `ConnectionNameStrategy` bean，它将自动用于命名由自动配置的 `CachingConnectionFactory` 创建的连接。

::: tip 提示

有关详细信息，请参阅[了解 AMQP，RabbitMQ 使用的协议](https://spring.io/blog/2010/06/14/understanding-amqp-the-protocol-used-by-rabbitmq/)。

:::



### 2.2 发送消息

Spring 的 `AmqpTemplate` 和 `AmqpAdmin` 是自动配置的，您可以将它们直接自动装配到您自己的 bean 中，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final AmqpAdmin amqpAdmin;

    private final AmqpTemplate amqpTemplate;

    public MyBean(AmqpAdmin amqpAdmin, AmqpTemplate amqpTemplate) {
        this.amqpAdmin = amqpAdmin;
        this.amqpTemplate = amqpTemplate;
    }

    public void someMethod() {
        this.amqpAdmin.getQueueInfo("someQueue");
    }

    public void someOtherMethod() {
        this.amqpTemplate.convertAndSend("hello");
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.amqp.core.AmqpAdmin
import org.springframework.amqp.core.AmqpTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val amqpAdmin: AmqpAdmin, private val amqpTemplate: AmqpTemplate) {

    fun someMethod() {
        amqpAdmin.getQueueInfo("someQueue")
    }

    fun someOtherMethod() {
        amqpTemplate.convertAndSend("hello")
    }

}
```

:::

::: info 信息

[RabbitMessagingTemplate](https://docs.spring.io/spring-amqp/docs/3.0.2/api/org/springframework/amqp/rabbit/core/RabbitMessagingTemplate.html) 可以以类似的方式注入。 如果定义了 `MessageConverter` bean，它会自动关联到自动配置的 `AmqpTemplate`。

:::

如有必要，任何定义为 bean 的 `org.springframework.amqp.core.Queue` 都会自动用于在 RabbitMQ 实例上声明相应的队列。 

要重试操作，您可以在 `AmqpTemplate` 上启用重试（例如，在代理连接丢失的情况下）：

::: code-tabs#language
@tab Properties

```properties
spring.rabbitmq.template.retry.enabled=true
spring.rabbitmq.template.retry.initial-interval=2s
```

@tab Yaml

```yaml
spring:
  rabbitmq:
    template:
      retry:
        enabled: true
        initial-interval: "2s"
```

:::

默认情况下禁用重试。 您还可以通过声明 `RabbitRetryTemplateCustomizer` bean 以编程方式自定义 `RetryTemplate`。

如果您需要创建更多 `RabbitTemplate` 实例，或者如果您想要覆盖默认值，Spring Boot 提供了一个 `RabbitTemplateConfigurer` bean，您可以使用它来初始化 `RabbitTemplate`，其设置与自动配置所使用的工厂相同。

### 2.3 向流发送消息

要向特定流发送消息，请指定流的名称，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.rabbitmq.stream.name=my-stream
```

@tab Yaml

```yaml
spring:
  rabbitmq:
    stream:
      name: "my-stream"
```

:::

如果定义了 `MessageConverter`、`StreamMessageConverter` 或 `ProducerCustomizer` bean，它会自动关联到自动配置的 `RabbitStreamTemplate`。 

如果您需要创建更多的 `RabbitStreamTemplate` 实例，或者如果您想要覆盖默认值，Spring Boot 提供了一个 `RabbitStreamTemplateConfigurer` bean，您可以使用它来初始化 `RabbitStreamTemplate`，其设置与自动配置所使用的工厂相同。

### 2.4 接收消息

当存在 Rabbit 基础结构时，任何 bean 都可以使用 `@RabbitListener` 进行注解以创建监听器端点。 如果未定义 `RabbitListenerContainerFactory`，则会自动配置默认的 `SimpleRabbitListenerContainerFactory`，您可以使用 `spring.rabbitmq.listener.type` 属性切换到直接容器。 如果定义了 `MessageConverter` 或 MessageRecoverer bean，它会自动与默认工厂相关联。

以下示例组件在 `someQueue` 队列上创建一个监听器端点：

::: code-tabs#language
@tab Java

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @RabbitListener(queues = "someQueue")
    public void processMessage(String content) {
        // ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class MyBean {

    @RabbitListener(queues = ["someQueue"])
    fun processMessage(content: String?) {
        // ...
    }

}
```

:::

::: tip 提示

有关详细信息，请参阅 [@EnableRabbit 的 Javadoc](https://docs.spring.io/spring-amqp/docs/3.0.2/api/org/springframework/amqp/rabbit/annotation/EnableRabbit.html)。

:::

如果您需要创建更多 `RabbitListenerContainerFactory` 实例，或者如果您想要覆盖默认值，Spring Boot 提供了一个 `SimpleRabbitListenerContainerFactoryConfigurer` 和一个 `DirectRabbitListenerContainerFactoryConfigurer` ，您可以使用它们来初始化 `SimpleRabbitListenerContainerFactory` 和 `DirectRabbitListenerContainerFactory` ，其设置与自动配置使用的工厂相同。

::: tip 提示

选择哪种容器类型并不重要。 这两个 bean 由自动配置公开。 

:::

例如，以下配置类公开了另一个使用特定 `MessageConverter` 的工厂：

::: code-tabs#language
@tab Java

```java
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyRabbitConfiguration {

    @Bean
    public SimpleRabbitListenerContainerFactory myFactory(SimpleRabbitListenerContainerFactoryConfigurer configurer) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        ConnectionFactory connectionFactory = getCustomConnectionFactory();
        configurer.configure(factory, connectionFactory);
        factory.setMessageConverter(new MyMessageConverter());
        return factory;
    }

    private ConnectionFactory getCustomConnectionFactory() {
        return ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyRabbitConfiguration {

    @Bean
    fun myFactory(configurer: SimpleRabbitListenerContainerFactoryConfigurer): SimpleRabbitListenerContainerFactory {
        val factory = SimpleRabbitListenerContainerFactory()
        val connectionFactory = getCustomConnectionFactory()
        configurer.configure(factory, connectionFactory)
        factory.setMessageConverter(MyMessageConverter())
        return factory
    }

    fun getCustomConnectionFactory() : ConnectionFactory? {
        return ...
    }

}

```

:::

然后你可以在任何`@RabbitListener` 注解的方法中使用工厂，如下所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @RabbitListener(queues = "someQueue", containerFactory = "myFactory")
    public void processMessage(String content) {
        // ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class MyBean {

    @RabbitListener(queues = ["someQueue"], containerFactory = "myFactory")
    fun processMessage(content: String?) {
        // ...
    }

}
```

:::

您可以启用重试来处理侦听器抛出异常的情况。 默认情况下，使用 RejectAndDontRequeueRecoverer，但您可以定义自己的 MessageRecoverer。 当重试次数用尽时，消息将被拒绝并丢弃或路由到死信交换（如果代理配置为这样做）。 默认情况下，重试是禁用的。 您还可以通过声明 RabbitRetryTemplateCustomizer bean 以编程方式自定义 RetryTemplate。

::: error 重要

默认情况下，如果禁用重试并且侦听器抛出异常，则会无限期地重试传递。 您可以通过两种方式修改此行为：将 `defaultRequeueRejected` 属性设置为 `false`，以便尝试零次重新传递，或者抛出 `AmqpRejectAndDontRequeueException` 以指示消息应该被拒绝。 后者是启用重试并达到最大投递尝试次数时使用的机制。

:::



## 3. Apache Kafka 支持

通过提供 `spring-kafka` 项目的自动配置来支持 Apache Kafka。

Kafka 配置由 `spring.kafka.*` 中的外部配置属性控制。 例如，您可以在 `application.properties` 中声明以下部分：

::: code-tabs#language
@tab Properties

```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=myGroup
```

@tab Yaml

```yaml
spring:
  kafka:
    bootstrap-servers: "localhost:9092"
    consumer:
      group-id: "myGroup"
```

:::

::: tip 提示

要在启动时创建主题，请添加一个 `NewTopic` 类型的 bean。 如果主题已经存在，则忽略该 bean。

:::

有关更多受支持的选项，请参阅 [KafkaProperties](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/kafka/KafkaProperties.java)。

### 3.1 发送消息

Spring 的 `KafkaTemplate` 是自动配置的，你可以直接在你自己的 beans 中自动装配它，如下例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public MyBean(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void someMethod() {
        this.kafkaTemplate.send("someTopic", "Hello");
    }

}

```

@tab Kotlin

```kotlin
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val kafkaTemplate: KafkaTemplate<String, String>) {

    fun someMethod() {
        kafkaTemplate.send("someTopic", "Hello")
    }

}
```

:::

::: info 信息

如果属性 `spring.kafka.producer.transaction-id-prefix` 被定义，一个 `KafkaTransactionManager` 被自动配置。 此外，如果定义了 `RecordMessageConverter` bean，它会自动关联到自动配置的 `KafkaTemplate`。

:::

### 3.2 接收消息

当 Apache Kafka 基础设施存在时，任何 bean 都可以用 @KafkaListener 注释以创建监听器端点。 如果没有定义 `KafkaListenerContainerFactory`，默认的会自动配置 `spring.kafka.listener.*` 中定义的键。 

以下组件在 `someTopic` 主题上创建一个监听器端点：

::: code-tabs#language
@tab Java

```java
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @KafkaListener(topics = "someTopic")
    public void processMessage(String content) {
        // ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class MyBean {

    @KafkaListener(topics = ["someTopic"])
    fun processMessage(content: String?) {
        // ...
    }

}
```

:::

如果定义了 `KafkaTransactionManager` bean，它会自动关联到容器工厂。 同样，如果定义了 `RecordFilterStrategy`、`CommonErrorHandler`、`AfterRollbackProcessor` 或 `ConsumerAwareRebalanceListener` bean，它会自动关联到默认工厂。 

根据监听器类型，将 `RecordMessageConverter` 或 `BatchMessageConverter` bean 关联到默认工厂。 如果批处理侦听器只存在 `RecordMessageConverter` bean，则它被包装在 `BatchMessageConverter` 中。

::: tip 提示

自定义 `ChainedKafkaTransactionManager` 必须标记为 `@Primary`，因为它通常引用自动配置的 `KafkaTransactionManager` bean。

:::



### 3.3 Kafka 流

Apache Kafka 的 Spring 提供了一个工厂 bean 来创建 StreamsBuilder 对象并管理其流的生命周期。 只要 `kafka-streams` 在类路径上并且 Kafka Streams 由 `@EnableKafkaStreams` 注释启用，Spring Boot 就会自动配置所需的 `KafkaStreamsConfiguration` bean。

启用 Kafka Streams 意味着必须设置应用程序 ID 和引导服务器。 前者可以使用 `spring.kafka.streams.application-id` 配置，如果未设置则默认为 `spring.application.name`。 后者可以全局设置或专门为流覆盖。

使用专用属性可以使用几个附加属性； 可以使用 `spring.kafka.streams.properties` 命名空间设置其他任意 Kafka 属性。 有关更多信息，另请参阅其他 Kafka 属性。 

要使用工厂 bean，请将 `StreamsBuilder` 连接到您的 `@Bean` 中，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafkaStreams;
import org.springframework.kafka.support.serializer.JsonSerde;

@Configuration(proxyBeanMethods = false)
@EnableKafkaStreams
public class MyKafkaStreamsConfiguration {

    @Bean
    public KStream<Integer, String> kStream(StreamsBuilder streamsBuilder) {
        KStream<Integer, String> stream = streamsBuilder.stream("ks1In");
        stream.map(this::uppercaseValue).to("ks1Out", Produced.with(Serdes.Integer(), new JsonSerde<>()));
        return stream;
    }

    private KeyValue<Integer, String> uppercaseValue(Integer key, String value) {
        return new KeyValue<>(key, value.toUpperCase());
    }

}
```

@tab Kotlin

```kotlin
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KeyValue
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.kstream.KStream
import org.apache.kafka.streams.kstream.Produced
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafkaStreams
import org.springframework.kafka.support.serializer.JsonSerde

@Configuration(proxyBeanMethods = false)
@EnableKafkaStreams
class MyKafkaStreamsConfiguration {

    @Bean
    fun kStream(streamsBuilder: StreamsBuilder): KStream<Int, String> {
        val stream = streamsBuilder.stream<Int, String>("ks1In")
        stream.map(this::uppercaseValue).to("ks1Out", Produced.with(Serdes.Integer(), JsonSerde()))
        return stream
    }

    private fun uppercaseValue(key: Int, value: String): KeyValue<Int?, String?> {
        return KeyValue(key, value.uppercase())
    }

}
```

:::

默认情况下，由 `StreamBuilder` 对象管理的流是自动启动的。 您可以使用 `spring.kafka.streams.auto-startup` 属性自定义此行为。

### 3.4 额外的 Kafka 属性

自动配置支持的属性显示在附录的 [“集成属性”](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.integration) 部分。 请注意，在大多数情况下，这些属性（连字符或驼峰式）直接映射到 Apache Kafka 点属性。 有关详细信息，请参阅 Apache Kafka 文档。 

这些属性中的前几个适用于所有组件（生产者、消费者、管理员和流），但如果您希望使用不同的值，可以在组件级别指定。 Apache Kafka 指定具有高、中或低重要性的属性。 Spring Boot 自动配置支持所有高重要性属性、一些选定的中等和低属性以及任何没有默认值的属性。 

只有 Kafka 支持的属性的子集可以直接通过 `KafkaProperties` 类获得。 如果您希望使用不直接支持的其他属性配置生产者或消费者，请使用以下属性：

::: code-tabs#language
@tab Properties

```properties
spring.kafka.properties[prop.one]=first
spring.kafka.admin.properties[prop.two]=second
spring.kafka.consumer.properties[prop.three]=third
spring.kafka.producer.properties[prop.four]=fourth
spring.kafka.streams.properties[prop.five]=fifth
```

@tab Yaml

```yaml
spring:
  kafka:
    properties:
      "[prop.one]": "first"
    admin:
      properties:
        "[prop.two]": "second"
    consumer:
      properties:
        "[prop.three]": "third"
    producer:
      properties:
        "[prop.four]": "fourth"
    streams:
      properties:
        "[prop.five]": "fifth"
```

:::

这将共同的 `prop.one` Kafka 属性设置为 `first`（适用于生产者、消费者和管理员），prop.two 管理属性设置为`second`，`prop.three` 消费者属性设置为 `third`，`prop.four` 生产者属性设置为 `fourth`，`prop.five` stream 属性为 `fifth`。 

您还可以按如下方式配置 Spring Kafka `JsonDeserializer`：

::: code-tabs#language
@tab Properties

```properties
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties[spring.json.value.default.type]=com.example.Invoice
spring.kafka.consumer.properties[spring.json.trusted.packages]=com.example.main,com.example.another
```

@tab Yaml

```yaml
spring:
  kafka:
    consumer:
      value-deserializer: "org.springframework.kafka.support.serializer.JsonDeserializer"
      properties:
        "[spring.json.value.default.type]": "com.example.Invoice"
        "[spring.json.trusted.packages]": "com.example.main,com.example.another"
```

:::

同样，您可以禁用 `JsonSerializer` 在标头中发送类型信息的默认行为：

::: code-tabs#language
@tab Properties

```properties
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
spring.kafka.producer.properties[spring.json.add.type.headers]=false
```

@tab Yaml

```yaml
spring:
  kafka:
    producer:
      value-serializer: "org.springframework.kafka.support.serializer.JsonSerializer"
      properties:
        "[spring.json.add.type.headers]": false
```

:::

::: error  重要

以这种方式设置的属性会覆盖 Spring Boot 明确支持的任何配置项。

:::



### 3.5 使用嵌入式 Kafka 进行测试

Spring for Apache Kafka 提供了一种方便的方法来测试带有嵌入式 Apache Kafka 代理的项目。 要使用此功能，请使用 `spring-kafka-test` 模块中的 `@EmbeddedKafka` 注释测试类。 有关详细信息，请参阅 Spring for Apache Kafka [参考手册](https://docs.spring.io/spring-kafka/docs/3.0.4/reference/html/#embedded-kafka-annotation)。

要使 Spring Boot 自动配置与上述嵌入式 Apache Kafka 代理一起工作，您需要将嵌入式代理地址（由 `EmbeddedKafkaBroker` 填充）的系统属性重新映射到 Apache Kafka 的 Spring Boot 配置属性中。 有几种方法可以做到这一点： 

- 提供系统属性以将嵌入式代理地址映射到测试类中的 `spring.kafka.bootstrap-servers`：

::: code-tabs#language
@tab Java

```java
static {
    System.setProperty(EmbeddedKafkaBroker.BROKER_LIST_PROPERTY, "spring.kafka.bootstrap-servers");
}
```

@tab Kotlin

```kotlin
init {
    System.setProperty(EmbeddedKafkaBroker.BROKER_LIST_PROPERTY, "spring.kafka.bootstrap-servers")
}
```

:::

- 在 `@EmbeddedKafka` 注解上配置属性名称：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;

@SpringBootTest
@EmbeddedKafka(topics = "someTopic", bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class MyTest {

    // ...

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.test.context.EmbeddedKafka

@SpringBootTest
@EmbeddedKafka(topics = ["someTopic"], bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class MyTest {

    // ...

}
```

:::

- 在配置属性中使用占位符：

::: code-tabs#language
@tab Properties

```properties
spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}
```

@tab Yaml

```yaml
spring:
  kafka:
    bootstrap-servers: "${spring.embedded.kafka.brokers}"
```

:::

## 4. RSocket

[RSocket](https://rsocket.io/) 是用于字节流传输的二进制协议。 它通过在单个连接上传递异步消息来启用对称交互模型。 

Spring Framework 的 `spring-messaging` 模块为客户端和服务器端的 `RSocket` 请求者和响应者提供支持。 有关更多详细信息，请参阅 Spring Framework 参考的 [RSocket 部分](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/web-reactive.html#rsocket-spring)，包括 `RSocket` 协议的概述。

### 4.1 RSocket 策略自动配置

Spring Boot 自动配置一个 RSocketStrategies bean，它提供编码和解码 RSocket 有效负载所需的所有基础设施。 默认情况下，自动配置将尝试配置以下内容（按顺序）：

1. Jackson 的 [CBOR](https://cbor.io/) 编解码器
2.  Jackson 的 JSON 编解码器

`spring-boot-starter-rsocket` 启动器提供了这两个依赖项。 请参阅 [Jackson 支持部分](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.json.jackson)以了解更多关于定制可能性的信息。 

开发人员可以通过创建实现 `RSocketStrategiesCustomizer` 接口的 bean 来自定义 `RSocketStrategies` 组件。 请注意，他们的 `@Order` 很重要，因为它决定了编解码器的顺序。

::: code-tabs#language
@tab Java

```java
import reactor.core.publisher.Mono;

import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.stereotype.Service;

@Service
public class MyService {

    private final RSocketRequester rsocketRequester;

    public MyService(RSocketRequester.Builder rsocketRequesterBuilder) {
        this.rsocketRequester = rsocketRequesterBuilder.tcp("example.org", 9898);
    }

    public Mono<User> someRSocketCall(String name) {
        return this.rsocketRequester.route("user").data(name).retrieveMono(User.class);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.messaging.rsocket.RSocketRequester
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class MyService(rsocketRequesterBuilder: RSocketRequester.Builder) {

    private val rsocketRequester: RSocketRequester

    init {
        rsocketRequester = rsocketRequesterBuilder.tcp("example.org", 9898)
    }

    fun someRSocketCall(name: String): Mono<User> {
        return rsocketRequester.route("user").data(name).retrieveMono(
            User::class.java
        )
    }

}
```

:::

### 4.2 RSocket 服务器自动配置

Spring Boot 提供 RSocket 服务器自动配置。 所需的依赖项由 `spring-boot-starter-rsocket` 提供。

Spring Boot 允许从 `WebFlux` 服务器通过 WebSocket 公开 RSocket，或者建立一个独立的 RSocket 服务器。 这取决于应用程序的类型及其配置。 

对于 WebFlux 应用程序（即 `WebApplicationType.REACTIVE` 类型），仅当以下属性匹配时，RSocket 服务器才会插入 Web 服务器：

::: code-tabs#language
@tab Properties

```properties
spring.rsocket.server.mapping-path=/rsocket
spring.rsocket.server.transport=websocket
```

@tab Yaml

```yaml
spring:
  rsocket:
    server:
      mapping-path: "/rsocket"
      transport: "websocket"
```

:::

::: warning 警告

只有 Reactor Netty 支持将 `RSocket` 插入 Web 服务器，因为 RSocket 本身是用该库构建的。

:::

或者，`RSocket TCP` 或 `websocket` 服务器作为独立的嵌入式服务器启动。 除了依赖性要求之外，唯一需要的配置是为该服务器定义一个端口：

::: code-tabs#language
@tab Properties

```properties
spring.rsocket.server.port=9898
```

@tab Yaml

```yaml
spring:
  rsocket:
    server:
      port: 9898
```

:::



### 4.3 Spring Messaging RSocket 支持

Spring Boot 将为 RSocket 自动配置 `Spring Messaging` 基础设施。 

这意味着 Spring Boot 将创建一个 `RSocketMessageHandler` bean 来处理对应用程序的 RSocket 请求。

### 4.4 使用 RSocketRequester 调用 RSocket 服务

一旦在服务器和客户端之间建立了 `RSocket` 通道，任何一方都可以向另一方发送或接收请求。

作为服务器，您可以在 `RSocket` `@Controller` 的任何处理程序方法上注入 `RSocketRequester` 实例。 作为客户端，首先需要配置并建立RSocket连接。 Spring Boot 使用预期的编解码器为此类情况自动配置 `RSocketRequester.Builder` 并应用任何 `RSocketConnectorConfigurer` bean。

`RSocketRequester.Builder` 实例是一个原型 bean，这意味着每个注入点都会为您提供一个新实例。 这是有意为之的，因为此构建器是有状态的，您不应使用同一实例创建具有不同设置的请求者。

下面的代码展示了一个典型的例子：



## 5. Spring 集成

Spring Boot 为使用 [Spring Integration](https://spring.io/projects/spring-integration) 提供了多种便利，包括 `spring-boot-starter-integration` “Starter”。 Spring Integration 提供消息传递和其他传输（如 HTTP、TCP 等）的抽象。 如果 Spring Integration 在您的类路径上可用，它会通过 `@EnableIntegration` 注释进行初始化。 

Spring Integration 轮询逻辑依赖于[自动配置的 TaskScheduler](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.task-execution-and-scheduling)。 可以使用 `spring.integration.poller.*` 配置属性自定义默认的 `PollerMetadata`（每秒轮询无限数量的消息）。 

Spring Boot 还配置了一些由额外的 Spring Integration 模块触发的特性。 如果 spring-integration-jmx 也在类路径中，则消息处理统计信息将通过 JMX 发布。 如果 `spring-integration-jdbc` 可用，则可以在启动时创建默认数据库模式，如下行所示：

::: code-tabs#language
@tab Properties

```properties
spring.integration.jdbc.initialize-schema=always
```

@tab Yaml

```yaml
spring:
  integration:
    jdbc:
      initialize-schema: "always"
```

:::

如果 `spring-integration-rsocket` 可用，开发人员可以使用`“spring.rsocket.server.*”`属性配置 `RSocket` 服务器，并让它使用 `IntegrationRSocketEndpoint` 或 `RSocketOutboundGateway` 组件来处理传入的 RSocket 消息。 此基础结构可以处理 Spring Integration RSocket 通道适配器和 `@MessageMapping` 处理程序（假设已配置`“spring.integration.rsocket.server.message-mapping-enabled”`）。 

Spring Boot 还可以使用配置属性自动配置 `ClientRSocketConnector`：

::: code-tabs#language
@tab Properties

```properties
# Connecting to a RSocket server over TCP
spring.integration.rsocket.client.host=example.org
spring.integration.rsocket.client.port=9898
```

@tab Yaml

```yaml
# Connecting to a RSocket server over TCP
spring:
  integration:
    rsocket:
      client:
        host: "example.org"
        port: 9898
```

:::

::: code-tabs#language
@tab Properties

```properties
# Connecting to a RSocket Server over WebSocket
spring.integration.rsocket.client.uri=ws://example.org
```

@tab Yaml

```yaml
# Connecting to a RSocket Server over WebSocket
spring:
  integration:
    rsocket:
      client:
        uri: "ws://example.org"
```

:::

有关详细信息，请参阅 [`IntegrationAutoConfiguration`](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/integration/IntegrationAutoConfiguration.java) 和 [`IntegrationProperties`](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/integration/IntegrationProperties.java) 类。

## 6. WebSocket

Spring Boot 为嵌入式 Tomcat、Jetty 和 Undertow 提供 WebSockets 自动配置。 如果将 war 文件部署到独立容器，Spring Boot 假定容器负责配置其 WebSocket 支持。 

Spring Framework 为 MVC Web 应用程序提供[丰富的 WebSocket 支持](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/web.html#websocket)，可以通过 `spring-boot-starter-websocket` 模块轻松访问。 

WebSocket 支持也可用于[响应式 Web 应用程序](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/web-reactive.html#webflux-websocket)，并且需要将 WebSocket API 与 `spring-boot-starter-webflux` 一起包含在内：

```xml
<dependency>
    <groupId>jakarta.websocket</groupId>
    <artifactId>jakarta.websocket-api</artifactId>
</dependency>
```

