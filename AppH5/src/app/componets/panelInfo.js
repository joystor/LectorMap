(function() {
  'use strict';
  App.PanelInfo = Backbone.View.extend({
    id: 'pPanelInfo',
    tagName: 'div',
    className: '',
    template: window.templates.panelInfo,
    currPredio:undefined,
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

     $('#pPanelInfo ul.tabs').tabs();
     $('#selTipInc').material_select();
     $('.material-select').material_select();
    },
    events: {
      "click #btnCapt": "btnCapt",
      "click #btnRegresar": "btnRegresar",
      "click #btnFoto": "btnFoto",
      "click #btnSaveLectura": "saveLectura",
      "click #btnConfirmSaveData": "confirmarEnvio",
      "change input[name=tiplect]": "selTipoLectura"
    },
    btnCapt: function(){
      $('#secInfo').hide();
      $('#secCapt').show();
      $('#secName').html('Datos del predio');
      //if($('input[name="tiplect"]:checked').val()==='l'){
        $('#secLectAnt').show();
      /*}else{
        $('#secLectAnt').hide();
      }*/
    },
    btnRegresar: function(){
      if($('#secInfo').is(':visible')){
        $('#button-collapse').sideNav('hide');
      }
      if($('#secCapt').is(':visible')){
        $('#secName').html('DCI:');
        $('#secCapt').hide();
        $('#secInfo').show();
      }
    },
    btnFoto: function(){
      if($('#btnFoto').hasClass('disabled')===true){
        return;
      }

      /*if( $('input[name=tiplect]:checked').val()==='o' && $('.secFoto').length ===5 ){
        Materialize.toast('Solo puedes agregar hasta 5 fotos', 2000, 'orange');
        return;
      }*/
      /*if( $('input[name=tiplect]:checked').val()==='l' && $('.secFoto').length ===3 ){
        Materialize.toast('Solo puedes agregar hasta 3 fotos', 2000, 'orange');
        return;
      }*/
      navigator.camera.getPicture(App.panelInfo.cameraSuccess, App.panelInfo.cameraError, {});
    },
    cameraSuccess:function(imageURI){
      App.panelInfo.addPhoto(imageURI);
    },
    cameraError:function(){

    },

    readPredio:function(ruta){
      $('#pPanelInfo input[type="radio"]').prop('checked', false);
      $('#pPanelInfo input[type="text"]').val('');
      $('#pPanelInfo textarea').val('');
      $('#btnSaveLectura').removeClass('disabled');
      $('#secDatosLectura input').prop('disabled', false);
      $('#inpObserv').prop('disabled', false);
      $('#secDatosLectura label').removeClass('active');
      $('#btnFoto').removeClass('disabled');
      $('#secCapInc').hide();
      //$('#secTipInc').hide();
      //$('#secCapLec').hide();
      //$('#secFoto').hide();
      //$('#inpObs').hide();
      $('#secPhoto').html('');

      $('#pPanelInfo ul.tabs').removeClass('active');
      $('#tabInfo').addClass('active');
      $('#pPanelInfo ul.tabs').tabs('select_tab', 'stInfo');

      App.API.getPredio({
        id:ruta.predio_id,
        onSuccess:function(p){
          if(!p){
            Materialize.toast('Sin datos del predio', 4000, 'red');
            return;
          }
          var pred = p[0];
          App.panelInfo.currPredio = pred;
          App.panelInfo.currPredio.recorrido_id = ruta.id;
          $('#shFolio').html('<strong>Folio:</strong> '+pred.folio+
            '<br/><strong>Dirección:</strong> '+ pred.direccion);

          $('#pInfoClient').html( '<strong>Folio:</strong> '+pred.folio+
            '<br/><strong>Cliente:</strong> '+pred.cliente[0].nombre+' '+pred.cliente[0].apellidos +
            '<br/><strong>Dirección:</strong> '+ pred.direccion
          );
          if(pred.telefono){
            $('#pInfoClient').append( '<br/><strong>Teléfono:</strong> '+pred.telefono);
          }
          if(pred.lectura_anterior){
            $('#pInfoClient').append( '<br/><strong>Lectura anterior:</strong> '+pred.lectura_anterior);
          }
          if(pred.tipo_servicio==='1'){
            $('#pInfoClient').append( '<br/><strong>Tipo de Servicio: </strong>Normal');
          }else if(pred.tipo_servicio==='2'){
            $('#pInfoClient').append( '<br/><strong>Tipo de Servicio: </strong>Incidencia');
          }


          var lect = _.findWhere(App.DATOS.lecturas.data, {folio:pred.folio, fecha: VARS.currDate});
          if(lect){
            //$('#secFoto').show();
            //if(lect.tipo===1){
              $('#radLect').prop('checked',true);
              $('#inplect').val(lect.lectura);
              $('#secCapInc').hide();
              //$('#secTipInc').hide();
              //$('#secCapLec').show();
              //$('#inpObs').show();
              //$('#inpObserv').val(lect.observaciones);
            /*}else if(lect.tipo===2){
              $('#radInc').prop('checked',true);
              $('#inpinc').val(lect.incidencia);
              $('#secCapLec').hide();
              $('#secCapInc').show();
              $('#secTipInc').show();
              $('#inpObs').hide();
              $('#selTipInc').val(lect.observaciones);
              $('#selTipInc').material_select();
            }*/

            $('#selTipInc').val(lect.observaciones);
            $('#selTipInc').material_select();

            lect.imagenes.forEach(function(img) {
              App.panelInfo.addPhoto( img );
            });
            $('.btnFotoEvnt').hide();
            $('#secDatosLectura input').prop('disabled', true);
            $('#secDatosLectura label').addClass('active');
            //$('#inpObserv').prop('disabled', true);
            $('#btnFoto').addClass('disabled');
            $('#btnSaveLectura').addClass('disabled');
          }


        }
      });
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
      //var image = document.getElementById("img_foto_"+id);
      //image.src = imageURI;
      App.panelInfo.regRemoveFotoEvent();
    },
    regRemoveFotoEvent:_.debounce(function(){
      $('.btnFotoEvnt').off('click').on('click',function(){
        var id = $(this).data('id');
        $('#id_foto_'+id).remove();
      });
    },1000),

    selTipoLectura:function(evt){
      //if(evt.target.value==='l'){
        //$('#secCapInc').hide();
        //$('#secTipInc').hide();
        //$('#secCapLec').show();
        //$('#inpObs').show();
      //}else{
        //$('#secCapLec').hide();
        //$('#secCapInc').show();
        //$('#secTipInc').show();
        //$('#inpObs').hide();
      //}
    },

    saveLectura:function(){

      if($('#btnSaveLectura').hasClass('disabled')===true){
        return;
      }

      /*if($('input[name=tiplect]:checked').val()===undefined){
        Materialize.toast('Selecciona el tipo de lectura', 2000, 'red');
        return;
      }
      if($('input[name=tiplect]:checked').val()==='o'){
        if( $('#inpinc').val() === '' ){
          Materialize.toast('Agrega la incidencia', 2000, 'red');
          return;
        }
        if( $('#selTipInc option:checked').val() === '' ){
          Materialize.toast('Seleccione el tipo de incidencia', 2000, 'red');
          return;
        }
      }*/
      //if($('input[name=tiplect]:checked').val()==='l'){
        if($('#inplect').val() === ''){
          Materialize.toast('Agrega una lectura', 2000, 'red');
          return;
        }
      //}

      $('#modalConfirData').openModal();

    },

    confirmarEnvio: function(){

      var lect = {};

      /*if($('input[name=tiplect]:checked').val()==='o'){
        if( $('#inpinc').val() !== '' ){
          lect = {
            tipo:2,
            incidencia: $('#inpinc').val(),
            lectura:''
          };
        }
        lect.observaciones = $('#selTipInc option:checked').val() || '';
      }*/
      //if($('input[name=tiplect]:checked').val()==='l'){
        //if($('#inplect').val() !== ''){
          lect = {
            tipo:1,
            lectura: $('#inplect').val(),
            incidencia:'',
          };
        //}
        //lect.observaciones = $('#inpObserv').val() || '';
        lect.observaciones = $('#selTipInc option:checked').val() || '';
      //}

      lect.posicion_xy = App.map.currPos.lng+','+App.map.currPos.lat;
      lect.recorrido_id = App.panelInfo.currPredio.recorrido_id;
      lect.folio = App.panelInfo.currPredio.folio;
      lect.is_saved = false;
      lect.is_img_saved = false;
      lect.fecha = VARS.currDate;
      lect.imagenes = [];

      var imgs = document.getElementsByClassName('imgFoto2Save');
      for(var i = 0; i < imgs.length; i++){
        lect.imagenes.push( imgs.item(i).src );
      }

      if(imgs.length === 0){
        lect.is_img_saved = true;
      }

      App.DATOS.lecturas.data.push(lect);
      App.DB.get('lecturas').then(function(l){
        l.data = App.DATOS.lecturas.data;
        App.DB.put(l)
          .then(function (l) {
            App.DATOS.lecturas._rev = l.rev;
            Materialize.toast('Lectura agregada', 2000, 'teal darken-1');
            App.BK.proccessNextLectura();
          })
          .catch(function(e){console.log(e);});
      })
      .catch(function(e){console.log(e);});

      $('#btnSaveLectura').addClass('disabled');
      $('#button-collapse').sideNav('hide');
    }
  });
})();
