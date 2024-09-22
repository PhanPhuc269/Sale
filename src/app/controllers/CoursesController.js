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
const addDetailCourse = require('../models/DetailCourse');
const DetailCourse = require('../models/DetailCourse');
const {convertLinksToIds} = require('../../util/parseVideoLinks');
const { count } = require('console');
const {parseVideoLink} = require('../../util/parseVideoLinks');
const { calculateTotalDuration} = require('../../util/sumTimeVideo');
const { sum } = require('../../helpers/handlebars');
const { render } = require('node-sass');
const { extractDocumentId, createEmbedUrl } = require('../../util/convertURL_ID');

class CoursesController{
    async show(req,res, next){
        try {
            const course = await Course.findOne({ slug: req.params.slug });
            if (!course) {
                return res.status(404).send('Course not found');
            }

            const videoDetails = await DetailCourse.find({ slug: course.slug, type: 'video' });
            const documentDetails = await DetailCourse.find({ slug: course.slug, type: 'document' });
            try {
                const sumTime = await calculateTotalDuration(videoDetails, 'AIzaSyCYn8Xf_hkdzf7raZds1-gW91waUpcBGCk');
                console.log('sumTime:', sumTime); // Kiểm tra giá trị sumTime

                res.render('courses/show', {
                    course: mongooseToObject(course),
                    video: mutipleMongooseToObject(videoDetails),
                    countVideo: videoDetails.length,
                    document: mutipleMongooseToObject(documentDetails),
                    countDocument: documentDetails.length,
                    sumTime: sumTime,
                });
            } catch (error) {
                console.error('Error calculating total duration:', error);
                next(error);
            }
        } catch (error) {
            next(error);
        }
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
                    console.log('req.body:', req.body);
                    
                    if(req.body.videoid){            
                        req.body.videoid = parseVideoLink(req.body.videoid);
                    }
                    else
                    {
                        req.body.videoid = course.videoid;
                    }
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
                            .then(() => res.redirect('view-add-detail'))
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
    async viewDetailCourse(req,res,next){
        try {
            const course = await Course.findOne({_id: req.params._id, user: req.session.userId});
            if (!course) {
                return res.status(404).json({message: 'Course not found'});
            }
            const video = await DetailCourse.find({slug: course.slug, type: 'video'});
            const document = await DetailCourse.find({slug: course.slug, type: 'document'});
            res.render('courses/detailCreate', {
                course: mongooseToObject(course),
                video: mutipleMongooseToObject(video),
                document: mutipleMongooseToObject(document)
            });
        } catch (error) {
            next(error);
        }
    }
    async addDetailCourse(req, res, next) {
        try {
            if (!req.body._id) {
                var link= req.body.link;
                if(req.body.type=='video'){
                    link = parseVideoLink(req.body.link);
                }
                const detailCreate = new DetailCourse({
                    name: req.body.name,
                    slug: req.body.slug,
                    type: req.body.type,
                    link: link,
                });
                await detailCreate.save();
                res.redirect('/');
            } else {
                req.body.link = parseVideoLink(req.body.link);
                await DetailCourse.updateOne({ _id: req.body._id }, req.body);
                res.redirect('/');
            }
        } catch (saveError) {
            res.status(500).json({
                message: 'Failed to save detail',
                error: saveError.message,
            });
        }
    }
    deleteDetailCourse(req, res, next) {
        DetailCourse.deleteOne({ _id: req.body._id })
            .then(() => res.redirect('/'))
            .catch(next);
    }
    async watchCourse(req, res, next) {
        try{
            const course = await Course.findOne({slug: req.params.slug});
            if(!course){
                return res.status(404).send('Course not found');
            }
            console.log('req.params.watch:', req.params.watch);
            const viewVideo = await DetailCourse.findOne({_id: req.query.watch});
            console.log('viewVideo:', viewVideo);
            const video = await DetailCourse.find({slug: course.slug, type: 'video'});
            const document = await DetailCourse.find({slug: course.slug, type: 'document'});
            res.render('courses/watch', {
                course: mongooseToObject(course),
                viewVideo: mongooseToObject(viewVideo),
                video: mutipleMongooseToObject(video),
                document: mutipleMongooseToObject(document)
            });
        }catch(error){
            next(error);
        }
    }
    async viewDocument(req, res, next) {
        const course = await Course.findOne({slug: req.params.slug});
        if (!course) {
            return res.status(404).send('Course not found');
        }
        const document = mutipleMongooseToObject (await DetailCourse.find({slug: course.slug, type: 'document'}));
        document.forEach(doc => {
            const { platform, id } = extractDocumentId(doc.link);
            doc.embedUrl = createEmbedUrl(platform, id);
        });
        if (!req.query.d) {
            res.render('courses/document', {
                course: mongooseToObject(course),
                documents: document
            });
        } else
        {
            const documentId = req.query.d;
            const selectedDocument = document.find(doc => doc._id == documentId);
            if (!selectedDocument) {
                return res.status(404).send('Document not found');
            }
            res.render('courses/document', {
                course: mongooseToObject(course),
                documents: document,
                currentView: selectedDocument.embedUrl
            });
        }
        
    }
}
module.exports = new CoursesController;