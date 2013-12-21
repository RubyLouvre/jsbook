function throwError() {
    throw new Error('ERROR');
}
try {
    setTimeout(throwError, 3000);
} catch (e) {
    alert(e);//这里的异常无法捕获
}
function test(count, ms) {
    var c = 1;
    var time = [new Date() * 1];
    var id = setTimeout(function() {
        time.push(new Date() * 1);
        c += 1;
        if (c <= count) {
            setTimeout(arguments.callee, ms);
        } else {
            clearTimeout(id);
            var tl = time.length;
            var av = 0;
            for (var i = 1; i < tl; i++) {
                var n = time[i] - time[i - 1]; //收集每次与上一次相差的时间数
                av += n;
            }
            alert(av / count); // 求取平均值
        }
    }, ms);
}
winod.onload = function() {
    var id = setTimeout(function() {
        test(100, 1);
        clearTimeout(id);
    }, 3000);
}

var orig_setTimeout = window.setTimeout;
window.setTimeout = function(fun, wait) {
    if (wait < 15) {
        orig_setTimeout(fun, wait);
    } else {
        var img = new Image();
        img.onload = img.onerror = function() {
            fun();
        };
        img.src = "data:,foo";
    }
};


window.onload = function() {
    var a = new Date - 0;
    setTimeout(function() {
        alert(new Date - a);
    });
    var flag = 0;
    var b = new Date,
            text = ""
    var id = setInterval(function() {
        flag++;
        if (flag > 4) {
            clearInterval(id)
            console.log(text)
        }
        text += (new Date - b + " ");
        b = new Date
    })
}
setTimeout(function() {
    alert([].slice.call(arguments));
}, 10, 1, 2, 4);

if (window.VBArray && !(document.documentMode > 9)) {
    (function(overrideFun) {
        window.setTimeout = overrideFun(window.setTimeout);
        window.setInterval = overrideFun(window.setInterval);
    })(function(originalFun) {
        return function(code, delay) {
            var args = [].slice.call(arguments, 2);
            return originalFun(function() {
                if (typeof code == 'string') {
                    eval(code);
                } else {
                    code.apply(this, args);
                }
            }, delay);
        }
    }
    );
}


Deferred = function(/* optional */ canceller) {
    this.chain = [];
    this.id = setTimeout("1")
    this.fired = -1;
    this.paused = 0;
    this.results = [null, null];
    this.canceller = canceller;
    this.silentlyCancelled = false;
    this.chained = false;
};

function curry(fn, scope, args) {
    return function() {
        var argv = [].concat.apply(args, arguments)
        return fn.apply(scope, argv);
    };
}
Deferred.prototype = {
    //三种状态,未触发,触发成功,触发失败
    state: function() {
        if (this.fired == -1) {
            return 'unfired';
        } else if (this.fired === 0) {
            return 'success';
        } else {
            return 'error';
        }
    },
    //取消触发，类似于ajax的abort
    cancel: function(e) {
        if (this.fired == -1) { //只有未触发时才能cancel掉
            if (this.canceller) {
                this.canceller(this);
            } else {
                this.silentlyCancelled = true;
            }
            if (this.fired == -1) {
                if (!(e instanceof Error)) {
                    e = new Error(e + "");
                }
                this.errback(e);
            }
        } else if ((this.fired === 0) && (this.results[0] instanceof Deferred)) {
            this.results[0].cancel(e);
        }
    },
    //这里决定是用哪个列队
    _resback: function(res) {
        this.fired = ((res instanceof Error) ? 1 : 0);
        this.results[this.fired] = res;
        if (this.paused === 0) {
            this._fire();
        }
    },
    //判定是否触发过
    _check: function() {
        if (this.fired != -1) {
            if (!this.silentlyCancelled) {
                throw new "此方法已经被调用过";
            }
            this.silentlyCancelled = false;
            return;
        }
    },
    //触发成功列队
    callback: function(res) {
        this._check();
        if (res instanceof Deferred) {
            throw new Error("Deferred instances can only be chained if they are the result of a callback");
        }
        this._resback(res);
    },
    //触发错误列队
    errback: function(res) {
        this._check();
        if (res instanceof Deferred) {
            throw new Error("Deferred instances can only be chained if they are the result of a callback");
        }
        if (!(res instanceof Error)) {
            res = new Error(res + "");
        }
        this._resback(res);
    },
    //同时添加成功与错误回调
    addBoth: function(a, b) {
        b = b || a
        return this.addCallbacks(a, b);
    },
    //添加成功回调
    addCallback: function(fn) {
        if (arguments.length > 1) {
            var args = [].slice.call(arguments, 1);
            fn = curry(fn, window, args);
        }
        return this.addCallbacks(fn, null);
    },
    //添加错误回调
    addErrback: function(fn) {
        if (arguments.length > 1) {
            var args = [].slice.call(arguments, 1);
            fn = curry(fn, window, args);
        }
        return this.addCallbacks(null, fn);
    },
    //同时添加成功回调与错误回调，后来Promise的then方法就是参考它设计
    addCallbacks: function(cb, eb) {
        if (this.chained) {
            throw new Error("Chained Deferreds can not be re-used");
        }
        if (this.finalized) {
            throw new Error("Finalized Deferreds can not be re-used");
        }
        this.chain.push([cb, eb]);
        if (this.fired >= 0) {
            this._fire();
        }
        return this;
    },
    //将列队的回调依次触发
    _fire: function() {
        var chain = this.chain;
        var fired = this.fired;
        var res = this.results[fired];
        var self = this;
        var cb = null;
        while (chain.length > 0 && this.paused === 0) {
            var pair = chain.shift();
            var f = pair[fired];
            if (f === null) {
                continue;
            }
            try {
                res = f(res);
                fired = ((res instanceof Error) ? 1 : 0);
                if (res instanceof Deferred) {
                    cb = function(res) {
                        self.paused--;
                        self._resback(res);
                    };
                    this.paused++;
                }
            } catch (err) {
                fired = 1;
                if (!(err instanceof Error)) {
                    try {
                        err = new Error(err + "");
                    } catch (e) {
                        alert(e)
                    }
                }
                res = err;
            }
        }
        this.fired = fired;
        this.results[fired] = res;
        if (cb && this.paused) {
            res.addBoth(cb);
            res.chained = true;
        }
    }
};

deferred.chain = [[fn1, fn2], [fn3, fn4], [fn5, fn6]]

var d = new Deferred();
d.addCallback(myCallback);
d.addErrback(myErrback);
d.addBoth(myBoth);
d.addCallbacks(myCallback, myErrback);


function increment(value) {
    console.log(value);
    return value + 1;
}

var d = new Deferred();
d.addCallback(increment);
d.addCallback(increment);
d.addCallback(increment);
d.callback(1);

var d = new Deferred();
d.addCallback(function(a) {
    console.log(a)
    return 4
}).addBoth(function(a) {
    console.log(a);
    throw "抛错"
}, function(b) {
    console.log(b)
    return "xxx"
}).addBoth(function(a) {
    console.log(a);
    return "正常"
}, function(b) {
    console.log(b + "!")
    return "出错"
}).addBoth(function(a) {
    console.log(a + " 回复正常");
    return "正常2"
}, function(b) {
    console.log(b + "  继续出错")
    return "出错2"
})
d.callback(3)


var elapsed = (function() {
    var start = null;
    return function() {
        if (!start)
            start = Date.now();
        return ((Date.now() - start) / 1000)
    }
})();

console.log(elapsed(), "start");

var dl1, dl2;

dl1 = new DeferredList([
    doXHR('/sleep.php?n=3').addCallback(function(res) {
        console.log(elapsed(), "n=3", res, res.responseText);
        return res.responseText;
    }),
    doXHR('/sleep.php?n=4').addCallback(function(res) {
        console.log(elapsed(), "n=4", res, res.responseText);
        return res.responseText;
    }),
    doXHR('/sleep.php?n=5').addCallback(function(res) {
        console.log(elapsed(), "n=5", res, res.responseText);
        return res.responseText;
    }),
    doXHR('/sleep.php?n=6').addCallback(function(res) {
        console.log(elapsed(), "n=6", res, res.responseText);
        return res.responseText;
    })]).addCallback(function(res) {
    console.log(elapsed(), "first DeferredList complete.", res);

    return dl2 = new DeferredList([
        doXHR('/sleep.php?n=1').addCallback(function(res) {
            console.log(elapsed(), "n=1", res, res.responseText);
            return res.responseText;
        }),
        doXHR('/sleep.php?n=2').addCallback(function(res) {
            console.log(elapsed(), "n=2", res, res.responseText);
            return res.responseText;
        }), ]).addCallback(function(res) {
        console.log(elapsed(), "second DeferredList complete.", res);
        console.log(elapsed(), "last", res);
        return res;
    })
}).addCallback(function(res) {
    console.log(elapsed(), "end", res, dl1, dl2);
});

Deferred.define();
next(function() {
    /* 处理 */
})

var o = {}; //定义一个对象
Deferred.define(o);//把Deferred的方法加持到它上面，让o成为一个Deferred子类

for (var x in o)
    alert(x);
// parallel
// wait
// next
// call
// loop

o.next(function() {
    /* 处理 */
})

Deferred.next(function() {//在暗地里创建一个Deferred实例，然后我们直接"链"下去就行了
    /* 处理 */
})

Deferred.next_default = function(fun) {
    var d = new Deferred();
    var id = setTimeout(function() {
        clearTimeout(id);
        d.call()
    }, 0);
    d.canceller = function() {
        try {
            clearTimeout(id)
        } catch (e) {
        }
    };
    if (fun)
        d.callback.ok = fun;
    return d;
};

Deferred.define();
next(function func1() {
    alert(1)
})
        .next(function func2() {
    alert(2)
});
alert(3);

function Deferred() {
    return (this instanceof Deferred) ? this.init() : new Deferred()
}
Deferred.ok = function(x) {
    return x
};
Deferred.ng = function(x) {
    throw  x
};
Deferred.prototype = {
    init: function() {
        this._next = null;
        this.callback = {
            ok: Deferred.ok,
            ng: Deferred.ng
        };
        return this;
    },
    next: function(fun) {
        return this._post("ok", fun)
    },
    error: function(fun) {
        return this._post("ng", fun)
    },
    call: function(val) {
        return this._fire("ok", val)
    },
    fail: function(err) {
        return this._fire("ng", err)
    },
    cancel: function() {
        (this.canceller || function() {
        })();
        return this.init();
    },
    _post: function(okng, fun) {
        this._next = new Deferred();
        this._next.callback[okng] = fun;
        return this._next;
    },
    _fire: function(okng, value) {
        var next = "ok";
        try {
            value = this.callback[okng].call(this, value);
        } catch (e) {
            next = "ng";
            value = e;
        }
        if (value instanceof Deferred) {
            value._next = this._next;
        } else {
            if (this._next)
                this._next._fire(next, value);
        }
        return this;
    }
};

value = this.callback[okng].call(this, value);
//相当于d1.callback.ok.call(d1,null)
//相当于func1.call(d1,null)
//相当于d1.func1();

if (this._next)
    this._next._fire(next, value);
//相当于if(d2)d2.fire(next,value)
//相当于if(d2)d2.fire("ok",null)
//相当于d2.call()

window.onload = function() {
    //最好把Deferred放到window.onload中,因为当它的next用
    //image.onload实现时会用document.body.appendChild(image)
    var a, b, c;
    Deferred.
            next(function() {
        console.log(this);
        a = this;
        console.log("a1")
    })
            .next(function() {
        console.log(this);
        b = this;
        console.log(a !== b)
        console.log("a2");
    })
            .next(function() {
        console.log(this);
        c = this;
        console.log(b !== c)
        console.log("a3");
        console.log("===========");
        console.log(a._next === b);
        console.log(b._next === c);
    })
}

Deferred.next(function() {
    alert(1)
})
        .wait(0)
        .next(function() {
    alert(2)
})

Deferred.wait = function(n) {
    var d = new Deferred(), t = new Date();
    var id = setTimeout(function() {
        d.call((new Date()).getTime() - t.getTime());
    }, n * 1000);
    d.canceller = function() {
        clearTimeout(id)
    };
    return d;
};

Deferred.register = function(name, fun) {
    this.prototype[name] = function() {
        var a = arguments;
        return this.next(function() {
            return fun.apply(this, a);
        });
    };
};


Deferred.register("wait", Deferred.wait);

Deferred.next(function fun1() { //产生Deferred对象d1,
    alert(1)
})
        .wait(0) // 这里相当于.next(function curry(){ return Deferred.wait(0) })
        // 产生Deferred对象 d_hide与d_wait
        .next(function fun2() { //产生Deferred对象d2
    alert(2)
})

_fire = function(okng, value) {
    var next = "ok"; //每次都尝试从成功列队执行
    try { //决定是执行成功回调还是错误回调
        value = this.callback[okng].call(this, value);
    } catch (e) {
        next = "ng";
        value = e; //反正返回值
        if (Deferred.onerror)
            Deferred.onerror(e);
    }
    if (value instanceof Deferred) {
        value._next = this._next;
    } else { //执行链表中的下一个Deferred的_fire
        if (this._next)
            this._next._fire(next, value);
    }
    return this;
}


value = this.callback[okng].call(this, value);
就相当于
// value =  d_hide.callback.ok.call(d_hide,value) 
// value =  curry.call(d_hide,value)
// value = (function curry(){ return Deferred.wait(0) }).call(d_hide,value)
// value = d_wait

if (value instanceof Deferred) {
    value._next = this._next;
    //相当于 d_wait._next = d_hide._next 
    //相当于 d_wait._next = d2
} else {
    if (this._next)
        this._next._fire(next, value);
}

var d = Deferred.next(function() {
    console.log("0")
});
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function(index) {
    d = d.wait(1).next(function() {
        console.log(index + "!!")
    })
});

Deferred.parallel(function() {
    return 1
}, function() {
    return 2
}, function() {
    return 3
}).next(function(a) {
    console.log(a)//[1,2,3]
})

window.onload = function() {
    function ajax(url) {
        var d = Deferred();
        var delay = url.match(/time=(\d+)/)[1];
        // 真正的实现应该如下：
        // var xhr = new (self.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
        // xhr.onreadystatechange = function() {
        //     if (ajax.readyState == 4 && ajax.status == 200) {
        //         d.call(ajax.responseText)
        //     }
        // }
        // xhr.onload = function() {
        //     d.call(ajax.responseText)
        // }
        // xhr.onerror = function() {
        //      d.fail(ajax.responseText)
        //  }
        //xhr.open(。。。。。)
        setTimeout(function() {
            d.call(delay)
        }, +delay);
        return d
    }
    Deferred.parallel(
            ajax("rubylovre?time=2000"),
            ajax("rubylovre?time=3000"),
            ajax("rubylovre?time=4000")).next(function(a) {
        //大概等4秒
        console.log(a) //[2000,3000,4000]
    })
}

Deferred.parallel = function(dl) {
    var isArray = false; //它可以放一个数组或对象，或N个函数或Deferred对象做参数
    if (arguments.length > 1) {
        dl = Array.prototype.slice.call(arguments);
        isArray = true;
    } else if (Array.isArray && Array.isArray(dl) || typeof dl.length == "number") {
        isArray = true;
    }
    //并归用的Deferred
    var ret = new Deferred(),
            //收集结果
            values = {},
            //计数器
            num = 0;
    for (var i in dl) {
        if (dl.hasOwnProperty(i)) {
            (function(d, i) {
                //统统转成Deferred对象
                if (typeof d == "function")
                    dl[i] = d = Deferred.next(d);//转换为Deferred对象
                d.next(function(v) {//然后让它们添加两个回调：next与error
                    values[i] = v;
                    if (--num <= 0) {
                        //到这一步，说明用户最初传入的函数都成功返回数据了，组成values
                        if (isArray) {
                            values.length = dl.length;
                            values = Array.prototype.slice.call(values, 0);
                        }
                        ret.call(values);
                    }
                }).error(function(e) {
                    ret.fail(e);
                });
                num++;
            })(dl[i], i);
        }
    }
    //如果里面没有内容立即执行
    if (!num)
        Deferred.next(function() {
            ret.call()
        });
    ret.canceller = function() {
        for (var i in dl)
            if (dl.hasOwnProperty(i)) {
                dl[i].cancel();
            }
    };
    return ret;
};

Deferred.loop(10, function(n) {
    console.log(n);
    return Deferred.wait(1);
});

Deferred.next_faster_way_readystatechange = (typeof window === 'object')
        && (location.protocol == "http:")
        && window.VBArray && function(fun) {// MSIE
    var d = new Deferred();
    var t = new Date().getTime();
    //浏览器的并发请求数是有限的，在IE6、IE7中为2～4，IE8、IE9为6
    //如果超出这数目，可能造成堵塞，必须待这几个处理完才继续处理
    //因此这里添加一个阈值，如果上次与这次相隔超过150还没有处理完
    //那么就退化到原始的setTimeout方法
    if (t - arguments.callee._prev_timeout_called < 150) {
        var cancel = false;
        //创建一个script节点，加载一个不存在的资源来引发onerror
        //由于旧版本IE不区分onerror与onload，都只会触发onreadystatechange
        //那么就用onreadystatechange
        //只要造成异步效果，让用户有足够时间绑定回调就行了
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "data:text/javascript,";
        script.onreadystatechange = function() {
            if (!cancel) {
                d.canceller();
                d.call();
            }
        };
        //清掉事件与移出DOM树
        d.canceller = function() {
            if (!cancel) {
                cancel = true;
                script.onreadystatechange = null;
                document.body.removeChild(script);
            }
        };
        //由于这里的逻辑，我们的Deferred最好延迟到domReady或onload后执行
        document.body.appendChild(script);
    } else {
        arguments.callee._prev_timeout_called = t;
        var id = setTimeout(function() {
            d.call()
        }, 0);
        d.canceller = function() {
            clearTimeout(id)
        };
    }
    if (fun)
        d.callback.ok = fun;
    return d;
};

Deferred.next_faster_way_Image = (typeof window === 'object')
        && (typeof(Image) != "undefined")
        && !window.opera && document.addEventListener && function(fun) {
    // 用于Opera外的标准浏览器
    var d = new Deferred();
    var img = new Image();
    //创建一个image加载一个不存在的图片(为了防止万分之一的图片存在的情况,onload也绑上了)
    var handler = function() {
        d.canceller();
        d.call();
    };
    img.addEventListener("load", handler, false);
    img.addEventListener("error", handler, false);
    d.canceller = function() {
        img.removeEventListener("load", handler, false);
        img.removeEventListener("error", handler, false);
    };
    img.src = "data:image/png," + Math.random();
    if (fun)
        d.callback.ok = fun;
    return d;
};

Deferred.next_tick = (typeof process === 'object')
        && (typeof process.nextTick === 'function') && function(fun) {
    var d = new Deferred();
    process.nextTick(function() {
        d.call()
    });
    if (fun)
        d.callback.ok = fun;
    return d;
};

(function(jQuery) {
    var
            promiseMethods = "then done fail isResolved isRejected promise".split(" "),
            //用于转换arguments对象为真正的数组
            sliceDeferred = [].slice;
    jQuery.extend({
        //这是最早期的实现，Deferred还随大众那样是一个双链结构，只不过它的每一条链都由_Deferred实现
        //_Deferred方法会返回一个_Deferred对象，它可以简单地理解为一个操作函数数组的特殊对象 
        _Deferred: function() {
            var //函数列表
                    callbacks = [],
                    //这一个数组，用于保存传入的上下文对象与参数 [ context , args ]
                    fired,
                    // 判定是否在触发过程中
                    firing,
                    // 判定是否被消
                    cancelled,
                    //这是要返回的对象
                    deferred = {
                done: function() {
                    if (!cancelled) { //cancel就不能再绑定了
                        //与jQuery其他API一样，允许太多种传参形式，因此这里需要各种处理
                        var args = arguments,
                                i,
                                length,
                                elem,
                                type,
                                _fired;
                        if (fired) {
                            _fired = fired;
                            fired = 0;
                        }
                        for (i = 0, length = args.length; i < length; i++) {
                            elem = args[i];
                            type = jQuery.type(elem);
                            if (type === "array") { //递归调用自身
                                deferred.done.apply(deferred, elem);
                            } else if (type === "function") {
                                callbacks.push(elem);
                            }
                        }
                        if (_fired) { //如果已经触发了，那么就立即执行它们
                            deferred.resolveWith(_fired[0], _fired[1]);
                        }
                    }
                    return this;
                },
                //触发时允许指定上下文与传参 
                resolveWith: function(context, args) {
                    if (!cancelled && !fired && !firing) {
                        args = args || [];
                        firing = 1;
                        try {
                            while (callbacks[0]) {
                                //注意这里，每次都是弹出一个回调，因此此对象不能反复利用
                                callbacks.shift().apply(context, args);
                            }
                        } finally {
                            fired = [context, args];
                            firing = 0;
                        }
                    }
                    return this;
                },
                //触发时允许指定传参
                resolve: function() {
                    deferred.resolveWith(this, arguments);
                    return this;
                },
                // 判定是否调用了resolve或resolveWith
                isResolved: function() {
                    return !!(firing || fired);
                },
                // 取消
                cancel: function() {
                    cancelled = 1;
                    callbacks = [];
                    return this;
                }
            };

            return deferred;
        },
        // 真正给人用的Deferred，一个双链对象，由两个_Deferred对象合体而成
        Deferred: function(func) {
            var deferred = jQuery._Deferred(),
                    failDeferred = jQuery._Deferred(),
                    promise;
            // Add errorDeferred methods, then and promise
            jQuery.extend(deferred, {
                then: function(doneCallbacks, failCallbacks) {
                    deferred.done(doneCallbacks).fail(failCallbacks);
                    return this;
                },
                fail: failDeferred.done,
                rejectWith: failDeferred.resolveWith,
                reject: failDeferred.resolve,
                isRejected: failDeferred.isResolved,
                // Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
                promise: function(obj) {
                    //这是一个单例方法，无论调用多少次，只会返回同一个对象
                    //它与promiseMethods有着相同的方法
                    if (obj == null) {
                        if (promise) {
                            return promise;
                        }
                        promise = obj = {};
                    }
                    var i = promiseMethods.length;
                    while (i--) {
                        obj[promiseMethods[i]] = deferred[promiseMethods[i]];
                    }
                    return obj;
                }
            });
            //将这两个cancel放进列队目的是，一旦执行fail与done就不能用了 
            deferred.done(failDeferred.cancel).fail(deferred.cancel);
            // 移除 cancel方法
            delete deferred.cancel;
            if (func) {
                func.call(deferred, deferred);
            }
            return deferred;
        },
        when: function(firstParam) {
            var args = arguments,
                    i = 0,
                    length = args.length,
                    count = length, //计数器
                    //如果只是传入一个Deferred/Promise对象，那么就直接利用此对象，否则生成一个新的Deferred
                    //此Promise对象（下称“并归Promise”）用于绑定下一个阶段的回调
                    deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise)
                    ? firstParam : jQuery.Deferred();

            function resolveFunc(i) {
                return function(value) {
                    args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    if (!(--count)) {
                        //如果count减为零，那么就将这些结果放到下一个阶段绑定的回调执行
                        deferred.resolveWith(deferred, sliceDeferred.call(args, 0));
                    }
                };
            }
            if (length > 1) {
                for (; i < length; i++) {
                    //只对Deferred/Promise对象进行操作，因为只有它们有promise方法
                    if (args[i] && jQuery.isFunction(args[i].promise)) {
                        //绑定过渡用的resolveFunc方法，让它们决定“并归Promise”的触发
                        args[i].promise().then(resolveFunc(i), deferred.reject);
                    } else {
                        --count;
                    }
                }
                if (!count) { //如果为零立即执行
                    deferred.resolveWith(deferred, args);
                }
            } else if (deferred !== firstParam) {
                //如果什么也不传，也立即执行
                deferred.resolveWith(deferred, length ? [firstParam] : []);
            } //换言之，只传一个Deferred/Promise对象是不会执行的，只会转成Promise对象
            return deferred.promise();
        }
    });

})(jQuery);

var deferred = $.Deferred()
//注意，这里不能链起来
//因为Deferred()返回的是Deferred对象
//pipe()返回的是Promise对象
var promise = deferred.pipe(function(a) {
    console.log(a); //5
    return a * 2;
}).pipe(function(a) {
    console.log(a); //10
    return a * 4;
}).pipe(function(a) {
    console.log(a); //40
})
console.log(deferred === promise); //false
deferred.resolve(5);

//这里则可以链起来,始终都是那个Deferred对象
$.Deferred()
        .then(function(a) {
    console.log(a); //10
    return a * 2;
}).then(function(a) {
    console.log(a); //10
    return a * 4;
}).then(function(a) {
    console.log(a); //10
}).resolve(10);

var stuff1 = function(deferred) {
    setTimeout(function() {
        console.log("Stuff #1 is done!");
        deferred.resolve();
    }, 1000);
};
var stuff2 = function(deferred) {
    setTimeout(function() {
        console.log("Stuff #2 is done!");
        deferred.resolve();
    }, 500);
};
var stuff3 = function(deferred) {
    setTimeout(function() {
        console.log("Stuff #3 is done!");
        deferred.resolve();
    }, 500);
};
$.when(
        $.Deferred(stuff1),
        $.Deferred(stuff2),
        $.Deferred(stuff3)
        ).then(function() {
    console.log("done!");
});

var a = $.Deferred();
a.done(function(x) {
    console.log(x);
}).done(function(x) {
    console.log(x);
});
a.resolve(1);
a.resolve(2);
console.log("============")
var b = $.Deferred();
b.progress(function(y) {
    console.log(y);
}).progress(function(y) {
    console.log(y);
});
b.notify(3);
b.notify(4);

/*
 try{
 doSomething(x, y)
 }.catch(e){
 handleError(e)
 }.finally{
 cleanup()
 };
 */

var fn = require('when/function');
fn.call(
        doSomethiny(x, y)
        ).otherwise(
        handleError(e)
        ).somethingThatIsNotTheExistingAlways(
        cleanup()
        );
function Deferred() {
    return (this instanceof Deferred) ? this.init() : new Deferred()
}
Deferred.ok = function(x) {
    return x
};
Deferred.ng = function(x) {
    throw  x
};
Deferred.prototype = {
    init: function() {
        this.callback = {
            resolve: Deferred.ok,
            reject: Deferred.ng,
            notify: Deferred.ok,
            ensure: Deferred.ok
        };

        var that = this
        this.state = "pending"
        this.dirty = false;
        this.promise = {
            then: function(onResolve, onReject, onNotify) {
                return that._post(onResolve, onReject, onNotify)
            },
            otherwise: function(onReject) {
                return that._post(null, onReject, null)
            },
            ensure: function(onEnsure) {
                return that._post(0, 0, 0, onEnsure)
            },
            _next: null
        }
        return this;
    },
    _post: function(fn0, fn1, fn2, fn3) {
        var deferred
        if (!this.dirty) {
            deferred = this;
        } else {
            deferred = this.promise._next = new Deferred();
        }
        var index = -1, fns = arguments;
        "resolve,reject,notify, ensure".replace(/\w+/g, function(method) {
            var fn = fns[++index];
            if (typeof fn === "function") {
                deferred.callback[method] = fn;
                deferred.dirty = true;
            }
        })
        return deferred.promise;
    },
    _fire: function(method, value) {
        var next = "resolve";
        try {
            if (this.state == "pending" || method == "notify") {
                var fn = this.callback[method]
                value = fn.call(this, value);
                if (method !== "notify") {
                    this.state = method
                } else {
                    next = "notify"
                }
            }
        } catch (e) {
            next = "reject";
            value = e;
        }
        var ensure = this.callback.ensure
        if (Deferred.ok !== ensure) {
            try {
                ensure.call(this)
            } catch (e) {
                next = "reject";
                value = e;
            }
        }


        if (Deferred.isPromise(value)) {
            value._next = this.promise._next
        } else {
            if (this.promise._next) {
                this.promise._next._fire(next, value);
            }
        }
        return this;
    }
};
"resolve,reject,notify".replace(/\w+/g, function(method) {
    Deferred.prototype[method] = function(val) {
        //http://promisesaplus.com/ 4.1
        if (!this.dirty) {
            var that = this;
            setTimeout(function() {
                that._fire(method, val)
            }, 0)
        } else {
            return this._fire(method, val)
        }
    }
})
Deferred.isPromise = function(obj) {
    return !!(obj && typeof obj.then === "function");
};

function some(any, promises) {
    var deferred = Deferred(), n = 0, result = [], end
    function loop(promise, index) {
        promise.then(function(ret) {
            if (!end) {
                result[index] = ret//保证回调的顺序
                n++;
                if (any || n >= promises.length) {
                    deferred.resolve(any ? ret : result);
                    end = true
                }
            }
        }, function(e) {
            end = true
            deferred.reject(e);
        })
    }
    for (var i = 0, l = promises.length; i < l; i++) {
        loop(promises[i], i)
    }
    return deferred.promise;
}
Deferred.all = function() {
    return some(false, arguments)
}
Deferred.any = function() {
    return some(true, arguments)
};
Deferred.nextTick = function(fn) {
    setTimeout(fn, 0)
}


if (method === "resolve" || method === "reject") {
    dfd.callback[method] = function() {//重写onFulfill, onReject
        try {
            var value = fn.apply(this, arguments)
            state = "fulfilled"//偷偷改变状态
            return value
        } catch (err) {
            state = "rejected"
            return err
        }
    }
}

(function() {

    var noop = function() {
    }
    function Deferred(mixin) {
        var state = "pending", dirty = false
        function ok(x) {
            state = "fulfilled"
            return x
        }
        function ng(e) {
            state = "rejected"
            throw e
        }

        var dfd = {
            callback: {
                resolve: ok,
                reject: ng,
                notify: noop,
                ensure: noop
            },
            dirty: function() {
                return dirty
            },
            state: function() {
                return state
            },
            promise: {
                then: function(onResolve, onReject, onNotify) {
                    return _post(onResolve, onReject, onNotify)
                },
                otherwise: function(onReject) {
                    return _post(0, onReject)
                },
                ensure: function(onEnsure) {
                    return _post(0, 0, 0, onEnsure)
                },
                _next: null
            }
        }
        //允许传入一个可选的对象或函数，修改整条Deferred链的所有Promise对象
        //这相当于jQuery的promise(obj)，将一个普通对象转换为Promise 对象的功能
        if (typeof mixin === "function") {
            mixin(dfd.promise)
        } else if (mixin && typeof mixin === "object") {
            for (var i in mixin) {
                if (!dfd.promise[i]) {
                    dfd.promise[i] = mixin[i]
                }
            }
        }

        "resolve,reject,notify".replace(/\w+/g, function(method) {
            dfd[method] = function() {
                var that = this, args = arguments
                //http://promisesaplus.com/ 4.1
                if (that.dirty()) {
                    _fire.call(that, method, args)
                } else {
                    Deferred.nextTick(function() {
                        _fire.call(that, method, args)
                    })
                }
            }
        })
        return dfd

        function _post() {
            var index = -1, fns = arguments;
            "resolve,reject,notify,ensure".replace(/\w+/g, function(method) {
                var fn = fns[++index];
                if (typeof fn === "function") {
                    dirty = true
                    if (method === "resolve" || method === "reject") {
                        dfd.callback[method] = function() {
                            try {
                                var value = fn.apply(this, arguments)
                                state = "fulfilled"
                                return value
                            } catch (err) {
                                state = "rejected"
                                return err
                            }
                        }
                    } else {
                        dfd.callback[method] = fn;
                    }
                }
            })
            var deferred = dfd.promise._next = Deferred(mixin)
            return deferred.promise;
        }

        function _fire(method, array) {
            var next = "resolve", value
            if (this.state() === "pending" || method === "notify") {
                var fn = this.callback[method]
                try {
                    value = fn.apply(this, array);
                } catch (e) {//处理notify的异常
                    value = e
                }
                if (this.state() === "rejected") {
                    next = "reject"
                } else if (method === "notify") {
                    next = "notify"
                }
                array = [value]
            }
            var ensure = this.callback.ensure
            if (noop !== ensure) {
                try {
                    ensure.call(this)//模拟finally
                } catch (e) {
                    next = "reject";
                    array = [e];
                }
            }
            var nextDeferred = this.promise._next
            if (Deferred.isPromise(value)) {
                value._next = nextDeferred
            } else {
                if (nextDeferred) {
                    _fire.call(nextDeferred, next, array);
                }
            }
        }

    }
    window.Deferred = Deferred;
    //……下面就与原来的一模一样了
})()

function fib() {
    var i = 0,
            j = 1;
    while (true) {
        yield i; // 每次在这里把i返回
        var t = i;
        i = j;
        j += t;
    }
}
var g = fib();
for (var i = 0; i < 10; i++) {
    console.log(g.next());
}
/*
 function f() {
 console.log(1);
 var value = yield 2;
 console.log(value);
 console.log("这是跟在3后面")
 }
 var g = f(); // 这里什么也不行
 console.log(g.next()); //这里打迎f函数以yield切开的前半部分,及其返回值。于是有1，2
 g.send(3);  //这里打印3， 与我们最后那一行提示
 */
function Generator() {
    yield "aaaa";
    yield "bbbb";
    yield "cccc";
    yield "dddd";
}

var g = Generator();
console.log(g.next());//aaaa
console.log(g.next());//bbbb
console.log(g.next());//cccc
console.log(g.next());//dddd


var g = Generator();
function process(g) {
    console.log(g.next())
    process(g)
}
process(g)

var g = Generator();
function process(g, f) {
    try {
        f(g.next())
        process(g, f)
    } catch (e) {
    }
}
process(g, function(a) {
    console.log(a)
})

function Generator(next) {
    setTimeout(next, 1000)
    yield;
    console.log("aaaa")

    setTimeout(next, 1000)
    yield;
    console.log("bbbb")

    setTimeout(next, 1000)
    yield;
    console.log("cccc")
}

function process(f) {
    var g
    //这是传参next, next里面再次驱动它执行生成器的next，形成递归调用
    g = f(function() {
        try {
            g.next();
        } catch (e) {
        }
    });
    g.next(); //执行它
}

process(Generator);

setTimeout(function() {
    console.log("aaaa")
    setTimeout(function() {
        console.log("bbbb")
        setTimeout(function() {
            console.log("cccc")
        }, 1000)
    }, 1000)
}, 1000)

/*
Function.prototype.wait = function() {
    var me = this;
    var g = me(function(t) {
        try {
            g.send(t)
        } catch (e) {
        }
    });
    g.next();
}
Requester = function(a) {
    this.resume = a;
};

Requester.prototype.send = function(time) {
    var resume = this.resume
    setTimeout(function() {
        resume(time)
    }, time)
};


(function(resume) {

    var r = new Requester(resume);
    //这里隔1000秒才执行
    var json = yield r.send(1000);
     console.log(json);
    //这里隔1000秒才执行
    json = yield  r.send(1000);
     console.log(json);

}).wait()
*/

