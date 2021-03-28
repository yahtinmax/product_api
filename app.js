require('dotenv').config();

const express = require('express'),
  router = require('./routers'),
  bodyParser = require('body-parser'),
  path = require('path'),
  db = require('./db');

const PORT = process.env.PORT;

const app = express();
//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/products', router.product);

app.use((error, req, res, next) => {
  res.status(error.output ? error.output.statusCode || 500 : 500).json({
    error: error.output ? error.output.payload.message : 'Inernal server error',
    data: null,
  });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ error: '404. Sorry we cant find this route. Try again' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
