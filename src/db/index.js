import R from 'ramda'
import { DB_HOST } from '../config'
import dbConfigs from './dbConfigs'
import genSequelize from './genSequelize'

let dbConnections = {}

const initConnection = () => {
  dbConnections = R.mapObjIndexed(
    genSequelize(DB_HOST),
    dbConfigs,
  )
}

export const setupDBConnection =
  () => new Promise((resolve, reject) => {
    initConnection()
    Promise.all(
      R.map(
        db => db.authenticate(),
        R.values(dbConnections),
      ),
    )
      .then(() => {
        console.log('🚀  Connection has been established successfully.')
        resolve()
      })
      .catch((err) => {
        console.error('💣  Unable to connect to the database:', err)
        reject(err)
      })
  })

const getDBConnections = db => R.propOr({}, db, dbConnections)

export default getDBConnections
