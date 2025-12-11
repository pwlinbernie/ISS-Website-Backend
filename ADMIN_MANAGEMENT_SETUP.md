# 管理員管理功能設定指南

## 功能說明

現在你的後台管理系統新增了「管理員管理」功能，可以：

✅ 查看所有使用者列表
✅ 設定使用者為管理員
✅ 移除使用者的管理員權限
✅ 查看使用者的登入資訊

## 🚨 必須完成的設定

目前 `.env` 檔案中的 Management API 憑證是佔位符，你需要完成以下設定才能使用管理員管理功能。

## 📋 設定步驟（約 10 分鐘）

### 步驟 1: 建立 Machine to Machine Application

1. 前往 [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
2. 左側選單：**Applications** → **Applications**
3. 點選右上角 **Create Application** 按鈕
4. 填寫資訊：
   - **Name**: `News System Management API`
   - **Application Type**: 選擇 **Machine to Machine Applications**
5. 點選 **Create**

### 步驟 2: 授權存取 Management API

1. 在建立應用程式後，會自動跳出授權視窗
2. 選擇 **Auth0 Management API**
3. 勾選以下權限：
   - `read:users` - 讀取使用者資訊
   - `read:roles` - 讀取角色資訊
   - `read:role_members` - 讀取角色成員
   - `update:users` - 更新使用者（用於指派角色）
   - `create:role_members` - 新增角色成員
   - `delete:role_members` - 刪除角色成員
4. 點選 **Authorize** 按鈕

### 步驟 3: 取得憑證

1. 在應用程式頁面，點選 **Settings** 標籤
2. 找到以下資訊：
   - **Domain**: `dev-p74mrgncvrljl057.us.auth0.com` （應該跟現有的一樣）
   - **Client ID**: 複製這個值
   - **Client Secret**: 複製這個值（點擊眼睛圖示顯示）

### 步驟 4: 取得 Admin Role ID

#### 方法 A: 使用 API 工具（推薦）

1. 在應用程式頁面，點選 **Quick Start** 標籤
2. 點選 **Test** 按鈕
3. 會看到 Access Token，複製這個 Token
4. 使用以下指令取得 Role ID（替換 `YOUR_ACCESS_TOKEN`）：

```bash
curl --request GET \
  --url https://dev-p74mrgncvrljl057.us.auth0.com/api/v2/roles \
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN'
```

5. 在回應中找到名為 `admin` 的角色，複製它的 `id` 欄位

#### 方法 B: 使用 Auth0 Dashboard

1. 左側選單：**User Management** → **Roles**
2. 點選 `admin` 角色
3. 在瀏覽器網址列中，URL 的最後部分就是 Role ID
   - 例如：`https://manage.auth0.com/dashboard/.../roles/rol_xxxxxxxxxxxxx`
   - `rol_xxxxxxxxxxxxx` 就是 Role ID

### 步驟 5: 更新 .env 檔案

編輯 `/Users/chenguanyu/news-system/.env` 檔案，替換以下內容：

```env
# Auth0 Management API (用於後端管理使用者)
AUTH0_MANAGEMENT_CLIENT_ID=你的-management-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=你的-management-client-secret
AUTH0_ADMIN_ROLE_ID=rol_xxxxxxxxxxxxx
```

**範例**：
```env
AUTH0_MANAGEMENT_CLIENT_ID=aBc123XyZ456
AUTH0_MANAGEMENT_CLIENT_SECRET=1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH
AUTH0_ADMIN_ROLE_ID=rol_ABC123xyz456
```

### 步驟 6: 重新啟動伺服器

```bash
# 停止目前的伺服器（Ctrl+C）
# 然後重新啟動
npm run dev
```

### 步驟 7: 測試功能

1. 開啟瀏覽器前往 `http://localhost:3000/admin`
2. 登入後台
3. 點選「管理員管理」標籤
4. 應該會看到所有使用者列表，包含你自己
5. 嘗試：
   - 查看使用者資訊
   - 將某個使用者設為管理員
   - 移除管理員權限

## ✅ 驗證清單

- [ ] 已建立 Machine to Machine Application
- [ ] 已授權 Management API 存取
- [ ] 已勾選所有必要權限
- [ ] 已複製 Client ID 和 Client Secret
- [ ] 已取得 Admin Role ID
- [ ] 已更新 .env 檔案
- [ ] 已重新啟動伺服器
- [ ] 可以在後台看到使用者列表
- [ ] 可以成功設定/移除管理員

## 🔧 除錯

### 錯誤: "Auth0 Management API 未配置"

**原因**：`.env` 中的 `AUTH0_MANAGEMENT_CLIENT_ID` 或 `AUTH0_MANAGEMENT_CLIENT_SECRET` 未設定

**解決**：
1. 確認已完成步驟 5
2. 檢查 `.env` 檔案中的值不是 `your-management-client-id`
3. 重新啟動伺服器

### 錯誤: "Insufficient scope"

**原因**：Management API 權限不足

**解決**：
1. 前往 Auth0 Dashboard
2. **Applications** → **APIs** → **Auth0 Management API**
3. 點選 **Machine to Machine Applications** 標籤
4. 找到 `News System Management API`
5. 展開權限，確認已勾選所有必要權限（見步驟 2）
6. 點選 **Update**

### 錯誤: "找不到 admin 角色"

**原因**：沒有建立 admin 角色，或 Role ID 不正確

**解決**：
1. 確認在 Auth0 Dashboard 中已建立 `admin` 角色
2. 使用步驟 4 的方法重新取得正確的 Role ID
3. 更新 `.env` 中的 `AUTH0_ADMIN_ROLE_ID`

### 載入使用者列表很慢

**原因**：Management API 需要為每個使用者查詢角色資訊

**改善**：
- 這是正常的，因為需要逐一查詢每個使用者的角色
- 如果有很多使用者，可能需要 5-10 秒
- 未來可以考慮加入快取機制

## 📝 安全建議

1. **不要提交 .env 檔案到 Git**
   - `.env` 已在 `.gitignore` 中，請勿移除

2. **定期輪換 Client Secret**
   - 在 Auth0 Dashboard 可以重新產生 Secret

3. **只給予必要權限**
   - 不要勾選不需要的 Management API 權限

4. **保護後台路由**
   - 確保只有 admin 角色可以存取管理員管理功能
   - 目前已透過 Auth0 Action 驗證

## 🎉 完成！

設定完成後，你就可以在後台直接管理所有使用者的管理員權限了！

如有問題，請檢查：
- 伺服器 Console 的錯誤訊息
- 瀏覽器 Console 的錯誤訊息
- Auth0 Dashboard 的 Logs（Monitoring → Logs）
