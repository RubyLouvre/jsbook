var getStyle = function(el, name) {
    if (el.style) {
        name = name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
        if (window.getComputedStyle) {
            //getComputedStyle的第二个伪类是用于对付伪类的，如滚动条，placeholder，
            //但IE9不支持，因此我们只管元素节点，上面的el.style过滤掉了
            return el.ownerDocument.getComputedStyle(el, null)[ name ]
        } else {
            return el.currentStyle[ name ];
        }
    }
}

var adapter = $.cssHooks = {};
adapter["_default:set"] = function(node, name, value) {
    node.style[name] = value;
};

if (window.getComputedStyle) {
    $.getStyles = function(node) {
        return window.getComputedStyle(node, null);
    };
    adapter["_default:get"] = function(node, name, styles) {
        var ret, width, minWidth, maxWidth
        styles = styles || getStyles(node);
        if (styles) {
            ret = name === "filter" ? styles.getPropertyValue(name) : styles[name]
            var style = node.style;
            //这里只有Firefox与IE10会智能处理未插入DOM树的节点的样式,它会自动找内联样式
            if (ret === "" && !$.contains(node.ownerDocument, node)) {
                ret = style[name]; //其他浏览器需要我们手动取内联样式
            }
            //Dean Edwards大神的hack，用于转换margin的百分比值为更有用的像素值
            // webkit不能转换top、bottom、left、right、margin、text-indent的百分比值
            if (/^margin/.test(name) && rnumnonpx.test(ret)) {
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;
                style.minWidth = style.maxWidth = style.width = ret;
                ret = styles.width;
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }
        return ret;
    };
} else {
    $.getStyles = function(node) {
        return node.currentStyle;
    };
    var ie8 = !!window.XDomainRequest,
            rfilters = /[\w\:\.]+\([^)]+\)/g,
            rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
            border = {
        thin: ie8 ? '1px' : '2px',
        medium: ie8 ? '3px' : '4px',
        thick: ie8 ? '5px' : '6px'
    };
    adapter["_default:get"] = function(node, name, styles) {
        //取得精确值，不过它有可能是带em、pc、mm、pt,%等单位
        var currentStyle = styles || node.currentStyle;
        var ret = currentStyle[name];
        if ((rnumnonpx.test(ret) && !rposition.test(ret))) {
            //①保存原有的style、left, runtimeStyle.left
            var style = node.style,
                    left = style.left,
                    rsLeft = node.runtimeStyle.left;
            //②由于③处的style.left = xxx会影响到currentStyle.left，
            //因此把它currentStyle.left放到runtimeStyle.left，
            //runtimeStyle.left拥有最高优先级，不会style.left影响
            node.runtimeStyle.left = currentStyle.left;
            //③将精确值赋给到style.left，然后通过IE的另一个私有属性 style.pixelLeft
            //得到单位为px的结果，fontSize的分支见http://bugs.jquery.com/ticket/760
            style.left = name === 'fontSize' ? '1em' : (ret || 0);
            ret = style.pixelLeft + "px";
            //④还原 style.left，runtimeStyle.left
            style.left = left;
            node.runtimeStyle.left = rsLeft;
        }
        if (ret === "medium") {
            name = name.replace("Width", "Style");
            //border width 默认值为medium，即使其为"0"
            if (currentStyle[name] === "none") {
                ret = "0px";
            }
        }
        return ret === "" ? "auto" : border[ret] || ret;
    }
}
$.css = function(node, name, value, styles) {
    if (node.style) { 
        var prop = /\_/.test(name) ? $.String.camelize(name) : name;
        name = $.cssName(prop) || prop;
        styles = styles || getStyles(node);
        if (value === void 0) { //获取样式
            return(adapter[prop + ":get"] || getter)(node, name, styles);
        } else { //设置样式
            var type = typeof value,
                    temp;
            if (type === "string" && (temp = rrelNum.exec(value))) {

                value = (+(temp[1] + 1) * +temp[2]) + parseFloat($.css(node, name, void 0, styles));
                type = "number";

            }
            if (type === "number" && !isFinite(value + "")) {
                return;
            }
            if (type === "number" && !$.cssNumber[prop]) {
                value += "px";
            }
            if (value === "" && !$.support.cloneBackgroundStyle && name.indexOf("background") === 0) {
                node.style[name] = "inherit";
            }
            var fn = adapter[prop + ":set"] || adapter["_default:set"];
            fn(node, name, value, styles);
        }
    }
};


var prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
var cssMap = {
    "float": $.support.cssFloat ? 'cssFloat' : 'styleFloat',
    background: "backgroundColor"
};

function cssName(name, host, camelCase) {
    if (cssMap[name]) {
        return cssMap[name];
    }
    host = host || document.documentElement
    for (var i = 0, n = prefixes.length; i < n; i++) {
        camelCase = $.String.camelize(prefixes[i] + name);
        if (camelCase in host) {
            return (cssMap[name] = camelCase);
        }
    }
    return null;
}

adapter[ "opacity:get" ] = function( node){
    //这是最快的获取IE透明值的方式，不需要动用正则了！
     var alpha = node.filters.alpha || node.filters[salpha],
        op = alpha ? alpha.opacity: 100;
      return ( op /100 )+"";//确保返回的是字符串
}

rfilters = /[\w\:\.]+\([^)]+\)/g
adapter["opacity:set"] = function(node, name, value, currentStyle) {
    var style = node.style;
    if (!isFinite(value)) { //"xxx" * 100 = NaN
        return;
    }
    value = (value > 0.999) ? 100 : (value < 0.001) ? 0 : value * 100;
    if (!currentStyle.hasLayout)
        style.zoom = 1; //让元素获得hasLayout
    var filter = currentStyle.filter || style.filter || "";
    //http://snook.ca/archives/html_and_css/ie-position-fixed-opacity-filter
    //IE7、IE8的透明滤镜当其值为100时会让文本模糊不清
    if (value === 100) { //IE7、IE8的透明滤镜当其值为100时会让文本模糊不清
        value = style.filter = filter.replace(rfilters, function(a) {
            return /alpha/i.test(a) ? "" : a; //可能存在多个滤镜，只清掉透明部分
        });
        //如果只有一个透明滤镜 就直接去掉
        if (value.trim() === "" && style.removeAttribute) {
            style.removeAttribute("filter");
        }
        return;
    }
    //如果已经设置过透明滤镜，可以使用以下便捷方式
    var alpha = node.filters.alpha || node.filters[salpha];
    if (alpha) {
        alpha.opacity = value;
    } else {
        style.filter = ((filter ? filter + "," : "") + "alpha(opacity=" + value + ")");
    }
};

adapter[ "userSelect:set" ] = function(node, name, value) {
    var allow = /none/.test(value) ? "on" : "",
            e, i = 0, els = node.getElementsByTagName('*');
    node.setAttribute('unselectable', allow);
    while ((e = els[ i++ ])) {
        switch (e.tagName.toLowerCase()) {
            case 'iframe' :
            case 'textarea' :
            case 'input' :
            case 'select' :
                break;
            default :
                e.setAttribute('unselectable', allow);
        }
    }
};

adapter[ "backgroundPosition:get" ] = function( node, name, value ) {
        var style = node.currentStyle;
        return style.backgroundPositionX +" "+style.backgroundPositionX
 };

adapter["zIndex:get"] = function(node) {
    while (node.nodeType !== 9) {
    //即使元素定位了，但如果zindex设置为"aaa"这样的无效值，浏览器都会返回auto
        //如果没有指定zindex值，IE会返回数字0，其他返回auto
        var position = getter(node, "position") || "static";
        if (position !== "static") {
            // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
            var value = parseInt(getter(node, "zIndex"), 10);
            if (!isNaN(value) && value !== 0) {
                return value;
            }
        }
        node = node.parentNode;
    }
    return 0;
};

function showHidden(node, array) {
    //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
    if (node && node.nodeType === 1 && node.offsetWidth <= 0) { //opera.offsetWidth可能小于0
        if (getter(node, "display") === "none") {
            var obj = {
                node: node
            };
            for (var name in cssShow) {
                obj[name] = node.style[name];
                node.style[name] = cssShow[name] || $.parseDisplay(node.nodeName);
            }
            array.push(obj);
        }
        showHidden(node.parentNode, array);
    }
}
windowWidth = document.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

windowWidth = document.documentElement.clientWidth

windowWidth = window.innerWidth;

var pageWidth = Math.max( document.documentElement.scrollWidth, 
document.documentElement.offsetWidth, document.documentElement.clientWidth, 
document.body.scrollWidth, document.body.offsetWidth);


var cssBoxSizing = $.cssName("box-sizing");
adapter["boxSizing:get"] = function(node, name) {
    return cssBoxSizing ? getter(node, name) : document.compatMode === "BackCompat"
    ? "border-box" : "content-box";
};

var cssPair = {
    width: ['Left', 'Right'],
    height: ['Top', 'Bottom']
};
var cssShow = {
    position: "absolute",
    visibility: "hidden",
    display: "block"
};
function toNumber(styles, name) {
    return parseFloat(styles[name]) || 0;
}

function showHidden(node, array) {
//略
}

function setWH(node, name, val, extra) {
    var which = cssPair[name],
            styles = getStyles(node);
    which.forEach(function(direction) {
        if (extra < 1)
            val -= toNumber(styles, 'padding' + direction);
        if (extra < 2)
            val -= toNumber(styles, 'border' + direction + 'Width');
        if (extra === 3) {
            val += parseFloat(getter(node, 'margin' + direction, styles)) || 0;
        }
        if (extra === "padding-box") {
            val += toNumber(styles, 'padding' + direction);
        }
        if (extra === "border-box") {
            val += toNumber(styles, 'padding' + direction);
            val += toNumber(styles, 'border' + direction + 'Width');
        }
    });
    return val;
}

function getWH(node, name, extra) { //注意 name是首字母大写
    var hidden = [];
    showHidden(node, hidden);
    var val = setWH(node, name, node["offset" + name], extra);
    for (var i = 0, obj; obj = hidden[i++]; ) {
        node = obj.node;
        for (name in obj) {
            if (typeof obj[name] === "string") {
                node.style[name] = obj[name];
            }
        }
    }
    return val;
}

"Height,Width".replace($.rword, function(name) {
    var lower = name.toLowerCase(),
            clientProp = "client" + name,
            scrollProp = "scroll" + name,
            offsetProp = "offset" + name;
    $.cssHooks[lower + ":get"] = function(node) {
        return getWH(node, name, 0) + "px"; //添加相应适配器
    };
    $.cssHooks[lower + ":set"] = function(node, nick, value) {
        var box = $.css(node, "box-sizing"); //nick防止与外面name冲突
        node.style[nick] = box === "content-box" ? value : 
                setWH(node, name, parseFloat(value), box) + "px";
    };
    "inner_1,b_0,outer_2".replace($.rmapper, function(a, b, num) {
        var method = b === "b" ? lower : b + name;
        $.fn[method] = function(value) {
            num = b === "outer" && value === true ? 3 : Number(num);
            value = typeof value === "boolean" ? void 0 : value;
            if (value === void 0) {
                var node = this[0]
                if ($.type(node, "Window")) { //取得窗口尺寸,IE9后可以用node.innerWidth /innerHeight代替
                    return node["inner" + name] || node.document.documentElement[clientProp];
                }
                if (node.nodeType === 9) { //取得页面尺寸
                    var doc = node.documentElement;
                    //FF chrome    html.scrollHeight< body.scrollHeight
                    //IE 标准模式 : html.scrollHeight> body.scrollHeight
                    //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                    return Math.max(node.body[scrollProp], doc[scrollProp], 
                    node.body[offsetProp], doc[offsetProp], doc[clientProp]);
                }
                return getWH(node, name, num);
            } else {
                for (var i = 0; node = this[i++]; ) {
                    $.css(node, lower, value);
                }
            }
            return this;
        };
    });
});

$.fn.show = function() {
    return this.each(function() {
        this.style.display = "";
    });
};
$.fn.hide = function() {
    return this.each(function() {
        this.style.display = "none";
    });
};
$.fn.toggle = function( ) {
    return this.each(function() {
        this.style.display = isHidden(this) ? "" : "none";
    });
};

var cacheDisplay = $.oneObject("a,abbr,b,span,strong,em,font,i,kbd", "inline"),
        blocks = $.oneObject("div,h1,h2,h3,h4,h5,h6,section,p", "block");
$.mix(cacheDisplay, blocks);
$.parseDisplay = function(nodeName) {
    //用于取得此类标签的默认display值
    nodeName = nodeName.toLowerCase();
    if (!cacheDisplay[nodeName]) {
        $.applyShadowDOM(function(win, doc, body, val) {
            var node = doc.createElement(nodeName);
            body.appendChild(node);
            if (win.getComputedStyle) {
                val = win.getComputedStyle(node, null).display;
            } else {
                val = node.currentStyle.display;
            }
            cacheDisplay[nodeName] = val;
        });
    }
    return cacheDisplay[nodeName];
};
//https://developer.mozilla.org/en-US/docs/DOM/window.getDefaultComputedStyle
if (window.getDefaultComputedStyle) {
    $.parseDisplay = function(nodeName) {
        nodeName = nodeName.toLowerCase();
        if (!cacheDisplay[nodeName]) {
            var node = document.createElement(nodeName);
            var val = window.getDefaultComputedStyle(node, null).display;
            cacheDisplay[nodeName] = val;
        }
        return cacheDisplay[nodeName];
    };
}

var shadowRoot, shadowDoc, shadowWin, reuse;
$.applyShadowDOM = function(callback) {
    //用于提供一个沙箱环境,IE6～IE10、Opera、Safari、Firefox使用iframe, Chrome20+(25+不需要开启实验性JavaScript)使用Shodow DOM
    if (!shadowRoot) {
        shadowRoot = document.createElement("iframe");
        shadowRoot.style.cssText = "width:0px;height:0px;border:0 none;";
    }
    $.html.appendChild(shadowRoot);
    if (!reuse) { //Firefox、Safari、Chrome不能重用shadowDoc、shadowWin
        shadowWin = shadowRoot.contentWindow;
        shadowDoc = shadowWin.document;
        shadowDoc.write("<!doctype html><html><body>");
        shadowDoc.close();
        reuse = window.VBArray || window.opera; //opera9-12, ie6-10有效
    }
    callback(shadowWin, shadowDoc, shadowDoc.body);
    setTimeout(function() {
        $.html.removeChild(shadowRoot);
    }, 1000);
};

$.isHidden = function(node) {
        return node.sourceIndex === 0 ||     
          getter(node, "display") === "none" || 
          !$.contains(node.ownerDocument, node);
};

function toggelDisplay(nodes, show) {
    var elem, values = [],
            status = [],
            index = 0,
            length = nodes.length;
    //由于传入的元素们可能存在包含关系，因此分开两个循环来处理，第一个循环用于取得当前值或默认值
    for (; index < length; index++) {
        elem = nodes[index];
        if (!elem.style) {
            continue;
        }
        values[index] = $._data(elem, "olddisplay");
        status[index] = $.isHidden(elem);
        if (!values[index]) {
            values[index] = status[index] ? $.parseDisplay(elem.nodeName) : getter(elem, "display");
            $._data(elem, "olddisplay", values[index]);
        }
    }
    //第二个循环用于设置样式，-1为toggle, 1为show, 0为hide
    for (index = 0; index < length; index++) {
        elem = nodes[index];
        if (!elem.style) {
            continue;
        }
        show = show === -1 ? !status[index] : show;
        elem.style.display = show ? values[index] : "none";
    }
    return nodes;
}

$.fn.show = function() {
    return toggelDisplay(this, 1);
};
$.fn.hide = function() {
    return toggelDisplay(this, 0);
};
//state为true时，强制全部显示，为false，强制全部隐藏
$.fn.toggle = function(state) {
    return toggelDisplay(this, typeof state === "boolean" ? state : -1);
};

function offset(node) {
    var left = node.offsetLeft,
            top = node.offsetTop;
    do {
        left += node.offsetLeft;
        top += node.offsetTop;
    } while (node = node.offsetParent);
    return {
        left: left,
        top: top
    }
}
var left = this.getBoundingClientRect().left+document.documentElement.scrollLeft;
var top =this.getBoundingClientRect().top+document.documentElement.scrollTop;

$.fn.offset = function(options){
    if ( arguments.length ) {//设置匹配元素的offset
        return (!options || ( !isFinite(options.top) && !isFinite(options.left) ) ) ?  this :
        this.each(function() {
            setOffset( this, options );
        });
    }
    //取得第一个元素的相对于页面的坐标
    var node = this[0], doc = node && node.ownerDocument, pos = {
        left:0,
        top:0
    };
    if ( !doc ) {
        return pos;
    }
    //我们可以通过getBoundingClientRect来获得元素相对于client的rect
    //http://msdn.microsoft.com/en-us/library/ms536433.aspx
    var box = node.getBoundingClientRect(),win = getWindow(doc),
    root = doc.documentElement ,
    clientTop  = root.clientTop  || 0,
    clientLeft  = root.clientLeft  || 0,
    scrollTop  = win.pageYOffset ||  root.scrollTop,
    scrollLeft  = win.pageXOffset ||  root.scrollLeft;
    // 把滚动距离加到left、top中去
    // IE一些版本中会自动为HTML元素加上2px的border，我们需要去掉它
    // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
    pos.top  = box.top  + scrollTop  - clientTop,
    pos.left  = box.left  + scrollLeft  - clientLeft;
    return pos;
}
/*
X = node[clientLeft] - offsetParent[client_left] - offsetParent[borderLeftWidth] – node[marginLeftWidth]
*/

$.fn.position = function() {//取得元素相对于其offsetParent的坐标
    var offset, offsetParent, node = this[0],
            parentOffset = {//默认的offsetParent相对于视窗的距离
        top: 0,
        left: 0
    }
    if (!node || node.nodeType !== 1) {
        return
    }
    //fixed 元素是相对于window
    if (getter(node, "position") === "fixed") {
        offset = node.getBoundingClientRect();
    } else {
        offset = this.offset();//得到元素相对于视窗的距离（我们只有它的top与left）
        offsetParent = this.offsetParent();
        if (offsetParent[ 0 ].tagName !== "HTML") {
            parentOffset = offsetParent.offset();//得到它的offsetParent相对于视窗的距离
        }
        parentOffset.top += parseFloat(getter(offsetParent[ 0 ], 
"borderTopWidth")) || 0;
        parentOffset.left += parseFloat(getter(offsetParent[ 0 ], 
"borderLeftWidth")) || 0;
    }
    return {
        top: offset.top - parentOffset.top - (parseFloat(getter(node, "marginTop")) 
|| 0),
        left: offset.left - parentOffset.left - (parseFloat(getter(node, 
"marginLeft")) || 0)
    };
}

function setOffset(node, options) {
    if (node && node.nodeType == 1) {
        var position = $.css(node, "position");
        //强逼定位
        if (position === "static") {
            node.style.position = "relative";
        }
        var curElem = $(node),
                curOffset = curElem.offset(),
                curCSSTop = $.css(node, "top"),
                curCSSLeft = $.css(node, "left"),
                calculatePosition = (position === "absolute" || position === "fixed") && [curCSSTop, curCSSLeft].indexOf("auto") > -1,
                props = {}, curPosition = {}, curTop, curLeft;
        if (calculatePosition) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            //如果是相对定位，只要用当前top、left做基数
            curTop = parseFloat(curCSSTop) || 0;
            curLeft = parseFloat(curCSSLeft) || 0;
        }

        if (options.top != null) {
            props.top = (options.top - curOffset.top) + curTop;
        }
        if (options.left != null) {
            props.left = (options.left - curOffset.left) + curLeft;
        }
        curElem.css(props);
    }
}

"scrollLeft_pageXOffset,scrollTop_pageYOffset".replace($.rmapper, function(_, method, prop) {
    $.fn[method] = function(val) {
        var node, win, top = method === "scrollTop";
        if (val === void 0) {
            node = this[0];
            if (!node) {
                return null;
            }
            win = getWindow(node); //获取第一个元素的scrollTop/scrollLeft
            return win ? (prop in win) ? win[prop] : win.document.documentElement[method] : node[method];
        }
        return this.each(function() { //设置匹配元素的scrollTop/scrollLeft
            win = getWindow(this);
            if (win) {
                win.scrollTo(!top ? val : $(win).scrollLeft(), top ? val : $(win).scrollTop());
            } else {
                this[method] = val;
            }
        });
    };
});
