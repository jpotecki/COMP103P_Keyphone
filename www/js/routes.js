angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl',
  })

  .state('app.start', {
    url: '/start',
    views : {
        'menuContent' : {
            templateUrl: 'templates/start.html',
            controller: 'startCtrl'
        }
    }
  })

  .state('app.dailyUse', {
    url: '/dailyUse',
    views : {
        'menuContent' : {
            templateUrl: 'templates/dailyUse.html',
            controller: 'dailyUseCtrl'
        }
    }
  })

  .state('app.chooseList', {
    url: '/page11',
    views : {
        'menuContent' : {
            templateUrl: 'templates/chooseList.html',
            controller: 'chooseListCtrl'
        }
    }
  })

  .state('app.game1', {
    url: '/page9',
    views : {
        'menuContent' : {
            templateUrl: 'templates/game1.html',
            controller: 'catCtrl'
        }
    }
  })

  .state('app.gamePad', {
    url: '/gamePad',
    views : {
        'menuContent' : {
            templateUrl: 'templates/gamePad.html',
            controller: 'gamePad'
        }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views : {
        'menuContent' : {
            templateUrl: 'templates/settings.html',
            controller: 'settingsCtrl'
        }
    }
  })

  .state('app.editList', {
    url: '/editList/:ListID',
    views : {
        'menuContent' : {
            templateUrl: 'templates/editList.html',
            controller: 'editListCtrl'
        }
    }
  })

  .state('app.addList', {
    url: '/addList',
    views : {
        'menuContent' : {
            templateUrl: 'templates/addList.html',
            controller: 'addListCtrl'
        }
    }
  })

  .state('app.addWords', {
    url: '/page24',
    views : {
        'menuContent' : {
            templateUrl: 'templates/addWords.html',
            controller: 'addWordsCtrl'
        }
    }
  })

  .state('app.speakCheck', {
      url: '/speakCheck',
      views : {
          'menuContent' : {
              templateUrl : 'templates/speakCheck.html',
              controller : 'speakCheckCtrl'
          }
      }
  })

  .state('app.summary', {
      url : '/summary',
      views : {
          'menuContent' : {
              templateUrl : 'templates/summary.html',
              controller : 'summaryCtrl'
          }
      }
  })

$urlRouterProvider.otherwise('/app/start')

});
