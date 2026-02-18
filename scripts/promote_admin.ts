
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'miriya.roepke@gmail.com';

    console.log(`Promoting ${email} to ADMIN...`);

    try {
        const user = await prisma.user.update({
            where: { username: email },
            data: { role: 'ADMIN' },
        });
        console.log(`Success! User ${user.username} is now ${user.role}.`);
    } catch (error) {
        console.error(`Error: User ${email} not found or database error.`);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
