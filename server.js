var http    = require("http");          
var express = require("express");                 
var easyrtc = require("easyrtc");  
var io      = require("socket.io");         
var app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: false}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + "/public/"));

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/join', function(req, res) {
	res.render('index');
});

app.post('/join', function(req, res) {
	var username = req.body.username;
	var roomname = req.body.roomname;

	if (username != '' && roomname != '') {
		res.render('room', {username: username, roomname: roomname});	
	}
	else {
		res.render('index');
	}
	
});

var webServer = http.createServer(app).listen(9000);
var socketServer = io.listen(webServer, {"log level":1});
var rtc = easyrtc.listen(app, socketServer);
