const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dir = './src/public/img';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const dirVideo = './src/public/video';
if (!fs.existsSync(dirVideo)) {
  fs.mkdirSync(dirVideo);
}

// Cấu hình nơi lưu trữ file khi upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'src/public/img'); // Thư mục lưu ảnh
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, 'src/public/video'); // Thư mục lưu video
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file với timestamp
    }
});


const upload = multer({ storage: storage });

module.exports = upload;