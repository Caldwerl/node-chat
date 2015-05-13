var socket = io();

var $name = $('#chat-name');
var $chat = $('#chat-display');
var $msg = $('#chat-message');
var $nameList = $('#chat-name-list');
var $status = $('#chat-status');
var $statusTxt = $('#chat-status span');
var $nameForm = $('#name-form');
var $msgForm = $('#msg-form');
var $countTxt = $('#chat-count span');
var whitespacePattern = /^\s*$/;
var statusOld = $statusTxt.text();
var alertOld = "alert-info";
var alertCur;
var nameOld = "Unknown";

$msgForm.submit(function () {

  if (!whitespacePattern.test($msg.val())) {

    socket.emit('chat message', ({name: whitespacePattern.test($name.val()) ? nameOld : $name.val(), message: $msg.val()}));
  }

  $msg.val('');

  return false;
});

$nameForm.submit(function () {

  socket.emit('name change', (whitespacePattern.test($name.val()) ? {name: 'Unknown'} : {name: $name.val(), oldName: nameOld, socketID: socket.id}));
  nameOld = $name.val();

  return false;
});



socket.on('populate names', function (names) {

  $nameList.children().remove();

  names.forEach(function(name) {

    $nameList.append($('<li>').text(name));
  });
});



socket.on('name change', function (data) {

    $('#chat-name-list li:contains(' + data.oldName + ')').filter(':first').text(data.name);
});



socket.on('chat message', function (data){

  if(data.length != undefined){

    for (var i = 0; i < data.length; i++) {

      $chat.prepend($('<li>').text(data[i].name + ": " + data[i].message));
    }
  } else if (data.message != undefined) {

    $chat.prepend($('<li>').text(data.name + ": " + data.message));
  }
});



socket.on('add user', function (name) {

  $nameList.append($('<li>').text(name));
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




socket.on('disconnect', function(name) {

  if (name != 'transport close') {

    $chat.prepend($('<li>').text("Server: " + name + " has disconnected."));
    $('#chat-name-list li:contains(' + name + ')').filter(':first').fadeOut().remove();
  }
});
