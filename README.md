# Security Gate System - Hotel & Company Equipment Tracking

A complete MERN stack application for tracking equipment check-ins and check-outs for both hotel guests and company staff.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles & Permissions](#user-roles--permissions)
- [System Workflow](#system-workflow)
- [API Endpoints](#api-endpoints)
- [Export & Reporting](#export--reporting)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)A

## Overview

The **Security Gate System** is a comprehensive solution for managing equipment movement at hotel security gates. It handles two distinct scenarios:

1. ** Hotel Guests** - Register personal equipment when guests arrive and verify when they depart
2. ** Company Staff** - Track company equipment taken outside and ensure timely returns

The system ensures that no unregistered equipment leaves the premises and provides complete audit trails for all transactions.

## Features

### Core Features

**User Authentication** - Secure login for security guards, managers, and admins
**Role-Based Access Control** - Different permissions for different user types
**Guest Equipment Registration** - Register guest personal equipment upon arrival
**Guest Departure Verification** - Verify equipment before allowing exit
**Company Equipment Check-Out** - Register staff taking company equipment outside
**Company Equipment Check-In** - Track returns and condition of equipment
**Overdue Tracking** - Automatic detection and reporting of overdue equipment
**Real-time Dashboard** - Live statistics and activity monitoring

### Advanced Features

**Export to Excel/CSV** - Generate comprehensive reports
**Search & Filter** - Find transactions by equipment, person, room, or date
**Transaction History** - Complete audit trail of all activities
**Security Guard Tracking** - Every transaction records who processed it
**Date Range Filtering** - Filter reports by custom date ranges
**Equipment Condition Tracking** - Record condition when checking in/out
**Manager Reporting** - Report overdue equipment to management

## Technology Stack

### Frontend

**React 18** - UI Framework
**React Router DOM** - Navigation
**Axios** - API calls
**XLSX / FileSaver** - Excel export functionality
**CSS-in-JS** - Styling

### Backend

**Node.js** - Runtime environment
**Express.js** - Web framework
**MongoDB** - Database
**Mongoose** - ODM
**JWT** - Authentication
**bcryptjs** - Password hashing

## Installation

### Prerequisites

Node.js (v14 or higher)
MongoDB (v4.4 or higher)
npm or yarn package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/nebajooo/security-gate-system.git
cd security-gate-system
```
