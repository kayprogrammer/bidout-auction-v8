# BidOut Auction V8

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/nest.png?raw=true)

#### NestJs Docs: [Documentation](https://docs.nestjs.com/)

#### Prisma Docs: [Documentation](https://www.prisma.io/docs)

#### PG ADMIN: [Documentation](https://pgadmin.org)

#### Swagger: [Documentation](https://swagger.io/docs/)

## How to run locally

- Download this repo or run:

```bash
    $ git clone git@github.com:kayprogrammer/bidout-auction-v8.git
```

#### In the root directory:

- Install all dependencies

```bash
    $ npm install
```

- Create an `.env` file and copy the contents from the `.env.example` to the file and set the respective values. A postgres database can be created with PG ADMIN or psql. For the test environment, also make sure you create a .env.test file based on the .env.test.example file

- Run Locally

```bash
    $ npx prisma db push
```

```bash
    $ npm run start:dev
```

- Run With Docker

```bash
    $ docker-compose up --build -d --remove-orphans
```

OR

```bash
    $ make build
```

- Test Coverage

```bash
    $ npm test
```

OR

```bash
    $ make tests
```

## Docs
#### SWAGGER API Url: [BidOut Docs](https://bidout-nestjs-api.vercel.app/)
#### POSTMAN API Url: [BidOut Docs](https://bit.ly/bidout-api)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display1.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display2.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display3.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display4.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display5.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display6.png?raw=true)

![alt text](https://github.com/kayprogrammer/bidout-auction-v8/blob/main/display/display7.png?raw=true)
