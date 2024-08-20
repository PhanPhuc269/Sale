const Course = require('../models/Course');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

class SitesController{
    async home(req,res, next){
        //res.render('home');
        //  try {
        //     const data = await Course.find({});
        //     res.json(data);
        // }  catch (err) {
        //     res.status(400).json({error: err});

        // }
        Course.find({})
        .then(courses => res.render('home',{courses: mutipleMongooseToObject(courses)}))
        .catch(console=> next(error));
        
    }
    search(req,res){
        res.render('search');
    }
}

module.exports = new SitesController;