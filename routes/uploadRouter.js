//this router is going to support the uploading of the files
//image uploads
const Express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');


//configure multer to customize the way it handles the files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const imageFileFilter = (req,file,cb)=>{
    console.log('here in the filefilter');
    console.log(file);
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) //making sure that the file is an image 
    {   
        console.log('in the image filter');
        //if it is not an image
        return cb(new Error('You can upload only image files'),false);
    }
    cb(null,true);
}

const upload = multer({storage:storage, fileFilter:imageFileFilter})
const uploadRouter = Express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('Get operation not supported on /imageupload');
})
.post(
    authenticate.verifyUser,authenticate.verifyAdmin,
    upload.single('imageFile'),(req,res)=>{//upload a single image only
        console.log('in the uploadrouter');
        console.log(req.file);
        res.statusCode = 200;
        res.setHeader('content-type','applcation/json');
        res.json(req.file);// this path will contain the path to the file
    }
)
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('PUT operation not supported on /imageupload');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;//operation not supported
    res.end('DELETE operation not supported on /imageupload');
})
module.exports = uploadRouter;
