import mongoose from 'mongoose';
import { CheckoutService } from './services/CheckoutService';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    const checkout = new CheckoutService();
    await checkout.initPricingRules();
    checkout.scan('A');
    checkout.scan('B');
    checkout.scan('C');
    console.log(checkout.total());
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();


main();
