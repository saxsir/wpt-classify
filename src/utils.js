/**
 * Webページのデザイン解析でよく使う関数をまとめるファイル
 */
(function() {
  'use strict';

  function Utils() {}

  // nodeがレンダリングされた時の面積(px)を返す
  Utils.prototype.getRenderingSize = function(node) {
    var bounds = node.getBoundingClientRect(),
      size = bounds.width * bounds.height;

    return size;
  };

  // DOM Treeを与えられたサイズで分割し、ブロックの配列を返す
  Utils.prototype.divideDOM = function(tree, size) {
    var self = this,
      blocks = [];

    // 深さ優先探索で全てのノードのサイズを確認する
    // ノードの面積が与えられたサイズ以下だったら分割終了
    function divideRecursive(node) {
      if (self.getRenderingSize(node) <= size) {
        return blocks.push(node);
      }

      for (var i = 0; i < node.children.length; i++) {
        divideRecursive(node.children[i]);
      }
    }
    divideRecursive(tree);

    return blocks;
  };

  module.exports = new Utils();
}());
