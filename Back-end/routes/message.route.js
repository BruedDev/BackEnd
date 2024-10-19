import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import isAuth from '../middlewares/isAuth.middleware.js';

const router = express.Router();

router.post('/send/:id', isAuth, sendMessage);
router.get('/get/:id', isAuth, getMessages);

export default router;
