(function() {
  'use strict';

  App.Menu = Backbone.View.extend({
    id: 'pMenu',
    tagName: 'div',
    className: 'black',
    template: window.templates.menu,
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
      "click #btnMyLocation": "zToMyLocation",
      "click #btnZoomMarkers": "zToRutas",
      "click #btnSettings": "openSettings"
    },
    zToMyLocation:function(){
      if( App.map.currPos && App.map.currPos.marker && App.gmap){
        App.gmap.setCenter( App.map.currPos.marker.getPosition() );
      }
    },
    zToRutas:function(){
      if(App.DATOS.recorridos.bounds && App.gmap){
        App.gmap.fitBounds(App.DATOS.recorridos.bounds);
      }
    },
    openSettings:function(){
      App.panelSettings.openSettingsPanel();
    }
  });

})();
