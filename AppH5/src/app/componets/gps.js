(function() {
  'use strict';

  App.GPS = {
    currPos:{
      lat:19.4342,
      lng:-99.1379
    },
    init:function(){
      App.GPS.currPos.watchId = navigator.geolocation.watchPosition(App.GPS.onWatchPosition, App.GPS.onErrorGetPosition, {
        timeout: App.CONFIG.timeOutGpsReCall,
        enableHighAccuracy: true
      });
    },
    onWatchPosition: function(position){
      App.CONFIG.isGPSActive = true;
      App.GPS.currPos.lat = position.coords.latitude;
      App.GPS.currPos.lng = position.coords.longitude;
    }
  };

  App.GPS.init();

})();
