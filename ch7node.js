//http://thunderguy.com/semicolon/2005/05/23/setting-the-name-attribute-in-internet-explorer/
function createNamedElement(type, name) {
    var element = null;
    // Try the IE way; this fails on standards-compliant browsers
    try {
        element = document.createElement('<' + type + ' name="' + name + '">');
    } catch (e) {
    }
    if (!element || element.nodeName != type.toUpperCase()) {
        // Non-IE browser; use canonical method to create named element
        element = document.createElement(type);
        element.name = name;
    }
    return element;
}
window.onload = function() {
    var div = document.createElement("div");
    div.innerHTML = " <b>1</b><b>2</b> "
    alert(div.childNodes.length); //IE6～IE 8弹出3，其他4
    alert(div.firstChild.nodeType) //IE6弹出1，其他3
}
window.onload = function() { //请在IE6～IE8下测试
    var div = document.createElement("div");
    div.innerHTML = '<meta http-equiv="X-UA-Compatible" content="IE=9"/>';
    alert(div.childNodes.length);
    div.innerHTML = 'X<meta http-equiv="X-UA-Compatible" content="IE=9"/>';
    alert(div.childNodes.length);
};
window.onload = function() {
    var div = document.createElement("div");
    div.innerHTML = '<table><tbody><tr></tr></tbody></table>';//手动闭合标签
    alert(div.getElementsByTagName("tr").length);//1
    div.innerHTML = '<table><tbody><tr></tr>';//让浏览器自动处理
    alert(div.getElementsByTagName("tr").length);//1
}
if (typeof HTMLElement !== "undefined" &&
        !HTMLElement.prototype.insertAdjacentElement) {
    HTMLElement.prototype.insertAdjacentElement = function(where, parsedNode) {
        switch (where.toLowerCase()) {
            case 'beforebegin':
                this.parentNode.insertBefore(parsedNode, this)
                break;
            case 'afterbegin':
                this.insertBefore(parsedNode, this.firstChild);
                break;
            case 'beforeend':
                this.appendChild(parsedNode);
                break;
            case 'afterend':
                if (this.nextSibling)
                    this.parentNode.insertBefore(parsedNode, this.nextSibling);
                else
                    this.parentNode.appendChild(parsedNode);
                break;
        }
    }
    HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
        var r = this.ownerDocument.createRange();
        r.setStartBefore(this);
        var parsedHTML = r.createContextualFragment(htmlStr);
        this.insertAdjacentElement(where, parsedHTML)
    }
    HTMLElement.prototype.insertAdjacentText = function(where, txtStr) {
        var parsedText = document.createTextNode(txtStr)
        this.insertAdjacentElement(where, parsedText)
    }
}
function $(a, b) { //第一个构造器
    return new $.fn.init(a, b); //第二个构造器
}
//将原型对象放到一个名字更短、更好记的属性中
//这是jQuery人性化的体现，也方便扩展原型方法
$.fn = $.prototype = {
    init: function(a, b) {
        this.a = a;
        this.b = b;
    }
}
//共用同一个原型
$.fn.init.prototype = $.fn;

var a = $(1, 2);
console.log(a instanceof $);
console.log(a instanceof $.fn.init);

var $ = function(expr, context) {
    //这个dom真数组其实通过选择器引擎或domParser得到的节点集合
    var dom = [];
    return DomArray(dom, expr, context)
}
//DomArray为内部函数
function DomArray(dom, expr, context) {
    dom = dom || []
    dom.context = context
    dom.expr = expr;
    dom.__proto__ = DomArray.prototype;//重要
    return dom
}
DomArray.prototype = $.fn = [];//重要，目的是使用数组方法
$.fn.get = function() {//添加原型方法
    alert(this.expr)
}
var a = $("div");
a.push("a", "b", "c")
a.get()// div
alert(a.length);//3
a.forEach(function(i) {
    alert(i);//依次a, b, c
})


$.fn.extend({
    init: function(expr, context) {
        // 分支1: 处理空白字符串、null、undefined参数
        if (!expr) {
            return this;
        }
        //分支2:  让$实例与元素节点一样拥有ownerDocument属性
        var doc, nodes; //用作节点搜索的起点
        if ($.isArrayLike(context)) { //typeof context === "string"
            return $(context).find(expr);
        }

        if (expr.nodeType) { //分支3:  处理节点参数
            this.ownerDocument = expr.nodeType === 9 ? expr : expr.ownerDocument;
            return $.Array.merge(this, [expr]);
        }
        this.selector = expr + "";
        if (typeof expr === "string") {
            doc = this.ownerDocument = !context ? document : getDoc(context, context[0]);
            var scope = context || doc;
            expr = expr.trim();
            if (expr.charAt(0) === "<" && expr.charAt(expr.length - 1) === ">" && expr.length >= 3) {
                nodes = $.parseHTML(expr, doc); //分支5: 动态生成新节点
                nodes = nodes.childNodes;
            } else if (rtag.test(expr)) { //分支6: getElementsByTagName
                nodes = scope[TAGS](expr);
            } else { //分支7：进入选择器模块
                nodes = $.query(expr, scope);
            }
            return $.Array.merge(this, nodes);
        } else { //分支8：处理数组、节点集合、mass对象或window对象
            this.ownerDocument = getDoc(expr[0]);
            $.Array.merge(this, $.isArrayLike(expr) ? expr : [expr]);
            delete this.selector;
        }
    },
    mass: $.mass,
    length: 0,
    valueOf: function() { //转换为纯数组对象
        return Array.prototype.slice.call(this);
    },
    size: function() {
        return this.length;
    },
    toString: function() { //取得它们的tagName，组成纯数组返回
        var i = this.length,
                ret = [],
                getType = $.type;
        while (i--) {
            ret[i] = getType(this[i]);
        }
        return ret.join(", ");
    },
    labor: function(nodes) { //用于构建一个与对象具有相同属性，但里面的节点集不同的mass对象
        var neo = new $;
        neo.context = this.context;
        neo.selector = this.selector;
        neo.ownerDocument = this.ownerDocument;
        return $.Array.merge(neo, nodes || []);
    },
    slice: function(a, b) { //传入起止值，截取原某一部分再组成mass对象返回
        return this.labor($.slice(this, a, b));
    },
    get: function(num) { //取得与索引值相对应的节点，若为负数从后面取起，如果不传，则返回节点集的纯数组
        return !arguments.length ? this.valueOf() : this[num < 0 ? this.length + num : num];
    },
    eq: function(i) { //取得与索引值相对应的节点，并构成mass对象返回
        return i === -1 ? this.slice(i) : this.slice(i, +i + 1);
    },
    gt: function(i) { //取得原对象中索引值大于传参的节点们，并构成mass对象返回
        return this.slice(i + 1, this.length);
    },
    lt: function(i) { //取得原对象中索引值小于传参的节点们，并构成mass对象返回
        return this.slice(0, i);
    },
    first: function() { //取得原对象中第一个的节点，并构成mass对象返回
        return this.slice(0, 1);
    },
    last: function() { //取得原对象中最后一个的节点，并构成mass对象返回
        return this.slice(-1);
    },
    even: function() { //取得原对象中索引值为偶数的节点，并构成mass对象返回
        return this.labor($.filter(this, function(_, i) {
            return i % 2 === 0;
        }));
    },
    odd: function() { //取得原对象中索引值为奇数的节点，并构成mass对象返回
        return this.labor($.filter(this, function(_, i) {
            return i % 2 === 1;
        }));
    },
    each: function(fn) {
        return $.each(this, fn);
    },
    map: function(fn) {
        return this.labor($.map(this, fn));
    },
    clone: function(dataAndEvents, deepDataAndEvents) { //复制原mass对象，它里面的节点
        //也一一复制，
        //略
    },
    html: function(item) { //取得或设置节点的innerHTML属性
        //略
    },
    text: function(item) { // 取得或设置节点的text或innerText或textContent属性
        //略
    },
    outerHTML: function(item) { // 取得或设置节点的outerHTML
        //略
    }
});
$.fn.init.prototype = $.fn;
"push,unshift,pop,shift,splice,sort,reverse".replace($.rword, function(method) {
    $.fn[method] = function() {
        Array.prototype[method].apply(this, arguments);
        return this;
    }
});
var tagHooks = {
    area: [1, "<map>"],
    param: [1, "<object>"],
    col: [2, "<table><tbody></tbody><colgroup>", "</table>"],
    legend: [1, "<fieldset>"],
    option: [1, "<select multiple='multiple'>"],
    thead: [1, "<table>", "</table>"],
    tr: [2, "<table><tbody>"],
    td: [3, "<table><tbody><tr>"],
    //IE6～IE8在用innerHTML生成节点时，不能直接创建script、link、meta、style与HTML5的新标签
    _default: $.support.noscope ? [1, "X<div>"] : [0, ""]
},
types = $.oneObject("text/javascript", "text/ecmascript",
        "application/ecmascript", "application/javascript", "text/vbscript"),
        rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        //innerHTML创建时可能无法生成的标签类型
        rcreate = $.support.noscope ? /(<(?:script|link|style|meta|noscript))/ig : /[^\d\D]/,
        //需要处理套嵌关系的标签类型
        rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/,
        rtagName = /<([\w:]+)/;
tagHooks.optgroup = tagHooks.option;
tagHooks.tbody = tagHooks.tfoot = tagHooks.colgroup = tagHooks.caption = tagHooks.thead;
tagHooks.th = tagHooks.td;
$.fn.parseHTML = function(html, doc) {
    doc = doc || this.nodeType === 9 && this || document;
    html = html.replace(rxhtml, "<$1></$2>").trim();
    //尝试使用createContextualFragment获取更高的效率
    //http://www.cnblogs.com/rubylouvre/archive/2011/04/15/2016800.html
    if ($.cachedRange && doc === document && !rcreate.test(html) && !rnest.test(html)) {
        return $.cachedRange.createContextualFragment(html);
    }
    if ($.support.noscope) { //修补IE，在link style script等no-scope元素前打个补丁
        html = html.replace(rcreate, "<br class=fix_noscope>$1");
        丁
    }
    var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase(),
            //取得其标签名
            wrap = tagHooks[tag] || tagHooks._default,
            fragment = doc.createDocumentFragment(),
            wrapper = doc.createElement("div"),
            firstChild;
    wrapper.innerHTML = wrap[1] + html + (wrap[2] || "");
    var els = wrapper[TAGS]("script");//TAGS = "getElementsByTagName"
    if (els.length) { //使用innerHTML生成的script节点不会发出请求与执行text属性
        var script = doc.createElement("script"),
                neo;
        for (var i = 0, el; el = els[i++]; ) {
            if (!el.type || types[el.type]) { //如果script节点的MIME能让其执行脚本
                neo = script.cloneNode(false); //FF不能省略cloneNode的参数
                for (var j = 0, attr; attr = el.attributes[j++]; ) {
                    if (attr.specified) { //复制其属性
                        neo[attr.name] = [attr.value];
                    }
                }
                neo.text = el.text; //必须指定,因为无法在attributes中遍历出来
                el.parentNode.replaceChild(neo, el); //替换节点
            }
        }
    }
    //移除我们为了符合套嵌关系而添加的标签
    for (i = wrap[0]; i--; wrapper = wrapper.lastChild) {
    }
    ;
    $.fixParseHTML(wrapper, html); //对于IE6～IE8进行处理
    while (firstChild = wrapper.firstChild) { // 将wrapper上的节点转移到文档碎片上！
        fragment.appendChild(firstChild);
    }
    return fragment;
}
try {
    var range = DOC.createRange();
    range.selectNodeContents(body); //修补Opera(9.2～11.51) Bug,必须对文档进行选取
    support.fastFragment = !!range.createContextualFragment("<a>");
    $.cachedRange = range;
} catch (e) {
}

var rtbody = /<tbody[^>]*>/i
$.fixParseHTML = function(wrapper, html) {
    if ($.support.noscope) { //移除所有br补丁
        for (els = wrapper["getElementsByTagName"]("br"), i = 0; el = els[i++]; ) {
            if (el.className && el.className === "fix_noscope") {
                el.parentNode.removeChild(el);
            }
        }
    }
    //当我们在生成colgroup、thead、tfoot时，IE会自作多情地插入tbody节点
    if (!$.support.insertTbody) {
        var noTbody = !rtbody.test(html),
                //矛:html本身就不存在<tbody字样
                els = wrapper["getElementsByTagName"]("tbody");
        if (els.length > 0 && noTbody) { //盾：实际上生成的NodeList中存在tbody节点
            for (var i = 0, el; el = els[i++]; ) {
                if (!el.childNodes.length) //如果是自动插入的，里面肯定没有内容
                    el.parentNode.removeChild(el);
            }
        }
    }
    //IE6、IE7没有为它们添加defaultChecked
    if (!$.support.appendChecked) {
        for (els = wrapper["getElementsByTagName"]("input"), i = 0; el = els[i++]; ) {
            if (el.type === "checkbox" || el.type === "radio") {
                el.defaultChecked = el.checked;
            }
        }
    }
}

var TABLE = document.createElement("table");
var TR = document.createElement("tr");
var SELECT = document.createElement("select");
var tagHooks = {
    option: SELECT,
    thead: TABLE,
    tfoot: TABLE,
    tbody: TABLE,
    td: TR,
    th: TR,
    tr: document.createElement("tbody"),
    col: document.createElement("colgroup"),
    legend: document.createElement("fieldset"),
    "*": document.createElement("div")
}
var rparse = /^\s*<(\w+|!)[^>]*>/;
//在DomArray的构造器中调用
if (rparse.test(expr)) {
    var html = expr.trim();
    var tag = RegExp.$1;
    dom = $.parseHTML(html, tag)
}

$.parseHTML = function(html, tag) {
    var parent;
    if (tag == null) {
        tag = "*"
    } else if (!(tag in tagHooks)) {
        tag = "*"
    }
    parent = tagHooks[tag];
    parent.innerHTML = "" + html;
    //这里尝试处理script节点
    return [].slice.call(parent.childNodes);
}

"append,prepend,before,after,replace".replace($.rword, function(method) {
    $.fn[method] = function(item) {
        return manipulate(this, method, item, this.ownerDocument);
    };
    $.fn[method + "To"] = function(item) {
        $(item, this.ownerDocument)[method](this);
        return this;
    };
});
/**
 append: function() {
 return this.domManip(arguments, true, function(elem) {
 if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
 this.appendChild(elem);
 }
 });
 },
 
 prepend: function() {
 return this.domManip(arguments, true, function(elem) {
 if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
 this.insertBefore(elem, this.firstChild);
 }
 });
 },
 
 before: function() {
 return this.domManip(arguments, false, function(elem) {
 if (this.parentNode) {
 this.parentNode.insertBefore(elem, this);
 }
 });
 },
 
 after: function() {
 return this.domManip(arguments, false, function(elem) {
 if (this.parentNode) {
 this.parentNode.insertBefore(elem, this.nextSibling);
 }
 });
 },
 
 replaceWith: function(value) {
 var isFunction = jQuery.isFunction(value);
 
 // Make sure that the elements are removed from the DOM before they are inserted
 // this can help fix replacing a parent with child elements
 if (!isFunction && typeof value !== "string") {
 value = jQuery(value).not(this).detach();
 }
 
 return value !== "" ? this.domManip([value], true, function(elem) {
 var next = this.nextSibling,
 parent = this.parentNode;
 
 if (parent) {
 jQuery(this).remove();
 parent.insertBefore(elem, next);
 }
 }) : this.remove();
 },
 
 jQuery.each({
 appendTo: "append",
 prependTo: "prepend",
 insertBefore: "before",
 insertAfter: "after",
 replaceAll: "replaceWith"
 }, function(name, original) {
 jQuery.fn[name] = function(selector) {
 var elems,
 ret = [],
 insert = jQuery(selector),
 last = insert.length - 1,
 i = 0;
 
 for (; i <= last; i++) {
 elems = i === last ? this : this.clone(true);
 jQuery(insert[i])[original](elems);
 
 // Support: QtWebKit
 // .get() because core_push.apply(_, arraylike) throws
 core_push.apply(ret, elems.get());
 }
 
 return this.pushStack(ret);
 };
 });
 */

function manipulate(nodes, name, item, doc) {
    //我们只允许向元素节点内部插入东西，因此需要转换为纯正的元素节点集合
    var elems = $.filter(nodes, function(el) {
        return el.nodeType === 1;
    }),
            handler = insertHooks[name];
    if (item.nodeType) {
        //如果是传入元素节点、文本节点或文档碎片
        insertAdjacentNode(elems, item, handler);
    } else if (typeof item === "string") {
        //如果传入的是字符串片断
//如果方法名不是replace，完美支持insertAdjacentHTML，并且不存在套嵌关系的标签
        var fast = (name !== "replace") && $.support[adjacent] && !rnest.test(item);
        if (!fast) {
            item = $.parseHTML(item, doc);
        }
        insertAdjacentHTML(elems, item, insertHooks[name + "2"], handler);
    } else if (item.length) {
        //如果传入的是HTMLCollection nodeList mass实例，将转换为文档碎片
        insertAdjacentFragment(elems, item, doc, handler);
    }
    return nodes;
}

function insertAdjacentNode(elems, item, handler) {
//使用appendChild、insertBefore实现，item为普通节点
    for (var i = 0, el; el = elems[i]; i++) { //第一个不用复制，其他的要复制
        handler(el, i ? cloneNode(item, true, true) : item);
    }
}

function insertAdjacentHTML(elems, item, fastHandler, handler) {
    for (var i = 0, el; el = elems[i++]; ) { //尝试使用insertAdjacentHTML
        if (item.nodeType) { //如果是文档碎片
            handler(el, item.cloneNode(true));
        } else {
            fastHandler(el, item);
        }
    }
}

function insertAdjacentFragment(elems, item, doc, handler) {
    var fragment = doc.createDocumentFragment();
    for (var i = 0, el; el = elems[i++]; ) {
        handler(el, makeFragment(item, fragment, i > 1));
    }
}

function makeFragment(nodes, fragment, bool) {
    //只有非NodeList的情况下才为i递增
    var ret = fragment.cloneNode(false),
            go = !nodes.item;
    for (var i = 0, node; node = nodes[i]; go && i++) {
        ret.appendChild(bool && cloneNode(node, true, true) || node);
    }
    return ret;
}
var insertHooks = {
    prepend: function(el, node) {
        el.insertBefore(node, el.firstChild);
    },
    append: function(el, node) {
        el.appendChild(node);
    },
    before: function(el, node) {
        el.parentNode.insertBefore(node, el);
    },
    after: function(el, node) {
        el.parentNode.insertBefore(node, el.nextSibling);
    },
    replace: function(el, node) {
        el.parentNode.replaceChild(node, el);
    },
    prepend2: function(el, html) {
        el[adjacent]("afterBegin", html);
    },
    append2: function(el, html) {
        el[adjacent]("beforeEnd", html);
    },
    before2: function(el, html) {
        el[adjacent]("beforeBegin", html);
    },
    after2: function(el, html) {
        el[adjacent]("afterEnd", html);
    }
};
/**
 <div id="test">
 <a href="http://www.google.com/">link</a>
 </div>
 
 window.onload = function() {
 var els = document.getElementsByTagName("a");
 var div = document.getElementById("test");
 for (var i = 0; i < els.length; i++) {
 var ele = document.createElement("a");
 ele.setAttribute("href", "http://www.google.com/");
 ele.appendChild(document.createTextNode("new link"));
 div.appendChild(ele); //添加一个新链接
 }
 } 
 */

if (!document.documentElement.applyElement && typeof HTMLElement !== "undefined") {
    HTMLElement.prototype.removeNode = function(deep) {
        if (this.parentNode) {
            if (!deep) {
                var fragment;
                var range = this.ownerDocument.createRange();
                range.selectNodeContents(this);
                fragment = range.extractContents();
                range.setStartBefore(this);
                range.insertNode(fragment);
                range.detach();
            }
            return this.parentNode.removeChild(this);
        }
        if (!deep) {
            var range = this.ownerDocument.createRange();
            range.selectNodeContents(this);
            range.deleteContents();
            range.detach();
        }
        return this;
    };
    HTMLElement.prototype.applyElement = function(newNode, where) {
        newNode = newNode.removeNode(false);

        switch ((where || 'outside').toLowerCase()) {

            case 'inside':
                var fragment;
                var range = this.ownerDocument.createRange();
                range.selectNodeContents(this);
                range.surroundContents(newNode);
                range.detach();
                break;

            case 'outside':
                var range = this.ownerDocument.createRange();
                range.selectNode(this);
                range.surroundContents(newNode);
                range.detach();
                break;
            default:
                throw new Error('DOMException.NOT_SUPPORTED_ERR(9)');
        }

        return newNode;
    };
}
/*
 <div id="aaa" data-test="test" title="title">目标节点</div>
 
 window.onload = function() { 
 var node = document.getElementById("aaa");
 node.expando = {
 key: 1
 }
 node.setAttribute("attr", "attr")
 var clone = node.cloneNode(false);
 alert(clone.id);//aaa
 alert(clone.getAttribute("data-test"));//test
 alert(clone.getAttribute("title"));//title
 alert(clone.getAttribute("attr"));//attr
 node.expando.key = 2 //修正为2
 alert(clone.expando.key )//IE6～IE8：2；其他：undefined
 }
 */
$.fn.clone = function(dataAndEvents, deepDataAndEvents) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
    return this.map(function() {
        return cloneNode(this, dataAndEvents, deepDataAndEvents);
    });
}
function cloneNode(node, dataAndEvents, deepDataAndEvents) {
    if (node.nodeType === 1) {
        var neo = $.fixCloneNode(node), //复制元素的attributes
                src, neos, i;
        if (dataAndEvents) {
            $.mergeData(neo, node);//复制数据与事件
            if (deepDataAndEvents) {//处理子孙的复制
                src = node[TAGS]("*");
                neos = neo[TAGS]("*");
                for (i = 0; src[i]; i++) {
                    $.mergeData(neos[i], src[i]);
                }
            }
        }
        src = neos = null;
        return neo;
    } else {
        return node.cloneNode(true);
    }
}
function fixNode(clone, src) {
    if (src.nodeType == 1) {
        //只处理元素节点
        var nodeName = clone.nodeName.toLowerCase();
        //clearAttributes方法可以清除元素的所有属性值，如style样式，或者class属性，与attachEvent绑定上去的事件
        clone.clearAttributes();
        //复制原对象的属性到克隆体中,但不包含原来的事件、ID、NAME、uniqueNumber
        clone.mergeAttributes(src, false);
        //IE6～IE8无法复制其内部的元素
        if (nodeName === "object") {
            clone.outerHTML = src.outerHTML;
        } else if (nodeName === "input" && (src.type === "checkbox" || src.type == "radio")) {
            //IE6～IE8无法复制chechbox的值，在IE6、IE7中defaultChecked属性也遗漏了
            if (src.checked) {
                clone.defaultChecked = clone.checked = src.checked;
            }
            // 除Chrome外，所有浏览器都会给没有value的checkbox一个默认的value值"on"。
            if (clone.value !== src.value) {
                clone.value = src.value;
            }
        } else if (nodeName === "option") {
            clone.selected = src.defaultSelected; // IE6～IE8无法保持选中状态
        } else if (nodeName === "input" || nodeName === "textarea") {
            clone.defaultValue = src.defaultValue; // IE6～IE8 无法保持默认值
        } else if (nodeName === "script" && clone.text !== src.text) {
            clone.text = src.text; //IE6～IE8不能复制script的text属性
        }

    }
}
var shim = document.createElement("div"); //缓存parser，防止反复创建

function shimCloneNode(outerHTML, tree) {
    tree.appendChild(shim);
    shim.innerHTML = outerHTML;
    tree.removeChild(shim);
    return shim.firstChild;
}
var unknownTag = "<?XML:NAMESPACE"
$.fixCloneNode = function(node) {
//这个判定必须这么长：判定是否能克隆新标签，判定是否为元素节点, 判定是否为新标签
    if (!$.support.cloneHTML5 && node.outerHTML) { //延迟创建检测元素
        var outerHTML = document.createElement(node.nodeName).outerHTML,
                bool = outerHTML.indexOf(unknownTag) // !0 === true;
    }
    //各浏览器cloneNode方法的部分实现差异 
    //http://www.cnblogs.com/snandy/archive/2012/05/06/2473936.html
    var neo = !bool ? shimCloneNode(node.outerHTML, document.documentElement) : node.cloneNode(true)
    fixNode(neo, node);
    var src = node[TAGS]("*"),
            neos = neo[TAGS]("*");
    for (var i = 0; src[i]; i++) {
        fixNode(neos[i], src[i]);
    }
}
//https://github.com/jquery/jquery/blob/1.4/src/manipulation.js
clone = function(events) {
    var ret = this.map(function() {
        if (!jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this)) {
            var html = this.outerHTML, ownerDocument = this.ownerDocument;
            if (!html) {
                var div = ownerDocument.createElement("div");
                div.appendChild(this.cloneNode(true));
                html = div.innerHTML;
            }

            return jQuery.clean([html.replace(rinlinejQuery, "")
                        .replace(rleadingWhitespace, "")], ownerDocument)[0];
        } else {
            return this.cloneNode(true);
        }
    });

    //复制事件
    if (events === true) {
        cloneCopyEvent(this, ret);
        cloneCopyEvent(this.find("*"), ret.find("*"));
    }
    return ret;
}

//zepto
clone = function() {
    return this.map(function() {
        return this.cloneNode(true)
    })
}

var removeNode = IE6 || IE7 ? function() {
    var d; //IE6、IE7的判定自己写
    return function(node) {
        if (node && node.tagName != 'BODY') {
            d = d || document.createElement('DIV');
            d.appendChild(node);
            d.innerHTML = '';
        }
    }
}() : function(node) {
    if (node && node.parentNode && node.tagName != 'BODY') {
        node.parentNode.removeChild(node);
    }
}

window.onload = function() {
    var div = document.createElement("div");
    alert(div.parentNode); //null
    document.body.removeChild(document.body.appendChild(div));
    alert(div.parentNode); //IE6～IE8 object;其他 null
    if (div.parentNode) {
        alert(div.parentNode.nodeType); //11 文档碎片
    }
}
/**
 <body><div id="test"></div></body>
 window.onload = function() {
 var div = document.getElementById('test');
 document.body.innerHTML = '';
 alert(div.parentNode);//null
 }
 */
/*
 <body>
 <div><div id="test1">test1</div></div>
 <div><div id="test2">test2</div></div>
 </body>
 window.onload = function() {
 var div1 = document.getElementById('test1');
 div1.parentNode.removeChild(div1);
 alert(div1.id + ":" + div1.innerHTML);//test1:test1
 var div2 = document.getElementById('test2');
 div2.parentNode.innerHTML = "";
 alert(div2.id + ":" + div2.innerHTML);//test2
 }
 
 */

"remove,empty,detach".replace($.rword, function(method) {
    $.fn[method] = function() {
        var isRemove = method !== "empty";
        for (var i = 0, node; node = this[i++]; ) {
            if (node.nodeType === 1) {
                //移除匹配元素
                var array = $.slice(node[TAGS]("*")).concat(isRemove ? node : []);
                if (method !== "detach") {
                    array.forEach(cleanNode);
                }
            }
            if (isRemove) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            } else {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            }
        }
        return this;
    }
});

function clearChild (node) {//node可以是元素节点与文档碎片
        while (node.firstChild) {
            node.removeChild(node.firstChild)
        }
        return node
 }

var deleteRange = document.createRange()
 function clearChild (node) {//node可以是元素节点与文档碎片
      deleteRange.setStartBefore(node.firstChild)
      deleteRange.setEndAfter(node.lastChild)
      deleteRange.deleteContents()
      return node
 }


function clearChild (node) {//node可以是元素节点与文档碎片
       node.textContent = ""
       return node
 }


$.access = function(elems, callback, directive, args) {
//用于统一配置多态方法的读写访问
    var length = elems.length,
            key = args[0],
            value = args[1]; //读方法
    if (args.length === 0 || args.length === 1 && typeof directive === "string") {
        var first = elems[0]; //由于只有一个回调，我们通过this == $判定读写
        return first && first.nodeType === 1 ? callback.call($, first, key) : void 0;
    } else {//写方法
        if (directive === null) {
            callback.call(elems, args);
        } else {
            if (typeof key === "object") {
                for (var k in key) { //为所有元素设置N个属性
                    for (var i = 0; i < length; i++) {
                        callback.call(elems, elems[i], k, key[k]);
                    }
                }
            } else {
                for (i = 0; i < length; i++) {
                    callback.call(elems, elems[i], key, value);
                }
            }
        }
    }
    return elems; //返回自身，链式操作
}
/**
 html: function(item) { //取得或设置节点的innerHTML属性 
 return $.access(this, function(el, value) {
 if (this === $) { //getter
 return "innerHTML" in el ? el.innerHTML : innerHTML(el);
 } else { //setter
 value = item == null ? "" : item + "";
 //如果item为null, undefined转换为空字符串，其他强制转字符串
 //接着判断innerHTML属性是否符合标准,不再区分可读与只读
 //用户传参是否包含了script style meta等不能用innerHTML直接进行创建的标签
 //及像col td map legend等需要满足套嵌关系才能创建的标签, 否则会在IE与Safari下报错
 if ($.support.innerHTML && (!rcreate.test(value) && !rnest.test(value))) {
 try {
 for (var i = 0; el = this[i++];) {
 if (el.nodeType === 1) {
 $.each(el[TAGS]("*"), cleanNode);
 el.innerHTML = value;
 }
 }
 return;
 } catch (e) {};
 }
 this.empty().append(value);
 }
 }, null, arguments);
 },
 text: function(item) { // 取得或设置节点的text、innerText或textContent属性
 return $.access(this, function(el) {
 if (this === $) { //getter
 if (el.tagName === "SCRIPT") {
 return el.text; //IE6～IE8下只能用innerHTML、text获取内容
 }
 return el.textContent || el.innerText || $.getText([el]);
 } else { //setter
 this.empty().append(this.ownerDocument.createTextNode(item));
 }
 }, null, arguments);
 },
 outerHTML: function(item) { // 取得或设置节点的outerHTML
 return $.access(this, function(el) {
 if (this === $) { //getter
 return "outerHTML" in el ? el.outerHTML : outerHTML(el);
 } else { //setter
 this.empty().replace(item);
 }
 }, null, arguments);
 }
 
 */

function outerHTML(el) { //主要是用于XML
    switch (el.nodeType + "") {
        case "1":
        case "9":
            return "xml" in el ? el.xml : new XMLSerializer().serializeToString(el);
        case "3":
        case "4":
            return el.nodeValue;
        default:
            return "";
    }
}

function innerHTML(el) { //主要是用于XML
    for (var i = 0, c, ret = []; c = el.childNodes[i++]; ) {
        ret.push(outerHTML(c));
    }
    return ret.join("");
}

var getText = (function() {
    //获取某个节点的文本，如果此节点为元素节点，则取其childNodes的所有文本
    return function getText(nodes) {
        for (var i = 0, ret = "", node; node = nodes[i++]; ) {
            // 处理得文本节点与CDATA的内容
            if (node.nodeType === 3 || node.nodeType === 4) {
                ret += node.nodeValue;
                //取得元素节点的内容
            } else if (node.nodeType !== 8) {
                ret += getText(node.childNodes);
            }
        }
        return ret;
    }
})()

var iframe = document.createElement('iframe');
iframe.setAttribute('frameborder',0);//Firefox下有效，IE下无效


function getIframeDocument(node) { //w3c || IE
    return node.contentDocument || node.contentWindow.document;　　
}

window.onload = function() {
    alert(window != window.top)
    alert(window.frameElement !== null);
    alert(window.eval !== top.eval)
}

if (iframe.addEventListener) {
    iframe.addEventListener("load", callback, false);
} else {
    iframe.attachEvent("onload", callback)
}

/**
<div id="times">0</div>
<script>  
    window.onload = function(){
      var c = document.getElementById("times");  
      var iframe = document.createElement("iframe");  
      iframe.onload = function(){ c.innerHTML = ++c.innerHTML }  
      document.body.appendChild(iframe);  
      iframe.src = "http://www.cnblogs.com/rubylouvre"  
    }
</script>  

 */

window.onload = function(){
    var iframe = document.createElement("iframe");  
    iframe.name = "xxx";
    document.body.appendChild(iframe);  
    iframe.src = "http://www.cnblogs.com/rubylouvre/"  
    alert(frames["xxx"]);//undefined
     alert(document.getElementsByName("xxx").length)//0
}
if ("1"[0]) {//IE6、IE7这里返回undefined,于是跑到第二个分支
    var iframe = document.createElement("iframe");
    iframe.name = name;
} else {
    iframe = document.createElement('<iframe name="' + name + '">');
}
function isSameOrigin(el) {
    var ret = false;
    try {
        ret = !!el.contentWindow.location.href;
    } catch (e) {
    }
    return ret;
}
//跨域通信组件 by 司徒正美 
define(["node"], function($) {
    function Messenger(config) {
        var win = config.target
        if (typeof win === "string") {
            //主页面的target参数应该为iframe元素的CSS表达式
            win = $(win).get(0);
            if (win && win.tagName === 'IFRAME') {
                win = win.contentWindow;
            }
        } else {
            //子页面的target参数恒为parent,以防不小心访问它的其他属性时报错
            win = parent;
        }
        this.win = win;
        this._callbacks = [];
        var mode = document.documentMode;
        if (mode === 8 || mode === 9) {//处理IE8、IE9 postMessage只支持传字符串的情况
            this.hack = true;
        }
        if (typeof config.onmessage === "function") {
            this.receive(config.onmessage);//添加处理函数
        }
        this.init();//开始进行监听
    }

    Messenger.prototype = {
        init: function() {
            var me = this;
            me._callback = function(event) {
                if (event.source != me.win)
                    return;//如果不是来源自win所指向的窗口,返回
                var data = event.data;
                if (typeof data === "string" && data.indexOf("__hack__") === 0) {
                    data = data.replace("__hack__", "");//还原数据
                    data = JSON.parse(data, function(k, v) {
                        if (v.indexOf && v.indexOf('function') > -1) {
                            return eval("(function(){return " + v + " })()")
                        }
                        return v;
                    });
                }
                for (var i = 0, fn; fn = me._callbacks[i++]; ) {
                    fn.call(me, data);
                }
            };
            $.bind(window, "message", me._callback);
        },
        receive: function(fn) {//添加监听函数,处理来自其他页面的数据
            fn.win = this.win;
            this._callbacks.push(fn);
        },
        send: function(data) {//向其他页面发送数据,为兼容起见,建议只传字符串与没有函数的对象
            var str = data, hack = false;
            //如果对象中存在函数,会抛DataCloneError: DOM Exception 25异常,需要序列化补救
            //http://stackoverflow.com/questions/7506635/uncaught-error-data-clone-err-dom-exception-25-thrown-by-web-worker
            if (!this.hack && typeof data === "object") {
                for (var i in data) {//这只是一个简单的检测,只检测一重
                    if (data.hasOwnProperty(i) && typeof data[i] === "function") {
                        hack = true;
                        break;
                    }	
                }
            }
            if (hack || (this.hack && typeof str !== "string")) {
                //在W3C规范中,data可以是任意数据类型
                //这时我们就需要用到JSON进行序列化与反序列化
                //下面是data所有可能的类型
                //JavaScript primitive, such as a string
                //object
                //Array
                //PixelArray object
                //ImageData object
                //Blob
                //File
                //ArrayBuffer
                str = JSON.stringify(str, function(k, v) {
                    if (typeof v === 'function') {
                        return v + '';
                    }
                    return v;
                });
                data = "__hack__" + str;
            }
            this.win.postMessage(data, '*');//parent
        },
        destroy: function() {
            // 解除绑定事件
            if (this._callback) {
                $.unbind(this.win, "message", this._callback)
            }
            // 解除绑定事件IE
            if (document.detachEvent && this._dataavailable) {
                document.detachEvent('ondataavailable', this._dataavailable);
            }
            // 删除实例属性
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            navigator.messages = void 0;
        }
    };
    if (!"1"[0]) {//IE6、IE7
        Messenger.prototype.init = function() {
            var isSameOrigin = false;
            try { //判定是否同源，不同源会无法访问它的属性，并抛出错误
                isSameOrigin = !!this.win.location.href;
            } catch (e) {
            }
            if (isSameOrigin) {
                this.initForSameOrigin();
            } else {
                this.initForCrossDomain();
            }
        };
        Messenger.prototype.initForCrossDomain = function() {
            var fns = navigator.messages = navigator.messages || [];
            var me = this;
            for (var i = 0, fn; fn = this._callbacks[i++]; ) {
                fns.push(fn);
            }
            this.receive = function(fn) {
                fn.win = this.win;
                fns.push(fn);
            };
            this.send = function(data) {
                setTimeout(function() {
                    for (var i = 0, fn; fn = fns[i++]; ) {
                        if (fn.win != me.win) {
                            fn.call(me, data);
                        }
                    }
                });
            };
        };
        Messenger.prototype.initForSameOrigin = function() {
            var me = this;
            this.send = function(data) {
                setTimeout(function() {
                    var event = me.win.document.createEventObject();
                    event.eventType = 'message';
                    event.eventSource = window;
                    event.eventData = data;
                    me.win.document.fireEvent('ondataavailable', event);
                });
            };
            this._dataavailable = function(event) {
                if (event.eventType !== 'message' || event.eventSource != me.win)
                    return;
                for (var i = 0, fn; fn = me._callbacks[i++]; ) {
                    fn.call(me, event.eventData);
                }
            };
            document.attachEvent('ondataavailable', this._dataavailable);
        };
    }

    return Messenger;
});
//如果想在旧版本的标准浏览器支持跨域通信，可以使用window.name

require("messenger,event,ready", function(Messenger, $) {
    var messager = new Messenger({
        target: '#iframe',
        onmessage: function(data) {
            console.log(data)
        }
    });
    $("#iframe").on("load", function() {
        messager.send('发给子页面的消息');
    });
})

require("messenger,event,ready", function(Messenger, $) {
    var messager = new Messenger({
        target: parent,
        onmessage: function(data) {
            console.log(data)
        }
    });
    messager.send('发给父页面的消息');
    messager.send({
        aaa: "发送对象",
        fn: function() {
            var a = 1
        }
    });
})

define(function() {    
    var params = function(obj) {
        var ret = [];
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                ret.push('<param name="', name, '" value="', obj[name], '"/>');
            }
        }
        return ret.join("");
    };
    var props = function(obj) {
        var ret = [];
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                ret.push(name + '="' + obj[name] + '" ');
            }
        }
        return ret.join("");
    };
    var query = function(obj) {
        var ret = [];
        for (var name in obj) {
            if (typeof obj[name] !== "function") {
                ret.push(encodeURIComponent(name) + "=" + encodeURIComponent(obj[name]));
            }
        }
        return ret.join("&");
    };
    /**
     * 创建Flash对象
     * @param {Element} el 放置flash的容器元素
     * @param {Object} obj swf的相关配置
     * @param {String|Object} vars 可选参数,以queryString形式传入
     */
    return function(el, obj, vars) {
        var html, flashvars = typeof vars === "string" ? vars : query(vars);
        // 由于默认的交互参数是JSON格式，会有双引号，需要转义掉，以免HTML解析出错
        flashvars = flashvars.replace(/"/g, '&quot;');
        // IE下必须有id属性，不然与JavaScript交互会报错
        // http://drupal.org/node/319079
        obj.id = obj.id || 'flash' + setTimeout(Date);
        obj.name = obj.name || obj.id;
        obj.width = obj.width || 1;
        obj.height = obj.height || 1;
        obj.flashvars = flashvars;
        if ('classid' in document.createElement('object')) { //旧版本IE
            var paramObj = {},
            propObj = {
                id: obj.id,
                name: obj.name,
                width: obj.width,
                height: obj.height,
                "class": obj["class"],
                data: obj.src, //flash播放器地址
                classid: "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
            };
            for (var name in obj) {
                if (!(name in propObj)) {
                    paramObj[name] = obj[name];
                }
            }
            paramObj.movie = obj.src; //flash播放器地址
            html = "<object " + props(propObj) + ">" + params(paramObj) + "</object>";
        } else {
            //style="width:1px;height:1px" 是为了保证Firefox下正常工作
            obj.style = "width:" + obj.width + "px;height:" + obj.height + "px;";
            obj.type = "application/x-shockwave-flash";
            html = "<embed " + props(obj) + "/>";
        }
        //注意, el必须在DOM 树中， 否则IE8下flash可能无法正常显示与工作
        el.innerHTML = html;
        return el.firstChild; //返回节点供后续操作
    }
});

var elem = document.getElementById("video");
if (elem.requestFullscreen) {
    elem.requestFullscreen();
} else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
} else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
}

var elem = document.getElementById("video");
if (elem.cancelFullscreen) {
    elem.cancelFullscreen();
} else if (elem.mozCancelFullscreen) {
    elem.mozCancelFullscreen();
} else if (elem.webkitCancelFullscreen) {
    elem.webkitCancelFullscreen();
}
function isDocumentInFullScreenMode() {
    // 过去由F11触发的那种浏览器全屏模式和HTML5中内容的全屏模式是不一样的
    return (document.fullScreenElement && document.fullScreenElement !== null) 
    || (!document.mozFullScreen && !document.webkitIsFullScreen);
}
