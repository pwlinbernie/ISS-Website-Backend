const News = require('../models/News');
const { deleteFile, extractFilePathFromUrl } = require('../config/firebase');

// 获取所有公告（支持分页和筛选）
exports.getAllNews = async (req, res) => {
  try {
    const { tag, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (tag) {
      filters.tag = tag;
    }

    const result = await News.getPaginatedNews(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告列表失败',
      error: error.message
    });
  }
};

// 获取单个公告
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    // 增加浏览次数
    await news.incrementViewCount();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告失败',
      error: error.message
    });
  }
};

// 创建公告
exports.createNews = async (req, res) => {
  try {
    const newsData = {
      tag: req.body.tag,
      title: req.body.title,
      publishDate: req.body.publishDate || new Date(),
      content: req.body.content,
      images: req.body.images || [],
      links: req.body.links || [],
      files: req.body.files || [],
      isPinned: req.body.isPinned || false
    };

    const news = await News.create(newsData);

    res.status(201).json({
      success: true,
      message: '公告创建成功',
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '创建公告失败',
      error: error.message
    });
  }
};

// 更新公告
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    // 如果删除了图片或文件，从 Firebase 中删除
    if (req.body.deletedImages) {
      for (const imageUrl of req.body.deletedImages) {
        const filePath = extractFilePathFromUrl(imageUrl);
        if (filePath) {
          await deleteFile(filePath);
        }
      }
    }

    if (req.body.deletedFiles) {
      for (const fileUrl of req.body.deletedFiles) {
        const filePath = extractFilePathFromUrl(fileUrl);
        if (filePath) {
          await deleteFile(filePath);
        }
      }
    }

    // 更新字段
    const allowedUpdates = ['tag', 'title', 'publishDate', 'content', 'images', 'links', 'files', 'isPinned'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        news[field] = req.body[field];
      }
    });

    await news.save();

    res.json({
      success: true,
      message: '公告更新成功',
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新公告失败',
      error: error.message
    });
  }
};

// 删除公告
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    // 删除关联的图片
    for (const image of news.images) {
      const filePath = extractFilePathFromUrl(image.url);
      if (filePath) {
        await deleteFile(filePath);
      }
    }

    // 删除关联的文件
    for (const file of news.files) {
      const filePath = extractFilePathFromUrl(file.url);
      if (filePath) {
        await deleteFile(filePath);
      }
    }

    await news.deleteOne();

    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除公告失败',
      error: error.message
    });
  }
};

// 切换置顶状态
exports.togglePin = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    news.isPinned = !news.isPinned;
    await news.save();

    res.json({
      success: true,
      message: `公告已${news.isPinned ? '置顶' : '取消置顶'}`,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
};
