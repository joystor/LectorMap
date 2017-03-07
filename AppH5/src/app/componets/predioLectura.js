(function() {
  'use strict';
  App.PredioLectura = Backbone.View.extend({
    id: 'pPredioLectura',
    tagName: 'div',
    className: '',
    template: window.templates.panelInfo,
    currentRuta:undefined,
    navigator:{
      last:undefined,
      current:undefined
    },
    gmap: undefined,
    currPredioMarkerPos:undefined,
    initialize: function() {
    },
    render: function() {
      var htmlOutput = this.template();
      this.$el.html(htmlOutput);
      return this;
    },
    activate: function() {
      $('#button-collapse').sideNav({
        menuWidth: '100%',
        edge: 'right',
        closeOnClick: false,
        draggable: true
        }
      );

     $('#pPredioLectura ul.tabs').tabs();
     $('#selTipInc').material_select();
     $('.material-select').material_select('destroy');
     $('.material-select').material_select();
    },
    initMap: function(){
      App.predioLectura.gmap = new google.maps.Map(document.getElementById('mapPredio'), {
        center: {
          lat: 19.5364786,
          lng: -99.194413
        },
        zoom: 11,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false
      });

      google.maps.event.addDomListener(window, "resize", function() {
        App.predioLectura.onMapResize();
      });
    },
    events: {
      "click #btnCapt": "btnCapt",
      "click #btnRegresar": "btnRegresar",
      "click #btnFoto": "btnFoto",
      "click #btnSaveLectura": "saveLectura",
      "click #btnConfirmSaveData": "confirmarEnvio",
      "click #btnLastPredio": "showLastPredio",
      "click #btnNextPredio": "showNextPredio",
      "click #btnShowMapPredio": "showMapPredio",
      "change input[name=tiplect]": "selTipoLectura"
    },
    cleanForms:function(){
      $('#pPredioLectura input[type="radio"]').prop('checked', false);
      $('#pPredioLectura input[type="text"]').val('');
      $('#pPredioLectura input').prop('disabled', false);
      $('#pPredioLectura textarea').val('');
      $('#btnSaveLectura').removeClass('disabled');
      $('#secDatosLectura input').prop('disabled', false);
      $('#inpObserv').prop('disabled', false);
      $('#secDatosLectura label').removeClass('active');
      $('#btnFoto').removeClass('disabled');
      $('#selTipInc').material_select('destroy');
      $('#selTipInc').val('');
      $('#selTipInc').prop('disabled',false);
      $('#selTipInc').material_select();
      $('.material-select').val('');
      $('.material-select').prop('disabled',false);
      $('.material-select').material_select('destroy');
      $('.material-select').material_select();
      $('#secPhoto').html('');
      $('#pInfoClient').html('');
    },

    btnFoto: function(){
      if($('#btnFoto').hasClass('disabled')===true){
        return;
      }
      navigator.camera.getPicture(App.predioLectura.cameraSuccess, App.predioLectura.cameraError, {});
    },

    cameraSuccess:function(imageURI){
      App.predioLectura.addPhoto(imageURI);
    },
    cameraError:function(){
    },

    addPhoto:function(imageURI){
      var id = moment().unix();
      var html = '<div id="id_foto_'+id+'" class="secFoto card blue-grey darken-1" >'+
            '<div class="card-image">'+
            ' <img id="img_foto_'+id+'" class="imgFoto2Save" src="'+imageURI+'">'+
            '</div>'+
            '<div class="card-action">'+
            '<a href="#" class="btnFotoEvnt" data-id="'+id+'"><i class="material-icons" style="width:initial">clear</i>Eliminar</a>'+
            '</div>'+
            '</div>';
      $('#secPhoto').append(html);
      App.predioLectura.regRemoveFotoEvent();
    },
    regRemoveFotoEvent:_.debounce(function(){
      $('.btnFotoEvnt').off('click').on('click',function(){
        var id = $(this).data('id');
        $('#id_foto_'+id).remove();
      });
    },1000),

    setActualRecorrido: function(id){
      var self = this;
      self.currentRuta = _.find(App.DATOS.recorridos.data,{ruta:String(id)});
      self.navigator.current = -1;
      self.navigator.last = -1;
      $('#btnNextPredio').removeClass('disabled');
      self.showNextPredio();
    },

    showLastPredio: function(){
      var self = this;
      if(self.navigator.current<=0 ){
        $('#button-collapse').sideNav('hide');
        return;
      }
      $('#btnNextPredio').removeClass('disabled');
      self.navigator.current=self.navigator.current-2;
      self.showNextPredio();
    },
    loadPredioData:function(){
      $('#btnSaveLectura').removeClass('disabled');
      var self = this;
      var currPred = self.currentRuta.recorrido[self.navigator.current];
      if(currPred){
        var currLect = _.findWhere(App.DATOS.lecturas.data,{
          recorrido_id: currPred.id,
          fecha: VARS.currDate,
          ruta_id: App.predioLectura.currentRuta.ruta,
          have_error: undefined
        });
        if(currLect){
          $('#selTipInc').material_select('destroy');
          $('#selTipInc').val(currLect.anomalia);

          $('#inplect').val(currLect.lectura);

          currLect.imagenes.forEach(function(img) {
            App.predioLectura.addPhoto( img );
          });

          $('.material-select').material_select('destroy');
          _.each(currLect.cambios_selects, function(v,i) {
            $('#'+i).val(v);
          });

          if(currLect.have_error!==true){
            $('#inplect').prop('disabled',true);
            $('.material-select').prop('disabled',true);
            $('.btnFotoEvnt').hide();
            $('#selTipInc').prop('disabled',true);
            $('#btnSaveLectura').addClass('disabled');
          }
          $('#selTipInc').material_select();
          $('.material-select').material_select();
        }
      }

    },

    showNextPredio: function(){
      var self = this;
      if(self.navigator.current===(self.currentRuta.recorrido.length-1) ){
        $('#button-collapse').sideNav('hide');
        return;
      }/*else{
        $('#btnNextPredio').removeClass('disabled');
      }*/
      App.predioLectura.cleanForms();
      self.navigator.current++;
      var currPred = self.currentRuta.recorrido[self.navigator.current];
      if(currPred){
        $('#pInfoPredio1').html(
          '<strong>Folio:</strong> '+currPred.folio
        );
        $('#pInfoPredio2').html(
          '<strong>'+(self.navigator.current+1)+'/</strong> '+self.currentRuta.recorrido.length
        );
        $('#pInfoPredio3').html(
          '<strong>Cliente:</strong> '+ currPred.nombre_cliente +
          '<br/><strong>Dirección:</strong> '+ currPred.direccion
        );

        var dat2show = ['lecturista','ruta','folio','nombre_cliente','colonia',
                        'direccion','predio','cuenta_anterior','clave_catastral',
                        'medidor_marca','medidor_serie','limite_inferior','limite_superior',
                        'lectura_actual','consumo_anterior'
                      ];

        $('#pInfoClient').html('');
        dat2show.forEach(function(i){
          if(currPred[i]!== undefined){
            var col = i.charAt(0).toUpperCase() + i.slice(1);
            col = col.replace('_', ' ');
            $('#pInfoClient').append('<strong>'+col+': </strong>'+currPred[i]+'<br/>');
          }
        });

        self.setPredioPosition(currPred);

      }else{
        self.navigator.current--;
      }
      if(self.navigator.current===(self.currentRuta.recorrido.length-1) ){
        //$('#btnNextPredio').addClass('disabled');
      }
      self.loadPredioData();
    },


    saveLectura: function(){
      if($('#btnSaveLectura').hasClass('disabled')===true){
        return;
      }
      if($('#inplect').val() === ''){
        Materialize.toast('Agrega una lectura', 2000, 'red');
        return;
      }
      $('#modalConfirData').openModal();
    },

    confirmarEnvio: function(){
      var lect = {
        tipo:1,
        lectura: $('#inplect').val(),
        incidencia:0
      };
      lect.anomalia = $('#selTipInc option:checked').val() || '0';

      lect.posicion_xy = App.GPS.currPos.lng+','+App.GPS.currPos.lat;
      lect.ruta_id = App.predioLectura.currentRuta.ruta;
      lect.recorrido_id = App.predioLectura.currentRuta.recorrido[App.predioLectura.navigator.current].id;
      //lect.predio_id = App.predioLectura.currentRuta.recorrido[App.predioLectura.navigator.current].id;
      lect.folio = App.predioLectura.currentRuta.recorrido[App.predioLectura.navigator.current].folio;
      lect.is_saved = false;
      lect.is_img_saved = false;
      lect.fecha = VARS.currDate;
      lect.imagenes = [];

      var i=0;
      var imgs = document.getElementsByClassName('imgFoto2Save');
      for(i = 0; i < imgs.length; i++){
        lect.imagenes.push( imgs.item(i).src );
      }

      lect.cambios_selects = {};
      var sels = $('select.material-select');
      sels.each(function(){
        lect.cambios_selects[this.id] = ($('#'+this.id+' option:checked').val() || '0');
      });

      if(imgs.length === 0){
        lect.is_img_saved = true;
      }

      /*{
  "recorrido_id": "2",
  "lecwebclave": 0,
  "cliclave": "987654",
  "idsmartphone": "2544",
  "predio": "123456",
  "vivienda": "0",
  "toma": "1",
  "cuenta_anterior": "01001001",
  "lectura": "99970",
  "anomalia": "3",
  "lecturista": "856524",
  "cambio_condiciondevivienda": "1",
  "cambio_direccion": "Número oficial cambió de 373 a 375-A",
  "cambio_edificacion": "0",
  "cambio_electronico": "",
  "cambio_giro": "0",
  "cambio_serieprecinto": "44444",
  "cambio_precintocolor": "0",
  "cambio_serie": "",
  "reporte_situacioncomercial": "1",
  "reporte_gestion": "7",
  "cambio_usodeservicio": "2",
  "cambio_clavecatastral": "",
  "fueralimite": "0",
  "intentos": "2",
  "tipolec": "2",
  "cambio_ubicaciondelmedidor": "0",
  "alerta": "0",
  "comentario_alerta": "",
  "fotografia1": 0,
  "fotografia2": 0,
  "fotografia3": 0,
  "fotografia4": 0,
  "fotografia5": 0,
  "ubicacion_xy": "5440.0000154,5440.0000154",
}*/

      App.DATOS.lecturas.data.push(lect);
      App.DB.get('lecturas').then(function(l){
        l.data = App.DATOS.lecturas.data;
        App.DB.put(l)
          .then(function (l) {
            App.DATOS.lecturas._rev = l.rev;
            Materialize.toast('Lectura guardada en local', 2000, 'teal darken-1');
            App.BK.proccessNextLectura();
          })
          .catch(function(e){console.log(e);});
      })
      .catch(function(e){console.log(e);});

      $('#btnSaveLectura').addClass('disabled');
      //$('#button-collapse').sideNav('hide');
    },

    onMapResize: function(){
      var center = App.predioLectura.gmap.getCenter();
      $('#mapPredio').css('height',$(window).height()-$('#mapPredio').position().top-50);
      google.maps.event.trigger(App.predioLectura.gmap, "resize");
      App.predioLectura.gmap.setCenter(center);
    },
    showMapPredio:function(){
      App.predioLectura.onMapResize();
    },

    createMarkerPredio:function(){
      App.predioLectura.currPredioMarkerPos= new google.maps.Marker({
        map: App.predioLectura.gmap,
        icon: 'http://maps.google.com/mapfiles/kml/pal4/icon25.png'
      });
    },
    setPredioPosition:function(currPred){
      if( App.predioLectura.currPredioMarkerPos===undefined){
        App.predioLectura.createMarkerPredio();
      }
      var lat = currPred.ubicacion_y;
      var lng = currPred.ubicacion_x;
      if(lat==='0' || lng === '0'){
        lat = 19.5364786;
        lng = -99.194413;
      }else{
        lat = parseFloat(lat);
        lng = parseFloat(lng);
      }
      var latlng = new google.maps.LatLng( lat, lng);
      App.predioLectura.setPredioLatLon(latlng);
    },
    setPredioLatLon: function(latlng){
      App.predioLectura.gmap.setZoom( 17 );
      App.predioLectura.currPredioMarkerPos.setPosition( latlng );
      App.predioLectura.gmap.setCenter( latlng );
    }
  });
})();
