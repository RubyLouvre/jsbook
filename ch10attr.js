var el =  document.createElement("div")　　
el.setAttribute("xxx", "1")
el.setAttribute("XxX", "2")
el.setAttribute("XXx", "3")
console.log(el.getAttribute("xxx"))
console.log(el.getAttribute("XxX"))

/**
<input type="radio"  id="aaa">
<input type="radio" checked id="bbb">
<input type="radio" checked="checked" id="ccc">
<input type="radio" checked="true" id="ddd">
<input type="radio" checked="xxx" id="eee">

"aaa,bbb,ccc,ddd,eee".replace(/\w+/g,function( id ){
    var elem =  document.getElementById( id )
    console.log(elem.getAttribute("checked"));
})

 */

var  isSpecified = !"1"[0] ? function(el, attr){
      return el.hasAttribute(attr)
} : function(el, attr){
      var val = el.attributes[attr]
      return !!val && val.specified
}

function isAttribute(attr, host){ //仅有IE
   var attrs =  host.attributes;
   return attrs[attr] && attrs.expando == true
}

var a = document.getElementById("test");
a.title = 222
console.log(a.getAttribute("title"))        //"222"
console.log(typeof a.getAttribute("title")) //"string"

a.setAttribute("custom", "custom")
console.log(a.custom)          //undefined
console.log(typeof a.custom)   //"undefined"

a.setAttribute("innerHTML","xxx")
console.log(a.innerHTML)           //"xxx"

var a = document.createElement("div")
console.log(a.getAttribute("title"))
console.log(a.getAttribute("innerHTML"))
console.log(a.getAttribute("xxx"))
console.log(a.title)
console.log(a.innerHTML)
console.log(a.xxx)

function isAttribute(attr, host){
    //有些属性是特殊元素才有的，需要用到第二个参数
    host = host || document.createElement("div");
    return host.getAttribute(attr) === null && host[attr] === void 0
}

var el = document.createElement("div")
el.random = 'attribute';              //mootools
console.log(el.getAttribute("random") != 'attribute')

el.setAttribute("className", "t");     //jQuery
console.log(el.className !== "t")
/*
//Prototype 1.7
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },
  */
 
 var getClass = function(ele) {
    return ele.className.replace(/\s+/," ").split(" ");
};

var hasClass =function(ele,cls){
    return -1 < (" "+ele.className+" ").indexOf(" "+cls+" ");
}

var addClass = function(ele,cls) {
    if (!this.hasClass(ele,cls)) 
        ele.className += " "+cls;
}

var removeClass = function(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg," ");
    }
}

var clearClass = function(ele,cls) {
    ele.className = ""
}
/*
addClass: function( value ) {
        var classNames, i, l, elem,setClass, c, cl;
        if ( jQuery.isFunction( value ) ) {
            return this.each(function( j ) {
                jQuery( this ).addClass( value.call(this, j, this.className) );
            });
        }
        if ( value && typeof value === "string" ) {
            classNames = value.split( /\s+/ );
            for ( i = 0, l = this.length; i < l; i++ ) {
                elem = this[ i ];
                if ( elem.nodeType === 1 ) {
                    if ( !elem.className && classNames.length === 1 ) {
                        elem.className = value;

                    } else {
                        setClass = " " + elem.className + " ";

                        for ( c = 0, cl = classNames.length; c < cl; c++ ) {
                            if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
                                    setClass += classNames[ c ] + " ";
                            }
                        }
                        elem.className = jQuery.trim( setClass );
                    }
                }
            }
        }

        return this;
 },

addClass: function(item) {
    if (typeof item == "string") {
        for (var i = 0, el; el = this[i++];) {
            if (el.nodeType === 1) {
                if (!el.className) {
                    el.className = item;
                } else {
                    //rclass = /(^|\s)(\S+)(?=\s(?:\S+\s)*\2(?:\s|$))/g,
                    el.className = (el.className + " " + item).replace(rclass, "");
                }
            }
        }
    }
    return this;
},

addClass: function(item) {
    if (typeof item == "string") {
        for (var i = 0, el; el = this[i++];) {
            if (el.nodeType === 1) {
                if (!el.className) {
                    el.className = item;
                } else {
                    var obj = {}, set = "";
                    (el.className + " " + cls).replace(/\S+/g, function(w) {
                        if (!obj['@' + w]) {//对付旧式IE的toString
                            set += w + " ";
                            obj['@' + w] = 1;
                        }
                    });
                    el.className = set.slice(0, set.length - 1);
                }
            }
        }
    }
    return this;
},

addClass: function(item) {
    if (typeof item == "string") {
        for (var i = 0, el; el = this[i++];) {
            if (el.nodeType === 1) {
                if (!el.className) {
                    el.className = item;
                } else {
                    var a = (el.className + " " + cls).match(/\S+/g);
                    a.sort();
                    for (var i = a.length - 1; i > 0; --i)
                    if (a[i] == a[i - 1]) a.splice(i, 1);
                    el.className = a.join(" ");
                }
            }
        }
    }
    return this;
},

removeClass: function( item ) {
    if ( (item && typeof item === "string") || item === void 0 ) {
        var classNames = ( item || "" ).match( rnospaces ), cl = classNames.length;
        for ( var i = 0, node; node = this[ i++ ]; ) {
            if ( node.nodeType === 1 && node.className ) {
                if ( item ) {//rnospaces = /\S+/g
                    var set = " " + node.className.match( rnospaces ).join(" ") + " ";
                    for ( var c = 0; c < cl; c++ ) {
                        set = set.replace(" " + classNames[c] + " ", " ");
                    }
                    node.className = set.slice( 1, set.length - 1 );
                } else {
                    node.className = "";
                }
            }
        }
    }
    return this;
},

//如果第二个参数为true，要求所有匹配元素都拥有此类名才返回true
hasClass: function( item, every ) {
    var method = every === true ? "every" : "some",
    rclass = new RegExp('(\\s|^)'+item+'(\\s|$)');//判定多个元素，正则比indexOf快点
    return $.slice(this)[ method ](function( el ){//先转换为数组
        return "classList" in el ? el.classList.contains( item ):
           (el.className || "").match(rclass);
     });
   },

toggleClass: function( value ){
    var type = typeof value, className, i,
    classNames = type === "string" && value.match( /\S+/g ) || [];
    return this.each(function( el ) {
        i = 0;
        if(el.nodeType === 1){
            var self = $( el );
            if(type == "string" ){
                while ( (className = classNames[ i++ ]) ) {
                    self[ self.hasClass( className ) ? "removeClass" : "addClass" ]( className );
                }
            } else if ( type === "undefined" || type === "boolean" ) {
                if ( el.className ) {
                    $._data( el, "__className__", el.className );
                }
                el.className = el.className || value === false ? "" : $._data( el, "__className __") || "";
            }
        }
    });
},

replaceClass: function( old, neo ){
        for ( var i = 0, node; node = this[ i++ ]; ) {
            if ( node.nodeType === 1 && node.className ) {
                var arr = node.className.match( rnospaces ), arr2 = [];
                for ( var j = 0; j < arr.length; j++ ) {
                    arr2.push( arr[j] == old ? neo : arr[j]);
                }
                node.className = arr2.join(" ");
            }
        }
        return this;
  },

// Prototype.js 1.61
readAttribute = function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
        var t = Element._attributeTranslations.read;
        if (t.values[name])
            return t.values[name](element, name);
        if (t.names[name])
            name = t.names[name];
        if (name.include(':')) {
            return (!element.attributes || !element.attributes[name]) ? null :
                    element.attributes[name].value;
        }
    }
    return element.getAttribute(name);
}

Element._attributeTranslations = (function() {
    var classProp = 'className',
            forProp = 'for',
            el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
        el.setAttribute('class', 'x');
        if (el.className === 'x') {
            classProp = 'class';
        }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
        el.setAttribute('htmlFor', 'x');
        if (el.htmlFor === 'x') {
            forProp = 'htmlFor';
        }
    }
    el = null;

    return {
        read: {
            names: {
                'class': classProp,
                'className': classProp,
                'for': forProp,
                'htmlFor': forProp
            },
            values: {
                _getAttr: function(element, attribute) {
                    return element.getAttribute(attribute);
                },
                _getAttr2: function(element, attribute) {
                    return element.getAttribute(attribute, 2);
                },
                _getAttrNode: function(element, attribute) {
                    var node = element.getAttributeNode(attribute);
                    return node ? node.value : "";
                },
                _getEv: (function() {

                    var el = document.createElement('div'), f;
                    el.onclick = Prototype.emptyFunction;
                    var value = el.getAttribute('onclick');

                    if (String(value).indexOf('{') > -1) {
                        f = function(element, attribute) {
                            attribute = element.getAttribute(attribute);
                            if (!attribute)
                                return null;
                            attribute = attribute.toString();
                            attribute = attribute.split('{')[1];
                            attribute = attribute.split('}')[0];
                            return attribute.strip();
                        };
                    }
                    else if (value === '') {
                        f = function(element, attribute) {
                            attribute = element.getAttribute(attribute);
                            if (!attribute)
                                return null;
                            return attribute.strip();
                        };
                    }
                    el = null;
                    return f;
                })(),
                _flag: function(element, attribute) {
                    return $(element).hasAttribute(attribute) ? attribute : null;
                },
                style: function(element) {
                    return element.style.cssText.toLowerCase();
                },
                title: function(element) {
                    return element.title;
                }
            }
        }
    }
})();

Element._attributeTranslations.write = {
    names: Object.extend({
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
        checked: function(element, value) {
            element.checked = !!value;
        },
        style: function(element, value) {
            element.style.cssText = value ? value : '';
        }
    }
};

Element._attributeTranslations.has = {};

$w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
        'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
});

(function(v) {
    Object.extend(v, {
        href: v._getAttr2,
        src: v._getAttr2,
        type: v._getAttr,
        action: v._getAttrNode,
        disabled: v._flag,
        checked: v._flag,
        readonly: v._flag,
        multiple: v._flag,
        onload: v._getEv,
        onunload: v._getEv,
        onclick: v._getEv,
        ondblclick: v._getEv,
        onmousedown: v._getEv,
        onmouseup: v._getEv,
        onmouseover: v._getEv,
        onmousemove: v._getEv,
        onmouseout: v._getEv,
        onfocus: v._getEv,
        onblur: v._getEv,
        onkeypress: v._getEv,
        onkeydown: v._getEv,
        onkeyup: v._getEv,
        onsubmit: v._getEv,
        onreset: v._getEv,
        onselect: v._getEv,
        onchange: v._getEv
    });
})(Element._attributeTranslations.read.values);

<a href="index.html">home</a>
<script>
var link = document.getElementsByTagName('a')[0];
link.getAttribute('href') // "http://www.cnblogs.com/rubylouvre/index.html";
link.getAttribute('href',2) //"index.html";
</script>

<form  action="#" >
        <input id="name" >
        <input id="action" >
        <input name="id"  >
        <input name="length"  >
        <input id="xxx" >
        <input id="yyy" >
 </form>
var el = document.getElementsByTagName("form")[0]
alert(el.getAttribute("action"))
alert(el.getAttribute("id"))
alert(el.getAttribute("name"))
alert(el.getAttribute("length"))
alert(el.getAttribute("xxx"))
alert(el.getAttribute("yyy"))

rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop |multiple|open|readonly|required|scoped|selected)$/i
*/

//Prototype.js1.61
writeAttribute = function(element, name, value) {
    element = $(element);
    var attributes = {}, t = Element._attributeTranslations.write;
    if (typeof name == 'object')
        attributes = name;
    else
        attributes[name] = Object.isUndefined(value) ? true : value;
    for (var attr in attributes) {
        name = t.names[attr] || attr;
        value = attributes[attr];
        if (t.values[attr])
            name = t.values[attr](element, value);
        if (value === false || value === null)
            element.removeAttribute(name);
        else if (value === true)
            element.setAttribute(name, name);
        else
            element.setAttribute(name, value);
    }
    return element;
}
/*
// jQuery1.01
attr: function(elem, name, value){ 
        var fix = {
            "for": "htmlFor",
            "class": "className",
            "float": "cssFloat",
            innerHTML: "innerHTML",
            className: "className",
            value: "value",
            disabled: "disabled"
        };

        if ( fix[name] ) {
            if ( value != undefined ) elem[fix[name]] = value;
            return elem[fix[name]];
        } else if ( elem.getAttribute ) {
            if ( value != undefined ) elem.setAttribute( name, value );
            return elem.getAttribute( name, 2 );
        } else {
            name = name.replace(/-([a-z])/ig,function(z,b){return b.toUpperCase();});
            if ( value != undefined ) elem[name] = value;
            return elem[name];
        }
},

//jquery1.83
prop: function( elem, name, value ) {
    var ret, hooks, notxml,  nType = elem.nodeType;
　　
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
        return;//跳过注释节点、文本节点、特性节点
    }
　　
    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
    if ( notxml ) {//如果是HTML文档的元素节点
        name = jQuery.propFix[ name ] || name;
        hooks = jQuery.propHooks[ name ];
    }
　　
    if ( value !== undefined ) {//写方法
        if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
            return ret;//处理特殊情况
　
        } else {//处理通用情况
            return ( elem[ name ] = value );
        }
　　
    } else {//读方法
        if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
            return ret;//处理特殊情况
        } else {//处理通用情况
            return elem[ name ];
        }
    }
},
attr: function( elem, name, value ) {
    var ret, hooks, notxml, nType = elem.nodeType;

    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
        return;//跳过注释节点、文本节点、特性节点
    }
    if ( typeof elem.getAttribute === "undefined" ) {
        return jQuery.prop( elem, name, value );//文档与window，只能使用prop
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
    if ( notxml ) {//如果是HTML文档的元素节点
        name = name.toLowerCase();//决定用哪一个钩子
        hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
    }

    if ( value !== undefined ) {
        if ( value === null ) {//模仿Prototype.js，移除属性
            jQuery.removeAttr( elem, name );

        } else if ( hooks && notxml && "set" in hooks && 
            (ret = hooks.set( elem, value, name )) !== undefined ) {
            return ret;//处理特殊情况

        } else {//处理通用情况
            elem.setAttribute( name, value + "" );
            return value;
        }
    } else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
        return ret;//处理特殊情况

    } else {//处理通用情况
        ret = elem.getAttribute( name );
        return ret === null ? undefined :  ret;
    }
},

//https://github.com/RubyLouvre/mass-Framework/blob/1.4/attr.js
prop: function(node, name, value) {
    if ($["@bind"] in node) {
        if (node.nodeType === 1 && !$.isXML(node)) {
            name = $.propMap[name.toLowerCase()] || name;
        }
        var access = value === void 0 ? "get" : "set";
        return($.propHooks[name + ":" + access] || 
                $.propHooks["@default:" + access])(node, name, value);
    }
}
attr: function(node, name, value) {
    if ($["@bind"] in node) {
        if (typeof node.getAttribute === "undefined") {
            return $.prop(node, name, value);
        }
//这里只剩下元素节点
        var noxml = !$.isXML(node),
                type = "@w3c";
        if (noxml) {
            name = name.toLowerCase();
            var prop = $.propMap[name] || name;
            if (!support.attrInnateName) {
                type = "@ie";
            }
            var isBool = typeof node[prop] === "boolean" &&
                typeof defaultProp(node, prop) === "boolean"; //判定是否为布尔属性
        }
//移除操作
        if (noxml) {
            if (value === null || value === false && isBool) {
                return $.removeAttr(node, name);
            }
        } else if (value === null) {
            return node.removeAttribute(name);
        }
//读写操作
        var access = value === void 0 ? "get" : "set";
        if (isBool) {
            type = "@bool";
            name = prop;
        }
        ;
        return(noxml && $.attrHooks[name + ":" + access] || 
                $.attrHooks[type + ":" + access])(node, name, value);
    }
}

 */

var cacheProp = {}
function defaultProp(node, prop){
    var name = node.tagName+":"+prop;
    if(name in cacheProp){
        return cacheProp[name]
    }
    return cacheProp[name] = document.createElement(node.tagName)[prop]
}

/**
"tabIndex:get": function( node ) {
    //http://www.cnblogs.com/rubylouvre/archive/2009/12/07/1618182.html
    var ret = node.tabIndex;
    if( ret === 0 ){//在标准浏览器下，不显式设置时，表单元素与链接默认为0，普通元素为-1
        ret = rtabindex.test(node.nodeName) ? 0 : -1
    }
    return ret;
}
if ( !support.attrInnateValue ) {//IE6～IE8
    // http://gabriel.nagmay.com/2008/11/javascript-href-bug-in-ie/
    $.propHooks[ "href:set" ] =  $.propHooks[ "href:set" ] = function( node, name, value ) {
        var b
        if(node.tagName == "A" && node.innerText.indexOf("@") > 0
            && !node.children.length){
            b = node.ownerDocument.createElement('b');
            b.style.display = 'none';
            node.appendChild(b);
        }
        node.setAttribute(name, value+"");
        if (b) {
            node.removeChild(b);
        }
    }
}

rattrs = /\s+([\w-]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g,
rquote = /^['"]/
//.....
"@ie:get": function( node, name ){
    var str = node.outerHTML.replace(node.innerHTML, ""), obj = {}, k, v;
    while (k = rattrs.exec(str)) { //属性值只有双引号与无引号的情况
        v = k[2]
        obj[ k[1].toLowerCase() ] = v ? rquote.test( v ) ? v.slice(1, -1) : v : ""
    }
    return obj[ name ];
},

removeProp: function( node, name ) {
    if(node.nodeType === 1){
        if(!support.attrInnateName){
            name = $.propMap[ name.toLowerCase() ] ||  name;
        }
        node[name] = defaultProp(node, name)
    }else{
        node[name] = void 0;
    }
},

 */

var valHooks = {
    "option:get": function(node) {
        var val = node.attributes.value;
        //黑莓手机4.7下val会返回undefined,但我们依然可用node.value取值
        return !val || val.specified ? node.value : node.text;
    },
    "select:get": function(node, value, getter) {
        var option, options = node.options,
                index = node.selectedIndex,
                one = node.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;
        for (; i < max; i++) {
            option = options[i];
            //旧式IE在reset后不会改变selected，需要改用i === index判定
            //我们过滤所有disabled的option元素，但在Safari5下，如果设置select为disable，
            //那么其所有孩子都disable
            //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
            if ((option.selected || i === index) && !(support.optDisabled ? option.disabled : / disabled=/.test(option.outerHTML.replace(option.innerHTML, "")))) {
                value = getter(option);
                if (one) {
                    return value;
                }
                //收集所有selected值组成数组返回
                values.push(value);
            }
        }
        return values;
    },
    "select:set": function(node, name, values, getter) {
        values = [].concat(values); //强制转换为数组
        for (var i = 0, el; el = node.options[i++]; ) {
            el.selected = !!~values.indexOf(getter(el));
        }
        if (!values.length) {
            node.selectedIndex = -1;
        }
    }
}

//checkbox的value默认为on，唯有Chrome 返回空字符串
if (!support.checkOn) {
    valHooks["checked:get"] = function(node) {
        return node.getAttribute("value") === null ? "on" : node.value;
    };
}
//处理单选框、复选框在设值后checked的值
valHooks["checked:set"] = function(node, name, value) {
    if (Array.isArray(value)) {
        return node.checked = !!~value.indexOf(node.value);
    }
}

function getValType(el) {
    var ret = el.tagName.toLowerCase();
    return ret === "input" && /checkbox|radio/.test(el.type) ? "checked" : ret;
}

val = function(item) {
    var getter = valHooks["option:get"];
    if (arguments.length) {
        if (Array.isArray(item)) {
            item = item.map(function(item) {
                return item == null ? "" : item + "";
            });
        } else if (isFinite(item)) {
            item += "";
        } else {
            item = item || "";
            //我们确保传参为字符串数组或字符串，null/undefined强制转换为"",number变为字符串
        }
        return $.access(this, function(el) {
            if (this === $) { //getter
                var ret = (valHooks[getValType(el) + ":get"] ||
                        $.propHooks["@default:get"])(el, "value", getter);
                return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
            } else { //setter 
                if (el.nodeType === 1) {
                    (valHooks[getValType(el) + ":set"] || 
                            $.propHooks["@default:set"])(el, "value", item, getter);
                }
            }
        }, 0, arguments);
    }
}
