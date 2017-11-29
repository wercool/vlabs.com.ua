USE vlabs;

-- the password hash is generated by BCrypt Calculator Generator(https://www.dailycred.com/article/bcrypt-calculator)
INSERT INTO users (id, username, password, first_name, last_name, email, phone_number, enabled, last_password_reset_date) VALUES (1, 'admin',   '$2a$04$mrdlLQBTR4Hnrl6J2QuOy.C/kt8GoDHPO79qK604nzw.9lyBE7uzO', 'Alexey',  'Maistrenko', 'maskame@gmail.com', '+380661599596', true, NOW());
INSERT INTO users (id, username, password, first_name, last_name, email, phone_number, enabled, last_password_reset_date) VALUES (2, 'manager', '$2a$04$mrdlLQBTR4Hnrl6J2QuOy.C/kt8GoDHPO79qK604nzw.9lyBE7uzO', 'Initial', 'Manager',    'email@email.no',    '+000000000000', true, NOW());
INSERT INTO users (id, username, password, first_name, last_name, email, phone_number, enabled, last_password_reset_date) VALUES (3, 'user',    '$2a$04$mrdlLQBTR4Hnrl6J2QuOy.C/kt8GoDHPO79qK604nzw.9lyBE7uzO', 'Initial', 'User',       'email@email.no',    '+000000000000', true, NOW());

INSERT INTO authority (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO authority (id, name) VALUES (2, 'ROLE_MANAGER');
INSERT INTO authority (id, name) VALUES (3, 'ROLE_ADMIN');

-- 'initial admin' authorities
INSERT INTO user_authority (user_id, authority_id) VALUES (1, 1);
INSERT INTO user_authority (user_id, authority_id) VALUES (1, 2);
INSERT INTO user_authority (user_id, authority_id) VALUES (1, 3);

-- 'initial manager' authorities
INSERT INTO user_authority (user_id, authority_id) VALUES (2, 1);
INSERT INTO user_authority (user_id, authority_id) VALUES (2, 2);

-- 'initial user' authorities
INSERT INTO user_authority (user_id, authority_id) VALUES (3, 1);
