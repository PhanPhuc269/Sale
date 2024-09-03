const express = require ('express');
const router =express.Router();

const meController= require('../app/controllers/MeController');

router.get('/stored/courses',meController.storedCourses);
router.get('/trash/courses',meController.trashCourses);
router.get('/home',meController.home);
router.get('/stored/news',meController.news);
router.post('/stored/news',meController.creatPost);



module.exports = router;