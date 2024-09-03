
// Ví dụ: tự động cuộn đến cuối phần tin nhắn khi gửi tin mới
const chatModal = document.getElementById('chatModal');
const formChat = document.getElementById('chat-form');
const messages = document.querySelector('#chatModal .messages');
const socket = io('http://localhost:3000');
let userId;

// Hàm để lấy giá trị của cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Đăng ký userId khi kết nối
socket.on('register', (data) => {
  userId = data.userId;
  console.log('Connected with userId:', userId);
});
chatModal.addEventListener('shown.bs.modal', function () {
    const messages = chatModal.querySelector('.messages');
    messages.scrollTop = messages.scrollHeight;
    const receiverID = (userId !='66caf87123950ddd71daaeab')? '66caf87123950ddd71daaeab': '66d5b0b0b10fe1d80b69a577';
    socket.emit('load-messages', receiverID);
});
// Nhận và hiển thị tin nhắn cũ
socket.on('load old messages', (messagesList) => {
    messages.innerHTML = '';
    messagesList.forEach((message) => {
        if(message.sender == userId){
            const newMessage = document.createElement('div');
            newMessage.className = 'message my-2 p-2 text-black rounded';
            newMessage.textContent = message.message;
            messages.appendChild(newMessage);
        }
        else{
            console.log(message.sender);
            const newMessage = document.createElement('div');
            newMessage.className = 'response my-2 p-2 text-white rounded';
            newMessage.textContent = message.message;
            messages.appendChild(newMessage);
        }
    });
    messages.scrollTop = messages.scrollHeight;
});
// Thêm tin nhắn khi người dùng nhập tin nhắn và nhấn Enter
const chatInput = document.querySelector('#chatModal .modal-body input');
chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const messageText = chatInput.value.trim();
        if (messageText) {
            console.log(userId);
            const messageData = {
                sender: userId,  // Bạn có thể thay đổi hoặc lấy từ thông tin người dùng đăng nhập
                receiver: (userId !='66caf87123950ddd71daaeab')? '66caf87123950ddd71daaeab': '66d5b0b0b10fe1d80b69a577',  // Nhận từ input hoặc logic phía server
                message: messageText,
            };
            socket.emit('chat message', messageData);
            const newMessage = document.createElement('div');
            newMessage.className = 'message my-2 p-2 text-black rounded';
            newMessage.textContent = messageText;
            
            messages.appendChild(newMessage);
            chatInput.value = '';
            messages.scrollTop = messages.scrollHeight;
        }

    }
});

// Nhận và hiển thị tin nhắn
socket.on('chat message', (data) => {
    const newMessage = document.createElement('div');
    newMessage.className = 'response my-2 p-2 text-white rounded';
    newMessage.textContent = `${data.message}`;
    messages.appendChild(newMessage);
    messages.scrollTop = messages.scrollHeight;
});
// Gọi sự kiện logout khi người dùng truy cập vào endpoint /logout
document.getElementById('logoutButton').addEventListener('click', () => {
    socket.emit('disconnect');
});