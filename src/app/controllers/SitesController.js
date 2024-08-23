const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const session = require('express-session');
const User = require('../models/User');

class SitesController{
    welcome(req,res,next){
        Course.find({})
        .then(courses => res.render('welcome'))
        .catch(next);
    }
    async register(req, res,next){
        const { username, password } = req.body;
        try {
            const user = new User({ username, password });
            await user.save();
            res.redirect('/login');
        } catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
    try {
        const { username, password } = req.body;
        console.log('Received login:', { username, password });

        const user = await User.findOne({ username });
        if (user) {
            const isPasswordValid = await user.comparePassword(password);
            if (isPasswordValid) {
                req.session.userId = user._id;
                console.log('User authenticated, session userId set:', req.session.userId);
                res.json({ success: true });
                return;
            } else {
                console.log('Invalid password');
                res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu sai' });
                return;
            }
        } else {
            console.log('User not found');
            res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu sai' });
            return;
            }
        } catch (error) {
            console.error('Error during login:', error);
            next(error);
        }
    }
    search(req,res){
        res.render('search');
    }
}

module.exports = new SitesController;