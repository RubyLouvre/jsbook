function A() {
}

A.prototype = {
    aa: "aa",
    method: function() {
    }
};
var a = new A;
var b = new A;
console.log(a.aa === b.aa);//true
console.log(a.method === b.method);//true

function A() {
    var count = 0
    this.aa = "aa";
    this.method = function() {
      return count
    }
    this.obj = {}
}

A.prototype = {
    aa: "aa",
    method: function() {
    }
};
var a = new A;
var b = new A;
console.log(a.aa === b.aa);//true 由于aa的值为基本类型,比较值
console.log(a.obj === b.obj);//false,引用类型,每次进入函数体都重新创建,因此都不一样
console.log(a.method === b.method);//false

delete a.method;
console.log(a.method === A.prototype.method);//true

A.method2 = function(){};//类方法
var c = new A;
console.log(c.method2);//undefined

function A(){}
A.prototype = {
    aaa:1
}
function B(){}
B.prototype = A.prototype;
var b= new B;
console.log(b.aaa);//1;
A.prototype.bbb = 2;
console.log(b.bbb);//2;

function extend(destination, source) {
  for(var property in source)
  destination[property] = source[property];
  return destination;
}

A.prototype = {
  aa: function() {
    alert(1)
  }
}

function bridge() {};
bridge.prototype = A.prototype;

function B() {}
B.prototype = new bridge();
var a = new A;
var b = new B;
//false，说明成功分开它们的原型
console.log(A.prototype == B.prototype);
//true，子类共享父类的原型方法
console.log(a.aa === b.aa);
//为父类动态添加新的原型方法
A.prototype.bb = function() {
  alert(2)
}
//true，孩子总会得到父亲的遗产
console.log(a.bb === b.bb);
B.prototype.cc = function() {
  alert(3)
}
//false，但父亲未必有机会看到孩子的新产业
console.log(a.cc === b.cc);
//并且它能正常通过JavaScript自带验证机制——instanceof
console.log(b instanceof A);//true
console.log(b instanceof B);//true

Object.create = function (o) {  
    function F() {}  
    F.prototype = o;  
    return new F();  
}  

function inherit(init, Parent, proto){
    function Son(){
        Parent.apply(this,argument);	//先继承父类的特权成员
        init.apply(this,argument);	//再执行自己的构造器
    }
    //由于Object.create可能是我们伪造的，因此避免使用第二个参数
    Son.prototype = Object.create(Parent.prototype,{});
    Son.prototype.toString = Parent.prototype.toString;	//处理IE BUG
    Son.prototype.valueOf = Parent.prototype.valueOf;		//处理IE BUG
    Son.prototype.constructor = Son;	//确保构造器正常指向自身，而不是Object
    extend(Son.prototype, proto);	//添加子类特有的原型成员
    extend(Son, Parent);		//继承父类的类成员
    return Son;
}

function A() {}
A.prototype = {
  aa: 1
}
var a = new A;
console.log( a.aa);//1
//把它整个原型对象都换掉
A.prototype = {
  aa: 2
}
console.log(a.aa);//1，表示不受影响
//于是我们想到实例都有一个constructor方法，指向其构造器，
//而构造器上面正好有我们的原型，JavaScript引擎是不是通过该路线回溯属性呢
function B(){}
B.prototype = {
  aa: 3
}
a.constructor = B;
console.log( a.aa );//1 表示不受影响

function A() {
  console.log(this.__proto__.aa); //1
  this.aa = 2
}
A.prototype = {
  aa: 1
}
var a = new A;
console.log(a.aa); //2
a.__proto__ = {
  aa: 3
}
delete a.aa; //删掉特权属性，暴露原型链上的同名属性
console.log(a.aa); //3

function A() {}
A.prototype = {
  aa: 1
}

function bridge() {};
bridge.prototype = A.prototype;

function B() {}
B.prototype = new bridge();
B.prototype.constructor = B;
var b = new B;
B.prototype.cc = function() {
  alert(3)
}
console.log(b.__proto__ == B.prototype);
//true 这个大家应该都没有疑问
console.log(b.__proto__.__proto__ === A.prototype);
//true  得到父类的原型对象

var P = (function(prototype, ownProperty, undefined) {

    function isObject(o) {
        return typeof o === 'object';
    }

    function isFunction(f) {
        return typeof f === 'function';
    }

    function BareConstructor() {};

    function P(_superclass /* = Object */ , definition) {
        //如果只传一个参数，没有指定父类
        if(definition === undefined) {
            definition = _superclass;
            _superclass = Object;
        }

        //C为我们要返回的子类，definition中的init为用户构造器

        function C() {
            var self = new Bare;
            console.log(self.init)
            if(isFunction(self.init)) self.init.apply(self, arguments);
            return self;
        }

        function Bare() { //这个构造器是为了让C不用new就能返回实例而设的
        }
        C.Bare = Bare;
        //为了防止改动子类影响到父类，我们将父类的原型赋给一个中介者BareConstructor
        //然后再将这中介者的实例作为子类的原型
        var _super = BareConstructor[prototype] = _superclass[prototype];
        var proto = Bare[prototype] = C[prototype] = new BareConstructor; //
        //然后C与Bare都共享同一个原型
        //最后修正子类的构造器指向自身
        proto.constructor = C;
        //类方法mixin,不过def对象里面的属性与方法糅杂到原型里面去
        C.mixin = function(def) {
            Bare[prototype] = C[prototype] = P(C, def)[prototype]; //Bare[prototype] =
            return C;
        }
        //definition最后延迟到这里才起作用
        return(C.open = function(def) {
            var extensions = {};
            //definition有两种形态
            //如果是函数,那么子类原型、父类原型、子类构造器、父类构造传进去，
            //如果是对象则直接置为extensions
            if(isFunction(def)) {
                extensions = def.call(C, proto, _super, C, _superclass);
            } else if(isObject(def)) {
                extensions = def;
            }
            //最后混入子类的原型中
            if(isObject(extensions)) {
                for(var ext in extensions) {
                    if(ownProperty.call(extensions, ext)) {
                        proto[ext] = extensions[ext];
                    }
                }
            }
            //确保init为一个函数
            if(!isFunction(proto.init)) {
                proto.init = _superclass;
            }

            return C;
        })(definition);

        //这里为一个自动执行函数表达式，相当于
        //C.open = function(){/*....*/}
        //C.open(definition)
        //return C;
        //换言之，返回的子类存在三个类成员，Base, mixin, open

    }

    return P; //暴露到全局
})('prototype', ({}).hasOwnProperty);

var Animal = P(function(proto, superProro) {
  proto.init = function(name) { //构造函数
    this.name = name;
  };
  proto.move = function(meters) { //原型方法
    console.log(this.name + " moved " + meters + "m.");
  }
});
var a = new Animal("aaa")
var b = Animal("bbb");//无“new”实例化

a.move(1)
b.move(2)

var Snake = P(Animal, function(snake, animal) {
  snake.init = function(name, eyes) {
    animal.init.call(this, arguments); //调用父类构造器
    this.eyes = 2;
  }
  snake.move = function() {
    console.log("Slithering...");
    animal.move.call(this, 5); //调用父类的同名方法
  };
});
var s = new Snake("snake", 1);
s.move();
console.log(s.name);
console.log(s.eyes);

var Cobra = P(Snake, function(cobra) {
  var age = 1; //私有属性
  //这里还可以编写私有方法
  cobra.glow = function() { //长大
    return age++;
  }	
});
var c = new Cobra("cobra");
console.log(c.glow()); //1
console.log(c.glow()); //2 又长一岁
console.log(c.glow()); //3 又长一岁

var JS = {
    VERSION: '2.2.1'
};

JS.Class = function(classDefinition) {

    //返回目标类的真正构造器
    function getClassBase() {
        return function() {
            //它在里面执行用户传入的构造器construct
            //preventJSBaseConstructorCall是为了防止在createClassDefinition辅助方法中执行父类的construct
            if (typeof this['construct'] === 'function' && preventJSBaseConstructorCall === false) {
                this.construct.apply(this, arguments);
            }
        };
    }
    //为目标类添加类成员与原型成员
    function createClassDefinition(classDefinition) {
        //此对象用于保存父类的同名方法
        var parent = this.prototype["parent"] || (this.prototype["parent"] = {});
        for (var prop in classDefinition) {
            if (prop === 'statics') {
                for (var sprop in classDefinition.statics) {
                    this[sprop] = classDefinition.statics[sprop];
                }
            } else {
    //为目标类添加原型成员，如果是函数，那么检测它还没有同名的超类方法，如果有
                if (typeof this.prototype[prop] === 'function') {
                    var parentMethod = this.prototype[prop];
                    parent[prop] = parentMethod;
                }
                this.prototype[prop] = classDefinition[prop];
            }
        }
    }

    var preventJSBaseConstructorCall = true;
    var Base = getClassBase();
    preventJSBaseConstructorCall = false;

    createClassDefinition.call(Base, classDefinition);

    //用于创建当前类的子类
    Base.extend = function(classDefinition) {

        preventJSBaseConstructorCall = true;
        var SonClass = getClassBase();
        SonClass.prototype = new this();//将一个父类的实例当作子类的原型
        preventJSBaseConstructorCall = false;

        createClassDefinition.call(SonClass, classDefinition);
        SonClass.extend = this.extend;

        return SonClass;
    };
    return Base;
};

var Animal = JS.Class({
  construct: function(name) {
    this.name = name;
  },
  shout: function(s) {
    console.log(s);
  }
});

var animal = new Animal();
animal.shout('animal'); // animal
var Dog = Animal.extend({
  construct: function(name, age) {
    //调用父类构造器
    this.parent.construct.apply(this, arguments);
    this.age = age;
  },
  run: function(s) {
    console.log(s);
  }
});
var dog = new Dog("dog", 4);
console.log(dog.name);
dog.shout("dog"); // dog
dog.run("run"); // run

var Shepherd = Dog.extend({
  statics: { //静态成员
    TYPE: "Shepherd"
  },
  run: function() { //方法链,调用超类同名方法
    this.parent.run.call(this, "fast");
  }
});
console.log(Shepherd.TYPE); //Shepherd
var shepherd = new Shepherd("shepherd", 5);
shepherd.run(); //fast

(function() {
    // /xyz/.test(function(){xyz;})是用于判定函数的toString是否能暴露里面的实现
    // 因为Function.prototype.toString没有做出强制规定如何显示自身，根据浏览器实现而定
    // 如果里面能显示内部内容，那么我们就使用 /\b_super\b/来检测函数里面有没有.super语句
    // 当然这个也不很充分，只是够用的程度；否则就返回一个怎么也返回true的正则
    // 比如一些古老版本的Safari、Mobile Opera与 Blackberry浏览器，无法显示函数体的内容
    // 就需要用到后面的正则
    var initializing = false, fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // 所有人工类的基类
    this.Class = function() {
    };

//这是用于生成目标类的子类
    Class.extend = function(prop) {
        var _super = this.prototype;//保存父类的原型

        //阻止init被触发
        initializing = true;
        var prototype = new this();//创建子类的原型
        //重新打开，方便真实用户可以调用init
        initializing = false;
        //将prop里的东西逐个复制到prototype,如果是函数将特殊处理一下
        //因为复制过程中可能掩盖了超类的同名方法，如果这个函数里面存在_super的字样，就笼统地
        //认为它需要调用父类的同名方法，那么我们需要重写当前函数
        //重写函数运用了闭包，因此fnTest正则检测可以减少我们重写方法的个数，
        //因为不是每个同名函数都会向上调用父类方法
        for (var name in prop) {
            prototype[name] = typeof prop[name] === "function" &&
                    typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                    (function(name, fn) {
                        return function() {
                            var tmp = this._super;//保存到临时变量中
                            //当我们调用时，才匆匆把父类的同方法覆写到_super里
                            this._super = _super[name];
                            //然后才开始执行当前方法（这时里面的this._super已被重写），得到想要的效果
                            var ret = fn.apply(this, arguments);
                            //还原this._super
                            this._super = tmp;
                            //返回结果
                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
        }

        // 这是目标类的真实构造器
        function Class() {
            // 为了防止在生成子类的原型（new this()）时触发用户传入的构造器init
            // 使用initializing进行牵制
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        //将修改好的原型赋值
        Class.prototype = prototype;

        // 确保原型上constructor正确指向自身
        Class.prototype.constructor = Class;

        //添加extend类方法，生于生产它的子类 
        Class.extend = arguments.callee;

        return Class;
    };
})();
创建一个Animal类与一个Dog子类。
var Animal = Class.extend({
  init: function(name) {
    this.name = name;
  },
  shout: function(s) {
    console.log(s);
  }
});

var animal = new Animal();
animal.shout('animal'); // animal
var Dog = Animal.extend({
  init: function(name, age) {
    //调用父类构造器
    this._super.apply(this, arguments);
    this.age = age;
  },
  run: function(s) {
    console.log(s);
  }
});
var dog = new Dog("dog", 4);
console.log(dog.name); //dog
dog.shout("xxx"); // xxx
dog.run("run"); // run
console.log(dog instanceof Dog && dog instanceof Animal);

def("Animal")({
  init: function(name) {
    this.name = name;
  },
  speak: function(text) {
    console.log("this is a " + this.name);
  }
});
var animal = new Animal("Animal");

console.log(animal.name)

def("Dog") < Animal({
  init: function(name, age) {
    this._super(); //魔术般地调用父类
    this.age = age;
  },
  run: function(s) {
    console.log(s)
  }
});
var dog = new Dog("wangwang");
console.log(dog.name); //wangwang

//在命名空间对象上创建子类
var namespace = {}
def(namespace, "Shepherd") < Dog({
  init: function() {
    this._super();
  }
});

var shepherd = new namespace.Shepherd("Shepherd")
console.log(shepherd.name);

var a = {valueOf:function(){
  console.log("aaaaaaa")
}}, b = {valueOf:function(){
  console.log("bbbbbbb")
}}
a < b

function def(name) {
  console.log("def(" + name + ") called")
  var obj = {
    valueOf: function() {
      console.log(name + " (valueOf)")
    }
  }
  return obj
}
def("Dog") < def("Animal");

//https://github.com/RubyLouvre/def.js
(function(global) {
  //deferred是整个库中最重要的构件，扮演三个角色
  //1 def("Animal")时就是返回deferred,此时我们可以直接接括号对原型进行扩展
  //2 在继承父类时 < 触发两者调用valueOf，此时会执行deferred.valueOf里面的逻辑
  //3 在继承父类时， 父类的后面还可以接括号（废话，此时构造器当普通函数使用），当作传送器，
  //  保存着父类与扩展包到_super,_props
  var deferred;

  function extend(source) { //扩展自定义类的原型
    var prop, target = this.prototype;

    for(var key in source)
    if(source.hasOwnProperty(key)) {
      prop = target[key] = source[key];
      if('function' == typeof prop) {
        //在每个原型方法上添加两个自定义属性，保存其名字与当前类
        prop._name = key;
        prop._class = this;
      }
    }

    return this;
  }
  // 一个中介者，用于切断子类与父类的原型连接
  //它会像DVD+R光盘那样被反复擦写

  function Subclass() {}

  function base() {
    // 取得调用this._super()这个函数本身，如果是在init内，那么就是当前类
    //http://larryzhao.com/blog/arguments-dot-callee-dot-caller-bug-in-internet-explorer-9/
    var caller = base.caller;
    //执行父类的同名方法，有两种形式，一是用户自己传，二是智能取当前函数的参数
    return caller._class._super.prototype[caller._name].apply(this, arguments.length ? arguments : caller.arguments);
  }

  function def(context, klassName) {
    klassName || (klassName = context, context = global);
    //偷偷在给定的全局作用域或某对象上创建一个类
    var Klass = context[klassName] = function Klass() {
        if(context != this) { //如果不使用new 操作符，大多数情况下context与this都为window
          return this.init && this.init.apply(this, arguments);
        }
        //实现继承的第二步，让渡自身与扩展包到deferred
        deferred._super = Klass;
        deferred._props = arguments[0] || {};
      }	

      //让所有自定义类都共用同一个extend方法
      Klass.extend = extend;

    //实现继承的第一步，重写deferred，乍一看是刚刚生成的自定义类的扩展函数
    deferred = function(props) {
      return Klass.extend(props);
    };

    // 实现继承的第三步，重写valueOf，方便在def("Dog") < Animal({})执行它
    deferred.valueOf = function() {

      var Superclass = deferred._super;

      if(!Superclass) {
        return Klass;
      }
      // 先将父类的原型赋给中介者，然后再将中介者的实例作为子类的原型
      Subclass.prototype = Superclass.prototype;
      var proto = Klass.prototype = new Subclass;
      // 引用自身与父类
      Klass._class = Klass;
      Klass._super = Superclass;
      //一个小甜点，方便人们知道这个类叫什么名字
      Klass.toString = function() {
        return klassName;
      };
      //强逼原型中的constructor指向自身
      proto.constructor = Klass;
      //让所有自定义类都共用这个base方法，它是构成方法链的关系
      proto._super = base;
      //最后把父类后来传入的扩展包混入子类的原型中
      deferred(deferred._props);
    };

    return deferred;
  }

  global.def = def;
}(this));

var obj = {
  aa: 1,
  toString: function() {
    return "1"
  }
}
if(Object.defineProperty && Object.seal) {
  Object.defineProperty(obj, "name", {
    value: 2
  })
}
console.log(Object.getOwnPropertyNames(obj));//["aa", "toString", "name"]
console.log(Object.keys(obj));//["aa", "toString"]

function fn(aa, bb) {};
console.log(Object.getOwnPropertyNames(fn));//["prototype","length","name","arguments","caller"]
console.log(Object.keys(fn));//[]
var reg = /\w{2,}/i

console.log(Object.getOwnPropertyNames(reg));//["lastIndex","source","global","ignoreCase","mnltiline","sticky"]
console.log(Object.keys(reg));//[]

console.log(Object.getPrototypeOf(function() {}) == Function.prototype); //true
console.log(Object.getPrototypeOf({}) === Object.prototype); //true

var obj = { x : 1 };

var obj = Object.create(Object.prototype, 
  { x : {
    value : 1,          
    writable : true,     
    enumerable : true,   
    configurable : true  
  }}
)

var obj = {}; 
Object.defineProperty(obj, "a", {
  value: 37,
  writable: true,
  enumerable: true,
  configurable: true
});

console.log(obj.a);//37
obj.a = 40;
console.log(obj.a);//40 
var name = "xxx"
for(var i in obj){
    name = i
}
console.log(name);//a

Object.defineProperty(obj, "a", {
  value: 55,
  writable: false,
  enumerable: false,
  configurable: true
});

console.log(obj.a);//55
obj.a = 50;
console.log(obj.a);//55 
name = "b";
for(var i in obj){
    name = i
}
console.log(name);//b
 

var value = "RubyLouvre";
Object.defineProperty(obj, "b", {
  set: function(a){
    value = a;
  },
  get: function(){
    return value + "!"
  }
});

console.log(obj.b);//RubyLouvre!
obj.b = "bbb";
console.log(obj.b);//bbb!

var obj = Object.defineProperty( {} , 'a', {
  value: "aaa"
});
delete obj.a;//configurable默认为false,此属性不能删除
console.log(obj.a);//aaa

var arr = [];
//添加一个属性，但由于是数字字面量，它又会作为数组的第一个元素
Object.defineProperty(arr, '0', {value : "零"});
Object.defineProperty(arr, 'length', {value : 10});
//删除第一个元素，但由于length的writable在上面被我们设置为false(不写默认为false)，因此改不了。
arr.length = 0 ;
alert([arr.length, arr[0]]);//正确应该输出 “1,零”
//IE9、IE10：“1,零”
//Firefox4～Firefox19：抛内部错误，说当前不支持定义length属性
//Safari5.0.1：“0, ”，第二值应该是undefined，说明它忽略了writable为false的默认设置，让arr.length把第一个元素删掉了
//Chrome14-：“0,零”，估计后面的“零”是作为属性打印出来，chrome24与标准保持一致。


Object.prototype.set = undefined
var obj = {};
Object.defineProperty(obj, "aaa", { value: "OK" });
//TypeError: property descriptor's getter field is neither undefined nor a function

Object.prototype.get = function(){};
var obj = {};
Object.defineProperty(obj,  "aaa", { value: "OK" });
//TypeError: property descriptors must not specify a value or be writable when a getter or setter has been specified

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function defineProperty(obj, key, desc) {
//创建一个纯空对象，不继承Object.prototype，跳过那些粗糙的for in遍历BUG
  var d = Object.create(null);
  d.configurable = hasOwn(desc,"configurable");
  d.enumerable = hasOwn(desc, "enumrable");
  if (hasOwn(desc, "value")) {
    d.writable = hasOwn(desc, "writable") 
    d.value = desc.value;
  } else {
    d.get = hasOwn(desc, "get") ? desc.get : undefined;
    d.set = hasOwn(desc, "set") ? desc.set : undefined;
  }
  return Object.defineProperty(obj, key, d);
}
var obj = {};
defineProperty(obj, "aaa", { value: "OK" });//save!

if(typeof  Object.defineProperty!=='function'){
    Object.defineProperty = function(obj, prop, desc) {
        if ('value' in desc) {
            obj[prop] = desc.value;
        }
        if ('get' in desc) {
            obj.__defineGetter__(prop, desc.get);
        }
        if ('set' in desc) {
            obj.__defineSetter__(prop, desc.set);
        }
        return obj;
    };
}
if(typeof  Object.defineProperties!=='function'){
    Object.defineProperties = function(obj, descs) {
        for (var prop in descs) {
            if (descs.hasOwnProperty(prop)) {
                Object.defineProperty(obj, prop, descs[prop]);
            }
        }
        return obj;
    };
}

var obj = {};
Object.defineProperties(obj, {
  "value": {
    value: true,
    writable: false
  },
  "name": {
    value: "John",
    writable: false
  }
});
var a = 1;
for(var p in obj) {
  a = p;
}
console.log(a);//1

var obj = {},
  value = 0
  Object.defineProperty(obj, "aaa", {
    set: function(a) {
      value = a;
    },
    get: function() {
      return value
    }
  });
//一个包含set, get, configurable, enumerable的对象
console.log(Object.getOwnPropertyDescriptor(obj, "aaa"));
console.log(typeof obj.aaa);//number
console.log(obj.hasOwnProperty("aaa"));//true


(function() {
//一个包含value, writable, configurable, enumerable的对象
  console.log(Object.getOwnPropertyDescriptor(arguments, "length"))
})(1, 2, 3);

function mixin(receiver, supplier) {
    if (Object.getOwnPropertyDescriptor) {
        Object.keys(supplier).forEach(function(property) {
            Object.defineProperty(receiver, property, Object.getOwnPropertyDescriptor (supplier, property));
        });
    } else {
        for (var property in supplier) {
            if (supplier.hasOwnProperty(property)) {
                receiver[property] = supplier[property];
            }
        }
    }
}

if(typeof  Object.create !== 'function') {
  Object.create = function(prototype, descs) {
    function F() {}
    F.prototype = prototype;
    var obj = new F();
    if(descs != null) {
      Object.defineProperties(obj, descs);
    }
    return obj;
  };
}
function Animal(name) {
  this.name = name
}
Animal.prototype.getName = function() {
  return this.name;
}

function Dog(name, age) {
  Animal.call(this, name);
  this.age = age;
}
Dog.prototype = Object.create(Animal.prototype, {
  getAge: {
    value: function() {
      return this.age;
    }
  },
  setAge: {
    value: function(age) {
      this.age = age;
    }
  }
});

var dog = new Dog("dog", 4);
console.log(dog.name);//dog
dog.setAge(6);
console.log(dog.getAge());//6

//https://github.com/kriskowal/es5-shim/blob/master/es5-sham.js
var createEmpty;
var supportsProto = Object.prototype.__proto__ === null;
if(supportsProto || typeof document == 'undefined') {
  createEmpty = function() {
    return {
      "__proto__": null
    };
  };
} else {
  // 因为我们无法让一个对象继承自一个不存在的东西，它最后肯定要回溯到
  //Object.prototype，那么我们就从一个新的执行环境中盗取一个Object.prototype，
  //把它的所有原型属性都砍掉，这样它的实例就既没有特殊属性，也没有什么原型属性
  //（只剩下一个__proto__，值为null）
  createEmpty = (function() {
    var iframe = document.createElement('iframe');
    var parent = document.body || document.documentElement;
    iframe.style.display = 'none';
    parent.appendChild(iframe);
    iframe.src = 'javascript:';
    var empty = iframe.contentWindow.Object.prototype;
    parent.removeChild(iframe);
    iframe = null;
    delete empty.constructor;
    delete empty.hasOwnProperty;
    delete empty.propertyIsEnumerable;
    delete empty.isPrototypeOf;
    delete empty.toLocaleString;
    delete empty.toString;
    delete empty.valueOf;
    empty.__proto__ = null;

    function Empty() {}
    Empty.prototype = empty;

    return function() {
      return new Empty();
    };
  })();
}
var a = {
  aa: "aa"
};
Object.preventExtensions(a)
a.bb = 2;
console.log(a.bb);		//undefined 添加本地属性失败
a.aa = 3;
console.log(a.aa);		//3  允许它修改原有属性
delete a.aa;
console.log(a.aa); 		//undefined 但允许它删除已有属性
Object.prototype.ccc = 4;
console.log(a.ccc);		//4  不能阻止它增添原型属性
a.aa = 5;
console.log(a.bb);		//undefined ，不吃回头草，估计里面是以白名单方式实现的

var a = {
  aa: "aa"
};
Object.seal(a)
a.bb = 2;
console.log(a.bb);		//undefined 添加本地属性失败
a.aa = 3;
console.log(a.aa);		//3   允许它修改已有属性
delete a.aa;
console.log(a.aa); 		//3  但不允许它删除已有属性

var a = {
  aa: "aa"
};
Object.freeze(a)
a.bb = 2;
console.log(a.bb);		//undefined 添加本地属性失败
a.aa = 3;
console.log(a.aa);		//aa   允许它修改已有属性
delete a.aa;
console.log(a.aa);		//aa  但不允许它删除已有属性

Object.isExtensible(object);
Object.isSealed(object);
Object.isFrozen(object);

(function(global) {
  function fixDescriptor(item, definition, prop) {
    // 如果以标准defineProperty的第三个参数的形式定义扩展包
    if(isPainObject(item)) {
      if(!('enumerable' in item)) {
        item.enumerable = true;
      }
    } else { //如果是以es3那样普通对象定义扩展包
      item = definition[prop] = {
        value: item,
        enumerable: true,
        writable: true
      };
    }
    return item;
  }

  function isPainObject(item) {
    if(typeof item === 'object' && item !== null) {
      var a = Object.getPrototypeOf(item);
      return a === Object.prototype || a === null;
    }
    return false;
  }
  var funNames = Object.getOwnPropertyNames(Function);
  global.Class = {
    create: function(superclass, definition) {
      if(arguments.length === 1) {
        definition = superclass;
        superclass = Object;
      }
      if(typeof superclass !== "function") {
        throw new Error("superclass must be a function");
      }
      var _super = superclass.prototype;
      var statics = definition.statics;
      delete definition.statics;
      //重新调整definition
      Object.keys(definition).forEach(function(prop) {
        var item = fixDescriptor(definition[prop], definition, prop);
        if(typeof item.value === "function" && typeof _super[prop] === "function") {
          var __super = function() { //创建方法链
              return _super[prop].apply(this, arguments);
            };
          var __superApply = function(args) {
              return _super[prop].apply(this, args);
            };
          var fn = item.value;
          item.value = function() {
            var t1 = this._super;
            var t2 = this._superApply;
            this._super = __super;
            this._superApply = __superApply;
            var ret = fn.apply(this, arguments);
            this._super = t1;
            this._superApply = t2;
            return ret;
          }
        }
      });
      var Base = function() {
          this.init.apply(this, arguments);
        };
      Base.prototype = Object.create(_super, definition);
      Base.prototype.constructor = Base;
      //确保一定存在init方法
      if(typeof Base.prototype.init !== "function") {
        Base.prototype.init = function() {
          superclass.apply(this, arguments);
        };
      }
      if(Object !== superclass) { //继承父类的类成员
        Object.getOwnPropertyNames(superclass).forEach(function(name) {
          if(funNames.indexOf(name) === -1) {
            Object.defineProperty(Base, name, Object.getOwnPropertyDescriptor(superclass, name));
          }
        });
      }
      if(isPainObject(statics)) { //添加自身的类成员
        Object.keys(statics).forEach(function(name) {
          if(funNames.indexOf(name) === -1) {
            Object.defineProperty(Base, name, fixDescriptor(statics[name], statics, name));
          }
        });
      }
      return Object.freeze(Base);
    }
  }

})(this)

var Dog = Class.create(Animal, {
  statics: {
    Name: "Dog",
    type: "shepherd"
  },
  init: function(name, age) {
    this._super(name);
    //或者 this._superApply(arguments)
    this.age = age;
  },
  getName: function() {
    return this._super() + "!"
  },
  getAge: function() {
    return this.age
  },
  setAge: function(age) {
    this.age = age
  }
});
var dog = new Dog("dog", 12)
console.log(dog.getName()); //dog!
console.log(dog.getAge()); //12
console.log(dog instanceof Animal); //true
console.log(Dog.Name); //Dog



