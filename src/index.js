import express from 'express'
import bodyParser from 'body-parser'
import { setupDBConnection } from './db'
import apis from './apis'

const app = express()

const port = process.env.PORT || 3000


setupDBConnection()
  .then(() => {
    // dynamic import
    // eslint-disable-next-line
    app.use(bodyParser.json())
    app.use('/', apis)
    /* eslint-disable no-console */
    app.listen(port, (err) => {
      if (err) {
        console.log(err)
      }
      console.log(`
🚀 Server Start 🚀

ENV=${process.env.ENV}
Server runs on http://localhost:${port}
    `)
    })
    /* eslint-enable no-console */
  })
  .catch((err) => {
    console.log(err)
    console.log(`
💣 Cannot establizh connection to DB 💣
Please check your network or environment variable
  `)
  })
