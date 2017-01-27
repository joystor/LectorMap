(function() {
  'use strict';

  App.Map = Backbone.View.extend({
    id: 'pMap',
    tagName: 'div',
    className: '',
    template: window.templates.map,
    currPos:{
      watchId: 0,
      latlng: undefined,
      marker: undefined,
      lat:undefined,
      lng:undefined
    },
    rutasMarkers:[],
    initialize: function() {
    },
    render: function() {
      var htmlOutput = this.template();
      this.$el.html(htmlOutput);
      return this;
    },
    activate: function() {
      if(typeof google === 'undefined'){
        return;
      }
      console.log('creating google maps');
      var self = this;
      App.gmap = new google.maps.Map(document.getElementById('map_canvas'), {
        center: {
          lat: 19.4342,
          lng: -99.1379
        },
        zoom: 11,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false
      });
      google.maps.event.addDomListener(window, "resize", function() {
        self.onMapResize();
      });

      self.onMapInit();
    },
    onMapResize: function(){
      var center = App.gmap.getCenter();
      $('#pMap').css("height",$(window).height()-$('#pMenu').height());
      $('#map_canvas').css("height",$(window).height()-$('#pMenu').height());
      google.maps.event.trigger(App.gmap, "resize");
      App.gmap.setCenter(center);
    },
    events: {
      //"click #btnLogIn": "login"
    },
    onMapInit: function(){
      App.map.setMarkerPosition();
      navigator.geolocation.getCurrentPosition(App.map.getCurrentPosition, App.map.onErrorGetPosition);
      App.map.currPos.watchId = navigator.geolocation.watchPosition(App.map.onWatchPosition, App.map.onErrorGetPosition, {
        timeout: App.CONFIG.timeOutGpsReCall,
        enableHighAccuracy: true
      });
      App.map.syncRutas();
    },
    syncRutas: function(){
      App.map.rutasMarkers.forEach(function(o,idx){
        o.setMap(null);
        o = null;
      });
      App.map.rutasMarkers = [];
      App.API.getRutasLect({
        id: App.CONFIG.ID_Movil,
        onSuccess:function(response){
          if(response==='0'){
            Materialize.toast('Sin rutas asignadas para hoy', 4000, 'red');
            return;
          }
          if(response && response.length > 0){
            Materialize.toast('Leyendo recorridos', 2000, 'blue darken-1');
            App.DATOS.recorridos = {
              _id: 'recorridos',
              _rev: App.DATOS.recorridos? App.DATOS.recorridos._rev : undefined,
              date: VARS.currDate,
              data: response
            };
            if(App.DATOS.recorridos._rev === undefined){
              delete App.DATOS.recorridos._rev;
            }
            App.DB.put(App.DATOS.recorridos)
              .then(function (response) {
                App.map.setRutas();
              })
              .catch(function (err) {
                console.log(err);
              });

          }else{
            Materialize.toast('Sin recorridos', 4000, 'red');
          }
        },
        onCache: function(){
          Materialize.toast('Recorridos en cache', 2000, 'teal darken-1');
          App.map.setRutas();
        },
        onError:function(err){
          Materialize.toast('Sin recorridos', 4000, 'red');
        }
      });
    },
    setMarkerPosition:function(){
      App.map.currPos.marker = new google.maps.Marker({
        map: App.gmap,
        icon: 'http://maps.google.com/mapfiles/kml/pal4/icon25.png'
      });
    },
    setRutas:function(){
      var pinColor = "FE7569";
      var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          new google.maps.Size(21, 34),
          new google.maps.Point(0,0),
          new google.maps.Point(10, 34));
      var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
          new google.maps.Size(40, 37),
          new google.maps.Point(0, 0),
          new google.maps.Point(12, 35));
      var bounds = new google.maps.LatLngBounds();
      var lat = 21.8852562;
      var lng = -102.29156770000003;
      _.each(App.DATOS.recorridos.data,function(o){
        lat += 0.0001;
        lng -= 0.0001;
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat,lng),
          map: App.gmap,
          icon: pinImage,
          shadow: pinShadow,
          info: o
        });
        marker.addListener('click', function(m) {
          App.map.onChooseMarker(this);
        });
        bounds.extend(marker.getPosition());

        App.map.rutasMarkers.push(marker);

        var pF = _.findWhere(App.DATOS.predios.data,{id: o.predio_id});
        if(pF === undefined){
          App.API.getPredio({
            id: o.predio_id,
            onSuccess:function(p){
              if(p){
                App.DATOS.predios.data.push(p[0]);
                App.map.savePredios();
              }
            },
            onError:function(e){
              console.log(e);
            }
          });
        }
      });
      App.gmap.fitBounds(bounds);
      App.DATOS.recorridos.bounds = bounds;
    },
    savePredios:_.debounce(function(){
      App.DB.put(App.DATOS.predios)
        .then(function (p) {
          App.DATOS.predios._rev = p.rev;
          Materialize.toast('Predios guardados', 2000, 'teal darken-1');
        })
        .catch(function (err) {
          console.log(err);
        });
    },5000),
    getCurrentPosition: function(position){
      var lat=position.coords.latitude;
      var lng=position.coords.longitude;
      var latlng = new google.maps.LatLng(lat,lng);
      App.map.currPos.lat = lat;
      App.map.currPos.lng = lng;
      App.map.currPos.marker.setPosition( latlng );
      App.gmap.setCenter( latlng );
    },
    onChooseMarker: function(marker){
      $('#button-collapse').sideNav('show');
      $('#secInfo').show();
      App.panelInfo.readPredio(marker.info);
    },
    onWatchPosition: function(position){
      App.CONFIG.isGPSActive = true;
      $('#btnMyLocation').show();
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      App.map.currPos.lat = lat;
      App.map.currPos.lng = lng;
      App.map.currPos.latlng = new google.maps.LatLng(lat,lng);
      App.map.currPos.marker.setMap(App.gmap);
      App.map.currPos.marker.setPosition( App.map.currPos.latlng );
    },
    onErrorGetPosition:function(error){
      App.CONFIG.isGPSActive = false;
      $('#btnMyLocation').hide();
      console.log('code: ' + error.code + '\n' + ' message: ' + error.message + '\n');
      if(App.map.currPos && App.map.currPos.marker){
        App.map.currPos.marker.setMap(null);
      }
    }

  });

})();
