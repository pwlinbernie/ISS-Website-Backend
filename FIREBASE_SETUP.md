# Firebase 设置指南

## 步骤 1: 创建 Firebase 项目

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目" 或 "Add project"
3. 输入项目名称，例如 "news-system"
4. 按照提示完成项目创建

## 步骤 2: 启用 Firebase Storage

1. 在 Firebase 项目控制台中，点击左侧菜单的 "Storage"
2. 点击 "Get Started" 开始使用
3. 在安全规则对话框中，选择 "以测试模式开始" (用于开发环境)
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. 选择存储位置（建议选择亚洲地区）
5. 点击 "完成"

## 步骤 3: 生成 Service Account 密钥

1. 在 Firebase 控制台中，点击左上角的齿轮图标 ⚙️，选择 "项目设置"
2. 切换到 "服务帐号" (Service accounts) 标签页
3. 点击 "生成新的私钥" 按钮
4. 在弹出的确认对话框中点击 "生成密钥"
5. 密钥文件将自动下载到你的电脑（JSON 格式）

## 步骤 4: 配置项目

1. 将下载的 JSON 文件重命名为 `firebase-service-account.json`
2. 将该文件放在项目根目录（与 server.js 同级）
3. **重要**: 确保 `.gitignore` 文件中包含 `firebase-service-account.json`，避免上传到版本控制

## 步骤 5: 更新 .env 配置

1. 打开项目根目录的 `.env` 文件
2. 找到你的 Firebase Storage Bucket 名称：
   - 在 Firebase 控制台的 Storage 页面，可以看到 Bucket 名称
   - 通常格式为: `your-project-id.appspot.com`
3. 更新 `.env` 文件中的 `FIREBASE_STORAGE_BUCKET` 值：
   ```
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

## 步骤 6: 测试配置

1. 启动服务器:
   ```bash
   npm run dev
   ```

2. 查看控制台输出，应该会看到:
   ```
   ✅ Firebase initialized successfully
   ```

3. 如果看到错误信息，请检查:
   - `firebase-service-account.json` 文件是否存在且位置正确
   - `.env` 文件中的 `FIREBASE_STORAGE_BUCKET` 是否正确
   - JSON 文件内容是否完整有效

## 生产环境安全规则（推荐）

在生产环境中，应该设置更严格的 Storage 安全规则：

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 图片文件夹 - 所有人可读，仅认证用户可写
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 文件文件夹 - 所有人可读，仅认证用户可写
    match /files/{fileId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 故障排除

### 问题: "Firebase is not initialized"
**解决方案**:
- 检查 `firebase-service-account.json` 文件是否存在
- 确认文件路径配置正确
- 查看服务器启动时的控制台错误信息

### 问题: 上传失败 "Permission denied"
**解决方案**:
- 检查 Firebase Storage 安全规则
- 确保规则允许写入操作
- 在开发环境可以临时使用测试模式规则

### 问题: 图片无法显示
**解决方案**:
- 检查文件是否已设置为公开访问
- 代码中已自动调用 `file.makePublic()`
- 确认浏览器可以访问 Firebase Storage URL

## 注意事项

⚠️ **安全提醒**:
- 永远不要将 `firebase-service-account.json` 上传到公开的代码仓库
- 在生产环境中使用严格的安全规则
- 定期检查 Firebase 使用量和费用
- 考虑实现用户认证和权限控制

💡 **优化建议**:
- 为不同环境使用不同的 Firebase 项目（开发/生产）
- 设置 Firebase Storage 的 CORS 配置
- 考虑使用 CDN 加速图片访问
- 定期清理不再使用的文件
