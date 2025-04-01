const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { sendResponse, sendError } = require('../utils');
const { verifyAuth } = require('../middleware/auth');
const db = require('../database');

// Set up multer storage for location image uploads
const locationImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/images/locations');
  },
  filename: function (req, file, cb) {
    // Keep the original filename for location images
    cb(null, file.originalname);
  }
});

// File filter to only accept jpeg/jpg files for location images
const locationImageFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG/JPG images are allowed'), false);
  }
};

const uploadLocationImage = multer({
  storage: locationImageStorage,
  fileFilter: locationImageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Set up multer storage for category icon uploads
const categoryIconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/images/icons');
  },
  filename: function (req, file, cb) {
    // Prefix with LM_ and keep the original filename for category icons
    let filename = file.originalname;
    if (!filename.startsWith('LM_')) {
      filename = 'LM_' + filename;
    }
    cb(null, filename);
  }
});

// File filter to only accept PNG files for category icons
const categoryIconFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG images are allowed for category icons'), false);
  }
};

const uploadCategoryIcon = multer({
  storage: categoryIconStorage,
  fileFilter: categoryIconFileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB limit
  }
});

/**
 * Get all categories (icon names) from icons directory
 * GET /locations/getcategories
 * Requires authentication
 */
router.get('/locations/getcategories', verifyAuth, (req, res) => {
  try {
    const iconsDir = '/images/icons';
    
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
    const locationsDir = '/images/locations';
    
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
router.post('/locations/addimage', verifyAuth, uploadLocationImage.single('image'), (req, res) => {
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

/**
 * Add a new category icon
 * POST /locations/addcategory
 * Requires authentication
 */
router.post('/locations/addcategory', verifyAuth, uploadCategoryIcon.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No icon file provided', 400);
    }

    // Check icon dimensions using sharp
    const iconPath = req.file.path;
    
    sharp(iconPath)
      .metadata()
      .then(metadata => {
        // Check if icon is 200x200
        if (metadata.width !== 200 || metadata.height !== 200) {
          // Remove the uploaded file if dimensions are wrong
          fs.unlinkSync(iconPath);
          return sendError(res, 'Icon must be exactly 200x200 pixels', 400);
        }
        
        // If everything is fine, return success with the filename
        sendResponse(res, {
          success: true,
          filename: req.file.filename
        });
      })
      .catch(err => {
        // Remove the uploaded file if there was an error
        if (fs.existsSync(iconPath)) {
          fs.unlinkSync(iconPath);
        }
        console.error('Error validating icon:', err);
        sendError(res, 'Failed to validate icon', 500);
      });
  } catch (error) {
    console.error('Error uploading icon:', error);
    // Remove the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    sendError(res, 'Failed to upload icon');
  }
});

/**
 * Check if a category is in use (internal function)
 */
async function isCategoryInUse(category) {
  try {
    // Clean the category name (remove .png if present)
    const cleanCategory = category.replace('.png', '');
    
    // Check if category is used in locations
    const locationsUsingCategory = await db.query(`
      SELECT id FROM locations WHERE category = ?
    `, [cleanCategory]);
    
    // Check if category is used in sublocations
    const sublocationsUsingCategory = await db.query(`
      SELECT location_id FROM sublocations WHERE category = ?
    `, [cleanCategory]);
    
    return {
      isInUse: locationsUsingCategory.length > 0 || sublocationsUsingCategory.length > 0,
      locationsCount: locationsUsingCategory.length,
      sublocationsCount: sublocationsUsingCategory.length
    };
  } catch (error) {
    console.error('Error checking if category is in use:', error);
    throw error;
  }
}

/**
 * Delete a category icon
 * DELETE /locations/deletecategory/:category
 * Requires authentication
 */
router.delete('/locations/deletecategory/:category', verifyAuth, async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return sendError(res, 'Category name is required', 400);
    }
    
    // Check if category is in use
    const usageInfo = await isCategoryInUse(category);
    
    if (usageInfo.isInUse) {
      return sendError(res, `Category is in use by ${usageInfo.locationsCount} locations and ${usageInfo.sublocationsCount} sublocations and cannot be deleted`, 400);
    }
    
    // Clean the category name (add .png if not present)
    let categoryFilename = category;
    if (!categoryFilename.endsWith('.png')) {
      categoryFilename += '.png';
    }
    
    // Check if file exists
    const iconPath = path.join('/images/icons', categoryFilename);
    if (!fs.existsSync(iconPath)) {
      return sendError(res, `Category icon file not found: ${categoryFilename}`, 404);
    }
    
    // Delete the file
    fs.unlinkSync(iconPath);
    
    // Return the response immediately
    return sendResponse(res, { success: true, category });
  } catch (error) {
    console.error('Error deleting category:', error);
    return sendError(res, 'Failed to delete category');
  }
});

/**
 * Check if an image is in use (internal function)
 */
async function isImageInUse(image) {
  try {
    // Check if image is used in locations
    const locationsUsingImage = await db.query(`
      SELECT id FROM locations WHERE image = ?
    `, [image]);
    
    // Check if image is used in sublocations
    const sublocationsUsingImage = await db.query(`
      SELECT location_id FROM sublocations WHERE image = ?
    `, [image]);
    
    return {
      isInUse: locationsUsingImage.length > 0 || sublocationsUsingImage.length > 0,
      locationsCount: locationsUsingImage.length,
      sublocationsCount: sublocationsUsingImage.length
    };
  } catch (error) {
    console.error('Error checking if image is in use:', error);
    throw error;
  }
}

/**
 * Delete an image
 * DELETE /locations/deleteimage/:image
 * Requires authentication
 */
router.delete('/locations/deleteimage/:image', verifyAuth, async (req, res) => {
  try {
    const { image } = req.params;
    
    if (!image) {
      return sendError(res, 'Image name is required', 400);
    }
    
    // Check if image is in use
    const usageInfo = await isImageInUse(image);
    
    if (usageInfo.isInUse) {
      return sendError(res, `Image is in use by ${usageInfo.locationsCount} locations and ${usageInfo.sublocationsCount} sublocations and cannot be deleted`, 400);
    }
    
    // Check if file exists
    const imagePath = path.join('/images/locations', image);
    if (!fs.existsSync(imagePath)) {
      return sendError(res, `Image file not found: ${image}`, 404);
    }
    
    // Delete the file
    fs.unlinkSync(imagePath);
    
    // Return the response immediately
    return sendResponse(res, { success: true, image });
  } catch (error) {
    console.error('Error deleting image:', error);
    return sendError(res, 'Failed to delete image');
  }
});

/**
 * Serve the media editor page
 * GET /locations/media
 */
router.get('/locations/media', (req, res) => {
  const templatePath = path.join(__dirname, '../templates/media-editor.html');
  
  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    res.send(template);
  } catch (error) {
    console.error('Error reading media editor template:', error);
    sendError(res, 'Failed to load media editor page');
  }
});

module.exports = router;