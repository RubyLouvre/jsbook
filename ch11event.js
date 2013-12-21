function addEvent(el, type, callback, useCapture) {
    if (el.dispatchEvent) {//W3C方式优先
        el.addEventListener(type, callback, !!useCapture);
    } else {
        el.attachEvent("on" + type, callback);
    }
    return callback;//返回callback方便卸载时用
}

function removeEvent(el, type, callback, useCapture) {
    if (el.dispatchEvent) {//W3C方式优先
        el.removeEventListener(type, callback, !!useCapture);
    } else {
        el.detachEvent("on" + type, callback);
    }
}

function fireEvent(el, type, args, event) {
    args = args || {}
    if (el.dispatchEvent) {//W3C方式优先
        event = document.createEvent("HTMLEvents");
        event.initEvent(type, true, true);
    } else {
        event = document.createEventObject();
    }
    for (var i in args)
        if (args.hasOwnProperty(i)) {
            event[i] = args[i]
        }
    if (el.dispatchEvent) {
        el.dispatchEvent(event);
    } else {
        el.fireEvent('on' + type, event)
    }
}

//http://dean.edwards.name/weblog/2005/10/add-event/
function addEvent(element, type, handler) {
    //回调添加UUID，方便移除
    if (!handler.$$guid)
        handler.$$guid = addEvent.guid++;
    //元素添加events，保存所有类型的回调
    if (!element.events)
        element.events = {};
    var handlers = element.events[type];
    if (!handlers) {
        //创建一个子对象，保存当前类型的回调
        handlers = element.events[type] = {};
        //如果元素之前以onXXX = callback的方式绑定过事件，则成为当前类别第一个被触发的回调
        //问题是这回调没有UUID，只能通过el.onXXX = null移除
        if (element["on" + type]) {
            handlers[0] = element["on" + type];
        }
    }
    //保存当前的回调
    handlers[handler.$$guid] = handler;
    //所有回调统一交由handleEvent触发
    element["on" + type] = handleEvent;
}

addEvent.guid = 1;//UUID
//移除事件，只要从当前类别的储存对象delete就行
function removeEvent(element, type, handler) {
    if (element.events && element.events[type]) {
        delete element.events[type][handler.$$guid];
    }
}
function handleEvent(event) {
    var returnValue = true;
    //统一事件对象阻止默认行为与事件传统的接口
    event = event || fixEvent(window.event);
    //根据事件类型，取得要处理回调集合，由于UUID是纯数字，因此可以按照绑定时的顺序执行
    var handlers = this.events[event.type];
    for (var i in handlers) {
        this.$$handleEvent = handlers[i];
        //根据返回值判定是否阻止冒泡
        if (this.$$handleEvent(event) === false) {
            returnValue = false;
        }
    }
    return returnValue;
}
;
//对IE的事件对象做简单的修复
function fixEvent(event) {
    event.preventDefault = fixEvent.preventDefault;
    event.stopPropagation = fixEvent.stopPropagation;
    return event;
}
;
fixEvent.preventDefault = function() {
    this.returnValue = false;
};
fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
};

event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);

function addEvent(element, type, handler) {
    if (!handler.$$guid)
        handler.$$guid = addEvent.guid++;
    //每个元素都分配一个UUID，用于访问它们的所有回调
    if (!element.$$guid)
        element.$$guid = addEvent.guid++;
    if (!addEvent.handlers[element.$$guid])
        addEvent.handlers[element.$$guid] = {};
    //每个元素的回调都分类储存在不同的hash中
    var handlers = addEvent.handlers[element.$$guid][type];
    if (!handlers) {
        handlers = addEvent.handlers[element.$$guid][type] = {};
        if (element["on" + type]) {
            handlers[0] = element["on" + type];
        }
    }
    handlers[handler.$$guid] = handler;
    element["on" + type] = handleEvent;
}
addEvent.guid = 1;
// 放置所有回调的仓库
addEvent.handlers = {};

$("div").delegate('click', 'span', function(event) {
    $(this).toggleClass('selected');
    return false;
});

$("div").delegate("span", "click", function(event) {
    $(this).toggleClass('selected');
    return false;
});


add = function(elem, types, handler, data, selector) {
    var elemData, eventHandle, events,
            t, tns, type, namespaces, handleObj,
            handleObjIn, handlers, special;
    //如果elem不能添加自定属性，由于IE下访问文本节点会抛错，因此事件源不能为文本节点
    //注释节点本来就不应该绑定事件，注释节点之所以混进来，是因为jQuery的html方法所致
    //如果没有指定事件类型或回调也立即返回，不再向下操作
    if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
        return;
    }
    //取得用户回调与CSS表达式，handleObjIn这种结构我称之为事件描述
    //记叙用户绑定此回调时的各种信息，方便用于“事件拷贝”
    if (handler.handler) {
        handleObjIn = handler;
        handler = handleObjIn.handler;
        selector = handleObjIn.selector;
    }
    //确保回调拥有UUID，用于查找与移除
    if (!handler.guid) {
        handler.guid = jQuery.guid++;
    }
    //为此元素在数据缓存系统中开辟一个叫“event”的空间来保存其所有回调与事件处理器
    events = elemData.events;
    if (!events) {
        elemData.events = events = {};
    }
    eventHandle = elemData.handle;//事件处理器
    if (!eventHandle) {
        elemData.handle = eventHandle = function(e) {
            //用户在事件冒充时，被二次fire或者在页面unload后触发事件
            return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                    jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
                    undefined;
        };
        //原注释是说，防止IE下非原生事件内存泄漏，不过我觉得直接的影响是明确了this的指向
        eventHandle.elem = elem;
    }
    //通过空格隔开同时绑定多个事件，比如 jQuery(...).bind("mouseover mouseout", fn);
    types = jQuery.trim(hoverHack(types)).split(" ");
    for (t = 0; t < types.length; t++) {

        tns = rtypenamespace.exec(types[t]) || [];  //取得命名空间
        type = tns[1];//取得真正的事件
        namespaces = (tns[2] || "").split(".").sort();//修正命名空间
        //并不是所有事件都能直接使用，比如FF下没有mousewheel，需要用DOMMouseScroll冒充
        special = jQuery.event.special[ type ] || {};
        //有时候我们只需要在事件代理时进行冒充，比如FF下的focus、blur
        type = (selector ? special.delegateType : special.bindType) || type;

        special = jQuery.event.special[ type ] || {};
        // 构建一个事件描述对象
        handleObj = jQuery.extend({
            type: type,
            origType: tns[1],
            data: data,
            handler: handler,
            guid: handler.guid,
            selector: selector,
            needsContext: selector &&
                    jQuery.expr.match.needsContext.test(selector),
            namespace: namespaces.join(".")
        }, handleObjIn);
        //在events对象上分门别类储存事件描述，每种事件对应一个数组
        //每种事件只绑定一次监听器（即addEventListener，attachEvent）
        handlers = events[ type ];
        if (!handlers) {
            handlers = events[ type ] = [];
            handlers.delegateCount = 0;//记录要处理的回调的个数
            //如果存在 special.setup并且 special.setup返回0才直接使用多投事件API
            if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                if (elem.addEventListener) {
                    elem.addEventListener(type, eventHandle, false);

                } else if (elem.attachEvent) {
                    elem.attachEvent("on" + type, eventHandle);
                }
            }
        }

        if (special.add) {//处理自定义事件
            special.add.call(elem, handleObj);

            if (!handleObj.handler.guid) {
                handleObj.handler.guid = handler.guid;
            }
        }

        // Add to the element's handler list, delegates in front
        if (selector) {//如果是使用事件代理，那么把此事件描述放到数组的前面
            handlers.splice(handlers.delegateCount++, 0, handleObj);
        } else {
            handlers.push(handleObj);
        }
        //用于jQuery.event.trigger，如果此事件从来没有绑定过，也没有必要进入trigger的真正处理逻辑
        jQuery.event.global[ type ] = true;
    }
    //防止IE内存泄漏
    elem = null;
}


remove = function(elem, types, handler, selector) {
    var t, tns, type, origType, namespaces, origCount,
            j, events, special, eventType, handleObj,
            elemData = jQuery.hasData(elem) && jQuery._data(elem);
    //如果不支持添加自定义属性或没有缓存与事件有关的东西，立即返回
    if (!elemData || !(events = elemData.events)) {
        return;
    }
    //hover转换为“mouseenter mouseleave”，并且按空格进行切割，方便移除多种事件类型
    types = jQuery.trim(hoverHack(types || "")).split(" ");
    for (t = 0; t < types.length; t++) {
        tns = rtypenamespace.exec(types[t]) || [];
        type = origType = tns[1];//取得事件类型
        namespaces = tns[2];//取得命名空间
        if (!type) {//如果没有指定事件类型，则移除所有事件类型或移除所有与此命名空间有关的事件类型
            for (type in events) {
                jQuery.event.remove(elem, type + types[ t ], handler, selector, true);
            }
            continue;
        }
        //利用事件冒充，取得真正用于绑定的事件类型
        special = jQuery.event.special[ type ] || {};
        type = (selector ? special.delegateType : special.bindType) || type;
        eventType = events[ type ] || [];//取得装载事件描绘对象的数组
        origCount = eventType.length;
        //取得用于过滤命名空间的正则，没有为null
        namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

        // 移除符合条件的事件描述对象
        for (j = 0; j < eventType.length; j++) {
            handleObj = eventType[ j ];

            if ((origType === handleObj.origType) & //比较事件类型是否一致
                    (!handler || handler.guid === handleObj.guid) && //如果传进了回调,判定UUID是否相同
                    (!namespaces || namespaces.test(handleObj.namespace)) &&
                    //如果types含有命名空间,用正则看是否匹配
                            //如果是事件代理必有CSS表达式,比较与事件描述对象中的是否相等
                                    (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                        eventType.splice(j--, 1);//是就移除

                        if (handleObj.selector) {//同时delegateCount减一
                            eventType.delegateCount--;
                        }
                        if (special.remove) {//处理个别事件的移除
                            special.remove.call(elem, handleObj);
                        }
                    }
                }
                //如果已经移除所有此类型回调,则卸载框架绑定去的elemData.handle
                //origCount !== eventType.length 是为了防止死循环
                if (eventType.length === 0 && origCount !== eventType.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }
                    delete events[ type ];
                }
            }
            //如果events为空，则从elemData中删除events与handler
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;
                jQuery.removeData(elem, "events", true);
            }
        }

        dispatch = function(event) {
            //创建一个伪事件对象(jQuery.Event实例)，从真正的事件对象上抽取得相应的属性附于其上，
            //如果是IE，亦可以将它们转换成对应的W3C属性，抹平两大平台的差异
            event = jQuery.event.fix(event || window.event);

            var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
                    //取得所有事件描述对象
                    handlers = ((jQuery._data(this, "events") || {})[ event.type ] || []),
                    delegateCount = handlers.delegateCount,
                    args = core_slice.call(arguments),
                    run_all = !event.exclusive && !event.namespace,
                    special = jQuery.event.special[ event.type ] || {},
                    handlerQueue = [];

            //重置第一个参数为jQuery.Event实例
            args[0] = event;
            event.delegateTarget = this;//添加一个人为属性，用于事件代理
            //执行preDispatch回调,它与后面的postDispatch构成一种类似AOP的机制
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                return;
            }

            //如果是事件代理，并且不是来自于非左键的点击事件
            if (delegateCount && !(event.button && event.type === "click")) {
                //从事件源开始，遍历其所有祖先一直到绑定事件的元素
                for (cur = event.target; cur != this; cur = cur.parentNode || this) {
                    //一要触发被disabled的元素的点击事件
                    if (cur.disabled !== true || event.type !== "click") {
                        selMatch = {};//为了节能起见，每种CSS表达式只判定一次，通过下面的
                        //jQuery( sel, this ).index( cur ) >= 0或 jQuery.find( sel, this,null,
                        //[ cur ] ).length
                        matches = [];//用于收集符合条件的事件描述对象
                        //使用事件代理的事件描述对象总是排在前面
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[ i ];
                            sel = handleObj.selector;

                            if (selMatch[ sel ] === undefined) {
                                //有多少个元素匹配就收集多少个事件描述对象
                                selMatch[ sel ] = handleObj.needsContext ?
                                        jQuery(sel, this).index(cur) >= 0 :
                                        jQuery.find(sel, this, null, [cur]).length;
                            }
                            if (selMatch[ sel ]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({elem: cur, matches: matches});
                        }
                    }
                }
            }
            //取得其他直接绑定的事件描述对象
            if (handlers.length > delegateCount) {
                handlerQueue.push({elem: this, matches: handlers.slice(delegateCount)});
            }

            //★★★★这个循环是从下到上执行的
            for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                matched = handlerQueue[ i ];
                event.currentTarget = matched.elem;
                //执行此元素的所有与event.type同类型的回调,除非用户调用了stopImmediatePropagation方法,
                //它会导致isImmediatePropagationStopped返回true,从而中断循环
                for (j = 0; j < matched.matches.length
                        && !event.isImmediatePropagationStopped(); j++) {
                    handleObj = matched.matches[ j ];
                    //最后的过滤条件为事件命名空间,比如著名的bootstrap的命名空间为data-api
                    if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re &&
                            event.namespace_re.test(handleObj.namespace)) {
                        event.data = handleObj.data;
                        event.handleObj = handleObj;
                        //执行用户回调(有时可能还要外包一层,来自jQuery.event.special[type].handle)
                        ret = ((jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler)
                                .apply(matched.elem, args);
                        //根据结果判定是否阻止事件传播与默认行为
                        if (ret !== undefined) {
                            event.result = ret;
                            if (ret === false) {
                                //http://heikezhi.com/yuanyi/jquery-events-stop-misusing-return-false
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            //执行postDispatch回调
            if (special.postDispatch) {
                special.postDispatch.call(this, event);
            }
            return event.result;
        }

        /**
         if ( selMatch[ sel ] === undefined ) {         
         selMatch[ sel ] = handleObj.needsContext ? jQuery( sel, this ).index( cur ) >= 0 :  jQuery.find( sel, this, null, [ cur ] ).length;
         }
         
         Sizzle.matchesSelector = function( elem, expr ) {
         return Sizzle( expr, null, null, [ elem ] ).length > 0;
         };
         stopImmediatePropagation: function() { 
         this.isImmediatePropagationStopped = returnTrue;
         this.stopPropagation();
         },
         
         */

        trigger = function(event, data, elem, onlyHandlers) {
            // 必须要指定派发事件的对象，不能是文本节点与元素节点
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                return;
            }

            // Event object or event type
            var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
                    type = event.type || event,
                    namespaces = [];

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }

            if (type.indexOf("!") >= 0) {
                // Exclusive events trigger only for the exact event (no namespaces)
                type = type.slice(0, -1);
                exclusive = true;
            }
            //如果事件类型带点号就分解出命名空间
            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            //customEvent与global用于优化，既然从来没有绑定过这种事件，就不用继续往下打酱油了！
            if ((!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ]) {
                return;
            }
            //将用户传入的第一个参数都转换为jQuery.Event实例
            event = typeof event === "object" ?
                    //如果是jQuery.Event实例
                    event[ jQuery.expando ] ? event :
                    //如果是原生事件对象
                    new jQuery.Event(type, event) :
                    //如果是事件类型
                    new jQuery.Event(type);

            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" +
                    namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            ontype = type.indexOf(":") < 0 ? "on" + type : "";

            // Handle a global trigger
            //如果没有指明触发者，只有将整个缓存系统寻找一遍了
            if (!elem) {
                // TODO: Stop taunting the data cache; remove global events and always attach to document
                cache = jQuery.cache;
                for (i in cache) {
                    if (cache[ i ].events && cache[ i ].events[ type ]) {
                        jQuery.event.trigger(event, data, cache[ i ].handle.elem, true);
                    }
                }
                return;
            }
            //清掉result，方便重复使用
            event.result = undefined;
            if (!event.target) {
                event.target = elem;//但事件源是保证不变的
            }
            //data用于放置派发事件时的额外参数，为了方便apply必须整成数组，并把event放在第一位
            data = data != null ? jQuery.makeArray(data) : [];
            data.unshift(event);
            //如果此事件类型指定了它的trigger方法，就使用它的
            special = jQuery.event.special[ type ] || {};
            if (special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }

            //预先决定冒泡的路径，一直冒泡到window
            eventPath = [[elem, special.bindType || type]];
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

                bubbleType = special.delegateType || type;
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                for (old = elem; cur; cur = cur.parentNode) {
                    eventPath.push([cur, bubbleType]);
                    old = cur;
                }
                if (old === (elem.ownerDocument || document)) {
                    eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
                }
            }

            //沿着规划好的路径把经过的元素节点的指定事件类型的回调逐一触发
            for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {

                cur = eventPath[i][0];
                event.type = eventPath[i][1];

                handle = (jQuery._data(cur, "events") || {})[ event.type ] && jQuery._data(cur, "handle");
                //handle其实就是调用dispatch函数，因此trigger是把整个冒泡过程都人工实现
                if (handle) {
                    handle.apply(cur, data);
                }
                //处理以onXXX绑定的回调，无论是写在HTML标签内还是以无侵入方式
                handle = ontype && cur[ ontype ];
                if (handle && jQuery.acceptData(cur) && handle.apply && handle.apply(cur, data) === false) {
                    event.preventDefault();//如果返回true就中断循环
                }
            }
            event.type = type;
            //如果用户没有调用preventDefault或return false，就模拟默认行为
            //具体是指执行submit、blur、focus、select、reset、scroll等方法
            //不过其实它并没有模拟所有默认行为
            //比如点击链接时会跳转
            //又比如点击复选框单选框，元素的checked会改变
            if (!onlyHandlers && !event.isDefaultPrevented()) {
                //如果用户指定了默认行为，则只执行它的默认行为，并跳过链接的点击事件
                if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) &&
                        !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {
                    //如果元素同时存在el["on"+type]回调与el[type]方法，则表示它有默认行为
                    //对于el[type]属性的检测，jQuery不使用isFunction方法，因为它的typeof在IE6～IE8
                    //返回object
                    //jQuery也不打算触发隐藏元素的focus或blur默认行为，IE6～IE8下会抛出
                    //“由于该控件目前不可见、未启用或其类型不允许，因此无法将焦点移向它”错误
                    //jQuery也不打算触发window的默认行为，防止触发了window.scroll方法
                    //scroll()方法在IE与标准浏览器存在差异，IE会默认scroll()为scroll(0,0)
                    if (ontype && elem[ type ] && ((type !== "focus" && type !== "blur") ||
                            event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {

                        // onXXX回调已经在$.event.dispatch方法执行过了，不用再次触发
                        old = elem[ ontype ];

                        if (old) {
                            elem[ ontype ] = null;
                        }
                        //标识正在触发此事件类型，防止下面elem[type]()重复执行dispatch
                        jQuery.event.triggered = type;
                        elem[ type ]();//执行默认行为
                        jQuery.event.triggered = undefined;//还原
                        if (old) {//还原
                            elem[ ontype ] = old;
                        }
                    }
                }
            }
            //与dispatch一样，返回event.result
            return event.result;
        }

        Object.getOwnPropertyNames(window).filter(function(p) {
            return typeof window[p] == "function" && (window[p].prototype instanceof Event);
        })

                ["OverflowEvent", "CustomEvent", "CompositionEvent", "AudioProcessingEvent", "Before LoadEvent", "TextEvent", "MessageEvent", "SVGZoomEvent", "UIEvent", "PopStateEvent", "MouseEvent", "SpeechInputEvent", "ErrorEvent", "DeviceOrientationEvent", "ProgressEvent", "CloseEvent", "MutationEvent", "PageTransitionEvent", "HashChangeEvent", "WheelEvent", "StorageEvent", "XMLHttpRequestProgressEvent", "WebGLContextEvent", "TouchEvent", "WebKitTransitionEvent", "MediaStreamEvent", "OfflineAudioCompletionEvent", "Keyboard Event", "WebKitAnimationEvent"]
        /*
         trigger: function( type, target){
         var doc = target.ownerDocument || target.document || target || document;
         event = doc.createEvent(eventMap[type] || "CustomEvent");
         if(/^(focus|blur|select|submit|reset)$/.test(type)){
         target[type] && target[type]();//触发默认行为
         }
         Event.initEvent( type, true,true);
         target.dispatchEvent(event);
         }
         */

        jQuery.Event = function(src, props) {
            //无“new”实例化
            if (!(this instanceof jQuery.Event)) {
                return new jQuery.Event(src, props);
            }
            if (src && src.type) {
                this.originalEvent = src;
                this.type = src.type;
                this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
                        src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

                // Event type
            } else {
                this.type = src;
            }

            // 如果是一个对象，复制它的属性
            if (props) {
                jQuery.extend(this, props);
            }

            this.timeStamp = src && src.timeStamp || jQuery.now();//修复FF的问题

            // 标识已经修正过
            this[ jQuery.expando ] = true;
        };

        function returnFalse() {
            return false;
        }
        function returnTrue() {
            return true;
        }

        jQuery.Event.prototype = {
            preventDefault: function() {
                this.isDefaultPrevented = returnTrue;
                var e = this.originalEvent;
                if (!e) {
                    return;
                }
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            },
            stopPropagation: function() {
                this.isPropagationStopped = returnTrue;
                var e = this.originalEvent;
                if (!e) {
                    return;
                }
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.cancelBubble = true;
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = returnTrue;
                this.stopPropagation();
            },
            isDefaultPrevented: returnFalse,
            isPropagationStopped: returnFalse,
            isImmediatePropagationStopped: returnFalse
        };

        fix = function(event) {
            if (event[ jQuery.expando ]) {
                return event;
            }
            var i, prop,
                    originalEvent = event,
                    fixHook = jQuery.event.fixHooks[ event.type ] || {},
                    copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

            event = jQuery.Event(originalEvent);
            //不同的事件类型,它的属性也不一样
            for (i = copy.length; i; ) {
                prop = copy[ --i ];
                event[ prop ] = originalEvent[ prop ];
            }

            if (!event.target) {//FireFox IE6～IE8 Safari2
                event.target = originalEvent.srcElement || document;
            }
            if (event.target.nodeType === 3) {// FireFox Safari
                event.target = event.target.parentNode;
            }
            // FireFox IE6～IE8
            event.metaKey = !!event.metaKey;
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        }

        /**
         * 
         if(event.which == null ) {
         event.which = event.charCode != null ? event.charCode : event.keyCode;
         }
         var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
         var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
         
         e.pageX = e.clientX + scrollLeft
         e.pageY = e.clientY + scrollTop
         
         */
        var wheel = function(obj, callback) {
            var wheelType = "mousewheel"
            try {
                document.createEvent("MouseScrollEvents")
                wheelType = "DOMMouseScroll"
            } catch (e) {
            }
            addEvent(obj, wheelType, function(event) {
                if ("wheelDelta" in event) {//统一为±120，其中正数表示向上滚动，负数表示向下滚动
                    var delta = event.wheelDelta
                    //Opera 9x系列的滚动方向与IE保持一致，10后修正
                    if (window.opera && opera.version() < 10)
                        delta = -delta;
                    //由于事件对象的原有属性是只读，我们只能通过添加一个私有属性delta来解决兼容问题
                    event.delta = Math.round(delta) / 120; //修正Safari的浮点 bug
                } else if ("detail" in event) {
                    event.wheelDelta = -event.detail * 40//为FF添加更大众化的wheelDelta
                    event.delta = event.wheelDelta / 120  //添加私有的delta
                }
                callback.call(obj, event);//修正IE的this指向
            });
        }
        /**
         <!DOCTYPE HTML>
         <html>
         <head>
         <title>滚轮事件mousewheel by 司徒正美</title>
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
         <style>
         body{
         padding:10px 100px;
         }
         .slider{
         width:48px;
         height:200px;
         padding: 5px 0px;
         background:#eee;
         cursor:n-resize;
         }
         .slider-slot {
         width:16px;
         margin:10px 15px;
         height:180px;
         background:#eee;
         border:1px solid gray;
         border-color:#999 white white #999;
         position:relative;
         }
         .slider-trigger {
         width:14px;
         height:18px;
         font:1px/0 arial;
         border:1px solid gray;
         border-color:white #999 #999 white;
         background:#ccc;
         position:absolute;
         }
         
         </style>
         <script type="text/javascript">// <![CDATA[
         window.onload = function(){
         function log(s){
         window.console && console.log(s);
         } 
         var get = function(i) {
         return document.getElementById( i );
         }
         function addEvent(el, type, callback, useCapture  ){
         if(el.dispatchEvent){//W3C方式优先
         el.addEventListener( type, callback, !!useCapture  );
         }else {
         el.attachEvent( "on"+type, callback );
         }
         return callback;//返回callback方便卸载时用
         }
         var wheel = function(obj,callback){
         var wheelType = "mousewheel"
         try{
         document.createEvent("MouseScrollEvents")
         wheelType = "DOMMouseScroll"
         }catch(e){}
         addEvent(obj, wheelType,function(event){
         if ("wheelDelta" in event){//统一为±120，其中正数表示向上滚动，
         //负数表示向下滚动
         var delta = event.wheelDelta
         //Opera 9x系列的滚动方向与IE保持一致，10后修正
         if( window.opera && opera.version() < 10 )
         delta = -delta;
         //由于事件对象的原有属性是只读，我们只能通过添加一个私有属性delta来解决兼容问题
         event.delta = Math.round(delta) /120; //修正Safari的浮点 BUG
         }else if( "detail" in event ){ event.wheelDelta = -event.detail * 40//为FF添加更大众化的wheelDelta
         event.delta = event.wheelDelta /120  //添加私有的delta
         }
         callback.call(obj,event);//修正IE的this指向
         });
         }
         function　preventDefault(e){
         if( e.preventDefault )
         e.preventDefault();
         e.returnValue = false;
         }
         
         wheel(get("number"), function(e){
         this.value = (Number(this.value) || 0) + e.delta  //120  ; 
         this.select(); 
         preventDefault(e)
         })
         
         wheel(get("img"), function(e){ 
         this.style.width =  this.offsetWidth + e.delta + 'px';
         this.style.height =  this.offsetHeight + e.delta + 'px';
         preventDefault(e)
         
         })
         
         function range( num, max,min ) { 
         return Math.min( max, Math.max( num,min ) ); 
         } 
         var  tar = get('sliderTrigger'); 
         wheel(get("slider"), function(e){
         preventDefault(e)
         tar.style.top = range( tar.offsetTop + ( -1 * e.delta * 10 ),160,0 ) + 'px';
         })
         }
         </script>
         </head>
         <body>
         <h2>文本框增加/减少值</h2>
         <div><input type="text" value="300" id="number">
         <span>文本框获得焦点后滚动鼠标滚轮</span>
         </div>
         <h2>鼠标滚动缩放图片</h2>
         <div>
         <img id="img" style="cursor:-moz-zoom-in" title="鼠标滚动 缩放大小" src="http: //www.baidu.com/img/baidu.gif" />
         </div>
         <h2>鼠标滚动控制滑块移动</h2>
         <div id="slider" class="slider">
         <div class="slider-slot">
         <div id="sliderTrigger" class="slider-trigger">
         </div>
         </div>
         </div>
         
         </body>
         </html>
         
         
         
         <!DOCTYPE html>
         <html>
         <head>
         <title>点击弹出层以外的地方隐藏层 by 司徒正美</title>
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
         <style>
         .menu_wrap{
         display: none;
         padding:5px;
         width:120px;
         border:1px solid #006dcc;
         }
         .menu{
         list-style: none;
         padding:0;
         margin:0;
         }
         .menu li{
         width:120px;
         text-indent: 1em;
         height: 25px;
         line-height: 25px;
         }
         .menu li:hover{
         background: #06a3d6;
         color:#fff;
         }
         </style>
         <script>
         window.onload = function(){
         function log(s){
         window.console && console.log(s);
         } 
         var get = function(i) {
         return document.getElementById( i );
         }
         function addEvent(el, type, callback, useCapture  ){
         if(el.dispatchEvent){//W3C方式优先
         el.addEventListener( type, callback, !!useCapture  );
         }else {
         el.attachEvent( "on"+type, callback );
         }
         return callback;//返回callback方便卸载时用
         }
         addEvent(get("button"),"click",function(){
         get("menu_wrap").style.display = "block";
         })
         var flag
         addEvent(get("menu_wrap"),"mouseenter",function(){
         flag = false;
         })
         addEvent(get("menu_wrap"),"mouseleave",function(){
         flag = true;
         })
         addEvent(document,"click",function(){
         if(flag){
         get("menu_wrap").style.display = "none";
         }
         })
         }
         </script>
         </head>
         <body>
         <div>
         <strong id="button">显示下拉菜单 </strong>
         <div class="menu_wrap" id="menu_wrap">
         <ul class="menu">
         <li>item1</li>
         <li>item2</li>
         <li>item3</li>
         </ul>
         </div>
         </div>
         </body>
         </html>
         */

//如果浏览器不支持我们才进入修复分支
        if (!+"\v1" || eventSupport("mouseenter")) {
            //IE6～IE8不能实现捕获，
//2013年10月之前的safari和chrome版本也不支持mouseenter，chrome30修复
            jQuery.each({
                mouseenter: "mouseover",
                mouseleave: "mouseout"
            }, function(orig, fix) {
                jQuery.event.special[ orig ] = {
                    delegateType: fix, //事件冒充用，用于绑定时
                    bindType: fix,
                    handle: function(event) {//当JS引擎执行到这一层时，event对象已经打补丁
                        var ret, target = this, handleObj = event.handleObj
                        //mouseover时相当于IE的formElement，mouseout时相当于IE的toElement
                        related = event.relatedTarget
                        //判定要进入的节点与绑定的节点不存在包含关系并且不相等才调用函数
                        if (!related || (related !== target && !jQuery.contains(target, related))) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });
        }

        if (!jQuery.support.focusinBubbles) {
            jQuery.each({focus: "focusin", blur: "focusout"}, function(orig, fix) {
                //只绑定一次focusin与focusout，通过document进行监听，
                //然后捕获事件源，进行人工冒泡
                var attaches = 0,
                        handler = function(event) {
                    jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
                };
                jQuery.event.special[ fix ] = {
                    setup: function() {
                        if (attaches++ === 0) {
                            document.addEventListener(orig, handler, true);
                        }
                    },
                    teardown: function() {
                        if (--attaches === 0) {
                            document.removeEventListener(orig, handler, true);
                        }
                    }
                };
            });
        }
//https://github.com/RubyLouvre/mass-Framework/blob/0.6/event_fix.js
        "submit,reset".replace($.rword, function(type) {
            adapter[ type ] = {
                setup: delegate(function(node) {
                    $(node).bind("click._" + type + " keypress._" + type, function(event) {
                        var el = event.target;
                        if (el.form && (adapter[ type ].keyCode[ event.which ] || adapter[ type ].input[  el.type ])) {
                            facade._dispatch([node], event, type);
                        }
                    });
                }),
                keyCode: $.oneObject(type == "submit" ? "13,108" : "27"),
                input: $.oneObject(type == "submit" ? "submit,image" : "reset"),
                teardown: delegate(function(node) {
                    $(node).unbind("._" + type);
                })
            };
        });
        https://github.com/RubyLouvre/avalon/blob/0.972/avalon.js#L2336
                if (window.addEventListener) { //先执行W3C
            element.addEventListener("input", updateModel)
        } else {
            element.attachEvent("onpropertychange", function(e) {
                if (e.propertyName === "value") {
                    updateModel()
                }
            })
        }

        if (document.documentMode === 9) {
            var selectionchange = function(e) {
                if (e.type === "focus") {
                    document.addEventListener("selectionchange", updateModel)
                } else {
                    document.removeEventListener("selectionchange", updateModel)
                }
            };
            element.addEventListener("focus", selectionchange)
            element.addEventListener("blur", selectionchange)
        }
