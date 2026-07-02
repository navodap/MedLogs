-- Medico-Legal Case Management System
-- PostgreSQL database bootstrap
-- Run this ONCE while connected to the default "postgres" database in pgAdmin.
-- Do not run it again after the database already exists.

CREATE DATABASE medico_legal_case_management
    WITH ENCODING = 'UTF8'
    TEMPLATE = template0;
