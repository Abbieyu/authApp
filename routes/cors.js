// configure the cors module
const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000','https://localhost:3443'];
var corsOptionsDelegate = (req,callback)=>{
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin'))!==-1)//if the incoming req's header contains an origin field, then check if it is in the whitelist
        corsOptions = {origin :true};
    else{
        corsOptions = {origin:false};
    }
    callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);