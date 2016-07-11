var socket = io('/');
function showEmoji(msg) {
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
    while (match = reg.exec(msg)) {
        emojiIndex = match[0].slice(7, -1);
        if (emojiIndex > totalEmojiNum) {
            result = result.replace(match[0], '[X]');
        } else {
            result = result.replace(match[0], '<img class="emoji" src="img/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
        };
    };
    reg = /data:image*/;
    reg_bace = /\\*;base64,*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result = '<img class="image" src="'+msg+'" />';//todo:fix this in chrome it will cause a new request for the image
    }else if(reg.exec(msg)){
        msg = msg.replace('data:image','/upload/image');
        result = '<img class="image" src="'+msg+'" />';//todo:fix this in chrome it will cause a new request for the image
    }
    reg = /data:audio*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result ='<audio controls><source src="'+msg+'" type="audio/ogg"><source src="'+msg+'" type="audio/mpeg"></audio>';
    }else if(reg.exec(msg)){
        msg = msg.replace('data:audio','/upload/audio');
        result ='<audio controls><source src="'+msg+'" type="audio/ogg"><source src="'+msg+'" type="audio/mpeg"></audio>';
    }
    reg = /data:application*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result ='<a href="'+msg+'"><img  class="image" src="/img/pdf.png"   ></a>';
    }else if(reg.exec(msg)){
        msg = msg.replace('data:application','/upload/document');
        result ='<a href="'+msg+'"><img class="image" src="/img/pdf.png"></a>';
    }
    return result;
}

$(document).on("ready",function(){
  var room;
  $(".form-profile").hide();
  window.room = $("#roomnow").val();
  var name = $("#user_online").val();
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
    var check = $('#check_code').val();
    if(check == 'true'){
        $('.get_telephon').css('display','none');
        $('.get_code').css('display','block');
    }
    $('#login-submit').click(function(e){
        var telephon = $("#telephon").val();
        $.post(window.location.origin+"/register",{
            telephon : telephon
        },function(data){
            if(!data.error) {
                $('.get_telephon').css('display','none');
                $('.get_code').css('display','block');
                $('#tel').html(telephon)
            } else {
                alert(data.message);
            }
        });
    });
    $('#Code-submit').click(function(e){
        $.post(window.location.origin+"/start",{
            code        : $("#code").val(),
            telephon    : $("#tel").text()
        },function(data){
            if(!data.error) {
                window.location.href = "/home";
            } else {
                alert(data.message);
            }
        });
    });
    $('#new-group').click(function(e){
        $('.bold').removeClass('active');
        $(this).parent('li').addClass('active');
        // prompt for person's name before allowing to post
        name = window.prompt("Insert name for Room?");
        if(name.length < 3) {
            alert("please insert character in input(min 3 Character)");
        }
        if(name.length >= 3) {
            $.post("/addRoom",
                { room_name : name },
                function(res){
                    if(!res.error) {
                        var roomnow = $("#roomnow").val();
                          $("#roomnow").val(name);
                          room = name;
                          $('.messages-list').html("");
                        $("#Room").append('<li class="navbar-text navbar-right"  ><a class="joinRoom"  data-id="' + name + '">' + name + '</a></li>');
                        $("#nav-mobile").css("margin-left","240px");

                    }
                });
            return name;
        }
        return false;
    });

    $(document).on('click','.user_contact',function(){
        var joinroom = $(this).attr('data-id');
        var text = $('span',this).text();
        $("#roomnow").val(joinroom);
        $('.messages-list').html("");
          $('#chat').show();
          $.get(window.location.origin+"/loadRoom", function (res) {
            $("#Room").html('');
            $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom checked"  data-id="' + joinroom + '">' + text + '</a></li>');
              $.each(res.message, function (index, value) {
                  $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom"  data-id="' + value + '">' + value + '</a></li>');
              });
          });

          room = joinroom;
          console.log(window.room);
        $.ajax({
            url:  window.location.origin+"/joinRoom?room="+joinroom,
            type: "GET",             // Type of request to be send, called as method
            data: {room: joinroom},
            contentType: false,       // The content type used when sending data to the server.
            cache: false,             // To unable request pages to be cached
            processData:false,        // To send DOMDocument or non processed data file it is set to false
            success: function (res) {
                if (!res.error) {
                    // $('.joinRoom').removeClass('checked');
                    // $('.joinRoom').find("a").attr("data-id",joinroom).addClass('checked');
                        $.each(res.message,function(index,value) {
                            renderMessage(index,value);
                            scrollToBottom();
                    })
                }else{
                    console.log('add room error');
                }
            }
        });
    });
    $(document).on('click','.joinRoom',function(){
        var joinroom = $(this).attr('data-id');
        $("#roomnow").val(joinroom);
        $('.messages-list').html("");
          room = joinroom;
          console.log(window.room);
        $.ajax({
            url:  window.location.origin+"/joinRoom?room="+joinroom,
            type: "GET",             // Type of request to be send, called as method
            data: {room: joinroom},
            contentType: false,       // The content type used when sending data to the server.
            cache: false,             // To unable request pages to be cached
            processData:false,        // To send DOMDocument or non processed data file it is set to false
            success: function (res) {
                if (!res.error) {
                    // $('.joinRoom').removeClass('checked');
                    // $('.joinRoom').find("a").attr("data-id",joinroom).addClass('checked');
                        $.each(res.message,function(index,value) {
                            renderMessage(index,value);
                            scrollToBottom();
                    })
                }else{
                    console.log('add room error');
                }
            }
        });
    });
    $(document).on('click','#chat-list',function(){
      $('.form-profile').hide();
      $('#chat').show();
      $.get(window.location.origin+"/loadRoom", function (res) {
        $("#Room").html('');
          $.each(res.message, function (index, value) {
              if(!index){
                  checked="checked";
                  room = value;
              }else{
                  checked="";
              }
              $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom ' + checked + '"  data-id="' + value + '">' + value + '</a></li>');
          });
          $.get(window.location.origin+'/loadChat?room='+window.room,function(res){
              $.each(res.message,function(index,value) {
                  renderMessage(index,value);
              });
              scrollToBottom();
          });
      });
      $("#nav-mobile").css("margin-left","240px");

    });
    $(document).on('click','#profile',function(){
      $('.bold').removeClass('active');
      $(this).parent('li').addClass('active');
      $("#Room").html("");
      $('#chat').hide();
      $('.form-profile').show();
      $("#nav-mobile").css("margin-left","240px");

    });
    $(document).on('click','.loadContactlist',function(){
      $.get(window.location.origin+"/addConntact", function (res) {
        $("#Room").html("");
        $("#Room").html('<img src="img/load.png" class="loadContactlist logo-img" alt="loadContactlist">');
        $.each(res.message, function (index, value) {
            $.each(value.phoneNumber,function (key ,tel) {
                if(tel.type == 'mobile'){
                    telephon = tel.number;
                }
            });
            html  = '<li class="navbar-text navbar-right ">';
            html += '<a class="user_contact"  data-id="' + telephon + '">';
            html +=  '<span>'+value.lastName+' '+value.firstName+'</span> : '+ telephon;
            html += '</a></li>';
            $("#Room").append(html);
        });
          return false;
      });
    })
    $(document).on('click','#contacts',function(){
      $('.bold').removeClass('active');
      $(this).parent('li').addClass('active');
        $.get(window.location.origin+"/loadContact", function (res) {
            $("#Room").html("");
            $("#chat").hide();
            $(".form-profile").hide();
            $("#Room").html('<img src="img/load.png" class="loadContactlist logo-img" alt="loadContactlist">');
            $.each(res.message, function (index, value) {
                value = JSON.parse(value);
                $.each(value.phoneNumber,function (key ,tel) {
                    if(tel.type == 'mobile'){
                        telephon = tel.number;
                    }
                    if(!room){
                      $("#roomnow").val(tel.number);
                      window.room= tel.number;
                    }
                });
                html  = '<li class="navbar-text navbar-right ">';
                html += '<a class="user_contact"  data-id="' + telephon + '">';
                html +=  '<span>'+value.lastName+' '+value.firstName+'</span> : '+ telephon;
                html += '</a></li>';
                $("#Room").append(html);
            });
        });
        $("#nav-mobile").css("margin-left","240px");

    });
    $.get(window.location.origin+"/loadRoom", function (res) {
        $.each(res.message, function (index, value) {
            if(!index){
                checked="checked";
                room = value;
            }else{
                checked="";
            }
            $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom ' + checked + '"  data-id="' + value + '">' + value + '</a></li>');
        });
        $.get(window.location.origin+'/loadChat?room='+window.room,function(res){
            $.each(res.message,function(index,value) {
                renderMessage(index,value);
            });
            scrollToBottom();
        });
    });

    $('#fileupload').change(function(e) {
        if (this.files.length != 0) {
            var file = this.files[0],
                reader = new FileReader(),
                color = $('#colorStyle').val();
            reader.onload = function(e) {
                var fd = new FormData();
                fd.append('file', file);
                fd.append('size', file.size);
                fd.append('path', file.path);
                fd.append('name',  file.name);
                fd.append('username', name);
                fd.append('room', room);
                fd.append('type', file.type);
                switch(file.type) {
                    case 'image/jpeg':
                    case 'image/png':
                        $.ajax({
                            url: "/uploadImage", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    case 'application/pdf':
                        $.ajax({
                            url: "/uploadPDF", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    case 'audio/mp3':
                        $.ajax({
                            url: "/uploadAudio", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    default:
                        alert("type file undefined");
                        return false;
                        break;
                }
                console.log('emit'+room+'  '+name);
                socket.emit('chat_message_'+room,e.target.result,name);
            };
            reader.readAsDataURL(file);
        };
        return false;
    });

    $('#form').submit(function(){
        room = $("#roomnow").val();
            if ($("#m").val() !== "") {
                socket.emit('chat_message_'+room, $('#m').val() ,name,$("#colorStyle").val());

                $.post("/addChat",
                    {text: $("#m").val(),room:room,font_color : $("#colorStyle").val()},
                    function (res) {
                        if (!res.error) {
                            return false;
                        }
                        return false;
                    });
                $('#m').val('');
                return false;

            }else{
                alert("please insert text in textbox");
                return false;
            }
    });

    socket.on('connect', function() {

        console.log(window.room+' '+$("#user_online").val());
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', window.room,$("#user_online").val());
    });
    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('roomname', window.room,$("#user_online").val());
    });

    console.log('chat_message_'+window.room);
    socket.on('chat_message_'+window.room, function(msg){
        console.log('send'+window.room);
        console.log('send'+msg);
        renderMessage('send',msg);
        scrollToBottom();
    });
    socket.on(window.room, function(online){
        console.log(">> " +online);
        var html = '';
        $('.contacts-list').html(html);
        $.each(online,function(index,value) {
            if(value){
                html += "<li ng-repeat='user in users'>";
                html += "<a href>";
                html += "<img class='contacts-list-img' src='img/avatars/profile/"+value+".jpg'/>";
                html += "<div class='contacts-list-info'>";
                html += "<span class='ol-memeber-name' style='line-height:2.6; padding:5px; font-weight : 600; color : #333;'>"+value+"</span>";
                html += "</div><!-- /.contacts-list-info --></a></li>";
            }
        });
        $('.contacts-list').html(html);  // append to list
    });
    socket.emit("online-members",function(data){
    });
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    function scrollToBottom () {
        console.log($('.messages-wrapper').height());
        $(window).scrollTop($('.messages-wrapper').height());
        $('.messages-wrapper').scrollTop($('.messages-wrapper')[0].scrollHeight);
    }
    function leadZero(number) {
        return (number < 10) ? '0'+number : number;
    }
    function getTime(timestamp) {
        var t, h, m, s, time;
        t = new Date(timestamp);
        h = leadZero(t.getHours());
        m = leadZero(t.getMinutes());
        s = leadZero(t.getSeconds());
        return '' + h  + ':' + m + ':' + s;
    }
    /**
     * renders messages to the DOM
     * nothing fancy
     */
    function renderMessage(index,value) {
        if(index != 'send'){
            value = JSON.parse(value);
        }
        var html ='';
        if(name == value.name){
            html='<li class="messege-row">';
            html +='<ul class="message-list sent-message">';
            html +='<li class="message-single message-first">';
            html +='<div class="avatar-container">';
            html +='<img src="img/avatars/avatar.jpg">';
            html +='</div>';
            html +='<div class="message-container">';
            html +='<div class="message-text">';
            html += "<small class='time'>" + getTime(value.created_date) + " </small>";
            html += "<span class='name'>" + value.name + ": </span>";
            html += "<span class='msg' style='color:"+value.color+"'>" + showEmoji(value.text); + "</span>";
            html +='</div>';
            html +='</div>';
            html +='</li>';
            html +='</ul>';
            html +='</li>';
        }else{
            html='<li class="messege-row">';
            html +='<ul class="message-list received-message">';
            html +='<li class="message-single message-first">';
            html +='<div class="avatar-container">';
            html +='<img src="img/avatars/avatar.jpg">';
            html +='</div>';
            html +='<div class="message-container">';
            html +='<div class="message-text">';
            html += "<small class='time'>" + getTime(value.created_date) + " </small>";
            html += "<span class='name'>" + value.name + ": </span>";
            html += "<span class='msg' style='color:"+value.font_color+"'>" + showEmoji(value.text); + "</span>";
            html +='</div>';
            html +='</div>';
            html +='</li>';
            html +='</ul>';
            html +='</li>';
        }
        $('.messages-list').append(html);  // append to list
        return;
    }
    $('#colorStyle').on('change',function () {
        var color = $('#colorStyle').val();
        $('#m').css("color",color);
    })

});
