USE vlabs;
SET FOREIGN_KEY_CHECKS=0;


-- Users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `last_password_reset_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `authority`;
CREATE TABLE `authority` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_authority`;
CREATE TABLE `user_authority` (
  `user_id` bigint(20) NOT NULL,
  `authority_id` bigint(20) NOT NULL,
  KEY `authority_id_fk` (`authority_id`),
  KEY `user_id_fk` (`user_id`),
  CONSTRAINT `ua_authority_id_fk` FOREIGN KEY (`authority_id`) REFERENCES `authority` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ua_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_media`;
CREATE TABLE `user_media` (
  `user_id` bigint(20) NOT NULL,
  `photo` longblob DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `um_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- VLabs
DROP TABLE IF EXISTS `vlabs`;
CREATE TABLE `vlabs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `path` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Groups
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `group_user`;
CREATE TABLE `group_user` (
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  KEY `group_id_fk` (`group_id`),
  KEY `user_id_fk` (`user_id`),
  CONSTRAINT `gu_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gu_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Faculties
DROP TABLE IF EXISTS `faculties`;
CREATE TABLE `faculties` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `faculty_group`;
CREATE TABLE `faculty_group` (
  `faculty_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  KEY `faculty_id_fk` (`faculty_id`),
  KEY `group_id_fk` (`group_id`),
  CONSTRAINT `fg_faculty_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fg_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Content Element = CElement
DROP TABLE IF EXISTS `celements`;
CREATE TABLE `celements` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `structure_id` bigint(20) NOT NULL,
  `type` varchar(24) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `sid` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `cel_fk_structure_id` FOREIGN KEY (`structure_id`) REFERENCES `eclass_structure` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `celement_items`;
CREATE TABLE `celement_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `celement_id` bigint(20) NOT NULL,
  `nature` longtext,
  `sid` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `celi_fk_celement_id` FOREIGN KEY (`celement_id`) REFERENCES `celements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- EClasses
DROP TABLE IF EXISTS `eclass_format`;
CREATE TABLE `eclass_format` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `eclass_structure`;
CREATE TABLE `eclass_structure` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `eclass_id` bigint(20) DEFAULT NULL,
  `format_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `eclasses`;
CREATE TABLE `eclasses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `format_id` bigint(20) DEFAULT NULL,
  `summary` longtext,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ec_format_id` (`format_id`),
  CONSTRAINT `ec_fk_format_id` FOREIGN KEY (`format_id`) REFERENCES `eclass_format` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Courses
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `course_eclass`;
CREATE TABLE `course_eclass` (
  `course_id` bigint(20) NOT NULL,
  `eclass_id` bigint(20) NOT NULL,
  KEY `course_id_fk` (`course_id`),
  KEY `eclass_id_fk` (`eclass_id`),
  CONSTRAINT `ce_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ce_eclass_id_fk` FOREIGN KEY (`eclass_id`) REFERENCES `eclasses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Modules
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Partners
DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Collaborators
DROP TABLE IF EXISTS `collaborators`;
CREATE TABLE `collaborators` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `collaborator_project`;
CREATE TABLE `collaborator_project` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



SET FOREIGN_KEY_CHECKS=1;
