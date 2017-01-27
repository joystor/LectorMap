(function() {
  'use strict';

  App.Rutas = Backbone.View.extend({
    id: 'pRutas',
    tagName: 'div',
    className: '',
    template: window.templates.rutas,
    initialize: function() {
    },
    render: function() {
      var htmlOutput = this.template();
      this.$el.html(htmlOutput);
      return this;
    },
    activate: function() {
    },
    events: {
    },
    readRutas: function(){

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
                App.rutas.showRutas();

              })
              .catch(function (err) {
                console.log(err);
              });

          }else{
            Materialize.toast('Sin rutas', 4000, 'red');
          }
        },
        onCache: function(){
          Materialize.toast('Rutas en cache', 2000, 'teal darken-1');
          App.rutas.showRutas();
        },
        onError:function(err){
          Materialize.toast('Sin recorridos', 4000, 'red');
        }
      });
    },
    showRutas:function(){
      $('#listRecorridos').html('');
      _.each(App.DATOS.recorridos.data, function(o){
        var cant = o.ruta.length;
        var html = '<div class="row">'+
            '  <div class="col s12 m6">'+
            '    <div class="card '+(cant===0?'red lighten-1':'blue-grey darken-1')+'">'+
            '      <div class="card-content white-text">'+
            '        <span class="card-title">'+o.descripcion+'</span>'+
            '        <p>'+o.fecha+'</p>'+
            '      </div>'+
            '      <div class="card-action">'+
            '        <a data-idruta="'+o.id+'" data-cantpred="'+cant+'" class="show-clientes" href="#">'+(cant===0?'Sin clientes':'Mostrar clientes ('+cant+')')+'</a>'+
            '      </div>'+
            '    </div>'+
            '  </div>'+
            '</div>';
        $('#listRecorridos').append(html);
        /*App.API.getRutas({
          id: o.id,
          onSuccess:function(p){
            if(p){
              App.DATOS.rutas.data.push(p);
              App.rutas.saveRutas();
            }
          },
          onError:function(e){
            console.log(e);
          }
        });*/
      });
      App.rutas.regEventShowClientes();
    },

    saveRutas: _.debounce(function(){
      App.DB.put(App.DATOS.rutas)
        .then(function (p) {
          App.DATOS.rutas._rev = p.rev;
          Materialize.toast('Rutas guardadas', 2000, 'teal darken-1');
        })
        .catch(function (err) {
          console.log(err);
        });
    },5000),

    regEventShowClientes: function(){
      $('a.show-clientes').off('click').on('click',function(){
        var id = $(this).data('idruta');
        var cant = $(this).data('cantpred');
        if(cant===0){
          Materialize.toast('Sin Clientes a tomar lectura', 2000, 'red');
        }else if(cant>0){
          console.log(id);
        }
      });
    }
  });

})();
