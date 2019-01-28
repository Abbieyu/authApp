//this file here is to store and configure the authentication strategies
passport =require('passport');
var localStrategy =require('passport-local');//a strategy that can be used for the application
var User =require('./models/user');

//the User methods are supported by the local strategy
//had I not used the passport Mongoose plugin , then I need to write the authentication function by myself
exports.local = passport.use(new localStrategy(User.authenticate()));//the username and pw should be supplied in the body of the request
// I need to serialize and deserialize the user because I am using sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());