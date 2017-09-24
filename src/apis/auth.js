import { Router } from 'express'
import { AUTH_TOKEN } from '../config'

const router = Router()

router.post('/', (req, res) => {
  const { authorization } = req.headers
  if (authorization === AUTH_TOKEN) {
    res.status(200).send({ message: 'success' })
  } else {
    res.status(401).send({ message: 'unauthorized' })
  }
})

export default router
