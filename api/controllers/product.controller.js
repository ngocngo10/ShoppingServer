const express = require('express');
const route = express.Router();
const Product = require('../models/product.model');
const middlewares = require('../middlewares/auth.middleware');

//getAllProducts *
route.get('/api/products', async function (req, res, next) {
  // const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  // const keyword = req.query.keyword
  //   ? {
  //       name: {
  //         $regex: req.query.keyword,
  //         $options: 'i',
  //       },
  //     }
  //   : {}

  try {
    const count = await Product.countDocuments({});
    const products = await Product.find({}).limit(pageSize).sort({ price: sort }).skip(pageSize * (page - 1));
    console.log('getAllProducts: ' + products);
    return res.json({ products, page, pages: Math.ceil(count / pageSize) });
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

//get single Product  by ID *
route.get('/api/products/:id', async function (req, res, next) {
  try {
    var product = await Product.findOne({ _id: req.params.id }).exec();
    console.log(product);
    return res.json(product)

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Product not found' });
  }
})

//get Top Products *
route.get('/api/productss/top', async function (req, res, next) {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products)
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// createProductReview *
route.post('/api/products/:id/reviews', [middlewares.verifyToken], async function (req, res, next) {
  const { rating, comment } = req.body;

  try {

    const product = await Product.findById(req.params.id);
    const alreadyReviewed = product.reviews.find( function(r){
      return r.user.toString() === req.user._id.toString();
    })

    if (alreadyReviewed) {
      return res.status(400).json({message: 'Product already reviewed' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    // acc : accumulator
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });

  } catch (error) {
    res.status(404).json({ message: 'Product not found' });
  }
  
})


//add new Product *
route.post('/api/admin/products', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  // if (typeof req.body === 'undefined') {
  //   return res.json({
  //     status: "Error",
  //     message: "Data is undefined"
  //   });
  // }

  const product = {
    productCode: 100,
    name: 'Sample name',
    price: 0,
    // user: req.user._id,
    image: '/images/sample.jpg',
    // brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description'
  };
  try {
    var createdProduct = await Product.create(product);
    console.log('add new Product' + createdProduct);
    return res.status(201).json(createdProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Invalid user data' });
  }
})

//deleteProduct *
route.delete('/api/admin/products/:id', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  if (typeof req.params.id === null) {
    return res.json({
      status: "Error",
      message: "Data is undefined"
    });
  }
  try {
    const product = await Product.findById(req.params.id)
    await product.remove();
    return res.json({ message: 'Product removed' });

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Product not found' });
  }
});

//editProduct *
route.put('/api/admin/products/:id', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {

  try {
    const {
      name,
      price,
      description,
      image,
      category,
      countInStock,
    } = req.body

    const product = await Product.findById(req.params.id);
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    return res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Product not found' });
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
    return res.json({ message: "Update Product OK!" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});










module.exports = route;