import { prisma } from "./src/prismaClient";
import bcrypt from "bcrypt";

async function main() {
    const email = "admin@dplit.com";
    const password = "123456789";
    const hash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
        where: { email },
        update: { passwordHash: hash },
        create: {
            email,
            passwordHash: hash,
        },
    });

    console.log("Admin seeded:", admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
