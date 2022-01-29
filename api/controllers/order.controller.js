const express = require('express');
const route = express.Router();
const Order = require('../models/order.model');
const middlewares = require('../middlewares/auth.middleware');

// Create new order
route.post('/api/orders', middlewares.verifyToken, async function (req, res, next) {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      })

      const createdOrder = await order.save();

      return res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }

})

// Get all orders
route.get('/api/orders', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    const orders = await Order.find({}).populate('user', 'id name')
    return res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }

})

//Get order by ID
route.get('/api/orders/:id', [middlewares.verifyToken], async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    return res.json(order);
  } catch (error) {
    console.log(error);
   return res.status(404).json({message: 'Order not found' });
  }

})




module.exports = route;