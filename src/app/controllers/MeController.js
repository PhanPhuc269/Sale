const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

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
}

module.exports = new MeController;