USE vlabs;



-- Users
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
  CONSTRAINT `ua_authority_id_fk` FOREIGN KEY (`authority_id`) REFERENCES `authority` (`id`),
  CONSTRAINT `ua_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_media` (
  `user_id` bigint(20) NOT NULL,
  `photo` longblob DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `um_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- VLabs
CREATE TABLE `vlabs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `path` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Groups
CREATE TABLE `groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `group_user` (
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  KEY `group_id_fk` (`group_id`),
  KEY `user_id_fk` (`user_id`),
  CONSTRAINT `gu_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `gu_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Faculties
CREATE TABLE `faculties` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `faculty_group` (
  `faculty_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  KEY `faculty_id_fk` (`faculty_id`),
  KEY `group_id_fk` (`group_id`),
  CONSTRAINT `fg_faculty_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`),
  CONSTRAINT `fg_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Departments
CREATE TABLE `departments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Content Element = CElement
CREATE TABLE `celements` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `structure_id` bigint(20) NOT NULL,
  `type` varchar(24) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `sid` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `cel_fk_structure_id` FOREIGN KEY (`structure_id`) REFERENCES `eclass_structure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `celement_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `celement_id` bigint(20) NOT NULL,
  `nature` longtext,
  `sid` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `celi_fk_celement_id` FOREIGN KEY (`celement_id`) REFERENCES `celements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- EClasses
CREATE TABLE `eclass_format` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `eclass_structure` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `eclass_id` bigint(20) DEFAULT NULL,
  `format_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `eclasses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `format_id` bigint(20) DEFAULT NULL,
  `summary` longtext,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ec_format_id` (`format_id`),
  CONSTRAINT `ec_fk_format_id` FOREIGN KEY (`format_id`) REFERENCES `eclass_format` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Courses
CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `course_eclass` (
  `course_id` bigint(20) NOT NULL,
  `eclass_id` bigint(20) NOT NULL,
  KEY `course_id_fk` (`course_id`),
  KEY `eclass_id_fk` (`eclass_id`),
  CONSTRAINT `ce_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `ce_eclass_id_fk` FOREIGN KEY (`eclass_id`) REFERENCES `eclasses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Modules
CREATE TABLE `modules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Partners
CREATE TABLE `partners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
