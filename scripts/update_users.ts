
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Update admin
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (admin) {
        await prisma.user.update({
            where: { username: 'admin' },
            data: { name: 'Мария' }
        });
        console.log('Updated admin -> Мария');
    } else {
        console.log('User admin not found');
    }

    // 2. Upsert emelle@mail.ru
    const secondUserEmail = 'emelle@mail.ru';
    const secondUserName = 'Анна';
    const defaultPassword = 'password123'; // Temporary password
    const hashedPassword = await hash(defaultPassword, 12);

    const secondUser = await prisma.user.findUnique({ where: { username: secondUserEmail } });

    if (secondUser) {
        await prisma.user.update({
            where: { username: secondUserEmail },
            data: { name: secondUserName }
        });
        console.log(`Updated ${secondUserEmail} -> ${secondUserName}`);
    } else {
        await prisma.user.create({
            data: {
                username: secondUserEmail,
                password: hashedPassword,
                name: secondUserName,
                role: 'USER'
            }
        });
        console.log(`Created user ${secondUserEmail} with name ${secondUserName}`);
        console.log(`Default password: ${defaultPassword}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
