const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dir = './src/public/img';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Cấu hình nơi lưu trữ file khi upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,  'src/public/img'); // Thư mục lưu file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file với timestamp
    }
});


const upload = multer({ storage: storage });

module.exports = upload;