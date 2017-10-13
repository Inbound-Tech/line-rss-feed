import R from 'ramda'
import { Router } from 'express'
import fetch from 'isomorphic-fetch'
import crypto from 'crypto'
import { AIRTABLE_API_KEY } from '../config'
import getArticleXML from '../utils/getArticleXML'

const router = Router()

const baseUrl = 'https://api.airtable.com/v0/appfa9WbsLI0kDmis'
const params = `?api_key=${AIRTABLE_API_KEY}&sort%5B0%5D%5Bfield%5D=post_date&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=%7BisActive%7D%3D1`
const generateHashWith = (input) => {
  const hash = crypto.createHash('sha256')
  hash.write(input)
  return hash.digest('base64')
}

const getAirtableUrl = source => `${baseUrl}/${source}${params}`

const checkSource = R.ifElse(
  R.equals('inner'),
  R.always('inner'),
  R.always('inbound'),
)

router.get('/', (req, res) => {
  const { source = 'inbound' } = req.query

  fetch(
    getAirtableUrl(checkSource(source)),
  )
    .then(response => response.json())
    .then(R.prop('records'))
    .then(R.pluck('fields'))
    .then((rawArticles) => {
      const time = R.pipe(
        R.path([0, 'post_date']),
        R.ifElse(
          R.isNil,
          () => new Date(),
          date => new Date(date),
        ),
        R.compose(String, Math.floor),
      )(rawArticles)

      const uuid = generateHashWith(time)
      return getArticleXML({
        rawArticles,
        uuid,
        time,
      })
    })
    .then(xml =>
      res
        .status(200)
        .contentType('application/xml')
        .send(xml),
    )
    .catch((err) => {
      console.log(err)
      res
        .status(500)
        .send({ message: 'fail' })
    })
})

export default router
