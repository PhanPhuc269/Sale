const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const session = require('express-session');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

class SitesController{
    welcome(req,res,next){
        Course.find({})
        .then(courses => res.render('welcome'))
        .catch(next);
    }
    async register(req, res,next){
        const { username, password } = req.body;
        try {
            const user = new User({ username, password});
            await user.save();
            req.session.userId = user._id;
            res.redirect('/set-authentication');
        } catch (error) {
            next(error);
        }
    }
    async setAuthentication(req, res, next) {
        try {
            // Tạo secretKey ngẫu nhiên
            const secretKey = speakeasy.generateSecret({ length: 20 });
            const userId = req.session.userId;
            // Lưu secret key vào cơ sở dữ liệu
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if(user.secretKey!=null){
                return res.redirect('/');
            }

            // Tạo URL mã QR chứa secretKey
            const otpAuthUrl = speakeasy.otpauthURL({
                secret: secretKey.base32,
                label: user.username,
                issuer: `Demure:${user.username}`,
            });

            user.secretKey = secretKey.base32;
            await user.save();

            // Tạo mã QR để người dùng quét
            qrcode.toDataURL(secretKey.otpauth_url, (err, data) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return res.status(500).json({ message: 'Error generating QR code' });
                } else {
                    console.log('QR code:', data); // Bạn có thể trả dữ liệu này dưới dạng hình ảnh trong giao diện của bạn
                    return res.render('authen', { qrCode: data });
                }
            });
        } catch (error) {
            console.error('Error in authenticate:', error);
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
    async showAuthentication(req,res){
        const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if(user.secretKey==null){
                return res.redirect('/set-authentication');
            }
        res.render('authen-verify');
    }
    async verify(req,res){
        try {
            const { token } = req.body;
            const userId = req.session.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const verified = speakeasy.totp.verify({
                secret: user.secretKey,
                encoding: 'base32',
                token,
            });
            
            if (verified) {
                req.session.authenticated = true;
                console.log('User authenticated, session authenticated set:', req.session.authenticated);
                res.redirect('/me/home');
            } else {
                console.log('Invalid token');
                res.redirect('back');
            }
        }
        catch (error) {
            console.error('Error during verification:', error);
            next(error);
        }
    }
    search(req,res){
        res.render('search');
    }
}

module.exports = new SitesController;