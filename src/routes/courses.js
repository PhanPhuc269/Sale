const express = require ('express');
const router =express.Router();

const coursesController= require('../app/controllers/CoursesController');

router.post('/handle-form-actions',coursesController.handleFormActions);
router.get('/:id/edit',coursesController.edit);
router.put('/:id',coursesController.update);
router.delete('/:id',coursesController.delete);
router.delete('/:id/force',coursesController.destroy);
router.patch('/:id/restore',coursesController.restore);
router.post('/store',coursesController.store);
router.get('/create',coursesController.create);
router.get('/:slug',coursesController.show);


module.exports = router;