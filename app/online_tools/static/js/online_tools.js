(function (angular) {
  'use strict';

  angular.module('online-tools', [])
    .constant('rndChArr', [])
    .constant('maxLen', 5)
    .constant('prime', 21001)
    .constant('cjkutf8base', 0x4e00)
    .constant('cjkutf8range', 0x51ff)
    .constant('lowerCases', 'abcdefghijklmnopqrstuvwxyz')
    .constant('upperCases', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    .constant('digits', '0123456789')
    .constant('specials', '`~!@#$%^&*()_+-={}|[]\\:";\'<>?,./')
    .controller('RdnGenCtrl',
      ['$scope', 'prime', 'lowerCases', 'upperCases', 'digits', 'specials', 'cjkutf8base', 'cjkutf8range',
        function ($scope, prime, lowerCases, upperCases, digits, specials, cjkutf8base, cjkutf8range) {
          $scope.charCount = 16;
          $scope.generatedChars = '';
          $scope.lowerCases = lowerCases;
          $scope.upperCases = upperCases;
          $scope.digits = digits;
          $scope.specials = specials;

          $scope.generate = function () {
            var rnd, charArr, charArrLen, i, maxLen;

            charArr = '';

            $scope.hasLowerCase && (charArr += lowerCases);
            $scope.hasUpperCase && (charArr += upperCases);
            $scope.hasDigit && (charArr += digits);
            $scope.hasSpecial && (charArr += specials);

            // generate some random CJK characters
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

            ga('send', 'event', 'click', 'generate');
          };

          // automatically select the content on mouse over
          $("#selTarget").on("mouseover", function () {
            var range = document.createRange();
            var selection = window.getSelection();

            range.selectNodeContents(this);
            selection.removeAllRanges();
            selection.addRange(range);

            $(this).focus();
          });
        }]);
})(angular);
