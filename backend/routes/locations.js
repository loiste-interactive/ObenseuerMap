const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendResponse, sendError } = require('../utils');
const { verifyAuth } = require('../middleware/auth');

/**
 * Get all locations with sublocations
 * GET /getall
 */
router.get('/locations/getall', async (req, res) => {
  try {
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
        icon: `${location.category}.png`,
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
          icon: `${subloc.category}.png`,
          image: subloc.image,
          description: subloc.description
        }));
      }
      
      return formattedLocation;
    }));
    
    sendResponse(res, formattedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    sendError(res, 'Failed to fetch locations');
  }
});

module.exports = router;