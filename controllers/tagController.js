const Tag = require('../models/Tag');

// 獲取所有標籤
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ order: 1, name: 1 });
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('獲取標籤失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取標籤失敗',
      error: error.message
    });
  }
};

// 獲取啟用的標籤
exports.getActiveTags = async (req, res) => {
  try {
    const tags = await Tag.getActiveTags();
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('獲取標籤失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取標籤失敗',
      error: error.message
    });
  }
};

// 創建標籤
exports.createTag = async (req, res) => {
  try {
    const { name, order, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '標籤名稱不能為空'
      });
    }

    // 檢查是否已存在
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: '標籤已存在'
      });
    }

    const tag = new Tag({
      name,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await tag.save();

    res.status(201).json({
      success: true,
      message: '標籤創建成功',
      data: tag
    });
  } catch (error) {
    console.error('創建標籤失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建標籤失敗',
      error: error.message
    });
  }
};

// 更新標籤
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, isActive } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '標籤不存在'
      });
    }

    // 如果修改名稱，檢查是否重複
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ name, _id: { $ne: id } });
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: '標籤名稱已存在'
        });
      }
      tag.name = name;
    }

    if (order !== undefined) tag.order = order;
    if (isActive !== undefined) tag.isActive = isActive;

    await tag.save();

    res.json({
      success: true,
      message: '標籤更新成功',
      data: tag
    });
  } catch (error) {
    console.error('更新標籤失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新標籤失敗',
      error: error.message
    });
  }
};

// 刪除標籤
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '標籤不存在'
      });
    }

    // 檢查是否有新聞使用此標籤
    const News = require('../models/News');
    const newsCount = await News.countDocuments({ tag: tag.name });

    if (newsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `無法刪除：有 ${newsCount} 則新聞使用此標籤`
      });
    }

    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '標籤刪除成功'
    });
  } catch (error) {
    console.error('刪除標籤失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除標籤失敗',
      error: error.message
    });
  }
};
