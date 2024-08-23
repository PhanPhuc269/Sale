const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const upload = require('../upload/image');

class CoursesController{
    show(req,res, next){
        Course.findOne({slug: req.params.slug, user: req.session.userId})
        .then(course => {
            res.render('courses/show', {course: mongooseToObject(course)})
        })
        .catch(next);
    }
    create(req,res){
        res.render('courses/create');
    }
    store(req, res, next) {
        upload.single('image')(req, res, async (err) => {
        console.log('Request Body:', req.body); // Kiểm tra dữ liệu từ biểu mẫu
        console.log('Request File:', req.file); // Kiểm tra tệp tải lên
        const formData = req.body;
        formData.image = req.file ? `/img/${req.file.filename}` : `https://img.youtube.com/vi/${req.body.videoid}/sddefault.jpg`;
        formData.user= req.session.userId;
        const course=new Course(formData);
        // course.save()
        //     .then(() => res.redirect())
        //     .catch(next);
         try {
                await course.save();
                res.redirect('/me/stored/courses');
            } catch (error) {
                next(error);
            }
        })
        
    };
    edit(req,res,next){
        Course.findById(req.params.id, req.session.userId)
            .then(course => res.render('courses/edit',{course: mongooseToObject(course)}))
            .catch(next);
    }
    update(req,res,next){
        Course.updateOne({_id: req.params.id,user: req.session.userId}, req.body)
            .then(() => res.redirect('/me/stored/courses'))
            .catch(next);
    }
    delete(req,res,next){
        Course.delete({_id: req.params.id, user: req.session.userId})
            .then(() => res.redirect('back'))
            .catch(next);

    }
    destroy(req,res,next){
        Course.deleteOne({_id: req.params.id, user: req.session.userId})
            .then(() => res.redirect('back'))
            .catch(next);

    }
    restore(req,res,next){
        Course.restore({_id: req.params.id, user: req.session.userId})
            .then(() => res.redirect('back'))
            .catch(next);
    }
    handleFormActions(req,res,next){
        switch(req.body.action){
            case 'delete':
                Course.delete({_id: {$in: req.body.courseIds}, user: req.session.userId})
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({message: 'Action invalid'});
        }
    }
}
module.exports = new CoursesController;