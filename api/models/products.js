var mongoose = require('mongoose');
var productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    //name: String,
    //price:Number
    name: {type:String, required:true},
    price:{type:Number, required:true},
    productImage:{type:String, required:true}
})

module.exports = mongoose.model('Products',productSchema,'Products');