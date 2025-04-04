const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendResponse, sendError } = require('../utils');
const { verifyAuth } = require('../middleware/auth');

// Cache for storing locations
let locationsCache = null;
let isCacheLoading = false;

/**
 * Load all locations from the database into the cache
 */
async function loadLocationsCache() {
  if (isCacheLoading) return;
  
  isCacheLoading = true;
  try {
    console.log('Loading locations into cache...');
    
    // Get main locations
    const locations = await db.query(`
      SELECT id, name, category, lat, lng, image, description
      FROM locations
    `);
    
    // Format locations and get sublocations
    const formattedLocations = await Promise.all(locations.map(async (location) => {
      // Format location
      const formattedLocation = {
        id: location.id,
        name: location.name,
        category: location.category,
        latlng: [parseFloat(location.lat), parseFloat(location.lng)],
        image: location.image,
        description: location.description
      };
      
      // Get sublocations
      const sublocations = await db.query(`
        SELECT name, category, image, description
        FROM sublocations
        WHERE location_id = ?
      `, [location.id]);
      
      // If sublocations exist, add them to the location
      if (sublocations.length > 0) {
        formattedLocation.sublocs = sublocations.map(subloc => ({
          name: subloc.name,
          category: subloc.category,
          image: subloc.image,
          description: subloc.description
        }));
      }
      
      return formattedLocation;
    }));
    
    locationsCache = formattedLocations;
    console.log(`Loaded ${locationsCache.length} locations into cache`);
  } catch (error) {
    console.error('Error loading locations cache:', error);
    // If there was an error, set cache to empty array to avoid null checks
    locationsCache = [];
  } finally {
    isCacheLoading = false;
  }
}

// The cache will be loaded by index.js on server startup

/**
 * Get all locations with sublocations
 * GET /getall
 */
router.get('/locations/getall', async (req, res) => {
  try {
    // If cache is not loaded yet, try to load it
    if (locationsCache === null) {
      await loadLocationsCache();
    }
    
    // Return cached locations
    sendResponse(res, locationsCache || []);
  } catch (error) {
    console.error('Error fetching locations:', error);
    sendError(res, 'Failed to fetch locations');
  }
});

/**
 * Save a single location (create or update)
 * POST /save
 * Requires authentication
 */
router.post('/locations/save', verifyAuth, async (req, res) => {
  try {
    const location = req.body;
    
    // Validate required fields - image is only required if there are no sublocations
    if (!location.id || !location.name || !location.category || !location.latlng) {
      return sendError(res, `Missing required fields for location ${location.id || 'unknown'}`, 400);
    }
    
    // If there are no sublocations, image is required
    if ((!location.sublocs || location.sublocs.length === 0) && !location.image) {
      return sendError(res, `Image is required for locations without sublocations`, 400);
    }
    
    // Validate latlng is an array with 2 elements
    if (!Array.isArray(location.latlng) || location.latlng.length !== 2) {
      return sendError(res, 'Invalid latlng format', 400);
    }

    const [lat, lng] = location.latlng;
    
    // Check if location exists
    const existingLocation = await db.query(
      'SELECT id FROM locations WHERE id = ?',
      [location.id]
    );
    
    // Prepare location data for database
    const locationData = {
      id: location.id,
      name: location.name,
      category: location.category.replace('.png', ''), // Remove .png if present
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      image: location.image || null, // Make image optional
      description: location.description || null
    };
    
    let query;
    let params;
    
    if (existingLocation.length > 0) {
      // Update existing location
      query = `
        UPDATE locations
        SET name = ?, category = ?, lat = ?, lng = ?, image = ?, description = ?
        WHERE id = ?
      `;
      params = [
        locationData.name,
        locationData.category,
        locationData.lat,
        locationData.lng,
        locationData.image,
        locationData.description,
        locationData.id
      ];
    } else {
      // Insert new location
      query = `
        INSERT INTO locations (id, name, category, lat, lng, image, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        locationData.id,
        locationData.name,
        locationData.category,
        locationData.lat,
        locationData.lng,
        locationData.image,
        locationData.description
      ];
    }
    
    // Execute the query
    await db.query(query, params);
    
    // Handle sublocations if they exist
    if (location.sublocs && Array.isArray(location.sublocs)) {
      // First delete existing sublocations for this location
      await db.query('DELETE FROM sublocations WHERE location_id = ?', [location.id]);
      
      // Then insert new sublocations
      for (const subloc of location.sublocs) {
        if (!subloc.name || (!subloc.category && !subloc.icon) || !subloc.image) {
          continue; // Skip invalid sublocations
        }
        
        await db.query(`
          INSERT INTO sublocations (location_id, name, category, image, description)
          VALUES (?, ?, ?, ?, ?)
        `, [
          location.id,
          subloc.name,
          subloc.category || subloc.icon.replace('.png', ''), // Use category or clean icon if present
          subloc.image,
          subloc.description || null
        ]);
      }
    }
    
    // Reload the locations cache after saving
    loadLocationsCache().catch(err => {
      console.error('Failed to reload locations cache after save:', err);
    });
    
    sendResponse(res, { success: true, id: location.id });
  } catch (error) {
    console.error('Error saving location:', error);
    sendError(res, 'Failed to save location');
  }
});


/**
 * Delete a location by ID
 * DELETE /delete/:id
 * Requires authentication
 */
router.delete('/locations/delete/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return sendError(res, 'Location ID is required', 400);
    }
    
    // Check if location exists
    const existingLocation = await db.query(
      'SELECT id FROM locations WHERE id = ?',
      [id]
    );
    
    if (existingLocation.length === 0) {
      return sendError(res, `Location with ID ${id} not found`, 404);
    }
    
    // First delete sublocations
    await db.query('DELETE FROM sublocations WHERE location_id = ?', [id]);
    
    // Then delete the location
    await db.query('DELETE FROM locations WHERE id = ?', [id]);
    
    // Reload the locations cache after deletion
    loadLocationsCache().catch(err => {
      console.error('Failed to reload locations cache after deletion:', err);
    });
    
    sendResponse(res, { success: true, id });
  } catch (error) {
    console.error('Error deleting location:', error);
    sendError(res, 'Failed to delete location');
  }
});

module.exports = router;
module.exports.loadLocationsCache = loadLocationsCache;