const express = require ('express');
const router =express.Router();

const nameMiddleware = require('../app/middlewares/nameMiddleware');

const sitesController= require('../app/controllers/SitesController');
function requireLogin(req, res, next) {
    // if (!req.session.userId) {
    //     return res.redirect('/');
    // }
    // next();
}
router.get('/',sitesController.welcome);
router.post('/login',sitesController.login);
router.post('/register',sitesController.register);

router.use(nameMiddleware);
router.get('/set-authentication',requireLogin, sitesController.setAuthentication);
router.get('/authen-verify',requireLogin, sitesController.showAuthentication);
router.post('/verify',requireLogin, sitesController.verify);


module.exports = router;