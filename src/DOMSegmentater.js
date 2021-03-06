/**
 * ページの分割処理をまとめるクラス
 */
(function() {
  'use strict';

  function DOMSegmentater() {}

  /**
   * 最小ブロックに分割する
   *
   * @method divideDOMToMinimumBlocks
   * @return {Array} Returns 最小ブロックの集合
   */
  DOMSegmentater.prototype.divideDOMInMinimumBlocks = function(body) {
    var blocks = [];

    function divideWithDFS(node) {
      if (isMinimumBlock(node)) {
        return blocks.push(node);
      }
      for (var i = 0; i < node.children.length; i++) {
        divideWithDFS(node.children[i]);
      }
    }

    divideWithDFS(body);

    return blocks;
  };

  /**
   * 最小ブロックのレイアウトデータを計算して返す
   *
   * @method getLayoutData
   * @param {Array} blocks 最小ブロックの集合
   * @return {Array} Returns 最小ブロックのレイアウト情報の集合
   */
  DOMSegmentater.prototype.getLayoutData = function(blocks) {
    var layoutData = [];
    for (var i = 0; i < blocks.length; i++) {
      var d = getNodeLayoutData(blocks[i]);
      d.id = i;
      layoutData.push(d);
    }
    return layoutData;
  };

  /**
   * 分割結果を確認するために分割後の状態にページを書き換える
   *
   * @method rewriteDOM
   * @param {Object} bodyLayoutData document.bodyのレイアウト情報
   * @param {Array} nodesLayoutData 分割後のブロックのレイアウト情報の集合
   * @return {Array} Returns 最小ブロックのレイアウト情報の集合
   */
  DOMSegmentater.prototype.rewriteDOM = function(bodyLayoutData, nodesLayoutData) {
    var head = document.getElementsByTagName('head')[0],
      body = document.getElementsByTagName('body')[0];

    var i;
    for (i = head.children.length - 1; i >= 0; i--) {
      head.removeChild(head.children[i]);
    }
    for (i = body.children.length - 1; i >= 0; i--) {
      body.removeChild(body.children[i]);
    }

    // bodyのレイアウトデータを反映
    var style = '';
    style += 'width:' + bodyLayoutData.width + 'px;';
    style += 'height:' + bodyLayoutData.height + 'px;';

    if (bodyLayoutData.background.type === 'color') {
      style += 'background-color:rgb(' + bodyLayoutData.background.color.r + ',' + bodyLayoutData.background.color.g + ',' + bodyLayoutData.background.color.b + ');';
    }

    if (bodyLayoutData.background.type === 'image') {
      style += 'background-image:' + bodyLayoutData.background.image + ';';
    }

    style += 'list-style:none;';
    style += 'color:rgb(' + bodyLayoutData.color.r + ',' + bodyLayoutData.color.g + ',' + bodyLayoutData.color.b + ');';
    style += 'font-size:' + bodyLayoutData.fontSize + 'px;';
    style += 'font-weight:' + bodyLayoutData.fontWeight + ';';
    body.setAttribute('style', style);

    // bodyに子要素を追加
    for (i = 0; i < nodesLayoutData.length; i++) {
      var n = nodesLayoutData[i],
        element = document.createElement('div');
      style = '';
      style += 'position:absolute;';
      style += 'top:' + n.top + 'px;';
      style += 'left:' + n.left + 'px;';
      style += 'width:' + n.width + 'px;';
      style += 'height:' + n.height + 'px;';
      if (n.background.type === 'color') {
        style += 'background-color:rgb(' + n.background.color.r + ',' + n.background.color.g + ',' + n.background.color.b + ');';
      }

      if (n.background.type === 'image') {
        // 背景が画像だった場合はとりあえず白に設定しておく
        style += 'background-color:rgb(255, 255, 255);';
        // style += 'background-image:' + n.background.image + ';';
      }
      style += 'color:rgb(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ');';
      style += 'font-size:' + n.fontSize + 'px;';
      style += 'font-weight:' + n.fontWeight + ';';
      style += 'border:1px solid black;';

      element.innerHTML = i;
      element.setAttribute('style', style);
      body.appendChild(element);
    }
  };

  DOMSegmentater.prototype.getLeftEnd = function(blocks) {
    var leftEdges = blocks.map(function(b) {
      return b.getBoundingClientRect().left;
    });
    console.log(leftEdges.sort(ASC));
    return leftEdges.sort(ASC).shift();
  };

  DOMSegmentater.prototype.getRightEnd = function(blocks) {
    var rightEdges = blocks.map(function(b) {
      return b.getBoundingClientRect().right;
    });
    console.log(rightEdges.sort(ASC));
    return rightEdges.sort(ASC).pop();
  };

  DOMSegmentater.prototype.getLeftEndBlocks = function(blocks) {
    var leftEdges = blocks.map(function(b) {
      return b.getBoundingClientRect().left;
    });
    var leftEnd = leftEdges.sort(ASC).shift();

    return blocks.filter(function(b) {
      return b.getBoundingClientRect().left === leftEnd;
    });
  };

  DOMSegmentater.prototype.getRightEndBlocks = function(blocks) {
    var rightEdges = blocks.map(function(b) {
      return b.getBoundingClientRect().right;
    });
    var rightEnd = rightEdges.sort(ASC).pop();
    return blocks.filter(function(b) {
      return b.getBoundingClientRect().right === rightEnd;
    });
  };

  /**
   * 受け取ったノードが最小ブロックか判定する
   *
   * @method isMinimumBlock
   * @return {Boolean} Returns true if 最小ブロック
   */
  function isMinimumBlock(node) {
    // Rule m-1. 非有効ノードは最小ブロックではない
    if (!isEnableNode(node)) {
      // console.log(node, '[false]非有効ノード'); // debug
      return false;
    }

    // Rule m-2. 子要素が全て非有効ノードの場合、最小ブロックである
    var style = getComputedStyle(node);
    if (!hasEnableChild(node)) {
      // console.log(node, '[true] 子要素が全て非有効ノード'); // debug
      return true;
    }

    // TODO: 子要素に改行文字以外のTEXT NODEがある場合、どうしよう
    // 自身を最小ブロックにしてもいいが、下手するとすごいでかいブロックになりそう
    // とりあえず大きな問題ではなさそうなので放置で

    // Rule m-3. ブロックレベル要素かつ子要素にブロックレベル要素がなければ最小ブロック
    if (isBlockNode(node)) {
      for (var i = 0; i < node.children.length; i++) {
        if (isBlockNode(node.children[i])) {
          // console.log(node, '[false]ブロック要素 but 子要素にブロック要素あり');    // debug
          return false;
        }
      }
      // console.log(node, '[true]ブロック要素 and 子要素にブロック要素なし'); // debug
      return true;
    }
    // Rule m-4. インライン要素かつ兄弟ノードに最小ブロックがあれば最小ブロック
    else if (hasMinimumBlockSiblings(node)) {
      // console.log(node, '[true]兄弟ノードに最小ブロックあり');    // debug
      return true;
    }

    // console.log(node, '[false] 兄弟ノードにも最小ブロックなし');    // debug
    return false;
  }

  /**
   * 有効ノード（表示されているノード）か判定する
   *
   * @method isEnableNode
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if 有効ノード
   */
  function isEnableNode(node) {
    // Rule e-1
    if (node.tagName.toLowerCase() === 'script') {
      return false;
    }

    // Rule e-2
    var style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    // Rule e-3
    var bounds = node.getBoundingClientRect();
    if (bounds.width <= 1 || bounds.height <= 1) {
      return false;
    }
    if (bounds.right <= 0 || bounds.bottom <= 0) {
      return false;
    }

    var bodyBounds = document.body.getBoundingClientRect(),
      html = document.documentElement,
      height = Math.max(html.offsetHeight, html.scrollHeight, html.clientHeight);
    if (bounds.left >= bodyBounds.right || bounds.top >= height) {
      return false;
    }

    // Rule e-4
    if (isHiddenNode(node)) {
      return false;
    }

    return true;
  }

  /**
   * 隠れノードか判定する
   *
   * @method isHiddenNode
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if 隠れノード
   */
  function isHiddenNode(_node) {
    var node = _node,
      childBounds = node.getBoundingClientRect(),
      childTop = childBounds.top,
      childLeft = childBounds.left,
      childRight = childBounds.right,
      childBottom = childBounds.bottom;

    // 親ノードを再帰的に見て、overflow:hiddenがある
    // かつ、枠の外に飛び出ている部分があれば隠れノード
    while (node.parentElement) {
      node = node.parentNode;
      var parentStyle = getComputedStyle(node),
        parentBounds = node.getBoundingClientRect(),
        parentTop = parentBounds.top,
        parentLeft = parentBounds.left,
        parentRight = parentBounds.right,
        parentBottom = parentBounds.bottom;

      if (parentStyle.overflow === 'hidden' &&
        (childTop < parentTop ||
          childLeft < parentLeft ||
          childRight > parentRight ||
          childBottom > parentBottom)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 子要素に有効ノードがあるか判定する
   * 子要素がなくなる or 有効ノードが見つかったら終了
   *
   * @method hasEnableChild
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if node have enable nodes at least one.
   */
  function hasEnableChild(parentNode) {
    var queue = [],
      i = 0;

    for (i = 0; i < parentNode.children.length; i++) {
      queue.push(parentNode.children[i]);
    }

    // 幅優先探索
    while (queue.length > 0) {
      var node = queue.shift();
      if (isEnableNode(node)) {
        return true;
      }

      for (i = 0; i < node.children.length; i++) {
        queue.push(node.children[i]);
      }
    }

    return false;
  }

  /**
   * ブロック要素か判定する
   *
   * @method isBlockNode
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if node is ブロックレベル要素
   */
  function isBlockNode(node) {
    var style = getComputedStyle(node);
    switch (style.display) {
      case 'block':
      case 'inline-block':
        return true;
      case 'inline':
        return false;
      default:
        break;
    }

    var blockElements = [
      'p', 'blockquote', 'pre', 'div', 'noscript', 'hr', 'address', 'fieldset', 'legend', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'caption', 'thead', 'tbody', 'colgroup', 'col', 'tr', 'th', 'td', 'embed', 'section', 'article', 'nav', 'aside', 'header', 'footer', 'address'
    ];
    if (blockElements.indexOf(node.tagName.toLowerCase()) !== -1) {
      return true;
    }

    return false;
  }

  /**
   * 兄弟ノードに最小ブロックがあるか判定する
   *
   * @method hasMinimumBlockSiblings
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if 兄弟ノードに最小ブロックがある
   */
  function hasMinimumBlockSiblings(node) {
    var siblings = node.parentNode.children;

    var i, nodeNum;
    for (i = 0; i < siblings.length; i++) {
      if (node === siblings[i]) {
        nodeNum = i;
        break;
      }
    }

    for (i = nodeNum + 1; i < siblings.length; i++) {
      if (isMinimumBlock(siblings[i])) {
        return true;
      }
    }

    return false;
  }

  /**
   * ノードのレイアウト情報を返す
   *
   * @method getNodeLayoutData
   * @param {Object} node A Node of DOM
   * @return {Object} Returns nodeのレイアウト情報
   */
  function getNodeLayoutData(node) {
    var style = getComputedStyle(node),
      color = style.color.split(','),
      bounds = node.getBoundingClientRect();

    var tagName = node.tagName.toLowerCase(),
      fontSize = style.fontSize,
      text = node.innerHTML.replace(/<[^>]*?>/g, ''),
      width = bounds.width,
      height = bounds.height;

    function getBackgroundColor(n) {
      var bgColor = getComputedStyle(n).backgroundColor;
      if (bgColor !== "rgba(0, 0, 0, 0)") {
        return bgColor;
      }

      if (n.nodeName === "BODY" || n.parentNode.nodeName === "BODY") {
        return bgColor;
      }

      return getBackgroundColor(n.parentNode);
    }

    function getBackground(n) {
      var bgColor = getComputedStyle(n).backgroundColor,
        bgImage = getComputedStyle(n).backgroundImage;

      if (bgColor !== "rgba(0, 0, 0, 0)") {
        return {
          type: "color",
          image: "",
          color: {
            r: bgColor.split(',')[0].replace(/\D/g, ''),
            g: bgColor.split(',')[1].replace(/\D/g, ''),
            b: bgColor.split(',')[2].replace(/\D/g, '')
          }
        };
      }

      if (bgImage !== "none") {
        return {
          type: "image",
          image: bgImage,
          color: {
            r: "-1",
            g: "-1",
            b: "-1"
          }
        };
      }

      // なにもセットされていない、かつbodyにたどり着いてしまった場合
      if (n.nodeName === "BODY") {
        return {
          type: "none",    // rewriteの方で'color' or 'image'の場合にしかセットしてないのでブラウザデフォルトと同じ色になるはず
          image: "",
          color: {
            r: "-1",
            g: "-1",
            b: "-1"
          }
        };
      }

      return getBackground(n.parentNode);
    }

    var bg = getBackground(node);
    var bgColor = getBackgroundColor(node).split(',');

    return {
      color: {
        r: color[0].replace(/\D/g, ''),
        g: color[1].replace(/\D/g, ''),
        b: color[2].replace(/\D/g, '')
      },
      background: bg,
      width: bounds.width,
      height: bounds.height,
      top: bounds.top,
      left: bounds.left,
      fontSize: style.fontSize.replace(/\D/g, ''),
      fontWeight: style.fontWeight,
      innerHTML: text,
      colorString: style.color,
      backgroundString: style.background,
      bgColor: bgColor
    };
  }

  function ASC(a, b) {
    return (parseInt(a) > parseInt(b)) ? 1 : -1;
  }

  DOMSegmentater.prototype.displayBorderMinimumBlocks = function(bodyLayoutData, nodesLayoutData) {
    var head = document.getElementsByTagName('head')[0],
      body = document.getElementsByTagName('body')[0];

    // bodyに子要素を追加
    for (var i = 0; i < nodesLayoutData.length; ++i) {
      var n = nodesLayoutData[i],
        element = document.createElement('div'),
        style = '';
      style += 'position:absolute;';
      style += 'top:' + n.top + 'px;';
      style += 'left:' + n.left + 'px;';
      style += 'width:' + n.width + 'px;';
      style += 'height:' + n.height + 'px;';

      style += 'border:1px solid black;';
      style += 'z-index: 2147483647;';
      element.innerHTML = i;
      element.setAttribute('style', style);
      body.appendChild(element);
    }
  };

  // for debug
  DOMSegmentater.prototype.isMinimumBlock = isMinimumBlock;
  DOMSegmentater.prototype.isEnableNode = isEnableNode;
  DOMSegmentater.prototype.isHiddenNode = isHiddenNode;
  DOMSegmentater.prototype.hasEnableChild = hasEnableChild;
  DOMSegmentater.prototype.isBlockNode = isBlockNode;
  DOMSegmentater.prototype.hasMinimumBlockSiblings = hasMinimumBlockSiblings;
  DOMSegmentater.prototype.getNodeLayoutData = getNodeLayoutData;

  DOMSegmentater.prototype.hello = function() {
    return 'hello';
  };

  if (typeof module !== 'undefined' && module.exports) { // Node.js の場合
    module.exports = DOMSegmentater;
  } else { // ブラウザの場合
    window.DOMSegmentater = DOMSegmentater;
  }
}());
