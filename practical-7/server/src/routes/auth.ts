import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { requireJson } from '../middleware/requireJson';

const router = Router();

router.post('/register', requireJson, register);
router.post('/login', requireJson, login);

export default router;
