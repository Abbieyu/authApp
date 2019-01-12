//schema and the model for the dishes document
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;


//use the currency module
require('mongoose-currency').loadType(Mongoose);
const currency = Mongoose.Types.Currency;

//the comment schema
const commentSchema = new Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    comment:{
        type:String,
        required:true,
    },
    author:{
        type:String,
        required:true,
    },
},
{timestamps:true}
);

//the dish schema
const dishSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },

    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    label:{
        type:String,
        default:''
    },
    price:{
        type:currency,
        required:true,
        min:0
    },
    featured:{
        type:Boolean,
        default:false
    },
    comments:[commentSchema]//every dish can have multiple comments
},{
    timestamps:true//automatically creates and updates: createdAt and updatedAt
});



var dishes = Mongoose.model('Dish',dishSchema);
module.exports = dishes;