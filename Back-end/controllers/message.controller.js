import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

//gửi tin nhắn
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;
        //conversation là cuộc trò chuyện giữa 2 người
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
        });
        //thiết lập cuộc trò chuyện nếu chưa có
        if (!conversation) {
            conversation = new Conversation({
                members: [senderId, receiverId],
            });
            await conversation.save();
        }
        //tạo tin nhắn mới
        const newMessage = await Message.create({
            receiverId,
            senderId,
            message,
        });
        //lưu tin nhắn vào cuộc trò chuyện
        conversation.messages.push(newMessage._id);
        //sử dung Promise.all để chờ cả 2 lưu xong
        await Promise.all([conversation.save(), newMessage.save()]);
        //thực hiện socket.io để gửi tin nhắn

        return res.status(201).json({
            success: true,
            message: newMessage,
        });
    } catch (error) {
        console.log(error);
    }
}
//lấy tin nhắn
export const getMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        //lấy cuộc trò chuyện giữa 2 người
        const conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
            members: { $size: 2 },
            // Chỉ chấp nhận cuộc trò chuyện có đúng 2 thành viên để tránh trường hợp cuộc trò chuyện nhóm
        });
        if (!conversation) {
            return res.status(200).json({
                success: true,
                messages: [],
            });
        }

        return res.status(200).json({
            success: true,
            //toán tử ?. để tránh lỗi khi conversation không tồn tại(chưa có tin nhắn)
            messages: conversation?.messages,
        });
    } catch (error) {
        console.log(error);
    }
}
