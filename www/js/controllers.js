/* Written by Janos Potecki
 * University College London Term 2/3 - 2015/2016
 * for Course: COMP103P
 * www.github.com/jpotecki
 * janos dot potecki dot 15 et ucl dot ac dot uk
 */
angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $localstorage, $key_data) {
    // check if statisticsdata exists, if not,
    /// create it
    var data = $localstorage.getData();
    if (Object.keys(data).length === 0 && JSON.stringify(data) === JSON.stringify({})){
            data = $key_data.createData();
            $localstorage.saveData(data);
        };
})

.controller('startCtrl', function($scope, $window) {
    //$scope.size = $window.innerWidth;
})

.controller('dailyUseCtrl', function($scope, $ionicPlatform, $audioPlayer, $localstorage, $key_data) {
    var data;
    var session;
    $scope.$on('$ionicView.enter', function(){
        data = $localstorage.getData();
        session = $key_data.createSession();
        data = $key_data.addDailyUse(data, session);
    });

    $ionicPlatform.ready(function() {
        $scope.playTrack = function(char, key){
            // keep track of each char pressed
            // assume key for 'a' = 1
            session.char[key - 1]++;
            $audioPlayer.play(char, key);
            // update session the database
            session.end = new Date();
            data = $key_data.updateDailyUse(data, session);
            $localstorage.saveData(data);
        }
    });
})

.controller('chooseListCtrl', function($scope, $localstorage, $state, GameDataCreator, $key_data) {
    $scope.$on('$ionicView.enter', function() {
        $scope.lists = $localstorage.getAllLists();
    });
    $scope.chosenList = function(id) {
        // Store the data of the upcoming game into the db,
        // under the key 'current_game'
        var game = GameDataCreator.createGameData($localstorage.getList(id));
        var data = $localstorage.getData();
        [data, index] = $key_data.addGame(data, game);
        game.index = index;
        console.log(index);
        data = $key_data.updateGame(data, game);
        $localstorage.saveData(data);
        $localstorage.saveCurrentGame(game);
        $state.go("app.gamePad");
    }
})

.controller('gamePad', function($scope, $localstorage, $state, $audioPlayer, WordSetup, $key_data) {
    var first, gameData, index, startTime;
    // nextModal is used for the visibility of the the
    // "next" button, which enables the user to go
    // to the next word
    $scope.nextModal = false;

    // load all the data when entering the modal
    $scope.$on('$ionicView.enter', function() {
        $scope.nextModal = false;
        $scope.styles = [];
        gameData = $localstorage.getCurrentGame();
        // If there are still words to guess, select the next
        // one randomly
        if(gameData.activeWords > 0) {
            // get a random word
            var rand = Math.floor(gameData.activeWords * Math.random());
            var iterator = 0;
            index = 0;
            for(var i in gameData.words) {
                if (!gameData.words[i].played && rand == iterator){
                    // the correct index found!
                    index = i;
                }
                if (!gameData.words[i].played){
                    // increase iterator, since this is a correct index
                    iterator++;
                }
            }
            $scope.word = gameData.words[index].word;
            // now get the first char of the word
            // and generate 8 other random cars
            first = (gameData.words[index].word.charAt(0)).toUpperCase();
            // give the data to the scope
            $scope.chars = WordSetup.createRandomCharArray(first);
            // create the styles for the buttons
            for (var i in $scope.chars){
                $scope.styles.push({
                    'background-color': ''
                });
            }
            gameData.activeWords--;
            // change played = true
            gameData.words[index].played = true;
            startTime = new Date();
            // update localstorage game
            $localstorage.saveCurrentGame(gameData);
            // update the gameData
            var data = $localstorage.getData();
            data = $key_data.updateGame(data, gameData);
            $localstorage.saveData(data);
        } else {
            // game is finished, save time and go to summary
            // update statiscs data and safe (as usual)
            gameData.endTime = (new Date).getTime();
            gameData.finished = true;
            var data = $localstorage.getData();
            data = $key_data.updateGame(data, gameData);
            $localstorage.saveData(data);
            $localstorage.saveCurrentGame(gameData);
            $state.go("app.summary");
        }
    });
    $scope.$on('ionicView.leave', function() {
        if(gameData){
            var data = $localstorage.getData();
            data = $key_data.updateGame(data, gameData);
            $localstorage.saveData(data);
        }
    })

    $scope.playImage = function(word){
        /* This function plays the sound of the word
         * word must not contain the path and the
         * file-ending, jsut the name: eg."dog"
         * will play www/data/audio/dog.wav
         */
        if($scope.nextModal){
            $audioPlayer.play(word, word);
            return;
        }
    }

    $scope.showIcon = function(c) {
        // hides all the Icons of empty chars,
        // at the end of the game
        return c != ' ' && $scope.nextModal && c == first;
    }

    $scope.checkChar = function(c, pos) {
        /* checkChar = function(char c, int pos)
         * This function controlls, what should happen
         * if the user clicks a button/char on the
         * gamePad
         *
         * If the Game is over (nextModal == true)
         * then it shouldn't play any character
         * sound ut the correct one -> first
         * If the game isn't over, it should
         * hide 6 characters if it's the first
         * attempt, or show the result, if it's
         * the second attempt
         * The function also updates the
         * gamestatus accordingly
         */
        if($scope.nextModal) {
            if(c == first){
                $audioPlayer.play(c.toLowerCase(), c.toLowerCase());
                return;
            }
        }
        // do nothing if empty button is clicked
        if(c == ' ' || $scope.nextModal){
            return;
        }

        // if code gets here, attempt was made
        gameData.words[index].attempts++;
        // safe/update the time needed for the word
        gameData.words[index].time = (new Date()).getTime() - startTime.getTime();

        if(c == first){
            // correct guess!
            $scope.styles[pos] = {'background-color' : 'green'};
            $scope.nextModal = true;
            gameData.words[index].solved = true;
            $localstorage.saveCurrentGame(gameData);
            WordSetup.replaceAllButCorrect($scope.chars, first);
        } else {
            if (gameData.words[index].attempts < 2 && !$scope.correct){
                // wrong guess, but not 2 attempts yet
                $localstorage.saveCurrentGame(gameData);
                WordSetup.replaceSixChars($scope.chars, first);
            } else {
                // all attempts made
                $scope.nextModal = true;

                // check if the clicked button is a character
                if(c.match(/[A-Z]/i)) {
                    // turn the clicked character red
                    $scope.styles[pos] = {'background-color' : 'red'};

                    // search for the correct character and make it green
                    for (var i in $scope.chars){
                        if ($scope.chars[i] === first){
                            $scope.styles[i] = {'background-color' : 'green'};
                            break;
                        }
                    }
                }
            }
        }
    }

    $scope.next = function() {
        // update the gameData
        if(gameData){
            var data = $localstorage.getData();
            data = $key_data.updateGame(data, gameData);
            $localstorage.saveData(data);
        }
        // check if speakCheck should be done
        var settings = $localstorage.getObject('settings');
        // check if user has an active speakCheck, if so
        // go to speakcheck page
        if (settings.speakCheck){
            $state.transitionTo('app.speakCheck', {id : index});
        } else {
            $state.transitionTo('app.gamePad', null, {reload: true, notify:true});
        }
    }
})

.controller('speakCheckCtrl', function($scope, $state, $localstorage, $stateParams, $key_data) {
    $scope.check = function(answer) {
        if(answer){
            // set word to correct
            game = $localstorage.getCurrentGame();
            index = $stateParams.id;
            game.words[index].saidCorrectly = true;
            var data = $localstorage.getData();
            data = $key_data.updateGame(data, game);
            $localstorage.saveData(data);
            $localstorage.saveCurrentGame(game);
            $state.go('app.gamePad', null, {reload: true, notify:true});
        } else {
            // set word to false
            $state.go('app.gamePad', null, {reload: true, notify:true});
        }
    }
})

.controller('summaryCtrl', function($scope, $localstorage, $state, GameDataCreator) {
    var data;
    var correct;
    var wrong;
    var saidCorrectly;
    $scope.$on('$ionicView.enter', function() {
        // reset all data
        data = {};
        correct = [0,0]; // [0],[1] correct on 1st,2nd attempt
        wrong = [0,0]; // same here
        saidCorrectly = 0;

        // get the current state of the game from the db
        data = $localstorage.getObject('current_game');

        // parse the words
        for(var i = 0, len = data.words.length; i < len; i++){
            word = data.words[i];
            if(word.solved){
                if(word.attempts < 2){
                    correct[0]++;
                } else {
                    correct[1]++;
                }
            } else {
                if(word.attempts == 1){
                    wrong[0]++;
                } else {
                    wrong[1]++;
                }
            }
            if(word.saidCorrectly){
                saidCorrectly++;
            }
        }

        $scope.correct = correct[0];
        $scope.withHelp = correct[1];
        $scope.wrong = wrong[0] + wrong[1];
        $scope.saidCorrectly = saidCorrectly;
    });

    $scope.redo = function(){
        $localstorage.setObject('current_game',
            GameDataCreator.createGameData($localstorage.getList(data.id)));
        $state.go('app.gamePad', null, {reload: true, notify:true});
    }

    $scope.otherList = function() {
        $state.go('app.chooseList', null, {reload: true, notify:true});
    }

    $scope.home = function() {
        $state.go('app.start', null, {reload: true, notify:true});
    }
})

.controller('manageCtrl', function($scope, $ionicHistory, $localstorage, $state, $window) {
    $scope.delete = function() {
        localStorage.clear();
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        location.reload();
    }
    $scope.lists = $localstorage.getAllLists();
    var settings;
    $scope.$on('$ionicView.enter', function() {
        $scope.lists = $localstorage.getAllLists();
        var settings = $localstorage.getObject('settings');
        // check if var settings ins empty
        if (Object.keys(settings).length == 0){
            // create new settings object
            settings = {
                speakCheck : true
            }
            // save it in localstorage
            $localstorage.setObject('settings', settings);
        }
        $scope.settings = settings;
    });

    if($scope.lists.length > 0){
        var selected = $scope.lists[0];
    }

    $scope.select = function(ListID) {
        selected = ListID;
    }

     $scope.editList = function() {
        console.log(selected)
        $state.go('app.editList', { ListID: selected , reload : true})
    }

    $scope.add = function() {
        $state.go('app.addList', {reload: true , reload : true})
    }

    $scope.deleteList = function() {
        localStorage.removeItem(selected);
        $window.location.reload();
    }
})

.controller('addListCtrl', function($scope, $http, $ionicPlatform, $localstorage, $window, $state) {
    var words = [];
    $scope.$on('$ionicView.enter', function() {
        $scope.newList = {};
        $http.get('data/words.json').success(function(data) {
            $scope.words = data;
        });
        $scope.checked = false;
    });

    // localStorage for words
    var words = [];
    $scope.addWord = function(word) {
        var found = false;
        for(var i = 0; i < words.length; i++){
            if(word.localeCompare(words[i]) == 0) {
                found = true;
                words.splice(i, 1);
                break;
            }
       }
       if(!found) {
            words.push(word);
       }
    }

    $scope.saveObj = function() {
        var _id = new Date().getTime();
        // prepare an arr containing all words
        // in order to safe them into the db
        tmp_words = [];
        for(var i = 0; i < words.length; i++){
            tmp_words.push(words[i].word);
        }

        // save to db
        $localstorage.setObject(_id, {
            type: 'List',
            _id : _id,
            name : $scope.newList.name,
            words : words
        });
        $state.go('app.settings');
    };

    $scope.abort = function() {
        $state.go('app.settings');
    }
})

.controller('editListCtrl', function($scope, $http, $localstorage, $ionicPlatform, $stateParams, $state, $window) {

    $scope.list = $localstorage.getList($stateParams.ListID);
    // get the words and set the words from the list as checked
    $http.get('data/words.json').success(function(data) {
        var all_words = data;
        // create a array with the words as objects
        var words = [];
        for(var i = 0, len = all_words.length; i < len; i++){
            words.push({word: all_words[i], checked: false});
        }
        // get all words from the list
        var checkedWords = $scope.list.words;
        // mark the checkedWords in the words[]
        for (var i in checkedWords) {
            cword = checkedWords[i];
            for(var j in words){
                if(cword.localeCompare(words[j].word) === 0){
                    words[j].checked = true;
                }
            }
        }
        // update the scope
        $scope.words = words;
        });

    $scope.save = function(){
        words = [];
        //for(var i in $scope.words){
        for(var i = 0, len = $scope.words.length; i < len; i++){
            if($scope.words[i].checked === true){
                words.push($scope.words[i].word);
            }
        }
        $scope.list.words = words;
        $localstorage.setObject($scope.list._id, $scope.list);
        $state.go("app.settings");
    }
    $scope.abort = function() {
        $scope.list = ''
        $state.go("app.settings");
    }
})



.controller('StatCtrl', function($scope, $localstorage, $key_data, $ionicPlatform) {
    $ionicPlatform.ready(function(){
        var data = $localstorage.getData();
        $scope.NumDailyUse = $key_data.getNumDailyUse(data);
        $scope.TimeDailyUseMinutes = $key_data.getTimeDailyUseMinutes(data);
        $scope.MostPractisedWord = $key_data.getMostPractisedWord(data);
        $scope.TopCorrectWord = $key_data.getTopCorrectWord(data);
        $scope.TopWrongWord = $key_data.getTopWrongWord(data);
        $scope.NumPractiseStarted = $key_data.getNumPractiseStarted(data);
        $scope.NumPractiseFinished = $key_data.getNumPractiseFinished(data);
        $scope.PractiseByDay = $key_data.getPractiseByDay(data);
        $scope.DailyUseCharStatistics = $key_data.getDailyUseCharStatistics(data);
        $scope.DailyUseByDay = $key_data.getDailyUseByDay(data);

    })

    // Here the Charts for the Statistics Page are created:
    // Docs and sources:
    //      http://www.chartjs.org/
    //      https://github.com/gonewandering/angles

    // Pie-Chart for the Practises by
    // Day
    $scope.pracByDayOptions =
        {
            responsive: true,
            maintainAspectRatio: true,
            scaleShowLine : true,
            scaleShowLabels : false,
            angleLineWidth : 1,
            pointLabelFontStyle : "bold",
            pointDot : true,
            pointDotRadius : 1,
        }
    $scope.pracByDayData = {
        labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        datasets :
        [{
          data: $scope.PractiseByDay,
          fillColor: "rgba(186, 238, 241, 0.2)",
          strokeColor: "rgba(220,220,220,0.8)",
          pointColor: "rgba(220,220,220,0.8)",
          pointStrokeColor: "#3181d4",
          pointHighlightFill: "#124af1",
          pointHighlightStroke: "rgba(110, 48, 48, 0.8)",
          }]
        };

    // Bar Chart for started/finished
    // Practises
    $scope.barOptions = {

    };
    $scope.barChart = {
        labels : ["Started","Finished"],
        datasets :
        [{
            fillColor : "rgba(0, 170, 255, 0.4)",
            data : [$scope.NumPractiseStarted, $scope.NumPractiseFinished]
        }],
    }

    // daily use by day distribution
    $scope.useByDayOptions =
        {
            responsive: true,
            maintainAspectRatio: true,
            scaleShowLine : true,
            scaleShowLabels : false,
            angleLineWidth : 1,
            pointLabelFontStyle : "bold",
            pointDot : true,
            pointDotRadius : 1,
        }
    $scope.useByDayData =
        {
            labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            datasets :
            [{
              data: $scope.DailyUseByDay,
              fillColor: "rgba(186, 238, 241, 0.2)",
              strokeColor: "rgba(220,220,220,0.8)",
              pointColor: "rgba(220,220,220,0.8)",
              pointStrokeColor: "#3181d4",
              pointHighlightFill: "#124af1",
              pointHighlightStroke: "rgba(110, 48, 48, 0.8)",
            }]
    };
    // Daily Usedata
    // Barchart for all the caracters
    $scope.charStatisticsOpt = {
        responsive: true,
        maintainAspectRatio: true,
    };

    // an Array holding all chars from A - Z
    // for the label of the barchart
    var char_arr = [];
    for(var i = 0; i < 26; i++){
        char_arr.push(String.fromCharCode(65+i));
    }
    $scope.charStatisticsData = {
        labels : char_arr,
        datasets :
        [{
            fillColor: "rgba(30, 105, 204, 0.7)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: $scope.DailyUseCharStatistics,
        }]
    };
})

.controller('settingsCtrl', function($localstorage, $scope){
    $scope.clickWordSpeak = function() {
        $scope.settings.speakCheck = !$scope.settings.speakCheck;
        $localstorage.setObject('settings', $scope.settings);
    }
})
