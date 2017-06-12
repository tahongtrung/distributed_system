var socket = io('http://127.0.0.1:3000');

socket.on('server-send-register-error', function(data) {
    console.log(data);
    $('.form-group').addClass('has-error');
    $('#registerResult').html(data.res).css('display', 'block');
});

socket.on('server-send-register-success', function(data) {
    $('.form-group').removeClass('has-error').addClass('has-success');
    //$('#registerResult').html(data.res).css('display', 'block');
    $('#userInfo').html(data.username);
    $('#login').hide();
    $('#user').show();
    $('#chat').show();
});

socket.on('server-send-list-users', function(data) {
    $("#noUser").html(data.length);
    $('#listUsers').html('');
    (data).forEach(function(e) {
        $('#listUsers').append('<a href="#" class="list-group-item">' + e +  '</a>');
    });
});

socket.on('server-send-message', function(data) {
    if (data.id == socket.id) myMessage = 'right'; else myMessage = '';
    $('#listMessages').append('<div class="message ' + myMessage + '"><h4 class="message-username">' + data.username + '</h4><div class="message-content"><span>' + data.message + '</span></div></div>');
    $('#listMessages').scrollTop($('#listMessages').prop('scrollHeight'));
});

socket.on('server-send-list-typing', function(data) {
    //console.log('hello');
    $('#typing').html('');
    //console.log(socket.username);
    data.forEach(function(e) {
        if (e !== socket.username) {
            $('#typing').append('<div><img src="img/typing.gif" height="40px" />' + e + ' is typing message</div>');
        }
    });
});

$(document).ready(function() {

    $('#username').keyup(function(e) {
        if (e.which == 13) {
            console.log('LOGIN!!!');
            var username = $(this).val();
            socket.emit('client-send-username', username);
            socket.username = username;
            $(this).val('');
        }
    });
    $('#logout').click(function() {
        console.log('LOGOUT!!!');
        socket.emit('client-send-logout');
        $('#login').show();
        $('#chat').hide();
        $('#user').hide();
        $('#registerResult').hide();
    });
    $('#textMessage').keyup(function(e) {
        if (e.which == 13) {
            var message = $(this).val();
            if(message!==""){
                socket.emit('client-send-message', message);
                $(this).val('');
            }
        }
    });
    $('#textMessage').focusin(function() {
        socket.emit('client-send-typing');
    });
    $('#textMessage').focusout(function() {
        socket.emit('client-send-stop-typing');
    });
});
