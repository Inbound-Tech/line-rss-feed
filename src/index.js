import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { setupDBConnection } from './db'
import apis from './apis'

const app = express()

const port = process.env.PORT || 3000


/* eslint-disable no-console */
setupDBConnection()
  .then(() => {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :date[iso]'))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use('/', apis)

    app.listen(port, (err) => {
      if (err) {
        console.log(err)
      }
      console.log(`
🚀  Server Start 🚀

NODE_ENV=${process.env.NODE_ENV}
Server runs on http://localhost:${port}
    `)
    })
  })
  .catch((err) => {
    console.log(err)
    console.log(`
💣  Cannot establizh connection to DB 💣
Please check your network or environment variable
  `)
  })
/* eslint-enable no-console */
