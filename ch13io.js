var xhr = new (self.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP")
xhr.onreadystatechange = function() {//先绑定事件后open
    if (this.readyState === 4 && this.status === 200) {
        var div = document.createElement("div");
        div.innerHTML = this.responseText;
        document.body.appendChild(div)
    }
}
xhr.open("POST", "/ajax", true);
//必须,用于让服务器端判断request是AJAX请求(异步)还是传统请求(同步)
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
xhr.send("key=val&key1=val2");
/*
 //*********************jQuery1.4a2******************
 xhr: function(){
 return window.ActiveXObject ?
 new ActiveXObject("Microsoft.XMLHTTP") :
 new XMLHttpRequest();
 },
 //*********************mootools1.2.4******************
 Browser.Request = function(){
 return $try(function(){
 return new XMLHttpRequest();
 }, function(){
 return new ActiveXObject('MSXML2.XMLHTTP');
 }, function(){
 return new ActiveXObject('Microsoft.XMLHTTP');
 });
 };
 //***********************prototype1.61rc2*******************
 getTransport: function() {
 return Try.these(
 function() {return new XMLHttpRequest()},
 function() {return new ActiveXObject('Msxml2.XMLHTTP')},
 function() {return new ActiveXObject('Microsoft.XMLHTTP')}
 ) || false;
 },
 */

function xhr() {
    if (!xhr.cache) {
        var fns = [
            function() {
                return new XMLHttpRequest();
            },
            function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            },
            function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            },
        ];
        for (var i = 0, n = fns.length; i < n; i++) {
            try {
                fns[i]();
                xhr.cache = fns[i];
                break;
            } catch (e) {
            }
        }
        return xhr.cache();
    } else {
        return xhr.cache();
    }
}
var xhrObject = xhr();//调用
alert(xhrObject) //[object XMLHttpRequest]

var xhr = function() {
    var fns = [
        function() {
            return new XMLHttpRequest();
        },
        function() {
            return new ActiveXObject('Msxml2.XMLHTTP');
        },
        function() {
            return new ActiveXObject('Microsoft.XMLHTTP');
        },
    ];
    for (var i = 0, n = fns.length; i < n; i++) {
        try {
            fns[i]();
            xhr = fns[i];//注意这里，覆写自身
            break;
        } catch (e) {
        }
    }
    return xhr()
}

window.$ = window.$ = {}
var s = ["XMLHttpRequest", "ActiveXObject('Msxml2.XMLHTTP.6.0')",
    "ActiveXObject('Msxml2.XMLHTTP.3.0')", "ActiveXObject('Msxml2.XMLHTTP')"];
if (!"1"[0]) {//判定IE67
    s[0] = location.protocol === "file:" ? "!" : s[0];
}
for (var i = 0, axo; axo = s[i++]; ) {
    try {
        if (eval("new " + axo)) {
            $.xhr = new Function("return new " + axo);
            break;
        }
    } catch (e) {
    }
}


var formdata = new FormData();
formdata.append("name", "司徒正美");
formdata.append("blog", "http://www.cnblogs.com/rubylouvre/");

var formobj = document.getElementById("form");
var formdata = formobj.getFormData()

var formobj = document.getElementById("form");
var formdata = new FormData(formobj);

var xhr = new XMLHttpRequest();
xhr.open("POST", "http://ajaxpath");
xhr.send(formData);

var longInt8View = new Uint8Array(myArray);
for (var i = 0; i < longInt8View.length; i++) {
    longInt8View[i] = i % 255;
}
var xhr = new XMLHttpRequest;
xhr.open("POST", url, false);
xhr.send(myArray);
var xhr = new XMLHttpRequest();
xhr.open("POST", url, true);
var blob = new Blob(['abc123'], {type: 'text/plain'});
xhr.send(blob);


//http://objectprog.blogspot.com/2010/11/sendasbinary-for-google-chrome.html
XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    var bb = new WebKitBlobBuilder();
    var data = new ArrayBuffer(1);
    var ui8a = new Uint8Array(data, 0);
    for (var i in datastr) {
        if (datastr.hasOwnProperty(i)) {
            var chr = datastr[i];
            var charcode = chr.charCodeAt(0)
            var lowbyte = (charcode & 0xff)
            ui8a[0] = lowbyte;
            bb.append(data);
        }
    }
    var blob = bb.getBlob();
    this.send(blob);
}

//适用范围：Chrome8～Chrome24、Firefox6～Firefox18、IE10
var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlob
Builder || window.BlobBuilder
        if (!BlobBuilder) {
    console.log("BlobBuilder 已被废弃")
}
var xhr = new XMLHttpRequest();
var img = document.getElementById("img")
xhr.open('POST', 'image.jpg', true);
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
    if (this.status === 200) {
        var bb = new BlobBuilder();
        bb.append(this.response);
        var blob = bb.getBlob('image/jpeg');
        img.src = blob;
    }
};
xhr.send();

//适用范围：Chrome19+、Firefox6、IE10、Opera12、Safari5
var xhr = new XMLHttpRequest();
var img = document.getElementById("img");
xhr.open('POST', 'image.jpg', true);
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
xhr.responseType = 'blob';
//https://developer.mozilla.org/zh-CN/docs/DOM/window.URL.createObjectURL
window.URL = window.URL || window.webkitURL;
img.addEventListener("DOMNodeRemoved", function() {
    window.URL.revokeObjectURL(img.src);
});
xhr.onload = function(e) {
    if (this.status === 200) {
        var blob = this.response;
        img.src = window.URL.createObjectURL(blob);
    }
}
xhr.send();

//适用范围：Chrome10+、Firefox6、IE10、Opera11.60
var xhr = new XMLHttpRequest();
xhr.open('POST', '/path/to/image.jpg', true);
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
    if (this.status == 200) {
        var uInt8Array = new Uint8Array(this.response);
        var i = uInt8Array.length;
        var binaryString = new Array(i);
        while (i--) {
            binaryString[i] = String.fromCharCode(uInt8Array[i]);
        }
        var data = binaryString.join('');
        var base64 = window.btoa(data);
        document.getElementById("img").src = "data:image/jpeg;base64," + base64;
    }
};
xhr.send();

//适用范围：支持overrideMimeType与btoa的浏览器
var xhr = new XMLHttpRequest();
xhr.open('POST', 'image.jpg', true);
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
//重写了默认的MIME类型，强制浏览器将该响应当成纯文本文件来对待，使用一个用户自定义的字符集
//这样就是告诉了浏览器，不要去解析数据,直接返回未处理过的字节码
xhr.overrideMimeType('text/plain; charset=x-user-defined')
xhr.onload = function(e) {
    if (this.status == 200) {
        var responseText = xhr.responseText;
        var responseTextLen = responseText.length;
        var binary = ''
        for (var i = 0; i < responseTextLen; i += 1) {
            //扔掉的高位字节(f7)
            binary += String.fromCharCode(responseText.charCodeAt(i) & 0xff);
        }
        var base64 = window.btoa(binary);
        document.getElementById("img").src = "data:image/jpeg;base64," + base64;
    }
};
xhr.send();


(function() {
    var chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
    window.bota = window.btoa || function(str) {
        if (/[^\u0000-\u00ff]/.test(str)) {
            throw new Error('encodeBase64 : INVALID_CHARACTER_ERR');
        }
        var hash = chars;
        var i = 2;
        var len = str.length;
        var output = [];
        var link;
        var mod = len % 3;
        len = len - mod;
        for (; i < len; i += 3) {
            output.push(
                    hash[(link = str.charCodeAt(i - 2)) >> 2],
                    hash[((link & 3) << 4 | ((link = str.charCodeAt(i - 1)) >> 4))],
                    hash[((link & 15) << 2 | ((link = str.charCodeAt(i)) >> 6))],
                    hash[(link & 63)]
                    );
        }
        if (mod) {
            output.push(
                    hash[(link = str.charCodeAt(i - 2)) >> 2],
                    hash[((link & 3) << 4 | ((link = str.charCodeAt(i - 1)) >> 4))],
                    link ? hash[(link & 15) << 2] + '=' : '=='
                    );
        }
        return output.join('');
    }
})()

你可以使用以下两种方式创建一个VBS的转换函数
。
        (function() {
            function vbs() {
                /*
                 Function BinaryToArray(binary) 
                 Dim length,array()
                 length = LenB(binary) - 1
                 ReDim array(length)
                 For i = 0 To length
                 array(i) = AscB(MidB(binary, i + 1, 1))
                 Next
                 BinaryToArray = array
                 End Function
                 */
            }
            var str = vbs.toString();
            execScript(str.slice(str.indexOf("*") + 1, str.lastIndexOf("*")), "VBScript");
        })();

(function() {
    var str =
            'Function BinaryToArray(binary)\r\n\
                 Dim oDic\r\n\
                 Set oDic = CreateObject("scripting.dictionary")\r\n\
                 length = LenB(binary) - 1\r\n\
                 For i = 1 To length\r\n\
                     oDic.add i, AscB(MidB(binary, i, 1))\r\n\
                 Next\r\n\
                 BinaryToArray = oDic.Items\r\n\
              End Function'
    execScript(str, "VBScript");
})();


var xhr = new XMLHttpRequest();
xhr.open('POST', 'image.jpg', true);
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
xhr.onload = function(e) {
    if (this.status === 200) {
        var byteArray = new VBArray(BinaryToArray(this.responseBody)).toArray();
        var n = byteArray.length;
        var binary = '';
        for (var i = 0; i < n; i++) {
            //扔掉的高位字节(f7)
            binary += String.fromCharCode(byteArray[i] & 0xff);
        }
        var base64 = window.btoa(binary);
        document.getElementById("img").src = "data:image/jpeg;base64," + base64;
    }
};
xhr.send();

window.addEventListener("load", function() {
    var el = document.querySelector('#file');
    var progress = document.querySelector('#progress');
    el.addEventListener('change', function() {
        var file = this.files[0];
        if (file) {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(e) {
                //处理兼并性问题，不同版本其名字不一样
                var done = e.position || e.loaded, total = e.totalSize || e.total;
                progress.innerHTML = (Math.floor(done / total * 1000) / 10) + "%";
            });
            xhr.addEventListener('load', function() {
                progress.innerHTML = "上传成功";
            });
            xhr.open('PUT', '/upload', true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.fileName || file.name));
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.send(file);
        }
    })
});

window.addEventListener("load", function() {
    var el = document.querySelector('#file');
    var progressBar = document.querySelector('#progress');
    function upload(name, index, file, total) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function() {
            progressBar.innerHTML = "100% 上传成功";
        });
        xhr.open('PUT', '/upload', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-File-Index', index);
        xhr.setRequestHeader('X-File-total', total);
        xhr.setRequestHeader('X-File-Name', encodeURIComponent(name));
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.send(file);
    }
    el.addEventListener('change', function() {
        var blob = this.files[0];
        var meanSize = 512 * 1024; // 1MB chunk sizes.
        var totleSize = blob.size;
        var start = 0, end = 0;
        var i = 0;
        var name = blob.fileName || blob.name;
        var total = Math.ceil(totleSize / meanSize)
        while (start < totleSize) {
            if ('mozSlice' in blob) {
                var chunk = blob.mozSlice(start, end);
            } else if ("webkitSlice" in blob) {
                chunk = blob.webkitSlice(start, end);
            } else {
                chunk = blob.slice(start, end);
            }
            upload(name, i, chunk, total);
            i++
            start = end;
            end = start + meanSize;
        }
    });
})


$.ajax = function(opts) {
    if (!opts || !opts.url) {
        $.error("参数必须为Object并且拥有url属性");
    }
    opts = setOptions(opts); //处理用户参数，比如生成querystring, type大写化
    //创建一个伪XMLHttpRequest,能处理complete、success、error等多投事件
    var dummyXHR = new $.XMLHttpRequest(opts);
    "complete success error".replace($.rword, function(name) {//绑定回调
        if (typeof opts[name] === "function") {
            dummyXHR.bind(name, opts[name]);
            delete opts[name];
        }
    });
    var dataType = opts.dataType; //目标返回数据类型
    var transports = $.ajaxTransports;
    var name = opts.form ? "upload" : dataType;
    var transport = transports[name] || transports.xhr;
    $.mix(dummyXHR, transport)//取得传送器的request, respond, preproccess 
    if (dummyXHR.preproccess) { //这用于jsonp upload传送器
        dataType = dummyXHR.preproccess() || dataType;
    }
    //设置首部 1．Content-Type首部
    if (opts.contentType) {
        dummyXHR.setRequestHeader("Content-Type", opts.contentType);
    }
    //2．Accept首部
    dummyXHR.setRequestHeader("Accept", accepts[dataType] ? accepts[dataType] + ", */*; q=0.01" : accepts["*"]);
    for (var i in opts.headers) {//3 haders里面的首部
        dummyXHR.setRequestHeader(i, opts.headers[i]);
    }
    // 处理超时
    if (opts.async && opts.timeout > 0) {
        dummyXHR.timeoutID = setTimeout(function() {
            dummyXHR.abort("timeout");
        }, opts.timeout);
    }
    dummyXHR.request();
    return dummyXHR;
};


$.XMLHttpRequest = $.factory($.Observer, {
    init: function(opts) {
        $.mix(this, {
            responseHeadersString: "",
            responseHeaders: {},
            requestHeaders: {},
            querystring: opts.querystring,
            readyState: 0,
            uniqueID: setTimeout("1"),
            status: 0
        });
        this.addEventListener = this.bind;
        this.removeEventListener = this.unbind;
        this.setOptions("options", opts); //创建一个options对象保存原始参数
    },
    setRequestHeader: function(name, value) {
        this.requestHeaders[name] = value;
        return this;
    },
    getAllResponseHeaders: function() {
        return this.readyState === 4 ? this.responseHeadersString : null;
    },
    getResponseHeader: function(name, match) {
        if (this.readyState === 4) {
            while ((match = rheaders.exec(this.responseHeadersString))) {
                this.responseHeaders[match[1]] = match[2];
            }
            match = this.responseHeaders[name];
        }
        return match === undefined ? null : match;
    },
    overrideMimeType: function(type) {
        this.mimeType = type;
        return this;
    },
    toString: function() {
        return "[object XMLHttpRequest]";
    },
    // 中止请求
    abort: function(statusText) {
        statusText = statusText || "abort";
        if (this.transport) {
            this.respond(0, statusText);
        }
        return this;
    },
    //用于触发用户绑定的success、error、complete回调
    dispatch: function(status, statusText) {/*略*/
    }
});

$.Observer = $.factory({
    init: function(target) {
        this._events = {};
        this._target = target || this;
    },
    bind: function(type, callback) {
        var listeners = this._events[type];
        if (listeners) {
            listeners.push(callback);
        } else {
            this._events[type] = [callback];
        }
        return this;
    },
    unbind: function(type, callback) {
        var n = arguments.length;
        if (n === 0) {
            this._events = {};
        } else if (n === 1) {
            this._events[type] = [];
        } else {
            var listeners = this._events[type] || [];
            var i = listeners.length;
            while (--i > -1) {
                if (listeners[i] === callback) {
                    return listeners.splice(i, 1);
                }
            }
        }
        return this;
    },
    fire: function(type) {
        var listeners = (this._events[type] || []).concat(); //防止影响原数组
        if (listeners.length) {
            var target = this._target, args = [].slice.call(arguments);
            if (this.rawFire) {
                args.shift();
            } else {
                args[0] = {
                    type: type,
                    target: target
                };
            }
            for (var i = 0, callback; callback = listeners[i++]; ) {
                callback.apply(target, args);
            }
        }
    }
});

xhr.request = function() {
    var opts = this.options;
    $.log("XhrTransport.request.....");
    var transport = this.transport = new $.xhr;
    if (opts.crossDomain && !("withCredentials" in transport)) {
        $.error("本浏览器不支持crossdomain xhr");
    }
    if (opts.username) {
        transport.open(opts.type, opts.url, opts.async, opts.username, opts.password);
    } else {
        transport.open(opts.type, opts.url, opts.async);
    }
    if (this.mimeType && transport.overrideMimeType) {
        transport.overrideMimeType(this.mimeType);
    }
    this.requestHeaders["X-Requested-With"] = "XMLHTTPRequest";
    for (var i in this.requestHeaders) {
        transport.setRequestHeader(i, this.requestHeaders[i]);
    }
    var dataType = this.options.dataType;
    if ("responseType" in transport && /^(blob|arraybuffer|text)$/.test(dataType)) {
        transport.responseType = dataType;
        this.useResponseType = true;
    }
    transport.send(opts.hasContent && (this.formdata || this.querystring) || null);
    //在同步模式中,IE6、IE7可能会直接从缓存中读取数据而不会发出请求,因此我们需要手动发出请求
    if (!opts.async || transport.readyState === 4) {
        this.respond();
    } else {
        var self = this;
        if (transport.onerror === null) { //如果支持onerror、onload新API
            transport.onload = transport.onerror = function(e) {
                this.readyState = 4; //IE9+ 
                this.status = e.type === "load" ? 200 : 500;
                self.respond();
            };
        } else {
            transport.onreadystatechange = function() {
                self.respond();
            };
        }
    }
}
xhr.respond = function(event, forceAbort) {
    var transport = this.transport;

    if (!transport) {
        return;
    }
    try {
        var completed = transport.readyState === 4;
        if (forceAbort || completed) {
            transport.onerror = transport.onload = transport.onreadystatechange = $.noop;
            if (forceAbort) {
                if (!completed && typeof transport.abort === "function") {
                    transport.abort();
                }
            } else {
                var status = transport.status;
                this.responseText = transport.responseText;
                try {
//当responseXML为[Exception: DOMException]时
//访问它会抛“An attempt was made to use an object that is not, or is no longer, usable”异常
                    var xml = transport.responseXML
                } catch (e) {
                }
                if (this.useResponseType) {
                    this.response = transport.response;
                }
                if (xml && xml.documentElement) {
                    this.responseXML = xml;
                }
                this.responseHeadersString = transport.getAllResponseHeaders();
                //Firefox跨城请求时访问statusText值会抛出异常
                try {
                    var statusText = transport.statusText;
                } catch (e) {
                    statusText = "firefoxAccessError";
                }
//用于处理特殊情况,如果是一个本地请求,只要我们能获取数据就假当它是成功的
                if (!status && isLocal && !this.options.crossDomain) {
                    status = this.responseText ? 200 : 404;
                    //IE有时会把204当作为1223
                    //returning a 204 from a PUT request - IE seems to be handling the 204 from a DELETE request okay.
                } else if (status === 1223) {
                    status = 204;
                }
                this.dispatch(status, statusText);
            }
        }
    } catch (e) {
// 如果网络问题时访问XHR的属性，在FF会抛异常
// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111 _ (NS_ERROR_NOT_AVAILABLE)
        if (!forceAbort) {
            this.dispatch(500, e + "");
        }
    }
}


script.preproccess = function() {
    var namespace = DOC.URL.replace(/(#.+|\W)/g, '');//得到mass框架的命名空间
    var opts = this.options;
    var name = this.jsonpCallback = opts.jsonpCallback || "jsonp" + setTimeout("1");
    opts.url = opts.url + (rquery.test(opts.url) ? "&" : "?") +
            opts.jsonp + "=" + namespace + "." + name;//rquery = /\?/
    //将后台返回的json保存在惰性函数中
    global[namespace][name] = function(json) {
        $[name] = json;
    };
    return "script"
};
script.request = function() {
    var opts = this.options;
    var node = this.transport = DOC.createElement("script");
    if (opts.charset) {
        node.charset = opts.charset;
    }
    var load = node.onerror === null;//判定是否支持onerror
    var self = this;
    node.onerror = node[load ? "onload" : "onreadystatechange"] = function() {
        self.respond();
    };
    node.src = opts.url;
    $.head.insertBefore(node, $.head.firstChild);
};

script.respond = function(event, forceAbort) {
    var node = this.transport;
    if (!node) {
        return;
    }
    var execute = /loaded|complete|undefined/i.test(node.readyState);
    if (forceAbort || execute) {
        node.onerror = node.onload = node.onreadystatechange = null;
        var parent = node.parentNode;
        if (parent) {
            parent.removeChild(node);
        }
        if (!forceAbort) {
            var args = typeof $[this.jsonpCallback] === "function" ?
                    [500, "error"] : [200, "success"];
            this.dispatch.apply(this, args);
        }
    }
};

$.ajaxTransports.upload = {
    preproccess: function() {
        var opts = this.options;
        var formdata = new FormData(opts.form);//将二进制打包到formdata
        $.each(opts.data, function(key, val) {
            formdata.append(key, val);//添加客外数据
        });
        this.formdata = formdata;
    }
};
$.each($.ajaxTransports.xhr, function(key, val) {
    $.ajaxTransports.upload[key] = val;//重用xhr传送器的方法
});

function createIframe(ID) {
    var iframe = $.parseHTML("<iframe " + " id='" + ID + "'" +
      " name='" + ID + "'" + " style='position:absolute;left:-9999px;top:-9999px;/>"). firstChild;
    return (DOC.body || DOC.documentElement).insertBefore(iframe, null);
}
function addDataToForm(form, data) {
    var ret = [],
            d, isArray, vs, i, e;
    for (d in data) {
        isArray = Array.isArray(data[d]);
        vs = isArray ? data[d] : [data[d]];
        // 数组和原生一样对待，创建多个同名输入域
        for (i = 0; i < vs.length; i++) {
            e = DOC.createElement("input");
            e.type = 'hidden';
            e.name = d;
            e.value = vs[i];
            form.appendChild(e);
            ret.push(e);
        }
    }
    return ret;
}

upload.request = function() {
    var self = this;
    var opts = this.options;
    var ID = "iframe-upload-" + this.uniqueID;
    var form = opts.form;
    var iframe = this.transport = createIframe(ID);
    //form.enctype的值
    //1:application/x-www-form-urlencoded   在发送前编码所有字符（默认）
    //2:multipart/form-data 不对字符编码。在使用包含文件上传控件的表单时，必须使用该值。
    //3:text/plain  空格转换为 "+" 加号，但不对特殊字符编码。
    var backups = {
        target: form.target || "",
        action: form.action || "",
        enctype: form.enctype,
        method: form.method
    };
    var fields = opts.data ? addDataToForm(form, opts.data) : [];
    //必须指定method与enctype，要不在FF报错
    //表单包含文件域时，如果缺少 method=POST 以及 enctype=multipart/form-data，
    //文件将不会被发送。
    form.target = ID;//防止整页刷新
    form.action = opts.url;
    form.method = "POST";
    form.enctype = "multipart/form-data";
    this.uploadcallback = $.bind(iframe, "load", function(event) {
        self.respond(event);
    });
    form.submit();
    //还原form的属性
    for (var i in backups) {
        form[i] = backups[i];
    }
    //移除之前动态添加的节点
    fields.forEach(function(input) {
        form.removeChild(input);
    });
};

upload.respond = function(event) {
    var node = this.transport, child
    // 防止重复调用,成功后 abort
    if (!node) {
        return;
    }
    if (event && event.type === "load") {
        var doc = node.contentWindow.document;
        this.responseXML = doc;
        if (doc.body) {//如果存在body属性,说明不是返回XML
            this.responseText = doc.body.innerHTML;
            //当MIME为‘application/javascript' ‘text/javascript',
            //浏览器会把内容放到一个PRE标签中
            if ((child = doc.body.firstChild) && child.nodeName.toUpperCase() 
                    === 'PRE' && child.firstChild) {
                this.responseText = child.firstChild.nodeValue;
            }
        }
        this.dispatch(200, "success");
    }
    this.uploadcallback = $.unbind(node, "load", this.uploadcallback);
    delete this.uploadcallback;
    setTimeout(function() {  // Fix busy state in FF3
        node.parentNode.removeChild(node);
        $.log("iframe.parentNode.removeChild(iframe)");
    });
}

function dispatch(status, statusText) {
    if (!this.transport) { 
        return;
    }
    this.readyState = 4;
    var eventType = "error";
    if (status >= 200 && status < 300 || status === 304) {
        eventType = "success";
        if (status === 204) {
            statusText = "nocontent";
        } else if (status === 304) {
            statusText = "notmodified";
        } else {
//如果浏览器能直接返回转换好的数据就最好不过了,否则需要手动转换
            if (typeof this.response === "undefined") {
                var dataType = this.options.dataType || this.options.mimeType;
                if (!dataType) { //如果没有指定dataType，则根据mimeType或Content-Type进行揣测
                    dataType = this.getResponseHeader("Content-Type") || "";
                    dataType = dataType.match(/json|xml|script|html/) || ["text"];
                    dataType = dataType[0];
                }
                try {
                    this.response = $.ajaxConverters[dataType].call(this, this.response Text, this.responseXML);
                } catch (e) {
                    eventType = "error";
                    statusText = "parsererror : " + e;
                }
            }
        }
    }
    this.status = status;
    this.statusText = statusText;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        delete this.timeoutID;
    }
    this.rawFire = true;
    this._transport = this.transport;
    // 到这里，要么成功，调用success, 要么失败，调用 error, 最终都会调用 complete
    if (eventType === "success") {
        this.fire(eventType, this.response, statusText, this);
    } else {
        this.fire(eventType, this, statusText);
    }
    this.fire("complete", this, statusText);
    delete this.transport;
}


$.ajaxConverters  = {//转换器，返回用户想要做的数据
    text: function(text) {
        return text || "";
    },
    xml: function(text, xml) {
        return xml !== void 0 ? xml : $.parseXML(text);
    },
    html: function(text) {
        return $.parseHTML(text); //一个文档碎片,方便直接插入DOM树
    },
    json: function(text) {
        return $.parseJSON(text);
    },
    script: function(text) {
        $.parseJS(text);
    },
    jsonp: function() {
        var json = $[this.jsonpCallback];
        delete $[this.jsonpCallback];
        return json;
    }
 }
