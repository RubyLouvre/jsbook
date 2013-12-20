(function(jQuery, window, undefined) {
    "use strict";
    var matched, browser;

    jQuery.uaMatch = function(ua) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

        var platform_match = /(ipad)/.exec(ua) ||
                /(iphone)/.exec(ua) ||
                /(android)/.exec(ua) ||
                [];

        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0",
            platform: platform_match[0] || ""
        };
    };

    matched = jQuery.uaMatch(window.navigator.userAgent);
    browser = {};

    if (matched.browser) {
        browser[ matched.browser ] = true;
        browser.version = matched.version;
    }

    if (matched.platform) {
        browser[ matched.platform ] = true
    }

// Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        browser.webkit = true;
    } else if (browser.webkit) {
        browser.safari = true;
    }

    jQuery.browser = browser;

})(jQuery, window);


//https://github.com/RubyLouvre/mass-Framework/blob/1.4/more/brower.js
define("brower", function( ) {
    var w = window, ver = w.opera ? (opera.version().replace(/\d$/, "") - 0)
            : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
            exec(navigator.userAgent) || [, 0])[1]);
    return {
        //测试是否为IE或内核为trident，是则取得其版本号
        ie: !!w.VBArray && Math.max(document.documentMode || 0, ver), //内核trident
        //测试是否为Firefox，是则取得其版本号
        firefox: !!w.netscape && ver, //内核Gecko
        //测试是否为Opera，是则取得其版本号
        opera: !!w.opera && ver, //内核 Presto 9.5为Kestrel 10为Carakan
        //测试是否为Chrome，是则取得其版本号
        chrome: !!w.chrome && ver, //内核V8
        //测试是否为Safari，是则取得其版本号
        safari: /apple/i.test(navigator.vendor) && ver// 内核 WebCore
    }
});

ie = !!document.recalc
ie = !!window.VBArray
ie = !!window.ActiveXObject
ie = !!window.createPopup;
ie = /*@cc_on!@*/!1;
ie = document.expando;//document.all在opera firefox的古老版本也存在
ie = (function() {//IE10中失效
    var v = 3, div = document.createElement('div');
    while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><br><![endif]-->', div.innerHTML)
        ;
    return v > 4 ? v : !v;
}());

ie678 = !+"\v1";
ie678 = !-[1, ];
ie678 = '\v' == 'v';
ie678 = ('a~b'.split(/(~)/))[1] == "b"
ie678 = 0.9.toFixed(0) == "0"
ie678 = /\w/.test('\u0130') //由群里的abcd友情提供
ie8 = window.toStaticHTML
ie9 = window.msPerformance

ie678 = 0//@cc_on+1;

ie67 = !"1"[0] //利用IE6或IE5的字符串不能使用数组下标的特征
ie8 = !!window.XDomainRequest;
ie9 = document.documentMode && document.documentMode === 9;

//基于条件编译的嗅探脚本，IE会返回其JS引擎的版本号，非IE返回0
var ieVersion = eval("''+/*@cc_on" + " @_jscript_version@*/-0") * 1
ie9 = ieVersion === 5.9
ie8 = ieVersion === 5.8
ie7 = ieVersion === 5.7
ie6 = ieVersion === 5.6
ie5 = ieVersion === 5.5
ie10 = window.navigator.msPointerEnabled
ie11 = '-ms-scroll-limit' in document.documentElement.style

opera = !!window.opera;

//https://developer.mozilla.org/En/Windows_Media_in_Netscape
firefox = !!window.GeckoActiveXObject
firefox = !!window.netscape //包括firefox
firefox = !!window.Components
firefox = !!window.updateCommands
safari = !!(navigator.vendor && navigator.vendor.match(/Apple/))
safari = window.openDatabase && !window.chrome;
chrome = !!(window.chrome && window.google)

isIPhone = /iPhone/i.test(navigator.userAgent);
isIPhone4 = window.devicePixelRatio >= 2//在网页中，pixel与point比值称为device-pixel-ratio，普通设备都是1，iPhone 4是2，有些Android机型是1.5
//http://blog.webcreativepark.net/2011/01/25-173502.html
isIPad = /iPad/i.test(navigator.userAgent);
isAndroid = /android/i.test(navigator.userAgent);
isIOS = isIPhone || isIPad;

var isEventSupported = (function() {
    var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
    }
    function isEventSupported(eventName) {
        var el = document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;
        var isSupported = (eventName in el);
        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
        }
        el = null;
        return isSupported;
    }
    return isEventSupported;
})();

$.eventSupport = function(eventName, el) {
    el = el || document.documentElement
    eventName = "on" + eventName;
    var ret = eventName in el;
    if (el.setAttribute && !ret) {
        el.setAttribute(eventName, "");
        ret = typeof el[eventName] === "function";
        el.removeAttribute(eventName);
    }
    el = null;
    return ret;
};
//https://github.com/RubyLouvre/mass-Framework/blob/1.4/event.js
try {
    //如果浏览器支持创建MouseScrollEvents事件对象，那么就用DOMMouseScroll
    document.createEvent("MouseScrollEvents");
    eventHooks.mousewheel = {
        bindType: "DOMMouseScroll",
        delegateType: "DOMMouseScroll"
    };
    //如果某一天,Firefox回心转意支持mousewheel，那么我们就不需要这个钩子
    if ($.eventSupport("mousewheel")) {
        delete eventHooks.mousewheel;
    }
} catch (e) {
}
//https://github.com/RubyLouvre/mass-Framework/blob/1.4/support.js#L108
//首先判定它是否是W3C阵营，IE肯定支持
$.support.focusin = !!window.attachEvent;
$(function() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.innerHTML = "<a href='#'></a>";
    if (!support.focusin) {
        a = div.firstChild;
        a.addEventListener('focusin', function() {
            $.support.focusin = true;
        }, false);
        a.focus();
    }
});

$.support.transition = (function() {
    var transitionEnd = (function() {
        var el = document.createElement('bootstrap'),
                transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name]
            }
        }
    }())
    return transitionEnd && {
        end: transitionEnd
    }
})()


var eventName = {
    AnimationEvent: 'animationend',
    WebKitAnimationEvent: 'webkitAnimationEnd'
}, animationend;

for (var name in eventName) {
    if (/object|function/.test(typeof window[name])) {
        animationend = eventName[name]
        break
    }
}

var prefixes = ['', '-webkit-', '-o-', '-moz-', '-ms-'];
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
var div = document.createElement("div");
div.innerHTML = "<table></table>"
alert(div.innerHTML)
//IE678返回 "<TABLE><TBODY></TBODY></TABLE>" ,其他返回"<table></table>"

/*
<select id="optSelected">
</select>
<script type="text/javascript">
    var select = document.getElementById('optSelected');
    var option = document.createElement('option');
    select.appendChild(option);
    alert(option.selected);
    select.selectedIndex;
    alert(option.selected);
</script>
 */