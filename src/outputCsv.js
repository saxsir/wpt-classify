(function() {
  'use strict';

  var path = require('path'),
      _ = require('underscore'),
      args = process.argv;

  var cwd = path.resolve(process.cwd());
  var pats = require(cwd + '/' + args[2]);

  // To output nodeLayoutData
  var header = [
    "pattern",
    "direction",
    "role"
  ];
  console.log(header.join(','));

  // To output horizontally patterns
  _.each(pats[0], function(v, k) {
    var patterns = v.join('--'),
        direction = 'horizontal';

    console.log([patterns, direction].join(','));
  });

  // To output vertically patterns
  _.each(pats[1], function(v, k) {
    var patterns = v.join('--'),
        direction = 'vertical';

    console.log([patterns, direction].join(','));
  });

})();
