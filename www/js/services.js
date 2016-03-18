angular.module('app.services', [])

.factory('$audioPlayer', [function($scope){
  var player = {
    key : ''
  };


  return {
    player : player,
    play: function(track, key) {
      if(player.key != key){
                if(player.key != '') {
                    window.plugins.NativeAudio.unload(player.key);
                }
                // preload the audiofile
                window.plugins.NativeAudio.preloadSimple(key, track, function(msg) {
                    console.log('status: ' + msg);
                    player.key = key;
                    window.plugins.NativeAudio.play(key);
                }, function(msg){
                    console.log('error: ' + msg);
                });
            } else {
                window.plugins.NativeAudio.play(key);
            }
    }
  }
}])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },

    getAllLists: function() {
      var words = [];
      for (var i in localStorage){
        console.log(localStorage.getItem(i));
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
}])



.service('BlankService', [function(){

}]);

