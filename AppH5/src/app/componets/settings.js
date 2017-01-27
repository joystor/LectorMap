(function() {
  'use strict';
  App.PanelSettings = Backbone.View.extend({
    id: 'pPanelSettings',
    tagName: 'div',
    className: '',
    template: window.templates.settings,
    initialize: function() {},
    render: function() {
      var htmlOutput = this.template();
      this.$el.html(htmlOutput);
      return this;
    },
    activate: function() {
      $('#btnCollapseSettings').sideNav({
        menuWidth: '100%',
        edge: 'right',
        closeOnClick: false,
        draggable: true
      });
    },
    events: {
      "click #btnSettingsBack": "btnSettingsBack",
      "click #btnReSyncRutas": "reSyncRutas",
      'click #btnSaveIdEquipo': 'saveIdEquipo',
      'click #btnSaveTimeGPS': 'saveTime2SendGPS',
      'click #btnExitApp': 'exitApp'
    },
    exitApp: function() {
      App.BK.disableBK();
      App.DB.close().then(function () {
        if (navigator.app) {
          navigator.app.exitApp();
        } else if (navigator.device) {
          navigator.device.exitApp();
        }
      });
    },
    openSettingsPanel: function() {
      $('#btnReSyncRutas').removeClass('disabled');
      $('#btnCollapseSettings').sideNav('show');
      //$('#inpIdEquipo').focus();
      $('#pPanelSettings label').addClass('active');
    },
    btnSettingsBack: function() {
      $('#btnCollapseSettings').sideNav('hide');
    },
    reSyncRutas: function() {
      $('#btnCollapseSettings').sideNav('hide');
      delete App.DATOS.recorridos;
      App.DATOS.rutas = {
        _id: 'rutas',
        data: []
      };

      App.DB.get('rutas').then(function(p) {
        return App.DB.remove(p._id, p._rev);
      });
      $('#listRecorridos').html('');
      App.DB.get('recorridos').then(function(r) {
        //App.map.syncRutas();
        App.rutas.readRutas();
        return App.DB.remove(r);
      }).catch(function() {
        //App.map.syncRutas();
        App.rutas.readRutas();
      });
    },

    saveIdEquipo: function() {
      App.DB.get('id-equipo')
        .then(function(e) {
          e.id_equipo = $('#inpIdEquipo').val();
          App.CONFIG.ID_Movil = e.id_equipo;
          Materialize.toast('ID asignado', 2000, 'blue darken-1');
          return App.DB.put(e);
        })
        .catch(function(err) {
          App.CONFIG.ID_Movil = $('#inpIdEquipo').val();
          Materialize.toast('ID asignado', 2000, 'blue darken-1');
          App.DB.put({
            _id: 'id-equipo',
            id_equipo: App.CONFIG.ID_Movil
          });
        });
    },

    saveTime2SendGPS: function() {
      var mins = $('#inpTimeGPS').val();
      App.CONFIG.timeSendGPS = mins;
      Materialize.toast(mins + ' minutos para actualizar', 2000, 'blue darken-1');
      App.BK.disableBK();
      App.DB.get('time-send-gps')
        .then(function(t) {
          t.minutes = mins;
          return App.DB.put(t);
        })
        .catch(function(err) {
          App.DB.put({
            _id: 'time-send-gps',
            minutes: mins
          });
        });
      App.BK.enableBK();
    }
  });
})();
