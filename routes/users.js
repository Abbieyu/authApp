var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//post on users/signup
router.post('/signup',function(req,res,next){
  console.log('I am here');
  User.findOne({username:req.body.username})
  .then((user)=>{
      console.log('returned a user');
      if(user!=null){//if there is no previous user with the same username
        var err = new Error('User '+req.body.username+' already exists');
        err.status= 403;//unauthorized
        next(err);
      }
      else{//there is no previous user , create a new user
        console.log('creating the user');
        return User.create({
          username:req.body.username,
          password:req.body.password//this is wrong XD
        })
  .then((user)=>{//this is the then of the Create function
    res.statusCode = 200;
    console.log('A i m here');
    res.setHeader('Content-type','application/json');
    res.json({status:'Registration Successful',user:user});//return the user
  },(err)=>{console.log('here');next(err);})
  .catch((err)=>{console.log('here2');next(err)});
}
});
});

// /login
router.post('/login',(req,res,next)=>{
  var authHeader = req.headers.authorization;
  if(!req.session.user){
  if(!authHeader){//the client did not provide username and password
    var err = new Error('You are not authenticated');
    res.setHeader('WWW-Authenticate','Basic');
    err.status=401;
    return next(err);
  }
  var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
  var username = auth[0];
  var password = auth[1];
  User.findOne({username:username})//find the user that the request specifies
  .then((user)=>{
    if(user===null){//the user does not exist
      var err = new Error('User : '+username+' does not exist');
      err.status=403;
      return next(err);
    }
    else if(user.password!==password){//the user provided a wrong password
      var err = new Error('your password is incorrect');
      err.status=403;
      return next(err);
    }
    else if(user.username==username && user.password==password){//the password part is redundant
      req.session.user = 'authenticated';
      res.statusCode=200;
      res.setHeader('content-type','text/plain');
      res.end('You are authenticated');
    }
  })
  .catch((err)=>next(err));
}//end the first if
  else{//the user is already logged in
    res.statusCode=200;
    res.setHeader('contenet-type','text/plain');
    res.end('You are already authenticated');
  }
});

router.get('/logout',(req,res)=>{
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else{//the user is not logged in
    var err = new Error('You are not logged in');
    err.status=403;//forbidden
    next(err);
  }
});

module.exports = router;
