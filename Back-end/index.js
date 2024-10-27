import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import indexRouter from './routes/index.route.js';
//cần phải .config() để sử dụng được biến môi trường
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "connected to server",
        success: true
    });
})
//middleware
app.use(express.json());
app.use(cookieParser());
//sử dụng urlencoded để lấy dữ liệu từ form
app.use(urlencoded({ extended: true }));
//cấu hình cors
const corsOptions = {
    origin: ['http://localhost:3000' || 'https://localhost:3001'], //chỉ cho phép các domain này gửi request
    credentials: true                  //cho phép gửi cookie hoặc header xác thực
};
app.use(cors(corsOptions));

//sử dụng router
app.use('/api', indexRouter);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});