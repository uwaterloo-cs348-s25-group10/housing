# 🇨🇦 O Canada Homes (Canadian Housing-Affordability Dashboard)

## 📚 Core Features
✔️ **Feature 1 – Explore regional trends in housing prices and incomes**  
✔️ **Feature 2 – Personalized affordability quiz (“Where Can I Live?”)**  
✔️ **Feature 3 – Reverse price lookup**  
✔️ **Feature 4 – Affordability index ranking by region**  
✔️ **Feature 5 – Data Gap Finder**

## ✅ Feature Implementation Summary

| Feature | Description | Backend Implementation | Frontend Implementation |
|---------|-------------|-------------------------|--------------------------|
| **Feature 1** | Explore regional trends in housing prices and incomes | [`app/main.py`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/backend/app/main.py) | [frontend/src/pages/HousingTrendsPage.js](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/frontend/src/pages/HousingTrendsPage.js) [frontend/src/pages/IncomeTrendsPage.js](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/frontend/src/pages/IncomeTrendsPage.js) |
| **Feature 2** | Personalized affordability quiz (“Where Can I Live?”) | [`app/main.py`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/backend/app/main.py) | [frontend/src/pages/WhereCanLivePage.js`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/frontend/src/pages/WhereCanLivePage.js)<br><sub>*Currently uses dummy data; API integrated and tested*</sub> |
| **Feature 3** | Reverse price lookup | [`app/main.py`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/backend/app/main.py) | [`frontend/src/pages/ReverseLookupPage.js`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/frontend/src/pages/ReverseLookupPage.js) |
| **Feature 4** | Affordability index ranking by region | [`app/main.py`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/backend/app/main.py) | [`frontend/src/pages/AffordabilityRankingPage.js`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/frontend/src/pages/AffordabilityRankingPage.js) |
| **Feature 5** | Data gap finder | [`app/main.py`](https://github.com/uwaterloo-cs348-s25-group10/housing/blob/main/backend/app/main.py)| *Not implemented in frontend yet* |


## 🔧 Tech Stack
* Backend: Fast API (Python)
* DB: PostgreSQL
* Fronted: (React)
* ORM: SQLAlchemy
* Containerization: Docker + Docker Compose

For our project, we have been using SQLAlchemy to define and query our SQL schema instead of raw SQL directly, for efficiency and maintainabilty.

## 🚀 Getting Started
1. Download and open Docker
2. Clone the repo
```bash
git clone https://github.com/uwaterloo-cs348-s25-group10/housing
cd housing
```
3. Build and run the Docker container
```
make run-prod
```
4. Now you can access to the service
* Frontend: http://localhost:3000
* Backend: http://localhost:8000
* API Docs (Swagger): http://localhost:8000/docs


## 🚀 How to Seed & Test
You need to open docker first to test while you don't need to run-sample or run-prod.
```bash
make run-sample-sql (for test-sample.sql)
make run-production-sql (for test-production.sql)
```

## How do we utilize raw data?
Note that we utilize production db for client using production data and sample db for debugging and testing using sample data.

In addition to report.pdf, this markdown will explain in technical terms.
1. Pre-processed datasets are in dataset folder.
2. app/main.py reset production db and load csv files.
3. main.py import Region.csv first and create lookup tables for tables using region_id as foreign key.
4. Based on lookup mapping tables, we import remaining csv files to production db.

## 🔗 Links
Figma Designs: [CS348 Design Mockups](https://www.figma.com/design/l8FtoQQr5ftWvWdWMy8Mnt/CS-348-Designs?node-id=0-1&t=2HrGr2P0jI5X6Qz5-1)

Kaggle Canada Housing Dataset: https://www.kaggle.com/datasets/yuliiabulana/canada-housing

Statistics Canada Table 98-10-0055-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810005501
