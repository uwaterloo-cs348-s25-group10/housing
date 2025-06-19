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
3. Set up the environment variables
```bash
cp .env.example .env
```
4. Build and run the Docker container
```bash
docker-compose up --build
```
5. Now you can access to the service
* Frontend: http://localhost:3000 (On your network, you may use http://172.19.0.4:3000)
* Backend: http://localhost:8000
* API Docs (Swagger): http://localhost:8000/docs


## 🚀 How to Seed & Test
   ```bash
   # 1) Build & start containers
   docker compose up -d --build

   # 2) Seed the database
   docker compose exec backend python app/seed_data.py
   # → “✅ Seed data inserted!”

   # 3) Run all SQL feature tests
   docker compose exec -T db psql \
     -U housing_user \
     -d housing_db \
     < test-sample.sql \
     > test-sample.out

   # 4) View results
   cat test-sample.out
```

## 🔗 Links
📊 Figma Designs: [CS348 Design Mockups](https://www.figma.com/design/l8FtoQQr5ftWvWdWMy8Mnt/CS-348-Designs?node-id=0-1&t=2HrGr2P0jI5X6Qz5-1)

## Authors
* Andrew Lee
* Gurshabd Varaich
* Minjae Lee
* Nandini Mehrotra
