const express = require ('express');
const router =express.Router();

const sitesController= require('../app/controllers/SitesController');

router.get('/',sitesController.welcome);
router.get('/login',sitesController.welcome);
router.post('/login',sitesController.login);
router.post('/register',sitesController.register);


module.exports = router;