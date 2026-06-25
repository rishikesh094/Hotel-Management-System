const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

// Ensure uploads folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine with secure crypto hashing to prevent file URL prediction
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// File filter validation at API level
function checkFileType(file, cb) {
  // Allowed file types: images and PDFs
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Strict File Validation: Uploads must be images or PDFs only!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @route POST /api/upload
// @desc  Upload a single document (requires auth)
router.post('/', protect, (req, res) => {
  upload.single('document')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    try {
      // Store file metadata in the Documents collection
      const doc = await Document.create({
        name: req.file.originalname,
        path: relativePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: req.user.id,
        onModel: 'User',
        linkedTo: req.user.id
      });

      res.status(201).json({
        success: true,
        data: relativePath,
        documentId: doc._id
      });
    } catch (dbErr) {
      res.status(400).json({ success: false, error: dbErr.message });
    }
  });
});

// @route POST /api/upload/multiple
// @desc  Upload multiple images (requires auth)
router.post('/multiple', protect, (req, res) => {
  upload.array('images', 20)(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    try {
      const urls = [];
      for (const file of req.files) {
        const relativePath = `/uploads/${file.filename}`;
        
        // Log in Documents model
        await Document.create({
          name: file.originalname,
          path: relativePath,
          size: file.size,
          mimetype: file.mimetype,
          uploadedBy: req.user.id,
          onModel: 'User',
          linkedTo: req.user.id
        });

        urls.push(relativePath);
      }

      res.status(201).json({
        success: true,
        data: urls
      });
    } catch (dbErr) {
      res.status(400).json({ success: false, error: dbErr.message });
    }
  });
});

// @route GET /api/upload/secure/:filename
// @desc  Serve files securely via authentication & role protection
router.get('/secure/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  // Basic directory traversal security check
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(403).json({ success: false, error: 'Access Denied: Path Traversal Detected' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  // Check permissions: Admins and Managers can view uploads. Standard users can only view their own uploads.
  // In a strict setting, we'd query the Document model to confirm ownership, which we will do!
  Document.findOne({ path: `/uploads/${filename}` }).then(doc => {
    const isAllowed = 
      req.user.role === 'admin' || 
      req.user.role === 'super_admin' || 
      req.user.role === 'manager' ||
      (doc && doc.uploadedBy.toString() === req.user.id);

    if (!isAllowed) {
      return res.status(403).json({ success: false, error: 'Access Denied: You do not have permissions to view this file.' });
    }

    // Serve the file securely
    res.sendFile(path.resolve(filePath));
  }).catch(() => {
    // If not in Document DB, check if admin/manager
    if (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager') {
      return res.sendFile(path.resolve(filePath));
    }
    res.status(403).json({ success: false, error: 'Access Denied' });
  });
});

module.exports = router;
