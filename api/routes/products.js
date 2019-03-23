var express = require('express');
var router = express.Router()
var mongoose = require('mongoose');
var Product = require('../models/products');
var multer = require('multer');
var checkAuth = require('../middleware/check-Auth');

//File Name and Storage
var storage = multer.diskStorage({
    destination:  function(req, file, cb){
        cb(null,'./uploads/');
    },

    filename: function(req, file, cb){
        cb(null,Date.now()+file.originalname);
    }
})

//Filter
var fileFilter = (req, file, cb)=>{
    if(file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg' || file.mimetype==='image/png' )
    {
        cb(null,true)
    }
    else
    {
        cb(null,false)
    }
    
}

//Assigning storage, fileSize limit, and FileFilter
var upload = multer
(
    {
        storage:storage,
        limits:
          {
             fileSize:1024*1024 *5
          },
        fileFilter:fileFilter
    }
)

//GET ALL PRODUCTS
router.get('/',function(req,res,next){

        Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs=>{
            var response = {
                count: docs.length,
                product: docs.map(doc=>{
                    return {
                        name:doc.name,
                        price:doc.price,
                        id:doc._id,
                        Image:'localhost:5000/'+doc.productImage,
                        request:{
                            type:'GET',
                            url:'http://localhost:5000/products/'+doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err=>res.status(500).json({error:err}))
       // res.status(200).json({
       //     message:"handling /Get requests to /products"
       // })
});

//POST A PRODUCT
router.post('/',checkAuth, upload.single('productImage'),function(req,res){
    //var product = {
    //    name: req.body.name,
    //    price:req.body.price
    //}
    console.log(req.file)
    var product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    })
    product.save().then((result)=>{
        res.status(201).json({
            message:"Created Product Successfully",
            createdProduct: {
                name:result.name,
                price:result.price,
                image:result.productImage,
                request:{
                    type:'GET',
                    url:'http://localhost:5000/products/'+result._id
                 }
            }
        })
    })
    .catch(err=>{console.log(err);
        res.status(500).json({
            
            error:err
        })
    });
   
})

//GET A PRODUCT BY ID
router.get('/:id',(req,res,next)=>{
    var id = req.params.id;
     Product.findById(id)
     .select('name price _id productImage')
     .exec()
     .then(docs =>{
         if(docs!==null)
         {
            console.log(docs)
            res.status(200).json({Product:{
                name:docs.name,
                id:docs._id,
                Image:docs.productImage,
                Price:docs.price,
                request:{
                    type:'GET',
                    url:'http://localhost:5000/products'
                }
            }})
         }
        else{
           res.status(404).json({
               Message:'Not Found'
           })
        }     
     })
     .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})


//UPDATE
router.patch('/:id',checkAuth, function(req,res){ 
    var id = req.params.id;
    var updateOps = {};
   for (var ops of req.body)
   {
        updateOps[ops.newName]=ops.value;
        //        price/name
   }

    Product.update({_id:id},{$set: updateOps})
    .exec()
    .then(result=>res.status(200).json({'Message':'Product Updated ',"request":{
        type:'GET',
        url:'http://localhost:5000/products/'+id
    }}))
    .catch(err=>res.status(500).json({Error:err}))
   
} )

//DELETE
router.delete('/:id',checkAuth, function(req,res){ 
    var id = req.params.id;
    Product.remove({_id:id})
    .exec()
    .then(result=>res.status(200).json({message:"Deleted",
  request:{
      type:'POST',
      url:'http://localhost:3000/products',
      body: {
          name:'String',
          price:'Number'
      }
  }
}))
    .catch(err=>res.status(500).json({Error:err}))
   // res.status(200).json({
    //    message: 'Deleted Product'
    //})
} )

//DUMMY / PRACTICE
router.get('/:id1/:id2',function(req,res){ 
    x=  req.params.id1; y = req.params.id2;
    var sum = parseInt(x)+ parseInt(y);
    res.status(200).json({
        message: sum
    })
} )

module.exports = router;