echo "BUILD START"
npm install
npx zenstack generate
npx prisma db push
npm run initial-data
npm run build
echo "BUILD END"