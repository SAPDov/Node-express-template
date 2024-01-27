-- CreateTable
CREATE TABLE `save_later_cart` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `checkout_token` VARCHAR(191) NOT NULL,
    `product_ids` JSON NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
)
