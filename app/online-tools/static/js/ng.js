'use strict';

angular.module('ngapp', [])
  .constant('rndChArr', [])
  .constant('maxLen', 5)
  .constant('prime', 21001)
  .constant('cjkutf8base', 0x4e00)
  .constant('cjkutf8range', 0x51ff)
  .constant('lowerCases', 'abcdefghijklmnopqrstuvwxyz')
  .constant('upperCases', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  .constant('digits', '0123456789')
  .constant('specials', '`~!@#$%^&*()_+-={}|[]\\:";\'<>?,./');


function RootCtrl() {}

function RdnGenCtrl($scope, prime, lowerCases, upperCases, digits, specials, cjkutf8base, cjkutf8range) {
  $scope.charCount = 16;
  $scope.generatedChars = '';
  $scope.lowerCases = lowerCases;
  $scope.upperCases = upperCases;
  $scope.digits = digits;
  $scope.specials = specials;

  $scope.generate = function() {
    var rnd, charArr, charArrLen, i, maxLen;

    charArr = '';

    if ($scope.hasLowerCases) {
      charArr += lowerCases;
    }

    if ($scope.hasUpperCases) {
      charArr += upperCases;
    }

    if ($scope.hasDigits) {
      charArr += digits;
    }

    if ($scope.hasSpecials) {
      charArr += specials;
    }

    // generate some randome CJK characters
    if ($scope.hasCJK) {
      maxLen = charArr.length > 0 ? $scope.charCount : $scope.charCount * 10;
      for (i = 0; i < maxLen; i++) {
        rnd = parseInt(prime * Math.random(), 10) % cjkutf8range + cjkutf8base;
        charArr += String.fromCharCode(rnd);
      }
    }

    charArrLen = charArr.length;
    if (charArrLen > 0) {
      $scope.generatedChars = '';
      maxLen = $scope.charCount;
      for (i = 0; i < maxLen; i++) {
        rnd = parseInt(prime * Math.random(), 10);
        $scope.generatedChars += charArr[rnd % charArrLen];
      }
    }
  };

  // automatically select the content on mouse over
  $("#selTarget").on("mouseover", function(e) {
      var range = document.createRange();
      var selection = window.getSelection();

      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);

      $(this).focus();
  });
}
