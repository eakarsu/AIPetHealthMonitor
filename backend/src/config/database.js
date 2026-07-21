const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { databaseUrl } = require('./security');

const sequelize = new Sequelize(databaseUrl(), {
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

module.exports = sequelize;
