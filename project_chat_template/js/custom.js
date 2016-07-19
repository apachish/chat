function getUrlVars() {
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
        $.post("http://192.168.100.23:4000/register",{
            telephon : telephon
        },function(data){
            if(!data.error) {
                $('.get_telephon').css('display','none');
                $('.get_code').css('display','block');
                $('#tel').html(telephon);
            } else {
                alert(data.message);
            }
        });
    });

  });
