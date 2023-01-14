# 创建型 - 工厂方法模式（Factory Method Pattern）


> 在[《工厂模式》](/md/dev-spec/pattern/5_factory_method.md)中我们介绍了工厂模式，提到了简单工厂模式违背了开闭原则，而“工厂方法模式”是对简单工厂模式的进一步抽象化，其好处是可以使系统在不修改原来代码的情况下引进新的产品，即满足开闭原则。

[[toc]]


## 优缺点
1. 优点
- 用户只需要知道具体工厂的名称就可得到所要的产品，无须知道产品的具体创建过程。
- 灵活性增强，对于新产品的创建，只需多写一个相应的工厂类。
- 典型的解耦框架。高层模块只需要知道产品的抽象类，无须关心其他实现类，满足迪米特法则、依赖倒置原则和里氏替换原则。

2. 缺点
- 类的个数容易过多，增加复杂度
- 增加了系统的抽象性和理解难度
- 抽象产品只能生产一种产品，此弊端可使用抽象工厂模式解决。

## 应用场景

- 客户只知道创建产品的工厂名，而不知道具体的产品名。如 TCL 电视工厂、海信电视工厂等。
- 创建对象的任务由多个具体子工厂中的某一个完成，而抽象工厂只提供创建产品的接口。
- 客户不关心创建产品的细节，只关心产品的品牌

## 结构与实现
> 工厂方法模式由抽象工厂、具体工厂、抽象产品和具体产品等4个要素构成。本节来分析其基本结构和实现方法。

### 1. 模式的结构

工厂方法模式的主要角色如下。 

1. 抽象工厂（`Abstract Factory`）：提供了创建产品的接口，调用者通过它访问具体工厂的工厂方法 `newProduct()` 来创建产品。
2. 具体工厂（`ConcreteFactory`）：主要是实现抽象工厂中的抽象方法，完成具体产品的创建。
3. 抽象产品（`Product`）：定义了产品的规范，描述了产品的主要特性和功能。
4. 具体产品（`ConcreteProduct`）：实现了抽象产品角色所定义的接口，由具体工厂来创建，它同具体工厂之间一一对应。

其结构图如图 1 所示。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220330214556.png)

### 2. 模式的实现

根据图 1 写出该模式的代码如下：

**抽象工厂**

```java
public interface AbstractFactory {
    Product newProduct();
}
```
**具体工厂**
```java
public class ConcreteFactory1 implements AbstractFactory {

    @Override
    public Product newProduct() {
        System.out.println("具体工厂1生成-->具体产品1...");
        return new ConcreteProduct1();
    }
}
```
```java
public class ConcreteFactory2 implements AbstractFactory {

    @Override
    public Product newProduct() {
        System.out.println("具体工厂2生成-->具体产品2...");
        return new ConcreteProduct2();
    }
}
```

**抽象产品**
```java
public interface Product {
    void show();
}
```

**具体产品**

```java
public class ConcreteProduct1 implements Product {
    @Override
    public void show() {
        System.out.println("具体产品1显示...");
    }
}
```

```java
public class ConcreteProduct2 implements Product {

    @Override
    public void show() {
        System.out.println("具体产品2显示...");
    }
}
```

**读取 xml 配置工厂类，创建产品**
_xml配置_
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <className>ConcreteFactory1</className>
</config>
```
```java
public class AbstractFactoryTest {
    public static void main(String[] args) {
        try {
            Product a;
            AbstractFactory af;
            af = (AbstractFactory) ReadXML1.getObject();
            a = af.newProduct();
            a.show();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
```
### 程序运行结果

```shell
具体工厂1生成-->具体产品1...
具体产品1显示...
```
如果将 XML 配置文件中的 ConcreteFactory1 改为 ConcreteFactory2，则程序运行结果如下：
```shell
具体工厂2生成-->具体产品2...
具体产品2显示...
```



