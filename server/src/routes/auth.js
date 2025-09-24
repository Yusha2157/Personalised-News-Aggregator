import { Router } from 'express';
import { register, login, me, logout, updateInterests, updateProfile } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/logout', logout);
router.put('/interests', updateInterests);
router.put('/profile', updateProfile);

export default router;


