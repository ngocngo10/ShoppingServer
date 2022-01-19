const express = require('express');
const route = express.Router();
const User = require('../models/user.model');
const middlewares = require('../middlewares/auth.middleware');

route.patch('/api/admin/lockuser/:id', [middlewares.checkIsAdmin], async function (req, res, next) {
  if (typeof req.body == 'undefined' || req.params.id === null) {
    return res.json({
      status: "Error",
      message: "Something went wrong! check your sent data"
    });
  }
  
  try {
    var result = await User.updateOne({
      _id: req.params.id
    },
      {
        isLock: req.body.isLock
      },
    )
    console.log('User have been locked' + result);
    if(req.body.isAdmin){
      return res.json({message: "User have been locked"});
    }
    return res.json({message: "User have been unlocked"});
  } catch (error) {
    console.log(error);
    next(error);
  }

 

})
module.exports = route;