const express = require('express');
const route = express.Router();
const Product = require('../models/product.model');
const middlewares = require('../middlewares/auth.middleware');

//getAllProducts
route.get('/api/products', async function (req, res, next) {
  try {
    var products = await Product.find({});
    console.log('getAllProducts: ' + products);
    return res.json(products);
  } catch (error) {
    console.log(error);
    next(error);
  }

})

//getProductsCategories
route.get('/api/products/categories', async function (req, res, next) {
  try {
    var categories = await Product.distinct('category').exec();
    console.log('getProductsCategories: ' + categories);
    return res.json(categories);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//getProductsInCategory

route.get('/api/products/category/:category', async function (req, res, next) {
  const category = req.params.category;
  try {
    var products = await Product.find({ category: category }).exec();
    console.log('getProductsInCategory: ' + products);
    return res.json(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//getProduct
route.get('/api/products/:_id', async function (req, res, next) {
  try {
    var product = await Product.findOne({ _id: req.params._id }).exec();
    console.log(product);
    return res.json(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//add new Product
route.post('/api/products', middlewares.checkIsAdmin, async function (req, res, next) {
  if (typeof req.body === undefined) {
    return res.json({
      status: "Error",
      message: "Data is undefined"
    });
  }
  
  const product = {
    title: req.body.title,
    price: Number(req.body.price),
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
  };
  try {
    var result = await Product.create(product);
    console.log('add new Product' + result);
    return res.json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
})






module.exports = route;