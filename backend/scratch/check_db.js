const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/greenbyte');
  const User = require('../src/models/User');
  const Pickup = require('../src/models/Pickup');
  
  const users = await User.find({ role: { $in: ['customer', 'recycler'] } }).lean();
  console.log('Users:');
  users.forEach(u => console.log(`- ${u.name} (${u.role}): ${u.phone} [ID: ${u._id}]`));
  
  const pickups = await Pickup.find().lean();
  console.log('\nPickups:');
  pickups.forEach(p => {
    console.log(`- Pickup ${p._id} [Status: ${p.status}]`);
    if (p.recyclerAssignment) {
      console.log(`  Assigned to: ${p.recyclerAssignment.recyclerName} (${p.recyclerAssignment.recyclerPhone}) [ID: ${p.recyclerAssignment.recycler}]`);
    } else {
      console.log('  Assigned to: None');
    }
  });
  
  await mongoose.disconnect();
}

main().catch(console.error);
