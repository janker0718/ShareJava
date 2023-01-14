
# 面试 - 小册

::: tip To 我
知其然，知其所以然，忙时做业绩，闲时修内功。  by janker
:::

[[toc]]

## JVM
### JVM内存模型，GC机制和原理;
**内存模型**

`Jdk1.6` 及之前:有永久代, 常量池在方法区

`Jdk1.7` 有永久代，但已经逐步“去永久代”，常量池在堆

`Jdk1.8` 及之后: 无永久代，常量池在元空间

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327094415.png)


### GC分哪两种，Minor GC 和Full GC有什么区别?什么时候会触发Full GC?分别采用什么算法?
![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327100327.png)

对象从新生代区域消失的过程，我们称之为 "minor GC"

对象从老年代区域消失的过程，我们称之为 "major GC"


**Minor GC**

清理整个YouGen的过程，eden的清理，S0\S1的清理都会由于MinorGC Allocation Failure(YoungGen区内存不足)，而触发minorGC , Major GC OldGen区内存不足，触发Major GC

**Full GC**

Full GC 是清理整个堆空间—包括年轻代和永久代

Full GC 触发的场景
1) System.gc
2) promotion failed (年代晋升失败,比如eden区的存活对象晋升到S区放不下，又尝试直接晋 升到Old区又放不下，那么Promotion Failed,会触发FullGC)
3) CMS的Concurrent-Mode-Failure

   由于CMS回收过程中主要分为四步:1.CMS initial mark 2.CMS Concurrent mark 3.CMS remark 4.CMS Concurrent sweep。在2中gc线程与用户线程同时执行，那么用户线程依旧可 能同时产生垃圾， 如果这个垃圾较多无法放入预留的空间就会产生CMS-Mode-Failure， 切换 为SerialOld单线程做mark-sweep-compact。
4) 新生代晋升的平均大小大于老年代的剩余空间 (为了避免新生代晋升到老年代失败) 当使用G1,CMS 时，FullGC发生的时候 是 Serial+SerialOld。 当使用ParalOld时，FullGC发生的时候是 ParallNew +ParallOld.

### JVM里的有几种classloader，为什么会有多种?
启动类加载器:负责加载JRE的核心类库，如jre目标下的rt.jar,charsets.jar等

扩展类加载器:负责加载JRE扩展目录ext中JAR类包

系统类加载器:负责加载ClassPath路径下的类包

用户自定义加载器:负责加载用户自定义路径下的类包

**为什么会有多种:**
1) 分工，各自负责各自的区块
2) 为了实现委托模型
### 什么是双亲委派机制?介绍一些运作过程，双亲委派模型的好处;
如果一个类加载器收到了类加载请求，它并不会自己先去加载，而是把这个请求委托给父类的 加载器去执行，如果父类加载器还存在其父类加载器，则进一步向上委托，依次递归，请求最终 将到达顶层的启动类加载器，如果父类加载器可以完成类加载任务，就成功返回，倘若父类加载 器无法完成此加载任务，子加载器才会尝试自己去加载，这就是双亲委派模式，即每个儿子都不 愿意干活，每次有活就丢给父亲去干，直到父亲说这件事我也干不了时，儿子自己想办法去完 成，这不就是传说中的双亲委派模式。

**动作过程**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327100633.png)

**好处**

沙箱安全机制: 自己写的String.class类不会被加载，这样便可以防止核心API库被随意篡改

避免类的重复加载: 当父亲已经加载了该类时，就没有必要子ClassLoader再加载一次

### 什么情况下我们需要破坏双亲委派模型;
tomcat多应用并存加载

### 常见的JVM调优方法有哪些?可以具体到调整哪个参数，调成什么值?
**调优工具**

console，jProfile，VisualVM

Dump线程详细信息:查看线程内部运行情况

死锁检查

查看堆内类、对象信息查看:数量、类型等

**线程监控**

线程信息监控: 系统线程数量。
线程状态监控: 各个线程都处在什么样的状态下

**热点分析**
CPU热点: 检查系统哪些方法占用的大量CPU时间

内存热点: 检查哪些对象在系统中数量最大(一定时间内存活对象和销毁对象一起统计)

**内存泄漏检查**

<待补充>

### JVM虚拟机内存划分、类加载器、垃圾收集算法、垃圾收集器、class文件结构是如何解析的;
JVM虚拟机内存划分(重复)

类加载器(重复)

垃圾收集算法:标记-清除算法、复制算法、标记-整理算法、分代收集算法

垃圾收集器: Serial收集器、ParNew收集器、Parallel Scavenge收集器、Serial Old收集器、
Parallel Old收集器、CMS收集器、G1收集器、Z垃圾收集器

**class文件结构是如何解析的**

解悉过程:https://blog.csdn.net/sinat_38259539/article/details/78248454

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327105842.png)


## Java基础、Java进阶

### 红黑树的实现原理和应用场景;
![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327105918.png)

红黑树(一棵自平衡的排序二叉树)五大特性:

1) 每个结点要么是红的，要么是黑的。
2) 根结点是黑的。
3) 每个叶结点，即空结点是黑的。
4) 如果一个结点是红的，那么它的俩个儿子都是黑的。
5) 对每个结点，从该结点到其子孙结点的所有路径上包含相同数目的黑结点。

**场景**
1. 广泛用于 `C++` 的STL中，`map` 和 `set` 都是用红黑树实现的。
2. 著名的 `linux` 进程调度`Completely Fair Scheduler`,用红黑树管理进程控制块,进程的虚拟内存 区域都存储在一颗红黑树上,每个虚拟地址区域都对应红黑树的一个节点,左指针指向相邻的地址 虚拟存储区域,右指针指向相邻的高地址虚拟地址空间.
3. `IO` 多路复用epoll的实现采用红黑树组织管理 `sockfd` ，以支持快速的增删改查.
4. `ngnix` 中,用红黑树管理 `timer` ,因为红黑树是有序的,可以很快的得到距离当前最小的定时器.
5. `java` 中的 `TreeSet` , `TreeMap`

### NIO是什么?适用于何种场景?
(`New IO`) 为所有的原始类型( `boolean` 类型除外)提供缓存支持的数据容器，使用它可以提 供非阻塞式的高伸缩性网络。

特性:`I/O` 多路复用 + 非阻塞式 `I/O`

`NIO` 适用场景 服务器需要支持超大量的长时间连接。比如 10000 个连接以上，并且每个客户端并不会频繁地发 送太多数据。例如总公司的一个中心服务器需要收集全国便利店各个收银机的交易信息，只需要 少量线程按需处理维护的大量长期连接。

`Jetty`、`Mina`、`Netty`、`ZooKeeper` 等都是基于 `NIO` 方式实现。

[【NIO技术概览】](http://www.ideabuffer.cn/2017/08/13/NIO%E6%8A%80%E6%9C%AF%E6%A6%82%E8%A7%88/)
### Java9比Java8改进了什么;
1. 引入了模块系统，采用模块化系统的应用程序只需要这些应用程序所需的那部分JDK模块， 而非是整个JDK框架了，减少了内存的开销。
2. 引入了一个新的package:java.net.http，里面提供了对Http访问很好的支持，不仅支持 Http1.1而且还支持HTTP2。
3. 引入了jshell这个交互性工具，让Java也可以像脚本语言一样来运行，可以从控制台启动 jshell ，在 jshell 中直接输入表达式并查看其执行结果。
4. 增加了List.of()、Set.of()、Map.of()和Map.ofEntries()等工厂方法来创建不可变集合
5. HTML5风格的Java帮助文档
6. 多版本兼容 JAR 功能，能让你创建仅在特定版本的 Java 环境中运行库程序时选择使用的 class 版本。
7. 统一 JVM 日志

   可以使用新的命令行选项-Xlog 来控制JVM 上 所有组件的日志记录。该日志记录系统可以设置
8. 垃圾收集机制

   Java 9 移除了在 Java 8 中 被废弃的垃圾回收器配置组合，同时把G1设为默认的垃圾回收器实 现.因为相对于Parallel来说，G1会在应用线程上做更多的事情，而Parallel几乎没有在应用线程 上做任何事情，它基本上完全依赖GC线程完成所有的内存管理。这意味着切换到G1将会为应用 线程带来额外的工作，从而直接影响到应用的性能
9. `I/O` 流新特性

   java.io.InputStream 中增加了新的方法来读取和复制 InputStream 中包含的数据。 readAllBytes:读取 InputStream 中的所有剩余字节。
   readNBytes: 从 InputStream 中读取指定数量的字节到数组中。 transferTo:读取 InputStream 中的全部字节并写入到指定的 OutputStream 中 。

参考:
[`java8` 新特性](https://www.jb51.net/article/48304.htm)

[`java9` 新特性](https://blog.csdn.net/mxw2552261/article/details/79080678)

### HashMap内部的数据结构是什么?底层是怎么实现的?
HashMap内部结构

jdk8以前:数组+链表

jdk8以后:数组+链表 (当链表长度到8时，转化为红黑树)

在并发的情况，发生扩容时，可能会产生循环链表，在执行get的时候，会触发死循环，引起 CPU的100%问题，所以一定要避免在并发环境下使用HashMap。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327113525.png)

**延伸考察ConcurrentHashMap与HashMap、HashTable等，考察 对技术细节的深入了解程度;**

HashMap、HashTable、ConcurrentHashMap的原理与区别

[老生常谈，HashMap的死循环](https://www.jianshu.com/p/1e9cf0ac07f4)

[ConcurrentHashMap在jdk1.8中的改进](https://www.cnblogs.com/everSeeker/p/5601861.html)

[谈谈ConcurrentHashMap1.7和1.8的不同实现](https://www.cnblogs.com/everSeeker/p/5601861.html)

[深入分析ConcurrentHashMap1.8的扩容实现](https://www.jianshu.com/p/f6730d5784ad)

[深入浅出ConcurrentHashMap1.8](https://www.jianshu.com/p/c0642afe03e0)

[ConcurrentHashMap的红黑树实现分析](https://www.jianshu.com/p/23b84ba9a498)

### 说说反射的用途及实现，反射是不是很慢，我们在项目中是否要避免使用反射;
**一、用途**

反射被广泛地用于那些需要在运行时检测或修改程序行为的程序中。

**二、实现方式**

Foo foo = new Foo();

第一种:通过Object类的getClass方法 Class cla = foo.getClass();

第二种:通过对象实例方法获取对象
Class cla = foo.class;

第三种:通过Class.forName方式

Class cla = Class.forName("xx.xx.Foo");

**三、缺点**
1) 影响性能

   反射包括了一些动态类型，所以 JVM 无法对这些代码进行优化。因此，反射操作的效 率要比那些非反射操作低得多。我们应该避免在经常被执行的代码或对性能要求很高的程 序中使用反射。
3) 安全限制

   使用反射技术要求程序必须在一个没有安全限制的环境中运行。
4) 内部暴露

   由于反射允许代码执行一些在正常情况下不被允许的操作(比如访问私有的属性和方 法)，所以 使用反射可能会导致意料之外的副作用--代码有功能上的错误，降低可移植性。 反射代码破坏 了抽象性，因此当平台发生改变的时候，代码的行为就有可能也随着变化。

### 说说自定义注解的场景及实现;

利用自定义注解,结合SpringAOP可以完成权限控制、日志记录、统一异常处理、数字签名、数 据加解密等功能。

**实现场景(API接口数据加解密)**
1) 自定义一个注解，在需要加解密的方法上添加该注解
2) 配置SringAOP环绕通知
3) 截获方法入参并进行解密
4) 截获方法返回值并进行加密

### List 和 Map 区别
**一、概述**

List是存储单列数据的集合，Map是存储键和值这样的双列数据的集合， List中存储的数据是有顺序，并且允许重复，值允许有多个null; Map中存储的数据是没有顺序的，键不能重复，值是可以有重复的，key最多有一个null。

**二、明细**

**List**

1) 可以允许重复的对象。
2) 可以插入多个null元素。
3) 是一个有序容器，保持了每个元素的插入顺序，输出的顺序就是插入的顺序。
4) 常用的实现类有 ArrayList、LinkedList 和 Vector。ArrayList 最为流行，它提供了使用索引 的随意访问，而 LinkedList 则对于经常需要从 List 中添加或删除元素的场合更为合适。

**Map**

1) Map不是collection的子接口或者实现类。Map是一个接口。
2) Map 的 每个 Entry 都持有两个对象，也就是一个键一个值，Map 可能会持有相同的值对象 但键对象必须是唯一的。
3) TreeMap 也通过 Comparator 或者 Comparable 维护了一个排序顺序。
4) Map 里你可以拥有随意个 null 值但最多只能有一个 null 键。
5) Map 接口最流行的几个实现类是 HashMap、LinkedHashMap、Hashtable 和 TreeMap。 (HashMap、TreeMap最常用)

**Set(问题扩展)**

1) 不允许重复对象
2) 无序容器，你无法保证每个元素的存储顺序，TreeSet通过 Comparator 或Comparable 维 护了一个排序顺序。
3) 只允许一个 null 元素
4) Set 接口最流行的几个实现类是 HashSet、LinkedHashSet 以及 TreeSet。最流行的是基于 HashMap 实现的 HashSet;TreeSet 还实现了 SortedSet 接口，因此 TreeSet 是一个根据其 compare() 和 compareTo() 的定义进行排序的有序容器。

**三、场景(问题扩展)**

1) 如果你经常使用索引来对容器中的元素进行访问，那么 List 是你的正确的选择。如果你已 经知道索引了的话，那么 List 的实现类比如 ArrayList 可以提供更快速的访问,如果经常添加删除 元素的，那么肯定要选择LinkedList。
2) 如果你想容器中的元素能够按照它们插入的次序进行有序存储，那么还是 List，因为 List 是 一个有序容器，它按照插入顺序进行存储。
3) 如果你想保证插入元素的唯一性，也就是你不想有重复值的出现，那么可以选择一个 Set 的 实现类，比如 HashSet、LinkedHashSet 或者 TreeSet。所有 Set 的实现类都遵循了统一约束 比如唯一性，而且还提供了额外的特性比如 TreeSet 还是一个 SortedSet，所有存储于 TreeSet 中的元素可以使用 Java 里的 Comparator 或者 Comparable 进行排序。LinkedHashSet 也按 照元素的插入顺序对它们进行存储。
4) 如果你以键和值的形式进行数据存储那么 Map 是你正确的选择。你可以根据你的后续需要 从 Hashtable、HashMap、TreeMap 中进行选择。

参考:[List、Set、Map的区别](https://www.cnblogs.com/IvesHe/p/6108933.html)

### Arraylist 与 LinkedList 区别，ArrayList 与 Vector 区别;

1) 数据结构

   Vector、ArrayList内部使用数组，而LinkedList内部使用双向链表，由数组和链表的特性知: LinkedList适合指定位置插入、删除操作，不适合查找; ArrayList、Vector适合查找，不适合指定位置的插入删除操作。 但是ArrayList越靠近尾部的元素进行增删时，其实效率比LinkedList要高
2) 线程安全

   Vector线程安全，ArrayList、LinkedList线程不安全。
3) 空间

ArrayList在元素填满容器时会自动扩充容器大小的50%，而Vector则是100%，因此ArrayList更 节省空间。

参考:ArrayList和LinkedList内部实现、区别、使用场景

## 多线程并发

### 线程池的原理，为什么要创建线程池?创建线程池的方式;
**原理:**

[JAVA线程池原理详解一](https://www.cnblogs.com/dongguacai/p/6030187.html)

[JAVA线程池原理详解二](https://www.cnblogs.com/dongguacai/p/6038960.html)

创建线程池的几种方式: `ThreadPoolExecutor`、`ThreadScheduledExecutor`、`ForkJoinPool`

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220326235020.png)

### 线程的生命周期，什么时候会出现僵死进程;
![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220326235100.png)
僵死进程是指子进程退出时，父进程并未对其发出的 `SIGCHLD` 信号进行适当处理，导致子进程停留在僵死状态等待其父进程为其收尸，这个状态下的子进程就是僵死进程。
### 说说线程安全问题，什么实现线程安全，如何实现线程安全;
线程安全 - 如果线程执行过程中不会产生共享资源的冲突，则线程安全。

线程不安全 - 如果有多个线程同时在操作主内存中的变量，则线程不安全

实现线程安全的三种方式
1. 互斥同步
   - 临界区 `syncronized`、`ReentrantLock`
   - 信号量 semaphore
   - 互斥量 mutex
2. 非阻塞同步
   - `CAS(Compare And Swap)`
3. 无同步方案
   - 可重入代码：使用Threadlocal 类来包装共享变量，做到每个线程有自己的copy
   - 线程本地存储 参考:`https://blog.csdn.net/jackieeecheng/article/details/69779824`
### 创建线程池有哪几个核心参数? 如何合理配置线程池的大小?
1. 核心参数
```java
public ThreadPoolExecutor(int corePoolSize, // 核心线程数量大小
        int maximumPoolSize, // 线程池最大容纳线程数 long keepAliveTime, // 线程空闲后的存活时长 TimeUnit unit,
//缓存异步任务的队列 //用来构造线程池里的worker线程
        BlockingQueue<Runnable> workQueue,
        ThreadFactory threadFactory,
//线程池任务满载后采取的任务拒绝策略
        RejectedExecutionHandler handler)
```
2. 核心说明
   - 当线程池中线程数量小于 corePoolSize 则创建线程，并处理请求。
   - 当线程池中线程数量大于等于 corePoolSize 时，则把请求放入 workQueue 中,随着线程池 中的核心线程们不断执行任务，只要线程池中有空闲的核心线程，线程池就从 workQueue 中取 任务并处理。
   - 当 workQueue 已存满，放不下新任务时则新建非核心线程入池，并处理请求直到线程数目 达到 maximumPoolSize(最大线程数量设置值)。
   - 如果线程池中线程数大于 maximumPoolSize 则使用 RejectedExecutionHandler 来进行任 务拒绝处理。
     参考：http://gudong.name/2017/05/03/thread-pool-intro.html
3. 线程池大小分配

   线程池究竟设置多大要看你的线程池执行的什么任务了，CPU密集型、IO密集型、混合型，任 务类型不同，设置的方式也不一样。 任务一般分为:CPU密集型、IO密集型、混合型，对于不同类型的任务需要分配不同大小的线程池。
   - CPU密集型

   尽量使用较小的线程池，一般Cpu核心数+1
   - IO密集型

   方法一:可以使用较大的线程池，一般CPU核心数 * 2 方法二:(线程等待时间与线程CPU时间之比 + 1)* CPU数目

   - 混合型

     可以将任务分为CPU密集型和IO密集型，然后分别使用不同的线程池去处理，按情况而定

     参考:https://www.cnblogs.com/cherish010/p/8334952.html

### volatile、ThreadLocal的使用场景和原理;

**volatile原理**

volatile变量进行写操作时，JVM 会向处理器发送一条 Lock 前缀的指令，将这个变量所在缓 存行的数据写会到系统内存。

Lock 前缀指令实际上相当于一个内存屏障(也成内存栅栏)，它确保指令重排序时不会把其 后面的指令排到内存屏障之前的位置，也不会把前面的指令排到内存屏障的后面;即在执行到内 存屏障这句指令时，在它前面的操作已经全部完成。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327003309.png)

**`volatile` 的适用场景**
1) 状态标志,如:初始化或请求停机
2) 一次性安全发布，如:单列模式
3) 独立观察，如:定期更新某个值
4) “`volatile bean`” 模式
5) 开销较低的“读-写锁”策略，如:计数器

参考:https://blog.csdn.net/hgc0907/article/details/79664102

参考:https://www.ibm.com/developerworks/cn/java/j-jtp06197.html

**`ThreadLocal` 原理**

`ThreadLocal` 是用来维护本线程的变量的，并不能解决共享变量的并发问题。`ThreadLocal` 是各线程将值存入该线程的map中，以ThreadLocal自身作为key，需要用时获得的是该线程之前 存入的值。如果存入的是共享变量，那取出的也是共享变量，并发问题还是存在的。

参考:https://www.jianshu.com/p/ee8c9dccc953

参考:https://blog.csdn.net/xlgen157387/article/details/78297568

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327003558.png)

**`ThreadLocal` 的适用场景**

场景:数据库连接、`Session` 管理、

参考:`https://www.jianshu.com/p/cadd53f063b9`

### ThreadLocal 什么时候会出现OOM的情况?为什么?

`ThreadLocal` 变量是维护在 `Thread` 内部的，这样的话只要我们的线程不退出，对象的引用就会 一直存在。当线程退出时，`Thread` 类会进行一些清理工作，其中就包含 `ThreadLocalMap` ， `Thread` 调用 `exit` 方法如下:

![](https://cdn.jsdelivr.net/gh/janker0718/image_store/img/20220327005127.png)

`ThreadLocal` 在没有线程池使用的情况下，正常情况下不会存在内存泄露，但是如果使用了线程 池的话，就依赖于线程池的实现，如果线程池不销毁线程的话，那么就会存在内存泄露。

参考:https://blog.csdn.net/xlgen157387/article/details/78297568


### synchronized、volatile区别、synchronized锁粒度、模拟死锁场景、原子性与可见性;

1) `volatile` 主要应用在多个线程对实例变量更改的场合，刷新主内存共享变量的值从而使得各个 线程可以获得最新的值，线程读取变量的值需要从主存中读取; `synchronized` 则是锁定当前变 量，只有当前线程可以访问该变量，其他线程被阻塞住。另外，`synchronized` 还会创建一个内 存屏障，内存屏障指令保证了所有CPU操作结果都会直接刷到主存中(即释放锁前)，从而保证 了操作的内存可见性，同时也使得先获得这个锁的线程的所有操作
2) `volatile` 仅能使用在变量级别;`synchronized` 则可以使用在变量、方法、和类级别的。 `volatile` 不会造成线程的阻塞; `synchronized` 可能会造成线程的阻塞，比如多个线程争抢 `synchronized` 锁对象时，会出现阻塞。
3) `volatile` 仅能实现变量的修改可见性，不能保证原子性;而 `synchronized` 则可以保证变量的 修改可见性和原子性，因为线程获得锁才能进入临界区，从而保证临界区中的所有语句全部得到 执行。
4) `volatile` 标记的变量不会被编译器优化，可以禁止进行指令重排;`synchronized` 标记的变量 可以被编译器优化。

参考: https://blog.csdn.net/xiaoming100001/article/details/79781680

**synchronized锁粒度、模拟死锁场景;**

synchronized : 具有原子性，有序性和可见性

参考: `https://www.jianshu.com/p/cf57726e77f2`

粒度:对象锁、类锁

死锁场景，参考: `https://blog.csdn.net/u013925989/article/details/50208839`

## Spring

### Spring AOP的实现原理和场景?

AOP(Aspect Orient Programming)，作为面向对象编程的一种补充，广泛应用于处理一 些具有横切性质的系统级服务。

**一、场景**

事务管理、安全检查、权限控制、数据校验、缓存、对象池管理等

**二、实现技术**

AOP(这里的AOP指的是面向切面编程思想，而不是Spring AOP)主要的的实现技术主要有 Spring AOP和AspectJ。

1) AspectJ的底层技术。

   AspectJ的底层技术是静态代理，即用一种AspectJ支持的特定语言编写切面，通过一个命令来 编译，生成一个新的代理类，该代理类增强了业务类，这是在编译时增强，相对于下面说的运行 时增强，编译时增强的性能更好。
2) Spring AOP

   Spring AOP采用的是动态代理，在运行期间对业务方法进行增强，所以不会生成新类，对于
   动态代理技术，Spring AOP提供了对JDK动态代理的支持以及CGLib的支持。 JDK动态代理只能为接口创建动态代理实例，而不能对类创建动态代理。需要获得被目标类的 接口信息(应用Java的反射技术)，生成一个实现了代理接口的动态代理类(字节码)，再通过 反射机制获得动态代理类的构造函数，利用构造函数生成动态代理类的实例对象，在调用具体方
   法前调用invokeHandler方法来处理。

   CGLib动态代理需要依赖asm包，把被代理对象类的class文件加载进来，修改其字节码生成
   子类。

   但是Spring AOP基于注解配置的情况下，需要依赖于AspectJ包的标准注解。

### Spring bean的作用域和生命周期;

**作用域**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327155248.png)

**生命周期**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327155700.png)


### Spring Boot比Spring做了哪些改进?

1) Spring Boot可以建立独立的Spring应用程序;
2) 内嵌了如Tomcat，Jetty和Undertow这样的容器，也就是说可以直接跑起来，用不着再做 部署工作了;
3) 无需再像Spring那样搞一堆繁琐的xml文件的配置;
4) 可以自动配置Spring。SpringBoot将原有的XML配置改为Java配置，将bean注入改为使 用注解注入的方式(@Autowire)，并将多个xml、properties配置浓缩在一个application.yml 配置文件中。
5) 提供了一些现有的功能，如量度工具，表单数据验证以及一些外部配置这样的一些第三方功 能;
6) 整合常用依赖(开发库，例如spring-webmvc、jackson-json、validation-api和tomcat 等)，提供的POM可以简化Maven的配置。当我们引入核心依赖时，SpringBoot会自引入其 他依赖。

### Spring 5比Spring4做了哪些改进;
[【官网说明】](https://docs.spring.io/spring/docs/current/spring-framework-reference/)
**Spring 4.x 新特性**

1. 泛型限定式依赖注入
2. 核心容器的改进
3. `web` 开发增强
4. 集成`Bean Validation 1.1(JSR-349)` 到 `SpringMVC`
5. `Groovy Bean` 定义 `DSL`
6. 更好的 `Java` 泛型操作 `API`
7. `JSR310` 日期API的支持
8. 注解、脚本、任务、`MVC` 等其他特性改进

**Spring 5.x 新特性**

1. `JDK8` 的增强
2. 核心容器的改进
3. 新的 `SpringWebFlux` 模块
4. 测试方面的改进



**参考:**

[[Spring5 官方文档新功能]](http://ifeve.com/spring-5-new/)
- Spring4新特性——泛型限定式依赖注入
- Spring4新特性——核心容器的其他改进
- Spring4新特性——Web开发的增强
- Spring4新特性——集成Bean Validation 1.1(JSR-349)到SpringMVC
- Spring4新特性——Groovy Bean定义DSL
- Spring4新特性——更好的Java泛型操作API Spring4新特性——JSR310日期API的支持
- Spring4新特性——注解、脚本、任务、MVC等其他特性改进

### 如何自定义一个Spring Boot Starter?

[《自定义spring boot starter三部曲之一:准备工作》;](https://blog.csdn.net/boling_cavalry/article/details/82956512)

[《自定义spring boot starter三部曲之二:实战开发》;](https://blog.csdn.net/boling_cavalry/article/details/83041472)

[《自定义spring boot starter三部曲之三:源码分析spring.factories加载过程》;](https://blog.csdn.net/boling_cavalry/article/details/83048588)

### Spring IOC是什么?优点是什么?
IoC 文英全称 Inversion of Control，即控制反转，我么可以这么理解IoC容器:“把某些业务对 象的的控制权交给一个平台或者框架来同一管理，这个同一管理的平台可以称为IoC容器。”

ioc的思想最核心的地方在于，资源不由使用资源的双方管理，而由不使用资源的第三方管理， 这可以带来很多好处:

1) 资源集中管理，实现资源的可配置和易管理
2) 降低了使用资源双方的依赖程度，也就是我们说的耦合度

[Spring IOC原理解读 面试必读](https://blog.csdn.net/he90227/article/details/51536348)
### SpringMVC、动态代理、反射、AOP原理、事务隔离级别;

#### SpringMVC

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327160450.png)

#### 动态代理 反射 AOP原理 Spring事务;

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327160806.png)

一、spring事务

什么是事务: 事务逻辑上的一组操作,组成这组操作的各个逻辑单元,要么一起成功,要么一起失败.

二、事务特性(4种):

原子性 (atomicity): 强调事务的不可分割.
一致性 (consistency): 事务的执行的前后数据的完整性保持一致.
隔离性 (isolation): 一个事务执行的过程中,不应该受到其他事务的干扰
持久性(durability): 事务一旦结束,数据就持久到数据库

如果不考虑隔离性引发安全性问题:

脏读 : 一个事务读到了另一个事务的未提交的数据

不可重复读 : 一个事务读到了另一个事务已经提交的 update 的数据导致多次查询结果不一致.

虚幻读 :一个事务读到了另一个事务已经提交的 insert 的数据导致多次查询结果不一致.

三、解决读问题: 设置事务隔离级别(5种)

DEFAULT 这是一个 PlatformTransactionManager 默认的隔离级别，使用数据库默认的事务隔 离级别.

未提交读( `read uncommited` ) :脏读，不可重复读，虚读都有可能发生

已提交读 ( `read commited` ):避免脏读。但是不可重复读和虚读有可能发生

可重复读 ( `repeatable read` ) :避免脏读和不可重复读.但是虚读有可能发生.

串行化的 ( `serializable` ) :避免以上所有读问题.

Mysql 默认:可重复读

Oracle 默认:读已提交

四、事务的传播行为
PROPAGION_XXX :事务的传播行为
* 保证同一个事务中

  PROPAGATION_REQUIRED 支持当前事务，如果不存在 就新建一个(默认) PROPAGATION_SUPPORTS 支持当前事务，如果不存在，就不使用事务 PROPAGATION_MANDATORY 支持当前事务，如果不存在，抛出异常
* 保证没有在同一个事务中

  PROPAGATION_REQUIRES_NEW 如果有事务存在，挂起当前事务，创建一个新的事务 PROPAGATION_NOT_SUPPORTED 以非事务方式运行，如果有事务存在，挂起当前事务 PROPAGATION_NEVER 以非事务方式运行，如果有事务存在，抛出异常 PROPAGATION_NESTED 如果当前事务存在，则嵌套事务执行
## 框架|中间件

### Redis

#### Redis 为什么这么快?
1) 绝大部分请求是纯粹的内存操作(非常快速)
2) 采用单线程,避免了不必要的上下文切换和竞争条件
3) 非阻塞IO - IO多路复用

#### redis采用多线程会有哪些问题?
1. 单线程的问题

无法发挥多核CPU性能，单进程单线程只能跑满一个CPU核 可以通过在单机开多个Redis实例来完善 可以通过数据分片来增加吞吐量，问题(不支持批量操作、扩缩容复杂等)

2. 多线程的问题

多线程处理可能涉及到锁 多线程处理会涉及到线程切换而消耗CPU

参考:[阿里云Redis多线程性能提升思路解析](https://www.sohu.com/a/251107445_100253472)

#### Redis 支持哪几种数据结构?
String 、List 、Set 、Hash 、ZSet


#### Redis 跳表

Redis只在两个地方用到了跳跃表，一个是实现有序集合键，另一个是在集群结点中用作内部数据结构

参考:https://blog.csdn.net/idwtwt/article/details/80233859
#### Redis单进程单线程的Redis如何能够高并发?
采用多路 I/O 复用技术可以让单个线程高效的处理多个连接请求(尽量减少网络IO的时间消 耗)

#### Redis如何使用Redis实现分布式锁?
参考:[Redis分布式锁的正确实现方式](https://www.cnblogs.com/linjiqin/p/8003838.html)

#### Redis分布式锁操作的原子性，Redis内部是如何实现的?

setnx

Incrby\Decrby

### Dubbo
#### Dubbo完整的一次调用链路介绍;
![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327161739.png)
参考:http://dubbo.apache.org/zh-cn/docs/dev/design.html
#### Dubbo支持几种负载均衡策略?
1) Random LoadBalance

   随机，按权重设置随机概率。 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有 利于动态调整提供者权重。
2) RoundRobin LoadBalance

   轮询，按公约后的权重设置轮询比率。 存在慢的提供者累积请求的问题，比如:第二台机器很慢，但没挂，当请求调到第二台时就卡在 那，久而久之，所有请求都卡在调到第二台上。
3) LeastActive LoadBalance

   最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。
4) ConsistentHash LoadBalance

   一致性 Hash，相同参数的请求总是发到同一提供者。 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起 剧烈变动。
   算法参见:http://en.wikipedia.org/wiki/Consistent_hashing
   缺省只对第一个参数 Hash，如果要修改，请配置
   <dubbo:parameter key="hash.arguments" value="0,1" />
   缺省用 160 份虚拟节点，如果要修改，请配置
   <dubbo:parameter key="hash.nodes" value="320" />

   参考:http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html

   ![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327161959.png)
   源码分析: `http://www.cnblogs.com/wyq178/p/9822731.html`

#### Dubbo Provider服务提供者要控制执行并发请求上限，具体怎么做?
服务端并发限流: executes

客户端并发限流: actives

样例1：
限制 com.foo.BarService 的每个方法，服务器端并发执行(或占用线程池线程数)不能超过 10 个。
```xml
<dubbo:service interface="com.foo.BarService" executes = "10" />
```
样例2：

限制 `com.foo.BarService` 的 `sayHello` 方法，服务器端并发执行(或占用线程池线程数)不能超过 10 个。

```xml
<dubbo:service interface="com.foo.BarService" executes = "10">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:service>
```
样例 3

限制 `com.foo.BarService` 的每个方法，每客户端并发执行(或占用连接的请求数)不能超过 10 个:

```xml
<dubbo:service interface="com.foo.BarService">
   <dubbo:reference name = "com.foo.BarService" executes = "10"/>
</dubbo:service>
```
样例 4
限制 `com.foo.BarService` 的 `sayHello` 方法，每客户端并发执行(或占用连接的请求数)不能 超过 10 个:

```xml
<dubbo:service interface="com.foo.BarService">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:service>
```
或


```xml
<dubbo:reference interface="com.foo.BarService">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:reference>
```

参考:http://dubbo.apache.org/zh-cn/docs/user/demos/concurrency-control.html


#### Dubbo启动的时候支持几种配置方式?

XML配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/xml.html

属性配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/properties.html

API配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/api.html

注解配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/annotation.html

### Spring Cloud
#### Spring Cloud熔断机制介绍;

在Spring Cloud框架里，熔断机制通过Hystrix实现。Hystrix会监控微服务间调用的状况，当失 败的调用到一定阈值，缺省是5秒内20次调用失败，就会启动熔断机制。熔断机制的注解是 @HystrixCommand，Hystrix会找有这个注解的方法，并将这类方法关联到和熔断器连在一起 的代理上。当前，@HystrixCommand仅当类的注解为@Service或@Component时才会发挥 作用。

#### Spring Cloud对比下Dubbo，什么场景下该使用Spring Cloud?
两者所解决的问题域不一样，Dubbo的定位始终是一款RPC框架，而Spring Cloud的目的是微服务架构下的一站式解决方案。

Spring Cloud抛弃了Dubbo的RPC通信，采用的是基于HTTP的REST方式。 严格来说，这两种方式各有优劣。虽然在一定程度上来说，后者牺牲了服务调用的性能，但也避 免了上面提到的原生RPC带来的问题。而且REST相比RPC更为灵活，服务提供方和调用方的依赖 只依靠一纸契约，不存在代码级别的强依赖，这在强调快速演化的微服务环境下，显得更为合 适。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327171104.png)

更多对比: http://blog.51cto.com/13954634/2296010


### 消息队列
#### 了解几种消息中间件产品?各产品的优缺点介绍;消息中间件如何保证消息的一致性

1) 主动方应用先把消息发送给消息中间件，消息状态标记为待确认;
2) 消息中间件收到消息之后，把消息持久化到消息存储中，但并不向被动方应用投递消息;
3) 消息中间件返回消息持久化结果(成功，或者失效)，主动方应用根据返回结果进行判断如何

   处理业务操作处理;
   - 失败:放弃业务操作处理，结束(必须向上层返回失败结果)
   - 成功:执行业务操作处理
4) 业务操作完成后，把业务操作结果(成功/失败)发送给消息中间件;
5) 消息中间件收到业务操作结果后，根据结果进行处理
   1) 失败:删除消息存储中的消息，结束;
   2) 成功:更新消息存储中的消息状态为∙待发送(可发送)∙，紧接着执行消息投递;
6) 前面的正向流程都成功后，向被动方应用投递消息;

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327164828.png)

#### 如何进行消息的重试机制?

参考:[Rocket重试机制，消息模式，刷盘方式](https://www.cnblogs.com/520playboy/p/6748680.html)

## 数据库


### 锁机制介绍:行锁、表锁、排他锁、共享锁;
### 乐观锁的业务场景及实现方式;
### 事务介绍，分布式事物的理解，常见的解决方案有哪些，什么事两阶段提交、三阶段提交;
### MySQL记录binlog的方式主要包括三种模式?每种模式的优缺点是什么?
mysql复制主要有三种方式:基于SQL语句的复制(statement-based replication, SBR)，基于行 的复制(row-based replication, RBR)，混合模式复制(mixed-based replication, MBR)。对应 的，binlog的格式也有三种:STATEMENT，ROW，MIXED。
1 STATEMENT模式(SBR)

每一条会修改数据的sql语句会记录到binlog中。优点是并不需要记录每一条sql语句和每一行的 数据变化，减少了binlog日志量，节约IO，提高性能。缺点是在某些情况下会导致master-slave 中的数据不一致( 如sleep()函数， last_insert_id()，以及user-defined functions(udf)等会出现 问题)
2 ROW模式(RBR)

不记录每条 sql 语句的上下文信息，仅需记录哪条数据被修改了，修改成什么样了。而且不会出 现某些特定情况下的存储过程、或 function 、或 trigger 的调用和触发无法被正确复制的问题。缺 点是会产生大量的日志，尤其是 alter table 的时候会让日志暴涨。
3 MIXED模式(MBR)

以上两种模式的混合使用，一般的复制使用 `STATEMENT` 模式保存 `binlog`，对于 `STATEMENT` 模式无法复制的操作使用 `ROW` 模式保存 `binlog`，MySQL 会根据执行的 SQL 语句选择日志保存方式。
### MySQL锁，悲观锁、乐观锁、排它锁、共享锁、表级锁、行级锁;
乐观锁

用数据版本(Version)记录机制实现，这是乐观锁最常用的一种实现方式。何谓数据版本?即 为数据增加一个版本标识，一般是通过为数据库表增加一个数字类型的 “version” 字段来实 现。当读取数据时，将version字段的值一同读出，数据每更新一次，对此version值加1。当我 们提交更新的时候，判断数据库表对应记录的当前版本信息与第一次取出来的version值进行比 对，如果数据库表当前版本号与第一次取出来的version值相等，则予以更新，否则认为是过期 数据。
悲观锁

在进行每次操作时都要通过获取锁才能进行对相同数据的操作，这点跟java中synchronized很 相似，共享锁(读锁)和排它锁(写锁)是悲观锁的不同的实现

共享锁(读锁)

共享锁又叫做读锁，所有的事务只能对其进行读操作不能写操作，加上共享锁后在事务结束之前
其他事务只能再加共享锁，除此之外其他任何类型的锁都不能再加了。

排它锁(写锁)

若某个事物对某一行加上了排他锁，只能这个事务对其进行读写，在此事务结束之前，其他事务 不能对其进行加任何锁，其他进程可以读取,不能进行写操作，需等待其释放。

表级锁

innodb 的行锁是在有索引的情况下,没有索引的表是锁定全表的

行级锁

行锁又分共享锁和排他锁,由字面意思理解，就是给某一行加上锁，也就是一条记录加上锁。 注意:行级锁都是基于索引的，如果一条SQL语句用不到索引是不会使用行级锁的，会使用表级 锁。

更多参考:https://blog.csdn.net/yzj5208/article/details/81288633

### 分布式事务的原理2阶段提交，同步异步阻塞非阻塞;
### 数据库事务隔离级别，MySQL默认的隔离级别;
Mysql默认隔离级别:Repeatable Read

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327165440.png)

### Spring如何实现事务;
[参考:spring事务管理(详解和实例)](https://www.cnblogs.com/yixianyixian/p/8372832.html)

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327165555.png)

Spring 事物四种实现方式:
- 基于编程式事务管理实现
- 基于TransactionProxyFactoryBean的声明式事务管理
- 基于AspectJ的XML声明式事务管理
- 基于注解的声明式事务管理

参考:https://blog.csdn.net/zhuxinquan61/article/details/71075051


### JDBC如何实现事务;
在JDBC中处理事务，都是通过Connection完成的。

同一事务中所有的操作，都在使用同一个Connection对象。
1. JDBC中的事务

   Connection的三个方法与事务有关:
   - setAutoCommit(boolean):设置是否为自动提交事务，如果true(默认值为true)表示自动提 交，也就是每条执行的SQL语句都是一个单独的事务，如果设置为false，那么相当于开启了事务了; con.setAutoCommit(false) 表示开启事务。
   - commit():提交结束事务。
   - rollback():回滚结束事务。

**示例代码**
```java
try{    
        con.setAutoCommit(false); //开启事务
        //......
        con.commit();//try的最后提交事务 
         } catch(Exception e) {
        con.rollback();//回滚事务
 }
```

### 嵌套事务实现；

TODO
### 分布式事务实现;
1) 基于XA协议的两阶段提交(2PC)

   XA 规范主要 定义了 ( 全局 ) 事务管理器 ( Transaction Manager ) 和 ( 局部 ) 资源管理器 ( Resource Manager ) 之间的接口。
2) 两阶段提交

   事务的提交分为两个阶段: 预提交阶段(Pre-Commit Phase) 决策后阶段(Post-Decision Phase)

3) 补偿事务(TCC)

   针对每个操作，都要注册一个与其对应的确认和补偿(撤销)操作。它分为三个阶段
   Try 阶段主要是对业务系统做检测及资源预留
   Confirm 阶段主要是对业务系统做确认提交，Try 阶段执行成功并开始执行 Confirm 阶段时， 默认Confirm 阶段是不会出错的。即:只要 Try 成功，Confirm 一定成功。
   Cancel 阶段主要是在业务执行错误，需要回滚的状态下执行的业务取消，预留资源释放
4) 本地消息表(MQ 异步确保)

   其基本的设计思想是将远程分布式事务拆分成一系列的本地事务。

5) MQ 事务消息

   有一些第三方的 MQ 是支持事务消息的，比如 RocketMQ，他们支持事务消息的方式也是类似 于采用的二阶段提交，但是市面上一些主流的 MQ 都是不支持事务消息的，比如 RabbitMQ 和 Kafka 都不支持。
6) Sagas 事务模型

   该模型其核心思想就是拆分分布式系统中的长事务为多个短事务，或者叫多个本地事务，然后由 Sagas 工作流引擎负责协调，如果整个流程正常结束，那么就算是业务成功完成，如果在这过程 中实现失败，那么Sagas工作流引擎就会以相反的顺序调用补偿操作，重新进行业务回滚。
7) 其他补偿方式

   加入详细日志记录的，一旦系统内部引发类似致命异常，会有邮件通知。同时，后台会有定时任 务扫描和分析此类日志，检查出这种特殊的情况，会尝试通过程序来补偿并邮件通知相关人员。 在某些特殊的情况下，还会有 "人工补偿" 的，这也是最后一道屏障。

参考: https://www.javazhiyin.com/573.html


### SQL的整个解析、执行过程原理、SQL行转列;
**整体架构**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327170816.png)

**SQL解析**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327170903.png)

**行转列、列转行**


参考:https://blog.csdn.net/jx_870915876/article/details/52403472

#### Redis 跳表

#### Redis单进程单线程的Redis如何能够高并发?

#### Redis如何使用Redis实现分布式锁?

#### Redis分布式锁操作的原子性，Redis内部是如何实现的?

### Dubbo
#### Dubbo完整的一次调用链路介绍;
![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327161739.png)
参考:http://dubbo.apache.org/zh-cn/docs/dev/design.html
#### Dubbo支持几种负载均衡策略?
1) Random LoadBalance

   随机，按权重设置随机概率。 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有 利于动态调整提供者权重。
2) RoundRobin LoadBalance

   轮询，按公约后的权重设置轮询比率。 存在慢的提供者累积请求的问题，比如:第二台机器很慢，但没挂，当请求调到第二台时就卡在 那，久而久之，所有请求都卡在调到第二台上。
3) LeastActive LoadBalance

   最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。
4) ConsistentHash LoadBalance

   一致性 Hash，相同参数的请求总是发到同一提供者。 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起 剧烈变动。
   算法参见:http://en.wikipedia.org/wiki/Consistent_hashing
   缺省只对第一个参数 Hash，如果要修改，请配置
   <dubbo:parameter key="hash.arguments" value="0,1" />
   缺省用 160 份虚拟节点，如果要修改，请配置
   <dubbo:parameter key="hash.nodes" value="320" />

   参考:http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html

   ![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327161959.png)
   源码分析: `http://www.cnblogs.com/wyq178/p/9822731.html`

#### Dubbo Provider服务提供者要控制执行并发请求上限，具体怎么做?
服务端并发限流: executes 

客户端并发限流: actives

样例1：
限制 com.foo.BarService 的每个方法，服务器端并发执行(或占用线程池线程数)不能超过 10 个。
```xml
<dubbo:service interface="com.foo.BarService" executes = "10" />
```
样例2：

限制 `com.foo.BarService` 的 `sayHello` 方法，服务器端并发执行(或占用线程池线程数)不能超过 10 个。

```xml
<dubbo:service interface="com.foo.BarService" executes = "10">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:service>
```
样例 3

限制 `com.foo.BarService` 的每个方法，每客户端并发执行(或占用连接的请求数)不能超过 10 个:

```xml
<dubbo:service interface="com.foo.BarService">
   <dubbo:reference name = "com.foo.BarService" executes = "10"/>
</dubbo:service>
```
样例 4
限制 `com.foo.BarService` 的 `sayHello` 方法，每客户端并发执行(或占用连接的请求数)不能 超过 10 个:

```xml
<dubbo:service interface="com.foo.BarService">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:service>
```
或


```xml
<dubbo:reference interface="com.foo.BarService">
   <dubbo:method name = "sayHello"  actives = "10"/>
</dubbo:reference>
```

参考:http://dubbo.apache.org/zh-cn/docs/user/demos/concurrency-control.html


#### Dubbo启动的时候支持几种配置方式?

XML配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/xml.html

属性配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/properties.html

API配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/api.html

注解配置 http://dubbo.apache.org/zh-cn/docs/user/configuration/annotation.html

### Spring Cloud
#### Spring Cloud熔断机制介绍;

在Spring Cloud框架里，熔断机制通过Hystrix实现。Hystrix会监控微服务间调用的状况，当失 败的调用到一定阈值，缺省是5秒内20次调用失败，就会启动熔断机制。熔断机制的注解是 @HystrixCommand，Hystrix会找有这个注解的方法，并将这类方法关联到和熔断器连在一起 的代理上。当前，@HystrixCommand仅当类的注解为@Service或@Component时才会发挥 作用。

#### Spring Cloud对比下Dubbo，什么场景下该使用Spring Cloud?
两者所解决的问题域不一样，Dubbo的定位始终是一款RPC框架，而Spring Cloud的目的是微服务架构下的一站式解决方案。

Spring Cloud抛弃了Dubbo的RPC通信，采用的是基于HTTP的REST方式。 严格来说，这两种方式各有优劣。虽然在一定程度上来说，后者牺牲了服务调用的性能，但也避 免了上面提到的原生RPC带来的问题。而且REST相比RPC更为灵活，服务提供方和调用方的依赖 只依靠一纸契约，不存在代码级别的强依赖，这在强调快速演化的微服务环境下，显得更为合 适。

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327171104.png)

更多对比: http://blog.51cto.com/13954634/2296010


### 消息队列
#### 了解几种消息中间件产品?各产品的优缺点介绍;消息中间件如何保证消息的一致性

1) 主动方应用先把消息发送给消息中间件，消息状态标记为待确认; 
2) 消息中间件收到消息之后，把消息持久化到消息存储中，但并不向被动方应用投递消息; 
3) 消息中间件返回消息持久化结果(成功，或者失效)，主动方应用根据返回结果进行判断如何 
   
   处理业务操作处理; 
      - 失败:放弃业务操作处理，结束(必须向上层返回失败结果) 
      - 成功:执行业务操作处理 
4) 业务操作完成后，把业务操作结果(成功/失败)发送给消息中间件;
5) 消息中间件收到业务操作结果后，根据结果进行处理
   1) 失败:删除消息存储中的消息，结束; 
   2) 成功:更新消息存储中的消息状态为∙待发送(可发送)∙，紧接着执行消息投递;
6) 前面的正向流程都成功后，向被动方应用投递消息;

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327164828.png)

#### 如何进行消息的重试机制?

参考:[Rocket重试机制，消息模式，刷盘方式](https://www.cnblogs.com/520playboy/p/6748680.html)

## 数据库


### 锁机制介绍:行锁、表锁、排他锁、共享锁;
### 乐观锁的业务场景及实现方式;
### 事务介绍，分布式事物的理解，常见的解决方案有哪些，什么事两阶段提交、三阶段提交;
### MySQL记录binlog的方式主要包括三种模式?每种模式的优缺点是什么?
mysql复制主要有三种方式:基于SQL语句的复制(statement-based replication, SBR)，基于行 的复制(row-based replication, RBR)，混合模式复制(mixed-based replication, MBR)。对应 的，binlog的格式也有三种:STATEMENT，ROW，MIXED。
1 STATEMENT模式(SBR)

   每一条会修改数据的sql语句会记录到binlog中。优点是并不需要记录每一条sql语句和每一行的 数据变化，减少了binlog日志量，节约IO，提高性能。缺点是在某些情况下会导致master-slave 中的数据不一致( 如sleep()函数， last_insert_id()，以及user-defined functions(udf)等会出现 问题)
2 ROW模式(RBR) 
   
   不记录每条 sql 语句的上下文信息，仅需记录哪条数据被修改了，修改成什么样了。而且不会出 现某些特定情况下的存储过程、或 function 、或 trigger 的调用和触发无法被正确复制的问题。缺 点是会产生大量的日志，尤其是 alter table 的时候会让日志暴涨。
3 MIXED模式(MBR)
   
   以上两种模式的混合使用，一般的复制使用 `STATEMENT` 模式保存 `binlog`，对于 `STATEMENT` 模式无法复制的操作使用 `ROW` 模式保存 `binlog`，MySQL 会根据执行的 SQL 语句选择日志保存方式。
### MySQL锁，悲观锁、乐观锁、排它锁、共享锁、表级锁、行级锁;
乐观锁

用数据版本(Version)记录机制实现，这是乐观锁最常用的一种实现方式。何谓数据版本?即 为数据增加一个版本标识，一般是通过为数据库表增加一个数字类型的 “version” 字段来实 现。当读取数据时，将version字段的值一同读出，数据每更新一次，对此version值加1。当我 们提交更新的时候，判断数据库表对应记录的当前版本信息与第一次取出来的version值进行比 对，如果数据库表当前版本号与第一次取出来的version值相等，则予以更新，否则认为是过期 数据。
悲观锁 

在进行每次操作时都要通过获取锁才能进行对相同数据的操作，这点跟java中synchronized很 相似，共享锁(读锁)和排它锁(写锁)是悲观锁的不同的实现

共享锁(读锁)

共享锁又叫做读锁，所有的事务只能对其进行读操作不能写操作，加上共享锁后在事务结束之前
其他事务只能再加共享锁，除此之外其他任何类型的锁都不能再加了。

排它锁(写锁) 

若某个事物对某一行加上了排他锁，只能这个事务对其进行读写，在此事务结束之前，其他事务 不能对其进行加任何锁，其他进程可以读取,不能进行写操作，需等待其释放。

表级锁

innodb 的行锁是在有索引的情况下,没有索引的表是锁定全表的

行级锁 

行锁又分共享锁和排他锁,由字面意思理解，就是给某一行加上锁，也就是一条记录加上锁。 注意:行级锁都是基于索引的，如果一条SQL语句用不到索引是不会使用行级锁的，会使用表级 锁。

更多参考:https://blog.csdn.net/yzj5208/article/details/81288633

### 分布式事务的原理2阶段提交，同步异步阻塞非阻塞;
### 数据库事务隔离级别，MySQL默认的隔离级别;
Mysql默认隔离级别:Repeatable Read

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327165440.png)

### Spring如何实现事务;
[参考:spring事务管理(详解和实例)](https://www.cnblogs.com/yixianyixian/p/8372832.html)

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327165555.png)

Spring 事物四种实现方式:
- 基于编程式事务管理实现
- 基于TransactionProxyFactoryBean的声明式事务管理 
- 基于AspectJ的XML声明式事务管理
- 基于注解的声明式事务管理 

参考:https://blog.csdn.net/zhuxinquan61/article/details/71075051


### JDBC如何实现事务;
在JDBC中处理事务，都是通过Connection完成的。

同一事务中所有的操作，都在使用同一个Connection对象。
1. JDBC中的事务

   Connection的三个方法与事务有关:
   - setAutoCommit(boolean):设置是否为自动提交事务，如果true(默认值为true)表示自动提 交，也就是每条执行的SQL语句都是一个单独的事务，如果设置为false，那么相当于开启了事务了; con.setAutoCommit(false) 表示开启事务。
   - commit():提交结束事务。 
   - rollback():回滚结束事务。

**示例代码**
```java
try{    
        con.setAutoCommit(false); //开启事务
        //......
        con.commit();//try的最后提交事务 
         } catch(Exception e) {
        con.rollback();//回滚事务
 }
```

### 嵌套事务实现；

TODO
### 分布式事务实现;
1) 基于XA协议的两阶段提交(2PC)

   XA 规范主要 定义了 ( 全局 ) 事务管理器 ( Transaction Manager ) 和 ( 局部 ) 资源管理器 ( Resource Manager ) 之间的接口。
2) 两阶段提交

   事务的提交分为两个阶段: 预提交阶段(Pre-Commit Phase) 决策后阶段(Post-Decision Phase)
   
3) 补偿事务(TCC)

   针对每个操作，都要注册一个与其对应的确认和补偿(撤销)操作。它分为三个阶段
   Try 阶段主要是对业务系统做检测及资源预留 
   Confirm 阶段主要是对业务系统做确认提交，Try 阶段执行成功并开始执行 Confirm 阶段时， 默认Confirm 阶段是不会出错的。即:只要 Try 成功，Confirm 一定成功。 
   Cancel 阶段主要是在业务执行错误，需要回滚的状态下执行的业务取消，预留资源释放
4) 本地消息表(MQ 异步确保)

   其基本的设计思想是将远程分布式事务拆分成一系列的本地事务。

5) MQ 事务消息 

   有一些第三方的 MQ 是支持事务消息的，比如 RocketMQ，他们支持事务消息的方式也是类似 于采用的二阶段提交，但是市面上一些主流的 MQ 都是不支持事务消息的，比如 RabbitMQ 和 Kafka 都不支持。
6) Sagas 事务模型 

   该模型其核心思想就是拆分分布式系统中的长事务为多个短事务，或者叫多个本地事务，然后由 Sagas 工作流引擎负责协调，如果整个流程正常结束，那么就算是业务成功完成，如果在这过程 中实现失败，那么Sagas工作流引擎就会以相反的顺序调用补偿操作，重新进行业务回滚。
7) 其他补偿方式 

   加入详细日志记录的，一旦系统内部引发类似致命异常，会有邮件通知。同时，后台会有定时任 务扫描和分析此类日志，检查出这种特殊的情况，会尝试通过程序来补偿并邮件通知相关人员。 在某些特殊的情况下，还会有 "人工补偿" 的，这也是最后一道屏障。

参考: https://www.javazhiyin.com/573.html


### SQL的整个解析、执行过程原理、SQL行转列;
**整体架构**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327170816.png)

**SQL解析**

![](https://cdn.jsdelivr.net/gh/janker0718/image_store@master/img/20220327170903.png)

**行转列、列转行**


参考:https://blog.csdn.net/jx_870915876/article/details/52403472