const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  id:{
    type:Number,
    // required:true
},
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  category: String
})
const Product = mongoose.model('Product', productSchema, 'products');
module.exports = Product;
