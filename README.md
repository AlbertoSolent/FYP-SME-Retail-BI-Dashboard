# SME Retail Business Intelligence (BI) Dashboard

## 📌 Project Overview
This repository contains the source code for a web-based Business Intelligence (BI) dashboard designed specifically for Small and Medium-sized Enterprise (SME) retailers. The application aims to lower the technical barrier to entry for data analytics by providing a zero-configuration, domain-specific interface to monitor core KPIs (Total Revenue, Profit Margins, and Low-Stock Alerts).

This project is developed as the technical artefact for the **QHO656 Final Dissertation** at Southampton Solent University.

## 🛠️ Technology Stack
* **Frontend:** React.js, Tailwind CSS, Chart.js / Recharts
* **Backend:** Node.js, Express.js (RESTful API)
* **Database:** Relational MySQL

## 📂 Repository Structure
* `/frontend`: Contains the React client application and UI components.
* `/backend`: Contains the Node/Express server and API routing logic.
* `/database`: Contains the `schema.sql` Data Definition Language (DDL) scripts required to initialize the MySQL database and seed it with synthetic testing data.

## 🚀 Local Setup Instructions

### Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### 1. Database Initialization
1. Open MySQL Workbench (or your preferred SQL client).
2. Run the `schema.sql` script located in the `/database` folder to create the `retail_bi_db` database and populate the initial tables.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
2. Install the necessary dependencies:
   ```bash
   npm install
3. Create a `.env` file in the root of the `/backend` directory and add your local MySQL credentials:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=retail_bi_db
   PORT=5000
4. Start the backend server:
   ```bash
   npm start

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
2. Install the necessary dependencies:
   ```bash
   npm install
3. Start the React development server:
   ```bash
   npm run dev
4. The dashboard should now be accessible in your browser at http://localhost:3000 (or the port specified by Vite/Create React App).

## 🎓 Academic Information
* Author: Alberto Dimitrov
* Institution: Southampton Solent University
* Module: QHO656
* Academic Year: 2025/2026
