ifneq (,$(wildcard ./.env))
include .env
export 
ENV_FILE_PARAM = --env-file .env

endif

build:
	docker-compose up --build -d --remove-orphans

up:
	docker-compose up -d

down:
	docker-compose down

show-logs:
	docker-compose logs

serv:
	npm run start:dev


mmig: # run with "make mmig" or "make mmig message='migration message'"
	if [ -z "$(message)" ]; then \
		npx zenstack generate; \
	else \
		npx prisma migrate --name "$(message)"; \
	fi
	
mig:
	npx prisma db push

init:
	npm run initial-data

tests:
	npm test

reqm:
	npm install

# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYzRiMWQwOC03NmViLTRmZWYtYjBjYi00NGNjOTVjZjRiOTIiLCJleHAiOjE3MDQ2NDYwMTEsImlhdCI6MTcwMTY0NjAxMX0.lo4873-V_OzvU-thNg3pw18FtfZWg3_dtgN5eV9RilA