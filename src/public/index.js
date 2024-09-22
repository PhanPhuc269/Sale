
// Ví dụ: tự động cuộn đến cuối phần tin nhắn khi gửi tin mới
const chatModal = document.getElementById('chatModal');
const formChat = document.getElementById('chat-form');
const messages = document.querySelector('#chatModal .messages');
const socket = io('https://du-an-node-js-dau-tay.onrender.com/');
let userId;
let receiverID;

// Hàm để lấy giá trị của cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
document.addEventListener('DOMContentLoaded', function () {
    const messageTab = document.getElementById('messages-tab');
    document.getElementById('notice').addEventListener('click', function (event){
        var targetElement = event.target;
        var parentElement = targetElement.closest('[data-id]');
        receiverID = parentElement.getAttribute('data-id');
        var matchingButtons = chatModal.querySelector('.connect-chat[data-id="' + receiverID + '"]');
        matchingButtons.click();
    });
    document.getElementById('list-friends').addEventListener('click', showMessageTab);
    function showMessageTab(event) {
        if (event.target && event.target.matches('.list-group-item')) {
            var button = event.target;  // Phần tử được nhấp

            receiverID = button.getAttribute('data-id');  // Lấy course ID từ data-id
            // Lấy tên người nhận
            messageTab.textContent = button.textContent;
            var closeBtn = document.createElement('button');
            closeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
            closeBtn.className = 'btn-close text-reset';
            closeBtn.setAttribute('type', 'button');
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.addEventListener('click', function () {
                messageTab.textContent = 'Tin nhắn';
                messages.innerHTML = '';
                chatModal.querySelector('.modal-body input').value = '';
            });
            messageTab.appendChild(closeBtn);

            // Chuyển sang tab tin nhắn
            var messagesTab = new bootstrap.Tab(document.getElementById('messages-tab'));
            messagesTab.show();

            // Gửi sự kiện load-messages với receiverID
            socket.emit('load-messages', receiverID);
        }
    }
});
// Đăng ký userId khi kết nối
socket.on('register', (data) => {
    userId = data.userId;
});
chatModal.addEventListener('shown.bs.modal', function () {
    socket.emit('recent-messages');
    // var recent = new bootstrap.Tab(document.getElementById('recent-messages'));
    // recent.show();
});
socket.on('recent-messages', (messagesList) => {
    const recentMessages = chatModal.querySelector('.notice');
    recentMessages.innerHTML = ''; // Clear existing messages

    messagesList.forEach((message) => {
        const newMessage = document.createElement('button');
        newMessage.className = 'my-2 p-2 text-black rounded list-group-item list-group-item-action';
        newMessage.setAttribute('data-id', message.receiverID);

        const titleElement = document.createElement('h6');
        titleElement.textContent = message.title;
        newMessage.appendChild(titleElement);

        const messageElement = document.createElement('span');
        messageElement.textContent = message.message;
        newMessage.appendChild(messageElement);

        const timestampElement = document.createElement('div');
        timestampElement.className = 'text-muted small';
        timestampElement.textContent = new Date(message.timestamp).toLocaleString();
        newMessage.appendChild(timestampElement);

        recentMessages.appendChild(newMessage);
    });
});

// chatModal.addEventListener('shown.bs.modal', function () {
//     const messages = chatModal.querySelector('.messages');
//     messages.scrollTop = messages.scrollHeight;
//     socket.emit('load-messages', receiverID);
// });
// Nhận và hiển thị tin nhắn cũ
socket.on('load old messages', (messagesList) => {
    messages.innerHTML = ``;
    messagesList.forEach((message) => {
        if(message.sender == userId){
            const newMessage = document.createElement('div');
            newMessage.className = 'message my-2 p-2 text-black rounded';
            newMessage.textContent = message.message;
            messages.appendChild(newMessage);
        }
        else{
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
            const messageData = {
                sender: userId,  // Bạn có thể thay đổi hoặc lấy từ thông tin người dùng đăng nhập
                receiver: receiverID,//(userId !='66c88776614bf1e4ccfca969')? '66c88776614bf1e4ccfca969': '66caf87123950ddd71daaeab',  // Nhận từ input hoặc logic phía server
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
document.getElementById('recent-tab').addEventListener('click', function () {
    socket.emit('recent-messages');
});
document.getElementById('messages-tab').addEventListener('click', function () {
    socket.emit('load-messages', receiverID);
});