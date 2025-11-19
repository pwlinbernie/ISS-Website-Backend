const { uploadFile, isFirebaseInitialized } = require('../config/firebase');

// 上傳圖片或文件
exports.uploadFile = async (req, res) => {
  try {
    console.log('收到上傳請求');

    if (!isFirebaseInitialized()) {
      console.error('Firebase 未初始化');
      return res.status(503).json({
        success: false,
        message: 'Firebase 未配置，無法上傳文件'
      });
    }

    console.log('Firebase 已初始化');

    if (!req.file) {
      console.error('沒有收到文件');
      return res.status(400).json({
        success: false,
        message: '請選擇要上傳的文件'
      });
    }

    const file = req.file;
    console.log('文件詳細信息:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer ? file.buffer.length : 'undefined'
    });

    if (!file.buffer) {
      console.error('文件 buffer 為空');
      return res.status(400).json({
        success: false,
        message: '文件數據為空'
      });
    }

    const isImage = file.mimetype.startsWith('image/');
    const folder = isImage ? 'images' : 'files';

    console.log('開始上傳到 Firebase Storage, 資料夾:', folder);

    const result = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    console.log('上傳成功:', result.url);

    res.json({
      success: true,
      message: '文件上傳成功',
      data: {
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: file.size,
        type: isImage ? 'image' : 'file'
      }
    });
  } catch (error) {
    console.error('上傳錯誤:', error);
    console.error('錯誤堆疊:', error.stack);
    res.status(500).json({
      success: false,
      message: '文件上傳失敗',
      error: error.message
    });
  }
};

// 批量上传
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!isFirebaseInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Firebase 未配置，无法上传文件'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const isImage = file.mimetype.startsWith('image/');
      const folder = isImage ? 'images' : 'files';

      const result = await uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder
      );

      return {
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: file.size,
        type: isImage ? 'image' : 'file'
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      data: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
};
