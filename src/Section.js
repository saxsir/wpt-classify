/**
 * 表示クラス（論文内での表記と統一）
 * ページを分割した後のブロックのまとまり
 */
(function() {
  function Section(top, left, right, bottom) {
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
  }

  module.exports = Section;
}());
