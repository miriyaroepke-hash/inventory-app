const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding local admin...');
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword,
            role: 'ADMIN' // Ensure role is ADMIN
        },
        create: {
            username: 'admin',
            name: 'Local Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    console.log('Created/Updated Admin User:');
    console.log('Username: admin');
    console.log('Password: ' + password);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
