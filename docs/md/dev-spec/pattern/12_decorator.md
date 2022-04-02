---
layout: post
category: 设计模式
title: 结构型 - 装饰器模式（Decorator Pattern）
tagline: by janker
tag: [设计模式]
excerpt: 知其然，知其所以然，忙时做业绩，闲时修内功。  @janker
---


# 装饰器模式（Decorator Pattern）

> 装饰器模式（Decorator Pattern）允许向一个现有的对象添加新的功能，同时又不改变其结构。这种类型的设计模式属于结构型模式，它是作为现有的类的一个包装。

> 这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。

> 我们通过下面的实例来演示装饰器模式的用法。其中，我们将把一个形状装饰上不同的颜色，同时又不改变形状类。

[[toc]]

## 概述
### 意图
动态地给一个对象添加一些额外的职责。就增加功能来说，装饰器模式相比生成子类更为灵活。
### 解决的问题点
一般的，我们为了扩展一个类经常使用继承方式实现，由于继承为类引入静态特征，并且随着扩展功能的增多，子类会很膨胀。
### 关键思路
将具体功能职责划分，同时继承装饰者模式。

1. Component 类充当抽象角色，不应该具体实现。
2. 修饰类引用和继承 Component 类，具体扩展类重写父类方法。
### 优缺点
1. 优点
- 装饰类和被装饰类可以独立发展，不会相互耦合，装饰模式是继承的一个替代模式，装饰模式可以动态扩展一个实现类的功能。
2. 缺点
- 多层装饰比较复杂。
### 使用场景
1. 扩展一个类的功能。
2. 动态增加功能，动态撤销。
::: warning
可代替继承。
:::
## 实现

我们将创建一个 `Shape` 接口和实现了 `Shape` 接口的实体类。然后我们创建一个实现了 `Shape` 接口的抽象装饰类 `ShapeDecorator`，并把 `Shape` 对象作为它的实例变量。

`RedShapeDecorator` 是实现了 `ShapeDecorator` 的实体类。

`DecoratorPatternDemo` 类使用 `RedShapeDecorator` 来装饰 Shape 对象。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220402232857.png)

### 1. 创建一个接口
```java
public interface Shape {
   void draw();
}
```

### 2. 创建实现接口的实体类。
```java
public class Rectangle implements Shape {
 
   @Override
   public void draw() {
      System.out.println("Shape: Rectangle");
   }
}
```
```java
public class Circle implements Shape {
 
   @Override
   public void draw() {
      System.out.println("Shape: Circle");
   }
}
```
### 3. 创建实现了 Shape 接口的抽象装饰类。
```java
public abstract class ShapeDecorator implements Shape {
   protected Shape decoratedShape;
 
   public ShapeDecorator(Shape decoratedShape){
      this.decoratedShape = decoratedShape;
   }
 
   public void draw(){
      decoratedShape.draw();
   }  
}
```

### 4. 创建扩展了 ShapeDecorator 类的实体装饰类。

```java
public class RedShapeDecorator extends ShapeDecorator {
 
   public RedShapeDecorator(Shape decoratedShape) {
      super(decoratedShape);     
   }
 
   @Override
   public void draw() {
      decoratedShape.draw();         
      setRedBorder(decoratedShape);
   }
 
   private void setRedBorder(Shape decoratedShape){
      System.out.println("Border Color: Red");
   }
}
```

### 5. 使用 RedShapeDecorator 来装饰 Shape 对象。

```java
public class DecoratorPatternDemo {
   public static void main(String[] args) {
 
      Shape circle = new Circle();
      ShapeDecorator redCircle = new RedShapeDecorator(new Circle());
      ShapeDecorator redRectangle = new RedShapeDecorator(new Rectangle());
      //Shape redCircle = new RedShapeDecorator(new Circle());
      //Shape redRectangle = new RedShapeDecorator(new Rectangle());
      System.out.println("Circle with normal border");
      circle.draw();
 
      System.out.println("\nCircle of red border");
      redCircle.draw();
 
      System.out.println("\nRectangle of red border");
      redRectangle.draw();
   }
}
```

### 6. 执行程序，输出结果
```shell
Circle with normal border
Shape: Circle

Circle of red border
Shape: Circle
Border Color: Red

Rectangle of red border
Shape: Rectangle
Border Color: Red
```