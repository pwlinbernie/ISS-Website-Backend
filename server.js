require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 允許 iframe 嵌入
app.use((req, res, next) => {
  // 允許所有網站嵌入（生產環境可以限制特定網域）
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  // 或使用 Content-Security-Policy (更現代的方式)
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));

// 前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/embed', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'embed.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '路由不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 前端显示页面: http://localhost:${PORT}`);
  console.log(`⚙️  后台管理页面: http://localhost:${PORT}/admin\n`);
});
