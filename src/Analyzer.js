/**
 * ページの分析処理をまとめるページ
 */
(function() {
  'use strict';

  var _ = require("underscore");

  function Analyzer() {}

  Analyzer.prototype.findRepeatedPatterns = function(nodes, body) {
    // Finding horizontal block
    var horizontallyRepeatedBlocks = _.chain(nodes)
      .groupBy(function(node) {
        // Rule1. topの値とheightの値が一致する
        return JSON.stringify([
          node.top,
          node.height,
        ]);
      })
      .filter(function(v, k) {
        // Rule2. 2回以上の繰り返し
        return v.length >= 2;
      })
      .mapObject(function(v, k) {
        return _.map(v, function(node) {
          return node.id;
        });
      })
      .value();

    // Finding vertical blocks
    var verticallyRepeatedBlocks = _.chain(nodes)
      .groupBy(function(node) {
        // Rule1. leftの値とheightが一致する
        return JSON.stringify([
          node.left,
          node.height,
        ]);
      })
      .filter(function(v, k) {
        // Rule2. 2回以上の繰り返し
        return v.length >= 2;
      })
      .mapObject(function(v, k) {
        return _.map(v, function(node) {
          return node.id;
        });
      })
      .value();

    return [
      horizontallyRepeatedBlocks,
      verticallyRepeatedBlocks
    ];
  };

  Analyzer.prototype.findRepeatedPatternsByKey = function(nodes, key) {
    /**
     * top
     * left
     * width
     * height
     * colorString
     * backgroundString
     * fontSize
     * fontWeight
     */

    var groupedNodes = _.groupBy(nodes, function(node) {
      return node[key];
    });

    var groupedNodeIds = _.mapObject(groupedNodes, function(v, k) {
      return _.map(v, function(node) {
        return node.id;
      });
    });

    return groupedNodeIds;
  };

  Analyzer.prototype.findNavigationParts = function (nodes, body) {
    return _.chain(nodes)
      .filter(function(node) {
        return node.top < body.height * 0.2;
      })
      .groupBy(function(node) {
        return JSON.stringify([
          node.top,
          node.height,
        ]);
      })
      .filter(function(v, k) {
        var sum = _.reduce(v, function(memo, node) {
          return memo + node.width;
        }, 0);

        return sum > body.width * 0.5;
      })
      .mapObject(function(v, k) {
        return _.map(v, function(node) {
          return node.id;
        });
      })
      .filter(function(v, k) {
        return v.length > 3;
      })
      .value();
  };

  Analyzer.prototype.detectSeparators = function (nodes, body) {
    var Separator = require("./Section");
    var separators = [];

    // セパレーターを初期化
    separators.push(new Separator(body.top, body.left, body.width, body.height));

    _.each(nodes, function(node) {
      _.each(separators, function(separator) {
        if (isBlockContainedInSeparator(node, separator)) {
          // split
          return;
        }

        if (isBlockCrossesWithSeparator(node, separator)) {
          // update
          return;
        }

        if (isBlockCoversSeparator(node, separator)) {
          // remove
          return;
        }
      });
    });
  };

  if (typeof module !== 'undefined' && module.exports) { // Node.js の場合
    module.exports = Analyzer;
  } else { // ブラウザの場合
    window.Analyzer = Analyzer;
  }
}());
