angular.module('app.controllers', [])

.controller('startCtrl', function($scope) {

})

.controller('dailyUseCtrl', function($scope, $ionicPlatform, $audioPlayer) {
    $ionicPlatform.ready(function() {
        $scope.playTrack = $audioPlayer.play;
    })
})

.controller('chooseListCtrl', function($scope, $localstorage, $state, GameDataCreator) {
    $scope.$on('$ionicView.enter', function() {
        $scope.lists = $localstorage.getAllLists();
    });
    $scope.chosenList = function(id) {
        // Store the data of the upcoming game into the db,
        // under the key 'current_game'
        $localstorage.setObject('current_game',
            GameDataCreator.createGameData($localstorage.getList(id)));
        $state.go("app.gamePad");
    }
})

.controller('gamePad', function($scope, $localstorage, $state, $audioPlayer, WordSetup) {
    var first, gameData, index, startTime;
    // nextModal is used for the visibility of the the
    // "next" button, which enables the user to go
    // to the next word
    $scope.nextModal = false;

    // load all the data when entering the modal
    $scope.$on('$ionicView.enter', function() {
        $scope.nextModal = false;
        $scope.styles = [];
        gameData = $localstorage.getObject('current_game');
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
            $scope.word = (gameData.words[index].word);
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
            startTime = (new Date()).getTime();
            // update localstorage game
            $localstorage.setObject('current_game', gameData);
        } else {
            // game is finished, save time and go to summary
            gameData.endTime = (new Date).getTime();
            $localstorage.setObject('current_game', gameData);
            $state.go("app.summary");
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
                $audioPlayer.play(c, c);
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
        gameData.words[index].time = (new Date()).getTime() - startTime;

        if(c == first){
            // correct guess!
            $scope.styles[pos] = {'background-color' : 'green'};
            $scope.nextModal = true;
            gameData.words[index].solved = true;
            $localstorage.setObject('current_game', gameData);
            WordSetup.replaceAllButCorrect($scope.chars, first);
        } else {
            if (gameData.words[index].attempts < 2 && !$scope.correct){
                // wrong guess, but not 2 attempts yet
                $localstorage.setObject('current_game', gameData);
                WordSetup.replaceSixChars($scope.chars, first);
            } else {
                // all attempts made
                $scope.nextModal = true;
                if(c.match(/[A-Z]/i)) {
                    $scope.styles[pos] = {'background-color' : 'red'};
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
        // check if speakCheck should be done
        var settings = $localstorage.getObject('settings');
        if (settings.speakCheck){
            $state.transitionTo('app.speakCheck');
        } else {
            $state.transitionTo('app.gamePad', null, {reload: true, notify:true});
        }
    }
})

.controller('settingsCtrl', function($scope, $ionicHistory, $localstorage, $state, $window) {
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
        console.log(selected);
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

    $scope.clickWordSpeak = function() {
        $scope.settings.speakCheck = !$scope.settings.speakCheck;
        console.log($scope.settings);
        $localstorage.setObject('settings', $scope.settings);
    }
})

.controller('page20Ctrl', function($scope) {
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
        for(var i in all_words){
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
        $scope.words = words;
        });

    $scope.save = function(){
        words = [];
        for(var i in $scope.words){
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

.controller('addWordsCtrl', function($scope) {

})

.controller('AppCtrl', function($scope) {

})

.controller('speakCheckCtrl', function($scope, $state) {
    // plugin for text - 2 - speech
    //http://devgirl.org/2016/01/08/speaking-with-cordova/

    $scope.check = function(x) {
        if(x){
            // set word to correct
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


        data = $localstorage.getObject('current_game');
        for(var i = 0, len = data.words.length; i < len; i++){
            word = data.words[i];
            console.log(word);
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
