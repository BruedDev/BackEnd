import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDatUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
//[GET] /
export const home = async (req, res) => {
    try {
        const userId = req.id;
        const users = await User.findById(userId).select("-password");
        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.log(error);
    }
}
//[POST] /api/user/register
export const register = async (req, res) => {
    try {
        //lấy thông tin từ req.body
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin",
                success: false,
            });
        }
        //kiểm tra xem email đã tồn tại chưa
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                success: false,
            });
        }
        //mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            username,
            email,
            password: hashedPassword,
        });
        //201 Created – Tài nguyên đã được tạo thành công trên máy chủ
        return res.status(201).json({
            message: "Đăng ký thành công",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
//[POST] /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Kiểm tra lại Email hoặc Password",
                success: false,
            });
        }
        //so sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        //400 Bad Request – Máy chủ không thể hoàn thành yêu cầu do cú pháp không chính xác
        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu không chính xác",
                success: false,
            });
        }
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
            bookmarks: user.bookmarks,
        }
        //Tạo token - tham số đầu tiên là payload, tham số thứ 2 là secret key
        const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        return res.cookie("token", token, {
            httpOnly: true,     //cookie không thể được truy cập bằng mã JavaScript
            // secure: true,       //cookie chỉ được gửi khi có https
            sameSite: "strict", //cookie chỉ được gửi khi có cùng domain
            maxAge: 1 * 10 * 60 * 60 * 1000, //5h
        }).json({
            message: "Đăng nhập thành công",
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
    }
}
//[GET] /api/user/logout
export const logout = async (req, res) => {
    try {
        return res.clearCookie("token", "", { maxAge: 0 }).json({
            message: "Đăng xuất thành công",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
//[GET] /api/:id
//lấy thông tin trang cá nhân
export const getProfile = async (_, res) => {
    try {
        const userId = res.params.id;
        const user = await User.findById(userId);

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
    }
}
//[SET] /api/profile
//cập nhật thông tin trang cá nhân - chỉ của chính user đã đăng nhập
export const setProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        //nếu có ảnh đại diện thì upload lên cloudinary
        if (profilePicture) {
            //chuyển file thành base64
            const fileUri = getDatUri(profilePicture);
            //upload lên cloudinary
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy user",
                success: false,
            });
        }
        //nếu có bio thì cập nhật
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (cloudResponse) user.profilePicture = cloudResponse.url;
        await user.save();

        //200 OK – Máy chủ đã xử lý thành công yêu cầu
        return res.status(200).json({
            message: "Cập nhật thành công",
            success: true,
            user,
        });

    } catch (error) {
        console.log(error);
    }
}
//[GET] suggested user (người dùng gợi ý)
export const suggestedUser = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password").limit(20);
        if (!suggestedUsers) {
            return res.status(404).json({
                message: "Không có user nào",
                success: false,
            });
        }
        return res.status(200).json({
            success: true,
            users: suggestedUsers,
        });
    }
    catch (error) {
        console.log(error);
    }
}
//follow or unfollow
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // Người thực hiện hành động
        const jiskoFollowKrunga = req.params.id; // Người được theo dõi hoặc hủy theo dõi

        // Tìm người dùng theo dõi và người dùng được theo dõi
        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false,
            });
        }

        // Kiểm tra xem người dùng hiện tại đã theo dõi người kia chưa
        const isFollowing = user.following.includes(jiskoFollowKrunga);

        if (isFollowing) {
            // Nếu đã theo dõi, thực hiện hủy theo dõi
            await Promise.all([
                User.updateOne(
                    { _id: followKrneWala },
                    { $pull: { following: jiskoFollowKrunga } }
                ),
                User.updateOne(
                    { _id: jiskoFollowKrunga },
                    { $pull: { followers: followKrneWala } }
                ),
            ]);
            return res.status(200).json({
                message: 'Unfollow successfully',
                success: true,
            });
        } else {
            // Nếu chưa theo dõi, thực hiện theo dõi
            //khi có nhiều hơn 1 tác vụ cần thực hiện cùng 1 lúc thì sử dụng Promise.all
            await Promise.all([
                User.updateOne(
                    { _id: followKrneWala },
                    { $push: { following: jiskoFollowKrunga } }
                ),
                User.updateOne(
                    { _id: jiskoFollowKrunga },
                    { $push: { followers: followKrneWala } }
                ),
            ]);
            return res.status(200).json({
                message: 'Follow successfully',
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};
