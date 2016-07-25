var address = 'http://chat.asemanapps.ir';
function getUrlVars() {
    $(document).on('click','.start-message-btn',function(){
        $(".start-page-section").hide();
        $(".enter-number-section").show();
        $(".enter-number-btn").show();
    });
     $(document).on('click','.retry',function(e){
         e.preventDefault();
        var telephon = $("#tel").html();
        $.post(address+":4000/register",{
            telephon : telephon
        },function(data){
            if(!data.error) {
                $('#tel').html(telephon);
            } else {
                alert(data.message);
            }
        });
    });
    $(document).on('focus','#telephon',function(){
        $("#country").hide();
        $(".login-submit").hide();
        $(".small-next").show();
    });
    $(document).on('focusout','#telephon',function(){
        $("#country").show();
        $(".login-submit").show();
        $(".small-next").hide();
    });

    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
$(document).on("ready",function(){
    $("#telephon").val('');
    $("#m").css("width",screen.width - 90+"px");
    $('.button-collapse').sideNav({
          menuWidth: 240, // Default is 240
          edge: 'left', // Choose the horizontal origin
          closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
        }
      );
    $(document).on('click','.back-icon',function(){
        $(".back-icon").addClass("hide");
        $(".chat-contain").hide();
        $(".group-contain").show();
    });
    $(document).on('keyup','#m',function(){
        if($(this).val() == ''){
            $(".attach-file-div").show();
            $(".send-btn").hide();
        }else{
            $(".attach-file-div").hide();
            $(".send-btn").show();
        }
    });
    var login = getUrlVars()["login"];
    var user_online = getUrlVars()["device"];
    if(login){
        $('#session').val(login);
    }
    if(user_online){
        $("#user_online").val(user_online);
    }

    $(".form-profile").hide();

  
  
    $('#login-submit').click(function(e){
        var telephon = $("#telephon").val();
        telephon = telephon.replace(/^(\+98|0098|098|98|0)?/g,"");
        console.log(telephon);
        console.log(address+":4000/register");
        $.post(address+":4000/register",{
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
