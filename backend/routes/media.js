const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { sendResponse, sendError } = require('../utils');
const { verifyAuth } = require('../middleware/auth');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../dist/res/images/locations'));
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname);
  }
});

// File filter to only accept jpeg/jpg files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG/JPG images are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Get all categories (icon names) from icons directory
 * GET /locations/getcategories
 * Requires authentication
 */
router.get('/locations/getcategories', verifyAuth, (req, res) => {
  try {
    console.log("!!!");
    console.log(__dirname);
    const iconsDir = path.join(__dirname, '../../dist/res/images/icons');
    
    // Read all files in the directory
    const files = fs.readdirSync(iconsDir);
    
    // Filter files that start with LM_ and have .png extension
    // Return without the extension
    const categories = files
      .filter(file => file.startsWith('LM_') && file.endsWith('.png'))
      .map(file => file.replace('.png', ''));
    
    sendResponse(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 'Failed to get categories');
  }
});

/**
 * Get all image names from locations directory
 * GET /locations/getimages
 * Requires authentication
 */
router.get('/locations/getimages', verifyAuth, (req, res) => {
  try {
    const locationsDir = path.join(__dirname, '../../dist/res/images/locations');
    
    // Read all files in the directory
    const files = fs.readdirSync(locationsDir);
    
    // Return all filenames with extension
    sendResponse(res, files);
  } catch (error) {
    console.error('Error getting images:', error);
    sendError(res, 'Failed to get images');
  }
});

/**
 * Upload an image to locations directory
 * POST /locations/addimage
 * Requires authentication
 */
router.post('/locations/addimage', verifyAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    // Check image dimensions using sharp
    const sharp = require('sharp');
    const imagePath = req.file.path;
    
    sharp(imagePath)
      .metadata()
      .then(metadata => {
        // Check if image is 400x400
        if (metadata.width !== 400 || metadata.height !== 400) {
          // Remove the uploaded file if dimensions are wrong
          fs.unlinkSync(imagePath);
          return sendError(res, 'Image must be exactly 400x400 pixels', 400);
        }
        
        // If everything is fine, return success with the filename
        sendResponse(res, { 
          success: true, 
          filename: req.file.filename 
        });
      })
      .catch(err => {
        // Remove the uploaded file if there was an error
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        console.error('Error validating image:', err);
        sendError(res, 'Failed to validate image', 500);
      });
  } catch (error) {
    console.error('Error uploading image:', error);
    // Remove the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    sendError(res, 'Failed to upload image');
  }
});

module.exports = router;