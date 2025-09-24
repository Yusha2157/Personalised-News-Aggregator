import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFeed, searchNews, saveArticle, listSaved, removeSaved } from '../controllers/newsController.js';

const router = Router();

router.get('/feed', requireAuth, getFeed);
router.get('/search', requireAuth, searchNews);
router.post('/save', requireAuth, saveArticle);
router.get('/saved', requireAuth, listSaved);
router.delete('/saved/:id', requireAuth, removeSaved);

export default router;


