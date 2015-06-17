/**
 * ページの分割処理をまとめるクラス
 */
(function() {
  'use strict';

  function DOMSegmentater() {
    var bounds = document.body.getBoundingClientRect();
    this.pageTop = bounds.top;
    this.pageLeft = bounds.left;
    this.pageRight = bounds.right;
    this.pageBottom = bounds.bottom;
    this.pageWidth = bounds.width;
    this.pageHeight = bounds.height;
  }

  DOMSegmentater.prototype.divideDOMToMinimumBlocks = function() {
    var blocks = [];

    function divideWithDFS(node) {
      if (isMinimumBlock(node)) {
        return blocks.push(node);
      }
      for (var i = 0; i < node.children.length; i++) {
        divideWithDFS(node.children[i]);
      }
    }

    divideWithDFS(document.body);

    return blocks;
  };

  // for debug
  DOMSegmentater.prototype.isMinimumBlock = isMinimumBlock;
  DOMSegmentater.prototype.isEnableNode = isEnableNode;
  DOMSegmentater.prototype.isHiddenNode = isHiddenNode;
  DOMSegmentater.prototype.hasEnableChild = hasEnableChild;
  DOMSegmentater.prototype.isBlockNode = isBlockNode;
  DOMSegmentater.prototype.hasMinimumBlockSiblings = hasMinimumBlockSiblings;

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
    var bodyBounds = document.body.getBoundingClientRect();
    if (bounds.left >= bodyBounds.right || bounds.top >= bodyBounds.bottom) {
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
  function isHiddenNode(node) {
    var childBounds = node.getBoundingClientRect(),
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
        childTop < parentTop ||
        childLeft < parentLeft ||
        childRight > parentRight ||
        childBottom > parentBottom) {
        return true;
      }
    }

    return false;
  }

  /**
   * 子要素に有効ノードがあるか判定する
   * 子要素がなくなる or 有効ノードが見つかるまで再帰的に呼ばれる
   *
   * @method hasEnableChild
   * @param {Object} node A Node of DOM
   * @return {Boolean} Returns true if node have enable nodes at least one.
   */
  function hasEnableChild(node) {
    if (isEnableNode(node)) {
      return true;
    }

    for (var i = 0; i < node.children.length; i++) {
      if (hasEnableChild(node)) {
        return true;
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

  module.exports = DOMSegmentater;
}());
