define("xxx", ["aaa", "bbb"], function(aaa, bbb) {

});

require(["aaa", "bbb"], function(aaa, bbb) {

})
basePath + 模块ID + ".js"

function getBasePath() {
    var nodes = document.getElementsByTagName("script");
    var node = nodes[nodes.length - 1];
    var src = document.querySelector ? node.src : node.getAttribute("src", 4);
    return src;
}
/*
 <script>
 document.write('<script src="avalon.js"><\/script>');
 document.write('<script src="mass.js"><\/script>');
 document.write('<script src="http://common.cnblogs.com/script/jquery.js"><\/script>');
 </script>
 */

function getBasePath() {
    var nodes = document.getElementsByTagName("script");
    if (window.VBArray) {//如果是IE
        for (var i = 0, node; node = nodes[i++]; ) {
            if (node.readyState === "interactive") {
                break;
            }
        }
    } else {
        node = nodes[nodes.length - 1];
    }
    var src = document.querySelector ? node.src : node.getAttribute("src", 4);
    return src;
}
function getBasePath() {
    try {
        a.b.c()
    } catch (e) {
        if (e.fileName) {//firefox
            return e.fileName;
        } else if (e.sourceURL) {//safari
            return e.sourceURL;
        }
    }
    var nodes = document.getElementsByTagName("script");
    if (window.VBArray) {//倒序查找更快
        for (var i = nodes.length, node; node = nodes[--i]; ) {
            if (node.readyState === "interactive") {
                break;
            }
        }
    } else {
        node = nodes[nodes.length - 1];
    }
    var src = document.querySelector ? node.src : node.getAttribute("src", 4);
    return src;
}
url = url.replace(/[?#].*/, "").slice(0, url.lastIndexOf("/") + 1);

function getCurrentScript(base) {//为true时相当于getBasePath
    var stack;
    try { //Firefox可以直接 var e = new Error("test"),但其他浏览器只会生成一个空Error
        a.b.c(); //强制报错,以便捕获e.stack
    } catch (e) { //Safari的错误对象只有line、sourceId、sourceURL
        stack = e.stack;
        if (!stack && window.opera) {
            //Opera 9没有e.stack,但有e.Backtrace,不能直接取得,需要对e对象转字符串进行抽取
            stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
    }
    if (stack) {
        /**e.stack最后一行在所有支持的浏览器大致如下。
         *Chrome23:
         * at http://113.93.50.63/data.js:4:1
         *Firefox17:
         *@http://113.93.50.63/query.js:4
         *@http://113.93.50.63/data.js:4
         *IE10:
         *  at Global code (http://113.93.50.63/data.js:4:1)
         *  //firefox4+ 可以用document.currentScript
         */
        stack = stack.split(/[@ ]/g).pop();         //取得最后一行,最后一个空格或@之后的部分
        stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "");                                                            //去掉换行符
        return stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
    }
    ///我们在动态加载模块时，节点都插入head中，因此只在head标签中寻找
    var nodes = (base ? document : head).getElementsByTagName("script");
    for (var i = nodes.length, node; node = nodes[--i]; ) {
        if ((base || node.className === moduleClass) && node.readyState === "interactive") {
            return node.className = node.src;
        }//如果此模块加载过就重写className
    }
}

require.config({
    alias: {
        'lang': 'http://common.cnblogs.com/script/mass/lang.js',
        'css': 'http://common.cnblogs.com/script/mass/css.js'
    }
});
require.config({
    alias: {
        'jquery': {
            src: 'http://common.cnblogs.com/scriptjquery.js',
            exports: "$"
        },
        'jquery.tooltip': {
            src: 'http://common.cnblogs.com/script/ui/tooltip.js',
            exports: "$",
            deps: ["jquery"]
        }
    }
});

window.require = $.require = function(list, factory, parent) {
    // 用于检测它的依赖是否都为2
    var deps = {},
            // 用于保存依赖模块的返回值
            args = [],
            // 需要安装的模块数
            dn = 0,
            // 已安装完的模块数
            cn = 0,
            id = parent || "callback" + setTimeout("1");
    parent = parent || basepath;//basepath为加载器的路径
    String(list).replace($.rword, function(el) {
        var url = loadJSCSS(el, parent)
        if (url) {
            dn++;
            if (modules[url] && modules[url].state === 2) {
                cn++;
            }
            if (!deps[url]) {
                args.push(url);
                deps[url] = "司徒正美"; //去重
            }
        }
    });
    modules[id] = {//创建一个对象,记录模块的加载情况与其他信息
        id: id,
        factory: factory,
        deps: deps,
        args: args,
        state: 1
    };
    if (dn === cn) { //如果需要安装的等于已安装好的
        fireFactory(id, args, factory); //安装到框架中
    } else {
        //放到检测列队中,等待checkDeps处理
        loadings.unshift(id);
    }
    checkDeps();
};
function loadJSCSS(url, parent, ret, shim) {
    //1. 特别处理mass|ready标识符
    if (/^(mass|ready)$/.test(url)) {
        return url;
    }
    //2. 转化为完整路径
    if ($.config.alias[url]) {//别名机制
        ret = $.config.alias[url];
        if (typeof ret === "object") {
            shim = ret;
            ret = ret.src;
        }
    } else {
        if (/^(\w+)(\d)?:.*/.test(url)) { //如果本来就是完整路径
            ret = url;
        } else {
            parent = parent.substr(0, parent.lastIndexOf('/'));
            var tmp = url.charAt(0);
            if (tmp !== "." && tmp !== "/") { //相对于根路径
                ret = basepath + url;
            } else if (url.slice(0, 2) === "./") { //相对于兄弟路径
                ret = parent + url.slice(1);
            } else if (url.slice(0, 2) === "..") { //相对于父路径
                var arr = parent.replace(/\/$/, "").split("/");
                tmp = url.replace(/\.\.\//g, function() {
                    arr.pop();
                    return "";
                });
                ret = arr.join("/") + "/" + tmp;
            } else if (tmp === "/") {
                ret = parent + url;//相对于兄弟路径
            } else {
                $.error("不符合模块标识规则: " + url);
            }
        }
    }
    var src = ret.replace(/[?#].*/, ""),
            ext;
    if (/\.(css|js)$/.test(src)) {
        ext = RegExp.$1;
    }
    if (!ext) { //如果没有后缀名,加上后缀名
        src += ".js";
        ext = "js";
    }
    //3. 开始加载JS或CSS
    if (ext === "js") {
        if (!modules[src]) { //如果之前没有加载过
            modules[src] = {
                id: src,
                parent: parent,
                exports: {}
            };
            if (shim) {//shim机制
                require(shim.deps || "", function() {
                    loadJS(src, function() {
                        modules[src].state = 2;
                        modules[src].exports = typeof shim.exports === "function" ?
                                shim.exports() : window[shim.exports];
                        checkDeps();
                    });
                });
            } else {
                loadJS(src);
            }
        }
        return src;
    } else {
        loadCSS(src);
    }
}

function loadJS(url, callback) {
    //通过script节点加载目标模块
    var node = DOC.createElement("script");
    node.className = moduleClass; //让getCurrentScript只处理类名为moduleClass的script节点
    node[W3C ? "onload" : "onreadystatechange"] = function() {
        if (W3C || /loaded|complete/i.test(node.readyState)) {
            //factorys里面装着define方法的工厂函数(define(id?,deps?, factory))
            var factory = factorys.pop();
            factory && factory.delay(node.src);
            if (callback) {
                callback();
            }
            if (checkFail(node, false, !W3C)) {
                $.log("已成功加载 " + node.src, 7);
            }
        }
    };
    node.onerror = function() {
        checkFail(node, true);
    };
    //插入到head的第一个节点前，防止IE6下head标签没闭合前使用appendChild抛错
    node.src = url; 
    head.insertBefore(node, head.firstChild);
}

function checkFail(node, onError, fuckIE) {
    var id = node.src;//检测是否死链
    node.onload = node.onreadystatechange = node.onerror = null;
    if (onError || (fuckIE && !modules[id].state)) {
        setTimeout(function() {
            head.removeChild(node);
        });
        $.log("加载 " + id + " 失败" + onError + " " + (!modules[id].state), 7);
    } else {
        return true;
    }
}

function checkDeps() {
    loop: for (var i = loadings.length, id; id = loadings[--i]; ) {
        var obj = modules[id],  deps = obj.deps;
        for (var key in deps) {
            if (hasOwn.call(deps, key) && modules[key].state !== 2) {
                continue loop;
            }
        }
        //如果deps是空对象或者其依赖的模块的状态都是2
        if (obj.state !== 2) {
            loadings.splice(i, 1); //必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
            fireFactory(obj.id, obj.args, obj.factory);
            checkDeps();//如果成功,则再执行一次,以防有些模块就差本模块没有安装好
        }
    }
}
function fireFactory(id, deps, factory) {
    for (var i = 0, array = [], d; d = deps[i++]; ) {
        array.push(modules[d].exports);
    }
    var module = Object(modules[id]),
            ret = factory.apply(global, array);
    module.state = 2;
    if (ret !== void 0) {
        modules[id].exports = ret;
    }
    return ret;
}
window.define = $.define = function(id, deps, factory) {
    var args = $.slice(arguments);
    if (typeof id === "string") {
        var _id = args.shift();
    }
    if (typeof args[0] === "boolean") { //用于文件合并, 在标准浏览器中跳过补丁模块
        if (args[0]) {
            return;
        }
        args.shift();
    }
    if (typeof args[0] === "function") {
        args.unshift([]);
    } //上线合并后能直接得到模块ID,否则寻找当前正在解析中的script节点的src作为模块ID
    //现在除了Safari外，我们都能直接通过getCurrentScript一步到位得到当前执行的script节点
    //Safari可通过onload+delay闭包组合解决
    id = modules[id] && modules[id].state >= 1 ? _id : getCurrentScript();
    factory = args[1];
    factory.id = _id; //用于调试
    factory.delay = function(id) {
        args.push(id);
        var isCycle = true;
        try {
            isCycle = checkCycle(modules[id].deps, id);
        } catch (e) {
        }
        if (isCycle) {
            $.error(id + "模块与之前的某些模块存在循环依赖");
        }
        delete factory.delay; //释放内存
        require.apply(null, args); //0,1,2 --> 1,2,0
    };
    if (id) {
        factory.delay(id, args);
    } else { //先进先出
        factorys.push(factory);
    }
};
function checkCycle(deps, nick) {
    //检测是否存在循环依赖
    for (var id in deps) {
        if (deps[id] === "司徒正美" && modules[id].state !== 2 && (id === nick || checkCycle(modules[id].deps, nick))) {
                return true;
         }
      }
}
require("ajax, node", function($) {
    $.log("加载完成！")
})