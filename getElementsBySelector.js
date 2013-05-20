/* document.getElementsBySelector(selector)
   New in version 0.4: Support for CSS2 and CSS3 attribute selectors:
   See http://www.w3.org/TR/css3-selectors/#attribute-selectors
        Download by http://www.bvbsoft.com
   Version 0.4 - Simon Willison, March 25th 2003
   -- Works in Phoenix 0.5, Mozilla 1.3, Opera 7, Internet Explorer 6, Internet Explorer 5 on Windows
   -- Opera 7 fails
*/
 //
function getAllChildren(e) {
  //取得一个元素的所有子孙，兼并容IE5 
  return e.all ? e.all : e.getElementsByTagName('*');
}
 
document.getElementsBySelector = function(selector) {
  //如果不支持getElementsByTagName则直接返回空数组
  if (!document.getElementsByTagName) {
    return new Array();
  }
  //切割CSS表达式，分解一个个单元（每个单元可能代表一个或几个选择器，比如p.aaa则由标签选择器与类选择器组成）
  var tokens = selector.split(' ');
  var currentContext = new Array(document);
  //从左到右检测每个单元，换言之此引擎是自顶向下选元素，
  //我们的结果集如果中间为空，那么就立即中止此循环了
  for (var i = 0; i < tokens.length; i++) {
    //去掉两边的空白（但并不是所有的空白都是没用，
    //两个选择器组之间的空白代表着后代选择器，这要看作者们的各显神通了）
    token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');;
    //如果包含ID选择器，这里略显粗糙，因为它可能在引号里面，
    //此选择器支持到属性选择器，则代表着它可能是属性值的一部分
    if (token.indexOf('#') > -1) {
      // 这里假设这个选择器组以tag#id或#id的形式组成，可能导致BUG，
      //但这暂且不谈，我们还是沿着作者的思路进行下去吧，
      var bits = token.split('#');
      var tagName = bits[0];
      var id = bits[1];
      //先用ID值取得元素，然后判定元素的tagName是否等于上面的tagName
      //此处有一个不严谨的地方，element可能为null，会引发异常
      var element = document.getElementById(id);
      if (tagName && element.nodeName.toLowerCase() != tagName) {
        // 没有直接返回空结果集
        return new Array();
      }
      //置换currentContext，跳至下一个选择器组
      currentContext = new Array(element);
      continue; 
    }
    // 如果包含类选择器，这里也假设它以.class或tag.class的形式
    if (token.indexOf('.') > -1) {
      
      var bits = token.split('.');
      var tagName = bits[0];
      var className = bits[1];
      if (!tagName) {
        tagName = '*';
      }
      // 从多个父节点出发，取得它们的所有子孙，
      // 这里的父节点即包含在currentContext的元素节点或文档对象
      var found = new Array;//这里是过滤集，通过检测它们的className决定去留
      var foundCount = 0;
      for (var h = 0; h < currentContext.length; h++) {
        var elements;
        if (tagName == '*') {
            elements = getAllChildren(currentContext[h]);
        } else {
            elements = currentContext[h].getElementsByTagName(tagName);
        }
        for (var j = 0; j < elements.length; j++) {
          found[foundCount++] = elements[j];
        }
      }
      currentContext = new Array;
      var currentContextIndex = 0;
      for (var k = 0; k < found.length; k++) {
        //found[k].className可能为空，因此不失为一种优化手段，但new RegExp放在外围更适合
        if (found[k].className && found[k].className.match(new RegExp('\\b'+className+'\\b'))) {
          currentContext[currentContextIndex++] = found[k];
        }
      }
      continue; 
    }
    //如果是以tag[attr(~|^$*)=val]或[attr(~|^$*)=val]的形式组合
    if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
      var tagName = RegExp.$1;
      var attrName = RegExp.$2;
      var attrOperator = RegExp.$3;
      var attrValue = RegExp.$4;
      if (!tagName) {
        tagName = '*';
      }
      // 这里的逻辑以上面的class部分相似，其实应该抽取成一个独立的函数
      var found = new Array;
      var foundCount = 0;
      for (var h = 0; h < currentContext.length; h++) {
        var elements;
        if (tagName == '*') {
            elements = getAllChildren(currentContext[h]);
        } else {
            elements = currentContext[h].getElementsByTagName(tagName);
        }
        for (var j = 0; j < elements.length; j++) {
          found[foundCount++] = elements[j];
        }
      }
      currentContext = new Array;
      var currentContextIndex = 0;
      var checkFunction; 
      //根据第二个操作符生成检测函数，后面章节会详解，这里不展开
      switch (attrOperator) {
        case '=': // 
          checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue); };
          break;
        case '~': 
          checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('\\b'+attrValue+'\\b'))); };
          break;
        case '|':
          checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))); };
          break;
        case '^': 
          checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0); };
          break;
        case '$': 
          checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length); };
          break;
        case '*': 
          checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1); };
          break;
        default :
          checkFunction = function(e) { return e.getAttribute(attrName); };
      }
      currentContext = new Array;
      var currentContextIndex = 0;
      for (var k = 0; k < found.length; k++) {
        if (checkFunction(found[k])) {
          currentContext[currentContextIndex++] = found[k];
        }
      }
      continue; 
    }
    // 如果没有“#”，“.”，“[”这样的特殊字符，我们就当成是tagName
    tagName = token;
    var found = new Array;
    var foundCount = 0;
    for (var h = 0; h < currentContext.length; h++) {
      var elements = currentContext[h].getElementsByTagName(tagName);
      for (var j = 0; j < elements.length; j++) {
        found[foundCount++] = elements[j];
      }
    }
    currentContext = found;
  }
  return currentContext;//最后返回结果集
}
 
/* That revolting regular expression explained
/^(\w+)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/
  \---/  \---/\-------------/    \-------/
    |      |         |               |
    |      |         |           The value
    |      |    ~,|,^,$,* or =
    |   Attribute
   Tag
*/
 