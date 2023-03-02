# 升级 Spring Boot 应用
从1.x升级，升级到新功能版本，并升级 Spring Boot CLI。

项目 [wiki](https://github.com/spring-projects/spring-boot/wiki) 上提供了如何从早期版本的 Spring Boot 升级的说明。按照[发行说明](https://github.com/spring-projects/spring-boot/wiki#release-notes)部分中的链接查找要升级到的版本。

升级说明始终是发行说明中的第一项。如果您落后了一个以上的版本，请确保您也查看了您跳过的版本的发行说明。

## 1. 从 1.x 升级

如果要从SpringBoot 的 1.x 版本升级，请查看[项目 wiki上的“迁移指南”](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.0-Migration-Guide)，该指南提供了详细的升级说明。还可以查看[“发行说明”](https://github.com/spring-projects/spring-boot/wiki)，查看每个版本的 “新的和值得注意的” 特性列表。

## 2. 升级到一个新的功能版本

升级到新功能版本时，某些属性可能已重命名或删除。SpringBoot 提供了一种在启动时分析应用程序环境和打印诊断信息的方法，还可以在运行时临时迁移属性。要启用该功能，请将以下依赖项添加到项目中：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-properties-migrator</artifactId>
    <scope>runtime</scope>
</dependency>
```

> 注意
>
> 不会考虑延迟添加到环境中的属性，例如在使用 @PropertySource 时。

> 完成迁移后，请确保从项目的依赖项中删除此模块。



## 3. 升级 Spring Boot Cli

要升级现有的CLI安装，请使用相应的包管理器命令（例如`brew upgrade`）。如果手动安装CLI ，请遵循标准说明，记住更新 PATH 环境变量以删除任何旧的引用。