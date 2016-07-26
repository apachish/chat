var address_custom = 'http://chat.asemanapps.ir:4000';
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
$(document).on("ready",function(){
    $(document).on('click','.start-message-btn',function(){
        $(".start-page-section").hide();
        $(".enter-number-section").show();
        $(".enter-number-btn").show();
    });
    $(document).on('click','.retry',function(e){
        e.preventDefault();
        var telephon = $("#tel").html();
        $.post(address_custom+"/register",{
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

    $("#telephon").val('');
    $("#m").css("width",screen.width - 90+"px");
    
    $('.modal-trigger').leanModal();
    
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
        $(".menu-main").show();
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
        console.log(address_custom+"/register");
        $.post(address_custom+"/register",{
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
