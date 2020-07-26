const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception!! 💥💥 Shutting Down !!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Successful'));

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`App Running on Port ${port} .... `);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection !! 💥💥 Shutting Down !!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
