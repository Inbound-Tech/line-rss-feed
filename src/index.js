import express from 'express'
import bodyParser from 'body-parser'
import { setupDBConnection } from './db'
import apis from './apis'

const app = express()

const port = process.env.PORT || 3000


/* eslint-disable no-console */
setupDBConnection()
  .then(() => {
    app.use(bodyParser.json())
    app.use('/', apis)
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
  })
  .catch((err) => {
    console.log(err)
    console.log(`
💣 Cannot establizh connection to DB 💣
Please check your network or environment variable
  `)
  })
/* eslint-enable no-console */
