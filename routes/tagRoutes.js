const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// 獲取所有標籤
router.get('/', tagController.getAllTags);

// 獲取啟用的標籤
router.get('/active', tagController.getActiveTags);

// 創建標籤
router.post('/', tagController.createTag);

// 更新標籤
router.put('/:id', tagController.updateTag);

// 刪除標籤
router.delete('/:id', tagController.deleteTag);

module.exports = router;
