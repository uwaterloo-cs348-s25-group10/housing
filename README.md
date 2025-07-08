# 🇨🇦 O Canada Homes (Canadian Housing-Affordability Dashboard)

## 📚 Core Features
✔️ **Feature 1 – Explore regional trends in housing prices and incomes**  
✔️ **Feature 2 – Personalized affordability quiz (“Where Can I Live?”)**  
✔️ **Feature 3 – Reverse price lookup**  
✔️ **Feature 4 – Affordability index ranking by region**  

## 🔧 Tech Stack
* Backend: Fast API (Python)
* DB: PostgreSQL
* Fronted: (React)
* ORM: SQLAlchemy
* Containerization: Docker + Docker Compose

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


## 🚀 How to Seed & Test (sample-sql)
   ```bash
   #  make run-sample-sql
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
