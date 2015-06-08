/**
 * Webページのデザイン解析でよく使う関数をまとめるファイル
 */
(function() {
  'use strict';

  //TODO: 有効ノードの判定処理をいれる

  var Section = require('./Section');

  function Utils() {
    var bounds = document.body.getBoundingClientRect();

    this.pageTop = bounds.top;
    this.pageBottom = bounds.bottom;
    this.pageHeight = bounds.height;

    // 後から更新されるかも
    this.pageLeft = bounds.left;
    this.pageRight = bounds.right;
    this.pageWidth = bounds.width;
  }

  // ページの情報を取得する
  Utils.prototype.getPageBounds = function() {
    var self = this;

    //TODO: うーむ...精度低そう
    // 1階層下のノードだけ見て、ページサイズを判断する
    var bodyChildren = document.body.children;
    for (var i = 0; i < bodyChildren.length; i++) {
      var bounds = bodyChildren[i].getBoundingClientRect();
      self.pageLeft = Math.max(self.pageLeft, bounds.left);
      self.pageRight = Math.min(self.pageRight, bounds.right);
      self.pageWidth = Math.min(self.pageWidth, bounds.width);
    }
  };

  // nodeがレンダリングされた時の面積(px)を返す
  Utils.prototype.getRenderingSize = function(node) {
    var bounds = node.getBoundingClientRect(),
      size = bounds.width * bounds.height;

    return size;
  };

  // nodeが有効ノードかどうか判定する
  Utils.prototype.isEnableNode = function(node) {
    if (node.tagName.toLowerCase() === 'script') {
      return false;
    }

    var style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    var bounds = node.getBoundingClientRect();
    if (bounds.width <= 1 && bounds.height <= 1) {
      return false;
    }
    if (bounds.right <= 0 && bounds.bottom <= 0) {
      return false;
    }
    if (bounds.left >= self.pageRight && bounds.top >= self.pageBottom) {
      return false;
    }

    return true;
  };

  // DOM Treeを与えられたサイズで分割し、ブロックの配列を返す
  Utils.prototype.divideDOM = function(tree, size) {
    var self = this,
      blocks = [];

    // 深さ優先探索で全てのノードのサイズを確認する
    // ノードの面積が与えられたサイズ以下だったら分割終了
    function divideRecursive(node) {
      // 非有効ノードの子要素に有効ノードがある場合もあるかもしれないのでこの処理でOK
      if (self.isEnableNode(node) && self.getRenderingSize(node) <= size) {
        return blocks.push(node);
      }

      for (var i = 0; i < node.children.length; i++) {
        divideRecursive(node.children[i]);
      }
    }
    divideRecursive(tree);

    return blocks;
  };

  // 分割されたブロックを基に、T1~8のどのテンプレートに適合するか判断して
  // 整数値を返す（当てはまらなさそうだったら-1）
  Utils.prototype.MatchingTemplates = function(blocks) {
    var self = this,
      Vl = self.getVl(blocks),
      Vr = self.getVr(blocks),
      Vh = self.getVh(blocks, Vl.top, Vr.top),
      Vc = self.getVc(blocks, Vl.right, Vr.left, Vh.bottom),
      Vf = self.getVf(blocks, Vl.bottom, Vr.bottom, Vc.bottom);

    console.log('Vl:', Vl); // debug
    console.log('Vr:', Vr); // debug
    console.log('Vh:', Vh); // debug
    console.log('Vc:', Vc); // debug
    console.log('Vf:', Vf); // debug

    if (Vl.right < 0 && Vr.left < 0) {
      // T1 or T5
      if (Vf.top < 0) {
        return 1;
      } else {
        return 5;
      }
    } else if (Vr.left < 0) {
      // T2 or T6
      if (Vf.top < 0) {
        return 2;
      } else {
        return 6;
      }
    } else if (Vl.right < 0) {
      // T3 or T7
      if (Vf.top < 0) {
        return 3;
      } else {
        return 7;
      }
    } else {
      // T4 or T8
      if (Vf.top < 0) {
        return 4;
      } else {
        return 8;
      }
    }

    return -1;
  };

  // Vlのテンプレート情報を返す
  Utils.prototype.getVl = function(blocks) {
    var self = this,
      X = 0,
      h = 0,
      H = 0,
      topEdges = [],
      bottomEdges = [];

    // ページの情報
    var pageLeft = self.pageLeft,
      pageWidth = self.pageWidth;

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i],
        bounds = b.getBoundingClientRect(),
        top = bounds.top,
        left = bounds.left,
        right = bounds.right,
        bottom = bounds.bottom,
        height = bounds.height,
        width = bounds.width;

      if (left === pageLeft) {
        H += height;
        if ((right - left) <= pageWidth * 0.5) {
          X += width * height;
          h += height;
          topEdges.push(top);
          bottomEdges.push(bottom);
        }
      }
    }

    if (H !== 0 && X !== 0 && h !== 0 && h >= H * 0.3) {
      //TODO: これで幅の平均値返る？
      topEdges = topEdges.length > 0 ? topEdges : [-1];
      bottomEdges = bottomEdges.length > 0 ? bottomEdges : [-1];

      return new Section(topEdges.sort().shift(), pageLeft, (X / h), bottomEdges.sort().pop());
    } else {
      return new Section(-1, -1, -1, -1);
    }
  };

  // Vrのテンプレート情報を返す
  Utils.prototype.getVr = function(blocks) {
    var self = this,
      X = 0,
      h = 0,
      H = 0,
      topEdges = [],
      bottomEdges = [];

    // ページの情報
    var pageRight = self.pageRight,
      pageWidth = self.pageWidth;

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i],
        bounds = b.getBoundingClientRect(),
        top = bounds.top,
        left = bounds.left,
        right = bounds.right,
        bottom = bounds.bottom,
        height = bounds.height,
        width = bounds.width;

      if (right === pageRight) {
        H += height;
        if ((right - left) <= pageWidth * 0.5) {
          X += width * height;
          h += height;
          topEdges.push(top);
          bottomEdges.push(bottom);
        }
      }
    }

    if (H !== 0 && X !== 0 && h !== 0 && h >= H * 0.3) {
      //TODO: これで幅の平均値返る？
      topEdges = topEdges.length > 0 ? topEdges : [-1];
      bottomEdges = bottomEdges.length > 0 ? bottomEdges : [-1];

      return new Section(topEdges.sort().shift(), pageRight - (X / h), pageRight, bottomEdges.sort().pop());
    } else {
      return new Section(-1, -1, -1, -1);
    }
  };

  // Vcのテンプレート情報を返す
  Utils.prototype.getVc = function(blocks, topbar, leftbar, rightbar) {
    var self = this,
      bottomEdges = [];

    // ページの情報
    var pageTop = self.pageTop,
      pageLeft = self.pageLeft,
      pageRight = self.pageRight;

    topbar = topbar === -1 ? pageTop : topbar;
    leftbar = leftbar === -1 ? pageLeft : leftbar;
    rightbar = rightbar === -1 ? pageRight : rightbar;

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i],
        bounds = b.getBoundingClientRect(),
        left = bounds.left,
        right = bounds.left,
        bottom = bounds.bottom,
        width = bounds.width;

      if (left >= leftbar && right <= rightbar) {
        bottomEdges.push(bottom);
      }
    }

    bottomEdges = bottomEdges.length > 0 ? bottomEdges : [-1];

    return new Section(topbar, leftbar, rightbar, bottomEdges.sort().pop());
  };

  // Vhのテンプレート情報を返す
  Utils.prototype.getVh = function(blocks, vlTop, vrTop) {
    var self = this,
      vhBottom = -1;

    // ページの情報
    var pageTop = self.pageTop,
      pageLeft = self.pageLeft,
      pageRight = self.pageRight;

    if (vlTop === -1 && vrTop === -1) {
      // T1 or T5
      vhBottom = self.getVhBottom(blocks);
    } else {
      vhBottom = Math.max(vlTop, vrTop);
    }

    return new Section(pageTop, pageLeft, pageRight, vhBottom);
  };

  // Vfのテンプレート情報を返す
  Utils.prototype.getVf = function(blocks, vlBottom, vrBottom, vcBottom) {
    var self = this,
      vfTop = -1;

    // ページの情報
    var pageBottom = self.pageBottom,
      pageLeft = self.pageLeft,
      pageRight = self.pageRight;

    if (vlBottom === -1 && vrBottom === -1) {
      // T1 or T5
      vfTop = self.getVfTop(blocks, vcBottom);
    } else {
      vfTop = Math.max(vlBottom, vrBottom, vcBottom);
    }

    return new Section(vfTop, pageLeft, pageRight, pageBottom);
  };

  // T1, T5のためのVh特定メソッド
  Utils.prototype.getVhBottom = function(blocks) {
    var bottomEdges = [];

    // ページの情報
    var pageWidth = self.pageWidth,
      pageHeight = self.pageHeight,
      Ty = pageHeight * 0.5; // 論文から値が不明なので適当に設定

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i],
        bounds = b.getBoundingClientRect(),
        bottom = bounds.bottom,
        width = bounds.width;

      if (bottom < Ty && width >= (pageWidth * 0.8)) {
        bottomEdges.push(bottom);
      }
    }

    return bottomEdges.length > 0 ? bottomEdges.sort().pop() : -1;
  };

  // T1, T5のためのVf特定メソッド
  Utils.prototype.getVfTop = function(blocks, vcBottom) {
    var self = this,
      topEdges = [];

    // ページの情報
    var pageHeight = self.pageHeight,
      pageWidth = self.pageWidth;

    var Ty = pageHeight * 0.5; // 論文から値が不明なので適当に設定

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i],
        bounds = b.getBoundingClientRect(),
        top = bounds.top,
        width = bounds.width;

      if (top > Ty && width >= (pageWidth * 0.8) && top >= vcBottom) {
        topEdges.push(top);
      }
    }

    return topEdges.length > 0 ? topEdges.sort().shift() : -1;
  };

  module.exports = new Utils();
}());
