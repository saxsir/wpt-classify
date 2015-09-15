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

  window.segmentater = segmentater;
  var minimumBlocks = segmentater.divideDOMInMinimumBlocks(document.body);

  // 分割結果を確認する
  var bodyLayoutData = segmentater.getLayoutData([document.body])[0];
  var nodeLayoutData = segmentater.getLayoutData(minimumBlocks);
  segmentater.rewriteDOM(bodyLayoutData, nodeLayoutData);

  // console.log(nodeLayoutData);

  // var B = segmentater.divideDOMToMinimumBlocks(document.body);
  // var T = classifier.matchingTemplate(B);
  // console.log('T:', T);

  // データが見たい
  // console.log(
  //   segmentater.getLeftEnd(B),
  //   segmentater.getLeftEndBlocks(B)
  // );
  // console.log(
  //   segmentater.getRightEnd(B),
  //   segmentater.getRightEndBlocks(B)
  // );

  // window.B = B;
  // window.T = T;    // for phantomjs
}());
