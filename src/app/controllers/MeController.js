const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

class MeController{
    
    storedCourses(req,res,next){
        Promise.all([Course.find({}).sortable(req),Course.countDocumentsWithDeleted({deleted:true})])
            .then(([courses,deletedCount]) => res.render('me/stored-courses',
                {
                    courses: mutipleMongooseToObject(courses),
                    deletedCount,
                }))
            .catch(console=> next(error));
        
    }
    trashCourses(req,res,next){
        Course.findWithDeleted({deleted:true})
        .then(courses => res.render('me/trash-courses',{courses: mutipleMongooseToObject(courses)}))
        .catch(console=> next(error));
    }
}

module.exports = new MeController;