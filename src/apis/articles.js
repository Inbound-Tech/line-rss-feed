import R from 'ramda'
import { Router } from 'express'
import { QueryTypes } from 'sequelize'
import { JSDOM } from 'jsdom'
import getDBConnection from '../db'
import mockupArticleHTML from '../mockup/mockupArticleHTML'
import convertJSONtoTable from '../utils/convertJSONtoTable'

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

const makeQuery = db => SQLConditions =>
  db.transaction({ autocommit: true }, t =>
    db.query(
      getRawSQLQuery(SQLConditions),
      {
        type: QueryTypes.SELECT,
        transaction: t,
      },
    ),
  )

const parserHTMLContent =
  R.pipe(
    R.replace(/\r\n/g, '<br/>'),
    (content) => {
      const doc = new JSDOM(content)
      const nodes = doc.window.document.body.childNodes
      return R.values(R.fromPairs(Array.from(nodes.entries())))
        .reduce((acc, cur) => {
          if (cur.nodeName === '#text') {
            return `${acc}<p>${cur.wholeText}</p>`
          } else {
            return `${acc}${cur.outerHTML}`
          }
        }, '')
    },
    R.replace(/<br>/g, ''),
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
    .then(R.map(({ guid, ...other }) => ({ ...other, url: guid })))
    .then(R.map(R.evolve({ post_content: parserHTMLContent })))
    .then(results => mockupArticleHTML({ site: source, content: convertJSONtoTable(results) }))
    .then(results =>
      res
        .status(200)
        .send(results),
    )
    .catch((err) => {
      res.status(500).send({ message: 'fail', err })
    })
})

export default router
