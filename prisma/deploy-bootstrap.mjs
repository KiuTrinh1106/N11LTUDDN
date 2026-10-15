import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: "author@demo.local" },
    select: { id: true },
  });

  if (!existingDemoUser) {
    const seedPath = fileURLToPath(new URL("./seed.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [seedPath], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`Demo database seed failed with exit code ${result.status}`);
    }
  }
} finally {
  await prisma.$disconnect();
}
