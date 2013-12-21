(function($) {//这个东西叫IIFE
    //扩展这个方法到jQuery
    $.fn.extend({
        //插件名字
        pluginname: function() {
            //遍历匹配元素的集合
            return this.each(function() {
                //在这里编写相应代码进行处理 
            });
        }
    });

    //传递jQuery到内层作用域去，如果window、document在里面用得多，也可在这里传入
})(jQuery);

(function($) {//这个东西叫IIFE
    //扩展这个方法到jQuery
    var Plugin = function() {
    }
    Plugin.prototype = {};
    $.fn.extend({
        //插件名字
        pluginname: function(options) {//用户的统一配置对象或方法名
            //遍历匹配元素的集合
            var args = [].slice.call(arguments, 1)
            return this.each(function() {
                //在这里编写相应代码进行处理 
                var ui = $._data(this, pluginname);
                if (!ui) {
                    var opts = $.extend(true, {}, $.fn.pluginname.defaults,
                            typeof options === "object" ? options : {});
                    ui = new Plugin(opts, this);
                    $._data(this, pluginname, ui);
                }
                if (typeof options === "string" && typeof ui[options] == "function") {
                    ui[options].apply(ui, args);//执行插件的方法
                }
            });
        }
    });
    $.fn.pluginname.defaults = {/*略*/};//默认配置对象
    //传递jQuery到内层作用域去
})(jQuery); 

//https://github.com/twitter/bootstrap/blob/master/js/bootstrap-dropdown.js
!function($) {
    "use strict"; // ecma262v5的新东西,强制使用更严谨的代码编写
    /* 内部工作的类
     * ========================= */
    var toggle = '[data-toggle=dropdown]';
    var Dropdown = function(element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle);
        $('html').on('click.dropdown.data-api', function() {
            $el.parent().removeClass('open');
        });
    };
    Dropdown.prototype = {
        constructor: Dropdown,
        toggle: function(e) {
            /*略*/
        },
        keydown: function(e) {
            /*略*/
        }
    };
    /* 主接口
     * ========================== */
    var old = $.fn.dropdown;
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                    data = $this.data('dropdown');
            if (!data)
                $this.data('dropdown', (data = new Dropdown(this)));
            if (typeof option === 'string')//调用它的实例方法
                data[option].call($this);
        });
    };

    $.fn.dropdown.Constructor = Dropdown;//暴露类名

    /* 无冲突处理
     * ==================== */
    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this;
    };
    /*事件代理，智能初始化
     * =================================== */
    $(document)
            .on('click.dropdown.data-api', clearMenus)
            .on('click.dropdown.data-api', '.dropdown form', function(e) {
        e.stopPropagation();
    })
            .on('click.dropdown-menu', function(e) {
        e.stopPropagation();
    })
            .on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle)
            .on('keydown.dropdown.data-api', toggle + ', [role=menu]',
            Dropdown.prototype.keydown);

}(window.jQuery);

//一个jquery UI的基本骨架如下，通过widget入口函数反刍出来，将each什么隐藏掉了。
$.widget("ui.button", {//jquery.ui.button.js
    version: "@VERSION",
    defaultElement: "<button>", //使用什么元素作为它的最外围元素
    options: {
        //默认参数
    },
    _create: function() {
        //根据当前元素的情况重置一些参数与绑定事件
    },
    widget: function() {
        return this.buttonElement;
    },
    _destroy: function() {
//移除各种类名，属性与事件
    },
    _setOption: function(key, value) {
    },
    refresh: function() {
        //略
    }
    //略
});

// getter
var active = $( ".selector" ).accordion( "option", "active" );
// setter
$( ".selector" ).accordion( "option", "active", 2 );


$.Widget.prototype._on = function(suppressDisabledCheck, element, handlers) {
    var delegateElement,
            instance = this;
    // 第一个参数决定是否检测disabled状态
    if (typeof suppressDisabledCheck !== "boolean") {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
    }

// 处理参数多态化,可能用户不会传这么多参数,不足部分自己设计补上
    if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
    } else {
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
    }
//开始绑定
    $.each(handlers, function(event, handler) {
        function handlerProxy() {
//这里的分支最关键,用于决定用户的操作是否无效化
            if (!suppressDisabledCheck &&
                    (instance.options.disabled === true ||
                            $(this).hasClass("ui-state-disabled"))) {
                return;
            }
            return (typeof handler === "string" ? instance[ handler ] : handler)
                    .apply(instance, arguments);
        }

// 这里就是模拟jQuery核心库proxy方法的实现,加个UUID,方便移除
        if (typeof handler !== "string") {
            handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
        }

        var match = event.match(/^(\w+)\s*(.*)$/),
                eventName = match[1] + instance.eventNamespace,
                selector = match[2];
        if (selector) {
            delegateElement.delegate(selector, eventName, handlerProxy);
        } else {
            element.bind(eventName, handlerProxy);
        }
    });
}

//jquery.parser.js
(function($) {
    $.parser = {
        auto: true, //由于加载与初始化是在domReady之后才开始
        //因此我们可以早早把这个改为false,或干脆不加载这个JavaScript文件就行
        onComplete: function(context) {
        },
        //插件名的集合，它们与元素的那些类名同名
        plugins: ['draggable', 'droppable', 'resizable', 'pagination',
            'linkbutton', 'menu', 'menubutton', 'splitbutton', 'progressbar',
            'tree', 'combobox', 'combotree', 'combogrid', 'numberbox', 'validatebox', 'searchbox',
            'numberspinner', 'timespinner', 'calendar', 'datebox', 'datetimebox', 'slider',
            'layout', 'panel', 'datagrid', 'propertygrid', 'treegrid', 'tabs', 'accordion', 'window', 'dialog'
        ],
        parse: function(context) {
            var aa = [];
            for (var i = 0; i < $.parser.plugins.length; i++) {
                var name = $.parser.plugins[i];
                //搜索DOM树
                var r = $('.easyui-' + name, context);
                if (r.length) {
                    if (r[name]) {//如果jQuery的原型已经有这个插件方法,就实例化它
                        r[name]();
                    } else {//没有就加载它们
                        aa.push({name: name, jq: r});
                    }
                }
            }
            if (aa.length && window.easyloader) {
                var names = [];
                for (var i = 0; i < aa.length; i++) {
                    names.push(aa[i].name);
                }
                easyloader.load(names, function() {//加载好就初始化它们
                    for (var i = 0; i < aa.length; i++) {
                        var name = aa[i].name;
                        var jq = aa[i].jq;
                        jq[name]();
                    }
                    $.parser.onComplete.call($.parser, context);
                });
            } else {
                $.parser.onComplete.call($.parser, context);
            }
        },

        parseOptions: function(target, properties) {
        }
    };
    $(function() {
        if (!window.easyloader && $.parser.auto) {
            $.parser.parse();
        }
    });

})(jQuery);


$.parser.parseOptions = function(target, properties) {
    var t = $(target);
    var options = {};
    var s = $.trim(t.attr('data-options'));
    if (s) {
        var first = s.substring(0, 1);
        var last = s.substring(s.length - 1, 1);
        if (first != '{')
            s = '{' + s;
        if (last != '}')
            s = s + '}';
        options = (new Function('return ' + s))();
    }
    if (properties) {
        var opts = {};
        for (var i = 0; i < properties.length; i++) {
            var pp = properties[i];
            if (typeof pp == 'string') {
                if (pp == 'width' || pp == 'height' || pp == 'left' || pp == 'top') {
                    opts[pp] = parseInt(target.style[pp]) || undefined;
                } else {
                    opts[pp] = t.attr(pp);
                }
            } else {
                for (var name in pp) {
                    var type = pp[name];
                    if (type == 'boolean') {
                        opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
                    } else if (type == 'number') {
                        opts[name] = t.attr(name) == '0' ? 0 : parseFloat(t.attr(name)) || undefined;
                    }
                }
            }
        }
        $.extend(options, opts);
    }
    return options;
}

http://easyui.btboys.com/esayui-extension-extension----my97.html
$.fn.my97.parseOptions = function(target) {
    return $.extend({}, $.parser.parseOptions(target, ["el", "vel", "weekMethod", 
        "lang", "skin", "dateFmt", "realDateFmt", "realTimeFmt", "realFullFmt",
        "minDate", "maxDate", "startDate", {
            doubleCalendar: "boolean",
            enableKeyboard: "boolean",
            enableInputMask: "boolean",
            autoUpdateOnChanged: "boolean",
            firstDayOfWeek: "number",
            isShowWeek: "boolean",
            highLineWeekDay: "boolean",
            isShowClear: "boolean",
            isShowToday: "boolean",
            isShowOthers: "boolean",
            readOnly: "boolean",
            errDealMode: "boolean",
            autoPickDate: "boolean",
            qsEnabled: "boolean",
            autoShowQS: "boolean",
            opposite: "boolean"
        }
    ]));
};



//https://github.com/jquerytools/jquerytools/tree/master/src/tooltip
$.fn.tooltip = function(conf) {
    //已保存就返回，由于data原型方法是get first set all操作，这时是返回第一个UI
    var api = this.data("tooltip");
    if (api) {
        return api;
    }
    //合并配置
    conf = $.extend(true, {}, $.tools.tooltip.conf, conf);
    if (typeof conf.position === 'string') {
        conf.position = conf.position.split(/,?\s/);
    }
    //实例化每个元素的UI，返回最后一个，因此与上方矛盾，小心被坑
    this.each(function() {
        api = new Tooltip($(this), conf);
        $(this).data("tooltip", api);
    });
    //决定是返回最后一个实例还是进行链式操作
    return conf.api ? api : this;
};

$.fn.tooltip = function(opt) {
    var api = [];
    this.each(function() {
        //全部保存到一个数组里
        api.push(new tooltip());
    });
    //这时jQuery 对象里面就是一个个UI，而不是节点
    return opt.api ? $(api) : this;
}

var tooltip = $('#sample1,#sample2').tooltip({ api : true }); 
tooltip.each(function(index){
    this.show();//this为一个个UI实例
    this.hide();
});
var tooltip = $('#sample1,#sample2').tooltip({ api : true }); 
alert(tooltip.show) // undefind

tooltip[0].show();
tooltip.get(1).show();



(function($) {
    $.ui = $.ui || {};
    $.ui.api = function(opts) {
        var api = $(opts), first = opts[0];
        for (var name in first)
            (function(name) {
                if (typeof first[name] === "function")
                    api[ name ] = (/^get[^a-z]/.test(name)) ?
                            function() {//作为一个约定，get开头的方法只处理第一个元素
                                //与jQuery的get first set all原则一致
                                return first[name].apply(first, arguments);
                            } :
                            function() {//否则处理所有匹配元素
                                var arg = arguments;
                                api.each(function(idx) {
                                    var apix = api[idx];
                                    apix[name].apply(apix, arg);
                                })
                                return api;
                            }
            })(name);//遍历UI实例对象，取得其原型方法
        return api;
    }
})(jQuery);

$.fn.tooltip = function(opt){
    var api = [];
    this.each(function(){
        api.push( new tooltip() );
    });
    //返回一个强化版jQuery对象
    return opt.api ? $.ui.api(api) : this;
}

//返回一个包含UI实例的jQuery对象
var tooltip = $('#sample1,#sample2').tooltip({api: true});

//同时处理#sample1,#sample2
tooltip.show();

//链式调用
tooltip.show().hide();
