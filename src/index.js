require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const sortMidleware= require('./app/middlewares/sortMiddleware');
const { Server } = require('socket.io');
const http = require('http');
const Message = require('./app/models/Message');
const sharedsession = require('express-socket.io-session');

const session = require('express-session');


//nodemon --inspect src/index.js
const db = require('./config/db');
db.connect();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3000;

const route = require('./routes');  

sessionMiddleware=session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        //secure: true, // Chỉ dùng với HTTPS
        sameSite: 'strict', // Bảo vệ chống CSRF
        maxAge: 3600000 // Thời gian sống của session cookie
    }
})
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json())
app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.use(sortMidleware);
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});



// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources/views'));

route(app);

const userSocketMap = {}; // Ánh xạ userId với socket.id

// Chia sẻ session giữa Express và Socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Xử lý sự kiện kết nối của người dùng
io.on('connection', async (socket) => {
  console.log('A user connected');
  const userId = socket.request.session.userId; // Lấy userId từ session
  // Xử lý sự kiện đăng ký userId
  socket.emit('register',{ userId: userId }, () => {;
    userSocketMap[userId] = socket.id; // Lưu socket.id vào map
    socket.request.session.save(); // Lưu lại session nếu có thay đổi
  });

  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} connected with socket ID ${socket.id}`);
  socket.on('load-messages',async (receiverID)=>{// Tải tin nhắn cũ từ MongoDB
    const messages = await Message.find({
        $or: [
            { sender: userId ,receiver: receiverID},
            { receiver: userId ,sender: receiverID}
        ]
    }).sort({ timestamp: 1 });

    // Gửi tin nhắn cũ đến người dùng
    socket.emit('load old messages', messages);
  });
  
  
  // Xử lý sự kiện gửi tin nhắn
  socket.on('chat message', (data) => {
    const newMessage = new Message({
      sender: socket.request.session.userId,
      receiver: data.receiver,
      message: data.message,
    });
    newMessage.save();

    const receiverSocketId = userSocketMap[data.receiver]; // Lấy socket.id của người nhận

    if (receiverSocketId) {
      // Gửi tin nhắn cho người nhận qua socket.id
      io.to(receiverSocketId).emit('chat message', {
        sender: socket.request.session.userId,
        message: data.message,
      });
    }
  });

  // Xử lý sự kiện ngắt kết nối
  socket.on('disconnect', () => {
    const userId = socket.request.session.userId;
    delete userSocketMap[userId]; // Xóa socket.id khỏi map khi người dùng ngắt kết nối
    console.log('User disconnected');
  });

});


app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });
httpServer.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});