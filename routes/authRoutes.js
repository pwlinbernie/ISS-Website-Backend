const express = require('express');
const router = express.Router();
const { auth0Config, validateAuth0Config } = require('../config/auth0');

// 取得 Auth0 公開配置（供前端使用）
router.get('/config', (req, res) => {
  try {
    if (!validateAuth0Config()) {
      return res.status(503).json({
        success: false,
        message: 'Auth0 配置未完成。請聯繫系統管理員。'
      });
    }

    // 只傳送前端需要的公開資訊
    res.json({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      audience: auth0Config.audience
    });
  } catch (error) {
    console.error('取得 Auth0 配置失敗:', error);
    res.status(500).json({
      success: false,
      message: '取得配置失敗',
      error: error.message
    });
  }
});

module.exports = router;
