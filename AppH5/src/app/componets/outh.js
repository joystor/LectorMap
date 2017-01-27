(function() {
  'use strict';

  window.logInOauth = function(usr, pwd, onSuccess, onError){
    $.ajax({
        url: App.API_URL + "oauth/token",
        type : 'POST',
        data : {
            grant_type : 'password',
            client_id : App.LOGIN.client_id,
            client_secret : App.LOGIN.client_secret,
            username: usr,
            password: pwd,
            scope:''
        },
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', "Bearer $token");
        },
        success: function (response) {
          if (response && response.access_token) {
            App.LOGIN.TOKEN = response.access_token;

            App.DB.get('last-token')
              .then(function(t) {
                t.token = App.LOGIN.TOKEN;
                App.DB.put(t);
              })
              .catch(function(err) {
                App.DB.put({
                  _id:'last-token',
                  token: App.LOGIN.TOKEN
                });
              });

            onSuccess();
          } else {
            $('#msgLogErr').html('Error al conectar');
          }
        },
        error: function(jqXHR,textStatus,errorThrown){
          console.log(errorThrown);
          $('#msgLogErr').html(errorThrown);
          onError();
        }
    });
  };

})();
