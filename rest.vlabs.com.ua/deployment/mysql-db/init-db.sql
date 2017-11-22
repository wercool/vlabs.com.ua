DROP DATABASE IF EXISTS vlabs;
CREATE DATABASE vlabs CHARACTER SET utf8;
DROP USER IF EXISTS 'vlabs'@'localhost';
CREATE USER 'vlabs'@'localhost' IDENTIFIED BY 'vlabs';
GRANT ALL PRIVILEGES ON vlabs.* TO 'vlabs'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

USE vlabs;

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `last_password_reset_date` datetime DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `authority` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_authority` (
  `user_id` bigint(20) NOT NULL,
  `authority_id` bigint(20) NOT NULL,
  KEY `authority_id_fk` (`authority_id`),
  KEY `user_id_fk` (`user_id`),
  CONSTRAINT `authority_id_fk` FOREIGN KEY (`authority_id`) REFERENCES `authority` (`id`),
  CONSTRAINT `user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `vlabs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
