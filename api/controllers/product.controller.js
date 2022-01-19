const express = require('express');
const route = express.Router();
const Product = require('../models/product.model');
const middlewares = require('../middlewares/auth.middleware');

//getAllProducts
route.get('/api/products', async function (req, res, next) {
  const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  try {
    var products = await Product.find({}).limit(limit).sort({ price: sort });
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
  const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  try {
    var products = await Product.find({ category: category }).limit(limit).sort({ price: sort }).exec();
    console.log('getProductsInCategory: ' + products);
    return res.json(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//getProduct
route.get('/api/products/:productCode', async function (req, res, next) {
  try {
    var product = await Product.findOne({ productCode: req.params.productCode }).exec();
    console.log(product);
    return res.json(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//add new Product
route.post('/api/products', middlewares.checkIsAdmin, async function (req, res, next) {
  if (typeof req.body === 'undefined') {
    return res.json({
      status: "Error",
      message: "Data is undefined"
    });
  }

  const product = {
    productCode: req.body.productCode,
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

//deleteProduct 
route.delete('/api/products/:productCode', middlewares.checkIsAdmin, async function (req, res, next) {
  if (typeof req.params.productCode === null) {
    return res.json({
      status: "Error",
      message: "Data is undefined"
    });
  }
  try {
    var result = await Product.remove({ productCode: req.params.productCode });
    console.log('Remove new Product' + result);
    return res.json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//editProduct 
route.put('/api/products/:productCode', middlewares.checkIsAdmin, async function (req, res, next) {
  if (typeof req.body == 'undefined' || req.params.productCode === null) {
    return res.json({
      status: "Error",
      message: "Something went wrong! check your sent data"
    });
  }
  console.log(req.body);
  
  try {
    var result = await Product.updateOne({
      productCode: req.params.productCode
    },
      {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category
      },
    )
    console.log('Update Product' + result);
    return res.json({message: "Update Product OK!"});
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.patch('/api/products/:productCode', middlewares.checkIsAdmin, async function (req, res, next) {
  if (typeof req.body == 'undefined' || req.params.productCode === null) {
    return res.json({
      status: "Error",
      message: "Something went wrong! check your sent data"
    });
  }
  console.log(req.body);
  
  try {
    var result = await Product.updateOne({
      productCode: req.params.productCode
    },
      {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category
      },
    )
    console.log('Update Product' + result);
    return res.json({message: "Update Product OK!"});
  } catch (error) {
    console.log(error);
    next(error);
  }
});










module.exports = route;