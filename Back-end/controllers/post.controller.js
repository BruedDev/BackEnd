import sharp from 'sharp';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import mongoose from 'mongoose';
import cloudinary from '../utils/cloudinary.js';
//tạo bài viết
export const newPost = async (req, res) => {
    try {
        const { caption } = req.body; // Đặt giá trị mặc định
        const img = req.file;
        const authorId = req.id;

        // Validate input
        if (!img) {
            return res.status(400).json({
                success: false,
                message: "Không có hình ảnh nào được tải lên"
            });
        }

        // Optimize image
        const optimizedImgBuffer = await sharp(img.buffer)
            .resize({ width: 500, height: 500, fit: 'inside' })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        // Upload to cloudinary
        const fileUri = `data:image/jpeg;base64,${optimizedImgBuffer.toString("base64")}`;
        const cloudinaryResponse = await cloudinary.uploader.upload(fileUri);

        // Create post and update user in parallel
        const [post, user] = await Promise.all([
            Post.create({
                caption,
                img: cloudinaryResponse.secure_url,
                author: authorId
            }),
            User.findById(authorId)
        ]);

        // Update user's posts array
        if (user) {
            user.posts.push(post._id);
            await user.save();
        } else {
            throw new Error("Không tìm thấy người dùng");
        }

        // Populate author info
        await post.populate({
            path: 'author',
            select: '-password'
        });

        return res.status(201).json({
            success: true,
            message: "Đăng bài thành công",
            post,
        });

    } catch (error) {
        console.error('Error in newPost:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Có lỗi xảy ra khi tạo bài viết"
        });
    }
};
//lấy tất cả bài viết
export const getAllPosts = async (req, res) => {
    try {

        const posts = await Post.find().sort({ createdAt: -1 })
            //lấy thông tin của người đăng bài
            .populate({ path: 'author', select: 'username, profilePicture' })
            //lấy thông tin của người comment và comment của bài viết
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    'path': 'author',
                    'select': 'username, profilePicture'
                }
            });
        return res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//lấy bài viết của user
export const getUserPosts = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username, profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username, profilePicture'
                }
            });
        return res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//like bài viết
export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userLikeId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài viết",
                success: false,
            });
        }
        await post.updateOne({ $addToSet: { likes: userLikeId } });
        await post.save();
        //sử dục socket.io để realtime update


        return res.status(200).json({
            message: "Like bài viết thành công",
            success: true,
            post,
        });
    } catch (error) {
        console.log(error);
    }
}
//unlike bài viết
export const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userLikeId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài viết",
                success: false,
            });
        }
        await post.updateOne({ $pull: { likes: userLikeId } });
        await post.save();
        //sử dục socket.io để realtime update
        return res.status(200).json({
            message: "Unlike bài viết thành công",
            success: true,
            post,
        });
    } catch (error) {
        console.log(error);
    }
}
//comment bài viết
export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userCommentId = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);
        if (!text) {
            return res.status(400).json({
                message: "Nội dung comment không được để trống",
                success: false,
            });
        }
        if (!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài viết",
                success: false,
            });
        }
        const comment = await Comment.create({
            text,
            author: userCommentId,
            post: postId,
        }).populate({
            path: 'author',
            select: 'username, profilePicture'
        });
        post.comments.push(comment._id);
        await post.save();

    } catch (error) {
        console.log(error);
    }
}
//lấy comment của bài viết
export const getCommentOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId })
            .populate({
                path: 'author',
                select: 'username, profilePicture'
            });
        return res.status(200).json({
            message: "Lấy comment thành công",
            success: true,
            comments,
        });

    } catch (error) {
        console.log(error);
    }
}
//phản hồi comment
// export const replyComment = async (req, res) => {
//     try {
//         const commentId = req.params.id;
//         const userReplyId = req.id;
//         const { text } = req.body;
//         const comment = await Comment.findById(commentId);
//         if (!text) {
//             return res.status(400).json({
//                 message: "Nội dung reply không được để trống",
//                 success: false,
//             });
//         }
//         if (!comment) {
//             return res.status(404).json({
//                 message: "Không tìm thấy comment",
//                 success: false,
//             });
//         }
//         const reply = {
//             text,
//         };
//         comment.replies.push(reply);
//         await comment.save();
//         return res.status(200).json({
//             message: "Reply comment thành công",
//             success: true,
//             comment,
//         });
//     }
//     catch (error) {
//         console.log(error);
//     }
// }
const x = 1;
//xóa bài viết
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài viết",
                success: false,
            });
        }
        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                message: "Bạn không có quyền xóa bài viết này",
                success: false,
            });
        }
        await Post.findByIdAndDelete(postId);
        //xóa bài viết trong mảng posts của user
        const user = await User.findById(authorId);
        user.posts.pull(postId);
        await user.save();
        //xóa comment khi bài viết bị xóa
        await Comment.deleteMany({
            post: postId,
        });

        return res.status(200).json({
            message: "Xóa bài viết thành công",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
//đánh dấu hoặc bỏ đánh dấu bài viết
export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userBookmarkId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài viết",
                success: false,
            });
        }
        const user = await User.findById(userBookmarkId);
        //includes để kiểm tra bài viết đã được đánh dấu chưa
        if (user.bookmarks.includes(postId)) {
            //xóa bài viết khỏi mảng bookmarks
            user.bookmarks.pull(postId);
            await user.save();
            return res.status(200).json({
                type: "unbookmarked",
                message: "Bỏ đánh dấu bài viết thành công",
                success: true,
            });
        } else {
            //đánh dấu bài viết
            user.bookmarks.push(postId);
            await user.save();
            return res.status(200).json({
                type: "bookmarked",
                message: "Đánh dấu bài viết thành công",
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
    }
}
