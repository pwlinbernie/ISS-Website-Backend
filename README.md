# 最新消息公告系统

## 功能特性

- ✅ 标签分类（贺、简章公告、放榜）
- ✅ 富文本编辑（Quill 编辑器）
- ✅ 图片上传（Firebase Storage）
- ✅ 文件下载支持
- ✅ 置顶功能
- ✅ 完整的增删改查

## 技术栈

- **后端**: Node.js + Express
- **数据库**: MongoDB（存储文本数据）
- **文件存储**: Firebase Storage（图片、文件）
- **前端**: 原生 HTML/CSS/JavaScript
- **富文本编辑器**: Quill

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

3. 配置 Firebase：
- 前往 [Firebase Console](https://console.firebase.google.com/)
- 创建项目并下载 Service Account 密钥
- 将 JSON 文件保存为 `firebase-service-account.json`
- 在 Firebase Storage 中启用存储功能

4. 启动 MongoDB：
```bash
# 确保 MongoDB 正在运行
mongod
```

5. 启动服务器：
```bash
npm run dev
```

6. 访问应用：
- 前端显示页面: http://localhost:3000
- 后台管理页面: http://localhost:3000/admin

## API 接口

### 获取所有公告
```
GET /api/news
Query参数:
- tag: 筛选标签（可选）
- page: 页码（默认1）
- limit: 每页数量（默认10）
```

### 获取单个公告
```
GET /api/news/:id
```

### 创建公告
```
POST /api/news
Body: JSON格式的公告数据
```

### 更新公告
```
PUT /api/news/:id
Body: JSON格式的更新数据
```

### 删除公告
```
DELETE /api/news/:id
```

### 上传文件
```
POST /api/upload
Body: FormData（包含文件）
```

## 数据结构

```javascript
{
  tag: String,          // 标签：贺、简章公告、放榜
  title: String,        // 标题
  publishDate: Date,    // 发布日期
  content: String,      // 富文本内容（HTML）
  images: [String],     // 图片URL数组
  links: [Object],      // 连结数组
  files: [Object],      // 文件数组
  isPinned: Boolean,    // 是否置顶
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```
