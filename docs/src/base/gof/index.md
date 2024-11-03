[Refactoring and Design Patterns](https://refactoring.guru/)



[[toc]]

设计模式
--------

设计模式分类

- 创建者模式：用于描述怎么创建对象，主要将对象的创建与使用分离。
- 结构者模式：用于描述如何将类或对象按某种布局构成更大的结构。
- 行为者模式：用于描述类或对象之间怎样相互协作完成单个对象无法完成的任务。



类之间关系

- 继承关系：父类与子类的关系
- 实现关系：接口与实现类的关系
- 组合关系：整体与部分的关系，部分随着整体的生命创建而创建。<mark>构造方法</mark>
- 聚合关系：整体与部分的关系，部分不用随着整体的生命创建而创建。<mark>构造方法</mark>
- 关联关系：对象之间的引用关系。<mark>类成员变量</mark>
- 依赖关系：对象之间的使用关系。<mark>方法引用</mark>

```mermaid
---
title: 纵向关系：从强到弱
---
classDiagram
direction LR
classA --|> classB : Inheritance
classC ..|> classD : Realization
```

```mermaid
---
title: 横向关系：从强到弱
---
classDiagram
direction BT
classE --* classF : Composition
classG --o classH : Aggregation
classI --> classJ : Association
classK ..> classL : Dependency
```



六大原则
--------

- 开闭原则：对扩展开放，对修改关闭。
- 里氏替换原则：子类可以拓展父类的功能，但不能修改父类原有的方法。
- 依赖倒转原则：对抽象进行编程，不要对实现进行编程。
- 接口隔离原则：一个类对另一个类的依赖应该建立在最小的接口上。
- 最少知识法则【迪米特法则】：如果两个软件实体无须直接通信，那么就不应该发生直接的相互调用，而使用第三方转发该调用。其目的是降低类之间的耦合度，提高模块的相对独立性。
- 合成复用原则：尽量先试用组合或聚合等关联关系来实现，其次才考虑继承实现关系。



创建者模式
----------

### 单列模式

定义

- 涉及单一的类，该类负责创建自己的对象。这个类提供了<mark>唯一一种访问该对象的方式，并且不需要实例化该类的对象，可以直接访问。</mark>

饿汉式：类加载就会导致该类实例对象被创建。

- 静态变量方法
- 静态代码块方式
- 枚举方式

懒汉式：类加载不会导致该类实例对象被创建，只有首次使用该对象时才会创建。

- 线程安全模式
- 双重检查模式
- 静态内部类

序列化和反射可以破坏单利模式，可以创建多个对象。



### 工厂模式

定义

- 使用工厂模式创建对象，可以使<mark>对象的创建和使用解耦</mark>。当我们需要修改创建的对象直接在工厂中修改对象即可。

  - 简单工厂模式

  - 工厂方法模式

  - 抽象工厂模式




#### 简单工厂模式

主要角色

- 抽象产品：定义了产品规范，描述了产品的要特性和功能。
- 具体产品：实现了抽象产品所定义的接口，由具体的工厂来创建，与具体工厂一一对应。
- 具体工厂：实现了创建产品的方法，调用者通过具体工厂来获取产品。

优点

- 把对象的创建和使用逻辑分开，避免了实现新产品需要修改原代码，可以直接修改工厂类，更加容易拓展。

缺点

- 新增产品时还是需要修改工厂类的代码，违背了“开闭原则”。

> 针对简单工厂的缺点，<mark>工厂方法模式</mark>就完全遵守了“开闭原则”。

类图

```mermaid
---
title: 简单工厂模式 
---

classDiagram
direction BT
class AmericanCoffee {
  + getName() String
}
class Coffee {
  + getName() String*
  + addsugar() void
  + addMilk() void
}
class CoffeeStore {
  + orderCoffee(String) Coffee
}
class LatteCoffee {
  + getName() String
}
class SimpleCoffeeFactory {
  + createCoffee(String) Coffee
}
AmericanCoffee  -->  Coffee 
CoffeeStore  ..>  SimpleCoffeeFactory : «create»
LatteCoffee  -->  Coffee 
SimpleCoffeeFactory  ..>  AmericanCoffee : «create»
SimpleCoffeeFactory  ..>  LatteCoffee : «create»
```



#### 工厂方法模式

定义

- 用于创建对象的接口，让子类决定实例化哪个产品类对象。工厂方法使一个产品类的实例化延迟到其工厂的子类

结构

- 抽象产品：定义了产品规范，描述了产品的要特性和功能。
- 具体产品：实现了抽象产品所定义的接口，由具体的工厂来创建，与具体工厂一一对应。
- 抽象工厂：定义了创建产品的规范，调用者通过它访问具体工厂的工厂方法来创建产品。
- 具体工厂：实现了抽象工厂的抽象方法，完成具体产品的创建。

优点

- 只需要具体工厂的名称即可得到所要的产品，无须创建过程；并且无需对原工厂进行修改，需要扩展只需要添加具体产品类和对应的具体工厂类，满足开闭原则。

缺点

- 每增加一个产品就要增加一个具体产品类和对应的具体工厂类，增加了系统的复杂度。

类图

```mermaid
---
title: 工厂方法模式
---
classDiagram
direction BT
class AmericanCoffee {
  + getName() String
}
class AmericanCoffeeFactory {
  + createCoffee() Coffee
}
class Coffee {
  + getName() String*
  + addsugar() void
  + addMilk() void
}
class CoffeeFactory {
<<Interface>>
  + createCoffee() Coffee
}
class CoffeeStore {
  + CoffeeFactory factory
  + setFactory(CoffeeFactory) void
  + orderCoffee() Coffee
}
class LatteCoffee {
  + getName() String
}
class LatteCoffeeFactory {
  + createCoffee() Coffee
}

AmericanCoffee  --|>  Coffee 
LatteCoffee  --|>  Coffee
AmericanCoffeeFactory  ..>  AmericanCoffee : «create»
AmericanCoffeeFactory  ..|>  CoffeeFactory 
CoffeeStore "1" *--> "factory 1" CoffeeFactory 
LatteCoffeeFactory  ..|>  CoffeeFactory 
LatteCoffeeFactory  ..>  LatteCoffee : «create»
```



#### 抽象工厂模式

定义

- 是一种为访问类提供一个创建一组相关或相互依赖对象的接口，且访问类无须指定所要产品的具体类就能得到同族的不同等级的产品的模式结构。
- 抽象工厂模式是工厂方法模式的升级版本，工厂方法模式只生产一个等级的产品，而抽象工厂模式可生产多个等级的产品。

结构

- 抽象产品：定义了产品规范，描述了产品的要特性和功能。<mark>抽象工厂有多个抽象产品。</mark>
- 具体产品：实现了抽象产品所定义的接口，由具体的工厂来创建，与具体工厂<mark>多对一</mark>对应。
- 抽象工厂：定义了创建产品的规范，<mark>包含多个创建产品的方法，可以创建多个不同等级的产品。</mark>
- 具体工厂：<mark>实现了抽象工厂中的多个抽象方法，完成具体产品的创建。</mark>

类图

```mermaid
---
title: 抽象工厂模式
---
classDiagram
direction BT
class AmericanCoffee {
  + getName() String
}
class AmericanDessertFactory {
  + createCoffee() Coffee
  + createDessert() Dessert
}
class Coffee {
  + getName() String*
  + addsugar() void
  + addMilk() void
}
class Dessert {
  + show() void*
}
class DessertFactory {
<<Interface>>
  + createCoffee() Coffee
  + createDessert() Dessert
}
class ItalyDessertFactory {
  + createCoffee() Coffee
  + createDessert() Dessert
}
class LatteCoffee {
  + getName() String
}
class MatchaMousse {
  + show() void
}
class Trimisu {
  + show() void
}

AmericanCoffee  --|>  Coffee 
LatteCoffee  --|>  Coffee 
MatchaMousse  --|>  Dessert 
Trimisu  --|>  Dessert 
AmericanDessertFactory  ..>  AmericanCoffee : «create»
AmericanDessertFactory  ..>  MatchaMousse : «create»
AmericanDessertFactory  ..|>  DessertFactory 
ItalyDessertFactory  ..|>  DessertFactory 
ItalyDessertFactory  ..>  LatteCoffee : «create»
ItalyDessertFactory  ..>  Trimisu : «create»
```



优点

- 当一个产品族中的多个对象被设计成一起工作时，能保证客户端始终只使用同一个产品族中的对象。

缺点

- 当产品族中需要增加一个新的产品时，所有的工厂类都需要进行修改。

使用场景

- 当需要创建的对象是一系列相互关联或相互依赖的产品族时，如电器工厂中的电视机、洗衣机、空调等。
- 系统中有多个产品族，但每次只使用其中的某一族产品。如有人只喜欢穿某一个品牌的衣服和鞋。
- 系统中提供了产品的类库，且所有产品的接口相同，客户端不依赖产品实例的创建细节和内部结构。
  - 如：输入法换皮肤，一整套一起换。生成不同操作系统的程序。



### 原型模式

定义

- 用一个已经创建的实例作为原型，通过复制该原型对象来创建一个和原型对象相同的新对象。

结构

- 抽象原型类：规定了具体原型对象必须实现的的 clone() 方法。
- 具体原型类：实现抽象原型类的 clone() 方法，它是可被复制的对象。
- 访问类：使用具体原型类中的 clone() 方法来复制新的对象。

实现

- 浅克隆：创建一个新对象，新对象的属性和原来对象完全相同；对于非基本类型，则指向原有属性的内存地址。
- 深克隆：创建一个新对象，属性中的引用类型也会被克隆，不再指向原有地址。

使用场景

- 对象的创建非常复杂，可以使用原型模式快捷的创建对象。
- 性能和安全要求比较高。



### 建造者模式

定义

- 将一个复杂对象的构建与表示分离，使得同样的构建过程可以创建不同的表示。

结构

- 产品类(Product)：要创建的复杂对象。
- 抽象建造者类(Builder)：定义要实现复杂对象的创建规则，不涉及具体的部件对象创建。
- 具体建造者类：实现抽象建造者定义的接口，完成复杂产品的各个部件的创建方法，为指挥者提供产品实例。
- 指挥者类(Director)：调用具体建造者来创建复杂对象的各个部分，在指挥者中不涉及具体产品的信息，只负责对象的完整创建或顺序创建。

类图

```mermaid
---
title: 建造者模式
---
classDiagram
direction RL



class Director{
	-Builder builder
	+construct() :Product
}

class Builder{
	+ buildPartA() : void
	+ buildPartB() : void
}

class ConcreteBuilder{
	+ buildPartA() : void
	+ buildPartB() : void
	+ getResult() : Product
}

class Product
note for Director "指挥者:构建一个使用\nBuilder接口的对象"
note for Product "具体的产品"
note for Builder "Builder是为创建一个Product对象的\n各个部件指定的接口"
note for ConcreteBuilder "具体的构建者，实现Builder接口，\n构建和装配各个部件"

Builder--* Director:builder
ConcreteBuilder --|> Builder
ConcreteBuilder -- Product
```

优点：

- 建造者模式的封装性很好。使用建造者模式可以有效的封装变化，在使用建造者模式的场景中，一般产品类和建造者类是比较稳定的，因此，将主要的业务逻辑封装在指挥者类中对整体而言可以取得比较好的稳定性。
- 在建造者模式中，客户端不必知道产品内部组成的细节，将产品本身与产品的创建过程解耦，使得相同的创建过程可以创建不同的产品对象。
- 可以更加精细地控制产品的创建过程 。将复杂产品的创建步骤分解在不同的方法中，使得创建过程更加清晰，也更方便使用程序来控制创建过程。
- 建造者模式很容易进行扩展。如果有新的需求，通过实现一个新的建造者类就可以完成，基本上不用修改之前已经测试通过的代码，因此也就不会对原有功能引入风险。符合开闭原则。

缺点

- 造者模式所创建的产品一般具有较多的共同点，其组成部分相似，如果产品之间的差异性很大，则不适合使用建造者模式，因此其使用范围受到一定的限制。

使用场景

建造者（Builder）模式创建的是复杂对象，其产品的各个部分经常面临着剧烈的变化，但将它们组合在一起的算法却相对稳定，所以它通常在以下场合使用。

- 创建的对象较复杂，由多个部件构成，各部件面临着复杂的变化，但构件间的建造顺序是稳定的。
- 创建复杂对象的算法独立于该对象的组成部分以及它们的装配方式，即产品的构建过程和最终的表示是独立的。





### 创建者模式对比

工厂方法模式VS建造者模式

工厂方法模式注重的是整体对象的创建方式；而建造者模式注重的是部件构建的过程，意在通过一步一步地精确构造创建出一个复杂的对象。

我们举个简单例子来说明两者的差异，如要制造一个超人，如果使用工厂方法模式，直接产生出来的就是一个力大无穷、能够飞翔、内裤外穿的超人；而如果使用建造者模式，则需要组装手、头、脚、躯干等部分，然后再把内裤外穿，于是一个超人就诞生了。



抽象工厂模式VS建造者模式

抽象工厂模式实现对产品家族的创建，一个产品家族是这样的一系列产品：具有不同分类维度的产品组合，采用抽象工厂模式则是不需要关心构建过程，只关心什么产品由什么工厂生产即可。

建造者模式则是要求按照指定的蓝图建造产品，它的主要目的是通过组装零配件而产生一个新产品。

如果将抽象工厂模式看成汽车配件生产工厂，生产一个产品族的产品，那么建造者模式就是一个汽车组装工厂，通过对部件的组装可以返回一辆完整的汽车。



结构型模型
----------

用于描述如何将类或对象按某种布局构成更大的结构。分为<mark>类机构型模式和对象结构性模式</mark>，前者采用继承机制来组织接口和类，后者采用组合或聚合来组成对象。

由于组合关系或聚合关系比继承关系耦合度更低，满足“合成复用原则”，所以对象结构型模式比类结构模式具有更大的灵活性。



### 代理模式

概述

- 由于某些原因需要给某对象提供一个代理以控制对该对象的访问。这时，访问对象不适合或者不能直接引用目标对象，代理对象作为访问对象和目标对象之间的中介。
- Java中的代理按照代理类生成时机不同又分为静态代理和动态代理。静态代理代理类在编译期就生成，而动态代理代理类则是在Java运行时动态生成。动态代理又有JDK代理和CGLib代理两种。

结构

- 抽象主题类：通过接口或抽象类声明真实主题和代理对象实现的业务方法。
- 真实主题类：实现抽象主题中的具体业务，是代理对象所代表的真实对象，是最终要引用的对象。
- 代理类：提供了与真实主题相同的接口，其内部含有对真实主题的引用。

静态代理

```mermaid
---
title: 代理模式之静态代理
---
classDiagram
direction RL
class SellTickets {
<<Interface>>
  + sell() void
}

class Client {
  + main(String[]) void
}

class ProxyPoint {
  + sell() void
}

class TrainStation {
  + sell() void
}

Client  ..>  ProxyPoint : create
ProxyPoint  ..>  SellTickets 
ProxyPoint "1" *--> "trainStation 1" TrainStation 
TrainStation  ..>  SellTickets 
```

动态代理-JDK

```mermaid
---
title: 代理模式之JDK动态代理
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class ProxyFactory {
  + TrainStation station
  + getProxyObject() SellTickets
}
class SellTickets {
<<Interface>>
  + sell() void
}
class TrainStation {
  + sell() void
}

Client  ..>  ProxyFactory : «create»
ProxyFactory "1" *--> "station 1" TrainStation 
ProxyFactory  ..>  TrainStation : «create»
TrainStation  ..>  SellTickets 

```

动态代理-CGLib

- 如果没有定义SellTickets接口，只定义了TrainStation(火车站类)。很显然JDK代理是无法使用了，因为JDK动态代理要求必须定义接口，对接口进行代理。

- CGLIB是一个功能强大，高性能的代码生成包。它为没有实现接口的类提供代理，为JDK的动态代理提供了很好的补充。



三种代理比较

- JDK代理和CGLIB代理

  使用CGLib实现动态代理，CGLib底层采用ASM字节码生成框架，使用字节码技术生成代理类，在JDK1.6之前比使用Java反射效率要高。唯一需要注意的是，CGLib不能对声明为final的类或者方法进行代理，因为CGLib原理是动态生成被代理类的子类。

  在JDK1.6、JDK1.7、JDK1.8逐步对JDK动态代理优化之后，在调用次数较少的情况下，JDK代理效率高于CGLib代理效率，只有当进行大量调用的时候，JDK1.6和JDK1.7比CGLib代理效率低一点，但是到JDK1.8的时候，JDK代理效率高于CGLib代理。所以如果有接口使用JDK动态代理，如果没有接口使用CGLIB代理。

- 动态代理和静态代理

  动态代理与静态代理相比较，最大的好处是接口中声明的所有方法都被转移到调用处理器一个集中的方法中处理（InvocationHandler.invoke）。这样，在接口方法数量比较多的时候，我们可以进行灵活处理，而不需要像静态代理那样每一个方法进行中转。

  如果接口增加一个方法，静态代理模式除了所有实现类需要实现这个方法外，所有代理类也需要实现此方法。增加了代码维护的复杂度。而动态代理不会出现该问题。



### 适配器模式

概述

- 将一个类的接口转换成客户希望的另外一个接口，使得原本由于接口不接容而不能一起工作的类可以一起工作。
- 适配器模式分为类适配器和对象适配器模式。前者类之间的耦合度比较高，并且要求程序员了解现有组件库中相关组件的内部结构。

结构

- 目标接口：当前系统业务所期待的接口，可以是抽象类或接口
- 适配者类：被访问和适配的现存组件库中的组件接口。
- 适配器类：作为一个转换器，通过继承或引用适配者的对象，把适配者接口转换成目标接口。

类适配器模式

- 实现方式：定义一个适配器类来实现当前系统的业务接口，同时又继承现有组件库中已经存在的组件。

- 不足：类适配器模式违背了合成复用原则。类适配器是客户类有一个接口规范的情况下可用，反之不可用。

```mermaid
---
title: 类适配模式
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class Computer {
  + readSD(SDCard sdCard) String
}
class SDAdapterTF {
  + writeSD(String) void
  + readSD() String
}
class SDCard {
<<Interface>>
  + readSD() String
  + writeSD(String) void
}
class SDCardImpl {
  + writeSD(String) void
  + readSD() String
}
class TFCard {
<<Interface>>
  + readTF() String
  + writeTF(String) void
}
class TFCardImpl {
  + writeTF(String) void
  + readTF() String
}



Client  ..>  Computer : «create»
Client  ..>  SDAdapterTF : «create»
Client  ..>  SDCardImpl : «create»
SDAdapterTF  ..|>  SDCard 
SDAdapterTF  --|>  TFCardImpl 
SDCardImpl  ..|>  SDCard 
TFCardImpl  ..|>  TFCard 
```

对象适配器模式

- 实现方式：对象适配器模式可采用将现有组件库中已经实现的组件引入适配器类中，该类同时实现当前系统的业务接口。
- 使用TIPS：还有一个适配器模式是接口适配器模式。当不希望实现一个接口中所有的方法时，可以创建一个抽象类Adapter ，实现所有方法。而此时我们只需要继承该抽象类即可。

```mermaid
---
title: 对象适配模式
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class Computer {
  + readSD(SDCard) String
}
class SDAdapterTF {
  + TFCard tfCard
  + readSD() String
  + writeSD(String) void
}
class SDCard {
<<Interface>>
  + writeSD(String) void
  + readSD() String
}
class SDCardImpl {
  + readSD() String
  + writeSD(String) void
}
class TFCard {
<<Interface>>
  + writeTF(String) void
  + readTF() String
}
class TFCardImpl {
  + readTF() String
  + writeTF(String) void
}

Client  ..>  Computer : «create»
Client  ..>  SDCardImpl : «create»
Client  ..>  SDAdapterTF : «create»

SDAdapterTF  ..>  SDCard 
SDAdapterTF "1" *--> "tfCard 1" TFCard 
SDCardImpl  ..|>  SDCard 
TFCardImpl  ..|>  TFCard 
```

应用场景

- 以前开发的系统存在满足新系统功能需求的类，但其接口同新系统的接口不一致。
- 使用第三方提供的组件，但组件接口定义和自己要求的接口定义不同。





### 装饰者模式

定义

- 在不改变现有对象结构的情况下，动态的给该对象增加一些额外功能的模式

结构

- 抽象构建：定义一个抽象接口以规范准备接收附加责任的对象。
- 具体构建：实现抽象构建，通过装饰角色为其添加一些职责。
- 抽象装饰：继承或实现抽象构建，并包含具体构件的实例，可以通过其子类拓展具体构件的功能。
- 具体装饰：实现抽象装饰的相关方法，并给具体构件对象添加附加的责任。

类图

```mermaid
---
title: 装饰模式
---
classDiagram
direction RL
class Bacon {
  + Bacon(FastFood)
  + getDesc() String
  + cost() float
}
class Client {
  + main(String[]) void
}
class Egg {
  + Egg(FastFood)
  + cost() float
  + getDesc() String
}
class FastFood {
  <<abstract>>
  - String desc
  - float price
  + setDesc(String) void
  + getDesc() String
  + setPrice(float) void
  + getPrice() float
  + cost() float*
}
class FriedNoodles {
  + cost() float
}
class FriedRice {

  + cost() float
}
class Garnish {
  <<abstract>>
  - FastFood fastFood
  + setFastFood(FastFood) void
  + getFastFood() FastFood
  + Garnish(FastFood,price,desc)
}


FriedNoodles  --|>  FastFood 
FriedRice  --|>  FastFood 
Garnish  --|>  FastFood:继承
Garnish  o--  FastFood:组合
Bacon  --|>  Garnish 
Egg  --|>  Garnish 
Client  ..>  Bacon : «create»
Client  ..>  Egg : «create»
Client  ..>  FriedRice : «create»
```

优点：

- 装饰者模式可以带来比继承更加灵活的拓展功能，组合更加多样化，使用更加方便。
- 装饰者模式完美的遵循开闭原则，继承是静态的附加责任，而装饰者模式是动态的附加责任。
- 装饰类和被装饰类可以独立发展，不会相互耦合。



使用场景

- 当不能采用继承的方式对系统进行扩充或者采用继承不利于系统扩展和维护时。

  不能采用继承的情况主要有两类：

  - 第一类是系统中存在大量独立的扩展，为支持每一种组合将产生大量的子类，使得子类数目呈爆炸性增长；
  - 第二类是因为类定义不能继承（如final类）

- 在不影响其他对象的情况下，以动态、透明的方式给单个对象添加职责。

- 当对象的功能要求可以动态地添加，也可以再动态地撤销时。



静态代理模式和装饰者模式比较

相同点：

- 都要实现与目标类相同的业务接口
- 在两个类中都要声明目标对象
- 都可以在不修改目标类的前提下增强目标方法

不同点

- 功能不同。装饰者是为了增强目标对象；静态代理是为了保护和隐藏目标对象。
- 获取目标对象的构建方式不同。装饰者是通过外界传递进来的，可以通过构造方法传递；静态代理是在代理类内部创建。



### 桥接模式

概述

- 将抽象与实现分离，使它们可以独立变化。用组合关系代替继承关系，从而降低了抽象和实现这两个可变维度的耦合度。

结构

- 抽象化角色：定义抽象类，并包含一个对实现化对象的引用。
- 扩展抽象化角色：是抽象化角色的子类，实现父类中的业务方法，并通过<mark>组合关系</mark>调用<mark>实现化角色中</mark>的业务方法。
- 实现化角色：定义实现化角色的接口，供扩展抽象化角色调用。
- 具体实现化角色：给出实现化角色接口的具体实现。

类图

```mermaid
---
title: 桥接模式
---
classDiagram
direction RL
class AviFile {
  + decode(String) void
}
class Client {
  + main(String[]) void
}
class Mac {
  + play(String) void
}
class OpratingSystem {
<<Abstract>>
  + VideoFile videoFile
  + play(String) void*
}
class RmvbFile {
  + decode(String) void
}
class VideoFile {
<<Interface>>
  + decode(String) void*
}
class Windows {
  + play(String) void
}

AviFile  ..>  VideoFile 
Client  ..>  AviFile : «create»
Client  ..>  Mac : «create»
Mac  -->  OpratingSystem 
OpratingSystem "1" *--> "videoFile 1" VideoFile 
RmvbFile  ..>  VideoFile 
Windows  -->  OpratingSystem 
```

优点

- 提高了系统的可拓展性，在两个变化维度中任意拓展一个维度，都不需要修改原有系统。

使用场景

- 当一个类存在两个独立变化的维度，且这两个维度都需要进行扩展时。
- 当一个系统不希望使用继承或因为多层次继承导致系统类的个数急剧增加时。
- 当一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性时。避免在两个层次之间建立静态的继承联系，通过桥接模式可以使它们在抽象层建立一个关联关系。



### 外观模式

概述

- 通过为多个复杂的子系统提供一个一致的接口，而使这些子系统更加容易被访问的模式。

结构

- 外观角色：为多个子系统对外提供一个共同的接口。
- 子系统角色：实现系统的部分功能，客户可以通过外观角色来访问。

类图

```mermaid
---
title: 外观模式
---
classDiagram
direction RL
class AirCondition {
  + on() void
  + off() void
}
class Client {
  + main(String[]) void
}
class Light {
  + on() void
  + off() void
}
class SmartAppliancesFacade {
  + AirCondition airCondition
  + Light light
  + TV tv
  + on() void
  + say(String) void
  + off() void
}
class TV {
  + off() void
  + on() void
}

Client  ..>  SmartAppliancesFacade : «create»
SmartAppliancesFacade o-- AirCondition 
SmartAppliancesFacade o-- Light 
SmartAppliancesFacade o-- TV 
```

优点

- 降低了子系统与客户端之间的耦合度，使得子系统的变化不会影响调用它的客户类。
- 对客户屏蔽了子系统组件，减少了客户处理的对象数目，并使得子系统使用起来更加容易。

缺点

- 不符合开闭原则，修改很麻烦

使用场景

- 对分层结构系统构建时，使用外观模式定义子系统中每层的入口点可以简化子系统之间的依赖关系。
- 当一个复杂系统的子系统很多时，外观模式可以为系统设计一个简单的接口供外界访问。
- 当客户端与多个子系统之间存在很大的联系时，引入外观模式可将它们分离，从而提高子系统的独立性和可移植性。



### 组合模式

概述

- 又名部分整体模式，是用于一组相似的对象当作一个单一的对象。组合模式依据树形结构来组合对象，用于表示部分以及整体层次。

结构

- 抽象根节点：定义系统各层次对象的共有方法和属性，可以预先定义一些默认行为和属性。
- 树枝节点：定义树枝节点的行为，存储子节点，组合树枝节点和叶子节点形成一个树形结构。
- 叶子节点：叶子节点对象，其下再无分支，是系统层次遍历的最小单位。

类图

```mermaid
---
title: 组合模式
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class Menu {
  + List~MenuComponent~ menuComponentList
  + add(MenuComponent) void
  + getChild(int) MenuComponent
  + print() void
  + remove(MenuComponent) void
}
class MenuComponent {
<<abstract>>
  + String name
  + int level
  + add(MenuComponent) void
  + print() void
  + getChild(int) MenuComponent
  + getName() String
  + remove(MenuComponent) void
}
class MenuItem {
  + print() void
}

Client  ..>  Menu : «create»
Client  ..>  MenuItem : «create»
Menu  --|>  MenuComponent 
MenuItem  --|>  MenuComponent 
Menu "1" *--> "menuComponentList *" MenuComponent:一对多
```



分类

在使用组合模式时，根据抽象构件类的定义形式，我们可将组合模式分为透明组合模式和安全组合模式两种形式。

- 透明组合模式

  透明组合模式中，抽象根节点角色中声明了所有用于管理成员对象的方法，比如在示例中 `MenuComponent` 声明了 `add`、`remove` 、`getChild` 方法，这样做的好处是确保所有的构件类都有相同的接口。透明组合模式也是组合模式的标准形式。

  透明组合模式的缺点是不够安全，因为叶子对象和容器对象在本质上是有区别的，叶子对象不可能有下一个层次的对象，即不可能包含成员对象，因此为其提供 add()、remove() 等方法是没有意义的，这在编译阶段不会出错，但在运行阶段如果调用这些方法可能会出错（如果没有提供相应的错误处理代码）

- 安全组合模式

  在安全组合模式中，在抽象构件角色中没有声明任何用于管理成员对象的方法，而是在树枝节点 `Menu` 类中声明并实现这些方法。安全组合模式的缺点是不够透明，因为叶子构件和容器构件具有不同的方法，且容器构件中那些用于管理成员对象的方法没有在抽象构件类中定义，因此客户端不能完全针对抽象编程，必须有区别地对待叶子构件和容器构件。



### 享元模式

概述

- 运用共享技术来有效地支持大量<mark>细粒度对象</mark>的复用。它通过共享已经存在的对象来大幅度减少需要创建的对象数量、避免大量相似对象的开销，从而提高系统资源的利用率。

结构

享元模式中存在的两种状态

- 内部状态：即不会随着环境的改变而改变的可共享部分。
- 外部状态：指随环境改变而改变的不可以共享的部分。

享元模式中的主要角色

- 抽象享元角色：通常是一个接口或抽象类，在抽象享元类中声明了具体享元类公共的方法，这些方法可以向外界提供享元对象的内部数据（内部状态），同时也可以通过这些方法来设置外部数据（外部状态）。
- 具体享元角色 ：它实现了抽象享元类，称为享元对象；在具体享元类中为内部状态提供了存储空间。通常我们可以结合单例模式来设计具体享元类，为每一个具体享元类提供唯一的享元对象。
- 非享元角色 ：并不是所有的抽象享元类的子类都需要被共享，不能被共享的子类可设计为非共享具体享元类；当需要一个非共享具体享元类的对象时可以直接通过实例化创建。
- 享元工厂角色 ：负责创建和管理享元角色。当客户对象请求一个享元对象时，享元工厂检査系统中是否存在符合要求的享元对象，如果存在则提供给客户；如果不存在的话，则创建一个新的享元对象。

类图

```mermaid
---
title: 享元模式
---
classDiagram
direction BT
class AbstractBox {
  + getShape() String*
  + display(String) void
}
class BoxFactory {
  + BoxFactory factory
  + HashMap~String，AbstractBox~ map
  + getShape(String) AbstractBox
  + getInstance() BoxFactory
}
class Client {
  + main(String[]) void
}
class IBox {
  + getShape() String
}
class LBox {
  + getShape() String
}
class OBox {
  + getShape() String
}




AbstractBox ..> Client
BoxFactory ..> Client
IBox  -->  AbstractBox 
LBox  -->  AbstractBox 
OBox  -->  AbstractBox 
BoxFactory "1" *--> "map *" AbstractBox:一对多
```

**优点**

- 极大减少内存中相似或相同对象数量，节约系统资源，提供系统性能
- 享元模式中的外部状态相对独立，且不影响内部状态

**缺点：**

- 为了使对象可以共享，需要将享元对象的部分状态外部化，分离内部状态和外部状态，使程序逻辑复杂

**使用场景：**

- 一个系统有大量相同或者相似的对象，造成内存的大量耗费。
- 对象的大部分状态都可以外部化，可以将这些外部状态传入对象中。
- 在使用享元模式时需要维护一个存储享元对象的享元池，而这需要耗费一定的系统资源，因此，应当在需要多次重复使用享元对象时才值得使用享元模式。





行为者模式
----------

行为型模式用于描述程序在运行时复杂的流程控制，即描述多个类或对象之间怎样相互协作共同完成单个对象都无法单独完成的任务，它涉及算法与对象间职责的分配。

行为型模式分为类行为模式和对象行为模式，前者采用继承机制来在类间分派行为，后者采用组合或聚合在对象间分配行为。由于组合关系或聚合关系比继承关系耦合度低，满足“合成复用原则”，所以对象行为模式比类行为模式具有更大的灵活性。

行为型模式分为：

- 模板方法模式
- 策略模式
- 命令模式
- 职责链模式
- 状态模式
- 观察者模式
- 中介者模式
- 迭代器模式
- 访问者模式
- 备忘录模式
- 解释器模式

以上 11 种行为型模式，除了模板方法模式和解释器模式是类行为型模式，其他的全部属于对象行为型模式。





### 模版方法模式

概述

- 定义一个操作中的算法骨架，将算法的一些步骤延迟到子类中，使得子类可以不改变该算法结构的情况下重定义该算法的某些特定步骤。



结构

- 抽象类：负责给出一个算法的轮廓和骨架。它由一个模版发方法和若干个基本方法构成。
  - 模版方法：定义了算法的骨架，按照某种顺序调用其包含的基本方法。
  - 基本方法：实现算法各个步骤的方法，是模版方法的组成部分。
    - 抽象方法：一个抽象方法由抽象类声明、由具体子类实现。
    - 具体方法：一个具体方法由一个抽象类或具体类声明并实现，其子类可以进行覆盖也可以直接继承。
    - 钩子方法：在抽象类中已经实现，包括用于判断的逻辑方法和需要子类重写的空方法。
- 具体子类：实现抽象类中所定义的抽象方法和钩子方法，是顶级逻辑的组成步骤。



类图

```mermaid
---
title: 模版方法模式
---
classDiagram
direction BT
class AbstractClass {
  + cookProcess() void
  + pourOil() void
  + heatOil() void
  + pourVegetable() void*
  + pourSauce() void*
  + fry() void
}

class Client {
  + main(String[]) void
}

class ConcreteClass_BaoCai {
  + pourVegetable() void
  + pourSauce() void
}

class ConcreteClass_CaiXin {
  + pourVegetable() void
  + pourSauce() void
}

Client  ..>  AbstractClass : «create»
ConcreteClass_BaoCai  --|>  AbstractClass 
ConcreteClass_CaiXin  --|>  AbstractClass 
```



优点

- 将相同部分的代码放在抽象类的父类中，而将不同的代码放入不同的子类中。
- 通过一个父类调用子类的操作，并通过子类的具体实现拓展不同的行为，实现了反向控制，并符合“开闭原则”



缺点

- 每个不同的实现都需要定义一个子类，会导致类的个数增加，系统更加庞大，设计也更加抽象。
- 父类中的抽象方法由子类实现，子类执行的结果会影响父类的结果，这种反向控制提高了代码阅读的难度。



使用场景

- 算法的整体步骤很固定，但个别部分易变时，这时候可以使用模版方法，将易变的部分抽象出来，供子类实现。
- 需要通过子类来决定父类算法中某个步骤是否执行，实现子类对父类的反向控制。



### 策略模式

概述

- 定义一系列算法，并将每个算法封装起来，使它们可以相互替换，且算法的变化不会影响使用算法的类。
- 策略模式属于对象行为模式，它通过对算法的封装，把使用算法的责任和算法的实现分割开来，并委派给不同的对象对这些算法进行管理。



结构

- 抽象策略类：这是一个抽象角色，给出所有的具体策略类所需的接口。
- 具体策略类：实现了抽象策略定义的接口，提供具体的算法实现或行为。
- 环境类：持有一个策略类的引用，最终给客户端调用。



类图

```mermaid
---
title: 策略模式
---
classDiagram
direction BT

class SalesMan {
  + Strategy strategy
  + setStrategy(Strategy) void
  + getStrategy() Strategy
  + salesManShow() void
}
class Strategy {
<<Interface>>
  + show() void
}
class StrategyA {
  + show() void
}
class StrategyB {
  + show() void
}
class StrategyC {
  + show() void
}

SalesMan "1" *--> "strategy 1" Strategy 
StrategyA  --|>  Strategy 
StrategyB  --|>  Strategy 
StrategyC  --|>  Strategy 
```



优点

- 策略类都实现同一个接口，策略之间可以自由切换。
- 易于拓展，增加一个新的策略只需要添加一个具体的策略类即可，不用改变原有代码，符合“开闭原则”。
- 避免使用多重条件选择语句（if else），充分体现面向对象设计思想。



缺点

- 客户端必须知道所有的策略类，并自行决定使用哪一个策略类。
- 策略模式将造成产生很多策略类，可以通过使用享元模式在一定程度上减少对象的数量。





使用场景

- 一个系统需要动态地在几种算法中选择一种时，可将每个算法封装到策略类中。
- 一个类定义了多种行为，并且这些行为在这个类的操作中以多个条件语句的形式出现，可将每个条件分支移入它们各自的策略类中以代替这些条件语句。
- 系统中各算法彼此完全独立，且要求对客户隐藏具体算法的实现细节时。
- 系统要求使用算法的客户不应该知道其操作的数据时，可使用策略模式来隐藏与算法相关的数据结构。
- 多个类只区别在表现行为不同，可以使用策略模式，在运行时动态选择具体要执行的行为。



### 命令模式

概述

- 将一个请求封装成一个对象，使发出请求的责任和执行请求的责任区分开。这样两者之间通过命令对象进行沟通，方便将命令对象进行存储、传递、嗲用、增加与管理。



结构

- 抽象命令类：定义命令的接口，声明执行的方法
- 具体命令类：实现命令的接口；通常调用<mark>接收者</mark>的功能来完成命令要实现的操作。
- 实现者角色：接收者，真正执行命令的对象。
- 调用者角色：请求者，持有命令对象，使用命令对象的入口。



类图

```mermaid
---
title: 命令模式简易版
---
classDiagram
direction TB

class Command {
<<Interface>>
  + execute() void*
}
class Order {
  - Map~String，Integer~ foodDir
  - int diningTable
  + setDiningTable(int) void
  + getDiningTable() int
  + setFood(String, int) void
  + getFoodDir() Map~String，Integer~
}
class OrderCommand {
  - Order order
  - SeniorChef receiver
  + OrderCommand(Order,SeniorChef)
  + execute() void
}
class SeniorChef {
  + makeFood(String, int) void
}
class Waitor {
  + List~Command~ commands
  + setCommand(Command) void
  + orderUp() void
}

OrderCommand  ..>  Command 
OrderCommand "1" *--> "order 1" Order 
OrderCommand "1" *--> "receiver 1" SeniorChef 
Waitor "1" *--> "commands *" Command 
```



优点

- 命令模式将调用操作的对象与实现该操作的对象解耦。
- 采用命令模式增加与删除命令不会影响其他类，它满足“开闭原则”，对扩展比较灵活。
- 命令模式可以与组合模式结合，将多个命令装配成一个组合命令，即宏命令。
- 命令模式可以与后面介绍的备忘录模式结合，实现命令的撤销与恢复。



缺点

- 使用命令模式可能会导致某些系统有过多的具体命令类，使系统结构更加复杂。



使用场景

- 系统需要将请求调用者和请求接收者解耦，使得调用者和接收者不直接交互。
- 系统需要在不同的时间指定请求、将请求排队和执行请求。
- 系统需要支持命令的撤销(Undo)操作和恢复(Redo)操作。



### 责任链模式

定义

- 避免请求发送者与多个请求处理者耦合在一起，将所有请求的处理者通过前一对象记住下一个对象的引用而连成一条链；当有请求发生时，可将请求沿着这条链传递，直到有对象处理它为止。



结构

- 抽象处理者：定义一个处理请求的接口，包含抽象处理方法和一个后继连接。
- 具体处理者：实现抽象处理者，判断能否处理本次请求，可以处理则处理本次请求，不可以则交由后继者。
- 客户类：创建处理链，并向链头的具体处理者对象提交请求，客户类<mark>不关心处理细节和请求的传递过程。</mark>



类图

```mermaid
---
title: 责任链模式
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class GeneralManager {
  + handleLeave(LeaveRequest) void
}
class GroupLeader {
  + handleLeave(LeaveRequest) void
}
class Handler {
	<<abstract>>
	+ int NUM_ONE = 1
  + int NUM_THREE = 3
  + int NUM_SEVEN = 7
  - int numEnd
  - int numStart
  + Handler nextHandler
  + Handler(numEnd)
  + Handler(numEnd,numStart)
  + handleLeave(LeaveRequest level) void*
  + submit(LeaveRequest) void
  + setNextHandler(Handler) void
}
class Manager {
  + handleLeave(LeaveRequest) void
}
class LeaveRequest {
  - int num
  - String content
  - String name
  + LeaveRequest(num,content,name)
  + getName() String
  + getNum() int
  + getContent() String
}

Client  ..>  GeneralManager : «create»
Client  ..>  GroupLeader : «create»
Client  ..>  Manager : «create»
Client  ..>  LeaveRequest : «create»

GeneralManager  -->  Handler 
GroupLeader  -->  Handler 
Manager  -->  Handler 
```

优点

- 降低了对象之间的耦合度

  该模式降低了请求发送者和接收者的耦合度。

- 增强了系统的可扩展性

  可以根据需要增加新的请求处理类，满足开闭原则。

- 增强了给对象指派职责的灵活性

  当工作流程发生变化，可以动态地改变链内的成员或者修改它们的次序，也可动态地新增或者删除责任。

- 责任链简化了对象之间的连接

  一个对象只需保持一个指向其后继者的引用，不需保持其他所有处理者的引用，这避免了使用众多的 if 或者 if···else 语句。

- 责任分担

  每个类只需要处理自己该处理的工作，不能处理的传递给下一个对象完成，明确各类的责任范围，符合类的单一职责原则。

缺点

- 不能保证每个请求一定被处理。由于一个请求没有明确的接收者，所以不能保证它一定会被处理，该请求可能一直传到链的末端都得不到处理。
- 对比较长的职责链，请求的处理可能涉及多个处理对象，系统性能将受到一定影响。
- 职责链建立的合理性要靠客户端来保证，增加了客户端的复杂性，可能会由于职责链的错误设置而导致系统出错，如可能会造成循环调用。



### 状态模式

定义

- 对有状态的对象，把复杂的“判断逻辑”提取到不同的状态对象中，允许状态对象在其内部状态发生改变时改变其行为。



结构

- 环境角色：也称为上下文，它定义了客户程序需要的接口，维护一个当前状态，并将与状态相关的操作委托给当前状态对象来处理。
- 抽象状态角色：定义一个接口，用以封装环境对象中的特定状态所对应的行为。
- 具体状态角色：实现抽象状态所对应的行为。



类图

```mermaid
---
title: 状态模式
---
classDiagram
direction BT
class Context {
  + OpeningState OPENING_STATE
  + StoppingState STOPPING_STATE
  + ClosingState CLOSING_STATE
  + RunningState RUNNING_STATE
  + LiftState liftState
  + setLiftState(LiftState) void
  + getLiftState() LiftState
  + open() void
  + close() void
  + run() void
  + stop() void
}
class LiftState {
<<Abstract>>
  + Context context
  + setContext(Context) void
  + close() void*
  + open() void*
  + stop() void*
  + run() void*
}
class ClosingState {
  + open() void
  + close() void
  + run() void
  + stop() void
}
class OpeningState {
  + open() void
  + close() void
  + run() void
  + stop() void
}
class RunningState {
  + open() void
  + close() void
  + run() void
  + stop() void
}
class StoppingState {
  + open() void
  + close() void
  + run() void
  + stop() void
}



OpeningState  --|>  LiftState 
ClosingState  -->  LiftState 
StoppingState  --|>  LiftState 
RunningState  --|>  LiftState 
Context "1" *--> "CLOSING_STATE 1" ClosingState 
Context "1" *--> "OPENING_STATE 1" OpeningState 
Context "1" *--> "RUNNING_STATE 1" RunningState 
Context "1" *--> "STOPPING_STATE 1" StoppingState 
```

优点

- 将所有与某个状态有关的行为放到一个类中，并且可以方便地增加新的状态，只需要改变对象状态即可改变对象的行为。
- 允许状态转换逻辑与状态对象合成一体，而不是某一个巨大的条件语句块。



缺点

- 状态模式的使用必然会增加系统类和对象的个数。 
- 状态模式的结构与实现都较为复杂，如果使用不当将导致程序结构和代码的混乱。
- 状态模式对"开闭原则"的支持并不太好。



使用场景

- 当一个对象的行为取决于它的状态，并且它必须在运行时根据状态改变它的行为时，就可以考虑使用状态模式。
- 一个操作中含有庞大的分支结构，并且这些分支决定于对象的状态时。





### 观察者模式

定义

- 又被称为发布-订阅（Publish/Subscribe）模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态变化时，会通知所有的观察者对象，使他们能够自动更新自己。



结构

- 抽象主题：把所有观察者保存在一个集合中，每个主题都可以有任意数量的观察者，抽象主题提供一个接口，可以增加和删除观察者对象。
- 具体主题：该角色将有关状态存入具体观察者对象，在具体主题的内部状态发生改变时，给所有注册过的观察者发送通知。
- 抽象观察者：抽象观察者，是观察者的抽象类，它定义了一个更新接口，使得在得到主题更改通知时更新自己。
- 具体观察者：具体观察者，实现抽象观察者定义的更新接口，以便在得到主题更改通知时更新自身的状态。



类图

```mermaid
---
title: 观察者模式
---
classDiagram
direction RL
class Client {
  + main(String[]) void
}
class Observer {
<<Interface>>
  + update(String) void
}
class Subject {
<<Interface>>
  + attach(Observer) void
  + detach(Observer) void
  + notify(String) void
}
class SubscriptionSubject {
  + List~Observer~ weiXinUserList
  + notify(String) void
  + attach(Observer) void
  + detach(Observer) void
}
class WeiXinUser {
  + String name
  + update(String) void
}

Client  ..>  SubscriptionSubject : «create»
Client  ..>  WeiXinUser : «create»
SubscriptionSubject "1" *--> "weiXinUserList *" Observer 
SubscriptionSubject  ..>  Subject 
WeiXinUser  ..>  Observer 
```



优点

- 降低了目标与观察者之间的耦合关系，两者之间是抽象耦合关系。
- 被观察者发送通知，所有注册的观察者都会收到信息【可以实现广播机制】

缺点

- 如果观察者非常多的话，那么所有的观察者收到被观察者发送的通知会耗时
- 如果被观察者有循环依赖的话，那么被观察者发送通知会使观察者循环调用，会导致系统崩溃



### 中介者模式

定义

- 定义一个中介角色来封装一系列对象之间的交互，使原有对象之间的耦合松散，且可以独立地改变它们之间的交互。



结构

- 抽象中介者：定义中介者接口，提供了同事对象注册与转发同事对象信息的抽象方法。
- 具体中介者：实现中介者接口，定义一个 List 来管理同事对象，协调各个同事角色之间的交互关系。
- 抽象同事类：定义同事类的接口，保存中介者对象，提供同事对象交互的抽象方法。
- 具体同事类：实现同事类的接口，当需要与其他同事对象交互时，由中介者对象负责后续的交互。



类图

```mermaid
---
title: 中介者模式
---
classDiagram
direction RL

class Mediator {
	<<Abstract>>
  + constact(String, Person) void*
}
class Person {
	<<Abstract>>
  + Mediator mediator
  + String name
}
class HouseOwner {
  + HouseOwner(name,Mediator)
  + constact(String) void
  + getMessage(String) void
}
class Tenant {
  + Tenant(name,Mediator)
  + constact(String) void
  + getMessage(String) void
}
class MediatorStructure {
  + HouseOwner houseOwner
  + Tenant tenant
  + setHouseOwner(HouseOwner) void
  + getHouseOwner() HouseOwner
  + setTenant(Tenant) void
  + getTenant() Tenant
  + constact(String, Person) void
}


MediatorStructure  --|>  Mediator 
HouseOwner  --|>  Person 
Tenant  --|>  Person 
Person "1" *--> "mediator 1" Mediator 
MediatorStructure "1" *--> "houseOwner 1" HouseOwner 
MediatorStructure "1" *--> "tenant 1" Tenant 
```

优点

- 松散耦合

  中介者模式通过把多个同事对象之间的交互封装到中介者对象里面，从而使得同事对象之间松散耦合，基本上可以做到互补依赖。这样一来，同事对象就可以独立地变化和复用，而不再像以前那样“牵一处而动全身”了。

- 集中控制交互

  多个同事对象的交互，被封装在中介者对象里面集中管理，使得这些交互行为发生变化的时候，只需要修改中介者对象就可以了，当然如果是已经做好的系统，那么就扩展中介者对象，而各个同事类不需要做修改。

- 关系的简化

  没有使用中介者模式的时候，同事对象之间的关系通常是一对多的，引入中介者对象以后，中介者对象和同事对象的关系通常变成双向的一对一，这会让对象的关系更容易理解和实现。

缺点

- 当同事类太多时，中介者的职责将很大，它会变得复杂而庞大，以至于系统难以维护。



使用场景

- 系统中对象之间存在复杂的引用关系，系统结构混乱且难以理解。
- 当想创建一个运行于多个类之间的对象，又不想生成新的子类时。



### 迭代器模式

定义

- 提供一个对象来顺序访问聚合对象中的一系列数据，而不暴露聚合对象的内部表示。



结构

- 抽象聚合类：定义存储、添加、删除聚合元素以及创建迭代器对象的接口。
- 具体聚合类：实现抽象聚合类，返回一个具体迭代器的实例。
- 抽象迭代器：定义访问和遍历聚合元素的接口，通常包含 hasNext()、next() 等方法。
- 具体迭代器：实现抽象迭代器接口中所定义的方法，完成对聚合对象的遍历，记录遍历的当前位置。



类图

```mermaid
---
title: 迭代器模式
---
classDiagram
direction RL
class Student {
  + String number
  + String name
  + setNumber(String) void
  + getNumber() String
  + setName(String) void
  + getName() String
}
class StudentAggregate {
<<Interface>>
  + getStudentIterator() StudentIterator
  + addStudent(Student) void
  + removeStudent(Student) void
}
class StudentAggregateImpl {
  + List~Student~ list
  + getStudentIterator() StudentIterator
  + addStudent(Student) void
  + removeStudent(Student) void
}
class StudentIterator {
<<Interface>>
  + hasNext() boolean
  + next() Student
}
class StudentIteratorImpl {
  + List~Student~ list
  + int position
  + hasNext() boolean
  + next() Student
}

StudentAggregateImpl  ..>  StudentIteratorImpl : «create»
StudentAggregateImpl  ..|>  StudentAggregate 
StudentIteratorImpl  ..|>  StudentIterator 
StudentIteratorImpl "1" *--> "list *" Student 
StudentAggregateImpl "1" *--> "list *" Student 
```



优点

- 支持以不同的方式遍历一个聚合对象，在同一个聚合对象上可以定义多种遍历方式。在迭代器模式中只需要用一个不同的迭代器来替换原有迭代器即可改变遍历算法，我们也可以自己定义迭代器的子类以支持新的遍历方式。
- 迭代器简化了聚合类。由于引入了迭代器，在原有的聚合对象中不需要再自行提供数据遍历等方法，这样可以简化聚合类的设计。
- 在迭代器模式中，由于引入了抽象层，增加新的聚合类和迭代器类都很方便，无须修改原有代码，满足 “开闭原则” 的要求。



缺点

- 增加了类的个数，一定程度上增加了系统的复杂性。



使用场景

- 当需要为聚合对象提供多种遍历方式时。
- 当需要为遍历不同的聚合结构提供一个统一的接口时。
- 当访问一个聚合对象的内容而无须暴露其内部细节的表示时。





### 访问者模式

定义

- 封装一些作用于某种数据结构中的各元素的操作，它可以在不改变这个数据结构的前提下定义作用于这些元素的新的操作。



结构

- 抽象访问者：
- 具体访问者：
- 抽象元素：
- 具体元素：
- 对象结构：



类图

```mermaid
---
title: 访问者模式
---
classDiagram
direction BT
class Animal {
<<Interface>>
  + accept(Person) void
}
class Cat {
  + accept(Person) void
}
class Client {
  + main(String[]) void
}
class Dog {
  + accept(Person) void
}
class Home {
  + List~Animal~ nodeList
  + action(Person) void
  + add(Animal) void
}
class Owner {
  + feed(Cat) void
  + feed(Dog) void
}
class Person {
<<Interface>>
  + feed(Cat) void
  + feed(Dog) void
}
class Someone {
  + feed(Cat) void
  + feed(Dog) void
}

Cat  ..|>  Animal 
Dog  ..|>  Animal 
Owner  ..|>  Person 
Someone  ..|>  Person 
Home "1" *--> "nodeList *" Animal 
Client  ..>  Cat : «create»
Client  ..>  Dog : «create»
Client  ..>  Home : «create»
Client  ..>  Owner : «create»
Client  ..>  Someone : «create»
```



### 备忘录模式

定义

- 在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态，一遍遍以后当需要时能将该对象恢复到原先保存到状态。



结构

- 发起人：记录当前时刻的内部状态信息，提供创建备忘录和恢复备忘录数据的功能，并且实现其他业务功能。发起人可以访问备忘录中所有的信息。
- 备忘录：负责存储发起人的内部状态，在需要的时候提供这些内部状态给发起人。
- 管理者：对备忘录进行管理，提供保护与获取备忘录功能，但不能对备忘录的内容进行访问和修改。



等效接口

- 窄接口：管理者对象看到的是备忘录的窄接口，这个窄接口只允许他把备忘录对象传给其他的对象。
- 宽接口：与管理者看到的窄接口相反，发起人对象可以看到一个宽接口，能读取所有的数据，以便根据这些数据恢复这个发起人对象的内部状态。



白箱备忘录

- 备忘录角色对任何对象都提供一个接口，即宽接口，备忘录角色的内部所存储的状态就对所有对象公开。

- 白箱备忘录模式是破坏封装性的。但是通过程序员自律，同样可以在一定程度上实现模式的大部分用意。



类图

```mermaid
---
title: “白箱”备忘录模式
---
classDiagram
direction RL
class Client{
 + main(String[]) void
}

class GameRole {
  - int vit
  - int atk
  - int def
  + initState() : void
  + fight() : void
  + saveState() : RoleStateMemento
  + recoverState(RoleStateMemento state) : void
}

class RoleStateCaretaker {
  - RoleStateMemento roleStateMemento
  + setRoleStateMemento(RoleStateMemento) : void
  + getRoleStateMemento() : RoleStateMemento
}

class RoleStateMemento {
  - int def
  - int atk
  - int vit
  + RoleStateMemento(int def,int atk,int vit)
}

Client  ..>  GameRole : «create»
Client  ..>  RoleStateCaretaker : «create»
GameRole  ..>  RoleStateMemento : «create»
RoleStateCaretaker "1" *--> "roleStateMemento 1" RoleStateMemento 
```

黑箱备忘录

- 备忘录角色对发起人对象提供一个宽接口，而为其他对象提供一个窄接口。在Java语言中，实现双重接口的办法就是将**备忘录类**设计成**发起人类**的内部成员类。



类图

```mermaid
---
title: “黑箱”备忘录模式
---
classDiagram
direction RL
class Client{
 + main(String[]) void
}

class Memento {
	<<interface>>
}

class GameRole {
  - int vit
  - int atk
  - int def
  + void initState()
  + void fight()
  + recoverState(Memento) : void
  + saveState() : Memento
}

class RoleStateCaretaker {
  - Memento memento
  + setMemento() : void
  + getMemento() : Memento
}

class `GameRole::RoleStateMemento` {
  - int def
  - int atk
  - int vit
  + RoleStateMemento(int def,int atk,int vit)
}

`GameRole::RoleStateMemento` ..|> Memento
Client  ..>  GameRole : «create»
Client  ..>  RoleStateCaretaker : «create»
GameRole  ..>  Memento : «create»
RoleStateCaretaker "1" *--> "Memento 1" Memento 
```



优点

- 提供了一种可以恢复状态的机制。当用户需要时能够比较方便地将数据恢复到某个历史的状态。
- 实现了内部状态的封装。除了创建它的发起人之外，其他对象都不能够访问这些状态信息。
- 简化了发起人类。发起人不需要管理和保存其内部状态的各个备份，所有状态信息都保存在备忘录中，并由管理者进行管理，这符合单一职责原则。



缺点

- 资源消耗大。如果要保存的内部状态信息过多或者特别频繁，将会占用比较大的内存资源。



使用场景

- 需要保存与恢复数据的场景，如玩游戏时的中间结果的存档功能。
- 需要提供一个可回滚操作的场景，如 Word、记事本、Photoshop，idea等软件在编辑时按 Ctrl+Z 组合键，还有数据库中事务操作。



### 解释器模式

定义

- 给定一个语言，定义它的文法表示，并定义一个解释器，这个解释器使用该标识来解释语言中的句子。



结构

- 抽象表达式：定义解释器的接口，约定解释器的解释操作，主要包含解释方法 interpret()。
- 终结符表达式：是抽象表达式的子类，用来实现文法中与终结符相关的操作，文法中的每一个终结符都有一个具体终结表达式与之相对应。
- 非终结符表达式：也是抽象表达式的子类，用来实现文法中与非终结符相关的操作，文法中的每条规则都对应于一个非终结符表达式。
- 环境角色：通常包含各个解释器需要的数据或是公共的功能，一般用来传递被所有解释器共享的数据，后面的解释器可以从这里获取这些值。
- 客户端：主要任务是将需要分析的句子或表达式转换成使用解释器对象描述的抽象语法树，然后调用解释器的解释方法，当然也可以通过环境角色间接访问解释器的解释方法。



类图

```mermaid
---
title: 解释器模式
---
classDiagram
direction BT
class AbstractExpression {
<<Abstract>>
  + interpret(Context) int*
}
class Context {
  - Map~Variable，Integer~ map
  + assign(Variable,Integer) void
  + getValue(Variable) int
}
class Minus {
  - AbstractExpression right
  - AbstractExpression left
  + Minus(right,left)
  + interpret(Context) int
  + toString() String
}
class Plus {
  - AbstractExpression left
  - AbstractExpression right
  + Plus(left,right)
  + interpret(Context) int
  + toString() String
}
class Value {
  - int value
  + Value(int)
  + interpret(Context) int
  + toString() String
}
class Variable {
  - String name
  + Variable(String)
  + interpret(Context) int
  + toString() String
}

Context "1" *--> "map *" Variable 
Minus  --|>  AbstractExpression 
Minus "1" *--> "left 1" AbstractExpression 
Plus  --|>  AbstractExpression 
Plus "1" *--> "left 1" AbstractExpression 
Value  --|>  AbstractExpression 
Variable  --|>  AbstractExpression 
```

优点

- 易于改变和扩展文法。

  由于在解释器模式中使用类来表示语言的文法规则，因此可以通过继承等机制来改变或扩展文法。每一条文法规则都可以表示为一个类，因此可以方便地实现一个简单的语言。

- 实现文法较为容易。

  在抽象语法树中每一个表达式节点类的实现方式都是相似的，这些类的代码编写都不会特别复杂。

- 增加新的解释表达式较为方便。

  如果用户需要增加新的解释表达式只需要对应增加一个新的终结符表达式或非终结符表达式类，原有表达式类代码无须修改，符合 "开闭原则"。



缺点

- 对于复杂文法难以维护。

  在解释器模式中，每一条规则至少需要定义一个类，因此如果一个语言包含太多文法规则，类的个数将会急剧增加，导致系统难以管理和维护。

- 执行效率较低。

  由于在解释器模式中使用了大量的循环和递归调用，因此在解释较为复杂的句子时其速度很慢，而且代码的调试过程也比较麻烦。



使用场景

- 当语言的文法较为简单，且执行效率不是关键问题时。
- 当问题重复出现，且可以用一种简单的语言来进行表达时。
- 当一个语言需要解释执行，并且语言中的句子可以表示为一个抽象语法树的时候。