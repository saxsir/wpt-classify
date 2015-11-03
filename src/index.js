(function() {
  'use strict';

  var _ = require('underscore');
  var DOMSegmentater = require('./DOMSegmentater'),
      segmentater = new DOMSegmentater();
  window.segmentater = segmentater;

  // Dividing DOM
  var minimumBlocks = segmentater.divideDOMInMinimumBlocks(document.body);
  window.minimumBlocks = minimumBlocks;

  // Getting layout informations
  var bodyLayoutData = segmentater.getLayoutData([document.body])[0];
  window.bodyLayoutData = bodyLayoutData;

  var nodeLayoutData = segmentater.getLayoutData(minimumBlocks);
  // z-index問題対応
  nodeLayoutData = _.chain(nodeLayoutData).groupBy(function(node) {
    return JSON.stringify([
        node.top, node.left, node.width, node.height
    ]);
  }).values().map(function(group) {
    return _.first(group);
  }).value();
  window.nodeLayoutData = nodeLayoutData;

  // Checking the dividing result on browser
  segmentater.rewriteDOM(bodyLayoutData, nodeLayoutData);
  // segmentater.displayBorderMinimumBlocks(bodyLayoutData, nodeLayoutData);
}());
