$(document).on("ready",function() {

    /**
     * Created by shahriar on 7/19/16.
     */
     $.get('/',function(data){
         $('#login').hide();
         $('#main').show();
         console.log(data);
         msg = JSON.parse(data.message);
         user_online = msg.device;
         session     = msg.login;
         $('#user_online').val(user_online);
         $('#session').val(session );
     });
    $.get("/loadRoom?session="+$('#user_online').val()+"&user_online="+$('#session').val(), function (res) {
        user_online = $('#user_online').val();
        session     = $('#session').val();
        $.each(res.message, function (index, value) {
            value = JSON.parse(value);
            console.log(value);
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
            $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom ' + checked + '"  data-contact="'+value.contact+'" data-id="' + value.room + '">' + value.name + '</a></li>');

        });
        var contact = $('#contact').val();

        $.get(address+'/loadChat?room='+window.room+'&contact='+contact+'&session='+session+'&user_online='+user_online,function(res){
            $.each(res.message,function(index,value) {
                renderMessage(index,value,window.room);
            });
            scrollToBottom();
        });
    });
    $(document).on('keyup','#code',function(){
        if($(this).val().length == 5){
            $.post("/start",{
                code        : $("#code").val(),
                telephon    : $("#tel").text()
            },function(data){
                if(!data.error) {
                    alert('success');
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
                    $.get("/loadRoom?session="+msg.login+"&user_online="+msg.device, function (res) {
                        user_online = $('#user_online').val();
                        session     = $('#session').val();
                        $.each(res.message, function (index, value) {
                            value = JSON.parse(value);
                            console.log(value);
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
                            $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom ' + checked + '"  data-contact="'+value.contact+'" data-id="' + value.room + '">' + value.name + '</a></li>');

                        });
                        var contact = $('#contact').val();

                        $.get('/loadChat?room='+window.room+'&contact='+contact+'&session='+msg.login+'&user_online='+msg.device,function(res){
                            $.each(res.message,function(index,value) {
                                renderMessage(index,value,window.room);
                            });
                            scrollToBottom();
                        });
                    });
                } else {
                    alert(data.message);
                }
            });
        }
    });
});