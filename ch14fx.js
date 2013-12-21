/* 
<style type="text/css">
    #taxiway{
        width:800px;
        height:100px;
        background:#E8E8FF;
        position: relative;
    }
    #move{
        position: absolute;
        left:0px;
        width:100px;
        height:100px;
        background:#a9ea00;
    }
</style>  
<div id="taxiway">
　　   <div id="move" ></div>
</div>
<script>
    window.onload = function() {
        var el = document.getElementById("move");
        var parent = document.getElementById("taxiway")
        var distance = parent.offsetWidth - el.offsetWidth;				//总移动距离
        var begin = parseFloat(window.getComputedStyle(el, null).left);	//开始位置
        var end = begin + distance;						//结束位置
        var fps = 30;									//刷新率
        var interval = 1000 / fps;						//每相隔多少ms刷新一次
        var duration = 2000;//时长
        var times = duration / 1000 * fps;					//一共刷新这么多次
        var step = distance / times;//每次移动多少距离
        el.onclick = function() {
            var now = new Date
            var id = setInterval(function() {
                if (begin >= end) {
                    el.style.left = end + "px";
                    clearInterval(id);
                    alert(new Date - now)
                } else {
                    begin += step;
                    el.style.left = begin + "px"
                }
            }, interval)
        }
    }
</script>

 */
el.onclick = function() {
    var beginTime = new Date
    var id = setInterval(function() {
        var t = new Date - beginTime;//当时已用掉的时间
        if (t >= duration) {
            el.style.left = end + "px";
            clearInterval(id);
            alert(t)
        } else {
            var per = t / duration;//当前进度
            el.style.left = begin + per * distance + "px"
        }
    }, interval)
}
/**
linear: function( p ) { 
    return p;
},
swing: function( p ) {
    return 0.5 - Math.cos( p*Math.PI ) / 2;
}

 */
var easing = {
    easeInQuad: function( t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function( t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function( t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
    //……略
}
window.onload = function() {
    var el = document.getElementById("move");
    var parent = document.getElementById("taxiway")
    var change = parent.offsetWidth - el.offsetWidth;				//★总变化量
    var begin = parseFloat(window.getComputedStyle(el, null).left);//★起始值
    var end = begin + change;						//★结束值
    var fps = 30;									//刷新率
    var interval = 1000 / fps;						//每相隔多少ms刷新一次
    var duration = 2000;							//★时长
    var bounce = function(per) {						//★缓动公式，弹簧
        if (per < (1 / 2.75)) {
            return (7.5625 * per * per);
        } else if (per < (2 / 2.75)) {
            return (7.5625 * (per -= (1.5 / 2.75)) * per + .75);
        } else if (per < (2.5 / 2.75)) {
            return (7.5625 * (per -= (2.25 / 2.75)) * per + .9375);
        } else {
            return (7.5625 * (per -= (2.625 / 2.75)) * per + .984375);
        }
    }
    el.onclick = function() {
        var beginTime = new Date
        var id = setInterval(function() {
            var per = (new Date - beginTime) / duration;//★进度
            if (per >= 1) {
                el.style.left = end + "px";
                clearInterval(id);
            } else {
                el.style.left = begin + bounce(per) * change + "px";
            }
        }, interval)
    }
}

https://github.com/RubyLouvre/mass-Framework/blob/master/fx.js
var timeline = $.timeline = []; 				//时间轴

function insertFrame(frame) { 				//插入包含关键帧原始信息的帧对象
    if (frame.queue) { 						//如果指定要排队
        var gotoQueue = 1;
        for (var i = timeline.length, el; el = timeline[--i];) {
            if (el.node === frame.node) { 		//★★★第一步
                el.positive.push(frame); 		//子列队
                gotoQueue = 0;
                break;
            }
        }
        if (gotoQueue) { 					//★★★第二步
            timeline.unshift(frame);
        }
    } else {
        timeline.push(frame);
    }
    if (insertFrame.id === null) {//只要数组中有一个元素就开始运行
        insertFrame.id = setInterval(deleteFrame, 1000 / $.fps); 
    }
}
insertFrame.id = null;


var effect = $.fn.animate = $.fn.fx = function(props) {
    //将多个参数整成两个，第一参数暂时别动
    var opts = addOptions.apply(null, arguments), p
    //第一个参数为元素的样式，我们需要将它们从CSS的连字符风格统统转为驼峰风格
    //如果需要私有前缀，也在这里加上
    for (var name in props) {
        p = $.cssName(name) || name;
        if (name !== p) {
            props[p] = props[name]; 	//添加borderTopWidth、styleFloat
            delete props[name];     	//删掉border-top-width、float
        }
    }
    for (var i = 0, node; node = this[i++];) {
        //包含关键帧的原始信息的对象到主列队或子列队
        insertFrame($.mix({
            positive: [],				//正向列队
            negative: [],				//外队列队
            node: node,				//元素节点
            props: props				//@keyframes中要处理的样式集合
        }, opts));
    }
    return this;
}

function deleteFrame() {
        var i = timeline.length;
        while (--i >= 0) {
            if (!timeline[i].paused) { //如果没有被暂停
                if (!(timeline[i].node && enterFrame(timeline[i], i))) {
                     timeline.splice(i, 1);
                }
            }
        }
        timeline.length || (clearInterval(insertFrame.id), insertFrame.id = null);
}
function addOptions(properties) {
    if (isFinite(properties)) {//如果第一个为数字
        return {
            duration: properties
        };
    }
    var opts = {};
    //如果第二参数是对象
    for (var i = 1; i < arguments.length; i++) {
        addOption(opts, arguments[i]);
    }
    opts.duration = typeof opts.duration === "number" ? opts.duration : 400;
    opts.queue = !!(opts.queue == null || opts.queue); //默认进行排队
    opts.easing = $.easing[opts.easing] ? opts.easing : "swing";
    return opts;
}
function addOption(opts, p) {
    switch ($.type(p)) {
        case "Object":
            addCallback(opts, p, "after");
            addCallback(opts, p, "before");
            $.mix(opts, p);
            break;
        case "Number":
            opts.duration = p;
            break;
        case "String":
            opts.easing = p;
            break;
        case "Function":
            opts.complete = p;
            break;
    }
}
function addCallback(target, source, name) {
    if (typeof source[name] === "function") {
        var fn = target[name];
        if (fn) {
            target[name] = function(node, fx) {
                fn(node, fx);
                source[name](node, fx);
            };
        } else {
            target[name] = source[name];
        }
    }
    delete source[name];
}/*
function enterFrame(fx, index) {
    //驱动主列队的动画实例进行补间动画(update) 
    //并在动画结束后，从子列队选取下一个动画实例取替自身
    var node = fx.node,
            now = +new Date;
    if (!fx.startTime) { 							//第一帧
        callback(fx, node, "before");					//动画开始前做些预操作
        fx.props && parseFrames(fx.node, fx, index); 	//分解原始材料为关键帧
        fx.props = fx.props || [];
        AnimationPreproccess[fx.method || "noop")](node, fx); //parse后也要做些预处理
        fx.startTime = now;
    } else {  //中间自动生成的补间
        var per = (now - fx.startTime) / fx.duration;
        var end = fx.gotoEnd || per >= 1;//gotoEnd可以被外面的stop方法操控,强制中止
        var hooks = effect.updateHooks;
        if(fx.update){
            for (var i = 0, obj; obj = fx.props[i++]; ) {// 处理渐变
               (hooks[obj.type] || hooks._default)(node, per, end, obj);
            }
        }
        if (end) { //最后一帧
            callback(fx, node, "after"); 			//动画结束后执行的一些收尾工作
            callback(fx, node, "complete"); 		//执行用户回调
            if (fx.revert && fx.negative.length) {	//如果设置了倒带
                Array.prototype.unshift.apply(fx.positive, fx.negative.reverse());
                fx.negative = []; // 清空负向列队
            }
            var neo = fx.positive.shift();
            if (!neo) {
                return false
            } //如果存在排队的动画,让它继续
            timeline[index] = neo;
            neo.positive = fx.positive;
            neo.negative = fx.negative;
        } else {
            callback(fx, node, "step"); //每执行一帧调用的回调
        }
    }
    return true;
}
*/
function callback(fx, node, name) {
    if (fx[name]) {
        fx[name](node, fx);
    }
}
effect.updateHooks = {
    _default: function(node, per, end, obj) {
        $.css(node, obj.name, (end ? obj.to : obj.from + obj.easing(per) * 
          (obj.to - obj.from)) + obj.unit)
    },
    color: function(node, per, end, obj) {
        var pos = obj.easing(per),
                rgb = end ? obj.to : obj.from.map(function(from, i) {
            return Math.max(Math.min(parseInt(from + (obj.to[i] - from) * pos, 10), 255), 0);
        });
        node.style[obj.name] = "rgb(" + rgb + ")";
    },
    scroll: function(node, per, end, obj) {
        node[obj.name] = (end ? obj.to : obj.from + obj.easing(per) * (obj.to - obj.from));
    }
};

var colorMap = {
    "black": [0, 0, 0],
    "gray": [128, 128, 128],
    "white": [255, 255, 255],
    "orange": [255, 165, 0],
    "red": [255, 0, 0],
    "green": [0, 128, 0],
    "yellow": [255, 255, 0],
    "blue": [0, 0, 255]
};

function parseColor(color) {
    var value;//在iframe下进行操作
    $.applyShadowDOM(function(wid, doc, body) {
        var range = body.createTextRange();
        body.style.color = color;
        value = range.queryCommandValue("ForeColor");
    });
    return [value & 0xff, (value & 0xff00) >> 8, (value & 0xff0000) >> 16];
}

function color2array(val) { //将字符串变成数组
    var color = val.toLowerCase(),
            ret = [];
    if (colorMap[color]) {
        return colorMap[color];
    }
    if (color.indexOf("rgb") === 0) {
        var match = color.match(/(\d+%?)/g),
                factor = match[0].indexOf("%") !== -1 ? 2.55 : 1;
        return (colorMap[color] = [parseInt(match[0]) * factor, parseInt(match[1]) * factor, parseInt(match[2]) * factor]);
    } else if (color.charAt(0) === '#') {
        if (color.length === 4)
            color = color.replace(/([^#])/g, '$1$1');
        color.replace(/\w{2}/g, function(a) {
            ret.push(parseInt(a, 16));
        });
        return (colorMap[color] = ret);
    }
    if (window.VBArray) {
        return (colorMap[color] = parseColor(color));
    }
    return colorMap.white;
}
$.parseColor = color2array;


var AnimationPreproccess = {
    noop: $.noop,
    show: function(node, frame) {
        if (node.nodeType === 1 && $.isHidden(node)) {
            var display = $._data(node, "olddisplay");
            if (!display || display === "none") {
                display = $.parseDisplay(node.nodeName);
                $._data(node, "olddisplay", display);
            }
            node.style.display = display;
            if ("width" in frame.props || "height" in frame.props) { 
                //如果是缩放操作
                //修正内联元素的display为inline-block，让其可以进行width/height的动画渐变
                if (display === "inline" && $.css(node, "float") === "none") {
                    if (!$.support.inlineBlockNeedsLayout) { //W3C
                        node.style.display = "inline-block";
                    } else { //IE
                        if (display === "inline") {
                            node.style.display = "inline-block";
                        } else {
                            node.style.display = "inline";
                            node.style.zoom = 1;
                        }
                    }
                }
            }
        }
    },
    hide: function(node, frame) {
        if (node.nodeType === 1 && !$.isHidden(node)) {
            var display = $.css(node, "display"),
                    s = node.style;
            if (display !== "none" && !$._data(node, "olddisplay")) {
                $._data(node, "olddisplay", display);
            }
            var overflows;
            if ("width" in frame.props || "height" in frame.props) { 
                //如果是缩放操作
                //确保内容不会溢出,记录原来的overflow属性
                //因为IE在改变overflowX与overflowY时，overflow不会发生改变
                overflows = [s.overflow, s.overflowX, s.overflowY];
                s.overflow = "hidden";
            }
            var fn = frame.after || $.noop;
            frame.after = function(node, fx) {
                if (fx.method === "hide") {
                    node.style.display = "none";
                    for (var i in fx.orig) { //还原为初始状态
                        $.css(node, i, fx.orig[i]);
                    }
                }
                if (overflows) {
                    ["", "X", "Y"].forEach(function(postfix, index) {
                        s["overflow" + postfix] = overflows[index];
                    });
                }
                fn(node, fx);
            };
        }
    },
    toggle: function(node, fx) {
        $[$.isHidden(node) ? "show" : "hide"](node, fx);
    }
};
/*
<script>
  //firefox4-10
  var startTime,
          duration = 3000;
  function animate(event) {
      var now = event.timeStamp;
      var per = (now - startTime) / duration;
      if (per >= 1) {
          window.removeEventListener('MozBeforePaint', animate, false);
      } else {
          document.getElementById("test").style.left = Math.round(600 * per) + "px";
          window.mozRequestAnimationFrame();
      }
  }
  function start() {
      startTime = Date.now();
      window.addEventListener('MozBeforePaint', animate, false);
      window.mozRequestAnimationFrame();
  }
</script>
<button onclick="start()">点我</button>


<script>
  //chrome10-23
  var startTime,
          duration = 3000;
  function animate(now) {
      var per = (now - startTime) / duration;
    if(per >= 1) {
        window.webkitCancelRequestAnimationFrame(requestID);
    } else {
        document.getElementById("test").style.left = Math.round(600 * per) + "px";
        window.webkitRequestAnimationFrame(animate);//不断地递归调用animate
    }
}
function start() {
    startTime = Date.now();
    requestID = window.webkitRequestAnimationFrame(animate);
}
</script>
<button onclick="start()">点我</button>
<div id="test" style="position: absolute; left: 10px; background: red;"> go! </div>

*/


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequest AnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// by 司徒正美 基于网友屈屈与月影的版本改进而来
// https://github.com/wedteam/qwrap-components/blob/master/animation/anim.frame.js
function getAnimationFrame() {
    //不存在msRequestAnimationFrame，IE10与Chrome24直接用:requestAnimationFrame
    if (window.requestAnimationFrame) {
        return {
            request: requestAnimationFrame,
            cancel: cancelAnimationFrame
        }
        //Firefox11-没有实现cancelRequestAnimationFrame
        //并且mozRequestAnimationFrame与标准出入过大
    } else if (window.mozCancelRequestAnimationFrame && window.mozCancelAnimationFrame) {
        return {
            request: mozRequestAnimationFrame,
            cancel: mozCancelAnimationFrame
        }
    } else if (window.webkitRequestAnimationFrame && webkitRequestAnimationFrame(String)) {
        return {//修正某个特异的webKit版本下没有time参数
            request: function(callback) {
                return window.webkitRequestAnimationFrame(
                        function() {
                            return callback(new Date - 0);
                        }
                );
            },
            cancel: window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame
        }
    } else {
        var millisec = 25;	 //40fps;
        var callbacks = [];
        var id = 0, cursor = 0;
        function playAll() {
            var cloned = callbacks.slice(0);
            cursor += callbacks.length;
            callbacks.length = 0; //清空列队
            for (var i = 0, callback; callback = cloned[i++]; ) {
                if (callback !== "cancelled") {
                    callback(new Date - 0);
                }
            }
        }
        window.setInterval(playAll, millisec);
        return {
            request: function(handler) {
                callbacks.push(handler);
                return id++;
            },
            cancel: function(id) {
                callbacks[id - cursor] = "cancelled";
            }
        };
    }
}


    var fps_arr, fps_min, fps_max, last_time, loop_iteration;
    var testing = false;
    var fps_label;
    function stop_test() {
        testing = false;
    }
    var init_test = function init_test() {
        fps_arr = [];
        fps_min = 1000;
        fps_max = last_time = loop_iteration = 0;
        if (typeof fps_label === 'undefined') {
            fps_label = document.getElementById('fps_label');
        }
        testing = true;
    }
    function main() {
        var i, fps_avg = 0;
        var now = new Date().getTime();
        if (last_time !== 0 && last_time !== now) {
            var fps = Math.round(1000 / (now - last_time));

            fps_arr.push(fps);
            if (fps_arr.length > 100) {
                fps_arr.shift();
            }
            for (i = 0; i < fps_arr.length; i++) {
                fps_avg += fps_arr[i];
            }
            fps_avg /= fps_arr.length;
            fps_avg = Math.round(fps_avg);//平均帧数

            if (++loop_iteration > 1) {
                if (fps < fps_min) {
                    fps_min = fps;//最小帧数
                }
                if (fps > fps_max) {
                    fps_max = fps;//最大帧数
                }
            }
            fps_label.innerHTML = fps + ' FPS (' + fps_min + ' - ' + fps_max + ') [平均为 ' + fps_avg + ']';
        }
        last_time = now;
    }
    // Pure Timers 
    function run_timers() {
        main();
        if (testing === true) {
            setTimeout(run_timers, 1);
        }
    }
    window.requestAnimFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame;
    //requestAnimationFrame 
    function run_raf() {
        main();
        if (testing === true) {
            requestAnimFrame(run_raf, 1);
        }
    }
    // for loop 
    function run_loop() {
        var iterations = 15;
        while (iterations--) {
            main();
        }
        if (testing === true) {
            setTimeout(run_loop, 1);
        }
    }
    // postMessage 
    function run_message() {
        main();
        if (testing === true) {
            window.postMessage('', '*');
        }
    }
    window.addEventListener('message', run_message, false);
/*
<p id="fps_label"># fps (# - #) [#]</p>
<button onClick="stop_test();">中止</button>

<br /><br />
<strong>Tests</strong><br />
<button onClick="init_test();
        run_timers();">Pure Timers</button>
<button onClick="init_test();
        run_raf();">requestAnimationFrame</button>
<button onClick="init_test();
        run_loop();"> Loop</button>
<button onClick="init_test();
        run_message();">postMessage</button>
*/

(function() {
    var span = document.createElement("span");
    span.id = "mass_transition";
    span.innerHTML = "test"
    var body = document.body || document.documentElement;
    var style = document.createElement("style");
    window.transitionend;//外面调用，如果是框架，请附到框架的命名空间下
    body.appendChild(span)
    body.appendChild(style);
    style.innerHTML = "#mass_transition{ color:red;opacity:0;height:1px;overflow:hidden ;" +
            "-moz-transition: color 0.1s; -o-transition:color 0.1s;" +
            "-webkit-transition:color 0.1s; transition:color 0.1s;  }"
    "transitionend otransitionend oTransitionEnd  webkitTransitionEnd".replace(/\w+/g, function(a) {
        span.addEventListener(a, function(e) {
            if (!window.transitionend) {
                window.transitionend = e.type;
                alert(e.type) //想测试时自己去掉
            }
        }, false)
    });
    setTimeout(function() {
        span.style.color = "black";
    });
    setTimeout(function() {
        body.removeChild(span)
        body.removeChild(style);
    }, 1000)
})()

var getTransitionEndEventName = function() {
    var obj = {
        'TransitionEvent': 'transitionend',
        'WebKitTransitionEvent': 'webkitTransitionEnd',
        'OTransitionEvent': 'oTransitionEnd',
        'otransitionEvent': 'otransitionEnd'
    }
    var ret
    //有的浏览器同时支持私有实现与标准写法，比如webkit支持前两种，Opera支持1、3、4
for (var name in obj) {
        if(window[name]){
            ret = obj[name]
            break;
       }
        try {
            var a = document.createEvent(name);
            ret = obj[name]
            break;
        } catch (e) {
        }
    }//这是一个惰性函数，只检测一次，下次直接返回缓存结果
    getTransitionEndEventName = function() {
        return ret
    }
    return ret
}
alert(getTransitionEndEventName());

var getAnimationEndEventName = function() {     
    //大致上有两种选择
    //IE10+, Firefox 16+ & Opera 12.1+: animationend
    //Chrome/Safari: webkitAnimationEnd
    //http://blogs.msdn.com/b/davrous/archive/2011/12/06/introduction-to-css3-animat ions.aspx
    //IE10也可以使用MSAnimationEnd监听，但是回调里的事件 type依然为animationend
    //  el.addEventListener("MSAnimationEnd", function(e) {
    //     alert(e.type)// animationend！！！
    // })
    var obj = {
        'AnimationEvent': 'animationend',
        'WebKitAnimationEvent': 'webkitAnimationEnd'
    }
    var ret ;
    for (var name in obj) {
        if(window[name]){
            ret = obj[name];
            break;
        }      
    }//这是一个惰性函数，只检测一次，下次直接返回缓存结果
    getAnimationEndEventName = function() {
        return ret;
    }
    return ret;
}

//https://github.com/RubyLouvre/mass-Framework/blob/master/fx_neo.js
var styleElement;

function insertCSSRule(rule) {
    //动态插入一条样式规则
    if (styleElement) {
        var number = 0;
        try {
            var sheet = styleElement.sheet;// styleElement.styleSheet;
            var cssRules = sheet.cssRules; // sheet.rules;
            number = cssRules.length;
            sheet.insertRule(rule, number);
        } catch (e) {
            $.log(e.message + rule);
        }
    } else {
        styleElement = document.createElement("style");
        styleElement.innerHTML = rule;
        document.head.appendChild(styleElement);
    }
}

function deleteCSSRule(ruleName, keyframes) {
    //删除一条样式规则
    var prop = keyframes ? "name" : "selectorText";
    var name = keyframes ? "@keyframes " : "cssRule ";//调试用
    if (styleElement) {
        var sheet = styleElement.sheet;// styleElement.styleSheet;
        var cssRules = sheet.cssRules;// sheet.rules;
        for (var i = 0, n = cssRules.length; i < n; i++) {
            var rule = cssRules[i];
            if (rule[prop] === ruleName) {
                sheet.deleteRule(i);
                $.log("已经成功删除" + name + " " + ruleName);
                break;
            }
        }
    }
}

function deleteKeyFrames(name) {
    //删除一条@keyframes样式规则
    deleteCSSRule(name, true);
}
