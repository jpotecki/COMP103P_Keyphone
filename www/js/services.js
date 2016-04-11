angular.module('app.services', [])

// TODO: collect data on every click and send it AWS endpoint

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
      gameData.startTime = (new Date).getTime();
      gameData.endTime;
      gameData.name = list.name;
      gameData.activeWords = list.words.length;
      gameData.finished = false;
      gameData.words = [];
      for(var i = 0; i<list.words.length; i++) {
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
   *
   *    getList: function(int id)
   *        Returns the List with the ID or an empty obj
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
                    console.warn("not a json: [" + localStorage.getItem(i) + "] ...deleted");
                    localStorage.removeItem(i);
                }
      }
      return words;
    },
    getList: function(id) {
      return JSON.parse($window.localStorage[id] || '{}');
    }
  }
}]);
