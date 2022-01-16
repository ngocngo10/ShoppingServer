const express = require('express');
const req = require('express/lib/request');
const User = require('../models/user.model');
const route = express.Router();
const middlewares = require('../middlewares/auth.middleware');
const jwt = require("jsonwebtoken");
const Auth = require('../models/auth.model');
require('dotenv').config();
// ma hoa mat khau
const bcrypt = require('bcryptjs');
const { token } = require('morgan');
let tokens = [];

route.post('/api/auth/signup', [middlewares.checkUserExist], async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);

  // ---------them middle xu li testcase signup

  const user = {
    userName: req.body.userName,
    password: bcrypt.hashSync(req.body.password, salt),
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    name : {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
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

// route.post('/api/auth/refreshToken', (req, res) => {
//   //kiem tra client gui refreshToken gui len co hop le hay khong
//   const refreshToken = req.body.token;
//   if (!refreshToken) {
//     return res.status(401).json({ message: "Not seen refreshToken!" }); // dang nhap het han
//   }
//   console.log(refreshTokens);
//   if (!refreshTokens.includes(refreshToken)) {
//     return res.status(403).json({ message: "Please login again!" }); // k co quyen
//   }
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.status(403).json(err);
//     }
//     const accessToken = jwt.sign(
//       {
//         username: data.userName
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       {
//         expiresIn: '3600s',
//       }
//     );
//     return res.json({ accessToken });
//   })

// })

// ---------them middle xu li testcase login
route.post('/api/auth/login',middlewares.isLogin, async function (req, res, next) {
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
    var accesstoken = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin,
      userName: user.userName,
      fullName: user.firstName + user.lastName
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600s" });

    var auth = {
      user: user._id,
      token: accesstoken,
      expires: new Date(Date.now() + 3600 * 1000)

    }

    try {
      var result = await Auth.create(auth);
      console.log("Author: " + result);
    } catch (error) {
      next(err);
    }

    // const refreshToken = jwt.sign({
    //   id: user._id,
    //   isAdmin: user.isAdmin,
    //   userName: user.userName,
    //   fullName: user.firstName + user.lastName
    // }, process.env.REFRESH_TOKEN_SECRET);

    tokens.push(accesstoken);
    console.log('TokesArray: ' + tokens);
    return res.json({
      accesstoken: accesstoken,
      // refreshToken
    });
  } catch (error) {
    console.log(error);
    next(error);
  }

});

route.get('/api/auth/logout',middlewares.verifyToken, async function (req, res, next) {
  const accesstoken = req.headers.authorization;
  try {
    var result = await Auth.remove({ token: accesstoken });
    console.log(result);
    return res.status(200).send("logout");
  } catch (error) {
    next(error);
  }


})



module.exports = route;
