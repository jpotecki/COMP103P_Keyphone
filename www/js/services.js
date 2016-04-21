/* Written by Janos Potecki
 * University College London Term 2/3 - 2015/2016
 * for Course: COMP103P
 * www.github.com/jpotecki
 * janos dot potecki dot 15 et ucl dot ac dot uk
 */
angular.module('app.services', [])

.factory('$key_data', [function($scope){
        /* Factory Data
         *
         * createData : function()
         *  Creates an obj Data
         *      {
         *          obj     gamesArchive
         *          obj[]   dailyUseSessions
         *      }
         * getNumDailyUse : function(data)
         *  Return the total amount of how often
         *  the user started practising the
         *  dailyUse
         *
         * getTimeDailyUse : function(data) :
         *  Returns the total time the user spend
         *  practising the dailyUse
         *
         * getDailyUseArr : function(data)
         *  returns an obj[] which contains details
         *  for each day practising daily use
         *
         * getDailyUseCharStatistics : function(data)
         *  Retunrs an obj[] where the number of
         *  clicks per character are listed
         *
         * getNumPractiseStarted : function(data)
         *  returns the total amount of practises the
         *  user started
         *
         * getNumPractiseFinished : function(data)
         *  returns the total amount of practises the
         *  user started but hasn't finished
         *
         * getMostPractisedWord : function(data)
         *  returns an string[] word, which contains
         *  the mostly practised words, eg.:
         *      if the data contains hat::3 , fish::3,
         *                           tiger :: 2, egg::1
         *  it returns [hat, fish]
         *
         * getTopCorrectWord : function(data)
         *  returns an array with the words, which where
         *  guessed the most time correct
         *
         * getTopWrongWord : function(data)
         *  returns an array with the most incorrect words
         *
         * getPractiseByDay : function()
         *  returns an int[] where arr[0] is sunday
         *  and arr[1] monday .. arr[6] saturday
         *
         * addGame : function (obj game, obj data) :
         *  takes a game and adds it to the obj data
         *  and returns the updated data obj
         *
         * getDailyUseCharStatistics : function(data)
         *  same as getPractiseByDay just for the daily
         *  uses.
         *
         * addDailyPractise : function (data, practise)
         *  adds a daily practise to the dataset and
         *  returns the dataset
         *
         * startDailyPractise : function (data)
         *  Increases the internal counter for
         *  the daily practises
         */

         //TODO return the statistics of (in)correct said words
         return {
             createData : function() {
                 var data = {};
                 data.gamesArchive = [];
                 data.dailyUseSessions = [];
                 return data;
             },
             createSession : function (){
                 var practise = {};
                 practise.begin = new Date();
                 practise.end = new Date();
                 // create an array for each char
                 practise.char = Array.apply(null, Array(26)).map(function (x, i){return 0});
                 return practise;
             },
             updateDailyUse : function (data, session){
                 var index = data.dailyUseSessions.length -1;
                 data.dailyUseSessions[index] = session;
                 return data;
             },
             getNumDailyUse : function(data){
                return data.dailyUseSessions.length;
             },
             getTimeDailyUse : function(data) {
                //return data.timeDailyUse;
             },
             getTimeDailyUseMinutes : function(data) {
                var time = 0;
                sessions = data.dailyUseSessions;
                for(var i = 0; i < sessions.length; i++){
                    if(sessions[i].end == 0)
                        continue;
                    var begin = new Date (Date.parse(sessions[i].begin)).getTime();
                    var end = new Date(Date.parse(sessions[i].end)).getTime();
                    time += end - begin;
                }
                time /= 1000 * 60;
                return Math.floor(time * 100) / 100;
             },
             getDailyUseArr : function(data) {
                 return data.dailyUseSessions;
             },
             getDailyUseCharStatistics : function(data) {
                 var arr = []
                 var sessions = data.dailyUseSessions;
                 for(var i = 0; i < 26; i++){
                     arr[i] = 0;
                     for(var j = 0; j < sessions.length; j++){
                         arr[i] += sessions[j].char[i];
                     }
                 }
                 return arr;
             },
             getNumPractiseStarted : function(data){
                 return data.gamesArchive.length;
             },
             getNumPractiseFinished : function(data){
                var counter = 0;
                for (var i = 0, len = data.gamesArchive.length; i < len; i++){
                    if(data.gamesArchive[i].finished){
                        counter++;
                    }
                }
                return counter;
             },
             getMostPractisedWord : function(data){
                 var dic = {};
                 games = data.gamesArchive;
                 for(var i = 0; i < games.length; i++){
                     words = games[i].words;
                     for(var j = 0; j < words.length; j++){
                         var w = words[j];
                         if (w.played){
                             dic[w.word] ? dic[w.word]++ : dic[w.word] = 1;
                         }
                     }
                 }
                 var arr = [];
                 for(var key in dic){
                     arr.push({num :dic[key], word : key});
                 }
                 arr.sort(function(x, y){
                     return y.num - x.num;
                 });
                 string_arr = []
                 for(i = 0; i < arr.length; i++){
                     if(arr[0].num != arr[i].num)
                        break;
                    string_arr.push(arr[i].word);
                 }
                 return string_arr;
             },
             getTopCorrectWord : function(data) {
                 var dic = {};
                 games = data.gamesArchive;
                 for(var i = 0; i < games.length; i++){
                     words = games[i].words;
                     for(var j = 0; j < words.length; j++){
                         var w = words[j];
                         if (w.solved){
                             dic[w.word] ? dic[w.word]++ : dic[w.word] = 1;
                         }
                     }
                 }
                 var arr = [];
                 for(var key in dic){
                     arr.push({num :dic[key], word : key});
                 }
                 arr.sort(function(x, y){
                     return y.num - x.num;
                 });
                 string_arr = []
                 for(i = 0; i < arr.length; i++){
                     if(arr[0].num != arr[i].num)
                        break;
                    string_arr.push(arr[i].word);
                 }
                 return string_arr;
             },
             getTopWrongWord : function(data){
                 var dic = {};
                 games = data.gamesArchive;
                 for(var i = 0; i < games.length; i++){
                     words = games[i].words;
                     for(var j = 0; j < words.length; j++){
                         var w = words[j];
                         if (!w.solved && w.played){
                             dic[w.word] ? dic[w.word]++ : dic[w.word] = 1;
                         }
                     }
                 }
                 var arr = [];
                 for(var key in dic){
                     arr.push({num :dic[key], word : key});
                 }
                 arr.sort(function(x, y){
                     return y.num - x.num;
                 });
                 string_arr = []
                 for(i = 0; i < arr.length; i++){
                     if(arr[0].num != arr[i].num)
                        break;
                    string_arr.push(arr[i].word);
                 }
                 return string_arr;
             },
             getPractiseByDay : function(data){
                 var week = [0,0,0,0,0,0,0];
                 var games = data.gamesArchive;
                 for(var i = 0; i < games.length; i++){
                    var day = new Date(Date.parse(games[i].startTime)).getDay();
                    week[day]++;
                 }
                 return week;
             },
             getDailyUseByDay : function(data){
                 var week = [0,0,0,0,0,0,0];
                 var uses = data.dailyUseSessions;
                 for(var i = 0; i < uses.length; i++){
                    var day = new Date(Date.parse(uses[i].begin)).getDay();
                    week[day]++;
                 }
                 return week;
             },
             addDailyUse : function(data, dayuse){
                 data.dailyUseSessions.push(dayuse);
                 dayuse.end = new Date();
                 begin = dayuse.begin.getTime();
                 end = dayuse.end.getTime();
                 data.timeDailyUse += end - begin;
                 return data;
             },
             updateGame : function(data, game){
                 game.endTime = new Date();
                 var index = game.index;
                 if(index >= 0){
                     data.gamesArchive[index] = game;
                 } else {
                     game.index =  data.gamesArchive.length;
                     data.gamesArchive.push(game);
                 }
                 console.log(data);
                 return data;
             },
             addGame : function(data, game){
                 data.gamesArchive.push(game);
                 // return data and the index of the
                 // game
                 return [data, data.gamesArchive.length -1];
             }
         }
}])

.factory('WordSetup', [function($scope){
    /* Factory WordSetup
     * This is the main factory which manipulates the gamepad, where the user
     * guesses the words of the pictures.
     * The main functions are
     * createRandomCharArray : function(char c):
     *     Returns a function with 9 random Characters,
     *     which include the character c passed as an
     *     argument into the function
     *
     * replaceSixChars : function(char[] arr,char first):
     *     Takes a char[] "arr" and replaces 6 characters
     *     randomly with " ". The char "first" is excluded
     *     and won't be replaced.
     *
     * replaceAllButCorrect : function(char[] arr,char first):
     *     Takes a char[] "arr" and a char "first" and replaces
     *     all characters in arr with " " except first
     */
  return {
    createRandomCharArray : function(first) {
      var nineChars = [];
        var pool = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
        // delete the first char from the pool
        for(var i in pool) {
            if(first == pool[i]){
                pool.splice(i, 1);
                break;
            }
        }
        // generate the other 8 chars from the pool and add them
        // to nineChars[]
        for(var i = 0; i < 8; i++){
            var pool_index = Math.floor(pool.length * Math.random());
            // remove the char at pool_index and save as c
            var c = pool.splice(pool_index, 1);
            // insert c into nineChars at pos
            nineChars.splice(0, 0, c[0]);
        }
        // generate a random position in nineChars and add first
        // there
        var pos = Math.floor(8 * Math.random());
        nineChars.splice(pos, 0, first);
        return nineChars;
    },
    replaceSixChars : function(arr, first) {
      // i is the counter, how many chars we
      // have already replaced
      var i = 0;
      while (i < 6) {
        // generate random number
        var rand = Math.floor(arr.length * Math.random());
        // check if the char at the position is not already
        // empty or is the char first
        if (arr[rand] != " " && arr[rand] != first){
          // replace the character by " " and increase i
          i++;
          arr[rand] = " ";
        }
      }
      return arr;
    },
    replaceAllButCorrect : function(arr, first) {
        for(var i = 0; i < arr.length; i++){
            if(arr[i] != first){
                arr[i] = " ";
            }
        }
    }
  }
}])

.factory('GameDataCreator', [function($scope){
    /* Factory GameDataCreator
     * This factory creates the object, which is managing the
     * the gamePad data and returns it:
     * createGameData: function(obj list)
     *    obj list:
     *    {
     *    type : String,
     *    _id  : Number,
     *    name : String,
     *    words: String[]
     *    }
     * RETURN:
     *    obj
     *      {
     *            int id
     *            int startTime
     *            int endTime
     *            string name
     *            int activeWords
     *            bool finished
     *            [obj] words :
     *                {
     *                    int time
     *                    string word
     *                    bool played
     *                    bool solved
     *                    int attempts
     *                    bool saidCorrectly
     *                }
     *         }
     */
  return {
    createGameData: function(list) {
      var gameData = {};
      gameData.id = list._id;
      // when created, save here the index in the
      // data arr, in order to update the correct
      // game
      gameData.index;
      gameData.startTime = new Date();
      gameData.endTime;
      gameData.name = list.name;
      gameData.activeWords = list.words.length;
      gameData.finished = false;
      gameData.words = [];
      for(var i = 0; i < list.words.length; i++) {
        w = {};
        w.time = 0;
        w.word = list.words[i];
        w.played = false;
        w.solved = false;
        w.attempts = 0;
        w.saidCorrectly = false;
        gameData.words.push(w);
      }
      return gameData;
    }
  }
}])

.factory('$audioPlayer', [function($scope){
    /* Factory $audioPlayer
     * This factory is used to play audio on the devices.
     * In order to play audio on iOS and Android devices,
     * it is necessary to install Cordovana NativeAudio
     * plugin.
     *
     * play: function(string track, key) :
     *      Takes the string track, which is just the name
     *      without the file ending and a random key, which
     *      is needed by NativeAudio to manage the played
     *      tracks. If the function is called, the
     *      track is played ONCE
     */

  // intern object to manage the playing songs/tracks
  var player = {
    key : ''
  };
  return {
    player : player,
    play: function(track, key) {
        // set the path where the files are located
        // and add the file ending
        var track = 'data/audio/' + track + '.wav';
        // if platform is iOS/Android, use NativeAudio
        if(ionic.Platform.isAndroid() ||
           ionic.Platform.isIOS()){
            // check if the track is already loaded
            // in the player, if TRUE, just play the song
            if(player.key == key){
                window.plugins.NativeAudio.play(key);
            } else{
                    // check, if there is a loaded song in the
                    // player and unload the track
                    if(player.key != '') {
                        window.plugins.NativeAudio.unload(player.key);
                    }
                    // preload and play the audiofile
                    window.plugins.NativeAudio.preloadSimple(key, track, function(msg) {
                        //console.log('status: ' + msg);
                        player.key = key;
                        window.plugins.NativeAudio.play(key);
                    }, function(msg) {
                        console.log('error: ' + msg);
                    });
            }
        // if not in iOS/Android,just play the
        // file with javascript
        } else {
            (new Audio(track)).play();
        }
    }
  }
}])

.factory('$localstorage', ['$window', function($window){
  /* Factory $localstorage
   * This factory manages saving all the data in any kind of
   * database. Currently, just localStorage is used.
   * The App requires the following 4 functions:
   *    setObject: function(cstring key, obj value)
   *        The object value must be transformable to
   *        to a json-string
   *
   *    getObject: function(key)
   *        Reads an entry from the database with the
   *        key. Transforms the Json object from the
   *        db into a javascript object. If there is no
   *        object with this key, it returns an empty
   *        object.
   *
   *    getAllLists: function()
   *        Returns an array of all lists from the
   *        database.
   *        obj list:
   *            {
   *                string type
   *                int _id
   *                string name
   *                string[] words
   *            }
   *    getData : function()
   *        Takes the data out from the database,
   *        if there doesn't exist any, it creates
   *        one and returns it
   *
   *    saveData : function(data)
   *        saves the data object into the database
   *
   *    getList: function(int id)
   *        Returns the List with the ID or an empty obj
   *
   *    getCurrentGame : function() :
   *        Returns the current practiseSession
   *
   *    saveCurrentGame : function(game)
   *        saves the current Game in the db
   */
  return {
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    getAllLists: function() {
      var words = [];
      for (var i in localStorage){
            // just in case there are "non-jsons in the local-storage"
            try {
                    item = JSON.parse(localStorage.getItem(i));
                    if (item.type === "List"){
                            words.push(item);
                    }
                } catch (err) {
                    //console.warn("not a json: [" + localStorage.getItem(i) + "] ...deleted");
                    localStorage.removeItem(i);
                }
      }
      return words;
    },
    getData : function() {
        return JSON.parse($window.localStorage['keyphone_data'] || '{}');
    },
    saveData : function(data){
        $window.localStorage['keyphone_data'] = JSON.stringify(data);
    },
    getCurrentGame : function() {
        return JSON.parse($window.localStorage['current_game'] || '{}');
    },
    saveCurrentGame : function(game){
        $window.localStorage['current_game'] = JSON.stringify(game);
    },
    getList: function(id) {
      return JSON.parse($window.localStorage[id] || '{}');
    }
  }
}]);
