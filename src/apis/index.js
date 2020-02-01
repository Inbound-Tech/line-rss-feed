import { Router } from 'express'
// import articles from './articles'
import feed from './feed'

const router = Router()

// router.use('/articles', articles)
router.use('/', feed)

export default router
