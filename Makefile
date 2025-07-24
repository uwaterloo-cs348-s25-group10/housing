# Instead of 'docker-compose up --build', you may use
#	make run-sample 	to use sample DB
# 	make run-prod		to use production DB
#
# Client (Frontend) will use production DB only in any case

run-sample:
	DB_ENV=sample docker compose -f docker-compose.yml -f docker-compose.sample.yml --env-file .env.sample up --build

run-prod:
	DB_ENV=production docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production up --build
	docker compose exec backend python app/import_data.py
	
clean-sample:
	docker compose -f docker-compose.yml -f docker-compose.sample.yml down --volumes --remove-orphans

clean-prod:
	docker compose -f docker-compose.yml -f docker-compose.production.yml down --volumes --remove-orphans

clean-default:
	docker compose down --volumes --remove-orphans

clean-all:
	docker compose -f docker-compose.yml -f docker-compose.sample.yml down --volumes --remove-orphans 2>/dev/null || true
	docker compose -f docker-compose.yml -f docker-compose.production.yml down --volumes --remove-orphans 2>/dev/null || true
	docker compose down --volumes --remove-orphans 2>/dev/null || true

run-sample-sql:
	DB_ENV=sample docker compose -f docker-compose.yml -f docker-compose.sample.yml --env-file .env.sample up -d --build
	docker compose exec backend python app/seed_data.py
	docker compose exec -T db-sample psql -U cs348-sample -d sample_housing_db < test-sample.sql > test-sample.out
	cat test-sample.out

run-production-sql:
	DB_ENV=sample docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production up -d --build
	docker compose exec backend python app/import_data.py
	docker compose exec -T db psql -U cs348 -d housing_db < test-production.sql > test-production.out

run-index-test:
	DB_ENV=sample docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production up -d --build
	docker compose exec backend python app/import_data.py
	docker compose exec -T db psql -U cs348 -d housing_db < test-production-sql-without-index.sql > test-production-sql-without-index.out
	docker compose exec -T db psql -U cs348 -d housing_db < test-production-sql-with-index.sql > test-production-sql-with-index.out

import-data:
	docker compose exec backend python app/import_data.py

seed-data:
	docker compose exec backend python app/seed_data.py