echo "BUILD START"
npm install
npx zenstack generate
npx prisma db push
npm run build
echo "BUILD END"