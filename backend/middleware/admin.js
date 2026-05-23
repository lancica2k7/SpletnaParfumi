const { authenticateToken } = require('./auth');

// Check if user is admin or moderator
const requireAdmin = async (req, res, next) => {
  // First authenticate the token
  await authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  });
};

// Check if user is admin only (not moderator)
const requireAdminOnly = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin-only access required'
      });
    }

    next();
  });
};

module.exports = { requireAdmin, requireAdminOnly };

