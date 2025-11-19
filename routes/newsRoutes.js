const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// 获取所有公告（支持分页和筛选）
router.get('/', newsController.getAllNews);

// 获取单个公告
router.get('/:id', newsController.getNewsById);

// 创建公告
router.post('/', newsController.createNews);

// 更新公告
router.put('/:id', newsController.updateNews);

// 删除公告
router.delete('/:id', newsController.deleteNews);

// 切换置顶状态
router.patch('/:id/toggle-pin', newsController.togglePin);

module.exports = router;
