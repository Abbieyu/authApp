const Express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../models/leaders');
const leaderRouter = Express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')

.get((req,res,next)=>{
    Leaders.find({})
    .then((leaders)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(leaders);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    Leaders.create(req.body)
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation is not supported on /leaders');
})
.delete((req,res,next)=>{
    Leaders.remove({})
    .then((result)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(result);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

leaderRouter.route('/:leaderId')
.get((req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation is not supported on /leaders/'+req.params.leaderId);
})
.put((req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.leaderId,{$set:req.body,new:true})
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('content-type','appliaction/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete((req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

module.exports = leaderRouter;