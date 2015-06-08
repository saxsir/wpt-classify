/**
 * Webページのデザイン（レイアウト）が、予め決めたどのテンプレートにマッチするか調べるスクリプト
 * 先行研究におけるClassificationStep
 *
 * refs. http://ci.nii.ac.jp/naid/110006951108
 *
 */
var utils = require('./utils');

(function() {
  'use strict';

  // あらかじめページのwidth, heightを取得しておく
  // とりあえず保留
  // utils.getPageBounds();

  var Tsize = 960;    // 12px(標準か、それ以下くらいの文字サイズ) * 80(6, 7文字)

  var size = utils.getRenderingSize(document.body),
    preT = [];

  while(size > Tsize) {
    console.log('size:', size);    // debug
    var B = utils.divideDOM(document.body, size);
    console.log('B:', B);    // debug
    preT = preT.concat(utils.MatchingTemplates(B));
    console.log('preT:', preT);    // debug
    size = size * 0.9;
  }

  var T = Math.max.apply(null, preT);
  window.T = T;    // for phantomjs
  return console.log(T);
}());
