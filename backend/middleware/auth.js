const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'لا يوجد token، الرجاء تسجيل الدخول' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token غير صالح أو منتهي الصلاحية' });
    }
    req.user = decoded;
    next();
  });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية للوصول لهذه الصفحة' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
