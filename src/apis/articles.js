import R from 'ramda'
import { Router } from 'express'
import { QueryTypes } from 'sequelize'
import getDBConnection from '../db'

const router = Router()

const getConditions = ({ since, q = '' }) => {
  const baseConditions = [
    'post_type=\'post\'',
    'post_status=\'publish\'',
    `post_title LIKE '%${q}%'`,
  ]
  const conditions = R.tryCatch(
    (d) => {
      const sinceCondition = `post_date >= '${(new Date(d)).toISOString()}'`
      baseConditions.push(sinceCondition)
      return baseConditions
    },
    R.always(baseConditions),
  )(since)
  return conditions.join(' and ')
}

const getRawSQLQuery = ({
  limit = 25,
  offset = 0,
  ...otherProps
}) =>
  `
    SELECT id, post_title, post_content, post_date, guid
    FROM wp_posts
    WHERE ${getConditions(otherProps)}
    ORDER BY post_date DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `

const makeQuery = db => (SQLConditions) =>
  db.transaction({ autocommit: true }, t =>
    db.query(
      getRawSQLQuery(SQLConditions),
      {
        type: QueryTypes.SELECT,
        transaction: t,
      },
    ),
  )
const checkSource = R.ifElse(
  R.equals('inner'),
  R.always('inner'),
  R.always('inbound'),
)
router.get('/', (req, res) => {
  const innerDB = getDBConnection('inner')
  const inboundDB = getDBConnection('inbound')
  const SQLConditions = R.pick(['since', 'limit', 'offset', 'q'])(req.query)
  const { source = 'inbound' } = req.query
  const db = R.ifElse(
    R.equals('inner'),
    () => innerDB,
    () => inboundDB,
  )(source)

  return makeQuery(db)(SQLConditions)
    .then(R.flatten)
    .then(results =>
      res
        .status(200)
        .send(R.map(({ guid, ...other }) => ({ ...other, url: guid }))(results)),
    )
    .catch((err) => {
      res.status(500).send({ message: 'fail', err })
    })
})

export default router
