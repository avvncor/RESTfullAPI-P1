var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var checkAuth = require('../middleware/check-Auth');
//13.29
var Order = require('../models/orders');
var Product = require('../models/products');

router.get('/',checkAuth,(req,res,next)=>{
   Order.find()
   .select('product _id quantity')
   .populate('product', 'name _id')
   .exec()
   .then(docs=>res.status(200).json({
       count:docs.length,
       orders: docs.map(doc=>{
           return{
               _id: doc._id,
               Products:doc.product,
               quantity:doc.quantity,
               request:{
                   type:'GET',
                   url:'http://localhost:5000/orders/'+doc._id
               }
           }
       })
   }))
   .catch(err=>res.status(500).json({error:err}))
})

router.post('/',checkAuth, (req,res,next)=>{
      Product.findById(req.body.productId)
      .then(product=>{
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        var order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product:req.body.productId
        });

        order.save().then(result=>{
            res.status(201).json({
                message:'Order Successfully Placed',
                request:{
                    type:'GET',
                    url:'http://localhost:5000/orders/'+result._id
                }
            });
          }
        )
        .catch(err=>{res.status(500).json({error:err})})

      })
      .catch(err=>{
          res.status(500).json({
            
              Error:err
          })
      })

})

router.get('/:id',checkAuth,(req,res,next)=>{
   var id = req.params.id;
   Order.findById(id)
   .select('product _id quantity')
   .populate('product')
   .exec()
   .then(docs=>{
       if(!docs)
       return  res.status(404).json({message:'No Order Found'})

       res.status(200).json
       ({
         orders:
          {
            product:docs.product,
            ID:docs._id,
            Quantity:docs.quantity,
            request:{
                type:'GET',
                url:'http://localhost:5000/orders'
            }
          }
       })
   })
   
   .catch(err=>res.status(500).json({error:err}))
})

router.patch('/:id', (req,res,next)=>{
    res.status (200).json({
        message:"Order Updated"
    })
})

router.delete('/:id', checkAuth,(req,res,next)=>{
   Order.remove({_id:req.params.id})
   .exec()
   .then(result=>{
       res.status(200).json({
           message:'removed',
           request:{
               type:'POST',
               url:'http://localhost:5000/orders',
               body:{productId:'ID of Product',quantity: 'Number'}
           }
       })
   })
   .catch()
})

module.exports = router;