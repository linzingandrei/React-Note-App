CREATE DATABASE tasks_app;
USE tasks_app;

CREATE TABLE Tasks (
    task_id integer PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(255) NOT NULL,
    task_description VARCHAR(255) NOT NULL,
    task_deadline date NOT NULL,
    visibility_id integer REFERENCES Visibility(visibility_id),
    user_id integer REFERENCES Users(user_id)
);

CREATE TABLE Visibility (
    visibility_id integer PRIMARY KEY AUTO_INCREMENT,
    visibility_type VARCHAR(255)
);

INSERT INTO Visibility (visibility_type)
VALUES
('private'), ('public'), ('both');

-- INSERT INTO Tasks (task_name, task_description, task_deadline)
-- VALUES
-- ('A', 'B', '2024-08-14'),
-- ('V', 'L', '2024-06-03'),

USE tasks_app;

CREATE TABLE Users (
    user_id integer PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_surname VARCHAR(255) NOT NULL,
    user_username VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role INT NOT NULL REFERENCES Roles(role_id)
);

-- INSERT INTO Users (user_name, user_surname, user_username, user_password, user_role)
-- VALUES
-- ("Andrei", "Linzing", "A3n4", "1234", 3),
-- ("Ana", "Maria", "AM", "4321", 2);

USE tasks_app;
CREATE TABLE Roles (
    role_id integer PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL
);

INSERT INTO Roles (role_name) VALUES ("Regular"), ("Manager"), ("Admin");

-- CREATE TABLE RefreshTokens (
--     token_id integer PRIMARY KEY AUTO_INCREMENT,
--     token VARCHAR(255) NOT NULL,
--     user_id integer NOT NULL,
--     expires_at datetime NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES Users(user_id)
-- );