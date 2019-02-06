//this file here is to store and configure the authentication strategies
passport =require('passport');
var localStrategy =require('passport-local');//a strategy that can be used for the application
var User =require('./models/user');
//then go to this file and require the passport jwt strategy and then extract it
var JWTStrategy = require('passport-jwt').Strategy;//
var ExtractJWT = require('passport-jwt').ExtractJwt;//methods for extracting information from the request
var JsonWebToken = require('jsonwebtoken');

var config = require('./config');

//the User methods are supported by the local strategy
//had I not used the passport Mongoose plugin , then I need to write the authentication function by myself
exports.local = passport.use(new localStrategy(User.authenticate()));//the username and pw should be supplied in the body of the request
// I need to serialize and deserialize the user because I am using sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//takes a user parameter , and it will be used as the payload when creating the token
exports.getToken = function(user){
    console.log('getTOken');
    return JsonWebToken.sign(user,config.secretKey,{expiresIn:3600});//create the jwt takes the user,the secretkey and additional
}

var opts={};
//this option specifies how the jwt will be extracted from the request
opts.jwtFromRequest=ExtractJWT.fromAuthHeaderAsBearerToken();//the token will be in the header
opts.secretOrKey= config.secretKey;

exports.jwtPassport = passport.use(new JWTStrategy(opts,
    (jwt_payload,done)=>{//the done is a callback
    //console.log('JWT payload: ',jwt_payload);
    User.findOne({_id:jwt_payload._id},
        (err,user)=>{
        if(err){
            console.log('error');
            return done(err,false);//there is an error, we send the error and not the user
        }
        else if(user){
            console.log('found the user');
            return done(null,user);//there is no error,we send the user and not the error
        }
        else{
            console.log('otherwise');
            return done(null,false);// dont send the error nor the user
        }
    });
}));

exports.verifyUser = passport.authenticate('jwt',{session:false});

exports.verifyAdmin = (req,res,next)=>{
    console.log('verifydmin');
    console.log('admin=',req.user.admin);
    if(req.user.admin)
    {
        console.log('user found');
        next();
    }
    else{
        console.log('user not found');
        var err = new Error('You are not authorized to perform this operation!');
        err.status=403;
        next(err);
    }
}