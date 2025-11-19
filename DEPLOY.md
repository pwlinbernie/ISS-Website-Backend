# Heroku 部署指南

## 📋 前置準備

### 1. 安裝 Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# 從 https://devcenter.heroku.com/articles/heroku-cli 下載安裝器
```

### 2. 登入 Heroku
```bash
heroku login
```

## 🚀 部署步驟

### 步驟 1: 連結 GitHub Repository

1. **在 GitHub 上創建新的 repository**
   - 前往 https://github.com/new
   - Repository 名稱: `news-system` (或您喜歡的名稱)
   - 設為 Private (因為包含配置信息)
   - 不要初始化 README、.gitignore 或 license

2. **推送代碼到 GitHub**
   ```bash
   # 添加 GitHub remote
   git remote add origin https://github.com/YOUR_USERNAME/news-system.git
   
   # 推送到 GitHub
   git push -u origin main
   ```

### 步驟 2: 在 Heroku 創建應用

1. **創建 Heroku 應用**
   ```bash
   heroku create your-news-system
   # 或讓 Heroku 自動生成名稱
   heroku create
   ```

2. **在 Heroku Dashboard 連結 GitHub**
   - 前往 https://dashboard.heroku.com/apps
   - 選擇您的應用
   - 點擊 "Deploy" 標籤
   - 選擇 "GitHub" 作為部署方法
   - 搜尋並連結您的 repository
   - 啟用 "Automatic deploys" (可選)

### 步驟 3: 設置環境變數

#### 方法 A: 使用 Heroku CLI
```bash
# MongoDB
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"

# Firebase Storage Bucket
heroku config:set FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"

# Firebase Admin SDK (JSON 格式)
# 將整個 firebase-service-account.json 的內容轉為一行
heroku config:set FIREBASE_CONFIG="$(cat firebase-service-account.json | tr -d '\n')"
```

#### 方法 B: 使用 Heroku Dashboard
1. 前往 https://dashboard.heroku.com/apps/your-app-name/settings
2. 點擊 "Reveal Config Vars"
3. 添加以下環境變數:
   - `MONGODB_URI`: MongoDB Atlas 連接字串
   - `FIREBASE_STORAGE_BUCKET`: Firebase Storage Bucket 名稱
   - `FIREBASE_CONFIG`: Firebase service account JSON 內容（整個 JSON 壓縮成一行）

### 步驟 4: 修改 Firebase 配置代碼

在 Heroku 上，我們需要從環境變數讀取 Firebase 配置。已經在 `config/firebase.js` 中處理。

### 步驟 5: 部署

```bash
# 如果使用 Heroku Git
git push heroku main

# 如果使用 GitHub 集成
# 只需要 push 到 GitHub，Heroku 會自動部署
git push origin main
```

### 步驟 6: 檢查部署狀態

```bash
# 查看日誌
heroku logs --tail

# 打開應用
heroku open
```

## 🔧 Firebase 配置處理

已更新 `config/firebase.js` 來支援 Heroku 環境：

```javascript
// 優先從環境變數讀取 (Heroku)
let serviceAccount;
if (process.env.FIREBASE_CONFIG) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  // 本地開發從文件讀取
  serviceAccount = require(serviceAccountPath);
}
```

## 📝 注意事項

### MongoDB Atlas 設置
1. 登入 MongoDB Atlas
2. 前往 Network Access
3. 添加 `0.0.0.0/0` 允許所有 IP（或添加 Heroku 的 IP 範圍）

### Firebase Storage 規則
確保 Storage 規則允許讀寫：
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read: if true;
      allow write: if true;  // 生產環境建議加上認證
    }
    match /files/{fileId} {
      allow read: if true;
      allow write: if true;  // 生產環境建議加上認證
    }
  }
}
```

### 環境變數檢查清單
- ✅ MONGODB_URI
- ✅ FIREBASE_STORAGE_BUCKET
- ✅ FIREBASE_CONFIG
- ✅ PORT (Heroku 自動設置)

## 🐛 故障排除

### 查看日誌
```bash
heroku logs --tail
```

### 重新啟動應用
```bash
heroku restart
```

### 檢查環境變數
```bash
heroku config
```

### 常見問題

**問題: 應用無法啟動**
- 檢查 `heroku logs --tail` 查看錯誤訊息
- 確認所有環境變數都已設置
- 確認 `Procfile` 存在且正確

**問題: MongoDB 連接失敗**
- 檢查 MONGODB_URI 是否正確
- 確認 MongoDB Atlas 的 Network Access 允許所有 IP

**問題: 文件上傳失敗**
- 檢查 FIREBASE_CONFIG 環境變數是否正確設置
- 確認 Firebase Storage 規則允許寫入

## 🎉 部署完成

您的應用現在應該在以下位址運行：
- **前端**: https://your-app-name.herokuapp.com
- **後台**: https://your-app-name.herokuapp.com/admin

## 📚 相關資源

- [Heroku Node.js 文檔](https://devcenter.heroku.com/articles/deploying-nodejs)
- [MongoDB Atlas 文檔](https://docs.atlas.mongodb.com/)
- [Firebase Admin SDK 文檔](https://firebase.google.com/docs/admin/setup)
