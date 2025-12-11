# Auth0 快速設定指南

## 🚀 現況

✅ 已完成：
- Auth0 SDK 已整合
- 登入/登出功能已實作
- **暫時允許所有已登入使用者存取後台**（測試模式）

⚠️ 待完成：
- 設定 Auth0 Action 來傳遞角色資訊
- 啟用真正的角色檢查

## 📋 快速設定步驟（5 分鐘內完成）

### 步驟 1: 建立 Auth0 Action

1. 前往 [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
2. 左側選單：**Actions** → **Library**
3. 點選右上角 **Build Custom** 按鈕
4. 填寫資訊：
   - **Name**: `Add Roles to Token`
   - **Trigger**: `Login / Post Login`
   - **Runtime**: 選擇最新版本
5. 點選 **Create**

### 步驟 2: 貼上程式碼

在編輯器中，刪除所有預設程式碼，貼上以下內容：

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://iss-news-system.com';

  // ⚠️ 請將下面的 email 改成你的實際 email
  const adminEmails = [
    'your-email@example.com'  // 改成你的 email
  ];

  let roles = [];

  if (adminEmails.includes(event.user.email)) {
    roles.push('admin');
  }

  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
  }
};
```

**重要**：記得將 `your-email@example.com` 改成你登入 Auth0 的實際 email！

### 步驟 3: 部署 Action

1. 點選右上角 **Deploy** 按鈕
2. 等待部署完成（約 5 秒）

### 步驟 4: 加入到登入流程

1. 左側選單：**Actions** → **Flows** → **Login**
2. 在右側的 **Custom** 區域，找到剛才建立的 `Add Roles to Token`
3. 將它拖曳到流程圖中間（Start 和 Complete 之間）
4. 點選右上角 **Apply** 按鈕

### 步驟 5: 測試

1. 清除瀏覽器快取（特別是 Local Storage）
2. 重新登入 `http://localhost:3000/admin`
3. 開啟瀏覽器 Console（F12），應該會看到：
   ```
   完整使用者資訊: {...}
   使用者角色: ["admin"]
   使用者 email: your-email@example.com
   ```

### 步驟 6: 啟用真正的角色檢查

確認角色正確傳遞後，編輯 `public/admin.html`：

找到 `checkAdminRole` 函數，將：

```javascript
// 暫時：允許所有已登入的使用者進入（測試用）
console.warn('⚠️ 目前允許所有已登入使用者存取後台（測試模式）');
return true;

// 正式版本應該使用這個：
// return Array.isArray(roles) && roles.includes('admin');
```

改成：

```javascript
// 檢查是否包含 admin 角色
return Array.isArray(roles) && roles.includes('admin');
```

並移除 `return true;` 那一行。

## 🎯 驗證清單

- [ ] Auth0 Action 已建立並部署
- [ ] Action 已加入到 Login Flow
- [ ] Action 中的 email 已改成你的實際 email
- [ ] 清除瀏覽器快取
- [ ] 重新登入測試
- [ ] Console 顯示正確的角色資訊
- [ ] 修改 admin.html 啟用真正的角色檢查

## 🔧 除錯技巧

### 檢查 Action 是否執行

在 Auth0 Action 程式碼中加入 console.log：

```javascript
exports.onExecutePostLogin = async (event, api) => {
  console.log('Action 開始執行');
  console.log('使用者 email:', event.user.email);

  // ... 其他程式碼
};
```

然後在 Auth0 Dashboard 的 **Monitoring** → **Logs** 中查看執行記錄。

### 檢查使用者收到的 Token

在瀏覽器 Console 執行：

```javascript
auth0Client.getUser().then(user => console.log('User:', user));
```

應該會看到 `https://iss-news-system.com/roles` 欄位。

## 📝 常見問題

### Q: 為什麼我還是看不到角色？

A: 請確認：
1. Action 已正確部署（Deploy 按鈕顯示綠色勾勾）
2. Action 已加入到 Login Flow（在流程圖中可以看到）
3. 已清除瀏覽器 Local Storage 並重新登入
4. Action 中的 email 確實符合你登入的 email

### Q: 我想讓多個使用者成為管理員怎麼辦？

A: 在 Action 的 `adminEmails` 陣列中加入更多 email：

```javascript
const adminEmails = [
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
];
```

### Q: 我想用 Auth0 的 Roles 功能而不是 email 清單

A: 請參考 `auth0-action-add-roles.js` 檔案中的「方法 3」。

## 🎉 完成！

設定完成後，你的後台就只有擁有 admin 角色的使用者可以存取了。

如有問題，請查看：
- `AUTH0_SETUP.md` - 完整詳細的設定說明
- `auth0-action-add-roles.js` - Action 程式碼範例
