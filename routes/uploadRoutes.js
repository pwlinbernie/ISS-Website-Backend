const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

// 配置 multer 使用内存存储
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制 10MB
  },
  fileFilter: (req, file, cb) => {
    // 允許的文件類型
    const allowedMimes = [
      // 圖片類型
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',
      // 文檔類型
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // 文本類型
      'text/plain',
      'text/csv',
      // 壓縮文件
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      // 其他常見類型
      'application/octet-stream'
    ];

    console.log('上傳文件信息:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (allowedMimes.includes(file.mimetype)) {
      console.log('文件類型檢查通過');
      cb(null, true);
    } else {
      console.error('不支持的文件類型:', file.mimetype);
      cb(new Error(`不支持的文件類型: ${file.mimetype}。檔案名: ${file.originalname}`), false);
    }
  }
});

// 单文件上传
router.post('/single', upload.single('file'), uploadController.uploadFile);

// 多文件上传
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultipleFiles);

module.exports = router;
