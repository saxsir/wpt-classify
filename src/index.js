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
    Analyzer = require('./Analyzer'),
    segmentater = new DOMSegmentater(),
    classifier = new TemplateClassifier(),
    analyzer = new Analyzer(),
    utils = require('./utils');

  window.segmentater = segmentater;

  // 分割する
  var minimumBlocks = segmentater.divideDOMInMinimumBlocks(document.body);
  window.minimumBlocks = minimumBlocks;

  // 分割結果を確認する
  var bodyLayoutData = segmentater.getLayoutData([document.body])[0];
  var nodeLayoutData = segmentater.getLayoutData(minimumBlocks);
  segmentater.rewriteDOM(bodyLayoutData, nodeLayoutData);

  window.nodeLayoutData = nodeLayoutData;

  // 繰返し構造の検出
  var nodeIteration = analyzer.findRepeatedStructure(nodeLayoutData);

  window.nodeIteration = nodeIteration;
}());
