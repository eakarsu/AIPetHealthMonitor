const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

module.exports = sequelize;
