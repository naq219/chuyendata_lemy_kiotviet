-- --------------------------------------------------------
-- Host:                         dbnode1.lemyde.com
-- Server version:               10.5.12-MariaDB-log - Source distribution
-- Server OS:                    Linux
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for crm
CREATE DATABASE IF NOT EXISTS `crm` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `crm`;

-- Dumping structure for table crm.chitiet_nhap
CREATE TABLE IF NOT EXISTS `chitiet_nhap` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nhap_id` int(11) NOT NULL COMMENT 'id nhập',
  `product_id` int(11) NOT NULL,
  `sl` int(11) NOT NULL,
  `list_gianhap` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51546 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.chitiet_xuat
CREATE TABLE IF NOT EXISTS `chitiet_xuat` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `xuat_id` int(11) NOT NULL COMMENT 'id xuất',
  `product_id` int(11) NOT NULL,
  `sl` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=112205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_buy` timestamp NULL DEFAULT NULL,
  `total_amount` int(11) DEFAULT NULL,
  `paid_amount` int(11) DEFAULT NULL,
  `debt` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `note_xuatkho` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `nick_facebook` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_group` tinyint(1) DEFAULT 2 COMMENT '1 là buôn, 2 là lẻ\\r\\n',
  `province_id` int(11) DEFAULT NULL COMMENT 'tỉnh',
  `district_id` int(11) DEFAULT NULL COMMENT 'huyện',
  `default_note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ghi chú',
  `facebook_id` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Ten_fb` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` int(10) unsigned DEFAULT NULL COMMENT 'id shop quản lý',
  `is_vip` tinyint(1) DEFAULT 0,
  `pttt` tinyint(4) DEFAULT 0 COMMENT '=0 cod =1 ck',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `customers_id_unique` (`id`) USING BTREE,
  UNIQUE KEY `phone_unique` (`phone`),
  FULLTEXT KEY `fulltext_name_phone_fb` (`name`,`phone`,`Ten_fb`),
  FULLTEXT KEY `fulltext_phone` (`phone`),
  FULLTEXT KEY `fulltext_fb` (`Ten_fb`)
) ENGINE=InnoDB AUTO_INCREMENT=16353 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.detail_orders
CREATE TABLE IF NOT EXISTS `detail_orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL COMMENT 'id sản phẩm',
  `quantity` int(11) NOT NULL COMMENT 'số lượng',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `gia_buon` int(11) NOT NULL DEFAULT 0,
  `gia_ban` int(11) NOT NULL DEFAULT 0,
  `notify` tinyint(4) NOT NULL DEFAULT -1,
  `gia_nhap` int(11) DEFAULT NULL,
  `created_atm` int(11) DEFAULT NULL,
  `cothexuat` int(11) DEFAULT 0,
  `doval` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`doval`)),
  `do_status` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `detail_orders_product_id_foreign` (`product_id`),
  KEY `detail_orders_order_id_foreign` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=163396 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.districts
CREATE TABLE IF NOT EXISTS `districts` (
  `id` smallint(6) NOT NULL,
  `name` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `name_other` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL,
  `province_id` tinyint(4) NOT NULL,
  `GHNSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `TTCSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `VNPTSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ViettelPostSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ShipChungSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `GHNDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ViettelPostDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ShipChungDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `DisplayOrder` smallint(6) NOT NULL,
  `viettel_code` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.districts_old
CREATE TABLE IF NOT EXISTS `districts_old` (
  `id` smallint(6) NOT NULL,
  `name` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `province_id` tinyint(4) NOT NULL,
  `GHNSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `TTCSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `VNPTSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ViettelPostSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ShipChungSupport` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `GHNDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ViettelPostDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ShipChungDistrictCode` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `DisplayOrder` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.dvvc
CREATE TABLE IF NOT EXISTS `dvvc` (
  `id` char(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` char(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.hang_hoan
CREATE TABLE IF NOT EXISTS `hang_hoan` (
  `order_id` char(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tracking_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `da_tra_hang` int(11) DEFAULT 0,
  `time` int(11) DEFAULT NULL,
  `shop_checked` int(11) DEFAULT 0,
  `time_hoan` int(11) DEFAULT 0,
  `last_time_check` int(11) DEFAULT 0,
  `time_dangxuly` int(11) DEFAULT 0,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.kho
CREATE TABLE IF NOT EXISTS `kho` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.khoang_chua
CREATE TABLE IF NOT EXISTS `khoang_chua` (
  `id` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'mã khoang',
  `kho_id` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.khoang_products
CREATE TABLE IF NOT EXISTS `khoang_products` (
  `khoang_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int(11) NOT NULL,
  `sl` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`khoang_id`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.log_kho
CREATE TABLE IF NOT EXISTS `log_kho` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `khoang_id` varchar(110) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `sl_cu` int(11) DEFAULT NULL,
  `sl_moi` int(11) DEFAULT NULL,
  `created_at` int(11) DEFAULT NULL,
  `checked` int(11) DEFAULT 0 COMMENT 'checked=1 đã gửi thông báo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=146337 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table crm.log_order
CREATE TABLE IF NOT EXISTS `log_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `field` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `value_old` text COLLATE utf8_unicode_ci NOT NULL,
  `value_new` text COLLATE utf8_unicode_ci NOT NULL,
  `on_time` int(11) DEFAULT NULL,
  `checked` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=289397 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.nhap
CREATE TABLE IF NOT EXISTS `nhap` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kho_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_nhap` date DEFAULT NULL COMMENT 'ngày nhập',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `type` int(11) NOT NULL COMMENT '1 là nhập hàng, 2 là đổi sp, 3 là trả hàng, 4 soát kho',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10626 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.nick_managers
CREATE TABLE IF NOT EXISTS `nick_managers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facebook` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL COMMENT 'id người quản lý',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_created` date NOT NULL DEFAULT current_timestamp(),
  `status` int(11) NOT NULL COMMENT '1=order,2=guiship,3=danhan,4=huy,5=layhang',
  `shop_id` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'id shop',
  `customer_id` int(11) NOT NULL COMMENT 'id khách hàng',
  `user_id` int(11) DEFAULT NULL COMMENT 'id người tạo',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_shipper_lb_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'mã vận đơn',
  `total_amount` int(11) NOT NULL COMMENT 'tổng tiền',
  `money_received` int(11) DEFAULT 0 COMMENT 'tiền đã nhận',
  `lastcheck_vc` int(11) DEFAULT 0,
  `time_laststatus` int(11) DEFAULT NULL,
  `time_nhanhang` date DEFAULT NULL,
  `dvvc` char(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cod` int(11) DEFAULT 0 COMMENT 'tien thu cod= tong tien- danhan',
  `dathanhtoan` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phi_ship` int(11) DEFAULT 0,
  `payment` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1' COMMENT '1=tienmat 2=ck',
  `free_ship` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0 là thu tiền ship, 1 là freeship nha',
  `phi_khac` int(11) DEFAULT 0,
  `uu_tien` tinyint(1) DEFAULT 0,
  `additional_cost` int(11) NOT NULL DEFAULT 0 COMMENT 'thu thêm',
  `group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `count_print` tinyint(1) DEFAULT 0,
  `note_check` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keep_stock` tinyint(1) NOT NULL DEFAULT 0,
  `oval` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`oval`)),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `orders_id_unique` (`id`) USING BTREE,
  KEY `orders_customer_id_foreign` (`customer_id`),
  KEY `orders_dvvc_foreign` (`dvvc`),
  CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `orders_dvvc_foreign` FOREIGN KEY (`dvvc`) REFERENCES `dvvc` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=82413 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.orders_check
CREATE TABLE IF NOT EXISTS `orders_check` (
  `oc_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `solved` int(11) DEFAULT 0,
  `oc_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT 'NULL',
  `oc_trackingid` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'mã vận đơn',
  `oc_lastcheck` int(11) DEFAULT 0,
  `oc_log` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `oc_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`oc_id`),
  UNIQUE KEY `orders_check_order_id_IDX` (`order_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2405 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.orders_ncc
CREATE TABLE IF NOT EXISTS `orders_ncc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `sl_them` int(11) DEFAULT NULL,
  `sl_tong` int(11) NOT NULL,
  `mtime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=802616 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='ds san pham cung so luong order cho ncc';

-- Data exporting was unselected.

-- Dumping structure for table crm.order_status
CREATE TABLE IF NOT EXISTS `order_status` (
  `id` tinyint(4) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table crm.password_resets
CREATE TABLE IF NOT EXISTS `password_resets` (
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_price` int(11) NOT NULL COMMENT 'giá nhập',
  `wholesale_price` int(11) NOT NULL COMMENT 'giá buôn',
  `gia_buonsi` int(11) NOT NULL DEFAULT 0,
  `retail_price` int(11) NOT NULL COMMENT 'giá bán',
  `image` varchar(6000) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `post_at` int(11) DEFAULT 0,
  `introduction` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT ' giới thiệu',
  `page_link` varchar(700) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `sku` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT '''' COMMENT ' Mã sản phẩm',
  `limit` tinyint(4) NOT NULL DEFAULT 0 COMMENT '-1= block, 0=unlimit',
  `weight` int(11) DEFAULT 200 COMMENT 'Don vi gram',
  `status` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chưa rõ',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_update_image` tinyint(1) DEFAULT 0,
  `ean` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ncc_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note_toncc` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_ean` tinyint(4) DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `products_id_unique` (`id`) USING BTREE,
  FULLTEXT KEY `fulltext_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10469 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.products_arrive
CREATE TABLE IF NOT EXISTS `products_arrive` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `sl` int(11) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_arrive_product_id_date_unique` (`product_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.provinces
CREATE TABLE IF NOT EXISTS `provinces` (
  `id` tinyint(4) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `DisplayOrder` tinyint(4) NOT NULL,
  `name_other` varchar(150) DEFAULT NULL,
  `viettel_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table crm.provinces_old
CREATE TABLE IF NOT EXISTS `provinces_old` (
  `id` tinyint(4) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `DisplayOrder` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table crm.reminder
CREATE TABLE IF NOT EXISTS `reminder` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prikey` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `thread_ts` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `from_user` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `to_user` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `time` int(11) NOT NULL,
  `text` varchar(500) COLLATE utf8_unicode_ci DEFAULT '',
  `loop_time` int(11) NOT NULL DEFAULT 21600,
  `updated_at` int(11) DEFAULT 0,
  `channel` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prikey` (`prikey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.setting
CREATE TABLE IF NOT EXISTS `setting` (
  `time_update_cothexuat` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.thongkeod
CREATE TABLE IF NOT EXISTS `thongkeod` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `shop_id` int(11) DEFAULT NULL,
  `total_giaban` int(11) DEFAULT NULL,
  `manv` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `log` varchar(2500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_atm` int(11) DEFAULT NULL,
  `datt` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69537 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table crm.tmp_data
CREATE TABLE IF NOT EXISTS `tmp_data` (
  `oc_id` int(11) NOT NULL DEFAULT 0,
  `order_id` int(11) NOT NULL,
  `solved` int(11) DEFAULT 0,
  `oc_type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NULL',
  `oc_trackingid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'mã vận đơn',
  `oc_lastcheck` int(11) DEFAULT 0,
  `oc_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oc_created_at` timestamp NULL DEFAULT NULL,
  `oc_updated_at` timestamp NULL DEFAULT NULL,
  `oc_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table crm.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `password` varchar(700) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `username` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table crm.xuat
CREATE TABLE IF NOT EXISTS `xuat` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `type` int(11) NOT NULL COMMENT '1 là bán hàng, 2 là đổi sp, 3 là khác',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_xuat` date DEFAULT NULL COMMENT 'ngày xuất',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `kho_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for trigger crm.created_at_logkho
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `created_at_logkho` BEFORE INSERT ON `log_kho` FOR EACH ROW IF ( COALESCE(length(NEW.created_at),0)=0 )
THEN SET NEW.created_at= UNIX_TIMESTAMP();
END IF//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.customers_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `customers_update` BEFORE UPDATE ON `customers` FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.do_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `do_insert` BEFORE INSERT ON `detail_orders` FOR EACH ROW BEGIN
IF ( COALESCE(length(NEW.created_atm),0)=0)
THEN 
SET NEW.created_atm= UNIX_TIMESTAMP();
SET NEW.created_at= NOW();
END IF;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.fill_datetime
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `fill_datetime` BEFORE INSERT ON `khoang_products` FOR EACH ROW IF ( COALESCE(length(NEW.created_at),0)=0 )
THEN 
SET NEW.created_at= NOW();
SET NEW.updated_at = NOW();
END IF//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.hang_hoan_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `hang_hoan_before_insert` BEFORE INSERT ON `hang_hoan` FOR EACH ROW BEGIN
IF ( COALESCE(length(NEW.time),0)=0)
THEN SET NEW.time=UNIX_TIMESTAMP();
END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `insert` BEFORE INSERT ON `reminder` FOR EACH ROW begin
set NEW.updated_at= UNIX_TIMESTAMP();
set NEW.prikey=concat(NEW.thread_ts,'_',NEW.to_user);
if (NEW.loop_time<90)
THEN set NEW.loop_time=10800;
END IF;
end//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.insert_chitietnhap
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `insert_chitietnhap` BEFORE INSERT ON `chitiet_nhap` FOR EACH ROW BEGIN
DECLARE _listgianhap varchar(100);


select group_concat(tk SEPARATOR ' - ')
INTO _listgianhap
 from (
  
  select  concat(SUM(do.quantity),'x', FORMAT(do.gia_nhap/1000,0,"de_DE"),'k') as tk  from detail_orders do inner join orders o on o.id = do.order_id 
  where o.status =1 and
  do.product_id = NEW.product_id
  group by do.gia_nhap
) as dpm ;
SET NEW.list_gianhap= _listgianhap;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.insert_cod
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `insert_cod` BEFORE INSERT ON `orders` FOR EACH ROW BEGIN
SET NEW.cod= NEW.total_amount-NEW.money_received;
IF ( COALESCE(length(NEW.time_laststatus),0)=0 )
THEN 
SET NEW.time_laststatus = UNIX_TIMESTAMP();
END IF;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.insert_log
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `insert_log` BEFORE INSERT ON `khoang_products` FOR EACH ROW begin
SET @check= (select count(*) from khoang_products where product_id=NEW.product_id and khoang_id=NEW.khoang_id);
IF(@check=0)
THEN
insert into log_kho (khoang_id,product_id,sl_cu,sl_moi) values (NEW.khoang_id,NEW.product_id,0,NEW.sl);
END IF;
end//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.insert_product
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `insert_product` BEFORE INSERT ON `products` FOR EACH ROW BEGIN
SET NEW.post_at= UNIX_TIMESTAMP(NOW());
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.orderncc_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `orderncc_insert` BEFORE INSERT ON `orders_ncc` FOR EACH ROW BEGIN
IF ( COALESCE(length(NEW.mtime),0)=0 )
THEN SET NEW.mtime= UNIX_TIMESTAMP();
END IF;

SET NEW.sl_them = NEW.sl_tong- IFNULL((SELECT sl_tong FROM orders_ncc WHERE product_id=NEW.product_id ORDER BY mtime DESC LIMIT 1),0);

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update` BEFORE INSERT ON `reminder` FOR EACH ROW begin
set NEW.updated_at= UNIX_TIMESTAMP();
if (NEW.loop_time<90)
THEN set NEW.loop_time=10800;
end if;
end//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_cod
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `update_cod` BEFORE UPDATE ON `orders`
 FOR EACH ROW SET NEW.cod= NEW.total_amount-NEW.money_received//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_log
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_log` BEFORE UPDATE ON `khoang_products` FOR EACH ROW insert into log_kho (khoang_id,product_id,sl_cu,sl_moi) (select khoang_id,product_id,sl,NEW.sl as sl_moi from khoang_products where khoang_products.khoang_id=NEW.khoang_id and khoang_products.product_id=NEW.product_id )//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_logorder
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_logorder` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN
    IF (NEW.money_received != OLD.money_received) THEN
        INSERT INTO log_order 
            (`order_id` , `field` , `value_old` , `value_new` ) 
        VALUES 
            (NEW.id, "money_received", OLD.money_received, NEW.money_received);
    END IF;
    
    IF (NEW.status != OLD.status) THEN
        INSERT INTO log_order 
            (`order_id` , `field` , `value_old` , `value_new` ) 
        VALUES 
            (NEW.id, "status", CONCAT('',OLD.status),  CONCAT('',NEW.status));
    END IF;
    
     IF (NEW.dathanhtoan != OLD.dathanhtoan) THEN
        INSERT INTO log_order 
            (`order_id` , `field` , `value_old` , `value_new` ) 
        VALUES 
            (NEW.id, "dathanhtoan", OLD.dathanhtoan, NEW.dathanhtoan);
    END IF;

IF ( NEW.time_nhanhang != OLD.time_nhanhang ) THEN
        INSERT INTO log_order 
            (`order_id` , `field` , `value_old` , `value_new` ) 
        VALUES 
            (NEW.id, "time_nhanhang", OLD.time_nhanhang, NEW.time_nhanhang);
    END IF;
    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_phikhac
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_phikhac` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN
DECLARE tp INT;
SELECT customers.province_id INTO tp FROM customers WHERE id = NEW.customer_id;
IF	tp!=100000
THEN SET NEW.phi_khac=10000;
END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_time
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_time` BEFORE INSERT ON `log_order` FOR EACH ROW IF ( COALESCE(length(NEW.on_time),0)=0 )
THEN SET NEW.on_time = UNIX_TIMESTAMP();
END IF//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger crm.update_time_dagui
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_time_dagui` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN IF (NEW.status= 3) AND (NEW.status != OLD.status) THEN SET NEW.time_nhanhang = DATE(NOW()); END IF;
                    
 IF (NEW.status != OLD.status) THEN SET NEW.time_laststatus = UNIX_TIMESTAMP(); END IF;
 
 IF (NEW.status != OLD.status AND NEW.status= 2 AND COALESCE(length(NEW.dvvc),0)=0)
THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bạn chưa chọn đơn vị vận chuyển';
END IF;

IF (NEW.status != OLD.status AND OLD.status= 3 )
THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Đơn đã nhận không được đổi trạng thái, lh Quế';
END IF;

                    END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
