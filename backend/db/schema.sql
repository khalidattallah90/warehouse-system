-- ============================================
-- نظام إدارة المخازن - قاعدة البيانات MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE warehouse_db;

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  role ENUM('admin', 'warehouse_keeper', 'accountant', 'customer') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول الأصناف (السيراميك)
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_code VARCHAR(50) NOT NULL UNIQUE,
  item_name VARCHAR(200) NOT NULL,
  ceramic_name VARCHAR(200),
  category ENUM('بورسلين', 'رخام', 'حوائط', 'أرضيات', 'أخرى') DEFAULT 'أخرى',
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  min_quantity INT DEFAULT 5,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- جدول الموردين
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_code VARCHAR(20) NOT NULL UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  supply_type VARCHAR(100),
  contact_person VARCHAR(150),
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  total_purchases DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT,
  customer_name VARCHAR(200),
  customer_phone VARCHAR(20),
  customer_address TEXT,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('نقدي', 'تحويل', 'بطاقة') DEFAULT 'نقدي',
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- جدول تفاصيل الطلبات
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(200),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
);

-- جدول التقييمات
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  customer_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- إدخال مستخدم أدمن افتراضي (كلمة المرور: admin123)
INSERT IGNORE INTO users (username, password, full_name, email, role) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام', 'admin@warehouse.com', 'admin');

-- إدخال بيانات تجريبية للموردين
INSERT IGNORE INTO suppliers (supplier_code, company_name, supply_type, contact_person, phone) VALUES
('S001', 'رأس الخيمة للسيراميك', 'سيراميك', 'محمود', '0999999999'),
('S002', 'بورسلين ملكي', 'مواد بناء', 'محمود', '0111111111');

-- إدخال بيانات تجريبية للأصناف
INSERT IGNORE INTO items (item_code, item_name, ceramic_name, category, quantity, price) VALUES
('ITM001', 'بورسلين 60×60 أبيض', 'بورسلين ملكي', 'بورسلين', 54, 60000),
('ITM002', 'رخام طبيعي إيطالي', 'رخام فاخر', 'رخام', 30, 150000),
('ITM003', 'سيراميك حوائط أزرق', 'حوائط كلاسيك', 'حوائط', 120, 25000);
