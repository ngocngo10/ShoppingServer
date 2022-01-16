const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: schema.Types.Number,
    ref: User,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  products: [
    {
      productId: {
        type: schema.Types.Number,
        ref: Product,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
})

var Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
