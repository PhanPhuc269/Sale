const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const upload = require('../upload');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import thư viện uuid nếu cần


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
        // Trích xuất UID từ link video YouTube
        const videoUrl = req.body.videoid;
        const videoIdMatch = videoUrl.match(/[?&]v=([^&#]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoId) {
            formData.video = videoId;
        } else {
            return res.status(400).send('Invalid YouTube URL');
        }
        formData.image = req.file ? `/img/${req.file.filename}` : `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
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
        Course.findById({_id: req.params.id,user: req.session.userId})
            .then(course => res.render('courses/edit',{course: mongooseToObject(course)}))
            .catch(next);
    }
    update(req, res, next) {
        upload.single('image')(req, res, function (err) {
            if (err) {
                return next(err);
            }

            // Tìm khóa học hiện tại
            Course.findById({ _id: req.params.id, user: req.session.userId })
                .then(course => {
                    if (!course) {
                        return res.status(404).send('Course not found');
                    }

                    // Kiểm tra và cập nhật ảnh
                    if (req.file) {
                        // Đường dẫn ảnh cũ
                        const oldImagePath = path.join(__dirname, '..', '..', 'public', course.image);

                        // Xóa ảnh cũ nếu có
                        if (course.image) {
                            fs.unlink(oldImagePath, (err) => {
                                if (err) {
                                    console.error('Error deleting old image:', err);
                                }
                            });
                        }

                        // Lưu tên tệp ảnh mới vào cơ sở dữ liệu
                        req.body.image = `/img/${req.file.filename}`;
                    } else {
                        // Giữ lại ảnh cũ nếu không có ảnh mới
                        req.body.image = course.image;
                    }

                    // Cập nhật khóa học
                    Course.updateOne({ _id: req.params.id, user: req.session.userId }, req.body)
                        .then(() => res.redirect('/me/stored/courses'))
                        .catch(next);
                })
                .catch(next);
        });
    }
    delete(req,res,next){
        Course.delete({_id: req.params.id, user: req.session.userId})
            .then(() => res.redirect('back'))
            .catch(next);

    }
    destroy(req,res,next){
        Course.findWithDeleted({ _id: req.params.id, user: req.session.userId })
            .then(courses => {

                if (!courses) {
                    throw new Error('Course not found');
                }
                const coursesObj = mutipleMongooseToObject(courses);
                // Lấy danh sách các đường dẫn hình ảnh cần xóa
                const imagePaths = coursesObj.map(course => {
                    return path.join(__dirname, '../../public', course.image);
                });
                // Xóa ảnh từ thư mục
                // Xóa từng hình ảnh
                imagePaths.forEach(imagePath => {
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error('Error deleting image:', err);
                        }
                    });
                });
                // Lấy danh sách các khóa học cần xóa
                const courseIds = courses.map(course => course._id);

                // Xóa các khóa học từ cơ sở dữ liệu
                Course.deleteMany({ _id: { $in: courseIds }, user: req.session.userId })
                    .then(() => res.redirect('back'))
                    .catch(next);
            })
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