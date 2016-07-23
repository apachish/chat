var address = 'http://192.168.100.22';
function getUrlVars() {
    $(document).on('click','.start-message-btn',function(){
        $(".start-page-section").hide();
        $(".enter-number-section").show();
        $(".enter-number-btn").show();
    });
     $(document).on('click','.retry',function(e){
         e.preventDefault();
        var telephon = $("#tel").html();
        $.post("/register",{
            telephon : telephon
        },function(data){
            if(!data.error) {
                $('#tel').html(telephon);
            } else {
                alert(data.message);
            }
        });
    });

    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
$(document).on("ready",function(){
    var login = getUrlVars()["login"];
    var user_online = getUrlVars()["device"];
    if(login){
        $('#session').val(login);
    }
    if(user_online){
        $("#user_online").val(user_online);
    }

    $(".form-profile").hide();
    $(".second-menu").hide();
    $('.button-collapse').sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
  );
       //$('.button-collapse').sideNav('show');
       $(document).on('click','.main-menu',function(){
           $("#nav-mobile").css("margin-left","-240px");
           $('header').css("padding-left","0px");
           $('main').css("padding-left","0px");
           $('footer').css("padding-left","0px");
           $(".container").css("padding-left","0px");
           $(".second-menu").show();
       });

       $(document).on('click','.second-menu',function(){
           $('header').css("padding-left","240px");
           $('main').css("padding-left","240px");
           $('footer').css("padding-left","240px");
           $("#nav-mobile").css("margin-left","0px");
           $(".second-menu").hide();
       });
    $('#login-submit').click(function(e){
        var telephon = $("#telephon").val();
        $.post("/register",{
            telephon : telephon
        },function(data){
            if(!data.error) {
                $("#code").val("");
                $(".enter-number-section").hide();
                $(".enter-number-btn").hide();
                $(".verification-code-section").show();
                $('#tel').html(telephon);
            } else {
                alert(data.message);
            }
        });
    });

  });
