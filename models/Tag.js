const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  // 標籤名稱
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // 排序順序
  order: {
    type: Number,
    default: 0
  },

  // 是否啟用
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 靜態方法：獲取所有啟用的標籤
tagSchema.statics.getActiveTags = async function() {
  return await this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

module.exports = mongoose.model('Tag', tagSchema);
