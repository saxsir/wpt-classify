/**
 * ページの分析処理をまとめるページ
 */
(function() {
  'use strict';

  function Analyzer() {}

  // 最小ブロックのレイアウト情報の配列
  /**
   * @params
   *    nodes 最小ブロックのレイアウト情報の配列
   *
   * @return
   *    繰返し構造と思われるブロックのindexの配列
   */
  Analyzer.prototype.findRepeatedStructure = function(nodes) {

    // nodesのレイアウトパターンの繰り返しを検出
    var type = [];
    var nodeIteration = [];
    for (var i = 0; i < nodes.length; ++i) {
      var n = nodes[i];
      var layoutInfo = {
        color: n.color,
        background: n.background,
        width: n.width,
        height: n.height,
        fontSize: n.fontSize,
        fontWeight: n.fontWeight
      };

      var d = JSON.stringify(layoutInfo);
      var typeId = type.indexOf(d);
      if (typeId < 0) {
        typeId = type.push(d) - 1;
      }

      nodeIteration.push(typeId);
    }

    return nodeIteration;

    // 返り値の例
    // return [
    //   [6,7,8,9,10,11],
    //   [23,26,29,33,36]
    // ];
  };


  if (typeof module !== 'undefined' && module.exports) { // Node.js の場合
    module.exports = Analyzer;
  } else { // ブラウザの場合
    window.Analyzer = Analyzer;
  }
}());
