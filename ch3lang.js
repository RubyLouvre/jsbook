function contains(target, it) {
    return target.indexOf(it) != -1; //indexOf改成search，lastIndexOf也行得通
}
function contains(target, str, separator) {
    return separator ?
            (separator + target + separator).indexOf(separator + str + separator) > -1 :
            target.indexOf(str) > -1;
}

//最后一参数是忽略大小写
function startsWith(target, str, ignorecase) {
    var start_str = target.substr(0, str.length);
    return ignorecase ? start_str.toLowerCase() === str.toLowerCase() :
            start_str === str;
}
//最后一参数是忽略大小写
function endsWith(target, str, ignorecase) {
    var end_str = target.substring(target.length - str.length);
    return ignorecase ? end_str.toLowerCase() === str.toLowerCase() :
            end_str === str;
}

function repeat(target, n) {
    return (new Array(n + 1)).join(target);
}
function repeat(target, n) {
    return Array.prototype.join.call({
        length: n + 1
    }, target);
}
var repeat = (function() {
    var join = Array.prototype.join, obj = {};
    return function(target, n) {
        obj.length = n + 1;
        return join.call(obj, target);
    }
})();
function repeat(target, n) {
    var s = target, total = [];
    while (n > 0) {
        if (n % 2 == 1)
            total[total.length] = s;//如果是奇数
        if (n == 1)
            break;
        s += s;
        n = n >> 1;//相当于将n除以2取其商,或说开2二次方
    }
    return total.join('');
}
function repeat(target, n) {
    var s = target, c = s.length * n
    do {
        s += s;
    } while (n = n >> 1);
    s = s.substring(0, c);
    return s;
}
function repeat(target, n) {
    var s = target, total = "";
    while (n > 0) {
        if (n % 2 == 1)
            total += s;
        if (n == 1)
            break;
        s += s;
        n = n >> 1;
    }
    return total;
}
function repeat(target, n) {
    if (n == 1) {
        return target;
    }
    var s = repeat(target, Math.floor(n / 2));
    s += s;
    if (n % 2) {
        s += target;
    }
    return s;
}

function repeat(target, n) {
    return (n <= 0) ? "" : target.concat(repeat(target, --n));
}

function byteLen(target) {
    var byteLength = target.length, i = 0;
    for (; i < target.length; i++) {
        if (target.charCodeAt(i) > 255) {
            byteLength++;
        }
    }
    return byteLength;
}
function byteLen(target, fix) {
    fix = fix ? fix : 2;
    var str = new Array(fix + 1).join("-")
    return target.replace(/[^\x00-\xff]/g, str).length;
}

function truncate(target, length, truncation) {
    length = length || 30;
    truncation = truncation === void(0) ? '...' : truncation;
    return target.length > length ?
            target.slice(0, length - truncation.length) + truncation : String(target);
}
function camelize(target) {
    if (target.indexOf('-') < 0 && target.indexOf('_') < 0) {
        return target;//提前判断，提高getStyle等的效率
    }
    return target.replace(/[-_][^-_]/g, function(match) {
        return match.charAt(1).toUpperCase();
    });
}
function underscored(target) {
    return target.replace(/([a-z\d])([A-Z])/g, '$1_$2').
            replace(/\-/g, '_').toLowerCase();
}
function dasherize(target) {
    return underscored(target).replace(/_/g, '-');
}
function capitalize(target) {
    return target.charAt(0).toUpperCase() + target.substring(1).toLowerCase();
}
function stripTags(target) {
    return String(target || "").replace(/<[^>]+>/g, '');
}
function stripScripts(target) {
    return String(target || "").replace(/<script[^>]*>([\S\s]*?)<\/script>/img, '')
}
function escapeHTML(target) {
    return target.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
}
function unescapeHTML(target) {
    return  target.replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, "&") //处理转义的中文和实体字符
            .replace(/&#([\d]+);/g, function($0, $1) {
        return String.fromCharCode(parseInt($1, 10));
    });
}
function escapeRegExp(target) {
    return target.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
}
function pad(target, n) {
    var zero = new Array(n).join('0');
    var str = zero + target;
    var result = str.substr(-n);
    return result;
}
function pad(target, n) {
    return Array((n + 1) - target.toString().split('').length).join('0') + target;
}

function pad(target, n) {
    return (Math.pow(10, n) + "" + target).slice(-n);
}
function pad(target, n) {
    return ((1 << n).toString(2) + target).slice(-n);
}
function pad(target, n) {
    return (0..toFixed(n) + target).slice(-n);
}
function pad(target, n) {
    return (1e20 + "" + target).slice(-n);
}
function pad(target, n) {
    var len = target.toString().length;
    while (len < n) {
        target = "0" + target;
        len++;
    }
    return target;
}

function pad(target, n) {
    var len = target.toString().length;
    while (len < n) {
        target = "0" + target;
        len++;
    }
    return target;
}
function pad(target, n, filling, right, radix) {
    var num = target.toString(radix || 10);
    filling = filling || "0";
    while (num.length < n) {
        if (!right) {
            num = filling + num;
        } else {
            num += filling;
        }
    }
    return num;
}

function wbr(target) {
    return String(target)
            .replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
            .replace(/><wbr>/g, '>');
}
function format(str, object) {
    var array = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\\?\#{([^{}]+)\}/gm, function(match, name) {
        if (match.charAt(0) == '\\')
            return match.slice(1);
        var index = Number(name)
        if (index >= 0)
            return array[index];
        if (object && object[name] !== void 0)
            return  object[name];
        return  '';
    });
}
var a = format("Result is #{0},#{1}", 22, 33);
alert(a);//"Result is 22,33"
var b = format("#{name} is a #{sex}", {
    name: "Jhon",
    sex: "man"
});
alert(b);//"Jhon is a man"

//http://code.google.com/p/jquery-json/
var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
        meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
};
function quote(target) {
    if (target.match(escapeable)) {
        return '"' + target.replace(escapeable, function(a) {
            var c = meta[a];
            if (typeof c === 'string') {
                return c;
            }
            return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
        }) + '"';
    }
    return '"' + target + '"';
}

var isIE678 = !+"\v1";

function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
}
function trim(str) {
    return str.substring(Math.max(str.search(/\S/), 0),
            str.search(/\S\s*$/) + 1);
}
function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

function trim(str) {
    str = str.match(/\S+(?:\s+\S+)*/);
    return str ? str[0] : '';
}
function trim(str) {
    return str.replace(/^\s*(\S*(\s+\S+)*)\s*$/, '$1');
}
function trim(str) {
    return str.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, '$1');
}
function trim(str) {
    return str.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, '$1');
}
function trim(str) {
    return str.replace(/^\s*([\S\s]*?)\s*$/, '$1');
}
function trim(str) {
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\n\
  \u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
    for (var i = 0; i < str.length; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }
    for (i = str.length - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}
function trim(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}
function trim(str) {
    var str = str.replace(/^\s\s*/, ""),
            ws = /\s/,
            i = str.length;
    while (ws.test(str.charAt(--i)))
        return str.slice(0, i + 1);
}
function trim(str) {
    var m = str.length;
    for (var i = -1; str.charCodeAt(++i) <= 32; )
        for (var j = m - 1; j > i && str.charCodeAt(j) <= 32; j--)
            return str.slice(i, j + 1);
}

Array.prototype.indexOf = function(item, index) {
    var n = this.length, i = ~~index;
    if (i < 0)
        i += n;
    for (; i < n; i++)
        if (this[i] === item)
            return i;
    return -1;
}

Array.prototype.lastIndexOf = function(item, index) {
    var n = this.length,
            i = index == null ? n - 1 : index;
    if (i < 0)
        i = Math.max(0, n + i);
    for (; i >= 0; i--)
        if (this[i] === item)
            return i;
    return -1;
}

function iterator(vars, body, ret) {
    var fun = 'for(var ' + vars + 'i=0,n = this.length;i < n;i++){' +
            body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))')
            + '}' + ret
    return Function("fn,scope", fun);
}

Array.prototype.forEach = iterator('', '_', '');

Array.prototype.filter = iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r');

Array.prototype.map = iterator('r=[],', 'r[i]=_', 'return r');

Array.prototype.some = iterator('', 'if(_)return true', 'return false');

Array.prototype.every = iterator('', 'if(!_)return false', 'return true');

[1, 2, , 4].forEach(function(e) {
    console.log(e)
});

Array.prototype.reduce = function(fn, lastResult, scope) {
    if (this.length == 0)
        return lastResult;
    var i = lastResult !== undefined ? 0 : 1;
    var result = lastResult !== undefined ? lastResult : this[0];
    for (var n = this.length; i < n; i++)
        result = fn.call(scope, result, this[i], i, this);
    return result;
}

Array.prototype.reduceRight = function(fn, lastResult, scope) {
    var array = this.concat().reverse();
    return array.reduce(fn, lastResult, scope);
}
function contains(target, item) {
    return target.indexOf(item) > -1
}
function removeAt(target, index) {
    return !!target.splice(index, 1).length
}

function remove(target, item) {
    var index = target.indexOf(item);
    if (~index)
        return removeAt(target, index);
    return false;
}
function shuffle(target) {
    var j, x, i = target.length;
    for (; i > 0; j = parseInt(Math.random() * i),
            x = target[--i], target[i] = target[j], target[j] = x) {
    }
    return target;
}

function random(target) {
    return  target[Math.floor(Math.random() * target.length)];
}

function flatten(target) {
    var result = [];
    target.forEach(function(item) {
        if (Array.isArray(item)) {
            result = result.concat(flatten(item));
        } else {
            result.push(item);
        }
    });
    return result;
}
function unique(target) {
    var result = [];
    loop:  for (var i = 0, n = target.length; i < n; i++) {
        for (var x = i + 1; x < n; x++) {
            if (target[x] === target[i])
                continue loop;
        }
        result.push(target[i]);
    }
    return result;
}

function compact(target) {
    return target.filter(function(el) {
        return el != null;
    });
}
function pluck(target, name) {
    var result = [], prop;
    target.forEach(function(item) {
        prop = item[name];
        if (prop != null)
            result.push(prop);
    });
    return result;
}
function groupBy(target, val) {
    var result = {};
    var iterator = $.isFunction(val) ? val : function(obj) {
        return obj[val];
    };
    target.forEach(function(value, index) {
        var key = iterator(value, index);
        (result[key] || (result[key] = [])).push(value);
    });
    return result;
}
function sortBy(target, fn, scope) {
    var array = target.map(function(item, index) {
        return {
            el: item,
            re: fn.call(scope, item, index)
        };
    }).sort(function(left, right) {
        var a = left.re, b = right.re;
        return a < b ? -1 : a > b ? 1 : 0;
    });
    return pluck(array, 'el');
}

function union(target, array) {
    return unique(target.concat(array));
}
function intersect(target, array) {
    return target.filter(function(n) {
        return ~array.indexOf(n);
    });
}

function diff(target, array) {
    var result = target.slice();
    for (var i = 0; i < result.length; i++) {
        for (var j = 0; j < array.length; j++) {
            if (result[i] === array[j]) {
                result.splice(i, 1);
                i--;
                break;
            }
        }
    }
    return result;
}
function min(target) {
    return Math.min.apply(0, target);
}

function max(target) {
    return Math.max.apply(0, target);
}

if ([].unshift(1) !== 1) {
    var _unshift = Array.prototype.unshift;
    Array.prototype.unshift = function() {
        _unshift.apply(this, arguments);
        return this.length; //返回新数组的长度
    }
}

if ([1, 2, 3].splice(1).length == 0) {//如果是IE6、IE7、IE8，则一个元素也没有删除
    var _splice = Array.prototype.splice;
    Array.prototype.splice = function(a) {
        if (arguments.length == 1) {
            return _splice.call(this, a, this.length)
        } else {
            return _splice.apply(this, arguments)
        }
    }
}
Array.prototype.splice = function(x, y) {
    var a = arguments, s = a.length - 2 - y, r = this.slice(x, x + y);
    if (s > 0) {
        for (var i = this.length - 1, j = x + y; i >= j; --i)
            this[i + s] = this[i];
    }
    else if (s < 0) {
        for (var i = x + y, j = this.length; i < j; ++i)
            this[i + s] = this[i];
        this.length += s;
    }
    for (var i = 2, j = a.length; i < j; ++i)
        this[i - 2 + x] = a[i];
    return r;
}
function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}
Array.prototype.splice = function(s, d) {
    var max = Math.max, min = Math.min,
            a = [], i = max(arguments.length - 2, 0),
            k = 0, l = this.length, e, n, v, x;
    s = s || 0;
    if (s < 0) {
        s += l;
    }
    s = max(min(s, l), 0);
    d = max(min(isNumber(d) ? d : l, l - s), 0);
    v = i - d;
    n = l + v;
    while (k < d) {
        e = this[s + k];
        if (e !== void 0) {
            a[k] = e;
        }
        k += 1;
    }
    x = l - s - d;
    if (v < 0) {
        k = s + i;
        while (x) {
            this[k] = this[k - v];
            k += 1;
            x -= 1;
        }
        this.length = n;
    } else if (v > 0) {
        k = 1;
        while (x) {
            this[n - k] = this[l - k];
            k += 1;
            x -= 1;
        }
    }
    for (k = 0; k < i; ++k) {
        this[s + k] = arguments[k + 2];
    }
    return a;
}

var _slice = Array.prototype.slice;
Array.prototype.pop = function() {
    return this.splice(this.length - 1, 1)[0];
}

Array.prototype.push = function() {
    this.splice.apply(this,
            [this.length, 0].concat(_slice.call(arguments)));
    return this.length;
}

Array.prototype.shift = function() {
    return this.splice(0, 1)[0];
}

Array.prototype.unshift = function() {
    this.splice.apply(this,
            [0, 0].concat(_slice.call(arguments)));
    return this.length;
}

// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer
var toInteger = function(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
};

function limit(target, n1, n2) {
    var a = [n1, n2].sort();
    if (target < a[0])
        target = a[0];
    if (target > a[1])
        target = a[1];
    return target;
}
function nearer(target, n1, n2) {
    var diff1 = Math.abs(target - n1),
            diff2 = Math.abs(target - n2);
    return diff1 < diff2 ? n1 : n2
}
if (0.9.toFixed(0) !== '1') {
    Number.prototype.toFixed = function(n) {
        var power = Math.pow(10, n);
        var fixed = (Math.round(this * power) / power).toString();
        if (n == 0)
            return fixed;
        if (fixed.indexOf('.') < 0)
            fixed += '.';
        var padding = n + 1 - (fixed.length - fixed.indexOf('.'));
        for (var i = 0; i < padding; i++)
            fixed += '0';
        return fixed;
    };
}
if (!Number.prototype.toFixed || (0.00008).toFixed(3) !== '0.000' ||
        (0.9).toFixed(0) === '0' || (1.255).toFixed(2) !== '1.25' ||
        (1000000000000000128).toFixed(0) !== "1000000000000000128") {
    // 一些内部方法与变量,防止全局污染
    (function() {
        var base, size, data, i;

        base = 1e7;
        size = 6;
        data = [0, 0, 0, 0, 0, 0];

        function multiply(n, c) {
            var i = -1;
            while (++i < size) {
                c += n * data[i];
                data[i] = c % base;
                c = Math.floor(c / base);
            }
        }

        function divide(n) {
            var i = size, c = 0;
            while (--i >= 0) {
                c += data[i];
                data[i] = Math.floor(c / n);
                c = (c % n) * base;
            }
        }

        function toString() {
            var i = size;
            var s = '';
            while (--i >= 0) {
                if (s !== '' || i === 0 || data[i] !== 0) {
                    var t = String(data[i]);
                    if (s === '') {
                        s = t;
                    } else {
                        s += '0000000'.slice(0, 7 - t.length) + t;
                    }
                }
            }
            return s;
        }

        function pow(x, n, acc) {
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x)
                    : pow(x * x, n / 2, acc)));
        }

        function log(x) {
            var n = 0;
            while (x >= 4096) {
                n += 12;
                x /= 4096;
            }
            while (x >= 2) {
                n += 1;
                x /= 2;
            }
            return n;
        }

        Number.prototype.toFixed = function(fractionDigits) {
            var f, x, s, m, e, z, j, k;

            // Test for NaN and round fractionDigits down
            f = Number(fractionDigits);
            f = f !== f ? 0 : Math.floor(f);

            if (f < 0 || f > 20) {
                throw new RangeError("Number.toFixed called with invalid number of decimals");
            }

            x = Number(this);

            // Test for NaN
            if (x !== x) {
                return "NaN";
            }

            // If it is too big or small, return the string value of the number
            if (x <= -1e21 || x >= 1e21) {
                return String(x);
            }

            s = "";

            if (x < 0) {
                s = "-";
                x = -x;
            }

            m = "0";

            if (x > 1e-21) {
                // 1e-21 < x < 1e21
                // -70 < log2(x) < 70
                e = log(x * pow(2, 69, 1)) - 69;
                z = (e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1));
                z *= 0x10000000000000; // Math.pow(2, 52);
                e = 52 - e;

                // -18 < e < 122
                // x = z / 2 ^ e
                if (e > 0) {
                    multiply(0, z);
                    j = f;

                    while (j >= 7) {
                        multiply(1e7, 0);
                        j -= 7;
                    }

                    multiply(pow(10, j, 1), 0);
                    j = e - 1;

                    while (j >= 23) {
                        divide(1 << 23);
                        j -= 23;
                    }

                    divide(1 << j);
                    multiply(1, 1);
                    divide(2);
                    m = toString();
                } else {
                    multiply(0, z);
                    multiply(1 << (-e), 0);
                    m = toString() + '0.00000000000000000000'.slice(2, 2 + f);
                }
            }

            if (f > 0) {
                k = m.length;

                if (k <= f) {
                    m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
                } else {
                    m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
                }
            } else {
                m = s + m;
            }

            return m;
        }
    }());
}


console.log(0.1 + 0.2)
console.log(Math.pow(2, 53) === Math.pow(2, 53) + 1) //true
console.log(Infinity > 100) //true
console.log(JSON.stringify(25001509088465005)) //25001509088465004
console.log(0.1000000000000000000000000001) //0.1
console.log(0.100000000000000000000000001) //0.1
console.log(0.1000000000000000000000000456) //0.1
console.log(0.09999999999999999999999) //0.1
console.log(1 / 3) //0.3333333333333333
console.log(23.53 + 5.88 + 17.64)// 47.05
console.log(23.53 + 17.64 + 5.88)// 47.050000000000004

var observable = function(val) {
    var cur = val;//一个内部变量
    function field(neo) {
        if (arguments.length) {//setter
            if (cur !== neo) {
                cur = neo;
            }
        } else {//getter
            return cur;
        }
    }
    field();
    return field;
}

Function.prototype.bind = function(context) {
    if (arguments.length < 2 && context == void 0)
        return this;
    var __method = this, args = [].slice.call(arguments, 1);
    return function() {
        return __method.apply(context, args.concat.apply(args, arguments));
    }
}

var addEvent = document.addEventListener ?
        function(el, type, fn, capture) {
            el.addEventListener(type, fn, capture)
        } :
        function(el, type, fn) {
            el.attachEvent("on" + type, fn.bind(el, event))
        }

var bind = function(bind) {
    return{
        bind: bind.bind(bind),
        call: bind.bind(bind.call),
        apply: bind.bind(bind.apply)
    }
}(Function.prototype.bind)

var concat = bind.apply([].concat);
var a = [1, [2, 3], 4];
var b = [1, 3];

var concat = bind.apply([].concat);
console.log(concat(b, a))//[1,3,1,2,3,4]

var slice = bind([].slice)
var array = slice({
    0: "aaa",
    1: "bbb",
    2: "ccc",
    length: 3
});
console.log(array)//[ "aaa", "bbb", "ccc"]

function test() {
    var args = slice(arguments)
    console.log(args)//[1,2,3,4,5]
}
test(1, 2, 3, 4, 5)

var hasOwn = bind.call(Object.prototype.hasOwnProperty);
hasOwn([], "xx") // false
//使用bind.bind就需要多执行一次
var hasOwn2 = bind.bind(Object.prototype.hasOwnProperty);
hasOwn2([], "xx")() // false

function curry(fn) {
    function inner(len, arg) {
        if (len == 0)
            return fn.apply(null, arg);
        return function(x) {
            return inner(len - 1, arg.concat(x));
        };
    }
    return inner(fn.length, []);
}

function sum(x, y, z, w) {
    return x + y + z + w;
}
curry(sum)('a')('b')('c')('d'); // => 'abcd'


function curry2(fn) {
    function inner(len, arg) {
        if (len <= 0)
            return fn.apply(null, arg);
        return function() {
            return inner(len - arguments.length,
                    arg.concat(Array.apply([], arguments)));
        };
    }
    return inner(fn.length, []);
}
curry2(sum)('a')('b', 'c')('d'); // => 'abcd'
curry2(sum)('a')()('b', 'c')()('d'); // => 'abcd'
Function.prototype.partial = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
        var arg = 0;
        for (var i = 0; i < args.length && arg < arguments.length; i++)
            if (args[i] === undefined)
                args[i] = arguments[arg++];
        return fn.apply(this, args);
    };
}

var delay = setTimeout.partial(undefined, 10);
//接下来的工作就是代替掉第一个参数
delay(function() {
    alert("A call to this function will be temporarily delayed.");
})



var _ = (function() {
    var doc = new ActiveXObject('htmlfile')
    doc.write('<script><\/script>')
    doc.close()
    var Obj = doc.parentWindow.Object
    if (!Obj || Obj === Object)
        return
    var name, names =
            ['constructor', 'hasOwnProperty', 'isPrototypeOf'
                        , 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']
    while (name = names.pop())
        delete Obj.prototype[name]
    return Obj
}())

function partial(fn) {
    var A = [].slice.call(arguments, 1);
    return A.length < 1 ? fn : function() {
        var a = Array.apply([], arguments);
        var c = A.concat();//复制一份
        for (var i = 0; i < c.length; i++) {
            if (c[i] === _) {//替换占位符
                c[i] = a.shift();
            }
        }
        return fn.apply(this, c.concat(a));
    }
}
function test(a, b, c, d) {
    return "a = " + a + " b = " + b + " c = " + c + " d = " + d
}
var fn = partail(test, 1, _, 2, _);
fn(44, 55)// "a = 1 b = 44 c = 2 d = 55"

Function.prototype.apply || (Function.prototype.apply = function(x, y) {
    x = x || window;
    y = y || [];
    x.__apply = this;
    if (!x.__apply)
        x.constructor.prototype.__apply = this;
    var r, j = y.length;
    switch (j) {
        case 0:
            r = x.__apply();
            break;
        case 1:
            r = x.__apply(y[0]);
            break;
        case 2:
            r = x.__apply(y[0], y[1]);
            break;
        case 3:
            r = x.__apply(y[0], y[1], y[2]);
            break;
        case 4:
            r = x.__apply(y[0], y[1], y[2], y[3]);
            break;
        default:
            var a = [];
            for (var i = 0; i < j; ++i)
                a[i] = "y[" + i + "]";
            r = eval("x.__apply(" + a.join(",") + ")");
            break;
    }
    try {
        delete x.__apply ? x.__apply : x.constructor.prototype.__apply;
    }
    catch (e) {
    }
    return r;
});

Function.prototype.call || (Function.prototype.call = function() {
    var a = arguments, x = a[0], y = [];
    for (var i = 1, j = a.length; i < j; ++i)
        y[i - 1] = a[i]
    return this.apply(x, y);
});


new Date();
new Date(value);//传入毫秒数
new Date(dateString);
new Date(year, month, day /*, hour, minute, second, millisecond*/);

if (!Date.now) {
    Date.now = function() {
        return +new Date;
    }
}
if (!Date.prototype.toISOString) {
    void function() {
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toJSON = Date.prototype.toISOString = function() {
            return this.getUTCFullYear()
                    + '-' + pad(this.getUTCMonth() + 1)
                    + '-' + pad(this.getUTCDate())
                    + 'T' + pad(this.getUTCHours())
                    + ':' + pad(this.getUTCMinutes())
                    + ':' + pad(this.getUTCSeconds())
                    + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                    + 'Z';
        };

    }();
}


if ((new Date).getYear() > 1900) {
    Date.prototype.getYear = function() {
        return this.getFullYear() - 1900;
    };
    Date.prototype.setYear = function(year) {
        return this.setFullYear(year); //+ 1900
    };
}

var getDatePeriod = function(start, finish) {
    return Math.abs(start * 1 - finish * 1) / 60 / 60 / 1000 / 24;
}

var getFirstDateInMonth = function(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

var getLastDateInMonth = function(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
var getFirstDateInQuarter = function(date) {
    return new Date(date.getFullYear(), ~~(date.getMonth() / 3) * 3, 1);
}
var getFirstDateInQuarter = function(date) {
    return new Date(date.getFullYear(), ~~(date.getMonth() / 3) * 3 + 3, 0);
}
Date.prototype.isLeapYear = function() {
    return new Date(this.getFullYear(), 2, 0).getDate() == 29;
}

function getDaysInMonth1(date) {
    switch (date.getMonth()) {
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
            return 31;
        case 1:
            var y = date.getFullYear();
            return y % 4 == 0 && y % 100 != 0 || y % 400 == 0 ? 29 : 28;
        default:
            return 30;
    }
}

function getDaysInMonth2(date) {
    switch (date.getMonth()) {
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
            return 31;
        case 1:
            var y = date.getFullYear();
            return y % 4 == 0 && y % 100 != 0 || y % 400 == 0 ? 29 : 28;
        default:
            return 30;
    }
}

function getDaysInMonth3(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
