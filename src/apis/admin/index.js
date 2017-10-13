import { Router } from 'express'
import syncArticles from './syncArticles'

const router = Router()

router.use('/sync', syncArticles)

export default router
