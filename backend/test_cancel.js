const mongoose = require('mongoose');
const Pickup = require('./src/models/Pickup');

mongoose.connect('mongodb://127.0.0.1:27017/greenbyte', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const pickup = await Pickup.findOne({});
  if (pickup) {
    console.log("Found pickup:", pickup._id);
    console.log("Current status:", pickup.status);
    
    // Simulate PATCH /pickups/:id/status
    pickup.status = 'cancelled';
    await pickup.save();
    console.log("Successfully cancelled pickup:", pickup._id);
  } else {
    console.log("No pickups found.");
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
