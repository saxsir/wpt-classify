(function() {
  'use strict';

  var DOMSegmentater = require('./DOMSegmentater'),
    Analyzer = require('./Analyzer'),
    segmentater = new DOMSegmentater(),
    analyzer = new Analyzer();

  window.segmentater = segmentater;

  // Dividing DOM
  var minimumBlocks = segmentater.divideDOMInMinimumBlocks(document.body);
  window.minimumBlocks = minimumBlocks;

  // Getting layout informations
  var bodyLayoutData = segmentater.getLayoutData([document.body])[0];
  var nodeLayoutData = segmentater.getLayoutData(minimumBlocks);
  window.bodyLayoutData = bodyLayoutData;
  window.nodeLayoutData = nodeLayoutData;

  // Checking the dividing result on browser
  // segmentater.rewriteDOM(bodyLayoutData, nodeLayoutData);
  segmentater.displayBorderMinimumBlocks(bodyLayoutData, nodeLayoutData);

  // Finding repeated patterns
  var repeatedPatterns = analyzer.findRepeatedPatterns(nodeLayoutData, bodyLayoutData);
  window.repeatedPatterns = repeatedPatterns;

  repeatedPatterns.push(nodeLayoutData);

  if (typeof copy === 'function') {
    copy(repeatedPatterns);
    console.log('copied!');
  } else {
    console.log('##############################');
    console.log(JSON.stringify(repeatedPatterns));
  }

}());
