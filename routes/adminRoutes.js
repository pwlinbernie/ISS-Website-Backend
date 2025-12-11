const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 獲取所有使用者
router.get('/users', adminController.getAllUsers);

// 獲取 admin 角色 ID
router.get('/role-id', adminController.getAdminRoleId);

// 指派 admin 角色給使用者
router.post('/users/:userId/admin', adminController.assignAdminRole);

// 移除使用者的 admin 角色
router.delete('/users/:userId/admin', adminController.removeAdminRole);

module.exports = router;
