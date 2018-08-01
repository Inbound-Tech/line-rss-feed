import {
  NODE_ENV,
  DB_DATABASE_INBOUND,
  DB_USER_INBOUND,
  DB_PASSWORD_INBOUND,
  DB_DATABASE_INNER,
  DB_USER_INNER,
  DB_PASSWORD_INNER,
  DB_DATABASE_LINE_RSS,
  DB_USER_LINE_RSS,
  DB_PASSWORD_LINE_RSS,
  DB_DATABASE_INSPORT,
  DB_USER_INSPORT,
  DB_PASSWORD_INSPORT,
} from '../config'

const dbConfigs = {
  inbound: {
    database: DB_DATABASE_INBOUND,
    dbUser: DB_USER_INBOUND,
    dbPassword: DB_PASSWORD_INBOUND,
    logging: () => NODE_ENV !== 'production',
  },
  inner: {
    database: DB_DATABASE_INNER,
    dbUser: DB_USER_INNER,
    dbPassword: DB_PASSWORD_INNER,
    logging: () => NODE_ENV !== 'production',
  },
  insport: {
    database: DB_DATABASE_INSPORT,
    dbUser: DB_USER_INSPORT,
    dbPassword: DB_PASSWORD_INSPORT,
    logging: () => NODE_ENV !== 'production',
  },
  line: {
    database: DB_DATABASE_LINE_RSS,
    dbUser: DB_USER_LINE_RSS,
    dbPassword: DB_PASSWORD_LINE_RSS,
    logging: () => NODE_ENV !== 'production',
  },
}

export default dbConfigs
