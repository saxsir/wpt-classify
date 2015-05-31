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

  module.exports = new Utils();
}());
