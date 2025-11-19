const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  // 標籤：賀、簡章公告、放榜
  tag: {
    type: String,
    required: true,
    enum: ['賀', '簡章公告', '放榜'],
    index: true
  },

  // 标题
  title: {
    type: String,
    required: true,
    trim: true
  },

  // 发布日期
  publishDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // 富文本内容（HTML格式）
  content: {
    type: String,
    required: true
  },

  // 图片URL数组（存储在Firebase）
  images: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 连结数组
  links: [{
    title: String,
    url: String
  }],

  // 文件数组（存储在Firebase）
  files: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 是否置顶
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },

  // 浏览次数
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
});

// 创建复合索引：置顶优先，然后按发布日期降序
newsSchema.index({ isPinned: -1, publishDate: -1 });

// 实例方法：增加浏览次数
newsSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// 静态方法：获取分页公告列表
newsSchema.statics.getPaginatedNews = async function(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.tag) {
    query.tag = filters.tag;
  }

  const total = await this.countDocuments(query);
  const news = await this.find(query)
    .sort({ isPinned: -1, publishDate: -1 })
    .skip(skip)
    .limit(limit);

  return {
    news,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + news.length < total
  };
};

module.exports = mongoose.model('News', newsSchema);
