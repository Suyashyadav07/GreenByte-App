const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/greenbyte');
  const User = require('./src/models/User');
  
  const phone = '9999999999';
  const existing = await User.findOne({ phone, role: 'customer' });
  if (existing) {
    // Update with password
    existing.password = await bcrypt.hash('000000', 10);
    existing.isVerified = true;
    await existing.save();
    console.log('Updated existing customer with password. ID:', existing._id);
  } else {
    const user = await User.create({
      name: 'Test Customer',
      phone,
      password: await bcrypt.hash('000000', 10),
      role: 'customer',
      isVerified: true
    });
    console.log('Created test customer. ID:', user._id);
  }
  
  // Also ensure the existing customer (Harsh) has a password
  const harsh = await User.findOne({ phone: '7276897685', role: 'customer' });
  if (harsh) {
    harsh.password = await bcrypt.hash('000000', 10);
    harsh.isVerified = true;
    await harsh.save();
    console.log('Updated Harsh customer with password. ID:', harsh._id);
  }
  
  await mongoose.disconnect();
}

main().catch(console.error);
