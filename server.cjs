require('dotenv').config();
const express = require('express');
const path = require('path');
const usersRouter = require('./api/users.cjs');
const mime = require('mime-types');

const app = express();

app.use(express.static(path.join(__dirname,'dist')));

app.use((req, res, next) => {
  const type = mime.lookup(req.path);
  if (type) {
    res.setHeader('Content-Type', type);
  }
  next();
});

app.use(express.json());

app.use('/api/v1/users', usersRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((req,res) => {
  res.status(404).json({message: 'I did not find a route there!'});
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({message: 'Server-sided error'});
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`Express listening on PORT: ${PORT}...`)
})
