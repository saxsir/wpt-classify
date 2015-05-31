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

  var Tsize = 320 * 14;    // 横幅は1280を4分割, 高さは一般的な文字サイズ

  var size = utils.getRenderingSize(document.body),
    preT = [];

  while(size > Tsize) {
    console.log('size:', size);    // debug
    var B = [];
    preT = preT.concat([]);
    size = size * 0.9;
  }

  var T = 'T1';
  return console.log(T);
}());
