'use strict';

angular.module('app', [])
  .constant('rndChArr', [])
  .constant('maxLen', 5)
  .constant('letters', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  .constant('digits', '0123456789')
  .constant('specials', '`~!@#$%^&*()_+-={}|[]\\:";\'<>?,./')
  .controller('RdnGenCtrl', function ($scope, rndChArr, maxLen, letters, digits, specials) {
    $scope.charCount = 1;
    $scope.generatedChars = '';

    $scope.generate = function () {
      var rnd, charArr, charArrLen, i;

      charArr = letters;
      if ($scope.hasDigits) {
        charArr += digits;
      }

      if ($scope.hasSepcials) {
        charArr += specials;
      }

      charArrLen = charArr.length;
      $scope.generatedChars = '';
      for (i = 0; i < $scope.charCount; i++) {
        rnd = parseInt(17103 * Math.random(), 10);
        $scope.generatedChars += charArr[rnd % charArrLen];
      }
    };
  });
