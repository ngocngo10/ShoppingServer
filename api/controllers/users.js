var express = require('express');
var router = express.Router();
const authMiddlewares = require('../middlewares/auth.middleware');

/* GET users listing. */
router.get('/api/users', [authMiddlewares.verifyToken],async function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
