const express = require('express');
const cors = require('cors');
const bankRoutes = require('./routes/bankRoutes');
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/banks', bankRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);

app.get('/', (req, res) => {
  res.send("hello bank");
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
