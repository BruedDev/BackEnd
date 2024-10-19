import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    //nguời than gia
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`,
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Message`,
        },
    ],
}, { timestamps: true });
export default Conversation = mongoose.model(`Conversation`, conversationSchema);