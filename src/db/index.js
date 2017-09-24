import Sequelize from 'sequelize'
import { DB_DATABASE, DB_USER, DB_PASSWORD, DB_HOST } from '../config'

let dbConnection

const initConnection = () => {
  dbConnection = new Sequelize(
    DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
    {
      host: DB_HOST,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    },
  )
}

export const setupDBConnection =
  () => new Promise((resolve, reject) => {
    initConnection()
    dbConnection
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
        resolve()
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
        reject(err)
      })
  })

const getDBConnection = (db) => dbConnection

export default getDBConnection
