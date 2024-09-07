const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
//const upload = require('../upload');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import thư viện uuid nếu cần
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cloudinary = require('../../config/cloudinaryConfig');


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
    upload.single('image')(req, res, (err) => {
        if (err) {
            return next(err); // Xử lý lỗi của multer
        }

        const formData = req.body;
        const videoUrl = req.body.videoid;

        // Cải thiện regex để bao quát nhiều trường hợp URL YouTube hơn
        const videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoIdMatch) {
            formData.videoid = videoId;
        } else {
            return res.status(400).send('Invalid YouTube URL');
        }

        if (req.file) {
            cloudinary.uploader.upload(req.file.path, { resource_type: "image" }, (error, result) => {
                if (error) {
                    // Đảm bảo chỉ gửi một phản hồi HTTP
                    return res.status(500).json({
                        message: 'File upload failed',
                        error: error.message,
                    });
                }

                const fileUrl = result.secure_url;
                formData.image = fileUrl;

                // Sau khi tải lên Cloudinary thành công, lưu khóa học
                formData.user = req.session.userId;
                const course = new Course(formData);

                course.save()
                    .then(() => res.redirect('/'))
                    .catch((saveError) => {
                        // Đảm bảo chỉ gửi một phản hồi HTTP
                        res.status(500).json({
                            message: 'Failed to save course',
                            error: saveError.message,
                        });
                    });
            });
        } else {
            // Xử lý trường hợp không có file upload
            formData.image = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
            formData.user = req.session.userId;
            const course = new Course(formData);

            course.save()
                .then(() => res.redirect('/'))
                .catch((saveError) => {
                    // Đảm bảo chỉ gửi một phản hồi HTTP
                    res.status(500).json({
                        message: 'Failed to save course',
                        error: saveError.message,
                    });
                });
        }
        });
    }

    edit(req,res,next){
        Course.findById({_id: req.params.id,user: req.session.userId})
            .then(course => res.render('courses/edit',{course: mongooseToObject(course)}))
            .catch(next);
    }
    // update(req, res, next) {
    //     upload.single('image')(req, res, function (err) {
    //         if (err) {
    //             return next(err);
    //         }

    //         // Tìm khóa học hiện tại
    //         Course.findById({ _id: req.params.id, user: req.session.userId })
    //             .then(course => {
    //                 if (!course) {
    //                     return res.status(404).send('Course not found');
    //                 }

    //                 // Kiểm tra và cập nhật ảnh
    //                 if (req.file) {
    //                     // Đường dẫn ảnh cũ
    //                     const oldImagePath = path.join(__dirname, '..', '..', 'public', course.image);

    //                     // Xóa ảnh cũ nếu có
    //                     if (course.image) {
    //                         fs.unlink(oldImagePath, (err) => {
    //                             if (err) {
    //                                 console.error('Error deleting old image:', err);
    //                             }
    //                         });
    //                     }

    //                     // Lưu tên tệp ảnh mới vào cơ sở dữ liệu
    //                     req.body.image = `/img/${req.file.filename}`;
    //                 } else {
    //                     // Giữ lại ảnh cũ nếu không có ảnh mới
    //                     req.body.image = course.image;
    //                 }

    //                 // Cập nhật khóa học
    //                 Course.updateOne({ _id: req.params.id, user: req.session.userId }, req.body)
    //                     .then(() => res.redirect('/me/stored/courses'))
    //                     .catch(next);
    //             })
    //             .catch(next);
    //     });
    // }
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
                    const videoUrl = req.body.videoid;

            // Cải thiện regex để bao quát nhiều trường hợp URL YouTube hơn
            const videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (videoIdMatch) {
                formData.videoid = videoId;
            } else {
                return res.status(400).send('Invalid YouTube URL');
            }
            req.body.videoid = videoId;
            // Kiểm tra và cập nhật ảnh
            if (req.file) {
                // Xóa ảnh cũ nếu có
                if (course.image) {
                        // Phân tích URL để lấy public ID
                    const imageUrlParts = course.image.split('/');
                    const publicIdWithExtension = imageUrlParts[imageUrlParts.length - 1];
                    const publicId = publicIdWithExtension.split('.')[0];
                    console.log(publicId);
                    cloudinary.uploader.destroy(publicId, (error, result) => {
                        if (error) {
                            console.error('Error deleting old image:', error);
                        }
                    });
                }

                // Lưu tên tệp ảnh mới vào cơ sở dữ liệu
                cloudinary.uploader.upload(req.file.path , { resource_type: "image" }, (error, result) => {
                    if (error) {
                        // Đảm bảo chỉ gửi một phản hồi HTTP
                        return res.status(500).json({
                            message: 'File upload failed',
                            error: error.message,
                        });
                    }

                    const fileUrl = result.secure_url;
                    req.body.image = fileUrl;
                    console.log(req.body.image);
                    Course.updateOne({ _id: req.params.id, user: req.session.userId }, req.body)
                    .then(() => res.redirect('/me/stored/courses'))
                    .catch(next);
                });
            } else {
                // Giữ lại ảnh cũ nếu không có ảnh mới
                req.body.image = course.image;
                Course.updateOne({ _id: req.params.id, user: req.session.userId }, req.body)
                .then(() => res.redirect('/me/stored/courses'))
                .catch(next);
            }
            console.log(req.body.image);
            // Cập nhật khóa học
            
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