var express = require ('express');
var app =express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//References to Routs 
var productRoutes =  require('./api/routes/products');
var orderRoutes   =  require('./api/routes/orders');
var userRoutes = require('./api/routes/user')

//Connecting Database 
mongoose.connect('mongodb+srv://amaan:'+process.env.MONGO_ATLAS_PW+'@node-rest-shop-uxbrq.mongodb.net/test?retryWrites=true',{useNewUrlParser:true});
mongoose.Promise = global.Promise;
//MiddleWare
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/uploads',express.static('uploads'))
//CORS
app.use((res,req,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type, Accept, Authorization');
    if(req.method==='OPTIONS')
    {
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.status(200).json({});
    }
    next();
})

//Routes which should handle requests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);

app.use((req,res,next)=>{
     var error = new Error('Not Found, Look Around :)');
     error.status =404;
     
     next(error);
})

 app.use((error,req,res,next)=>{
     res.status(error.status || 500);
     res.json({      
             Error: error  
     })
 })
 module.exports =app;