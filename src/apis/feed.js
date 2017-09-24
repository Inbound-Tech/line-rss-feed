import R from 'ramda'
import { Router } from 'express'
import sequelize from 'sequelize'
import getArticleXML from '../utils/getArticleXML'
import getDBConnection from '../db'

const router = Router()

const getConditions = ({ dateAfter }) => {
  const conditions = [
    'post_type=\'post\'',
    'post_status=\'publish\'',
  ]
  R.when(
    R.complement(R.isNil),
    R.pipe(
      d => `post_date >= ${(new Date(d)).toISOString()}`,
      R.flip(R.append)(conditions),
    ),
  )(dateAfter)
  return conditions.join(' and ')
}

const getRawSQLQuery = ({
  limit = 25, offset = 0, dateAfter,
}) =>
  `
    SELECT id, post_title, post_content, post_date, guid
    FROM wp_posts
    WHERE ${getConditions({ dateAfter })}
    ORDER BY post_date DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `

router.get('/', (req, res) => {
  const dbConnection = getDBConnection()
  dbConnection
    .query(
      getRawSQLQuery({ limit: 10, dateAfter: '2017-09-01' }),
      { type: sequelize.QueryTypes.SELECT },
    )
    .then((results) => {
      const xml = getArticleXML({ rawArticles: results })
      res
        .status(200)
        .contentType('application/xml')
        .send(xml)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({ message: 'fail', err })
    })
})

export default router
