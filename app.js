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

app.get('/', (req, res) => {
  res.send('index.html');
});

app.use('/products', router.product);

//404 catch
app.use((req, res) => {
  res
    .status(404)
    .json({ error: '404. Sorry we can find this route. Try again' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
