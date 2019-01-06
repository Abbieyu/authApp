var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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
app.use(cookieParser('12345-67890-09876-54321'));

function auth(req,res,next){
  console.log('logging the header',req.headers);
  console.log('logging the cookies',req.signedCookies);
  if(!req.signedCookies.user){//if there is no cookie, authenticate the user using basic authentication
    var authHeader = req.headers.authorization;

    if(!authHeader){//the client did not provide username and password
      var err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status=401;
      return next(err);
    }

    //extract the authheader by splitting the value, -
    //the second element of the Array is where the base64 encoded string exists -
    //then splitting on the : that separates the un an the pw
    var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];
    //when the basic authentication is successful,create the cookie
    if(username==='admin' && password==='password'){//here we will setup the cookie
      res.cookie('user','admin',{signed :true});
      next();//pass the request to the next middleware
    }
    else{
      var err = new Error('You are not authenticated');
      err.status=401;
      return next(err);
    }
  }
  else{//if a cookie exists
    if(req.signedCookies.user==='admin')
    {
      next();
    }
    else{
      var err = new Error('You are not authenticated');

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
