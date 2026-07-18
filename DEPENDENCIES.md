# 📦 Dependencies Documentation

## Overview

This document lists all dependencies used in the LiveTrack application.

## Backend Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web framework |
| `dotenv` | ^16.3.1 | Environment variables |

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^5.7.0 | ORM client |
| `prisma` | ^5.7.0 | Database toolkit |

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|---------|
| `jsonwebtoken` | ^9.0.2 | JWT authentication |
| `bcrypt` | ^5.1.1 | Password hashing |
| `helmet` | ^7.1.0 | Security headers |
| `cors` | ^2.8.5 | CORS handling |
| `express-rate-limit` | ^7.1.5 | Rate limiting |

### Real-time Communication

| Package | Version | Purpose |
|---------|---------|---------|
| `socket.io` | ^4.6.0 | WebSocket server |

### Validation & Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `joi` | ^17.11.0 | Data validation |
| `axios` | ^1.6.2 | HTTP client |
| `qrcode` | ^1.5.3 | QR code generation |
| `node-cron` | ^3.0.3 | Task scheduling |

### Logging

| Package | Version | Purpose |
|---------|---------|---------|
| `winston` | ^3.11.0 | Application logging |
| `morgan` | ^1.10.0 | HTTP request logging |

---

## Frontend Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `react-router-dom` | ^6.20.1 | Routing |
| `vite` | ^5.0.8 | Build tool |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | CSS framework |
| `autoprefixer` | ^10.4.16 | CSS vendor prefixes |
| `postcss` | ^8.4.32 | CSS processor |
| `framer-motion` | ^10.16.16 | Animations |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^4.4.7 | State management |

### HTTP & Real-time

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | ^1.6.2 | HTTP client |
| `socket.io-client` | ^4.6.0 | WebSocket client |

### Maps

| Package | Version | Purpose |
|---------|---------|---------|
| `leaflet` | ^1.9.4 | Map library |
| `react-leaflet` | ^4.2.1 | React Leaflet wrapper |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `react-icons` | ^4.12.0 | Icon library |
| `react-hot-toast` | ^2.4.1 | Notifications |
| `recharts` | ^2.10.3 | Charts library |
| `qrcode.react` | ^3.1.0 | QR code component |

### Forms & Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7.49.2 | Form management |
| `date-fns` | ^3.0.6 | Date utilities |
| `clsx` | ^2.0.0 | Class name utility |
| `tailwind-merge` | ^2.2.0 | Tailwind merger |

---

## Installation

### Install All Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install