var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fileStore = require('session-file-store')(session);
var passport =require('passport');
var authenticate =require('./authenticate');

const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');


var app = express();
//redirect all traffic to the secure server
app.all('*',(req,res,next)=>{
  if(req.secure){//if the incoming request is a secure request
      return next(); //pass it to its handler
  }
  else{//if the request is coming to the insecure server
    //307 is a statusCode that means the the requested resource resides temporarily on a different url
    res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
  }
});

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
// app.use(session({
//   name: 'session-id',
//   secret:'12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new fileStore()
// }));

app.use(passport.initialize());
//app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// function auth(req,res,next){//this is applied to every request
//   if(!req.user){
//       var err = new Error('You are not authenticated');
//       err.status=403;
//       return next(err);
//     }
//   else{
//     next();
// }
// }

//app.use(auth);//before the client can access any of the following lines , he must be authenticated

app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageupload',uploadRouter);
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
  console.log('in the express error handler');
  console.log(err.status);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
