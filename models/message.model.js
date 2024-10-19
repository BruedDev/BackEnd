import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });
export default Message = mongoose.model(`Message`, messageSchema);