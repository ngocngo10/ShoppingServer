const express = require('express');
const route = express.Router();
const User = require('../models/user.model');
const middlewares = require('../middlewares/auth.middleware');

route.post('/api/auth/signup', [middlewares.checkUserExist, middlewares.checkConfirmPass], async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);

  // ---------them middle xu li testcase signup

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt),
    isAdmin: false,
    isLock: false,
    // name: {
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    // },
    address: {
      city: req.body.city,
      street: req.body.street,
      number: req.body.number
    },
    phoneNumber: req.body.phoneNumber
  }
  try {
    var result = await User.create(user);
    const cart = {
      user: result._id,
      products: []
    }
    await Cart.create(cart);
    return res.json({
      email: result.email,
      name: result.name
    });
  } catch (error) {
    next(error);
  }

})
module.exports = route;