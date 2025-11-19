const admin = require('firebase-admin');
const path = require('path');

// 初始化 Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, '..', 'firebase-service-account.json');

let firebaseInitialized = false;
let bucket = null;

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  bucket = admin.storage().bucket();
  firebaseInitialized = true;
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('💡 Please configure Firebase service account to enable file uploads');
}

/**
 * 上传文件到 Firebase Storage
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME 类型
 * @param {string} folder - 存储文件夹（images 或 files）
 * @returns {Promise<Object>} 包含文件URL和元数据
 */
async function uploadFile(fileBuffer, filename, mimeType, folder = 'files') {
  if (!firebaseInitialized) {
    throw new Error('Firebase is not initialized. Please configure Firebase service account.');
  }

  // 生成唯一文件名
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}_${filename}`;
  const filePath = `${folder}/${uniqueFilename}`;

  const file = bucket.file(filePath);

  // 上传文件
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        originalName: filename,
        uploadedAt: new Date().toISOString()
      }
    }
  });

  // 设置文件为公开访问
  await file.makePublic();

  // 获取公开访问URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  return {
    url: publicUrl,
    filename: uniqueFilename,
    originalName: filename,
    path: filePath,
    mimeType
  };
}

/**
 * 删除 Firebase Storage 中的文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>}
 */
async function deleteFile(filePath) {
  if (!firebaseInitialized) {
    return false;
  }

  try {
    const file = bucket.file(filePath);
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * 从URL提取文件路径
 * @param {string} url - Firebase Storage URL
 * @returns {string|null}
 */
function extractFilePathFromUrl(url) {
  if (!url) return null;

  const match = url.match(/googleapis\.com\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

module.exports = {
  admin,
  bucket,
  uploadFile,
  deleteFile,
  extractFilePathFromUrl,
  isFirebaseInitialized: () => firebaseInitialized
};
