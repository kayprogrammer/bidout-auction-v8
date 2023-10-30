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
	npm run start


mmig: # run with "make mmig" or "make mmig message='migration message'"
	if [ -z "$(message)" ]; then \
		npx zenstack generate; \
	else \
		npx prisma migrate --name "$(message)"; \
	fi
	
mig:
	npx prisma db push

initial_data:
	python initials/initial_data.py

tests:
	pytest --disable-warnings -vv -x

reqm:
	npm install
