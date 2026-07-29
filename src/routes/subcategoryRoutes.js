const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getSubcategories)
  .post(protect, authorize('admin'), createSubcategory);

router.route('/:id')
  .put(protect, authorize('admin'), updateSubcategory)
  .delete(protect, authorize('admin'), deleteCategory = deleteSubcategory);

module.exports = router;
