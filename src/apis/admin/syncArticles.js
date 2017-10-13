import R from 'ramda'
import D from 'date-fp'
import { Router } from 'express'
import { QueryTypes } from 'sequelize'
import fetch from 'isomorphic-fetch'
import { AIRTABLE_API_KEY } from '../../config'
import logger from '../../utils/logger'
import getDBConnection from '../../db'

const router = Router()

const airtableUrl = `https://api.airtable.com/v0/appfa9WbsLI0kDmis/RSS?api_key=${AIRTABLE_API_KEY}`

const formatDate = d => D.format('YYYY-MM-DD hh:mm:ss', new Date(d))

const getConditions = (since) => {
  const baseConditions = [
    'post_type=\'post\'',
    'post_status=\'publish\'',
  ]
  const conditions = R.ifElse(
    R.isNil,
    R.always(baseConditions),
    (d) => {
      const sinceCondition = `post_date >= '${formatDate(d)}'`
      console.log(d, sinceCondition)
      baseConditions.push(sinceCondition)
      return baseConditions
    },
  )(since)
  return conditions.join(' and ')
}

const getRawSQLQuery = ({
  since,
}) =>
  `
    SELECT id, post_title, post_content, post_date, guid
    FROM wp_posts
    WHERE ${getConditions(since)}
    ORDER BY post_date DESC
    LIMIT 5;
  `

const makeQuery = db => ({ since }) =>
  db.transaction({ autocommit: true }, t =>
    db.query(
      getRawSQLQuery({ since }),
      {
        type: QueryTypes.SELECT,
        transaction: t,
      },
    ),
  )

// const checkSource = R.ifElse(
//   R.contains('inbound'),
//   R.always('inbound'),
//   R.always('inner'),
// )

// const genValues = R.pipe(
//   R.map(
//     // eslint-disable-next-line
//     ({ id, post_title, post_content, post_date, guid }) => {
//       // eslint-disable-next-line
//       return `("${checkSource(guid)}-${id}", ${id}, "${post_title}", "${post_content}", "${formatDate(post_date)}", "${guid}", "${checkSource(guid)}")`
//     },
//   ),
//   R.join(', '),
// )

// const getRawInsertSQL = articles =>
//   `INSERT INTO posts (id, original_id, post_title, post_content, post_date, url, source) VALUES ${genValues(articles)};`

// const makeInsertQuery = db => articles =>
//   db.transaction({ autocommit: true }, t =>
//     db.query(
//       getRawInsertSQL(articles),
//       {
//         transaction: t,
//         type: QueryTypes.INSERT,
//       },
//     ),
//   )

const getLatestUpdateTime = db => new Promise(resolve =>
  db.transaction({ autocommit: true }, t =>
    db.query(
      `
        SELECT timestamp FROM update_post_record
        ORDER BY timestamp DESC
        LIMIT 1;
      `,
      {
        transaction: t,
        type: QueryTypes.QUERY,
      },
    ),
  )
    .then(result =>
      resolve(R.path([0, 0, 'timestamp'])(result)),
    )
    .catch(() => resolve(undefined)),
)

const getNow = () => {
  const d = new Date()
  return D.add('seconds', d.getTimezoneOffset(), d)
}

// const handleUpdate = (articles) => {
//   const
// }

router.get('/', async (req, res) => {
  const innerDB = getDBConnection('inner')
  const inboundDB = getDBConnection('inbound')
  const lineRSSDB = getDBConnection('line')
  const since = await getLatestUpdateTime(lineRSSDB)
  const now = getNow()

  Promise
    .all([
      makeQuery(innerDB)({ since }),
      makeQuery(inboundDB)({ since }),
    ])
    .then(R.flatten)
    .then((posts) => {
      logger(`update ${posts.length} posts`)
      return posts
    })
    .then(
      articles
      // R.when(
      //   R.complement(R.isEmpty),
      //   (articles) => {
      //     console.log('here')
      //     return makeInsertQuery(lineRSSDB)(articles)
      //   },
      // ),
    )
    .then(() =>
      lineRSSDB.transaction({ autocommit: true }, t =>
        lineRSSDB.query(
          `
            INSERT INTO update_post_record (timestamp)
            VALUES ('${D.format('YYYY-MM-DD hh:mm:ss', now)}')
          `,
          { transaction: t, type: QueryTypes.INSERT },
        ),
      ),
    )
    .then(() =>
      res
      .status(200)
      .send({ message: 'query success', since })
    )
    .catch(err => res.status(500).send({ message: 'fail', err }))
})

export default router
