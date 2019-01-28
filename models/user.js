var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose=require('passport-local-mongoose');
var User = new Schema({//remove the username and password bc the passportlocal includes them
    admin:{
        type:Boolean,
        default:false
    }
});

User.plugin(passportLocalMongoose);//use the passportLocal
module.exports = mongoose.model('User',User);