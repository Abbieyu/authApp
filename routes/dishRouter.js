//will contain the implementation of the handling REST api endpoints for /dishes and /dishes/dishId
const Express = require('express');
const bodyParser = require('body-parser');
const dishRouter = Express.Router();
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');
dishRouter.use(bodyParser.json());


dishRouter.route('/')
//if a preflighted req is coming (a request with options before the actual req)
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req,res,next)=>{//this is allowed without any restrictions
   // res.end('will send dish of details: '+req.params.dishId+' to you!');
    Dishes.find({})//this will return a promise
    .populate('comments.author')//the information of the author are populated
    .then((dishes)=>{//if the promise is returned correctly as 'dish'
        //handle the returned value here
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));//if an error is returned , pass it to the error handler
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{//if a request comes in, verify the user first, then allow access if successful
    console.log('we have entered');
    console.log(req.body);
    Dishes.create(req.body)
    .then((dish)=>{
        console.log('dish created: ',dish);
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    //res.end('deleting dish: '+req.params.dishId);
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});




dishRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populte('comments.author')
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
//post
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    console.log('inside');
    res.statusCode=403;//operation not supported
    res.end('POST operation not supported on /dishes');
})
//put
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new:true})//it will return the updated dish as a json reply
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
//delete
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    // res.end('deleting all the dishes');//ends the handling of the request
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});


//comments


dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req,res,next)=>{
    console.log('/comments/ log');
   // res.end('will send dish of details: '+req.params.dishId+' to you!');
    Dishes.findById(req.params.dishId)//this will return a promise
    .populate('comments.author')
    .then((dish)=>{//if the promise is returned correctly as 'dish'
        //handle the returned value here
        console.log('found dishes');
        if(dish!=null){
            console.log('le dish is not nulls');
            res.statusCode=200;
            res.setHeader('content-type','application/json');
            res.json(dish.comments);
        }
        else{
            console.log('le dish is nulls')
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>{next(err)})
    .catch((err)=>{next(err)});//if an error is returned , pass it to the error handler
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){//if the dish is found
            req.body.author = req.user._id;//populating the author information
            dish.comments.push(req.body);//push the comments
            dish.save()//save the dish
            .then((dish)=>{//then
                //populate the author's information to the dish before sending it back to the user
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode=200;
                        res.setHeader('content-type','application/json');
                        res.json(dish);//return the updated dish
                    })
            },(err)=>next(err));
        }
        else{//if the dish does not exist
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //res.end('deleting dish: '+req.params.dishId);
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){//if the dish is found
            for(var i = (dish.comments.length-1);i>=0;i--){
                dish.comments.id(dish.comments[i]._id).remove();//remove the comment at i
            }
            dish.save()
            .then((dish)=>{//then
                res.statusCode=200;
                res.setHeader('content-type','application/json');
                res.json(dish);//return the updated dish
            },(err)=>next(err));
        }
        else{//if the dish does not exist
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});




dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null && dish.comments.id(req.params.commentId)!=null){//make sure that the dish exists and the comments are not empty
            res.statusCode=200;
            res.setHeader('content-type','application/json');
            res.json(dish.comments.id(req.params.commentId));//get the specific comment
        }
        else if(dish==null){
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
        else{//the comment does not exist
            err = new Error('comment '+req.params.commentId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
//post
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('POST operation not supported on /dishes/'+req.params.dishId+'/comments/'+req.params.commentId);
})
//put
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //locate the comment
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        var id1=req.user._id;
        var id2=dish.comments.id(req.params.commentId).author;
        if(id1.equals(id2)){
            console.log('found a match');
            if(dish!=null && dish.comments.id(req.params.commentId)!=null){//the dish exists and the comment exists
                if(req.body.rating){
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.comment){
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save()//save the dish
                .then((dish)=>{//then
                    //populate the comment's author
                    Dishes.findById(dish._id)
                    .then((dish)=>{
                        res.statusCode=200;
                        res.setHeader('content-type','application/json');
                        res.json(dish);//return the updated dish
                    })
                },(err)=>next(err));
            }
        }
        else if(!(id1.equals(id2)))
        {
            console.log('no match');
            var err = new Error('You are not authorized to perform this op');
            err.status=403;
            next(err);
        }
        else if(dish==null){//the dish does not exist
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
        else{//the comment does not exist
            err = new Error('comment '+req.params.commentId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
//delete
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    // res.end('deleting all the dishes');//ends the handling of the request
    Dishes.findById(req.params.dishId)//first find the dish
    .then((dish)=>{
        var id1=req.user._id;
        console.log('id1=',id1);
        var id2=dish.comments.id(req.params.commentId).author;
        console.log(req.params.commentId);
        console.log('id2=',id2);
        if(id1.equals(id2)){
            console.log('entered');
            if(dish!=null && dish.comments.id(req.params.commentId)!=null){//the dish exists and the comment exists
                dish.comments.id(req.params.commentId).remove();//remove the comment
                dish.save()
                .then((dish)=>{//then
                    Dishes.findById(dish._id)
                    .then((dish)=>{
                        res.statusCode=200;
                        res.setHeader('content-type','application/json');
                        res.json(dish);//return the updated dish
                    })
                },(err)=>next(err));
            }
        }
        else if(!id1.equals(id2)){
            console.log('no match to delete');
            var err = new Error('You are not authorized to perform this operation');
            err.status = 403;
            next(err);
        }
        else if(dish==null){//if the dish does not exist
            err = new Error('Dish '+req.params.dishId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
        else{
            err = new Error('comment '+req.params.commentId+' was not found');
            err.status=404;
            return next(err);//pass the error to the error handler in app.js
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});



module.exports = dishRouter;