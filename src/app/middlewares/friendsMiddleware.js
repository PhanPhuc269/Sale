// friendsMiddleware.js
const User = require('../models/User'); // Đảm bảo đường dẫn đúng

// Hàm findFriend
async function findFriend(req,res,next) { // Logging để kiểm tra hàm được gọi

    if (!req.session.userId) {
        return [];
    }

    const searchCriteria = {
        _id: { $ne: req.session.userId }
    };

    try {
        const ListUser = await User.find(searchCriteria).lean();
        console.log('ListUser:', ListUser);

        const Friend = ListUser.map(user => ({
            _id: user._id,
            name: user.name
        }));

        console.log(Friend); // In ra danh sách bạn bè
        return Friend;
    } catch (error) {
        console.error('Error finding users:', error);
        return [];
    }
}
// Middleware để lấy danh sách bạn bè
async function friendsMiddleware(req, res, next) {
    const friends = await findFriend(req);
    res.locals.findFriend = friends;
    next();
}

module.exports = friendsMiddleware;