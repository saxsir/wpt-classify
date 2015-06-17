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
    return [];
  };

  module.exports = DOMSegmentater;
}());
