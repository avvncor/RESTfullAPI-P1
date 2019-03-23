var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user')
var bcrypt = require('bcryptjs');
var jwt =require('jsonwebtoken');
var checkAuth = require('../middleware/check-Auth');

router.post('/signup',checkAuth, (req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
       // console.log(user)
        if(user.length>=1)
        {
            return res.status(409).json({
                message:'Email Exits'
            })
        }
        else
        {
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err)
                {
                   return  res.status(500).json({message:err})
                }
                else
                {
                    var user = new User
                    (
                      {
                        _id : mongoose.Types.ObjectId(),
                        email : req.body.email,
                        password:hash 
                      }
                    )
        
                    user.save()
                    .then(result=>{
                        console.log(result)
                        res.status(201).json({
                        message:"User Created"})
                       
                    })
                    .catch(err=>{
                        console.log(err)
                        res.status(500).json({
                            err:err
                        })
                    }
                        
                    );
                    
                }
            })
        }
    }) 
});

router.post('/login',(req,res, next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1)
        {
            return res.status(401).json({
                message:'Auth Failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password,(err,result)=>{
            if(err)
            {
                return res.status(401).json({
                    message:'Auth Failed'
                })
            }
            if (result)
            {
               var token = jwt.sign({
                    email:user[0].email,
                    userId:user[0]._id
                }, process.env.JWT_KEY,
                {
                    expiresIn:"1h"
                })
                return res.status(200).json({
                    message:'Auth Successful',
                    token:token
                })
            }
            res.status(401).json({
                message:'Auth Failed'
            })
        })
    })
    .catch(err=>res.status(200).json({error:err}));
})

router.delete('/:id',checkAuth,(req, res, next)=>{
    User.remove({_id:req.params.id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:"User Deleted"
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(200).json({
            error:err
        })
    })
})

router.get('/users',checkAuth,(req, res, next)=>{
 
    User.find()
    .select('_id email password')
    .exec()
    .then(user=>{
           res.status(200).json(user)
      })
    .catch(err=>res.status(500).json({error:err}))
})

module.exports =router;