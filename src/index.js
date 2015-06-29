/**
 * Webページのデザイン（レイアウト）が、予め決めたどのテンプレートにマッチするか調べるスクリプト
 * 先行研究におけるClassificationStep -> から改良中
 *
 * refs. http://ci.nii.ac.jp/naid/110006951108
 *
 */
(function() {
  'use strict';

  var DOMSegmentater = require('./DOMSegmentater'),
    TemplateClassifier = require('./TemplateClassifier'),
    segmentater = new DOMSegmentater(),
    classifier = new TemplateClassifier(),
    utils = require('./utils');

  var B = segmentater.divideDOMToMinimumBlocks(document.body);
  // console.log('B:', B);    // debug

  // テンプレート判定はあとで
  var T = classifier.matchingTemplate(B);
  console.log('T:', T); // debug

  // 分割結果を確認する
  var bodyLayoutData = segmentater.getLayoutData([document.body])[0];
  var nodeLayoutData = segmentater.getLayoutData(B);
  segmentater.rewriteDOM(bodyLayoutData, nodeLayoutData);

  // window.T = T;    // for phantomjs

  window.segmentater = segmentater;
}());
