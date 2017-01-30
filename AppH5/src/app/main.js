var App = {};
var VARS = {
  currDate: undefined // Fecha de Hoy
};

App.ServerURL = "";

App.isInitialized = false;

App.API_URL = "http://apisclp.wareqbe.com/";

App.LOGIN = {
  TOKEN: '',
  //Datos de permisos de la aplicacion
  client_id: '4',
  client_secret: '89ZiaavOZl3QvE48QmfHfpjLWb3qednAz90fzLsr'
};

App.CONFIG = {
  ID_Movil: undefined,
  LecturistaID: 0,
  isInternetActive: true,
  isGPSActive: false,
  LastTOKEN: '',
  timeOutGpsReCall: 1000,  //3mins
  timeSendGPS: 3,
  timeSaveData2Server:2
};

App.DB = undefined;
App.DATOS = {};

App.initApp = _.debounce(function() {
  if (App.isInitialized) {
    return;
  }
  App.isInitialized = true;
  if (typeof cordova !== "undefined" && cordova.platformId && cordova.platformId == 'android') {
    StatusBar.backgroundColorByHexString("#0277bd");
  }

  App.DB = new PouchDB('lmap.db');/*{
    adapter: 'websql'
  }*/

  VARS.currDate = moment().format('YYYY-MM-DD');





  document.addEventListener("online", App.onOnline, false);
  document.addEventListener("offline", App.onOffline, false);

  if(navigator.connection.type !== Connection.NONE){
    App.CONFIG.isInternetActive = true;
  }else{
    App.CONFIG.isInternetActive = false;
  }



  App.DB.get('last-lecturista-id').then(function(t) {
    App.CONFIG.LecturistaID = t.LecturistaID;
  }).catch(function(e){console.log(e);});

  App.DB.get('last-token').then(function(t) {
    App.CONFIG.LastTOKEN = t.token;
  }).catch(function(e){console.log(e);});

  App.DB.get('recorridos')
    .then(function(r) {
      App.DATOS.recorridos = r;
      App.DATOS.recorridos.downAgain = false;
      if (r.date !== VARS.currDate) {
        App.DATOS.recorridos.downAgain = true;
      }
    })
    .catch(function(err) {
    });

  App.DATOS.lecturas = {
    _id: 'lecturas',
    data: []
  };

  App.DB.get('lecturas')
    .then(function(l) {
      App.DATOS.lecturas = l;
    })
    .catch(function(err) {
      App.DB.put(App.DATOS.lecturas).then(function(l) {
        App.DATOS.lecturas.rev = l._rev;
      }).catch(function(e){console.log(e);});
    });


  App.login = new App.Login();
  $('#app').append(App.login.render().$el);

  App.menu = new App.Menu();
  $('#app').append(App.menu.render().$el);

  /*App.map = new App.Map();
  $('#app').append(App.map.render().$el);*/

  App.rutas = new App.Rutas();
  $('#app').append(App.rutas.render().$el);

  App.predioLectura = new App.PredioLectura();
  $('#app').append(App.predioLectura.render().$el);
  App.predioLectura.activate();

  App.panelSettings = new App.PanelSettings();
  $('#app').append(App.panelSettings.render().$el);
  App.panelSettings.activate();


  App.DB.get('id-equipo')
    .then(function(e) {
      $('#inpIdEquipo').val(e.id_equipo);
      //App.LOGIN.client_id = e.id_equipo;
      App.CONFIG.ID_Movil = e.id_equipo;
    }).catch(function(e){console.log(e);});

  $('#inpTimeGPS').val(App.CONFIG.timeSendGPS);
  App.DB.get('time-send-gps').then(function(t) {
    App.CONFIG.timeSendGPS = t.minutes;
    $('#inpTimeGPS').val(App.CONFIG.timeSendGPS);
  }).catch(function(e){console.log(e);});


  App.BK.enableBK();
  App.BK.saveDB2Server();

  App.loadMapsApi();


}, 1000);

App.initialize = function() {
  App.bindEvents();
};

App.onOnline = function() {
  App.CONFIG.isInternetActive = true;
  if (typeof cordova !== "undefined" && cordova.platformId && cordova.platformId == 'android') {
    StatusBar.backgroundColorByHexString("#0277bd");
  }
  Materialize.toast('Con conexión a internet', 2000, 'light-blue darken-3');
};

App.onOffline = function() {
  App.CONFIG.isInternetActive = false;
  if (typeof cordova !== "undefined" && cordova.platformId && cordova.platformId == 'android') {
    StatusBar.backgroundColorByHexString("#ff3d00");
  }
  Materialize.toast('Sin conexión a internet', 2000, 'deep-orange accent-3');
};

App.loadMapsApi = function() {
  if (window.google !== undefined && window.google.maps !== undefined) {
    return;
  }
  //$.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false');
  $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAoXiiqp3RP3WY9Nd-brwRH5QTCJaVmEh8&sensor=true&callback=App.predioLectura.initMap');
};

App.bindEvents = function() {
  // 'load', 'deviceready', 'offline', and 'online'.
  document.addEventListener('deviceready', App.initApp, true);
};






jQuery(document).ready(function() {
  App.initialize();
});

(function() {
  App.initApp();
})();
