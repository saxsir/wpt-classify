(function() {
  'use strict';

  var path = require('path'),
      _ = require('underscore'),
      args = process.argv;

  var cwd = path.resolve(process.cwd());
  var pats = require(cwd + '/' + args[2]);

  // To output nodeLayoutData
  var header = [
    "background-type",
    "background-color-r",
    "background-color-g",
    "background-color-b",
    "color-r",
    "color-g",
    "color-b",
    "font-size",
    "font-weight",
    "top",
    "left",
    "width",
    "height",
  ];
  console.log(header.join(','));

  _.each(pats[2], function(node) {
    var data = [
      node.background.type,
      node.background.color.r,
      node.background.color.g,
      node.background.color.b,
      node.color.r,
      node.color.g,
      node.color.b,
      node.fontSize,
      node.fontWeight,
      node.top,
      node.left,
      node.width,
      node.height
    ];

    console.log(data.join(','));
  });

})();
