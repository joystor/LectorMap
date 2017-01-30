(function() {
  'use strict';

  App.GPS = {
    currPos:{},
    init:function(){
      App.GPS.currPos.watchId = navigator.geolocation.watchPosition(App.GPS.onWatchPosition, App.GPS.onErrorGetPosition, {
        timeout: App.CONFIG.timeOutGpsReCall,
        enableHighAccuracy: true
      });
    },
    onWatchPosition: function(position){
      App.CONFIG.isGPSActive = true;
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      App.GPS.currPos.lat = lat;
      App.GPS.currPos.lng = lng;
    }
  };

  App.GPS.init();

})();
