const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Storage directory for uploaded product photos
const UPLOAD_DIR = path.resolve(__dirname, '../../client/public/images/products');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Supported MIME types
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * @route   POST /api/upload
 * @desc    Upload product image securely to local image library
 * @access  Private/Admin
 */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { image, dataUrl } = req.body;
    const rawData = image || dataUrl;

    if (!rawData || typeof rawData !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide a base64 DataURL.',
      });
    }

    // Match data URL pattern: data:image/xxx;base64,yyyy...
    const matches = rawData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Expected data:image/(jpeg|png|webp);base64,...',
      });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${mimeType}. Allowed formats: JPEG, PNG, WebP.`,
      });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds 5MB limit. Selected image is ${(buffer.length / (1024 * 1024)).toFixed(2)} MB.`,
      });
    }

    // Generate safe, unique, collision-proof filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const safeFileName = `prod-upload-${uniqueSuffix}${extension}`;
    const targetFilePath = path.join(UPLOAD_DIR, safeFileName);

    // Verify target path remains within UPLOAD_DIR (anti path-traversal safeguard)
    const resolvedPath = path.resolve(targetFilePath);
    if (!resolvedPath.startsWith(UPLOAD_DIR)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination path detected.',
      });
    }

    fs.writeFileSync(resolvedPath, buffer);

    const relativePublicPath = `/images/products/${safeFileName}`;

    return res.status(201).json({
      success: true,
      message: 'Product photograph uploaded and saved successfully.',
      filePath: relativePublicPath,
      fileName: safeFileName,
      sizeBytes: buffer.length,
      mimeType,
    });
  } catch (error) {
    console.error('[Upload Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process image upload. ' + error.message,
    });
  }
});

module.exports = router;
