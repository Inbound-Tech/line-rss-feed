import Sequelize from 'sequelize'

const genSequelize = dbHost => ({
  logging,
  database,
  dbUser,
  dbPassword,
}) => new Sequelize(
  database,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    logging,
  },
)

export default genSequelize
