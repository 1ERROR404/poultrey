CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255),
  `nameAr` VARCHAR(255),
  `slug` VARCHAR(255),
  `description` VARCHAR(255),
  `descriptionAr` VARCHAR(255),
  `imageUrl` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `session` (
  `sid` VARCHAR(255),
  `sess` TEXT,
  `expire` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `productId` INT,
  `url` VARCHAR(255),
  `isPrimary` BOOLEAN,
  `displayOrder` INT,
  `alt` VARCHAR(255),
  `createdAt` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255),
  `nameAr` VARCHAR(255),
  `slug` VARCHAR(255),
  `description` TEXT,
  `descriptionAr` VARCHAR(255),
  `price` VARCHAR(255),
  `categoryId` INT,
  `imageUrl` VARCHAR(255),
  `featured` BOOLEAN,
  `inStock` BOOLEAN,
  `badge` VARCHAR(255),
  `badgeAr` VARCHAR(255),
  `originalPrice` VARCHAR(255),
  `additionalImages` TEXT,
  `videoUrl` TEXT,
  `specificationImages` TEXT,
  `descriptionImages` TEXT,
  `sku` VARCHAR(255),
  `weight` VARCHAR(255),
  `dimensions` VARCHAR(255),
  `warrantyinfo` TEXT,
  `features` TEXT,
  `specs` TEXT,
  `tags` TEXT,
  `quantity` INT,
  `metatitle` TEXT,
  `metadescription` TEXT,
  `additionalimages` TEXT,
  `videourl` TEXT,
  `specificationimages` TEXT,
  `descriptionimages` TEXT,
  `keyfeatures` VARCHAR(255),
  `keybenefits` VARCHAR(255),
  `usecasecommercial` VARCHAR(255),
  `usecasebackyard` VARCHAR(255),
  `maintenancetips` VARCHAR(255),
  `keyfeaturesar` VARCHAR(255),
  `keybenefitsar` VARCHAR(255),
  `usecasecommercialar` VARCHAR(255),
  `usecasebackyardar` VARCHAR(255),
  `maintenancetipsar` VARCHAR(255),
  `keyfeaturestitle` VARCHAR(255),
  `usecasecommercialtitle` VARCHAR(255),
  `usecasebackyardtitle` VARCHAR(255),
  `maintenancetipstitle` VARCHAR(255),
  `keyfeaturestitlear` VARCHAR(255),
  `keybenefitstitlear` VARCHAR(255),
  `maintenancetipstitlear` VARCHAR(255),
  `keybenefitstitle` VARCHAR(255),
  `usecasecommercialtitlear` VARCHAR(255),
  `usecasebackyardtitlear` VARCHAR(255),
  `usecasestitle` VARCHAR(255),
  `usecasestitlear` VARCHAR(255),
  `published` BOOLEAN,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_levels` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `productId` INT,
  `quantity` INT,
  `minStockLevel` INT,
  `maxStockLevel` INT,
  `lastUpdated` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `productId` INT,
  `quantity` INT,
  `type` VARCHAR(255),
  `reason` VARCHAR(255),
  `createdAt` VARCHAR(255),
  `createdBy` INT,
  `referenceId` INT,
  `notes` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `username` VARCHAR(255),
  `password` VARCHAR(255),
  `role` VARCHAR(255),
  `email` TEXT,
  `defaultShippingAddressId` INT,
  `default_shipping_address_id` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT,
  `order_number` VARCHAR(255),
  `status` VARCHAR(255),
  `total_amount` VARCHAR(255),
  `currency` VARCHAR(255),
  `payment_status` VARCHAR(255),
  `shipping_method` VARCHAR(255),
  `shipping_cost` VARCHAR(255),
  `shipping_address_id` TEXT,
  `billing_address_id` TEXT,
  `payment_method_id` TEXT,
  `notes` TEXT,
  `created_at` VARCHAR(255),
  `updated_at` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` INT,
  `product_id` INT,
  `quantity` INT,
  `unit_price` VARCHAR(255),
  `subtotal` VARCHAR(255),
  `created_at` VARCHAR(255),
  `updated_at` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `userId` INT,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `addressLine1` VARCHAR(255),
  `addressLine2` TEXT,
  `city` VARCHAR(255),
  `state` TEXT,
  `postalCode` VARCHAR(255),
  `country` VARCHAR(255),
  `phone` VARCHAR(255),
  `isDefault` BOOLEAN,
  `label` TEXT,
  `createdAt` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `title` VARCHAR(255),
  `slug` VARCHAR(255),
  `content` TEXT,
  `description` VARCHAR(255),
  `is_published` BOOLEAN,
  `meta_title` VARCHAR(255),
  `meta_description` VARCHAR(255),
  `created_by` INT,
  `updated_by` INT,
  `created_at` VARCHAR(255),
  `updated_at` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

