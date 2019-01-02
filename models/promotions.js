const mongoose = require('mongoose');

require('mongoose-currency').loadType(mongoose);
const currency = mongoose.Types.Currency;

const promostionSchema = mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    image:{
        type: String
    },
    label : {
        type : String,
        default:" "
    },
    price :{
        type : currency,
    },
    description : {
        type : String,
        required : true
    },
    featured : {
        type : Boolean,
    }
},{
    timestamp : true
});


var promotions = mongoose.model('promotion',promostionSchema);
module.exports = promotions;