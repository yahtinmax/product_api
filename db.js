const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection
  .on('error', (error) => console.log(error))
  .on('close', () => console.log('Database connection closing...'))
  .once('open', () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  });

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = mongoose;
