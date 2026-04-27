const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/greenbyte', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const phone = '7276897686';
  const result = await User.deleteMany({ phone });
  console.log(`Deleted ${result.deletedCount} users with phone ${phone}`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
