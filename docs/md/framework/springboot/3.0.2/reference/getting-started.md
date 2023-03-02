# 入门
介绍 Spring Boot 、系统要求、Servlet 容器、安装 Spring Boot 和开发第一个 Spring Boot 应用程序

如果您正在开始使用Spring Boot，或一般的“Spring”，请阅读本节。它回答了基本的“是什么？”、“如何用？”和“为什么？”问题。它包括对 Spring Boot 的介绍以及安装说明。然后，我们将引导您构建第一个Spring Boot 应用程序，同时讨论一些核心原则。

## 1. 介绍 Spring Boot

Spring Boot 帮助您创建可以运行的独立的、生产级 Spring 的应用程序。我们对 Spring 平台和第三方库有一个坚定的看法，这样您就可以轻松开始。大多数 Spring Boot 应用程序只需要很少的 Spring 配置。

我们的主要目标是：

- 为所有Spring开发提供一个更快、更容易获得的入门体验。
- 不要固执己见，但当需求开始偏离默认值时，要迅速让开。
- 提供一系列大型项目通用的非功能特性（如嵌入式服务器、安全性、度量、健康检查和外部化配置）。
- 绝对没有代码生成（当不以本机映像为目标时），也不需要XML配置。

## 2. 系统要求

Spring Boot 3.0.2 需要 [Java 17](https://www.java.com/) ，并且与 Java 19（包括Java 19）兼容。还需要 [Spring Framework 6.0.4](https://docs.spring.io/spring-framework/docs/6.0.4/reference/html/) 或更高版本。

为以下构建工具提供了显式构建支持：

| 构建工具 | 版本             |
| :------- | :--------------- |
| Maven    | 3.5+             |
| Gradle   | 7.x (7.5 或更高) |

### 2.1 Servlet 容器

Spring Boot 支持一下内嵌的Servlet 容器：

| 名称                                | Servlet版本 |
| :---------------------------------- | :---------- |
| Tomcat 10.0                         | 5.0         |
| Jetty 11.0                          | 5.1         |
| Undertow 2.2 (Jakarta EE 9 variant) | 5.0         |

### 2.2 GraalVM 原生镜像

Spring Boot应用程序可以使用GraalVM 22.3或更高版本转换为本机映像。

可以使用GraalVM提供的本地构建工具`Gradle/Maven` 插件或本地映像工具创建映像。您还可以使用[本地映像 Paketo 构建包](https://github.com/paketo-buildpacks/native-image) 创建本地映像。

支持以下版本：

| 名称                                | Version |
| :---------------------------------- | :------ |
| GraalVM 社区版（GraalVM Community） | 22.3    |
| 原生构建工具（Native Build Tools）  | 0.9.19  |

## 3. 安装 Spring Boot

Spring Boot可以与 “经典” Java开发工具一起使用，也可以作为命令行工具安装。无论哪种方式，您都需要 [Java SDK v17](https://www.java.com/)或更高版本。开始之前，应使用以下命令检查当前的Java安装：

```
java -version
```

如果您是 Java 开发的新手，或者您想尝试使用 Spring Boot ，您可能需要先尝试 [Spring Boot CLI](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html#getting-started.installing.cli)（命令行界面）。否则，请继续阅读 “经典” 安装说明。

### 3.1 针对 Java 开发者的安装说明

您可以以与任何标准 Java 库相同的方式使用 Spring Boot 。为此，在类路径中包含相应的 spring-boot-*.jar 文件。Spring Boot 不需要任何特殊的工具集成，因此您可以使用任何IDE或文本编辑器。此外，Spring Boot 应用程序没有什么特别之处，因此您可以像运行任何其他Java程序一样运行和调试Spring Boot程序。

尽管您可以复制 Spring Boot jar 包，但我们通常建议您使用支持依赖关系管理的构建工具（如Maven或Gradle）。

#### 3.1.1 Maven 安装

Spring Boot 与 Apache Maven 3.5 或更高版本兼容。如果尚未安装 Maven，可以按照 [maven.apache.org](https://maven.apache.org/) 上的说明进行操作。

>在许多操作系统上，Maven可以安装包管理器。如果您是MAC OSX 用户使用 Homebrew，请尝试 brew 安装 maven。Ubuntu用户可以运行sudo apt-get-install-maven 。使用Windows 用户可以使用 Chocolatey 在提升的（管理员）提示符下运行choco install maven。

Spring Boot 依赖项使用 org.springframework.boot groupId。通常，Maven POM 文件继承自 Spring Boot starter 父项目，并向一个或多个 [“starter”](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters) 声明依赖项。Spring Boot 还提供了一个可选的 [Maven 插件](https://docs.spring.io/spring-boot/docs/current/reference/html/build-tool-plugins.html#build-tool-plugins.maven) 来创建可执行 jar。

有关开始使用Spring Boot和Maven的更多详细信息，请参阅 Maven 插件参考指南的 [getting started 部分](https://docs.spring.io/spring-boot/docs/3.0.2/maven-plugin/reference/htmlsingle/#getting-started)。

#### 3.1.2 Gradle 安装

Spring Boot 与 Gradle 7.x（7.5或更高版本）兼容。如果尚未安装Gradle，可以按照 [gradle.org](https://gradle.org/) 上的说明进行操作。

可以使用 `org.springframework.boot` 组声明 `Spring Boot` 依赖项。通常，您的项目声明对一个或多个 [“Starter”](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters) 的依赖关系。Spring Boot 提供了一个有用的 Gradle 插件，可用于简化依赖声明和创建可执行 jar 。

> **Gradle Wrapper**
>
> Gradle Wrapper 提供了一种在需要构建项目时“获取”Gradle的好方法。它是一个小脚本和库，您可以与代码一起提交，以引导构建过程。有关详细信息，请参见  [docs.gradle.org/current/userguide/gradle_wrapper.html](https://docs.gradle.org/current/userguide/gradle_wrapper.html) 。

有关开始使用 Spring Boot 和 Gradle 的更多详细信息，请参阅 Gradle 插件参考指南的入门部分。

### 3.2 安装Spring Boot CLI

Spring Boot CLI（命令行界面）是一个命令行工具，您可以使用它快速地对Spring进行原型测试。

您不需要使用 CLI 来使用 Spring Boot ，但这是一种在没有 IDE 的情况下让 Spring 应用程序启动的快速方法。

#### 3.2.1 手动安装

您可以从Spring软件存储库下载Spring CLI发行版：

- [spring-bot-cli-3.0.2-bin.zip](https://repo.spring.io/release/org/springframework/boot/spring-boot-cli/3.0.2/spring-boot-cli-3.0.2-bin.zip)

- [spring-boot-cli-3.0.2-bin.tar.gz](https://repo.spring.io/release/org/springframework/boot/spring-boot-cli/3.0.2/spring-boot-cli-3.0.2-bin.tar.gz)

还提供最新的快照压缩文件。

下载后，按照解压缩存档中的 [INSTALL.txt](https://raw.githubusercontent.com/spring-projects/spring-boot/v3.0.2/spring-boot-project/spring-boot-tools/spring-boot-cli/src/main/content/INSTALL.txt) 说明进行操作。总之，.zip 文件的 bin/ 目录中有一个 spring 脚本（适用于Windows的spring.bat）。或者，您可以将 java-jar 与.jar 文件一起使用（脚本帮助您确保正确设置了类路径）。

#### 3.2.2 使用SDKMAN安装！

SDKMAN！（软件开发工具包管理器）可用于管理各种二进制SDK的多个版本，包括 Groovy 和 Spring Boot CLI。获取SDKMAN！从 [sdman.io](https://sdkman.io/) 并使用以下命令安装Spring Boot：

```
sdk install springboot
spring --version
## 运行结果
Spring CLI v3.0.2
```

前面的说明安装了一个名为 dev 实例的 spring 本地实例。它指向您的目标构建位置，因此每次重建 Spring Boot 时，Spring都是最新的。

您可以通过运行以下命令来查看它：

```
$ sdk ls springboot

================================================================================
Available Springboot Versions
================================================================================
> + dev
* 3.0.2

================================================================================
+ - local version
* - installed
> - currently in use
================================================================================
```

#### 3.2.3 OSX Homebrew 安装

如果您在Mac上使用 Homebrew，则可以使用以下命令安装Spring Boot CLI：

```
$ brew tap spring-io/tap
$ brew install spring-boot
```

Homebrew installs `spring` to `/usr/local/bin`.

如果你看不到安装包，你的brew安装可能已经过时了。在这种情况下，运行brew更新并重试。

#### 3.2.4 MacPorts 安装

如果您在Mac上并使用 [MacPorts](https://www.macports.org/)，则可以使用以下命令安装Spring Boot CLI：

```
$ sudo port install spring-boot-cli
```

#### 3.2.5 命令行完成

Spring Boot CLI 包括为 BASH 和 zsh shell提供命令完成的脚本。您可以在任何 shell 中获取脚本（也称为spring），也可以将其放入个人或系统范围的 bash 完成初始化中。在 Debian 系统上，系统范围的脚本位于`<installationlocation>/shellcompletion/bash`中，当新的 shell 启动时，将执行该目录中的所有脚本。例如，如果你已经安装过 SDKMAN ，则手动运行脚本，使用以下命令：

```
$ . ~/.sdkman/candidates/springboot/current/shell-completion/bash/spring
$ spring <HIT TAB HERE>
  grab  help  jar  run  test  version
```

>  如果使用 Homebrew 或MacPorts 安装 Spring Boot CLI ，命令行完成脚本将自动注册到 shell 中。

#### 3.2.6 Windows Scoop 安装

如果您在 Windows 上并使用 Scoop ，则可以使用以下命令安装 Spring Boot CLI：

```
> scoop bucket add extras
> scoop install springboot
```

Scoop 将 spring 安装到 ~/shop/apps/springboot/current/bin 。

如果您没有看到应用程序清单，则您安装的 Scoop 可能已过期。在这种情况下，运行 Scoop 更新并重试。



## 4. 开发你的第一个 Spring Boot 应用

本节介绍如何开发一个小型的 “HelloWorld！” web应用程序，该应用程序突出了 Spring Boot 的一些关键特性。我们使用Maven来构建这个项目，因为大多数 IDE 都支持它。



> [spring.io](https://spring.io/) 网站包含许多使用spring Boot的“入门” [指南](https://spring.io/guides)。如果您需要解决某个特定问题，请先查验这个。
>
> 您可以通过转到 [start.spring.io](https://start.spring.io/) 并从依赖项搜索器中选择 “Web” starters 来简化以下步骤。这样做会生成一个新的项目结构，以便您可以立即开始编码。有关详细信息，请参阅 [start.spring.io 用户指南](https://github.com/spring-io/start.spring.io/blob/main/USING.adoc)。

在开始之前，打开一个终端并运行以下命令，以确保安装了有效版本的 Java 和 Maven：

```
java -version

openjdk version "17.0.4.1" 2022-08-12 LTS
OpenJDK Runtime Environment (build 17.0.4.1+1-LTS) 
OpenJDK 64-Bit Server VM (build 17.0.4.1+1-LTS, mixed mode, sharing)
```

```
$ mvn -v
Apache Maven 3.8.5 (3599d3414f046de2324203b78ddcf9b5e4388aa0)
Maven home: usr/Users/developer/tools/maven/3.8.5
Java version: 17.0.4.1, vendor: BellSoft, runtime: /Users/developer/sdkman/candidates/java/17.0.4.1-librca
```

> 此示例需要在其自己的目录中创建。后续说明假定您已经创建了一个合适的目录，并且它是您的当前目录。

### 4.1 创建POM

我们需要首先创建一个Maven `pom.xml` 文件。`pom.xml` 是用于构建项目的配方。打开您喜爱的文本编辑器并添加以下内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myproject</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.2</version>
    </parent>

    <!-- Additional lines to be added here... -->

</project>
```

前面的列表应该为您提供了一个有效的构建。您可以通过运行 mvn 包来测试它（目前，您可以忽略 “jar将为空-没有内容标记为包含！”警告）。

> 此时，您可以将项目导入IDE（大多数现代 Java IDE 都内置了对 Maven 的支持）。为了简单起见，我们继续在本例中使用纯文本编辑器。

### 4.2 添加 Classpath 依赖项

Spring Boot 提供了许多 “Starter”，允许您将 jar 添加到类路径中。我们的冒烟测试应用程序在父 POM 使用 spring-boot-starter-parent  。`spring-boot-starter-parent`  是一个特殊的 starter，它提供了有用的 Maven 默认值。它还提供了一个 [依赖项管理 ](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.dependency-management)部分，以便您可以省略 “受祝福” 依赖项的版本标记。

其他 “Starters” 提供了在开发特定类型的应用程序时可能需要的依赖关系。因为我们正在开发一个 web 应用程序，所以我们添加了一个 spring-boot-starter-web 依赖项。在此之前，我们可以通过运行以下命令来查看当前的情况：

```
$ mvn dependency:tree

[INFO] com.example:myproject:jar:0.0.1-SNAPSHOT
```

mvn dependency:tree 命令打印项目依赖项的树表示。您可以看到，spring-boot-starter-parent 本身不提供依赖关系。要添加必要的依赖项，请编辑 pom.xml，并在parent下面添加 spring-boot-starter-web 依赖项：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

如果再次运行 mvn dependency:tree ，您会看到现在有许多附加的依赖项，包括 Tomcat web 服务器和 Spring Boot 本身。

### 4.3 写代码

要完成应用程序，我们需要创建一个 Java 文件。默认情况下，Maven 从 `src/main/java` 编译源代码，因此您需要创建该目录结构，然后添加名为 `src/main/java/MyApplication.java` 的文件，以包含以下代码：

**Java**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class MyApplication {

    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

}
```

**kotlin**

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@SpringBootApplication
class MyApplication {

    @RequestMapping("/")
    fun home() = "Hello World!"

}

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}
```

虽然这里没有太多代码，但仍有很多工作要做。我们将在接下来的几节中逐步介绍重要的部分。

#### 4.3.1 @RestController 和 @RequestMapping 注解

`MyApplication` 类上的第一个注解是 `@RestController`。这被称为原型注解。它为阅读代码的人和 Spring 提供了类扮演特定角色的提示。在本例中，我们的类是一个web `@Controller`，因此 Spring 在处理传入的web请求时会考虑它。

`@RequestMapping` 注解提供“路由”信息。它告诉 Spring，任何带有 `/path`  的HTTP请求都应该映射到 home 方法。 `@RestController注解

> @RestController 和 @RequestMapping 注解是 Spring MVC 注解（它们不特定于 Spring Boot）。有关更多详细信息，请参阅Spring参考文档中的MVC部分。

####  4.3.2 @SpringBootApplication 注解

第二个类级注解是 `@SpringBootApplication` 。此注解称为元注解，它结合了 `@SpringBootConfiguration`、`@EnableAutoConfiguration` 和 `@ComponentScan`。

其中，我们最感兴趣的注解是 @EnableAutoConfiguration @EnableAutoConfiguration 告诉 Spring Boot 根据您添加的jar 依赖项“猜测” 如何配置Spring 。由于 spring-boot-starter-web 添加了 Tomcat 和 SpringMVC ，所以自动配置假设您正在开发一个web应用程序，并相应地设置 spring。

>  **Starters 和 自动配置**
>
>  自动配置旨在与 “Starters” 配合使用，但这两个概念并没有直接联系。您可以在启动器之外自由选择 jar 依赖项。Spring Boot 仍然尽其所能自动配置应用程序。

#### 4.3.3 Main 方法

我们应用程序的最后一部分是主要方法。这是一个标准方法，遵循应用程序入口点的Java约定。我们的主方法通过调用 run委托给 Spring Boot 的 SpringApplication 类。SpringApplication 启动我们的应用程序，启动 Spring ，然后启动自动配置的 Tomcat web 服务器。我们需要将 MyApplication.class 作为参数传递给 run 方法，以告诉 SpringApplication 哪个是主要的 Spring 组件。还传递args数组以暴露任何命令行参数。

### 4.4 运行示例

此时，您的应用程序应该可以工作了。由于您使用了spring-boot-starter-parent POM，因此您有一个有用的运行目标，可以用来启动应用程序。键入 mvn-spring-boot ：从根项目目录运行以启动应用程序。您应该看到类似于以下内容的输出：

```shell
$ mvn spring-boot:run

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::  (v3.0.2)
....... . . .
....... . . . (log output here)
....... . . .
........ Started MyApplication in 0.906 seconds (process running for 6.514)
```

如果打开 localhost:8080 的 web 浏览器，应该会看到以下输出：

```
Hello World!
```

要优雅地退出应用程序，请按 ctrl-c。

### 4.5 创建一个可执行 jar 包

我们通过创建一个可以在生产环境中运行的完全独立的可执行 jar 文件来完成我们的示例。可执行 jar（有时称为“fit jar”）是包含编译类以及代码需要运行的所有 jar 依赖项的归档文件。

> 可执行 jar 和 Java
>
> Java 没有提供加载嵌套 jar 文件（ jar 文件本身包含在 jar 中）的标准方法。如果您希望分发自包含的应用程序，这可能会有问题。
>
> 为了解决这个问题，许多开发人员使用 “超级” jar。一个超级 jar将所有应用程序依赖项中的所有类打包到一个归档文件中。这种方法的问题是很难看到应用程序中有哪些库。如果在多个 jar 中使用相同的文件名（但具有不同的内容），也会有问题。
>
> Spring Boot采用了一种不同的方法，允许您直接嵌套 jar。

要创建一个可执行 jar，我们需要将 spring-boot-maven 插件添加到 pom.xml 中。为此，在 dependencies 部分下面插入以下行：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

spring-boot-starter-parent POM包含 `<executions>` 配置以绑定重新打包目标。如果不使用父POM，则需要自己声明此配置。有关详细信息，请参阅 [插件文档](https://docs.spring.io/spring-boot/docs/3.0.2/maven-plugin/reference/htmlsingle/#getting-started) 。

保存 pom.xml 并从命令行运行 mvn 包，如下所示：

```shell
$ mvn package

[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building myproject 0.0.1-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO] .... ..
[INFO] --- maven-jar-plugin:2.4:jar (default-jar) @ myproject ---
[INFO] Building jar: /Users/developer/example/spring-boot-example/target/myproject-0.0.1-SNAPSHOT.jar
[INFO]
[INFO] --- spring-boot-maven-plugin:3.0.2:repackage (default) @ myproject ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

您还应该在目标目录中看到一个名为 `myproject-0.0.1-SNAPSHOT.jar.original` 的小得多的文件。这是Maven在Spring Boot 重新打包之前创建的原始jar文件。

要运行该应用程序，请使用 java-jar 命令，如下所示：

```shell
$ java -jar target/myproject-0.0.1-SNAPSHOT.jar

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::  (v3.0.2)
....... . . .
....... . . . (log output here)
....... . . .
........ Started MyApplication in 2.536 seconds (process running for 2.864)
```

要优雅地退出应用程序，请按 ctrl-c。