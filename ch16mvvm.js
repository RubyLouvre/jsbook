/* 
 <p>Your value: <input data-bind="value: someValue, valueUpdate: 'afterkeydown'"/></p>
 <p>You have typed: <span data-bind="text: someValue"></span></p> 
 <script type="text/javascript">
 var viewModel = {
 someValue: ko.observable("edit me")
 };
 </script>
 
 */


//监控属性的实现
ko.observable = function(initialValue) {
    var _latestValue = initialValue; //重点
    function observable() {
        if (arguments.length > 0) {
            // setter 只有值不同时才发出通知
            if ((!observable['equalityComparer']) || !observable['equalityComparer'](
                    _latestValue, arguments[0])) {
                observable.valueWillMutate(); //通知订阅者
                _latestValue = arguments[0];
                if (DEBUG)
                    observable._latestValue = _latestValue;
                observable.valueHasMutated(); //通知订阅者
            }
            return this; // Permits chained assignments
        }
        else {
            // getter
            ko.dependencyDetection.registerDependency(observable);
            // 收集订阅者，这个工作每次都执行
            return _latestValue;
        }
    }
//这个通常情况不外泄
    if (DEBUG)
        observable._latestValue = _latestValue;
    //怎么也要执行一次，目的是收集订阅，方便派发报纸
    ko.subscribable.call(observable);
    //添加观察者模式必要的装备
    observable.peek = function() {
        return _latestValue
    };
    observable.valueHasMutated = function() {
        observable["notifySubscribers"](_latestValue);
    }
    observable.valueWillMutate = function() {
        observable["notifySubscribers"](_latestValue, "beforeChange");
    }
    ko.utils.extend(observable, ko.observable['fn']);
    ko.exportProperty(observable, 'peek', observable.peek);
    ko.exportProperty(observable, "valueHasMutated", observable.valueHasMutated);
    ko.exportProperty(observable, "valueWillMutate", observable.valueWillMutate);
    return observable;
}

App.Person = Ember.Object.extend({
    firstName: null,
    lastName: null,
    fullName: function() {
        return this.get('firstName') +
                " " + this.get('lastName');
    }.property('firstName', 'lastName')
});

//angular将字符串转换为函数的部分代码
$watch = function(watchExp, listener, objectEquality) {
    var scope = this,
            get = compileToFn(watchExp, 'watch'),
            array = scope.$$watchers,
            watcher = {
        fn: listener,
        last: initWatchVal,
        get: get,
        exp: watchExp,
        eq: !!objectEquality
    };
    // in the case user pass string, we need to compile it, do we really need this ?
    if (!isFunction(listener)) {
        var listenFn = compileToFn(listener || noop, 'listener');
        watcher.fn = function(newVal, oldVal, scope) {
            listenFn(scope);
        };
    }

    if (!array) {
        array = scope.$$watchers = [];
    }
// we use unshift since we use a while loop in $digest for speed.
// the while loop reads in reverse order.
    array.unshift(watcher);
    return function() {
        arrayRemove(array, watcher);
    };
}

function compileToFn(exp, name) {
    var fn = $parse(exp);
    assertArgFn(fn, name);
    return fn;
}
/*
 <div ng-controller="Ctrl">
 Enter name: <input type="text" ng-model="name"><br>
 Hello <span ng-bind="name"></span>!
 </div>
 */
function Ctrl($scope) {
    $scope.name = 'Whirled';
}

var name, oldValue, val
get = function() {
    oldValue = this[name];
    //这里用于收集订阅者，订阅者为调用这个get方法的某个视图函数
    //由于这个get事实上可能被包几层，因此可能是caller.caller.caller
    //这需要更高的技术来收集，这里只是假设
    Observer.bind(name, arguments.callee.caller);
    return oldValue
}

set = function(val) {
    if (oldValue !== val) {//不一样就重写oldValue
        oldVal = val
        Observer.fire(this, name, val);//通知订阅者更新
    }
}
avalon.define("user", [], function(vm) {
    vm.firstName = "司徒"//监控属性
    vm.lastName = "正美" //监控属性
    //计算属性
    //一个包含set或get的对象方便加工为Object.defineProperties的第2个参数
    vm.fullName = {
        set: function(val) {
            var array = (val || "").split(" ");
            this.firstName = array[0] || "";
            this.lastName = array[1] || "";
        },
        get: function() {
            return this.firstName + " " + this.lastName;
        }
    }
})

avalon.define(function(vm) {
    vm.salutation = 'Hello';
    vm.name = 'World';
    vm.greet = function() {
        vm.greeting = vm.salutation + ' ' + vm.name + '!';
    }
})

//第1阶段，在循环中拼凑出一个这样的对象
var description = {
    salutation: {
        set: accessor1,
        get: accessor1,
        enumerable: true
    },
    name: {
        set: accessor2,
        get: accessor2,
        enumerable: true
    }
}
//第2阶段，得到一个充满访问器的对象
var viewmodel = {}
if (Object.defineProperties) {
    Object.defineProperties(viewmodel, description)
} else {
    //names包含原model所有属性名,方法名及你以后打算动态添加的属性名\方法名
    viewmodel = Object.defineProperties(description, names)
}
//第3个阶段，赋值与填充函数
viewmodel.salutation = vm.salutation;
viewmodel.name = vm.name;
viewmodel.greet = vm.greet
viewmodel.$id = "xsddfsdrfr" //一个UUID

avalon.define = function(name, deps, factory) {
    var args = [].slice.call(arguments);
    if (typeof name !== "string") {
        name = !avalon.models["root"] ? "root" : modleID();
        args.unshift(name);
    }
    if (!Array.isArray(args[1])) {
        args.splice(1, 0, []);
    }
    deps = args[1];
    if (typeof args[2] !== "function") {
        avalon.error("factory必须是函数");
    }
    factory = args[2];
    var scope = {};
    deps.unshift(scope);
    factory(scope); 					//得到所有属性与方法
    var model = modelFactory(scope); 		//得到ViewModel
    stopRepeatAssign = true;				//阻止已经初始化的监控属性在这时被赋值
    deps[0] = model;
    factory.apply(0, deps); 				//重置所有函数中的scope
    deps.shift();
    stopRepeatAssign = false;
    model.$id = name;      				//重置ID
    return avalon.models[name] = model;	//全部保存起来，方便以后查找
};
function modelFactory(scope) {
    var skipArray = scope.$skipArray,
            description = {},
            model = {},
            callSetters = [],
            callGetters = [],
            VBPublics = [];
    skipArray = Array.isArray(skipArray) ? skipArray : [];
    avalon.Array.ensure(skipArray, "$skipArray");
    forEach(scope, function(name, value) {
        if (typeof value === "function") {
            VBPublics.push(name);
        } else {
            if (skipArray.indexOf(name) !== -1) {
                return VBPublics.push(name);
            }
            if (name.charAt(0) === "$") {
                if (skipArray.indexOf(name) !== -1) {
                    return VBPublics.push(name);
                }
            }
            var accessor, oldValue, oldArgs;
            if (value && typeof value === "object" && typeof value.get === "function"
                    && Object.keys(value).length <= 2) {
                accessor = function(neo) { //创建计算属性
                    if (arguments.length) {
                        if (stopRepeatAssign) {
                            return; //阻止重复赋值
                        }
                        if (typeof value.set === "function") {
                            value.set.call(model, neo);
                        }
                        if (oldArgs !== neo) {
                            oldArgs = neo;
                            notifySubscribers(accessor); //通知订阅者改变
                        }
                    } else {
                        if (openComputedCollect) {
                            collectSubscribers(accessor);
                        }
                        oldValue = value.get.call(model);
                        return oldValue;
                    }
                };
                //这里用到ecma262v5的Function.prototype.bind
                callGetters.push(function() {
                    var fn = this;
                    Publish[expose] = fn;
                    fn();
                    delete Publish[expose];
                }.bind(accessor));
            } else {
                callSetters.push(name);
                accessor = function(neo) { //创建监控属性或数组
                    if (arguments.length) {
                        if (stopRepeatAssign) {
                            return; //阻止重复赋值
                        }
                        if (oldValue != neo) {
                            oldValue = neo;
                            notifySubscribers(accessor); //通知订阅者改变
                        }
                    } else {
                        collectSubscribers(accessor); //收集视图函数
                        return oldValue;
                    }
                };
            }
            accessor[subscribers] = [];
            description[name] = {
                set: accessor,
                get: accessor,
                enumerable: true
            };
        }
    });
    if (defineProperties) {
        defineProperties(model, description);
    } else {
        model = VBDefineProperties(description, VBPublics);
    }
    VBPublics.forEach(function(name) {
        model[name] = scope[name];
    });
    callSetters.forEach(function(prop) {
        model[prop] = scope[prop]; //为空对象赋值
    });
    callGetters.forEach(function(fn) {
        fn(); //为空对象赋值
    });
    model.$id = generateID();
    return model;
}


avalon.Array = {
    ensure: function(target) {
        var args = [].slice.call(arguments, 1);
        args.forEach(function(el) {
            if (target.indexOf(el) === -1) {
                target.push(el);
            }
        });
        return target;
    }
}

var generateID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
;
function generateId() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
;

var start = new Date - 0;
function generateID() {
    return (start++).toString(36)
}

var uid = ['0', '0', '0'];
function generateID() {
    var index = uid.length;
    var digit;

    while (index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
}

function generateID() {
    return setTimeout("1") + ""
}

var defineProperty = Object.defineProperty;
try {
    defineProperty({}, "_", {
        value: "x"
    });
    var defineProperties = Object.defineProperties;
} catch (e) {//否则使用__defineGetter__
    if ("__defineGetter__" in avalon) {
        defineProperty = function(obj, prop, desc) {
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
        defineProperties = function(obj, descs) {
            for (var prop in descs) {
                if (descs.hasOwnProperty(prop)) {
                    defineProperty(obj, prop, descs[prop]);
                }
            }
            return obj;
        };
    }
}
//最次的方案，使用VBScript，想看明这代码要学些VBScript，相关链接见下。
//http://webreflection.blogspot.com/2011/02/btw-getters-setters-for-ie-6-7-and-8.html
if (!defineProperties && window.VBArray) {
    window.execScript([
        "Function parseVB(code)",
        "\tExecuteGlobal(code)",
        "End Function"].join("\n"), "VBScript");
    function VBMediator(description, name, value) {
        var fn = description[name] && description[name].set;
        if (arguments.length === 3) {
            fn(value);//setter
        } else {
            return fn();//getter
        }
    }

    function VBDefineProperties(description, publics) {
        publics = publics.concat();
        avalon.Array.ensure(publics, "hasOwnProperty");
        avalon.Array.ensure(publics, "$id");
        var className = "VBClass" + setTimeout("1"),
                owner = {}, buffer = [];
        buffer.push(
                "Class " + className,
                "\tPrivate [__data__], [__proxy__]",
                "\tPublic Default Function [__const__](d, p)",
                "\t\tSet [__data__] = d: set [__proxy__] = p",
                "\t\tSet [__const__] = Me", //链式调用
                "\tEnd Function");
        publics.forEach(function(name) { //添加公共属性,如果此时不加以后就没机会了
            owner[name] = true; //因为VBScript对象不能像JavaScript那样随意增删属性
            buffer.push("\tPublic [" + name + "]"); //你可以预先放到skipArray中
        });
        Object.keys(description).forEach(function(name) {
            owner[name] = true;
            buffer.push(
                    //由于不知对方会传入什么,因此set、let都用上
                    "\tPublic Property Let [" + name + "](val)", //setter
                    "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                    "\tEnd Property",
                    "\tPublic Property Set [" + name + "](val)", //setter
                    "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                    "\tEnd Property",
                    "\tPublic Property Get [" + name + "]", //getter
                    "\tOn Error Resume Next",
                    //必须优先使用set语句,否则它会误将数组当字符串返回
                    "\t\tSet[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                    "\tIf Err.Number <> 0 Then",
                    "\t\t[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                    "\tEnd If",
                    "\tOn Error Goto 0",
                    "\tEnd Property");
        });
        buffer.push("End Class"); //类定义完毕
        buffer.push(
                "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                "\tDim o",
                "\tSet o = (New " + className + ")(a, b)",
                "\tSet " + className + "Factory = o",
                "End Function");
        // console.log(buffer.join("\r\n"));
        window.parseVB(buffer.join("\r\n"));
        var model = window[className + "Factory"](description, VBMediator);
        model.hasOwnProperty = function(name) {
            return owner[name] === true;
        };
        return model;
    }
}

function collectSubscribers(accessor) {
    if (Publish[expose]) {
        var list = accessor[subscribers];
        //只有数组不存在此元素时才push进去
        list && avalon.Array.ensure(list, Publish[expose]);
    }
}
//通知依赖于这个访问器的订阅者更新自身
function notifySubscribers(accessor) {
    var list = accessor[subscribers]
    if (list && list.length) {
        var args = aslice.call(arguments, 1)
        var safelist = list.concat()
        for (var i = 0, fn; fn = safelist[i++]; ) {
            var el = fn.element,
                    state = fn.state,
//state是来自它的父节点，用于此元素移出DOM树但又不想它的订阅函数被删除的情况
                    remove
            if (el && (!state || state.sourceIndex !== 0)) {
//IE6～IE11通过sourceIndex是否为零判定是否在DOM树
                if (typeof el.sourceIndex == "number") {
                    remove = el.sourceIndex === 0
                } else {
                    try {//尝试使用contains方法
                        remove = !root.contains(el)
                    } catch (e) { //如果不存在contains方法
                        remove = true
                        while (el == el.parentNode) {
                            if (el === root) {
                                remove = false
                                break
                            }
                        }
                    }
                }
            }
            if (remove) {
                avalon.Array.remove(list, fn)
            } else {
                fn.apply(0, args) //强制重新计算自身
            }
        }
    }
}
function val() {
    return vm.firstName
}
function updateView() {
    node.innerHTML = val();
}
avalon.scan = function(elem, scope) {
    elem = elem || document.documentElement;
    var scopes = scope ? [scope] : [];
    scanTag(elem, scopes, elem.ownerDocument || document);
};

function scanTag(elem, scopes, doc) {
    scopes = scopes || [];
    var a = elem.getAttribute(prefix + "skip");
    var b = elem.getAttribute(prefix + "important");
    var c = elem.getAttribute(prefix + "controller");
    //这三个绑定优先处理，其中a > b > c
    if (typeof a === "string") {
        return;
    } else if (b) {
        if (!avalon.models[b]) {
            return;
        } else {
            scopes = [avalon.models[b]];
            elem.removeAttribute(prefix + "important");
        }
    } else if (c) {
        var newScope = avalon.models[c];
        if (!newScope) {
            return;
        }
        scopes = [newScope].concat(scopes);
        elem.removeAttribute(prefix + "controller");
    }
    scanAttr(elem, scopes); //扫描特点节点
    if (elem.canHaveChildren === false || !stopScan[elem.tagName]) {
        var textNodes = [];
        for (var node = elem.firstChild; node; node = node.nextSibling) {
            if (node.nodeType === 1) {
                scanTag(node, scopes, doc); //扫描元素节点
            } else if (node.nodeType === 3) {
                textNodes.push(node);
            }
        }
        for (var i = 0; node = textNodes[i++]; ) { //延后执行
            scanText(node, scopes, doc); //扫描文本节点
        }
    }
}
var stopScan =
        avalon.oneObject("area,base,basefont,br,col,hr,img,input,link,meta,param,embed,wbr,script,style,textarea");
//扫描元素节点中直属的文本节点，并进行抽取

function scanText(textNode, scopes, doc) {
    var bindings = extractTextBindings(textNode, doc);
    if (bindings.length) {
        executeBindings(bindings, scopes);
    }
}
function scanAttr(el, scopes) {
    var bindings = [];
    for (var i = 0, attr; attr = el.attributes[i++]; ) {
        if (attr.specified) {
            var isBinding = false,
                    remove = false;
            if (attr.name.indexOf(prefix) !== -1) { //如果是以指定前缀命名的
                var type = attr.name.replace(prefix, "");
                if (type.indexOf("-") > 0) {
                    var args = type.split("-");
                    type = args.shift();
                }
                remove = true;
                isBinding = typeof bindingHandlers[type] === "function";
            } else if (bindingHandlers[attr.name] && hasExpr(attr.value)) {
                type = attr.name; //如果只是普通属性，但其值是个插值表达式
                isBinding = true;
            }
            if (isBinding) {
                bindings.push({
                    type: type,
                    args: args || [],
                    element: el,
                    remove: remove,
                    node: attr,
                    value: attr.nodeValue
                });
            }
        }
    }
    executeBindings(bindings, scopes);
}
//对于 ms-each-post="posts"，抽取得到
var binding = {
    type: type, //"each"
    args: args || [], //["post"]
    element: el, //此特性节点所在元素节点
    remove: remove, //是否可以删除，
    node: attr, //特性节点
    value: attr.nodeValue//"posts"
};
var trimText = data.value.trim();//data为bindings数组的一个元素
for (var i = 0, obj; obj = scopes[i++]; ) {
    if (obj.hasOwnProperty(trimText)) {
        target = obj;
        break;
    }
}
if (target) {
    updateView = function() {
        callback(target[trimText]);
    };
}
function fn(root1367310833258) {
    with (root1367310833258) {
        var ret1367310833258 = posts.size();
    }
    return ret1367310833258;
}
data.compileFn = fn;

updateView = function() {
    var fn = data.compileFn;
    val = fn.apply(fn, scopeLists);
    callback(val);
};

avalon.bindingHandlers.visible = function(data, scopes) {
    var element = data.element;
    watchView(data.value, scopes, data, function(val) {
        element.style.display = val ? "block" : "none";
    });
};

function watchView(text, scopes, data, callback, tokens) {
    var updateView, target;
    var trimText = text.trim();
    //创建一个updateView
    updateView = function() {
        //略
    };
    //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
    //将它移出订阅者列表
    updateView.element = data.element;
    Publish[expose] = updateView;//暴光此函数,方便collectSubscribers收集
    openComputedCollect = true;
    updateView();
    openComputedCollect = false;
    delete Publish[expose];
}

https://github.com/RubyLouvre/mass-Framework/blob/1.4/avalon.js
        if (oldArgs !== neo) {
    if (Array.isArray(neo)) {
        if (oldValue && oldValue.isCollection) {
            updateCollection(oldValue, neo);
        } else {
            oldValue = Collection(neo);
        }
    } else if (avalon.type(neo) === "Object") {
        if (oldValue && oldValue.$id) {
            updateModel(oldValue, neo);
        } else {
            oldValue = modelFactory(neo);
        }
    } else {
        oldValue = neo;
    }
    notifySubscribers(accessor); //通知顶层改变
    model.$events && model.$fire(name, neo, oldValue);
}
function convert(val) {//转换数组元素为一个个ViewModel
    if (Array.isArray(val)) {
        return val.$id ? val : Collection(val);
    } else if (avalon.type(val) === "Object") {
        return val.$id ? val : modelFactory(val);
    } else {
        return val;
    }
}
function Collection(list) {
    var collection = list.map(convert);
    collection.$id = generateID();//这个用于标识它是个监控对象
    collection[subscribers] = []; //订阅者列表
    collection.isCollection = true;
    var dynamic = modelFactory({
        length: list.length //用于监控数组长度的变化
    });
    "push,pop,shift,unshift,splice".replace(rword, function(method) {
        var nativeMethod = Array.prototype[method];
        collection[method] = function() {
            var len = this.length;
            var args = [].slice.call(arguments);
            if (/push|unshift|splice/.test(method)) {
                args = args.map(convert);				//处理新增元素
            }
            var ret = nativeMethod.apply(this, args);	//调用原生方法
            notifySubscribers(this, method, args, len);//向视图刷新函数发出消息
            dynamic.length = this.length;
            return ret;
        };
    });
    "sort,reverse".replace(rword, function(method) {
//.......略.......
    });
    collection.clear = function() {
//.......略.......
    };
    collection.update = function() { //强制刷新页面
        notifySubscribers(this, "update", []);
        return this;
    };
    collection.size = function() {
        return dynamic.length;
    };
    collection.remove = function(item) {
//.......略.......
    };
    collection.removeAt = function(index) {
//.......略.......
    };
    collection.removeAll = function(all) {
//.......略.......;
    };
    return collection;
}
bindingHandlers["each"] = function(data, scopes) {
    var list = parseExpr(data.value, scopes, data);
    //…………略………………
    function updateListView(method, args, len) {
        switch (method) {
            case "push":
                //略。这里进行DOM操作
                break;
            case "unshift":
                //略
                break;
            case "pop":
                //略
                break;
            case "shift":
                //略
                break;
            case "splice":
                //略
                break;
            case "clear":
                //略
                break;
            case "update":
                //略
                break;
        }
    }
    if ((list || {}).isCollection) {
        list[subscribers].push(updateListView);
    }
};
function findIndex(elem, index) { //寻找路标
    for (var node = elem.firstChild; node; node = node.nextSibling) {
        if (node.id === node.nodeValue + index) {
            return node;
        }
    }
}

function resetIndex(elem, name) { //重置路标
    var index = 0;
    for (var node = elem.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === 8 && node.nodeValue === name) {
            if (node.id !== name + index) {
                node.id = name + index;
                node.$scope.$index = index;
            }
            index++;
        }
    }
}
var nextTick;
if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    nextTick = setImmediate.bind(window);
} else {
    (function() { //否则用一个链表来维护所有待执行的回调
        var head = {
            task: void 0,
            next: null
        };
        var tail = head;
        var maxPendingTicks = 2;
        var pendingTicks = 0;
        var queuedTasks = 0;
        var usedTicks = 0;
        var requestTick = void 0;

        function onTick() {
            --pendingTicks;
            if (++usedTicks >= maxPendingTicks) {
                usedTicks = 0;
                maxPendingTicks *= 4;
                var expectedTicks = queuedTasks && Math.min(
                        queuedTasks - 1,
                        maxPendingTicks);
                while (pendingTicks < expectedTicks) {
                    ++pendingTicks;
                    requestTick();
                }
            }

            while (queuedTasks) {
                --queuedTasks;
                head = head.next;
                var task = head.task;
                head.task = void 0;
                task();
            }

            usedTicks = 0;
        }
        nextTick = function(task) {
            tail = tail.next = {
                task: task,
                next: null
            };
            if (
                    pendingTicks < ++queuedTasks && pendingTicks < maxPendingTicks) {
                ++pendingTicks;
                requestTick();
            }
        };
        //然后找一个最快响应的异步API来执行这个链表,像烧爆竹那样收拾它们
        //你可以用postMessage、image.onerror、xhr.onreadychange、MutationObserver 
        //最差还有个setTimeout 0殿后，见http://jsperf.com/postmessage
        if (typeof MessageChannel !== "undefined") { //管道通信API
            var channel = new MessageChannel();
            channel.port1.onmessage = onTick;
            requestTick = function() {
                channel.port2.postMessage(0);
            };
        } else {
            requestTick = function() { //IE6-8
                setTimeout(onTick, 0);
            };
        }
    })();
}
avalon.nextTick = nextTick;
