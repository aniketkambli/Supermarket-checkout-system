import mongoose from 'mongoose';

const specialPriceSchema = new mongoose.Schema({
  quantity: Number,
  totalPrice: Number
}, { _id: false });

const pricingRuleSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  unitPrice: { type: Number, required: true },
  specialPrice: { type: specialPriceSchema, required: false }
});

export default mongoose.model('PricingRule', pricingRuleSchema);