DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department(
id int auto_increment not null,
department_name varchar(30) not null,
primary key (id)
);

CREATE TABLE role(
id int auto_increment not null,
title varchar(30) not null,
salary int null,
department_id int not null,
primary key (id)
);

CREATE TABLE employees(
id int auto_increment not null,
first_name varchar(30) null,
last_name varchar(30) null,
role_id int not null,
manager_id int null,
primary key (id)
);

insert into department (department_name)
values ("Marketing");
insert into department (department_name)
values ("HR");
insert into department (department_name)
values ("Legal");
insert into department (department_name)
values ("Finance");

insert into role (title, salary, department_id)
values ("Sales Member", 33000, 1);
insert into role (title, salary, department_id)
values ("Marketing Director", 60000, 1);
insert into role (title, salary, department_id)
values ("Legal Representative", 60000, 2);
insert into role (title, salary, department_id)
values ("CEO", 70000, 1);
insert into role (title, salary, department_id)
values ("Human Resources", 29000, 2);
insert into role (title, salary, department_id)
values ("Engineer", 50000, 2);
insert into role (title, salary, department_id)
values ("Lead Engineer", 90000, 2);
insert into role (title, salary, department_id)
values ("President", 100000, 1);

insert into employees (first_name, last_name, role_id, manager_id)
values ("Diantai", "Johnson", 3, 9);
insert into employees (first_name, last_name, role_id, manager_id)
values ("John", "Wick", 1, 4);
insert into employees (first_name, last_name, role_id, manager_id)
values ("John", "Cena", 5, 7);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Donald", "Trump", 4, 3);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Barrack", "Obama", 5, 8);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Chad", "Thomas", 4, 7);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Justin", "Bullick", 7, 8);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Sandra", "Johnson", 8, 3);
