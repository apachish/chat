var address = 'http://chat.asemanapps.ir:4000';

/**
     * Created by shahriar on 7/19/16.
     */
    $("#main .contain").css("height",screen.height - $(".top-nav").height() - $("footer").height() + 39);
    $("#main .messages-wrapper").css("height",screen.height - $(".top-nav").height() - $("footer").height() - 36);
    $("#main .contain").css("overflow-y","scroll");
    $("#main .contain").css("overflow-x","hidden");
    $(".img-loading").hide();
     $.get(address+'/loadfirst',function(res){
         msg = JSON.parse(res.message);
         console.log(msg);

         if(msg.user && msg.telephon){
             $('body').css("background-color","#eee");
             $('#login').hide();
             $('#main').show();
             user_online = msg.telephon;
             session     = msg.user;
             $('#user_online').val(user_online);
             $('#session').val(session );
             loadroom();
         }
         else if(msg.code == false){
             $('#login').show();
             $('#main').hide();
         }
         else if(msg.code == true){
             $('#login').show();
             $('#main').hide();
             $(".enter-number-section").hide();
             $(".enter-number-btn").hide();
             $(".verification-code-section").show();
             $('#tel').html(msg.device);
         } else{
             $('#login').show();
             $('#main').hide();
         }
     });
    function loadroom() {
        $.get(address+"/loadRoom?session="+$('#session').val()+"&user_online="+$('#user_online').val(), function (res) {
            user_online = $('#user_online').val();
            session     = $('#session').val();
            $.each(res.message, function (index, value) {
                value = JSON.parse(value);
                if(!index){
                    checked="checked";
                    $("#roomnow").val(value.room);
                    $("#contact").val(value.contact);
                    $("#namecontact").val(value.name);
                    window.room = value.room;
                    $(".messages-list").attr('id',window.room);
                }else{
                    checked="";
                }
                html ='<li class="navbar-text navbar-right "  >' ;
                html +='<img class="group-avatar" src="'+value.img+'" />';
                html += '<a class="joinRoom ' + checked + '"  data-contact="'+value.contact+'" data-id="' + value.room + '">';
                html += value.name ; 
                html +='</a>';
                if(value.messagelast != undefined){
                    html += '<span class="group-message">'+ value.messagelast.substr(0, 25)+' ...</span>';
                }
                if(value.number){
                    html += '<span class="new-unread">'+value.number+'</span>';
                }
                html += '<i class="material-icons done-all">done_all</i>';
                html +='</li>';
                $("#Room").append(html);
                
            });
            var contact = $('#contact').val();

            $.get(address+'/loadChat?room='+window.room+'&contact='+contact+'&session='+session+'&user_online='+user_online,function(res){
                $.each(res.message,function(index,value) {
                    renderMessage(index,value,window.room);
                });
                scrollToBottom();
            });
        });
    }

    $(document).on('keyup','#code',function(){
        if($(this).val().length >= 5){
            $.post(address+"/start",{
                code        : $("#code").val(),
                telephon    : $("#tel").text()
            },function(data){
                if(!data.error) {
                    $('body').css("background-color","#eee");
                                        $('#login').hide();
                                        $('#main').show();
                    msg = JSON.parse(data.message);
//                    if(window.location.href.search('index') > 0){
//                        new_location = window.location.href.replace("index","home");
//                        window.location.href = new_location+'?login='+msg.login+'&device='+msg.device;
//                    }else{
//                        window.location.href = '/home?login='+msg.login+'&device='+msg.device;
//                    }
                        user_online = msg.device;
                        session     = msg.login;
                         $('#user_online').val(user_online);
                        $('#session').val(session );

                } else {
                    alert(data.message);
                }
            });
        }
    });
$('#logout').click(function () {


    $.get(address+"/logout",{
    },function(data) {
        $('#main').hide();
        $('#login').show();
        $('#nav-mobile').hide();
    });
});
