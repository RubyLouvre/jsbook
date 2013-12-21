//jQuery1.2.3
var expando = "jQuery" + (new Date()).getTime(), uuid = 0, windowData = {};
jQuery.extend({
    cache: {},
    data: function( elem, name, data ) {
        elem = elem == window ? windowData :   elem;//对window对象做特别处理
        var id = elem[ expando ];
        if ( !id ) //如果没有UUID则新设一个
            id = elem[ expando ] = ++uuid;
        //如果没有在$.cache中开户，则先开户
        if ( name && !jQuery.cache[ id ] )
            jQuery.cache[ id ] = {};

        // 第三个参数不为undefined时，为写操作
        if ( data != undefined )
            jQuery.cache[ id ][ name ] = data;
        //如果只有一个参数，则返回缓存对象，两个参数则返回目标数据
        return name ?  jQuery.cache[ id ][ name ] :   id;
    },

    removeData: function( elem, name ) {
        elem = elem == window ? windowData :   elem;
        var id = elem[ expando ];
        if ( name ) {//移除目标数据
            if ( jQuery.cache[ id ] ) {
                delete jQuery.cache[ id ][ name ];
                name = "";

                for ( name in jQuery.cache[ id ] )
                    break;
                //遍历缓存体，如果不为空，那name会被改写，如果没有被改写，则!name 为true
                //从而引发再次调用此方法，但这次是只传一个参数，移除缓存体
                if ( !name )
                    jQuery.removeData( elem );
            }
        } else {
            //移除UUID，但IE下对元素使用delete会抛错
            try {
                delete elem[ expando ];
            } catch(e){
                if ( elem.removeAttribute )
                    elem.removeAttribute( expando );
            }//注销账户
            delete jQuery.cache[ id ];
        }
    }
})

//jQuery1.3
jQuery.extend({
    queue: function( elem, type, data ) {
        if ( elem ){
            type = (type || "fx") + "queue";
            var q = jQuery.data( elem, type );
            if ( !q || jQuery.isArray(data) )//确保储存的是一个数组
                q = jQuery.data( elem, type, jQuery.makeArray(data) );
            else if( data )//然后往这个数据加东西
                q.push( data );
        }
        return q;
    },
    dequeue: function( elem, type ){
        var queue = jQuery.queue( elem, type ),
        fn = queue.shift();//然后删掉一个，早期它是放置动画的回调，删掉它就调用一下
        // 但没有做是否为函数的判定，估计也没有写到文档中，为内部使用
        if( !type || type === "fx" )
            fn = queue[0];
        if( fn !== undefined )
            fn.call(elem);
    }
})

//each是并行处理多个动画,queue是一个接一个处理多个动画
this[ optall.queue === false ? "each" : "queue" ](function(){ /*略*/})

//jQuery1.3.2 core.js clone方法
var ret = this.map(function(){
    if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
        var html = this.outerHTML;
        if ( !html ) {
            var div = this.ownerDocument.createElement("div");
            div.appendChild( this.cloneNode(true) );
            html = div.innerHTML;
        }

        return jQuery.clean([html.replace(/ jQuery\d+="(?:\d+|null)"/g, "").replace (/^\s*/, "")])[0];
    } else
        return this.cloneNode(true);
});
/*
noData : {
    "embed": true,
    "object": true,
    "applet": true
}

//代码防御        
if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
    return;
}
*/

//jQuery1.43 $.fn.data
rbrace = /^(?:\{.*\}|\[.*\])$/;
if ( data === undefined && this.length ) {
    data = jQuery.data( this[0], key );
    if ( data === undefined && this[0].nodeType === 1 ) {
        data = this[0].getAttribute( "data-" + key );

        if ( typeof data === "string" ) {
            try {
                data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    !jQuery.isNaN( data ) ? parseFloat( data ) :
                    rbrace.test( data ) ? jQuery.parseJSON( data ) :
                    data;
            } catch( e ) {}

        } else {
            data = undefined;
        }
    }
}

var cache = {
     jQuery14312343254:{/*放置私有数据*/},
     events: {/*"放置事件名与它对应的回调列表"*/}
     /*这里放置用户数据*/
}

var cache = {
     data:{/*放置用户数据*/}
     /*这里放置私有数据*/
}

function Data() {
    this.cache = {};
}

Data.uid = 1;

Data.prototype = {
    locker: function(owner) {
        var ovalueOf,
        //owner为元素节点、文档对象、window对象
        //首先我们检测一下它们valueOf方法有没有被重写，由于浏览器的差异性，
        //我们通过觅得此三类对象的构造器进行原型重写的成本过大，只能对每一个实例的valueOf方法进行重写。
        //检测方式为传入Data类，如果是返回"object"说明没有被重写，返回"string"则是被重写。
        //这个字符串就是我们上面所说的UUID，用于在缓存仓库上开辟缓存体。
        unlock = owner.valueOf(Data);
        //这里的重写使用了 Object.defineProperty方法，因为在这个版本jQuery不打算往下兼容IE6～IE8
        //Object.defineProperty的第3个参数为对象，如果不显示设置enumerable, writable, configurable，
        //则会默认为false，这也正如我们所期待的那样，我们不再希望人们来遍历它，重写它，再次动它的配置
        //这个过程被jQuery称之为开锁，通过valueOf这扇大门，进入到仓库
        if(typeof unlock !== "string") {
            unlock = jQuery.expando + Data.uid++;
            ovalueOf = owner.valueOf;

            Object.defineProperty(owner, "valueOf", {
                value: function(pick) {
                    if(pick === Data) {
                        return unlock;
                    }
                    return ovalueOf.apply(owner);
                }

            });
        }
        //接下来就是开辟缓存体
        if(!this.cache[unlock]) {
            this.cache[unlock] = {};
        }

        return unlock;
    },
    set: function(owner, data, value) {
        //写方法
        var prop, cache, unlock;
        //得到UUID与缓存体
        unlock = this.locker(owner);
        cache = this.cache[unlock];
        //如果传入3个参数，第2个为字符串，那么直接在缓存体上添加新的键值对
        if(typeof data === "string") {
            cache[data] = value;
            //如果传入2个参数，第2个为对象
        } else {
            //如果缓存体还没有添加过任何对象，那么直接赋值，否则使用for in 循环添加新键值对
            if(jQuery.isEmptyObject(cache)) {
                cache = data;
            } else {
                for(prop in data) {
                    cache[prop] = data[prop];
                }
            }
        }
        this.cache[unlock] = cache;

        return this;
    },
    get: function(owner, key) {
        //读方法
        var cache = this.cache[this.locker(owner)];
        //如果只有一个参数，则返回整个缓存体
        return key === undefined ? cache : cache[key];
    },
    access: function(owner, key, value) {
        //决定是读方法或是写方法，然后做相应操作
           if (key === undefined ||
                ((key && typeof key === "string") && value === undefined)) {
            return this.get(owner, key);
        }
        this.set(owner, key, value);
        return value !== undefined ? value : key;
    }, 
    remove: function(owner, key) {
        //略，与第1代差不多
    },
    hasData: function(owner) { //判定此对象是否缓存了数据
        return !jQuery.isEmptyObject(this.cache[this.locker(owner)]);
    },
    discard: function(owner) { //删除它的用户数据与私有数据
        delete this.cache[this.locker(owner)];
    }
};
var data_user, data_priv;

function data_discard(owner) {
    data_user.discard(owner);
    data_priv.discard(owner);
}

data_user = new Data();
data_priv = new Data();

jQuery.extend({ 
    // UUID
    expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

    //用于向前兼容
    acceptData: function() {
        return true;
    },

    hasData: function( elem ) {//判定是否缓存了数据
        return data_user.hasData( elem ) || data_priv.hasData( elem );
    },

    data: function( elem, name, data ) {//读写用户数据
        return data_user.access( elem, name, data );
    },

    removeData: function( elem, name ) {//删除用户数据
        return data_user.remove( elem, name );
    },
    _data: function( elem, name, data ) {//读写私有数据
        return data_priv.access( elem, name, data );
    },

    _removeData: function( elem, name ) {//删除私有数据
        return data_priv.remove( elem, name );
    }
});
/**
//主要用于建立一个从元素到数据的引用，具体用于数据缓存、事件绑定、元素去重
getUid: global.getComputedStyle ? function( obj ){//IE9+,标准浏览器
    return obj.uniqueNumber || ( obj.uniqueNumber = NsVal.uuid++ );
}: function( obj ){
    if(obj.nodeType !== 1){//如果是普通对象、文档对象、window对象
        return obj.uniqueNumber || ( obj.uniqueNumber = NsVal.uuid++ );
    }//注：旧式IE的XML元素不能通过el.xxx = yyy 设置自定义属性
    var uid = obj.getAttribute("uniqueNumber");
    if ( !uid ){
        uid = NsVal.uuid++;
        obj.setAttribute( "uniqueNumber", uid );
    }
    return +uid;//确保返回数字
},
 
 */
define("data", ["$lang"], function() {
    $.log("已加载data模块", 7);
    var remitter = /object|function/, rtype = /[^38]/;
    function innerData(target, name, data, pvt) {//IE6～IE8不能为文本节点注释节点添加数据
        if ($.acceptData(target)) {
            var id = $.getUid(target), isEl = target.nodeType === 1,
                    getOne = typeof name === "string", //取得单个属性
                    database = $["@data"],
                    table = database[ id] || (database[ id ] = {
                data: {}
            });
            var cache = table;
            //私有数据都是直接放到table中，普通数据放到table.data中
            if (!pvt) {
                table = table.data;
            }
            if (name && typeof name === "object") {
                $.mix(table, name);//写入一组属性
            } else if (getOne && data !== void 0) {
                table[ name ] = data;//写入单个属性
            }
            if (getOne) {
                if (name in table) {
                    return table[name]
                } else if (isEl && !pvt) {
                    //对于用HTML5 data-*属性保存的数据， 如<input id="test" data-full-name=
                    "Planet Earth"/>
                    //我们可以通过$("#test").data("full-name")或$("#test").data("fullName")
                    访问到
                    return $.parseData(target, name, cache);
                }
            } else {
                return table
            }
        }
    }
    function innerRemoveData(target, name, pvt) {
        if ($.acceptData(target)) {
            var id = $.getUid(target);
            if (!id) {
                return;
            }
            var clear = 1, ret = typeof name == "string",
                    database = $["@data"],
                    table = database[ id ],
                    cache = table;
            if (table && ret) {
                if (!pvt) {
                    table = table.data
                }
                if (table) {
                    ret = table[ name ];
                    delete table[ name ];
                }
                loop://判定节点为空
                        for (var key in cache) {
                    if (key == "data") {
                        for (var i in cache.data) {
                            clear = 0;
                            break loop;
                        }
                    } else {
                        clear = 0;
                        break loop;
                    }
                }
            }
            if (clear) {
                try {
                    delete database[id];
                } catch (e) {
                    database[id] = void 0;
                }
            }
            return ret;
        }
    }

    $.mix({
        "@data": {},
        acceptData: function(target) {
            return target && remitter.test(typeof target) && rtype.test(target.nodeType);
        },
        hasData: function(target) {
            var cache = $.data(target),name;
            for (name in cache) {
                if (name === "data" && $.isEmptyObject(cache[name])) {
                    continue;
                }
                if (name !== "toJSON") {
                    return false;
                }
            }
            return true;
        },
        data: function(target, name, data) {  // 读写用户数据
            return innerData(target, name, data)
        },
        _data: function(target, name, data) {//读写私有数据
            return innerData(target, name, data, true)
        },
        removeData: function(target, name) {  //删除用户数据
            return innerRemoveData(target, name);
        },
        _removeData: function(target, name) {//删除私有数据
            return innerRemoveData(target, name, true);
        },
        parseData: function(target, name, table, value) {
            //略，处理HTML5 data-*属性
        },
        mergeData: function(cur, src) {
            //略
        }
    });
});

//https://github.com/RubyLouvre/mass-Framework/blob/1.2/data.js
define("data", ["lang"], function($) {
    var owners = [],
            caches = [];

    function add(owner) {
        var index = owners.push(owner);
        return caches[index - 1] = {
            data: {}
        };
    }

    function innerData(owner, name, data, pvt) {
        var index = owners.indexOf(owner);
        var table = index === -1 ? add(owner) : caches[index];//得到要操作的缓存体
        //略
    }

    function innerRemoveData(owner, name, pvt) {
        var index = owners.indexOf(owner);
        if (index > -1) {
            //略
        }
    }
    $.mix({
        hasData: function(owner) {
            //判定是否关联了数据 
            return owners.indexOf(owner) > -1;
        },
        data: function(target, name, data) {  // 读写用户数据
            return innerData(target, name, data)
        },
        _data: function(target, name, data) {//读写私有数据
            return innerData(target, name, data, true)
        },
        removeData: function(target, name) {  //删除用户数据
            return innerRemoveData(target, name);
        },
        _removeData: function(target, name) {//删除私有数据
            return innerRemoveData(target, name, true);
        },
        parseData: function(target, name, cache, value) {
            //略 处理HTML5 data-*属性
        },
        mergeData: function(cur, src) {
            //略
        }
    });
    return $;
});

var map = new WeakMap(), el = document.body
map.set(el, { data:{} });//设置新键值对
var value = map.get(el);//读取目标值
console.log(value);  //{ data:{} }
console.log( map.has(el) );//判定是否存在此键名
map.delete( el ) //删除键值对

// https://github.com/RubyLouvre/mass-Framework/blob/1.2/data_neo.js
define("data", ["lang"], function($) {
    var caches = new WeakMap;//FF6+
    function innerData(owner, name, data, pvt) {
        var table = caches.get(owner);
        if (!table) {//得到要操作的缓存体
            table = {
                data: {}
            }
            caches.set(table);
        }
        //略
    }
    function innerRemoveData(owner, name, pvt) {
        var table = caches.get(owner);
        if (!table) {
            return;
        }
        //略
    }

    $.mix({
        hasData: function(target) {
            return caches.has(target);//判定是否关联了数据 
        },
        data: function(target, name, data) {  // 读写用户数据
            return innerData(target, name, data);
        },
        _data: function(target, name, data) {//读写私有数据
            return innerData(target, name, data, true);
        },
        removeData: function(target, name) {  //移除用户数据
            return innerRemoveData(target, name);
        },
        _removeData: function(target, name) {//移除私有数据
            return innerRemoveData(target, name, true);
        },
        parseData: function(target, name, table, value) {
            //略 处理HTML5 data-*属性
        },
        mergeData: function(cur, src) {
            //略
        }
    });
});

