// Auth0 身份驗證模組
let auth0Client = null;

// 從 CDN 載入 Auth0 SDK
async function loadAuth0() {
  return new Promise((resolve, reject) => {
    if (window.auth0) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.4/auth0-spa-js.production.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('無法載入 Auth0 SDK'));
    document.head.appendChild(script);
  });
}

// 初始化 Auth0 客戶端
async function initAuth0(config) {
  try {
    await loadAuth0();

    auth0Client = await window.auth0.createAuth0Client({
      domain: config.domain,
      clientId: config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin + '/admin',
        audience: config.audience,
        scope: 'openid profile email read:admin'
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    });

    // 處理登入回呼
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      await handleRedirectCallback();
    }

    return auth0Client;
  } catch (error) {
    console.error('Auth0 初始化失敗:', error);
    throw error;
  }
}

// 處理登入回呼
async function handleRedirectCallback() {
  try {
    await auth0Client.handleRedirectCallback();
    // 清除 URL 中的參數
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (error) {
    console.error('處理登入回呼失敗:', error);
    throw error;
  }
}

// 登入
async function login() {
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        prompt: 'login'
      }
    });
  } catch (error) {
    console.error('登入失敗:', error);
    throw error;
  }
}

// 登出
async function logout() {
  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (error) {
    console.error('登出失敗:', error);
    throw error;
  }
}

// 檢查是否已登入
async function isAuthenticated() {
  try {
    return await auth0Client.isAuthenticated();
  } catch (error) {
    console.error('檢查登入狀態失敗:', error);
    return false;
  }
}

// 取得使用者資訊
async function getUser() {
  try {
    return await auth0Client.getUser();
  } catch (error) {
    console.error('取得使用者資訊失敗:', error);
    return null;
  }
}

// 取得 Access Token
async function getAccessToken() {
  try {
    return await auth0Client.getTokenSilently();
  } catch (error) {
    console.error('取得 Access Token 失敗:', error);
    return null;
  }
}

// 檢查使用者是否有 admin 角色
async function hasAdminRole() {
  try {
    const user = await getUser();
    if (!user) return false;

    // 檢查使用者的 roles（這個欄位需要在 Auth0 中設定）
    // 通常會放在 user 的 metadata 或 app_metadata 中
    const roles = user['https://your-domain.com/roles'] || user.roles || [];
    return roles.includes('admin');
  } catch (error) {
    console.error('檢查 admin 角色失敗:', error);
    return false;
  }
}

// 匯出函數
window.Auth0Helper = {
  initAuth0,
  login,
  logout,
  isAuthenticated,
  getUser,
  getAccessToken,
  hasAdminRole
};
