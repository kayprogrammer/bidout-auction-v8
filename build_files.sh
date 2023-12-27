echo "BUILD START"
npx zenstack generate
npx prisma db push
echo "BUILD END"