(function() {
  'use strict';

  App.API = {

    getRutasLect: function(options){
      //No hay recorridos
      if( !App.DATOS.recorridos || App.DATOS.recorridos.downAgain===true){
        if(options.id===undefined){
          Materialize.toast('Falta asignar ID del equipo', 4000, 'red');
          return;
        }
        this.mapApiCall({
          url:"api/rutaslect/"+options.id,
          onSuccess:function(response){
            options.onSuccess(response);
          },
          onError:function(err){
            options.onError(err);
          },
          method:'GET'
        });
      }else{
        options.onCache();
      }
    },


    getRutas: function(options){
      //No hay recorridos
      /*if( !App.DATOS.rutas || App.DATOS.recorridos.downAgain===true){
        if(options.id===undefined){
          Materialize.toast('Falta asignar ID del equipo', 4000, 'red');
          return;
        }*/
        this.mapApiCall({
          url:"api/ruta/"+options.id,
          onSuccess:function(response){
            options.onSuccess(response);
          },
          onError:function(err){
            options.onError(err);
          },
          method:'GET'
        });
      /*}else{
        options.onCache();
      }*/
    },

    getPredio: function(options){
      var pF = _.findWhere(App.DATOS.predios.data,{id: options.id});
      if(pF !== undefined){
        options.onSuccess([pF]);
      }else{
        this.mapApiCall({
          url:"api/predio/"+options.id,
          onSuccess:function(response){
            options.onSuccess(response);
          },
          onError:function(err){
            options.onError(err);
          },
          method:'GET'
        });
      }
    },

    getRastreos: function(options){
      this.mapApiCall({
        url:"api/rastreos/"+options.id,
        onSuccess:function(response){
          console.log(response);
        },
        onError:function(err){
          console.log(err);
        },
        method:'GET'
      });
    },

    setLectura: function(options){
      this.mapApiCall({
        url:"api/lectura",
        data:options.data,
        onSuccess: options.onSuccess,
        onError: options.onError,
        method:'POST'
      });
    },

    setImagen: function(options){
      if( App.CONFIG.isInternetActive === false ){
        Materialize.toast('Se necesita conección a internet', 4000, 'red');
        return;
      }
      if(App.LOGIN.TOKEN==='' && App.CONFIG.LastTOKEN===''){
        return;
      }
      var token = App.LOGIN.TOKEN;
      if(token === ''){
        token = App.CONFIG.LastTOKEN;
      }

      $.ajax({
        url: App.API_URL + 'api/imagen',
        data: options.formData,
        type: 'POST',
        contentType: false,
        processData: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-Type', "application/json");
          xhr.setRequestHeader('Authorization', "Bearer " + token);
        },
        success: function (response) {
          options.onSuccess(response);
        },
        error: function(jqXHR,textStatus,errorThrown){
          options.onError(errorThrown);
        }
      });
    },

    setRastreo: function(options){
      this.mapApiCall({
        url:"api/rastreo/"+options.id,
        data: options.data,
        onSuccess: options.onSuccess,
        onError: options.onError,
        method:'POST'
      });
    },

    getLecturistaId: function(options){
      this.mapApiCall({
        url:"api/lecturista",
        onSuccess: options.onSuccess,
        onError: function(e){
          console.log('getLecturista ERROR');
          console.log(e);
        },
        method:'GET'
      });
    },

    mapApiCall: function(options){
      if( App.CONFIG.isInternetActive === false ){
        Materialize.toast('Se necesita conección a internet', 4000, 'red');
        return;
      }
      if(App.LOGIN.TOKEN==='' && App.CONFIG.LastTOKEN===''){
        return;
      }
      var token = App.LOGIN.TOKEN;
      if(token === ''){
        token = App.CONFIG.LastTOKEN;
      }
      var ops = {
          url: App.API_URL + options.url,
          type : options.method,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-Type', "application/json");
            xhr.setRequestHeader('Authorization', "Bearer " + token);
          },
          success: function (response) {
            options.onSuccess(response);
          },
          error: function(jqXHR,textStatus,errorThrown){
            options.onError(errorThrown);
          }
      };
      //Datos Lectura
      if(options.data){
        ops.data = JSON.stringify(options.data);
        ops.dataType = 'json';
        ops.contentType = 'application/json; charset=utf-8';
      }
      $.ajax(ops);
    }
  };

})();
