// import mongoose from "mongoose";
// const postSchema = new mongoose.Schema({
//     caption: {
//         type: String,
//         max: 500,
//         default: "",
//     },
//     img: {
//         type: String,
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: `User`,
//         required: true,
//     },
//     desc: {
//         type: String,
//         max: 500,
//     },

//     likes: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: `User`,
//         }
//     ],
//     comments: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: `Comment`,
//         }
//     ],

// }, { timestamps: true });
// const Post = mongoose.model(`Post`, postSchema);
// export default Post;
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        max: 500,
        default: "",
    },
    img: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    // Thêm các trường mới
    saves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    hashtags: [{
        type: String,
        trim: true
    }],
    contentType: {
        type: String,
        enum: ['image', 'video', 'carousel'],
        default: 'image'
    },
    engagement: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    // Tự động cập nhật điểm engagement khi có thay đổi
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// Tính điểm engagement tự động
postSchema.pre('save', function (next) {
    this.engagement =
        (this.likes?.length || 0) +
        (this.comments?.length * 2 || 0) +
        (this.saves?.length * 3 || 0);
    next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;