var ie4 = document.all && !document.getElementById;
if (ie4) {
    document.getElementById = new Function('var expr = /^\\w[\\w\\d]*$/,' +
            'elname=arguments[0]; if(!expr.test(elname)) { return null; } ' +
            'else if(eval("document.all."+elname)) { return ' +
            'eval("document.all."+elname); } else return null;')
}
function getElementsByTagName(str) {
    if (str == "*") {
        return document.all
    } else {
        return document.all.tags(str)
    }
}
//J. Max Wilson
if (/msie/i.test(navigator.userAgent)) {//only override IE
    document.nativeGetElementById = document.getElementById;
    document.getElementById = function(id) {
        var elem = document.nativeGetElementById(id);
        if (elem) {//IE5
            if (elem.id == id) {
                return elem;
            } else {//IE4
                for (var i = 1; i < document.all[id].length; i++) {
                    if (document.all[id][i].id == id) {
                        return document.all[id][i];
                    }
                }
            }
        }
        return null;
    };
}
//Dean Edwards
function getElementsByTagName(node, tagName) {
    var elements = [], i = 0, anyTag = tagName === "*", next = node.firstChild;
    while ((node = next)) {
        if (anyTag ? node.nodeType === 1 : node.nodeName === tagName)
            elements[i++] = node;
        next = node.firstChild || node.nextSibling;
        while (!next && (node = node.parentNode))
            next = node.nextSibling;
    }
    return elements;
}
;
/* document.getElementsBySelector(selector)
 New in version 0.4: Support for CSS2 and CSS3 attribute selectors:
 See http://www.w3.org/TR/css3-selectors/#attribute-selectors
 Download by http://www.bvbsoft.com
 Version 0.4 - Simon Willison, March 25th 2003
 -- Works in Phoenix 0.5, Mozilla 1.3, Opera 7, Internet Explorer 6, Internet Explorer 5 on Windows
 -- Opera 7 fails
 */
//
function getAllChildren(e) {
    //取得一个元素的所有子孙，兼并容IE5 
    return e.all ? e.all : e.getElementsByTagName('*');
}

document.getElementsBySelector = function(selector) {
    //如果不支持getElementsByTagName则直接返回空数组
    if (!document.getElementsByTagName) {
        return new Array();
    }
    //切割CSS选择符，分解一个个单元（每个单元可能代表一个或几个选择器，比如p.aaa则由标签选择器与类选择器组成）
    var tokens = selector.split(' ');
    var currentContext = new Array(document);
    //从左到右检测每个单元，换言之此引擎是自顶向下选元素
    //我们的结果集如果中间为空，那么就立即中止此循环了
    for (var i = 0; i < tokens.length; i++) {
        //去掉两边的空白（但并不是所有的空白都是没用，
        //两个选择器组之间的空白代表着后代选择器，这要看作者们的各显神通了）
        token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
        ;
        //如果包含ID选择器，这里略显粗糙，因为它可能在引号里面
        //此选择器支持到属性选择器，则代表着它可能是属性值的一部分
        if (token.indexOf('#') > -1) {
            // 这里假设这个选择器组以tag#id或#id的形式组成，可能导致BUG
            //但这暂且不谈，我们还是沿着作者的思路进行下去吧
            var bits = token.split('#');
            var tagName = bits[0];
            var id = bits[1];
            //先用ID值取得元素，然后判定元素的tagName是否等于上面的tagName
            //此处有一个不严谨的地方，element可能为null，会引发异常
            var element = document.getElementById(id);
            if (tagName && element.nodeName.toLowerCase() != tagName) {
                // 没有直接返回空结果集
                return new Array();
            }
            //置换currentContext，跳至下一个选择器组
            currentContext = new Array(element);
            continue;
        }
        // 如果包含类选择器，这里也假设它以.class或tag.class的形式
        if (token.indexOf('.') > -1) {

            var bits = token.split('.');
            var tagName = bits[0];
            var className = bits[1];
            if (!tagName) {
                tagName = '*';
            }
            // 从多个父节点出发，取得它们的所有子孙，
            // 这里的父节点即包含在currentContext的元素节点或文档对象
            var found = new Array;//这里是过滤集，通过检测它们的className决定去留
            var foundCount = 0;
            for (var h = 0; h < currentContext.length; h++) {
                var elements;
                if (tagName == '*') {
                    elements = getAllChildren(currentContext[h]);
                } else {
                    elements = currentContext[h].getElementsByTagName(tagName);
                }
                for (var j = 0; j < elements.length; j++) {
                    found[foundCount++] = elements[j];
                }
            }
            currentContext = new Array;
            var currentContextIndex = 0;
            for (var k = 0; k < found.length; k++) {
                //found[k].className可能为空，因此不失为一种优化手段，但new RegExp放在//外围更适合
                if (found[k].className && found[k].className.match(new RegExp('\\b' + className + '\\ b'))) {
                    currentContext[currentContextIndex++] = found[k];
                }
            }
            continue;
        }
        //如果是以tag[attr(~|^$*)=val]或[attr(~|^$*)=val]的形式组合
        if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
            var tagName = RegExp.$1;
            var attrName = RegExp.$2;
            var attrOperator = RegExp.$3;
            var attrValue = RegExp.$4;
            if (!tagName) {
                tagName = '*';
            }
            // 这里的逻辑以上面的class部分相似，其实应该抽取成一个独立的函数
            var found = new Array;
            var foundCount = 0;
            for (var h = 0; h < currentContext.length; h++) {
                var elements;
                if (tagName == '*') {
                    elements = getAllChildren(currentContext[h]);
                } else {
                    elements = currentContext[h].getElementsByTagName(tagName);
                }
                for (var j = 0; j < elements.length; j++) {
                    found[foundCount++] = elements[j];
                }
            }
            currentContext = new Array;
            var currentContextIndex = 0;
            var checkFunction;
            //根据第二个操作符生成检测函数，后面章节会详解，这里不展开
            switch (attrOperator) {
                case '=': // 
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName) == attrValue);
                    };
                    break;
                case '~':
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
                    };
                    break;
                case '|':
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
                    };
                    break;
                case '^':
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName).indexOf(attrValue) == 0);
                    };
                    break;
                case '$':
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
                    };
                    break;
                case '*':
                    checkFunction = function(e) {
                        return (e.getAttribute(attrName).indexOf(attrValue) > -1);
                    };
                    break;
                default :
                    checkFunction = function(e) {
                        return e.getAttribute(attrName);
                    };
            }
            currentContext = new Array;
            var currentContextIndex = 0;
            for (var k = 0; k < found.length; k++) {
                if (checkFunction(found[k])) {
                    currentContext[currentContextIndex++] = found[k];
                }
            }
            continue;
        }
        // 如果没有“#”，“.”，“[”这样的特殊字符，我们就当成是tagName
        tagName = token;
        var found = new Array;
        var foundCount = 0;
        for (var h = 0; h < currentContext.length; h++) {
            var elements = currentContext[h].getElementsByTagName(tagName);
            for (var j = 0; j < elements.length; j++) {
                found[foundCount++] = elements[j];
            }
        }
        currentContext = found;
    }
    return currentContext;//最后返回结果集
}


function getChildren(el) {
    if (el.childElementCount) {
        return [].slice.call(el.children);
    }
    var ret = [];
    for (var node = el.firstChild; node; node = node.nextSibling) {
        node.nodeType == 1 && ret.push(node);
    }
    return ret;
}
function getNext(el) {
    if ("nextElementSibling" in el) {
        return el.nextElementSibling
    }
    while (el = el.nextSibling) {
        if (el.nodeType === 1) {
            return el
        }
    }
    return null;
}

function getPrev(el) {
    if ("previousElementSibling" in el) {
        return el.previousElementSibling;
    }
    while (el = el.previousSibling) {
        if (el.nodeType === 1) {
            return el;
        }
    }
    return null;
}
/**
 "target": function(elem) {
 varhash = window.location && window.location.hash;
 return hash && hash.slice(1) === elem.id;
 },
 "lang": markFunction(function(lang) {
 // lang value must be a valid identifider
 if (!ridentifier.test(lang || "")) {
 Sizzle.error("unsupported lang: " + lang);
 }
 lang = lang.replace(runescape, funescape).toLowerCase();
 return function(elem) {
 var elemLang;
 do {
 if ((elemLang = documentIsXML ? elem.getAttribute("xml:lang") || elem.getAttri bute("lang") : elem.lang)) {
 
 elemLang = elemLang.toLowerCase();
 return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
 }
 } while ((elem = elem.parentNode) && elem.nodeType === 1);
 return false;
 };
 }),
 
 lang: { //标准 CSS3语言伪类
 exec: function(flags, elems, arg) {
 var result = [],
 reg = new RegExp("^" + arg, "i"),
 flag_not = flags.not;
 for (var i = 0, ri = 0, elem; elem = elems[i++];) {
 var tmp = elem;
 while (tmp && !tmp.getAttribute("lang"))
 tmp = tmp.parentNode;
 tmp = !! (tmp && reg.test(tmp.getAttribute("lang")));
 if (tmp ^ flag_not) result[ri++] = elem;
 }
 return result;
 }
 },
 "empty": function(elem) {
 for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
 if (elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4) {
 return false;
 }
 }
 return true;
 },
 
 "empty": function(node) {
 var child = node.firstChild;
 return !(child && child.nodeType == 1) && !(node.innerText || node.textContent || '').length;
 },
 
 */
var isXML = Sizzle.isXML = function(elem) {
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
};
try {
    var doc = document.implementation.createDocument(null, 'HTML', null);
    alert(doc.documentElement)
    alert(isXML(doc))
} catch (e) {
    alert("不支持creatDocument方法")
}
var isXML = function(document) {
    return (!!document.xmlVersion) || (!!document.xml) || (toString.call(document) == '[object XMLDocument]')
            || (document.nodeType == 9 && document.documentElement.nodeName != 'HTML');
};
var isXML = window.HTMLDocument ? function(doc) {
    return !(doc instanceof HTMLDocument)
} : function(doc) {
    return "selectNodes" in doc
}
var isXML = function(doc) {
    return doc.createElement("p").nodeName !== doc.createElement("P").nodeName;
};
//Sizzle 1.10.15
/*
 if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
 results.push(elem);
 return results
 }
 */

//Sizzle 1.10.15
var rnative = /^[^{]+\{\s*\[native \w/,
        hasCompare = rnative.test(docElem.compareDocumentPosition),
        contains = hasCompare || rnative.test(docElem.contains) ?
        function(a, b) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                    bup = b && b.parentNode;
            return a === bup || !!(bup && bup.nodeType === 1 && (
                    adown.contains ?
                    adown.contains(bup) :
                    a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                    ));
        } :
        function(a, b) {
            if (b) {
                while ((b = b.parentNode)) {
                    if (b === a) {
                        return true;
                    }
                }
            }
            return false;
        };

contains = function(a, b, same) {
    // 第一个节点是否包含第二个节点, same允许两者相等
    if (a === b) {
        return !!same;
    }
    if (!b.parentNode)
        return false;
    if (a.contains) {
        return a.contains(b);
    } else if (a.compareDocumentPosition) {
        return !!(a.compareDocumentPosition(b) & 16);
    }
    while ((b = b.parentNode))
        if (a === b)
            return true;
    return false;
}

// Compare Position - MIT Licensed, John Resig
function comparePosition(a, b) {
    return a.compareDocumentPosition ? a.compareDocumentPosition(b) :
            a.contains ? (a != b && a.contains(b) && 16) +
            (a != b && b.contains(a) && 8) +
            (a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
                    (a.sourceIndex < b.sourceIndex && 4) +
                    (a.sourceIndex > b.sourceIndex && 2) : 1) : 0;
}

window.onload = function() {
    function shuffle(a) {
        //洗牌
        var array = a.concat();
        var i = array.length;
        while (i) {
            var j = Math.floor(Math.random() * i);
            var t = array[--i];
            array[i] = array[j];
            array[j] = t;
        }
        return array;
    }
    var log = function(s) {
        //查看调试消息
        window.console && window.console.log(s)
    }
    var sliceNodes = function(arr) {
        //将NodeList转换为纯数组
        var ret = [],
                i = arr.length;
        while (i)
            ret[--i] = arr[i];
        return ret;
    }

    var sortNodes = function(a, b) {
        //节点排序
        var p = "parentNode",
                ap = a[p],
                bp = b[p];
        if (a === b) {
            return 0
        } else if (ap === bp) {
            while (a = a.nextSibling) {
                if (a === b) {
                    return -1
                }
            }
            return 1
        } else if (!ap) {
            return -1
        } else if (!bp) {
            return 1
        }
        var al = [],
                ap = a
        //不断往上取，一直取到HTML
        while (ap && ap.nodeType === 1) {
            al[al.length] = ap
            ap = ap[p]
        }
        var bl = [],
                bp = b;
        while (bp && bp.nodeType === 1) {
            bl[bl.length] = bp
            bp = bp[p]
        }
        //然后逐一去掉公共祖先
        ap = al.pop();
        bp = bl.pop();
        while (ap === bp) {
            ap = al.pop();
            bp = bl.pop();
        }
        if (ap && bp) {
            while (ap = ap.nextSibling) {
                if (ap === bp) {
                    return -1
                }
            }
            return 1
        }
        return ap ? 1 : -1
    }

    var els = document.getElementsByTagName("*")
    els = sliceNodes(els); 	//转换成纯数组
    log(els);
    els = shuffle(els); 	//洗牌（模拟选择器引擎最初得到的结果集的情况）
    log(els);
    els = els.sort(sortNodes); //进行节点排序
    log(els);
}
features.documentSorter = (root.compareDocumentPosition) ? function(a, b) {
    if (!a.compareDocumentPosition || !b.compareDocumentPosition)
        return 0;
    return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
} : ('sourceIndex' in root) ? function(a, b) {
    if (!a.sourceIndex || !b.sourceIndex)
        return 0;
    return a.sourceIndex - b.sourceIndex;
} : (document.createRange) ? function(a, b) {
    if (!a.ownerDocument || !b.ownerDocument)
        return 0;
    var aRange = a.ownerDocument.createRange(),
            bRange = b.ownerDocument.createRange();
    aRange.setStart(a, 0);
    aRange.setEnd(a, 0);
    bRange.setStart(b, 0);
    bRange.setEnd(b, 0);
    return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
} : null;
function unique(nodes) {
    if (nodes.length < 2) {
        return nodes;
    }
    var result = [],
            array = [],
            uniqResult = {},
            node = nodes[0],
            index, ri = 0,
            sourceIndex = typeof node.sourceIndex === "number",
            compare = typeof node.compareDocumentPosition == "function";
//如果支持sourceIndex，我们将使用更为高效的节点排序
//http://www.cnblogs.com/jkisjk/archive/2011/01/28/array_quickly_sortby.html

    if (!sourceIndex && !compare) { //用于旧版本IE的XML
        var all = (node.ownerDocument || node).geElementsByTagName("*");
        for (var index = 0; node = all[index]; index++) {
            node.setAttribute("sourceIndex", index);
        }
        sourceIndex = true;
    }
    if (sourceIndex) { //IE opera
        for (var i = 0, n = nodes.length; i < n; i++) {
            node = nodes[i];
            index = (node.sourceIndex || node.getAttribute("sourceIndex")) + 1e8;
            if (!uniqResult[index]) {		//去重
                (array[ri++] = new String(index))._ = node;
                uniqResult[index] = 1;
            }
        }
        array.sort();						//排序
        while (ri)
            result[--ri] = array[ri]._;
        return result;
    } else {
        nodes.sort(sortOrder);				//排序
        if (sortOrder.hasDuplicate) {		//去重
            for (i = 1; i < nodes.length; i++) {
                if (nodes[i] === nodes[i - 1]) {
                    nodes.splice(i--, 1);
                }
            }
        }
        sortOrder.hasDuplicate = false;	//还原
        return nodes;
    }
}


function sortOrder(a, b) {
    if (a === b) {
        sortOrder.hasDuplicate = true;
        return 0;
    } //现在标准浏览器的HTML与XML好像都支持compareDocumentPosition
    if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
        return a.compareDocumentPosition ? -1 : 1;
    }
    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
}
var reg_split =
/^[\w\u00a1-\uFFFF\-\*]+|[#.:][\w\u00a1-\uFFFF-]+(?:\([^\])*\))?|\[[^\]]*\]|(?:\s*) [>+~,](?:\s*)|\s(?=[\w\u00a1-\uFFFF*#.[:])|^\s+/;
var slim = /\s+|\s*[>+~,*]\s*$/
function spliter(expr) {
    var flag_break = false;
    var full = [];//这里放置切割单个选择器群组得到的词素，以“,”为界
    var parts = [];//这里放置切割单个选择器组得到的词素，以关系选择器为界
    do {
        expr = expr.replace(reg_split, function(part) {
            if (part === ",") {//这个切割器只处理到第一个并联选择器
                flag_break = true;
            } else {
                if (part.match(slim)) {//对关系并联，通配符选择器两边的空白进行处理
                    //对parts进行反转，因为div.aaa，反转后先处理.aaa
                    full = full.concat(parts.reverse(), part.replace(/\s/g, ''));
                    parts = [];
                } else {
                    parts[parts.length] = part;
                }
            }
            return "";//去掉已经处理了的部分
        });
        if (flag_break)
            break;
    } while (expr)
    full = full.concat(parts.reverse());
    !full[0] && full.shift();//去掉开头第一个空白
    return full;
}
var expr = "  div  >  div#aaa,span"
console.log(spliter(expr));//["div",">","#aaa", "div"]

for (i = 0, ri = 0, elem; elem = elems[i++];) {
    if(!op){
        flag = Icarus.hasAttribute(elem,name,flag_xml);//[title]
    }else if(val ==="" && op > 3){
        flag =false
    }else{
        attr = Icarus.getAttribute(elem,name,flag_xml);
        switch (op) {
            case 1:// = 属性值全等于给出值
                flag = attr === val;
                break;
            case 2://!= 非标准，属性值不等于给出值
                flag = attr !== val;
                break;
            case 3://|= 属性值以“-”分割成两部分，给出值等于其中一部分，或全等于属性值
                flag = attr === val || attr.substring(0, val.length + 1) === val +"-";
                break;
            case 4://~= 属性值为多个单词，给出值为其中一个
                flag = attr !=="" && (" " + attr +" ").indexOf(val) >= 0;
                break;
            case 5://^= 属性值以给出值开头
                flag = attr !=="" && attr.indexOf(val) === 0 ;
                break;
            case 6://$= 属性值以给出值结尾
                flag = attr !=="" && attr.lastIndexOf(val) + val.length === attr.length;
                break;
            case 7://*= 属性值包含给出值
                flag = attr !=="" && attr.indexOf(val) >= 0;
                break;
        }
    }
    if (flag ^ flag_not)
        tmp[ri++] = elem;
}
var expr = ":nth-child(2n+1)"，
    rsequence = /^([#\.:]|\[\s*]((?:[-\w]|[^\x00-\xa0]|\\.)+)/,
    rpseudo = /^\(\s*("([^"]*)"|'([^']*)'|[^\(\)]*(\([^\(\)]*\))?)\s*\)/，
    rBackslash = /\\/g, 
    //这里把伪类从选择符里分解出来
    match = expr.match(rsequence); //[":nth-child",":", "nth-child"]
    expr = RegExp.rightContext;//用它左边的部分重写expr--> "(2n+1)""
      key = (match[2] || "").replace(rBackslash, "");//去掉换行符 key--> "nth-child"
switch (match[1]) {
    case "#":
        //ID选择器 略
        break;
    case ".":
        //类选择器 略
        break;
    case ":":
        //伪类 略
        tmp = Icarus.pseudoHooks[key];
        //Icarus.pseudoHooks里面放置我们所有能处理的伪类
        if (match = expr.match(rpseudo)) {
            expr = RegExp.rightContext;//继续取它左边的部分重写expr
            if ( !! ~key.indexOf("nth")) {//如果是子元素过滤伪类
                args = parseNth[match[1]] || parseNth(match[1]);//分解小括号的传参
            } else {
                args = match[3] || match[2] || match[1]
            }
        }
        break
    default:
        //属性选择器 略
        break;
}

function parseNth(expr) {
    var orig = expr
    expr = expr.replace(/^\+|\s*/g, ''); //清除无用的空白
    var match = (expr === "even" && "2n" || expr === "odd" && "2n+1" || !/\D/.test(expr) && "0n+" + expr || expr).match(/(-?)(\d*)n([-+]?\d*)/);
    return parse_nth[orig] = {
        a: (match[1] + (match[2] || 1)) - 0,
        b: match[3] - 0
    };
}

https://github.com/jquery/sizzle/blob/1.7.2/sizzle.js
var Sizzle = function(selector, context, results, seed) {
//通过短路运算符,设置一些默认值
    results = results || [];
    context = context || document;
//备份,因为context会被改写,如果出现并联选择器,没备份会找不到北
    var origContext = context;
//上下文对象必须是元素节点或文档对象
    if (context.nodeType !== 1 && context.nodeType !== 9) {
        return [];
    }
//选择符必须是字符串,且不能为空
    if (!selector || typeof selector !== "string") {
        return results;
    }

    var m, set, checkSet, extra, ret, cur, pop, i,
            prune = true,
            contextXML = Sizzle.isXML(context),
            parts = [],
            soFar = selector;
//下面是切割器的实现,每次只处理到并联选择器，extra留给下次递归自身时作传参
//不过与其他引擎的实现不同的是，它没有一下子切成选择器，而是切成选择器组与关系选择器的集合
//比如 body div > div:not(.aaa),title
//将会得到parts数组：["body","div",">", "div:not(.aaa)"]
//后代选择器虽然被忽略了，但在循环这个数组时，它默认每两个选择器组中一定夹着关系选择器
//不存在就放在后代选择器到那个位置上
    do {
        chunker.exec(""); //这一步主要是将chunker的lastIndex重置，当然直接设置chunker. lastIndex效果也一样
        m = chunker.exec(soFar);
        if (m) {
            soFar = m[3];
            parts.push(m[1]);
            if (m[2]) { //如果存在并联选择器，就中断
                extra = m[3];
                break;
            }
        }
    } while (m);
//……略
}
//这是针对最左边的选择器组存在ID做出的优化
ret = Sizzle.find(parts.shift(), context, contextXML);
context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];

ret = seed ? {
    expr: parts.pop(),
    set: makeArray(seed)
    //这里会对~,+进行优化,直接取它的上一级做上下文
    //处理一个上下文对象胜过对付N个上下文
} : Sizzle.find(parts.pop(),parts.length === 1 && 
     (parts[0] === "~" || parts[0] === "+") && context.parentNode ? 
    context.parentNode : context, contextXML);

set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
Sizzle.find = function(expr, context, isXML) {
    var set, i, len, match, type, left;

    if (!expr) {
        return [];
    }

    for (i = 0, len = Expr.order.length; i < len; i++) {
        type = Expr.order[i];
        //取得正则,匹想出需要的ID、CLASS、NAME、TAG
        if ((match = Expr.leftMatch[type].exec(expr))) {
            left = match[1];
            match.splice(1, 1);
            //处理换行符
            if (left.substr(left.length - 1) !== "\\") {
                match[1] = (match[1] || "").replace(rBackslash, "");
                set = Expr.find[type](match, context, isXML);
                //如果不为undefined,那么去掉选择器组中用过的部分
                if (set != null) {
                    expr = expr.replace(Expr.match[type], "");
                    break;
                }
            }
        }
    }

    if (!set) { //没有,寻找该上下文对象的所有子孙
        set = typeof context.getElementsByTagName !== "undefined" ? 
        context.getElementsByTagName("*") : [];
    }

    return {
        set: set,
        expr: expr
    };
};

Sizzle.filter = function(expr, set, inplace, not) {
    //用于生成种子集或映射集,这视第三个参数而定
    //expr: 选择符
    //set:  元素数组
    //inplace:undefined, null时进入生成种子集模式,true时进入映射集模式
    //not:  一个布尔值,来源自取反选择器
    var match, anyFound,
    type, found, item, filter, left,
    i, pass,
    old = expr,
        result = [],
        curLoop = set,
        isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

    while (expr && set.length) {
        for (type in Expr.filter) { //ID,TAG,CLASS,TAG,CHILD,POS,PSEUDO
            if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                //切割出相应的字符串,作为传参放进filter里面
                filter = Expr.filter[type];
                left = match[1];
                //ID -->    ["#aaa","","aaa"]
                //CLASS --> [".aaa","","aaa"]
                //TAG-->    ["div","","div"]
                //ATTR-->   ["[aaa=ggg]", "", "aaa", "^=", undefined, undefined, "ggg"]
                //CHILD--> [":nth-child(even)", "", "nth-child", "", "even"]
                //POS-->    [":eq(2)", "", "eq", "2"]
                //PSEUDO-->[":not(.aaa)", "", "not", "", ".aaa"]
                anyFound = false;
                match.splice(1, 1);

                if (left.substr(left.length - 1) === "\\") {
                    continue;
                }

                if (curLoop === result) {
                    result = [];
                }

                if (Expr.preFilter[type]) {
                    match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                    //这里会对传参进行加工,比如#aaa得到aaa, .bbb得到bbb,
                    //出于优化需要,它会在Expr.preFilter.CLASS进行过滤,
                    //而不用等于Expr.filter.ClASS
                    //另外,针对CHILD, POS,它会两入进入这个循环,因为它们同时也能被
                    //Expr.leftMatch.PSEUDO匹配,但它不想被Expr.filter.PSEUDO处理
                    //于是直接continue
                    if (!match) { //CLASS
                        anyFound = found = true;

                    } else if (match === true) { //CHILD, POS
                        continue;
                    }
                }

                if (match) {
                    //curLoop为一个映射集,里面包含false, true
                    for (i = 0;
                     (item = curLoop[i]) != null; i++) {
                        if (item) {
                            found = filter(item, match, i, curLoop);
                            pass = not ^ found;
                            //在映射集模式下,将不匹配的元素置换为false
                            if (inplace && found != null) {
                                if (pass) {
                                    anyFound = true;

                                } else {
                                    curLoop[i] = false;
                                }
                                //否则result为我们的种子集,把匹配者放进去
                            } else if (pass) {
                                result.push(item);
                                anyFound = true;
                            }
                        }
                    }
                }

                if (found !== undefined) {
                    if (!inplace) {
                        curLoop = result; //重写种子集为curLoop
                    }
                    //削减选择符直到变为空字符串
                    expr = expr.replace(Expr.match[type], "");

                    if (!anyFound) {
                        return [];
                    }

                    break;
                }
            }
        }

        // //如果到最后正则表达式也不能改动选择符，说明它有问题
        if (expr === old) {
            if (anyFound == null) {
                Sizzle.error(expr);

            } else {
                break;
            }
        }

        old = expr;
    }

    return curLoop;
};


while (parts.length) {
    cur = parts.pop(); //取得关系选择器
    pop = cur;
    if (!Expr.relative[cur]) {
        cur = ""; //如果不是则默认为后代选择器
    } else {
        pop = parts.pop(); //取得后代选择器前面的子选择器群集
    }
    if (pop == null) {
        pop = context;
    }
    Expr.relative[cur](checkSet, pop, contextXML); //根据其他四种迭代器改变映射集里面的元素
    //得到诸如[ [object HTMLDivElement] ,false, false, [object HTMLSpanElement] ]的集合
}


for (i = 0; checkSet[i] != null; i++) {
    if (checkSet[i] && checkSet[i].nodeType === 1) {
        results.push(set[i]);
    }
}
if (extra) {
    Sizzle(extra, origContext, results, seed);
    Sizzle.uniqueSort(results);
}
if (document.querySelectorAll) {
    (function() {
        var oldSizzle = Sizzle,
            div = document.createElement("div"),
            id = "__sizzle__";

        div.innerHTML = "<p class='TEST'></p>";
        //Safari在怪异模式下querySelectorAll不能工作,中止重写
        if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
            return;
        }

        Sizzle = function(query, context, extra, seed) {
            context = context || document;
            // querySelectorAll只能用于HTML文档,在标准浏览器的XML文档中
            //虽然也实现了此接口,但不能工作

            if (!seed && !Sizzle.isXML(context)) {
                // See if we find a selector to speed up
                var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

                if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                    // 优化只有单个标签选择器的情况
                    if (match[1]) {
                        return makeArray(context.getElementsByTagName(query), extra);
                        // 优化只有单个类选择器的情况

                    } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                        return makeArray(context.getElementsByClassName(match[2]), extra);
                    }
                }

                if (context.nodeType === 9) {
                    // 优化只有选择符为body的情况
                    // 因为文档只有它一个标签,并且有对应属性直接取它
                    if (query === "body" && context.body) {
                        return makeArray([context.body], extra);
                        // 优化只有ID选择器的情况
                        // Speed-up: Sizzle("#ID")
                    } else if (match && match[3]) {
                        var elem = context.getElementById(match[3]);
                        //注意,浏览器也会优化过度,它会缓存了上次的结果
                        //即便它现在已经被移出DOM树(Blackberry 4.6) 
                        if (elem && elem.parentNode) {
                            //IE与Opera会混淆ID与NAME,确保ID等于目标值
                            if (elem.id === match[3]) {
                                return makeArray([elem], extra);
                            }

                        } else {
                            return makeArray([], extra);
                        }
                    }

                    try {
                        return makeArray(context.querySelectorAll(query), extra);
                    } catch (qsaError) {}

        //IE8的querySelectorAll实现存在BUG，它会在包含自己的集合内查找符合自己的元素节点
                    //根据规范，应该是在当前上下文的所有子孙下找
                    //IE8下如果元素节点为Object，无法找到元素
                    } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                    var oldContext = context,
                        old = context.getAttribute("id"),
                        nid = old || id,
                        hasParent = context.parentNode,
                        relativeHierarchySelector = /^\s*[+~]/.test(query);

                    if (!old) {
                        context.setAttribute("id", nid);
                    } else {
                        nid = nid.replace(/'/g, "\\$&");
                    }
                    if (relativeHierarchySelector && hasParent) {
                        context = context.parentNode;
                    }
    //如果存在ID，则将ID取得出来放到这个分组的最前面，比如div b --> [id=xxx] div b
                    //不存在ID，就创建一个ID，重复上面的操作，但最后会删掉此ID
                    try {
                        if (!relativeHierarchySelector || hasParent) {
                            return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                        }

                    } catch (pseudoError) {} finally {
                        if (!old) {
                            oldContext.removeAttribute("id");
                        }
                    }
                }
            }

            return oldSizzle(query, context, extra, seed);
        };
        //将原来的方法重新绑定到新Sizzle函数上
        for (var prop in oldSizzle) {
            Sizzle[prop] = oldSizzle[prop];
        }

        // release memory in IE
        div = null;
    })();
}
var tag = "getElementsByTagName", sqa = "querySelectorAll";
alert(document[tag]("div")==document[tag]("div")); //true
alert(document[sqa]("div")==document[sqa]("div")); //false
