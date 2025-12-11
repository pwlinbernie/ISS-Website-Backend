/**
 * Auth0 Action: Add Roles to Token
 *
 * 這個 Action 會在使用者登入時，將角色資訊加入到 ID Token 和 Access Token 中
 *
 * 設定步驟：
 * 1. 前往 Auth0 Dashboard
 * 2. 左側選單：Actions → Library
 * 3. 點選 "Build Custom"
 * 4. 名稱：Add Roles to Token
 * 5. 貼上以下程式碼
 * 6. 點選 "Deploy"
 * 7. 前往 Actions → Flows → Login
 * 8. 將這個 Action 拖曳到流程中
 * 9. 點選 "Apply"
 */

exports.onExecutePostLogin = async (event, api) => {
  // 使用自訂的 namespace（避免與 Auth0 保留欄位衝突）
  const namespace = 'https://iss-news-system.com';

  // 方法 1: 根據 email 指派角色（適合少數管理員）
  const adminEmails = [
    'your-email@example.com',  // ⚠️ 請替換成你的實際 email
    // 'admin2@example.com',     // 可以加入更多管理員
  ];

  let roles = [];

  if (adminEmails.includes(event.user.email)) {
    roles.push('admin');
    console.log(`使用者 ${event.user.email} 已被指派 admin 角色`);
  }

  // 方法 2: 從使用者的 app_metadata 讀取角色（更靈活）
  // 取消註解以下程式碼來使用這個方法：
  /*
  if (event.user.app_metadata && event.user.app_metadata.roles) {
    roles = event.user.app_metadata.roles;
    console.log(`從 app_metadata 讀取角色:`, roles);
  }
  */

  // 方法 3: 從 Auth0 Roles 讀取（需要先在 Auth0 建立 Roles）
  // 取消註解以下程式碼來使用這個方法：
  /*
  if (event.authorization && event.authorization.roles) {
    roles = event.authorization.roles;
    console.log(`從 Auth0 Roles 讀取:`, roles);
  }
  */

  // 將角色資訊加入到 token 中
  if (event.authorization) {
    // 加入到 ID Token（供前端使用）
    api.idToken.setCustomClaim(`${namespace}/roles`, roles);

    // 加入到 Access Token（供 API 使用）
    api.accessToken.setCustomClaim(`${namespace}/roles`, roles);

    console.log(`已將角色加入 token:`, roles);
  }
};

/**
 * 使用方法 2 時，在 Auth0 為使用者設定角色的步驟：
 *
 * 1. 前往 User Management → Users
 * 2. 選擇要設為管理員的使用者
 * 3. 滾動到 "Metadata" 區域
 * 4. 在 "app_metadata" 欄位加入：
 *
 * {
 *   "roles": ["admin"]
 * }
 *
 * 5. 點選 "Save"
 */
