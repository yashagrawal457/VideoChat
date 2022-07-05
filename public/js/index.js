
$('#submit').click(function() {
  var user = $('#username').val();
  var room = $('#roomname').val();
  if (user == '' || room == '') {
  	$('#login_msg').val('Please fill both the fields.');
  	window.location.replace('/');
  }
});