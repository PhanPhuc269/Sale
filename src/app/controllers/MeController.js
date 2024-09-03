const Course = require('../models/Course');
const User = require('../models/User');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const upload = require('../upload');
const Post = require('../models/Post');

class MeController{
    async home(req,res, next){
        //res.render('home');
        //  try {
        //     const data = await Course.find({});
        //     res.json(data);
        // }  catch (err) {
        //     res.status(400).json({error: err});

        // }
        try {
        // Tìm các khóa học thuộc về người dùng hiện tại
        const courses = await Course.find({ user: req.session.userId });
        res.render('me/home',{courses: mutipleMongooseToObject(courses)})
        } catch (err) {
            console.error(err);
            res.redirect('/login');
        }        
    }
    storedCourses(req,res,next){
        Promise.all([Course.find({user: req.session.userId}).sortable(req),Course.countDocumentsWithDeleted({deleted:true, user: req.session.userId})])
            .then(([courses,deletedCount]) => res.render('me/stored-courses',
                {
                    courses: mutipleMongooseToObject(courses),
                    deletedCount,
                }))
            .catch(console=> next(error));
        
    }
    trashCourses(req,res,next){
        Course.findWithDeleted({deleted:true,user: req.session.userId})
        .then(courses => res.render('me/trash-courses',{courses: mutipleMongooseToObject(courses)}))
        .catch(console=> next(error));
    }
    async news(req,res,next)
    {
        try {
            const user = await User.findById(req.session.userId);
        // Tìm các khóa học thuộc về người dùng hiện tại
        const posts = await Post.find({ user: req.session.userId });
        res.render('me/news',{posts: mutipleMongooseToObject(posts)})
        } catch (err) {
            console.error(err);
            res.redirect('/');
        } 
    }
    creatPost(req,res,next)
    {
        upload.array('media',20)(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            const formData = req.body;
            formData.images = [];
            formData.videos = [];
        
            if (req.files) {
                req.files.forEach(file => {
                    if (file.mimetype.startsWith('image/')) {
                        formData.images.push(`/img/${file.filename}`);
                    } else if (file.mimetype.startsWith('video/')) {
                        formData.videos.push(`/video/${file.filename}`);
                    }
                });
            }

            formData.user = req.session.userId;
            const user = await User.findById(req.session.userId);
            formData.name = mongooseToObject(user).username;
            const post = new Post(formData);

            try {
                await post.save();
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        });
    }
}

module.exports = new MeController;