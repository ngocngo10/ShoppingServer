const express = require('express');
const req = require('express/lib/request');
const User = require('../models/user');
const route = express.Router();
const middlewares = require('../middlewares/auth.middleware');
const jwt = require("jsonwebtoken");
// ma hoa mat khau
const bcrypt = require('bcryptjs');

route.post('/api/auth/signup', [middlewares.checkUserExist], async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);

  // ---------them middle xu li testcase signup

  const user = {
    userName: req.body.userName,
    password: bcrypt.hashSync(req.body.password, salt),
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: {
      city: req.body.city,
      street: req.body.street,
      number: req.body.number
    },
    phoneNumber: req.body.phoneNumber
  }
  try {
    var result = await User.create(user);
    console.log(result);  
    return res.json({ userName: result.userName });
  } catch (error) {
    next(error);
  }

})

// ---------them middle xu li testcase login
route.post('/api/auth/login', async function (req, res, next) {
  try {
    var user = await User.findOne({
      userName: req.body.userName
    });
    if (!user) {
      return res.json({ message: 'Username or password is incorrect' });
    }
    const camparetion = bcrypt.compareSync(req.body.password, user.password);
    if (!camparetion) {
      return res.json({ message: 'Username or password is incorrect' });
    }
    var token = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin,
      userName : user.userName,
      fullName: user.firstName + user.lastName
    }, 'shhhhh');
    return res.json({ token: 'Bearer ' + token });
  } catch (error) {
    console.log(error);
    next(error);
  }

})

module.exports = route;
