#! /usr/bin/env bash

# Initialize database
npx zenstack generate

npx prisma db push

# Create initial data
npm run initial-data

# Run server
npm run start:dev