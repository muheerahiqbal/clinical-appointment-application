const dns = require('dns');
if (process.env.VERCEL !== '1') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

let connectionPromise;
let indexesPromise;

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);
  if (mongoose.connection.readyState === 0) {
    connectionPromise = null;
    indexesPromise = null;
  }
  if (mongoose.connection.readyState !== 1 && !connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      autoIndex: false
    }).then(() => {
      console.info(`MongoDB connected (${mongoose.connection.name})`);
      return mongoose.connection;
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  if (connectionPromise) await connectionPromise;
  if (!indexesPromise) {
    indexesPromise = Promise.all([User.createIndexes(), Doctor.createIndexes(), Appointment.createIndexes()])
      .catch((error) => {
        indexesPromise = null;
        throw error;
      });
  }
  await indexesPromise;
}

module.exports = connectDatabase;
