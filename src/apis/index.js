import { Router } from 'express'
import auth from './auth'
import feed from './feed'

const router = Router()

router.use('/auth', auth)
router.use('/feed', feed)

export default router
