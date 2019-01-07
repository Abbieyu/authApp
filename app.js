var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fileStore = require('session-file-store')(session);

const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');


var app = express();


const url = 'mongodb://localhost:27017/confusion'
const connect = mongoose.connect(url);
connect.then((db)=>{
  console.log('connected correctly to the DB server');
},(err)=>console.log(err));//log the error if it exists



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id',
  secret:'12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new fileStore()
}));
function auth(req,res,next){
  console.log('logging the session',req.session);
  //console.log('logging the cookies',req.signedCookies);
  if(!req.session.user){//if there is no session, authenticate the user using basic authentication
    var authHeader = req.headers.authorization;
    console.log('I am here');
    if(!authHeader){//the client did not provide username and password
      var err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status=401;
      return next(err);
    }

    //extract the authheader by splitting the value, -
    //the second element of the Array is where the base64 encoded string exists -
    //then splitting on the : that separates the un an the pw
    console.log('I am there');
    var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];
    //when the basic authentication is successful,create the cookie
    if(username=='admin' && password=='password'){//here we will setup the cookie
      console.log('the username and password are correct');
      req.session.user = 'admin';//('user','admin',{signed :true});
      console.log('the error was before this');
      next();//pass the request to the next middleware
    }
    else{
      console.log('the user name and password are incorrect');
      var err = new Error('You are not authenticated');
      err.status=401;
      return next(err);
    }
  }
  else{//if a session exists
    if(req.session.user==='admin')
    {
      console.log('a session exists');
      next();
    }
    else{
      var err = new Error('You are not authenticated');
      console.log('a session does not exist');
      err.status=401;
      return next(err);
    }
}
}//end function

app.use(auth);//before the client can access any of the following lines , he must be authenticated
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
//server listener
const port = 3000;
app.listen(port,()=>{
  console.log('Server Started at port: '+port);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
