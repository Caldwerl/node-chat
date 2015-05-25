var socket = io();

var $name = $('#login-name');
var $pass = $('#login-pass');
var $dispNameTxt = $('#chat-name span');
var $dispName = $('#chat-name');
var $chat = $('#chat-display');
var $msg = $('#chat-message');
var $nameList = $('#chat-name-list');
var $status = $('#chat-status');
var $statusTxt = $('#chat-status span');
var $loginForm = $('#login-form');
var $msgForm = $('#msg-form');
var $countTxt = $('#chat-count span');
var whitespacePattern = /^\s*$/;
var statusOld = $statusTxt.text();
var alertOld = "alert-info";
var alertCur;

$msgForm.submit(function () {

  if (!whitespacePattern.test($msg.val())) {

    socket.emit('chat message', ({name: $dispNameTxt.text(), message: $msg.val()}));
  }

  $msg.val('');

  return false;
});

$loginForm.submit(function () {

  if (!whitespacePattern.test($name.val()) && !whitespacePattern.test($pass.val())) {

    socket.emit('login', ({name: $name.val().trim(), pass: $pass.val().trim()}));
  }

  return false;
});


socket.on('populate names', function (userList) {

  $nameList.children().remove();

  for (var user in userList) {

    $nameList.append($('<li>').text(userList[user].name).css('color', userList[user].color));
  }
});





socket.on('chat message', function (data){

  if(data.length != undefined){

    for (var i = 0; i < data.length; i++) {

      $chat.prepend($('<li>').text(data[i].name).append($('<span>').text(": " + data[i].message)));
    }
  } else if (data.message != undefined) {

    $chat.prepend($('<li>').text(data.name).css('color', data.color).append($('<span>').text(": " + data.message)));
  }
});



socket.on('add user', function (data) {

  $nameList.append($('<li>').text(data.name).css('color', data.color));
});



socket.on('status', function (data) {

  alertCur = data.category;

  $status.removeClass(alertOld).addClass(alertCur);
  $statusTxt.text(data.message);

  setTimeout(function () {

    $status.addClass(alertOld).removeClass(alertCur);
    $statusTxt.text(statusOld);
  }, 5000);
});



socket.on('conn update', function (data) {

  $countTxt.text(data);
});



socket.on('set name', function (data) {

  $dispNameTxt.text(data.name);
  $loginForm.hide();
  $dispName.show();
});



socket.on('disconnect', function(data) {

  if (data.name != 'transport close') {

    $chat.prepend($('<li>').text("Server: " + data.name + " has disconnected."));
    $('#chat-name-list li:contains(' + data.name + ')').filter(':first').remove();
  }
});
