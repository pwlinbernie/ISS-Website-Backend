// Auth0 後端配置
require('dotenv').config();

const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  // audience 對於 SPA 應用是可選的
  audience: process.env.AUTH0_AUDIENCE || undefined
};

// 驗證配置
function validateAuth0Config() {
  if (!auth0Config.domain || !auth0Config.clientId) {
    console.warn('⚠️  Auth0 配置未完成。請在 .env 檔案中設定 AUTH0_DOMAIN 和 AUTH0_CLIENT_ID');
    return false;
  }
  return true;
}

// 檢查 Access Token 是否有效（簡化版本）
function verifyToken(token) {
  // 這是一個簡化的驗證
  // 在實際應用中，你應該使用 jsonwebtoken 套件來驗證 JWT
  if (!token) return false;

  try {
    // 解析 JWT（不驗證簽名，僅用於開發測試）
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // 檢查是否過期
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  auth0Config,
  validateAuth0Config,
  verifyToken
};
