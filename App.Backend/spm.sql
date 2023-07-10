CREATE TABLE
  `Users` (
    `employee_id` int unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(25) NOT NULL,
    `email` varchar(35) DEFAULT NULL,
    `designation` varchar(25) DEFAULT NULL,
    `is_admin` tinyint(1) NOT NULL DEFAULT '0',
    `role` varchar(25) DEFAULT NULL,
    `employee_since` date DEFAULT NULL,
    `login_pass` varchar(25) DEFAULT NULL,
    `manager` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`employee_id`)
  );
  
CREATE TABLE
  `projects` (
    `project_id` int unsigned NOT NULL AUTO_INCREMENT,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` int unsigned NOT NULL,
    `last_updated_by` varchar(255) DEFAULT NULL,
    `last_updated_at` timestamp NULL DEFAULT NULL,
    `project_name` varchar(255) NOT NULL,
    `project_description` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`project_id`)
  );
  
CREATE TABLE
  `project_master_list` (
    `project_comp_id` int unsigned NOT NULL AUTO_INCREMENT,
    `project_id` varchar(55) NOT NULL,
    `product_id` varchar(55) NOT NULL,
    `product_type` varchar(55) NOT NULL,
    `required_quantity` int NOT NULL,
    `required_by_date` date NOT NULL,
    `last_updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `used_quantity` int NOT NULL DEFAULT '0',
    PRIMARY KEY (`project_comp_id`)
  ) ;
  
CREATE TABLE
  `purchase_orders` (
    `order_id` int unsigned NOT NULL AUTO_INCREMENT,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `order_description` varchar(255) DEFAULT NULL,
    `created_by` int unsigned NOT NULL,
    `last_updated_by` varchar(255) DEFAULT NULL,
    `last_updated_at` timestamp NULL DEFAULT NULL,
    `po_number` varchar(255) NOT NULL,
    PRIMARY KEY (`order_id`)
  ) ;

CREATE TABLE
  `purchase_order_details` (
    `order_comp_id` int unsigned NOT NULL AUTO_INCREMENT,
    `last_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `project_comp_id` varchar(255) NOT NULL,
    `ordered_quantity` int NOT NULL,
    `order_remark` varchar(255) DEFAULT NULL,
    `expected_delivery` date NOT NULL,
    `order_id` int unsigned NOT NULL,
    PRIMARY KEY (`order_comp_id`)
  ) ;
  
CREATE TABLE
  `order_recieved` (
    `order_rec_id` int unsigned NOT NULL AUTO_INCREMENT,
    `last_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `order_comp_id` varchar(255) NOT NULL,
    `challan_id` varchar(255) NOT NULL,
    `recieved_quantity` int NOT NULL,
    `status` varchar(255) NOT NULL,
    `recieved_remark` varchar(255) DEFAULT NULL,
    `recieved_at` date NOT NULL,
    PRIMARY KEY (`order_rec_id`)
  );