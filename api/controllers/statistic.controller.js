const express = require('express');
const route = express.Router();
const Order = require('../models/order.model');
const moment = require('moment');
const middlewares = require('../middlewares/auth.middleware');

route.post('/api/statistics', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    const { 
      startTime,
      endTime,
      limit,
      sortType,
      orderBy
    } = req.body;
    const start = startTime ? moment(startTime) : moment();
    const end = endTime ? moment(endTime) : moment()
    const orders = await Order.find({
      isPaid: true,
      createdAt: {
        $gt: start, $lt: end
      }
    }).populate('orderItems.product');
    const {sale, totalTaxPrice, totalShippingPrice } = orders.reduce(
      (pre, item) => {
        pre.sale = pre.sale + item.totalPrice;
        pre.totalTaxPrice = pre.totalTaxPrice + item.taxPrice;
        pre.totalShippingPrice = pre.totalShippingPrice + item.shippingPrice;
        return pre
      },
      {
        sale: 0.0,
        totalTaxPrice: 0.0,
        totalShippingPrice: 0.0
      });

    const products = orders.reduce((pre, item) => {
      item.orderItems.forEach(element => {
        const existProduct = pre[element.product._id.toString()];
        if (existProduct) {
          existProduct.qty = existProduct.qty + element.qty;
          existProduct.sale = existProduct.sale + element.qty * element.price;
        } else {
          pre[element.product._id.toString()] = {
            qty: element.qty,
            sale: element.qty * element.price,
            product: element.product
          }
        }
      });
      
      return pre;
    }, {});

    const listProduct = Object.values(products)
      .sort((pre, next) => {
        if (orderBy === 'QTY') {
          return sortType === 'DESC' ? next.qty - pre.qty : pre.qty - next.qty
        } else {
          return sortType === 'DESC' ? next.sale - pre.sale : pre.sale - next.sale
        }
      })
      .slice(0, limit || 10);
    const result = {
      totalSale: sale,
      totalTaxPrice,
      totalShippingPrice,
      products: listProduct
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: 'Order not found' });
  }
})

module.exports = route;
