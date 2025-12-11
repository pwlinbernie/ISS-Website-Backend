# 使用 Management API 取得角色（不需要 Action！）

## 🎯 優點

✅ **不需要建立 Auth0 Action**
✅ **可以在 Auth0 Dashboard 動態管理角色**
✅ **程式碼已經寫好了，只需要設定 Auth0**

## 📋 設定步驟（5 分鐘）

### 步驟 1: 啟用 Management API 存取

1. 前往 [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
2. 左側選單：**Applications** → **APIs**
3. 找到並點選 **Auth0 Management API**
4. 點選 **Machine to Machine Applications** 標籤
5. 找到你的應用程式（Client ID: `L4rVJsvlna4NdCrEQTJthJKijRS8eNNw`）
6. **開啟開關** 來授權這個應用程式
7. 展開權限設定，勾選以下權限：
   - `read:current_user`
   - `read:current_user_metadata`
   - `read:roles`
   - `read:role_members`

8. 點選 **Update** 儲存

### 步驟 2: 在 Auth0 建立 admin 角色

1. 左側選單：**User Management** → **Roles**
2. 點選右上角 **Create Role** 按鈕
3. 填寫：
   - **Name**: `admin`
   - **Description**: `管理員角色`
4. 點選 **Create**

### 步驟 3: 將角色指派給使用者

1. 左側選單：**User Management** → **Users**
2. 找到並點選你的使用者（`shirojun713@icloud.com`）
3. 點選 **Roles** 標籤
4. 點選 **Assign Roles** 按鈕
5. 選擇 `admin` 角色
6. 點選 **Assign**

### 步驟 4: 測試

1. **清除瀏覽器快取**（重要！）
   - 按 F12
   - Application → Local Storage
   - 清除所有 `auth0spa` 項目

2. **重新登入** `http://localhost:3000/admin`

3. **查看 Console**，應該會看到：
   ```
   嘗試透過 Management API 取得角色...
   已取得 Management API Token
   從 Management API 取得的角色: [{id: "rol_xxx", name: "admin", description: "管理員角色"}]
   ✅ 使用者有 admin 角色（透過 Management API）
   ```

## 🔍 除錯

### 如果看到 "Management API 呼叫失敗: 401"

**原因**：應用程式沒有被授權存取 Management API

**解決**：
1. 確認步驟 1 的開關已經開啟
2. 確認勾選了正確的權限
3. 清除瀏覽器快取重試

### 如果看到 "Management API 呼叫失敗: 403"

**原因**：權限不足

**解決**：
1. 確認已勾選 `read:current_user` 和 `read:roles` 權限
2. 點選 Update 儲存

### 如果看到空陣列 `[]`

**原因**：使用者沒有被指派任何角色

**解決**：
1. 確認步驟 2 已建立 `admin` 角色
2. 確認步驟 3 已將角色指派給使用者
3. 重新登入

## 🎓 三種方法總結

現在你的程式碼支援三種方法，**按照優先順序自動嘗試**：

### 1️⃣ Token 中的角色（最快）
- 如果有設定 Auth0 Action，直接從 Token 讀取
- 最快速，不需要額外 API 呼叫

### 2️⃣ Management API（推薦）
- 不需要 Action，直接查詢 Auth0
- 可以在 Dashboard 動態管理角色
- **目前實作的方法**

### 3️⃣ Email 白名單（備用）
- 如果前兩種方法都失敗，使用 email 白名單
- 最簡單但最不靈活

## ⚡ 效能考量

Management API 方法會在每次登入時呼叫一次 API。如果擔心效能：

1. **快取結果**：可以將角色資訊快取到 localStorage
2. **使用 Action**：一次性將角色加入 Token，之後不需要 API 呼叫
3. **混合方案**：優先使用 Token，找不到才用 API

## 🚀 推薦設定

對於你的情況，我推薦：

1. ✅ 使用 **Management API 方法**（目前已實作）
2. ✅ 在 Auth0 Dashboard 管理角色
3. ✅ 保留 Email 白名單作為備用

這樣既不需要寫 Action，又有完整的角色管理功能！
