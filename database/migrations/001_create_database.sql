-- Migration 001: Create database gensa_db
-- Jalankan: mysql -u root -p < database/migrations/001_create_database.sql

CREATE DATABASE IF NOT EXISTS gensa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gensa_db;
