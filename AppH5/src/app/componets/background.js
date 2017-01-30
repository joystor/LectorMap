(function() {
  'use strict';

  App.BK = {
    proccessNextLectura: function() {
      var lect = _.find(App.DATOS.lecturas.data, function(o) {
        return o.is_saved === false;
      });
      if (lect) {
        App.API.setLectura({
          data: {
            tipo: lect.tipo,
            folio: lect.folio,
            lectura: lect.lectura,
            //anomalia: lect.anomalia,
            posicion_xy: lect.posicion_xy,
            recorrido_id: lect.recorrido_id,
            idsmartphone: App.CONFIG.ID_Movil,
            incidencia: lect.anomalia

            //"vivienda": "0",
            //"toma": "1",
            //"intentos": "2",
            //"alerta": "0",
            //"comentario_alerta": "",
            // NO "ubicacion_xy": lect.posicion_xy

            //Excluir
            /*"lecwebclave": 0,
             "cliclave": "987654",
             "predio": "123456",
              "lecturista": "856524",
              "cuenta_anterior": "01001001",


            "recorrido_id": "2",
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
            "ubicacion_xy": lect.posicion_xy*/
          },
          onSuccess: function(o) {
            lect.lectura_id = o.id;
            lect.is_saved = true;
            Materialize.toast('Lectura con folio:' + lect.folio + " en servidor", 2000, 'blue-grey');
            App.DB.put(App.DATOS.lecturas)
              .then(function(l) {
                App.DATOS.lecturas._rev = l.rev;
                App.BK.proccessImagenes();
              });
          },
          onError: function(err) {
            console.log(err);
          }
        });
      }
    },


    promiseReadFile: function(imgURI) {
      var prom = new Promise(function(resolve, reject) {
        var fail = function(e) {
          reject(e);
        };
        var gotFile = function(fileEntry) {
          fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
              var content = this.result;
              resolve(content);
            };
            reader.readAsDataURL(file);
          });
        };
        window.resolveLocalFileSystemURL(imgURI, gotFile, fail);
      });
      return prom;
    },


    dataURItoBlob: function(dataURI) {
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {
        type: mimeString
      });
    },


    proccessImagenes: function() {
      var lect = _.find(App.DATOS.lecturas.data, function(o) {
        return o.is_saved === true && o.is_img_saved===false && o.imagenes.length > 0;
      });
      if (lect) {
        var formData = new FormData();
        formData.append('lectura_id', lect.lectura_id);

        lect.imagenes.forEach(function(img) {
          var rF = App.BK.promiseReadFile(img);

          rF.then(function(imgbase64) {
              var jpg = App.BK.dataURItoBlob(imgbase64);
              formData.append('imagen', jpg);
              App.BK.prepareImagenes(formData, lect);
            })
            .catch(function(err) {
              console.log(err);
            });
        });
        App.BK.sendImagenes(formData, lect);
      }
    },


    prepareImagenes: _.debounce(function(formData, lect) {
      //Materialize.toast('Enviando imagenes', 2000, 'red');
      if (formData === undefined) {
        //Materialize.toast('Formdata vacio', 2000, 'red');
        return;
      }
      App.BK.sendImagenes(formData, lect);
    }, 8000),

    sendImagenes: function(formData, lect) {
      App.API.setImagen({
        formData: formData,
        onSuccess: function(res) {
          lect.is_img_saved = true;
          Materialize.toast('Imagenes con folio:' + lect.folio + " en servidor", 2000, 'blue-grey');
          App.DB.put(App.DATOS.lecturas)
            .then(function(l) {
              App.DATOS.lecturas._rev = l.rev;
            });
          //Materialize.toast('Imagen bien:' + JSON.stringify(res), 2000, 'light-green accent-2');
        },
        onError: function(err) {
          //Materialize.toast('Imagen mal:' + JSON.stringify(res), 2000, 'red');
          console.log(JSON.stringify(err));
        }
      });
    },



    /*sendGPS2Server:function(){
      navigator.geolocation.getCurrentPosition(
        App.BK.getCurrentPosition2Send, App.BK.onErrorGetPosition,
        { enableHighAccuracy: true });
    },*/
    sendGPS2Server: function(pos) {
      var lat = App.GPS.currPos.lat;
      var lng = App.GPS.currPos.lng;
      var ruta_id = 0;
      if (App.DATOS.recorridos && App.DATOS.recorridos.data && App.DATOS.recorridos.data[0] && App.DATOS.recorridos.data[0].rutas_id) {
        ruta_id = App.DATOS.recorridos.data[0].rutas_id;
      }
      if (ruta_id === 0) {
        return;
      }
      App.API.setRastreo({
        id: App.CONFIG.ID_Movil,
        data: {
          rutas_id: ruta_id,
          posicion_xy: lng + ',' + lat
        },
        onSuccess: function() {
          Materialize.toast('Posicion GPS enviada', 2000, 'blue');
        },
        onError: function() {
          Materialize.toast('Error al enviar posicion GPS', 2000, 'red');
        }
      });
    },
    onErrorGetPosition: function() {
      Materialize.toast('No se pudo obtener la posicion en GPS', 2000, 'red');
    },


    VARS: {
      intervalBK: undefined,
      intervalNM: undefined,
      intervalDats2serv: undefined
    },
    disableBK: function() {
      cordova.plugins.backgroundMode.disable();
      if (App.BK.VARS.intervalBK !== undefined) {
        clearInterval(App.BK.VARS.intervalBK);
        App.BK.VARS.intervalBK = undefined;
      }
      if (App.BK.VARS.intervalNM !== undefined) {
        clearInterval(App.BK.VARS.intervalNM);
        App.BK.VARS.intervalNM = undefined;
      }
    },
    enableBK: function() {
      cordova.plugins.backgroundMode.setDefaults({
        text: 'LectorMap en Background'
      });
      cordova.plugins.backgroundMode.enable();

      cordova.plugins.backgroundMode.onactivate = function() {
        App.BK.onActive();
      };
      cordova.plugins.backgroundMode.ondeactivate = function() {
        App.BK.onDeactive();
      };

      App.BK.onDeactive();
    },

    onActive: function() {
      if (App.BK.VARS.intervalNM !== undefined) {
        clearInterval(App.BK.VARS.intervalNM);
      }
      App.BK.VARS.intervalBK = setInterval(function() {
        App.BK.intervalFn();
      }, (parseFloat(App.CONFIG.timeSendGPS) * 60 * 1000));
    },
    onDeactive: function() {
      if (App.BK.VARS.intervalBK !== undefined) {
        clearInterval(App.BK.VARS.intervalBK);
      }
      App.BK.VARS.intervalNM = setInterval(function() {
        App.BK.intervalFn();
      }, (parseFloat(App.CONFIG.timeSendGPS) * 60 * 1000));
    },

    intervalFn: function() {
      console.log('call bk fn');
      //Materialize.toast('send GPS', 4000, 'blue-grey');
      App.BK.sendGPS2Server();
    },

    saveDB2Server: function() {
      App.BK.VARS.intervalDats2serv = setInterval(function() {
        //Materialize.toast('Call save data 2 server', 4000, 'blue-grey');
        App.BK.proccessNextLectura();
        App.BK.proccessImagenes();
      }, (parseFloat(App.CONFIG.timeSaveData2Server) * 60 * 1000));
    }





  };

})();
