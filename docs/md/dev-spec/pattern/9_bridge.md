---
layout: post
category: 设计模式
title: 结构型 - 桥接模式（Bridge Pattern）
tagline: by janker
tag: [设计模式]
excerpt: 知其然，知其所以然，忙时做业绩，闲时修内功。  @janker
--- 

# 结构型 - 桥接模式（Bridge Pattern）

> 桥接（Bridge）是用于把抽象化与实现化解耦，使得二者可以独立变化。这种类型的设计模式属于结构型模式，它通过提供抽象化和实现化之间的桥接结构，来实现二者的解耦。

> 这种模式涉及到一个作为桥接的接口，使得实体类的功能独立于接口实现类。这两种类型的类可被结构化改变而互不影响。

> 我们通过下面的实例来演示桥接模式（Bridge Pattern）的用法。其中，可以使用相同的抽象类方法但是不同的桥接实现类，来画出不同颜色的圆。

[[toc]]

## 概述

### 意图
将抽象部分与实现部分分离，使它们都可以独立的变化。
### 解决的问题
在有多种可能会变化的情况下，用继承会造成类爆炸问题，扩展起来不灵活。

### 关键思路
- 把这种多角度分类分离出来，让它们独立变化，减少它们之间耦合。
- 抽象类依赖实现类。

### 使用场景
1. 如果一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性，避免在两个层次之间建立静态的继承联系，通过桥接模式可以使它们在抽象层建立一个关联关系。 
2. 对于那些不希望使用继承或因为多层次继承导致系统类的个数急剧增加的系统，桥接模式尤为适用。 
3. 一个类存在两个独立变化的维度，且这两个维度都需要进行扩展。

::: warning 注意
对于两个独立变化的维度，使用桥接模式再适合不过了。
:::

## 实现

我们有一个作为桥接实现的 `DrawAPI` 接口和实现了 `DrawAPI` 接口的实体类 `RedCircle`、`GreenCircle`。`Shape` 是一个抽象类，将使用 `DrawAPI` 的对象。`BridgePatternDemo` 类使用 `Shape` 类来画出不同颜色的圆。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220402212626.png)

### 1. 创建桥接实现接口。

```java
public interface DrawAPI {
   public void drawCircle(int radius, int x, int y);
}
```
### 2. 创建实现了 DrawAPI 接口的实体桥接实现类。
```java
public class RedCircle implements DrawAPI {
   @Override
   public void drawCircle(int radius, int x, int y) {
      System.out.println("Drawing Circle[ color: red, radius: "
         + radius +", x: " +x+", "+ y +"]");
   }
}
```
```java
public class GreenCircle implements DrawAPI {
   @Override
   public void drawCircle(int radius, int x, int y) {
      System.out.println("Drawing Circle[ color: green, radius: "
         + radius +", x: " +x+", "+ y +"]");
   }
}
```

### 3. 使用 DrawAPI 接口创建抽象类 Shape。
```java
public abstract class Shape {
   protected DrawAPI drawAPI;
   protected Shape(DrawAPI drawAPI){
      this.drawAPI = drawAPI;
   }
   public abstract void draw();  
}
```

### 4. 创建实现了 Shape 抽象类的实体类。
```java
public class Circle extends Shape {
   private int x, y, radius;
 
   public Circle(int x, int y, int radius, DrawAPI drawAPI) {
      super(drawAPI);
      this.x = x;  
      this.y = y;  
      this.radius = radius;
   }
 
   public void draw() {
      drawAPI.drawCircle(radius,x,y);
   }
}
```

### 5. 使用 Shape 和 DrawAPI 类画出不同颜色的圆。
```java
public class BridgePatternDemo {
   public static void main(String[] args) {
      Shape redCircle = new Circle(100,100, 10, new RedCircle());
      Shape greenCircle = new Circle(100,100, 10, new GreenCircle());
 
      redCircle.draw();
      greenCircle.draw();
   }
}
```

### 6. 执行程序，输出结果
```shell
Drawing Circle[ color: red, radius: 10, x: 100, 100]
Drawing Circle[  color: green, radius: 10, x: 100, 100]
```