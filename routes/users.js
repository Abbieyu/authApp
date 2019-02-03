var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
router.use(bodyParser.json());
var passport = require('passport');
var authenticate = require('../authenticate');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//post on users/signup
router.post('/signup',function(req,res,next){
  User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-type','application/json');
      res.json({err:err});
    }
    else{
      passport.authenticate('local')(req,res,()=>{
      res.statusCode = 200;
      res.setHeader('Content-type','application/json');
      res.json({success:true,status:'Registration Successful'});//return the user
      })
    }
  });
});

// /login
router.post('/login',passport.authenticate('local'),(req,res)=>{//when the authentical('local') successfully authenticates the user, this will load the user
  var token = authenticate.getToken({_id:req.user._id});//create a token
  res.statusCode = 200;
  res.setHeader('Content-type','application/json');
  res.json({success:true,token:token,status:'You are Successfully logged in'});//pass it back to the user
});

router.get('/logout',(req,res,next)=>{
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
