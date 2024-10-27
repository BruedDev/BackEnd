import express from 'express';
import upload from '../middlewares/multer.js';
import isAuth from '../middlewares/isAuth.middleware.js';
import { addComment, bookmarkPost, deletePost, getAllPosts, likePost, newPost, unlikePost, getUserPosts, getMyPosts } from '../controllers/post.controller.js';

const router = express.Router();
router.post('/newPost', isAuth, upload.single('img'), newPost);
router.get('/getAllPosts', isAuth, getAllPosts);
router.get('/getMyPost', isAuth, getMyPosts);
router.post('/likePost/:id', isAuth, likePost);
router.post('/unLikePost/:id', isAuth, unlikePost);
router.post('/commentPost/:id', isAuth, addComment);
router.delete('/deletePost/:id', isAuth, deletePost);
router.post('/bookmarkPost/:id', isAuth, bookmarkPost);
router.get('/getUserPost/:id', isAuth, getUserPosts);
export default router;