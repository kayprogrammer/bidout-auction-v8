echo "BUILD START"
npx zenstack generate
npx prisma db push
npm run build
echo "BUILD END"