import R from 'ramda'
import { Router } from 'express'
import sequelize from 'sequelize'
import getArticleXML from '../utils/getArticleXML'
import getDBConnection from '../db'

const router = Router()

const getConditions = ({ since }) => {
  const baseConditions = [
    'post_type=\'post\'',
    'post_status=\'publish\'',
  ]
  const conditions = R.when(
    R.complement(R.isNil),
    R.tryCatch(
      (d) => {
        const sinceCondition = `post_date >= '${(new Date(d)).toISOString()}'`
        baseConditions.push(sinceCondition)
        return baseConditions
      },
      R.always(baseConditions),
    ),
  )(since)
  return conditions.join(' and ')
}

const getRawSQLQuery = ({
  limit = 25, offset = 0, since,
}) =>
  `
    SELECT id, post_title, post_content, post_date, guid
    FROM wp_posts
    WHERE ${getConditions({ since })}
    ORDER BY post_date DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `

router.get('/', (req, res) => {
  const dbConnection = getDBConnection()
  const { since, limit = 10 } = req.query
  dbConnection
    .query(
      getRawSQLQuery({ limit, since }),
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
      // console.log(err)
      res.status(500).send({ message: 'fail', err })
    })
})

export default router
