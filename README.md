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
* Backend: http://localhost:8000
* API Docs (Swagger): http://localhost:8000/docs

## Tech
* Backend: Fast API (Python)
* DB: PostgreSQL
* Fronted: (React)
* ORM: SQLAlchemy
* Containerization: Docker + Docker Compose

## Sample Dataset
We created a toy dataset consisting of one table: `apartments`.
Table schema:

* `id` (Integer, Primary Key)
* `city` (String)
* `registration_number` (String)

## Hello World Functionality

* `GET /` - returns "Hello World" message
* `GET /apartments/` - returns all apartment rows
* `POST /apartments/?city=...&registration_number=...` - adds a new apartment

## How to Load Sample Data

1. Swagger

    Go to `http://localhost:8000/docs` and use `POST /apartments/`.
    For example:
    city: Waterloo,
    registration_number: WLU7898

2. curl

    `curl -X POST "http://localhost:8000/apartments/?city=Waterloo&registration_number=WLU7898"`

## Authors
* Andrew Lee
* Gurshabd Varaich
* Minjae Lee
* Nandini Mehrotra
