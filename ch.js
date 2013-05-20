function loadJS(src, callback){
    var head = document.head ||  document.getElementsByTagName("head")[0]
    var node = document.createElement("script");
    node.onload = node.onreadystatechange = function(){
        if(!node.pass && /loaded|complete|undefined/i.test(node.readyState) ){
            node.pass = 1;
            callback();
        }
    }
    node.src = src
    head.appendChild(node);
}

var w3c = document.dispatchEvent;
var type = w3c ? "load" :"readystatechange";
var head = document.head ||  document.getElementsByTagName("head")[0];
var base = head.getElementsByTagName("base")[0];
var addEvent = w3c ? function( el, type, fn, phase ){
    el.addEventListener( type, fn, !!phase );
} :  function( el, type, fn ){
    el.attachEvent( "on"+type, fn );
}
function loadJS(url, callback){
    var node = document.createElement("script");
    addEvent(node, type, function(){
        if(type == "load" || /loaded|complete/i.test(node.readyState) ){
            callback();
        }
    });
    //在IE8下不指定src，先插入节点，readystatechange回调能捕获到的第一个readyState状态肯定为complete
    node.src = url
    //如果是IE6,并且存在base,就不管它是否自闭合,插入在它的前面,  
    //这样我们就保证了新插入的节点总是排在后面
    if (base && !XMLHttpRequest ){
        head.insertBefore(node, base);
    }else{
        head.appendChild(node)
    }
}
