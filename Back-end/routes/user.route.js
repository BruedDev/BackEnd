import express from 'express';
import { getProfile, setProfile, login, logout, register, suggestedUser, followOrUnfollow, home, deleteAvatar, postFeaturedNote } from '../controllers/user.controller.js';

import isAuth from '../middlewares/isAuth.middleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

//router có thể viết theo cách này:
router.route('/register').post(register);
router.route('/').post(isAuth, home);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuth, getProfile);
//hoặc viết theo cách này:
router.post('/profile/edit', isAuth, upload.single('profilePicture'), setProfile);
router.get('/suggested', isAuth, suggestedUser);
router.get('/followofunfollow/:id', isAuth, followOrUnfollow);
router.delete('/deleteAvatar', isAuth, deleteAvatar);
router.post('/featuredNote', isAuth, postFeaturedNote);

export default router;
