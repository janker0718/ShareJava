---
date: 2023-03-12
---
# 容器镜像
Spring Boot 应用程序可以[使用 Dockerfile](https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html#container-images.dockerfiles) 进行容器化，或者[使用 Cloud Native Buildpacks 创建可以在任何地方运行的优化的 docker 兼容容器镜像](https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html#container-images.buildpacks)。

## 1. 高效的容器镜像

很容易将 Spring Boot `fat jar` 打包为 docker 镜像。 但是，像在 docker 镜像中那样复制和运行 `fat jar` 有很多缺点。 在不解压的情况下运行 fat jar 时，总会有一定的开销，在容器化环境中，这会很明显。 另一个问题是，将应用程序的代码及其所有依赖项放在 `Docker` 镜像的一层中并不是最佳选择。 由于与升级您使用的 Spring Boot 版本相比，您重新编译代码的频率可能更高，因此通常最好将内容分开一些。 如果将 jar 文件放在应用程序类之前的层中，`Docker` 通常只需要更改最底层，就可以从其缓存中提取其他文件。

### 1.1 解压可执行 JAR

如果您从容器中运行您的应用程序，您可以使用可执行 jar，但分解它并以不同的方式运行它通常也是一个优势。 某些 PaaS 实现也可能选择在运行之前解压缩存档。 例如，Cloud Foundry 就是这样运作的。 运行解压缩存档的一种方法是启动适当的启动器，如下所示：

```shell
$ jar -xf myapp.jar
$ java org.springframework.boot.loader.JarLauncher
```

这实际上比从未展开的存档运行时在启动时稍快（取决于 jar 的大小）。 启动后，您不应期望有任何差异。

解压 jar 文件后，您还可以通过使用其“自然”主要方法而不是 JarLauncher 运行应用程序来额外缩短启动时间。 例如：

```shell
$ jar -xf myapp.jar
$ java -cp BOOT-INF/classes:BOOT-INF/lib/* com.example.MyApplication
```

::: info 信息

在应用程序的主要方法上使用 `JarLauncher` 具有可预测类路径顺序的额外好处。 jar 包含一个 `classpath.idx` 文件，`JarLauncher` 在构建类路径时使用该文件。

:::



### 1.2 分层 Docker 图像

为了更容易创建优化的 Docker 镜像，Spring Boot 支持在 jar 中添加层索引文件。 它提供了一个层列表以及应该包含在其中的 jar 部分。 索引中的层列表根据层应添加到 Docker/OCI 映像的顺序排序。 开箱即用，支持以下层：

- `dependencies` (对于定期发布的依赖项)
- `spring-boot-loader` (用于 `org/springframework/boot/loader` 下的所有内容)
- `snapshot-dependencies` (用于快照依赖项)
- `application` (用于应用程序类和资源)

下面显示了一个 `layers.idx` 文件的示例：

```shell
- "dependencies":
  - BOOT-INF/lib/library1.jar
  - BOOT-INF/lib/library2.jar
- "spring-boot-loader":
  - org/springframework/boot/loader/JarLauncher.class
  - org/springframework/boot/loader/jar/JarEntry.class
- "snapshot-dependencies":
  - BOOT-INF/lib/library3-SNAPSHOT.jar
- "application":
  - META-INF/MANIFEST.MF
  - BOOT-INF/classes/a/b/C.class
```

这种分层旨在根据应用程序构建之间更改的可能性来分离代码。 库代码不太可能在构建之间更改，因此它被放置在自己的层中以允许工具重新使用缓存中的层。 应用程序代码更有可能在构建之间发生变化，因此它被隔离在一个单独的层中。

Spring Boot 还支持在 layers.idx 的帮助下对 war 文件进行分层。

对于 Maven，请参阅[打包分层 jar 或 war 部分](https://docs.spring.io/spring-boot/docs/3.0.4/maven-plugin/reference/htmlsingle/#repackage-layers)以获取有关将层索引添加到存档的更多详细信息。 对于 Gradle，请参阅 Gradle 插件文档的[打包分层 jar 或 war 部分](https://docs.spring.io/spring-boot/docs/3.0.4/gradle-plugin/reference/htmlsingle/#packaging-layered-archives)。

## 2. Dockfiles

虽然只需在 `Dockerfile` 中添加几行代码就可以将 Spring Boot `fat jar` 转换为 `docker` 镜像，但我们将使用分层功能来创建优化的 `docker` 镜像。 当您创建包含层索引文件的 `jar` 时，`spring-boot-jarmode-layertools` jar 将作为依赖项添加到您的 `jar`。 通过类路径中的这个 `jar`，您可以在特殊模式下启动您的应用程序，该模式允许引导程序代码运行与您的应用程序完全不同的东西，例如，提取层的东西。

::: error 警告

`layertools` 模式不能与包含启动脚本的[完全可执行的 Spring Boot 存档](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html#deployment.installing)一起使用。 在构建旨在与 `layertools` 一起使用的 jar 文件时禁用启动脚本配置。

::: 

以下是使用 `layertools` jar 模式启动 jar 的方法：
```shell
$ java -Djarmode=layertools -jar my-app.jar
```

这将提供以下输出：

```shell
Usage:
  java -Djarmode=layertools -jar my-app.jar

Available commands:
  list     List layers from the jar that can be extracted
  extract  Extracts layers from the jar for image creation
  help     Help about any command
```

`extract` 命令可用于轻松地将应用程序拆分为要添加到 `dockerfile` 的层。 下面是一个使用 `jarmode` 的 Dockerfile 示例。

```shell
FROM eclipse-temurin:17-jre as builder
WORKDIR application
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=layertools -jar application.jar extract

FROM eclipse-temurin:17-jre
WORKDIR application
COPY --from=builder application/dependencies/ ./
COPY --from=builder application/spring-boot-loader/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

假设上述 Dockerfile 位于当前目录中，您的 docker 镜像可以使用 docker build 构建，或者可以选择指定应用程序 jar 的路径，如以下示例所示：

```shell
$ docker build --build-arg JAR_FILE=path/to/myapp.jar .
```

这是一个多阶段的 `dockerfile`。 构建器阶段提取稍后需要的目录。 每个 `COPY` 命令都与 `jarmode` 提取的层相关。 

当然，不使用 `jarmode` 也可以编写 `Dockerfile`。 您可以使用 `unzip` 和 `mv` 的某种组合将内容移动到正确的层，但 `jarmode` 简化了这一点。



## 3. Cloud Native Buildpacks

Dockerfiles 只是构建 docker 镜像的一种方式。 另一种构建 docker 镜像的方法是直接从您的 Maven 或 Gradle 插件，使用 buildpacks。 如果您曾经使用过 Cloud Foundry 或 Heroku 等应用程序平台，那么您可能使用过构建包。 构建包是平台的一部分，它将您的应用程序转换为平台可以实际运行的东西。 例如，Cloud Foundry 的 Java buildpack 会注意到您正在推送一个 .jar 文件并自动添加一个相关的 JRE。

借助 Cloud Native Buildpacks，您可以创建可在任何地方运行的 Docker 兼容映像。 Spring Boot 包括直接对 Maven 和 Gradle 的构建包支持。 这意味着您只需键入一个命令，即可将合理的图像快速获取到本地运行的 Docker 守护程序中。

请参阅有关如何将 buildpacks 与 [Maven](https://docs.spring.io/spring-boot/docs/3.0.4/maven-plugin/reference/htmlsingle/#build-image) 和 [Gradle](https://docs.spring.io/spring-boot/docs/3.0.4/gradle-plugin/reference/htmlsingle/#build-image) 一起使用的各个插件文档。

::: info 信息

[Paketo Spring Boot buildpack](https://github.com/paketo-buildpacks/spring-boot) 也已更新以支持 layers.idx 文件，因此应用于它的任何自定义都将反映在 buildpack 创建的图像中。

:::

::: info 信息

为了实现可重现的构建和容器图像缓存，`Buildpacks` 可以操纵应用程序资源元数据（例如文件的“最后修改”信息）。 您应该确保您的应用程序在运行时不依赖于该元数据。 Spring Boot 可以在提供静态资源时使用该信息，但这可以通过 `spring.web.resources.cache.use-last-modified` 禁用。

:::