# Housing

## Hello World
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

## Tech
* Backend: Fast API (Python)
* DB: PostgreSQL
* Fronted: (React)
* ORM: SQLAlchemy
* Containerization: Docker + Docker Compose


## Authors
* Andrew Lee
* Gurshabd Varaich
* Minjae Lee
* Nandini Mehrotra
