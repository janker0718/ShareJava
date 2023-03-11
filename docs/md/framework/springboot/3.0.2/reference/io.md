# IO

大多数应用程序在某些时候都需要处理输入和输出问题。 Spring Boot 提供实用程序并与一系列技术集成，以在您需要 IO 功能时提供帮助。 本节涵盖标准 IO 功能（如缓存和验证）以及更高级的主题（如调度和分布式事务）。 我们还将介绍调用远程 REST 或 SOAP 服务以及发送电子邮件。

## 1. 缓存

`Spring Framework` 支持透明地向应用程序添加缓存。 在其核心，抽象将缓存应用于方法，从而减少基于缓存中可用信息的执行次数。 缓存逻辑是透明应用的，对调用者没有任何干扰。 只要通过使用`@EnableCaching` 注解启用缓存支持，`Spring Boot` 就会自动配置缓存基础结构。

::: info 信息

查看 Spring Framework 参考的[相关部分](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/integration.html#cache)以获取更多详细信息。

:::

简而言之，要将缓存添加到服务的操作中，请将相关注解添加到其方法中，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class MyMathService {

    @Cacheable("piDecimals")
    public int computePiDecimal(int precision) {
        ...
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component

@Component
class MyMathService {

    @Cacheable("piDecimals")
    fun computePiDecimal(precision: Int): Int {
        ...
    }

}
```

:::

此示例演示了对可能代价高昂的操作使用缓存。 在调用 `computePiDecimal` 之前，抽象在 `piDecimals` 缓存中查找与 i 参数匹配的条目。 如果找到条目，则立即将缓存中的内容返回给调用者，并且不调用该方法。 否则，调用该方法，并在返回值之前更新缓存。

::: warning 警告

您还可以透明地使用标准的 JSR-107 (`JCache`) 注释（例如`@CacheResult`）。 但是，我们强烈建议您不要混合搭配 `Spring Cache` 和 `JCache` 注释。

:::

如果您不添加任何特定的缓存库，Spring Boot 会自动配置一个使用内存中并发映射的[简单提供程序](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.simple)。 当需要缓存时（例如前面示例中的 `piDecimals`），此提供程序会为您创建它。 简单的提供程序并不真正推荐用于生产用途，但它非常适合入门并确保您了解`这些`功能。 当您决定要使用的缓存提供程序时，请务必阅读其文档以了解如何配置您的应用程序使用的缓存。 几乎所有提供商都要求您明确配置您在应用程序中使用的每个缓存。 有些提供了一种自定义由 `spring.cache.cache-names` 属性定义的默认缓存的方法。

::: tip 提示

也可以透明地从缓存中[更新](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/integration.html#cache-annotations-put)或[逐出](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/integration.html#cache-annotations-evict)数据。

:::

### 1.1 支持的缓存提供程序

缓存抽象不提供实际存储，而是依赖于 `org.springframework.cache.Cache` 和 `org.springframework.cache.CacheManager` 接口具体化的抽象。 

如果您没有定义 `CacheManager` 类型的 bean 或名为 `cacheResolver` 的 `CacheResolver`（请参阅 [`CachingConfigurer`](https://docs.spring.io/spring-framework/docs/6.0.6/javadoc-api/org/springframework/cache/annotation/CachingConfigurer.html)），Spring Boot 会尝试检测以下提供程序（按指定顺序）：

1. [Generic](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.generic)
2. [JCache (JSR-107)](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.jcache) (EhCache 3, Hazelcast, Infinispan, 或者其他)
3. [Hazelcast](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.hazelcast)
4. [Infinispan](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.infinispan)
5. [Couchbase](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.couchbase)
6. [Redis](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.redis)
7. [Caffeine](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.caffeine)
8. [Cache2k](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.cache2k)
9. [Simple](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.simple)

此外，[Apache Geode 的 Spring Boot](https://github.com/spring-projects/spring-boot-data-geode) 提供了[使用 Apache Geode 作为缓存提供程序的自动配置](https://docs.spring.io/spring-boot-data-geode-build/2.0.x/reference/html5/#geode-caching-provider)。

::: tip 提示

也可以通过设置 `spring.cache.type` 属性来强制使用特定的缓存提供程序。 如果您需要在某些环境（例如测试）中完全[禁用缓存](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.none)，请使用此属性。

:::

::: tip 提示

使用 `spring-boot-starter-cache` “Starter” 快速添加基本缓存依赖项。 启动器引入了 `spring-context-support`。 如果手动添加依赖项，则必须包含 `spring-context-support` 才能使用 `JCache` 或 `Caffeine` 支持。

:::

如果 `CacheManager` 由 Spring Boot 自动配置，您可以在完全初始化之前通过公开实现 `CacheManagerCustomizer` 接口的 bean 进一步调整其配置。 以下示例设置了一个标志，表示不应将 null 值向下传递到基础映射：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyCacheManagerConfiguration {

    @Bean
    public CacheManagerCustomizer<ConcurrentMapCacheManager> cacheManagerCustomizer() {
        return (cacheManager) -> cacheManager.setAllowNullValues(false);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyCacheManagerConfiguration {

    @Bean
    fun cacheManagerCustomizer(): CacheManagerCustomizer<ConcurrentMapCacheManager> {
        return CacheManagerCustomizer { cacheManager ->
            cacheManager.isAllowNullValues = false
        }
    }

}
```

:::

::: info 信息

在前面的示例中，需要一个自动配置的 `ConcurrentMapCacheManager`。 如果不是这种情况（您提供了自己的配置或自动配置了不同的缓存提供程序），则根本不会调用定制器。 您可以根据需要拥有任意数量的定制器，也可以使用@Order 或`Ordered` 对它们进行排序。

:::

#### 1.1.1 Generic

如果上下文至少定义了一个 `org.springframework.cache.Cache` bean，则使用通用缓存。 创建一个包装所有该类型 bean 的 `CacheManager`。

#### 1.1.2 JCache (JSR-107)

[JCache](https://jcp.org/en/jsr/detail?id=107) 通过类路径上存在的 `javax.cache.spi.CachingProvider` 进行引导（即类路径上存在符合 `JSR-107` 的缓存库），而 JCacheCacheManager 由 `spring-boot-starter-cache` 提供 starter”。 各种兼容库可用，Spring Boot 为 `Ehcache 3`、`Hazelcast` 和 `Infinispan` 提供依赖管理。 也可以添加任何其他兼容的库。

可能会出现多个提供者，在这种情况下必须明确指定提供者。 即使 JSR-107 标准没有强制采用标准化的方式来定义配置文件的位置，Spring Boot 也会尽力适应设置具有实现细节的缓存，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
# Only necessary if more than one provider is present
spring.cache.jcache.provider=com.example.MyCachingProvider
spring.cache.jcache.config=classpath:example.xml
```

@tab Yaml

```yaml
# Only necessary if more than one provider is present
spring:
  cache:
    jcache:
      provider: "com.example.MyCachingProvider"
      config: "classpath:example.xml"
```

:::

::: info 信息

当缓存库同时提供本机实现和 `JSR-107` 支持时，Spring Boot 更喜欢 `JSR-107` 支持，因此如果您切换到不同的 `JSR-107` 实现，则可以使用相同的功能。

:::

::: tip 提示

Spring Boot [普遍支持 `Hazelcast`](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.hazelcast)。 如果单个 `HazelcastInstance` 可用，它也会自动重新用于 `CacheManager`，除非指定了 `spring.cache.jcache.config` 属性。

:::

自定义底层 `javax.cache.cacheManager` 有两种方式：

- 可以通过设置 `spring.cache.cache-names` 属性在启动时创建缓存。 如果定义了自定义 `javax.cache.configuration.Configuration` bean，则用于自定义它们。 
- `org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer` beans 被 `CacheManager` 引用调用以进行完全定制。

::: tip 提示

如果定义了标准的 `javax.cache.CacheManager` bean，它会自动包装在抽象预期的 `org.springframework.cache.CacheManager` 实现中。 没有对其应用进一步的定制。

:::

#### 1.1.3 Hazelcast

Spring Boot [普遍支持 `Hazelcast`](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.hazelcast)。 如果 `HazelcastInstance` 已经自动配置并且 `com.hazelcast:hazelcast-spring` 在类路径中，它会自动包装在 `CacheManager` 中。

::: info 信息

`Hazelcast` 可以用作 `JCache` 兼容缓存或 `Spring CacheManager` 兼容缓存。 将 `spring.cache.type` 设置为 hazelcast 时，Spring Boot 将使用基于 `CacheManager` 的实现。 如果要将 `Hazelcast` 用作 `JCache` 兼容缓存，请将 `spring.cache.type` 设置为 `jcache`。 如果您有多个兼容 `JCache` 的缓存提供程序并且想要强制使用 `Hazelcast`，则必须[显式设置 `JCache` 提供程序](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.jcache)。

:::

#### 1.1.4 Infinispan

[Infinispan](https://infinispan.org/) 没有默认配置文件位置，因此必须明确指定。 否则，将使用默认引导程序。

::: code-tabs#language
@tab Properties

```properties
spring.cache.infinispan.config=infinispan.xml
```

@tab Yaml

```yaml
spring:
  cache:
    infinispan:
      config: "infinispan.xml"
```

:::

可以通过设置 `spring.cache.cache-names` 属性在启动时创建缓存。 如果定义了自定义 `ConfigurationBuilder` bean，则它用于自定义缓存。 

为了与 Spring Boot 的 `Jakarta EE 9` 基线兼容，必须使用 `Infinispan` 的 `-jakarta` 模块。 对于每个带有 `-jakarta` 变体的模块，必须使用该变体来代替标准模块。 例如，必须分别使用 `infinispan-core-jakarta` 和 `infinispan-commons-jakarta` 代替 `infinispan-core` 和 `infinispan-commons`。

#### 1.1.5 Couchbase

如果 `Spring Data Couchbase` 可用并且[配置](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.nosql.couchbase)了 `Couchbase`，则会自动配置 `CouchbaseCacheManager`。 可以通过设置 `spring.cache.cache-names` 属性在启动时创建额外的缓存，并且可以使用 `spring.cache.couchbase.*` 属性配置缓存默认值。 例如，以下配置创建 `cache1` 和 `cache2` 缓存，条目有效期为 10 分钟：

::: code-tabs#language
@tab Properties

```properties
spring.cache.cache-names=cache1,cache2
spring.cache.couchbase.expiration=10m
```

@tab Yaml

```yaml
spring:
  cache:
    cache-names: "cache1,cache2"
    couchbase:
      expiration: "10m"
```

:::

如果您需要对配置进行更多控制，请考虑注册一个 `CouchbaseCacheManagerBuilderCustomizer` bean。 以下示例显示了为 `cache1` 和 `cache2` 配置特定条目过期的定制器：

::: code-tabs#language
@tab Java

```java
import java.time.Duration;

import org.springframework.boot.autoconfigure.cache.CouchbaseCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.couchbase.cache.CouchbaseCacheConfiguration;

@Configuration(proxyBeanMethods = false)
public class MyCouchbaseCacheManagerConfiguration {

    @Bean
    public CouchbaseCacheManagerBuilderCustomizer myCouchbaseCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                .withCacheConfiguration("cache1", CouchbaseCacheConfiguration
                        .defaultCacheConfig().entryExpiry(Duration.ofSeconds(10)))
                .withCacheConfiguration("cache2", CouchbaseCacheConfiguration
                        .defaultCacheConfig().entryExpiry(Duration.ofMinutes(1)));

    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.cache.CouchbaseCacheManagerBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.couchbase.cache.CouchbaseCacheConfiguration
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyCouchbaseCacheManagerConfiguration {

    @Bean
    fun myCouchbaseCacheManagerBuilderCustomizer(): CouchbaseCacheManagerBuilderCustomizer {
        return CouchbaseCacheManagerBuilderCustomizer { builder ->
            builder
                .withCacheConfiguration(
                    "cache1", CouchbaseCacheConfiguration
                        .defaultCacheConfig().entryExpiry(Duration.ofSeconds(10))
                )
                .withCacheConfiguration(
                    "cache2", CouchbaseCacheConfiguration
                        .defaultCacheConfig().entryExpiry(Duration.ofMinutes(1))
                )
        }
    }

}
```

:::



#### 1.1.6 Redis

如果 Redis 可用并已配置，则会自动配置 `RedisCacheManager`。 可以通过设置 `spring.cache.cache-names` 属性在启动时创建额外的缓存，并且可以使用 `spring.cache.redis.*` 属性配置缓存默认值。 例如，以下配置创建 `cache1` 和 `cache2` 缓存，生存时间为 10 分钟：

::: code-tabs#language
@tab Properties

```properties
spring.cache.cache-names=cache1,cache2
spring.cache.redis.time-to-live=10m
```

@tab Yaml

```yaml
spring:
  cache:
    cache-names: "cache1,cache2"
    redis:
      time-to-live: "10m"
```

:::

::: info 信息

默认情况下，添加一个键前缀，这样，如果两个单独的缓存使用相同的键，Redis 不会有重叠的键，也不会返回无效值。 如果您创建自己的 `RedisCacheManager`，我们强烈建议您启用此设置。

:::

::: tip 提示

您可以通过添加自己的 `RedisCacheConfiguration` `@Bean` 来完全控制默认配置。 如果您需要自定义默认序列化策略，这会很有用。

:::

如果您需要对配置进行更多控制，请考虑注册 `RedisCacheManagerBuilderCustomizer` bean。 以下示例显示了一个为 `cache1` 和 `cache2` 配置特定生存时间的定制器：

::: code-tabs#language
@tab Java

```java
import java.time.Duration;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

@Configuration(proxyBeanMethods = false)
public class MyRedisCacheManagerConfiguration {

    @Bean
    public RedisCacheManagerBuilderCustomizer myRedisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                .withCacheConfiguration("cache1", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofSeconds(10)))
                .withCacheConfiguration("cache2", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofMinutes(1)));

    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyRedisCacheManagerConfiguration {

    @Bean
    fun myRedisCacheManagerBuilderCustomizer(): RedisCacheManagerBuilderCustomizer {
        return RedisCacheManagerBuilderCustomizer { builder ->
            builder
                .withCacheConfiguration(
                    "cache1", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofSeconds(10))
                )
                .withCacheConfiguration(
                    "cache2", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofMinutes(1))
                )
        }
    }

}
```

:::



#### 1.1.7 Caffeine

Caffeine 是 Java 8 对 Guava 缓存的重写，取代了对 Guava 的支持。 如果存在 Caffeine，则会自动配置 CaffeineCacheManager（由 spring-boot-starter-cache “Starter”提供）。 可以通过设置 spring.cache.cache-names 属性在启动时创建缓存，并且可以通过以下之一（按指定顺序）进行自定义：

1. 由 `spring.cache.caffeine.spec` 定义的缓存规范 
2. 定义了一个 `com.github.benmanes.caffeine.cache.CaffeineSpec` bean 
3. 定义了一个 `com.github.benmanes.caffeine.cache.Caffeine` bean

例如，以下配置创建最大大小为 500 且生存时间为 10 分钟的 `cache1` 和 `cache2` 缓存

 ::: code-tabs#language
@tab Properties

```properties
spring.cache.cache-names=cache1,cache2
spring.cache.caffeine.spec=maximumSize=500,expireAfterAccess=600s
```

@tab Yaml

```yaml
spring:
  cache:
    cache-names: "cache1,cache2"
    caffeine:
      spec: "maximumSize=500,expireAfterAccess=600s"
```

:::

如果定义了 `com.github.benmanes.caffeine.cache.CacheLoader` bean，它会自动关联到 `CaffeineCacheManager`。 由于 CacheLoader 将与缓存管理器管理的所有缓存相关联，因此必须将其定义为 `CacheLoader<Object, Object>`。 自动配置忽略任何其他通用类型。



#### 1.1.8 Cache2k

[`Cache2k`](https://cache2k.org/) 是一个内存缓存。 如果存在 Cache2k spring 集成，则会自动配置 `SpringCache2kCacheManager`。

可以通过设置 `spring.cache.cache-names` 属性在启动时创建缓存。 可以使用 `Cache2kBuilderCustomizer` bean 自定义缓存默认值。 以下示例显示了一个定制器，它将缓存容量配置为 200 个条目，过期时间为 5 分钟：

::: code-tabs#language
@tab Java

```java
import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.cache.Cache2kBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyCache2kDefaultsConfiguration {

    @Bean
    public Cache2kBuilderCustomizer myCache2kDefaultsCustomizer() {
        return (builder) -> builder.entryCapacity(200)
                .expireAfterWrite(5, TimeUnit.MINUTES);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.cache.Cache2kBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration(proxyBeanMethods = false)
class MyCache2kDefaultsConfiguration {

    @Bean
    fun myCache2kDefaultsCustomizer(): Cache2kBuilderCustomizer {
        return Cache2kBuilderCustomizer { builder ->
            builder.entryCapacity(200)
                .expireAfterWrite(5, TimeUnit.MINUTES)
        }
    }
}
```

:::



#### 1.1.9 Simple

如果找不到任何其他提供程序，则会配置使用 `ConcurrentHashMap` 作为缓存存储的简单实现。 如果您的应用程序中没有缓存库，则这是默认设置。 默认情况下，缓存是根据需要创建的，但您可以通过设置 `cache-names` 属性来限制可用缓存的列表。 例如，如果您只需要 `cache1` 和 `cache2` 缓存，请按如下方式设置 cache-names 属性：

::: code-tabs#language
@tab Properties

```properties
spring.cache.cache-names=cache1,cache2
```

@tab Yaml

```yaml
spring:
  cache:
    cache-names: "cache1,cache2"
```

:::

如果您这样做并且您的应用程序使用未列出的缓存，则它会在需要缓存时在运行时失败，但不会在启动时失败。 如果您使用未声明的缓存，这类似于“真实”缓存提供程序的行为方式。



#### 1.1.10 None

当您的配置中存在 `@EnableCaching` 时，还需要一个合适的缓存配置。 如果您需要在某些环境中完全禁用缓存，请将缓存类型强制为 none 以使用无操作实现，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.cache.type=none
```

@tab Yaml

```yaml
spring:
  cache:
    type: "none"
```

:::



## 2. Hazelcast

如果 Hazelcast 在类路径上并且找到了合适的配置，Spring Boot 会自动配置一个 `HazelcastInstance`，您可以将其注入到应用程序中。

Spring Boot 首先尝试通过检查以下配置选项来创建客户端：

- `com.hazelcast.client.config.ClientConfig` bean 的存在。 
- 由 `spring.hazelcast.config` 属性定义的配置文件。 
- `hazelcast.client.config` 系统属性的存在。 
- 工作目录或类路径根目录中的 `hazelcast-client.xml`。 
- 工作目录或类路径根目录中的 `hazelcast-client.yaml`（或 `hazelcast-client.yml`）。

如果无法创建客户端，Spring Boot 会尝试配置嵌入式服务器。 如果您定义一个 `com.hazelcast.config.Config` bean，Spring Boot 将使用它。 如果您的配置定义了实例名称，Spring Boot 会尝试定位现有实例而不是创建新实例。 

您还可以通过配置指定要使用的 `Hazelcast` 配置文件，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.hazelcast.config=classpath:config/my-hazelcast.xml
```

@tab Yaml

```yaml
spring:
  hazelcast:
    config: "classpath:config/my-hazelcast.xml"
```

:::

否则，Spring Boot 会尝试从默认位置查找 Hazelcast 配置：工作目录或类路径根目录中的 `hazelcast.xml`，或相同位置中的 `.yaml/.yml` 副本。 我们还检查是否设置了 `hazelcast.config` 系统属性。 有关详细信息，请参阅 [Hazelcast 文档](https://docs.hazelcast.org/docs/latest/manual/html-single/)。

::: tip 提示

默认情况下，支持 Hazelcast 组件上的 `@SpringAware`。 可以通过声明 `@Order` 大于零的 `HazelcastConfigCustomizer` bean 来覆盖 `ManagementContext`。

:::

::: info 信息

Spring Boot 还具有[对 Hazelcast 的显式缓存支持](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.caching.provider.hazelcast)。 如果启用缓存，则 `HazelcastInstance` 会自动包装在 `CacheManager` 实现中。

:::

## 3. Quartz 调度器

Spring Boot 为使用 Quartz 调度程序提供了多种便利，包括 `spring-boot-starter-quartz` “Starter”。 如果 Quartz 可用，则自动配置一个调度程序（通过 `SchedulerFactoryBean` 抽象）。

以下类型的 beans 会被自动拾取并与调度程序关联：

- `JobDetail`：定义一个特定的Job。 `JobDetail` 实例可以使用 `JobBuilder API` 构建。 
- `Calendar`。 
- `Trigger`：定义何时触发特定作业。 

默认情况下，使用内存中的 `JobStore`。 但是，如果您的应用程序中有 `DataSource` bean 并且相应地配置了 `spring.quartz.job-store-type` 属性，则可以配置基于 JDBC 的存储，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.quartz.job-store-type=jdbc
```

@tab Yaml

```yaml
spring:
  quartz:
    job-store-type: "jdbc"
```

:::

使用 JDBC 存储时，可以在启动时初始化模式，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.quartz.jdbc.initialize-schema=always
```

@tab Yaml

```yaml
spring:
  quartz:
    jdbc:
      initialize-schema: "always"
```

:::

::: warning 警告

默认情况下，使用 Quartz 库提供的标准脚本检测和初始化数据库。 这些脚本会删除现有表，并在每次重新启动时删除所有触发器。 也可以通过设置 `spring.quartz.jdbc.schema` 属性来提供自定义脚本。

:::

要让 Quartz 使用应用程序的主数据源以外的数据源，请声明一个数据源 bean，并使用 `@QuartzDataSource` 注释其 `@Bean` 方法。 这样做可以确保 `SchedulerFactoryBean` 和模式初始化都使用 Quartz 特定的数据源。 类似地，要让 Quartz 使用一个 `TransactionManager` 而不是应用程序的主 `TransactionManager` 声明一个 `TransactionManager` bean，用 `@QuartzTransactionManager` 注解它的 `@Bean` 方法。

默认情况下，配置创建的作业不会覆盖已从持久性作业存储中读取的已注册作业。 要启用覆盖现有作业定义，请设置 `spring.quartz.overwrite-existing-jobs` 属性。

可以使用 `spring.quartz` 属性和 `SchedulerFactoryBeanCustomizer` beans 自定义 Quartz Scheduler 配置，这允许程序化的 `SchedulerFactoryBean` 自定义。 可以使用 spring.quartz.properties.* 自定义高级 Quartz 配置属性。

::: info 信息

特别是，`Executor` bean 不与调度程序相关联，因为 `Quartz` 提供了一种通过 `spring.quartz.properties` 配置调度程序的方法。 如果您需要自定义任务执行器，请考虑实现 `SchedulerFactoryBeanCustomizer`。

:::

作业可以定义 setter 来注入数据映射属性。 常规 bean 也可以以类似的方式注入，如以下示例所示：

::: code-tabs#language
@tab Java

```java
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import org.springframework.scheduling.quartz.QuartzJobBean;

public class MySampleJob extends QuartzJobBean {

    private MyService myService;

    private String name;

    // Inject "MyService" bean
    public void setMyService(MyService myService) {
        this.myService = myService;
    }

    // Inject the "name" job data property
    public void setName(String name) {
        this.name = name;
    }

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        this.myService.someMethod(context.getFireTime(), this.name);
    }

}
```

@tab Kotlin

```kotlin
import org.quartz.JobExecutionContext
import org.springframework.scheduling.quartz.QuartzJobBean

class MySampleJob : QuartzJobBean() {

    private var myService: MyService? = null

    private var name: String? = null

    // Inject "MyService" bean
    fun setMyService(myService: MyService?) {
        this.myService = myService
    }

    // Inject the "name" job data property
    fun setName(name: String?) {
        this.name = name
    }

    override fun executeInternal(context: JobExecutionContext) {
        myService!!.someMethod(context.fireTime, name)
    }

}
```

:::



## 4. 发送 Email

`Spring Framework` 为使用 `JavaMailSender` 接口发送电子邮件提供了一个抽象，而 Spring Boot 为其提供了自动配置以及一个启动模块。

::: tip 提示

有关如何使用 `JavaMailSender` 的详细说明，请参阅[参考文档](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/integration.html#mail)。

:::

如果 `spring.mail.host` 和相关库（由 `spring-boot-starter-mail` 定义）可用，则创建默认的 `JavaMailSender`（如果不存在）。 可以通过 `spring.mail` 命名空间中的配置项进一步自定义发件人。 有关详细信息，请参阅 [MailProperties](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/mail/MailProperties.java)。 

特别是，某些默认超时值是无限的，您可能希望更改它以避免线程被无响应的邮件服务器阻塞，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.mail.properties[mail.smtp.connectiontimeout]=5000
spring.mail.properties[mail.smtp.timeout]=3000
spring.mail.properties[mail.smtp.writetimeout]=5000
```

@tab Yaml

```yaml
spring:
  mail:
    properties:
      "[mail.smtp.connectiontimeout]": 5000
      "[mail.smtp.timeout]": 3000
      "[mail.smtp.writetimeout]": 5000
```

:::

也可以使用来自 JNDI 的现有会话配置 JavaMailSender：

::: code-tabs#language
@tab Properties

```properties
spring.mail.jndi-name=mail/Session
```

@tab Yaml

```yaml
spring:
  mail:
    jndi-name: "mail/Session"
```

:::

设置 `jndi-name` 后，它优先于所有其他与会话相关的设置。

## 5. 验证

只要类路径上有 `JSR-303` 实现（例如 `Hibernate` 验证程序），Bean Validation 1.1 支持的方法验证功能就会自动启用。 这使得 bean 方法可以在其参数和/或返回值上使用 jakarta.validation 约束进行注解。 具有此类注解方法的目标类需要在类型级别使用 `@Validated` 注释进行注解，以便在其方法中搜索内联约束注解。

例如，以下服务触发第一个参数的验证，确保其大小在 8 到 10 之间：

::: code-tabs#language
@tab Java

```java
import jakarta.validation.constraints.Size;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class MyBean {

    public Archive findByCodeAndAuthor(@Size(min = 8, max = 10) String code, Author author) {
        return ...
    }

}
```

@tab Kotlin

```kotlin
import jakarta.validation.constraints.Size
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class MyBean {

    fun findByCodeAndAuthor(code: @Size(min = 8, max = 10) String?, author: Author?): Archive? {
        return null
    }

}
```

:::

在解析约束消息中的 `{parameters}` 时使用应用程序的 `MessageSource`。 这允许您将应用程序的 `messages.properties` 文件用于 Bean 验证消息。 解析参数后，将使用 Bean Validation 的默认插值器完成消息插值。 

要自定义用于构建 `ValidatorFactory` 的配置，请定义一个 `ValidationConfigurationCustomizer` bean。 当定义了多个定制器 bean 时，将根据它们的 `@Order` 注释或 `Ordered` 实现按顺序调用它们。



## 6. 调用 REST 服务

如果您的应用程序调用远程 REST 服务，Spring Boot 使用 `RestTemplate` 或 `WebClient` 会非常方便。

### 6.1 RestTemplate

如果您需要从您的应用程序调用远程 REST 服务，您可以使用 Spring 框架的 `RestTemplate` 类。 由于 `RestTemplate` 实例通常需要在使用前进行自定义，因此 Spring Boot 不提供任何单个自动配置的 `RestTemplate` bean。 但是，它确实会自动配置一个 `RestTemplateBuilder`，它可用于在需要时创建 `RestTemplate` 实例。 自动配置的 `RestTemplateBuilder` 确保将合理的 `HttpMessageConverters` 应用于 `RestTemplate` 实例。 

下面的代码展示了一个典型的例子：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MyService {

    private final RestTemplate restTemplate;

    public MyService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public Details someRestCall(String name) {
        return this.restTemplate.getForObject("/{name}/details", Details.class, name);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class MyService(restTemplateBuilder: RestTemplateBuilder) {

    private val restTemplate: RestTemplate

    init {
        restTemplate = restTemplateBuilder.build()
    }

    fun someRestCall(name: String): Details {
        return restTemplate.getForObject(
            "/{name}/details",
            Details::class.java, name
        )!!
    }

}
```

:::

::: tip 提示

`RestTemplateBuilder` 包含许多有用的方法，可用于快速配置 `RestTemplate`。 例如，要添加 `BASIC` 身份验证支持，您可以使用 `builder.basicAuthentication("user", "password").build()`。

:::

#### 6.1.1 RestTemplate 定制

`RestTemplate` 自定义主要有三种方法，具体取决于您希望自定义应用的范围。

为了尽可能缩小任何自定义的范围，请注入自动配置的 `RestTemplateBuilder`，然后根据需要调用其方法。 每个方法调用都会返回一个新的 `RestTemplateBuilder` 实例，因此自定义只会影响构建器的这种使用。

要进行应用程序范围的附加自定义，请使用 `RestTemplateCustomizer` bean。 所有这些 bean 都会自动注册到自动配置的 `RestTemplateBuilder` 中，并应用于使用它构建的任何模板。 

以下示例显示了一个定制器，它为除 `192.168.0.5` 之外的所有主机配置代理的使用：

::: code-tabs#language
@tab Java

```java
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.client5.http.impl.routing.DefaultProxyRoutePlanner;
import org.apache.hc.client5.http.routing.HttpRoutePlanner;
import org.apache.hc.core5.http.HttpException;
import org.apache.hc.core5.http.HttpHost;
import org.apache.hc.core5.http.protocol.HttpContext;

import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

public class MyRestTemplateCustomizer implements RestTemplateCustomizer {

    @Override
    public void customize(RestTemplate restTemplate) {
        HttpRoutePlanner routePlanner = new CustomRoutePlanner(new HttpHost("proxy.example.com"));
        HttpClient httpClient = HttpClientBuilder.create().setRoutePlanner(routePlanner).build();
        restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory(httpClient));
    }

    static class CustomRoutePlanner extends DefaultProxyRoutePlanner {

        CustomRoutePlanner(HttpHost proxy) {
            super(proxy);
        }

        @Override
        protected HttpHost determineProxy(HttpHost target, HttpContext context) throws HttpException {
            if (target.getHostName().equals("192.168.0.5")) {
                return null;
            }
            return super.determineProxy(target, context);
        }

    }

}
```

@tab Kotlin

```kotlin
import org.apache.hc.client5.http.classic.HttpClient
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder
import org.apache.hc.client5.http.impl.routing.DefaultProxyRoutePlanner
import org.apache.hc.client5.http.routing.HttpRoutePlanner
import org.apache.hc.core5.http.HttpException
import org.apache.hc.core5.http.HttpHost
import org.apache.hc.core5.http.protocol.HttpContext
import org.springframework.boot.web.client.RestTemplateCustomizer
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

class MyRestTemplateCustomizer : RestTemplateCustomizer {

    override fun customize(restTemplate: RestTemplate) {
        val routePlanner: HttpRoutePlanner = CustomRoutePlanner(HttpHost("proxy.example.com"))
        val httpClient: HttpClient = HttpClientBuilder.create().setRoutePlanner(routePlanner).build()
        restTemplate.requestFactory = HttpComponentsClientHttpRequestFactory(httpClient)
    }

    internal class CustomRoutePlanner(proxy: HttpHost?) : DefaultProxyRoutePlanner(proxy) {

        @Throws(HttpException::class)
        public override fun determineProxy(target: HttpHost, context: HttpContext): HttpHost? {
            if (target.hostName == "192.168.0.5") {
                return null
            }
            return  super.determineProxy(target, context)
        }

    }

}
```

:::

最后，您可以定义自己的 `RestTemplateBuilder` bean。 这样做将替换自动配置的构建器。 如果您希望将任何 `RestTemplateCustomizer` beans 应用于您的自定义构建器，就像自动配置所做的那样，请使用 `RestTemplateBuilderConfigurer` 对其进行配置。 以下示例公开了一个 `RestTemplateBuilder`，它与 Spring Boot 的自动配置相匹配，除了还指定了自定义连接和读取超时：

::: code-tabs#language
@tab Java

```java
import java.time.Duration;

import org.springframework.boot.autoconfigure.web.client.RestTemplateBuilderConfigurer;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyRestTemplateBuilderConfiguration {

    @Bean
    public RestTemplateBuilder restTemplateBuilder(RestTemplateBuilderConfigurer configurer) {
        return configurer.configure(new RestTemplateBuilder())
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(2));
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.web.client.RestTemplateBuilderConfigurer
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyRestTemplateBuilderConfiguration {

    @Bean
    fun restTemplateBuilder(configurer: RestTemplateBuilderConfigurer): RestTemplateBuilder {
        return configurer.configure(RestTemplateBuilder()).setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(2))
    }

}
```

:::

最极端（且很少使用）的选项是在不使用配置器的情况下创建自己的 `RestTemplateBuilder` bean。 除了替换自动配置的构建器之外，这还可以防止使用任何 `RestTemplateCustomizer` bean。

### 6.2 WebClient

如果您的类路径上有 `Spring WebFlux`，您还可以选择使用 `WebClient` 来调用远程 REST 服务。 与 `RestTemplate` 相比，此客户端具有更多功能性感觉并且是完全响应式的。 您可以在 `Spring Framework` 文档的专用部分中了解有关 `WebClient` 的更多信息。

Spring Boot 为您创建并预配置 `WebClient.Builder`。 强烈建议将其注入您的组件并使用它来创建 `WebClient` 实例。 Spring Boot 正在配置该构建器以共享 HTTP 资源，以与服务器相同的方式反映编解码器设置（请参阅 [WebFlux HTTP 编解码器自动配置](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.reactive.webflux.httpcodecs)），等等。

下面的代码展示了一个典型的例子：

::: code-tabs#language
@tab Java

```java
import org.neo4j.cypherdsl.core.Relationship.Details;
import reactor.core.publisher.Mono;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class MyService {

    private final WebClient webClient;

    public MyService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://example.org").build();
    }

    public Mono<Details> someRestCall(String name) {
        return this.webClient.get().uri("/{name}/details", name).retrieve().bodyToMono(Details.class);
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.autoconfigure.web.client.RestTemplateBuilderConfigurer
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyRestTemplateBuilderConfiguration {

    @Bean
    fun restTemplateBuilder(configurer: RestTemplateBuilderConfigurer): RestTemplateBuilder {
        return configurer.configure(RestTemplateBuilder()).setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(2))
    }

}
```

:::

#### 6.2.1 WebClient 运行时

Spring Boot 将自动检测使用哪个 `ClientHttpConnector` 来驱动 WebClient，具体取决于应用程序类路径上可用的库。 目前，支持 `Reactor Netty`、`Jetty ReactiveStream` 客户端、Apache HttpClient 和 JDK 的 `HttpClient`。 

`spring-boot-starter-webflux` 启动器默认依赖于 `io.projectreactor.netty:reactor-netty`，它带来了服务端和客户端的实现。 如果您选择使用 Jetty 作为反应式服务器，您应该添加对 Jetty Reactive HTTP 客户端库 `org.eclipse.jetty:jetty-reactive-httpclient` 的依赖。 服务器和客户端使用相同的技术有其优势，因为它会自动在客户端和服务器之间共享 HTTP 资源。

开发人员可以通过提供自定义 `ReactorResourceFactory` 或 JettyResourceFactory bean 来覆盖 Jetty 和 Reactor Netty 的资源配置——这将应用于客户端和服务器。 

如果您希望为客户端覆盖该选择，您可以定义自己的 ClientHttpConnector bean 并完全控制客户端配置。

您可以在 Spring Framework 参考文档中了解有关 [WebClient 配置选项](https://docs.spring.io/spring-framework/docs/6.0.6/reference/html/web-reactive.html#webflux-client-builder) 的更多信息。

#### 6.2.2 WebClient 定制

WebClient 定制主要有三种方法，具体取决于您希望应用定制的范围。 

要尽可能缩小任何自定义的范围，请注入自动配置的 `WebClient.Builder`，然后根据需要调用其方法。 `WebClient.Builder` 实例是有状态的：构建器上的任何更改都会反映在随后使用它创建的所有客户端中。 如果您想使用同一个构建器创建多个客户端，您还可以考虑使用 `WebClient.Builder other = builder.clone();` 克隆构建器。 

要对所有 `WebClient.Builder` 实例进行应用程序范围的附加自定义，您可以声明 `WebClientCustomizer` bean 并在注入点本地更改 `WebClient.Builder`。 

最后，您可以回退到原始 API 并使用 `WebClient.create()`。 在这种情况下，不会应用自动配置或 `WebClientCustomizer`。



## 7. Web Services

Spring Boot 提供 Web 服务自动配置，因此您只需定义端点即可。

可以使用 `spring-boot-starter-webservices` 模块轻松访问 [Spring Web Services 功能](https://docs.spring.io/spring-ws/docs/4.0.2/reference/html/)。 

可以分别为您的 WSDL 和 XSD 自动创建 `SimpleWsdl11Definition` 和 `SimpleXsdSchema` bean。 为此，请配置它们的位置，如以下示例所示：

::: code-tabs#language
@tab Properties

```properties
spring.webservices.wsdl-locations=classpath:/wsdl
```

@tab Yaml

```yaml
spring:
  webservices:
    wsdl-locations: "classpath:/wsdl"
```

:::

### 7.1 使用 WebServiceTemplate 调用 WebService

如果您需要从您的应用程序调用远程 `WebService`，您可以使用 `WebServiceTemplate` 类。 由于 `WebServiceTemplate` 实例通常需要在使用前进行自定义，因此 Spring Boot 不提供任何单个自动配置的 `WebServiceTemplate` bean。 但是，它确实会自动配置一个 `WebServiceTemplateBuilder`，它可用于在需要时创建 `WebServiceTemplate` 实例。 

下面的代码展示了一个典型的例子：

::: code-tabs#language
@tab Java

```java
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.soap.client.core.SoapActionCallback;

@Service
public class MyService {

    private final WebServiceTemplate webServiceTemplate;

    public MyService(WebServiceTemplateBuilder webServiceTemplateBuilder) {
        this.webServiceTemplate = webServiceTemplateBuilder.build();
    }

    public SomeResponse someWsCall(SomeRequest detailsReq) {
        return (SomeResponse) this.webServiceTemplate.marshalSendAndReceive(detailsReq,
                new SoapActionCallback("https://ws.example.com/action"));
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder
import org.springframework.stereotype.Service
import org.springframework.ws.client.core.WebServiceTemplate
import org.springframework.ws.soap.client.core.SoapActionCallback

@Service
class MyService(webServiceTemplateBuilder: WebServiceTemplateBuilder) {

    private val webServiceTemplate: WebServiceTemplate

    init {
        webServiceTemplate = webServiceTemplateBuilder.build()
    }

    fun someWsCall(detailsReq: SomeRequest?): SomeResponse {
        return webServiceTemplate.marshalSendAndReceive(
            detailsReq,
            SoapActionCallback("https://ws.example.com/action")
        ) as SomeResponse
    }

}
```

:::

默认情况下，`WebServiceTemplateBuilder` 使用类路径上可用的 HTTP 客户端库检测合适的基于 HTTP 的 `WebServiceMessageSender`。 您还可以自定义读取和连接超时，如下所示：

::: code-tabs#language
@tab Java

```java
import java.time.Duration;

import org.springframework.boot.webservices.client.HttpWebServiceMessageSenderBuilder;
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.transport.WebServiceMessageSender;

@Configuration(proxyBeanMethods = false)
public class MyWebServiceTemplateConfiguration {

    @Bean
    public WebServiceTemplate webServiceTemplate(WebServiceTemplateBuilder builder) {
        WebServiceMessageSender sender = new HttpWebServiceMessageSenderBuilder()
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(2))
                .build();
        return builder.messageSenders(sender).build();
    }

}
```

@tab Kotlin

```kotlin
import org.springframework.boot.webservices.client.HttpWebServiceMessageSenderBuilder
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.ws.client.core.WebServiceTemplate
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyWebServiceTemplateConfiguration {

    @Bean
    fun webServiceTemplate(builder: WebServiceTemplateBuilder): WebServiceTemplate {
        val sender = HttpWebServiceMessageSenderBuilder()
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(2))
            .build()
        return builder.messageSenders(sender).build()
    }

}
```

:::



## 8. 使用 JTA 的分布式事务

Spring Boot 通过使用从 JNDI 检索的事务管理器支持跨多个 XA 资源的分布式 `JTA` 事务。 

当检测到 JTA 环境时，Spring 的 `JtaTransactionManager` 用于管理事务。 自动配置的 `JMS`、`DataSource` 和 `JPA` bean 升级为支持 XA 事务。 您可以使用标准的 Spring 习惯用法，例如 `@Transactional`，来参与分布式事务。 如果您在 JTA 环境中并且仍想使用本地事务，则可以将 `spring.jta.enabled` 属性设置为 `false` 以禁用 `JTA` 自动配置。

### 8.1 使用 Jakarta EE 托管事务管理器

如果将 Spring Boot 应用程序打包为 war 或 ear 文件并将其部署到 Jakarta EE 应用程序服务器，则可以使用应用程序服务器的内置事务管理器。 Spring Boot 尝试通过查看常见的 JNDI 位置（`java:comp/UserTransaction`、`java:comp/TransactionManager` 等）来自动配置事务管理器。 当使用应用程序服务器提供的事务服务时，您通常还希望确保所有资源都由服务器管理并通过 JNDI 公开。 Spring Boot 尝试通过在 JNDI 路径（`java:/JmsXA` 或 `java:/XAConnectionFactory`）中查找 `ConnectionFactory` 来自动配置 JMS，您可以使用 [spring.datasource.jndi-name 属性](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql.datasource.jndi)来配置您的数据源。

### 8.2 混合 XA 和非 XA JMS 连接

使用 JTA 时，主要的 JMS ConnectionFactory bean 是 XA 感知的并参与分布式事务。 您无需使用任何 @Qualifier 即可注入您的 bean：

::: code-tabs#language
@tab Java

```java
public MyBean(ConnectionFactory connectionFactory) {
    // ...
}
```

@tab Kotlin

```kotlin

```

:::

在某些情况下，您可能希望使用非 `XA ConnectionFactory` 来处理某些 JMS 消息。 例如，您的 JMS 处理逻辑可能需要比 XA 超时更长的时间。 

如果你想使用非 `XA ConnectionFactory`，你可以使用 `nonXaJmsConnectionFactory` bean：

::: code-tabs#language
@tab Java

```java
public MyBean(@Qualifier("nonXaJmsConnectionFactory") ConnectionFactory connectionFactory) {
    // ...
}
```

@tab Kotlin

```kotlin

```

:::

为了保持一致性，还使用 bean 别名 `xaJmsConnectionFactory` 提供了 `jmsConnectionFactory` bean：

::: code-tabs#language
@tab Java

```java
public MyBean(@Qualifier("xaJmsConnectionFactory") ConnectionFactory connectionFactory) {
    // ...
}
```

@tab Kotlin

```kotlin

```

:::

### 8.3 支持嵌入式事务管理器

[XAConnectionFactoryWrapper](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/jms/XAConnectionFactoryWrapper.java) 和 [XADataSourceWrapper](https://github.com/spring-projects/spring-boot/tree/v3.0.4/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/jdbc/XADataSourceWrapper.java) 接口可用于支持嵌入式事务管理器。 这些接口负责包装 `XAConnectionFactory` 和 `XADataSource` bean，并将它们公开为常规的 `ConnectionFactory` 和 DataSource bean，它们透明地注册到分布式事务中。 DataSource 和 JMS 自动配置使用 JTA 变体，前提是您在 `ApplicationContext` 中注册了 `JtaTransactionManager` bean 和适当的 XA 包装器 bean。