const express = require('express');
const route = express.Router();
const Cart = require('../models/cart.model');
// const Auth = require('../models/auth.model');
const middlewares = require('../middlewares/auth.middleware');

//getAllCarts
route.get('/api/carts', middlewares.checkIsAdmin, async function (req, res, next) {
  const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  try {
    var carts = await Cart.find({}).populate('user').populate('products.product').limit(limit);
    console.log('getAllCarts: ' + carts);
    return res.json(carts);
  } catch (error) {
    console.log(error);
    next(error);
  }

})
//getSingleCart By cartID
route.get('/api/carts/cart/:id', middlewares.checkIsAdmin, async function (req, res, next) {
  const id = req.params.id;
  try {
    var cart = await Cart.findOne({ _id: id }).populate('products.product');
    console.log('getAllCarts: ' + cart);
    return res.json(cart);
  } catch (error) {
    console.log(error);
    next(error);
  }

})

//getSingleCart By userID
route.get('/api/carts/user/:userId', middlewares.checkIsAdmin, async function (req, res, next) {
  const userId = req.params.userId;
  try {
    var cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');
    console.log('getSingleCart By userIDs: ' + cart);
    return res.json(cart);
  } catch (error) {
    console.log(error);
    next(error);
  }

})

route.get('/api/carts/cart', middlewares.verifyToken, async function (req, res, next) {
  const userId = req.userId;
  try {
    var cart = await Cart.findOne({ user: userId }).populate('products.product');
    console.log('User get Cart : ' + cart);
    return res.json(cart);
  } catch (error) {
    console.log(error);
    next(error);
  }
})



//add new product to Cart
route.post('/api/carts', middlewares.verifyToken, async function (req, res, next) {
  const token = req.headers.authorization;
  try {
    var auth = await Auth.findOne({ token: token }).populate('user').exec();
    if (typeof req.body === 'undefined') {
      return res.json({
        status: "Error",
        message: "Data is undefined"
      });
    }
    const product = {
      product: req.body.productId,
      quantity: req.body.quantity
    }
    const cart = await Cart.findOne({ user: req.userId });
    const existProduct = cart.products.find(function (item) {
      return item.product.equals(req.body.productId)
    })
    if (existProduct) {
      existProduct.quantity = existProduct.quantity + +req.body.quantity;
    } else {
      cart.products.push(product);
    }
    await cart.save();
    return res.json({
      message: 'added product'
    })
  } catch (error) {
    next(error);
  }
})

//
//delete  product from Cart
route.delete('/api/carts/deleteproduct/:productId', middlewares.verifyToken, async function (req, res, next) {
  try {
    const productId = req.params.productId;
    const cart = await Cart.findOne({ user: req.userId});
    const deletedproducts = cart.products.filter(function(item){
      return !item.product.equals(productId);
    })
    cart.products = deletedproducts;
    await cart.save();
    return res.json({
      message: 'deleted product'
    })
  } catch (error) {
    next(error);
  }
})
// edit  product from Cart
route.patch('/api/carts/updateproduct/:productId/:quantity', middlewares.verifyToken, async function (req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedquantity = req.params.quantity;
    const cart = await Cart.findOne({ user: req.userId});
    const product = cart.products.find(function(item){
      return item.product.equals(productId);
    })
    product.quantity = updatedquantity;
    await cart.save();
    return res.json({
      message: 'updated product'
    })
  } catch (error) {
    next(error);
  }
})

module.exports = route;