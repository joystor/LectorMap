(function() {
  'use strict';

  App.Login = Backbone.View.extend({
    id: 'pLogin',
    tagName: 'div',
    className: '',
    template: window.templates.login,
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
      "click #btnLogIn": "login"
    },
    login: function(){
      $('#msgLogErr').html('');
      $('#btnLogIn').addClass('disabled');
      $('#logInLoader').show();
      //this.$el.hide();

      window.logInOauth(
        $('#pU').val(),
        $('#pP').val(),
        //success
        function(){
          $('#MenuNav').show();
          $('#logInLoader').hide();
          $('body').removeClass('login-container');
          $('#pLogin').hide();
          $('#btnLogIn').removeClass('disabled');
          //document.getElementById('map_canvas').style.display="block";
          //$('#pMap').css("height",$(window).height()-$('#pMenu').height());
          //$('#pMap').show();
          //$('#map_canvas').css("height",$(window).height()-$('#pMenu').height());
          //$.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=App.map.activate');
          //App.map.activate();

          $('#pRutas').show();
          App.API.getLecturistaId({
            onSuccess:function(id){
              if(App.CONFIG.LecturistaID !== id){
                App.CONFIG.LecturistaID = id;
                App.DB.get('last-lecturista-id')
                  .then(function(t) {
                    t.LecturistaID = App.CONFIG.LecturistaID;
                    return App.DB.put(t);
                  })
                  .catch(function(err) {
                    App.DB.put({
                      _id: 'last-lecturista-id',
                      LecturistaID: App.CONFIG.LecturistaID
                    });
                  });
                App.rutas.cleanRutas(function(){
                  App.rutas.readRutas();
                });
              }else{
                App.rutas.readRutas();
              }
            }
          });
        },
        //error
        function(){
          $('#msgLogErr').html('Error en usuario o contraseña');
          $('#btnLogIn').removeClass('disabled');
          $('#logInLoader').hide();
        }
      );

      /*

      */
    }
  });

})();
