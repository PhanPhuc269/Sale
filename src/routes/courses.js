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
router.post('/:slug/add-detail',coursesController.addDetailCourse);
router.delete('/:slug/delete-detail',coursesController.deleteDetailCourse);
router.get('/:_id/view-add-detail',coursesController.viewDetailCourse);
router.get('/:slug/watch',coursesController.watchCourse);
router.get('/:slug',coursesController.show);
router.get('/:slug/view-documents/',coursesController.viewDocument);


module.exports = router;