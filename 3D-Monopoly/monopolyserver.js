
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var mainpage = require('./routes/mainpage');
var game = require('./routes/play');
var serverpost = require('./routes/post');
var index = require('./routes/home');
var http = require('http');
var path = require('path');
var partials = require('express-partials');
var pass = require('./controllers/passport.js');
var passport = require('passport');
var app = module.exports = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);

app.use(partials());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'monopolyman'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'gamefiles')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/login', mainpage.login);
app.post('/login', serverpost.login);

app.get('/register', mainpage.register);
app.post('/register', serverpost.register);

app.post('/add-friend', serverpost.addfriend);

app.get('/play', game.play);
app.get('/get-friends', pass.ensureAuthenticated, mainpage.friendload);
app.get('/hub', pass.ensureAuthenticated, mainpage.hub);
app.get('/contact', mainpage.contact);
app.get('/register', mainpage.register);
app.get('/logout', mainpage.logout);
app.get('/screenshots', mainpage.screenshots);
app.get('/home', index.home);
app.get('/', index.home);


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', game.connected);


