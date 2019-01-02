const mongoose = require('mongoose');

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const leaderSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    designation:{
        type:String,
        required:true
    },
    abbr:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    featured:{
        type:Boolean
    }
},{timestamps:true});


const Leaders = mongoose.model('leader',leaderSchema);
module.exports=Leaders;