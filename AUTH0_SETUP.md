# Auth0 設定說明

## 步驟 1: 建立 Auth0 帳號和應用程式

1. 前往 [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
2. 註冊或登入您的 Auth0 帳號
3. 點選左側選單的 **Applications** → **Applications**
4. 點選 **Create Application** 按鈕

## 步驟 2: 設定應用程式

1. **應用程式名稱**: 輸入 "News System Admin" 或您喜歡的名稱
2. **應用程式類型**: 選擇 **Single Page Web Applications**
3. 點選 **Create**

## 步驟 3: 配置應用程式 URL

在應用程式的 **Settings** 頁面中，設定以下 URL：

### 本地開發環境
- **Allowed Callback URLs**: `http://localhost:3000/admin`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000` ⚠️ 必需設定！

### 正式環境（Heroku）
- **Allowed Callback URLs**: `https://iss-news-system-a1e859b9ddc0.herokuapp.com/admin`
- **Allowed Logout URLs**: `https://iss-news-system-a1e859b9ddc0.herokuapp.com`
- **Allowed Web Origins**: `https://iss-news-system-a1e859b9ddc0.herokuapp.com`

⚠️ **重要**:
- Allowed Web Origins 對於 silent authentication 是必需的
- 可以同時設定多個 URL，用逗號分隔

## 步驟 4: 取得應用程式憑證

在 **Settings** 頁面找到以下資訊：
- **Domain**: 例如 `your-tenant.auth0.com`
- **Client ID**: 一串長的英數字串

## 步驟 5: 更新 .env 檔案

編輯專案根目錄的 `.env` 檔案，更新以下設定：

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id-here
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/
```

## 步驟 6: 設定使用者角色

### 方法 A: 使用 Auth0 Roles（推薦）

1. 在 Auth0 Dashboard，前往 **User Management** → **Roles**
2. 點選 **Create Role**
3. 名稱輸入 `admin`，描述輸入 "管理員角色"
4. 點選 **Create**

5. 前往 **User Management** → **Users**
6. 選擇要設為管理員的使用者
7. 點選 **Roles** 標籤
8. 點選 **Assign Roles**
9. 選擇 `admin` 角色並儲存

### 方法 B: 使用 Actions（自訂 Claims）

1. 前往 **Actions** → **Library**
2. 點選 **Build Custom**
3. 建立一個新的 Action，名稱為 "Add Roles to Token"
4. 貼上以下程式碼：

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your-domain.com';

  if (event.authorization) {
    // 從使用者的 app_metadata 取得角色
    const roles = event.user.app_metadata?.roles || [];
    api.idToken.setCustomClaim(`${namespace}/roles`, roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
  }
};
```

5. 點選 **Deploy**
6. 前往 **Actions** → **Flows** → **Login**
7. 將剛建立的 Action 拖曳到流程中
8. 點選 **Apply**

9. 為使用者新增角色：
   - 前往 **User Management** → **Users**
   - 選擇使用者
   - 點選 **Metadata** 標籤
   - 在 `app_metadata` 中加入：

   ```json
   {
     "roles": ["admin"]
   }
   ```

## 步驟 7: 測試

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 開啟瀏覽器訪問 `http://localhost:3000/admin`

3. 應該會看到登入頁面

4. 點選「登入」按鈕，會被導向 Auth0 登入頁面

5. 使用有 admin 角色的帳號登入

6. 登入成功後，應該會被導回後台管理頁面

## 常見問題

### Q1: 登入後顯示「您沒有管理員權限」

**解決方法**:
- 確認使用者已被指派 `admin` 角色
- 檢查 Action 是否正確部署並加入到 Login Flow
- 在 admin.html 的 `checkAdminRole` 函數中，檢查 console.log 輸出的角色資訊

### Q2: 無法取得 Auth0 設定

**解決方法**:
- 確認 `.env` 檔案中的設定正確
- 重新啟動伺服器
- 檢查 `AUTH0_DOMAIN` 格式是否正確（應該是 `your-tenant.auth0.com`）

### Q3: CORS 錯誤

**解決方法**:
- 確認 **Allowed Web Origins** 已正確設定
- 檢查 URL 是否完全一致（包含 http/https、port 等）

### Q4: 在 Heroku 部署後無法登入

**解決方法**:
1. 在 Heroku Dashboard 設定環境變數：
   ```
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/
   ```

2. 在 Auth0 Dashboard 中新增 Heroku 的 URL 到 Allowed URLs

3. 重新部署應用程式

## 安全建議

1. **不要**將 `.env` 檔案提交到 Git
2. 定期更新 Auth0 SDK 版本
3. 使用強密碼和多因素驗證（MFA）
4. 定期檢視使用者權限
5. 在正式環境中啟用 HTTPS

## 進階設定

### 啟用多因素驗證（MFA）

1. 前往 **Security** → **Multi-factor Auth**
2. 選擇要啟用的 MFA 方式（推薦：Google Authenticator 或 SMS）
3. 設定規則決定哪些使用者需要 MFA

### 自訂登入頁面

1. 前往 **Branding** → **Universal Login**
2. 選擇 **New** 體驗
3. 自訂顏色、logo 和樣式

### 設定密碼規則

1. 前往 **Security** → **Attack Protection**
2. 設定密碼強度要求
3. 啟用 Brute Force Protection
