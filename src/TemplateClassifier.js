/**
 * テンプレートを判定（分類）処理をまとめるクラス
 */
(function() {
  'use strict';

  var Section = require('./Section');

  function TemplateClassifier() {
    var body = document.body,
      bounds = document.body.getBoundingClientRect();
    this.pageTop = 0;
    this.pageLeft = bounds.left;
    this.pageWidth = bounds.width;
    this.pageRight = bounds.right;

    // bodyの高さがない場合があるのでhtmlの高さを取得
    var html = document.documentElement;
    this.pageHeight = Math.max(html.offsetHeight, html.scrollHeight, html.clientHeight);
    this.pageBottom = this.pageHeight;
  }

  TemplateClassifier.prototype.matchingTemplate = function(blocks) {
    var self = this;

    var leftEdges = blocks.map(function(block) {
      return block.getBoundingClientRect().left;
    });
    var rightEdges = blocks.map(function(block) {
      return block.getBoundingClientRect().right;
    });
    self.pageLeft = Math.min.apply(null, leftEdges);
    self.pageRight = Math.max.apply(null, rightEdges);
    self.pageWidth = self.pageRight - self.pageLeft;

    console.log(self.pageTop, self.pageLeft, self.pageRight, self.pageBottom, self.pageWidth, self.pageHeight); // debug

    var Vl = self.getVl(blocks),
      Vr = self.getVr(blocks),
      Vh = self.getVh(blocks, Vl.top, Vr.top),
      Vc = self.getVc(blocks, Vl.right, Vr.left, Vh.bottom),
      Vf = self.getVf(blocks, Vl.bottom, Vr.bottom, Vc.bottom);

    console.log('Vl:', Vl); // debug
    console.log('Vr:', Vr); // debug
    console.log('Vh:', Vh); // debug
    console.log('Vc:', Vc); // debug
    console.log('Vf:', Vf); // debug

    if (Vh.bottom < 0) {
      return -1;    // 存在しないレイアウト
    }

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
  TemplateClassifier.prototype.getVl = function(blocks) {
    var self = this,
      X = 0,
      h = 0,
      H = self.pageHeight, // Hはページの高さでいいと思うので
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
        // H += height;
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

      return new Section(topEdges.sort(ASC).shift(), pageLeft, (X / h), bottomEdges.sort(ASC).pop());
    } else {
      return new Section(-1, -1, -1, -1);
    }
  };

  // Vrのテンプレート情報を返す
  TemplateClassifier.prototype.getVr = function(blocks) {
    var self = this,
      X = 0,
      h = 0,
      H = self.pageHeight, // Hはページの高さでいいと思うので
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
        // H += height;
        if (width <= pageWidth * 0.5) {
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

      return new Section(topEdges.sort(ASC).shift(), pageRight - (X / h), pageRight, bottomEdges.sort(ASC).pop());
    } else {
      return new Section(-1, -1, -1, -1);
    }
  };

  // Vcのテンプレート情報を返す
  TemplateClassifier.prototype.getVc = function(blocks, rightbar, leftbar, topbar) {
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

    return new Section(topbar, leftbar, rightbar, bottomEdges.sort(ASC).pop());
  };

  // Vhのテンプレート情報を返す
  TemplateClassifier.prototype.getVh = function(blocks, vlTop, vrTop) {
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
  TemplateClassifier.prototype.getVf = function(blocks, vlBottom, vrBottom, vcBottom) {
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
  TemplateClassifier.prototype.getVhBottom = function(blocks) {
    var self = this,
      bottomEdges = [];

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

    return bottomEdges.length > 0 ? bottomEdges.sort(ASC).pop() : -1;
  };

  // T1, T5のためのVf特定メソッド
  TemplateClassifier.prototype.getVfTop = function(blocks, vcBottom) {
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

    return topEdges.length > 0 ? topEdges.sort(ASC).shift() : -1;
  };

  function ASC(a, b) {
    return (parseInt(a) > parseInt(b)) ? 1 : -1;
  }

  module.exports = TemplateClassifier;
}());
