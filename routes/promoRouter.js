const Express = require('express');
const BodyParser = require('body-parser');
const promoRouter = Express.Router();
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
promoRouter.use(BodyParser.json());

promoRouter.route('/')
// .all((req,res,next)=>{
//     res.statusCode=200;
//     res.setHeader('content-type','text/plain');
//     next();
// })
.get((req,res,next)=>{
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(promotions);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    Promotions.create(req.body)
    .then((promo)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(promo);
    },(err)=>{console.log(err)})
    .catch((err)=>{next(err)});
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation is not supported on /promotions');
})
.delete((req,res,next)=>{
    Promotions.remove({})
    .then((result)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(result);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

promoRouter.route('/:promoId')
.get((req,res,next)=>{
   Promotions.findById(req.params.promoId)
   .then((promo)=>{
       res.statusCode=200;
       res.setHeader('content-type','application/json');
       res.json(promo);
   },(err)=>next(err))
   .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /promotions/'+req.params.promoId);
})
.put((req,res,next)=>{
   Promotions.findByIdAndUpdate(req.params.promoId,{$set:req.body},{new:true})
   .then((promo)=>{
    res.statusCode=200;
    res.setHeader('content-type','application/json');
    res.json(promo);
   },(err)=>next(err))
   .catch((err)=>next(err));
})
.delete((req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((result)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(result);
    },(err)=>log(err))
    .catch((err)=>next(err));
});

module.exports = promoRouter;
