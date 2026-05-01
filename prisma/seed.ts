import { PrismaClient, FoodSource, Role, Gender, Goal } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Alimentos TACO (amostra representativa) ───────────────────
  const tacoFoods = [
    { name: 'Frango, peito, grelhado', calories: 159, proteinG: 32, carbsG: 0, fatG: 3.2, fiberG: 0 },
    { name: 'Arroz, branco, cozido', calories: 128, proteinG: 2.5, carbsG: 28, fatG: 0.2, fiberG: 1.6 },
    { name: 'Batata doce, cozida', calories: 77, proteinG: 1.4, carbsG: 18, fatG: 0.1, fiberG: 2.5 },
    { name: 'Ovo, inteiro, cozido', calories: 146, proteinG: 13, carbsG: 0.6, fatG: 10, fiberG: 0 },
    { name: 'Aveia, flocos, crua', calories: 394, proteinG: 13.9, carbsG: 67.9, fatG: 8.5, fiberG: 9.1 },
    { name: 'Banana, nanica', calories: 92, proteinG: 1.4, carbsG: 23.8, fatG: 0.1, fiberG: 1.9 },
    { name: 'Feijão, carioca, cozido', calories: 76, proteinG: 4.8, carbsG: 13.6, fatG: 0.5, fiberG: 8.5 },
    { name: 'Azeite de oliva, extra virgem', calories: 884, proteinG: 0, carbsG: 0, fatG: 100, fiberG: 0 },
    { name: 'Whey protein (genérico)', calories: 400, proteinG: 80, carbsG: 10, fatG: 5, fiberG: 0 },
    { name: 'Pão integral, fatiado', calories: 253, proteinG: 8.8, carbsG: 48, fatG: 3.5, fiberG: 6.5 },
    { name: 'Queijo cottage', calories: 97, proteinG: 12.5, carbsG: 2.7, fatG: 4.3, fiberG: 0 },
    { name: 'Iogurte grego integral', calories: 97, proteinG: 9, carbsG: 3.6, fatG: 5, fiberG: 0 },
    { name: 'Atum, em água, drenado', calories: 109, proteinG: 24, carbsG: 0, fatG: 0.9, fiberG: 0 },
    { name: 'Salmão, grelhado', calories: 208, proteinG: 29, carbsG: 0, fatG: 10, fiberG: 0 },
    { name: 'Brócolis, cozido', calories: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4, fiberG: 3.3 },
    { name: 'Espinafre, cozido', calories: 23, proteinG: 3, carbsG: 3.8, fatG: 0.3, fiberG: 2.4 },
    { name: 'Manteiga de amendoim', calories: 598, proteinG: 25, carbsG: 20, fatG: 50, fiberG: 5 },
    { name: 'Maçã, sem casca', calories: 56, proteinG: 0.3, carbsG: 15.2, fatG: 0.1, fiberG: 1.3 },
    { name: 'Carne bovina, patinho, grelhado', calories: 219, proteinG: 33, carbsG: 0, fatG: 9, fiberG: 0 },
    { name: 'Leite integral', calories: 61, proteinG: 3.2, carbsG: 4.7, fatG: 3.3, fiberG: 0 },
    { name: 'Massa, espaguete, cozida', calories: 130, proteinG: 5, carbsG: 26, fatG: 0.9, fiberG: 1.4 },
    { name: 'Ovo, clara, cozida', calories: 52, proteinG: 11, carbsG: 0.7, fatG: 0.2, fiberG: 0 },
    { name: 'Creatina monohidratada', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
    { name: 'Amendoim, torrado', calories: 581, proteinG: 26, carbsG: 22, fatG: 47, fiberG: 8 },
    { name: 'Abacate', calories: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7, fiberG: 6.7 },
  ];

  console.log(`  📦 Inserindo ${tacoFoods.length} alimentos TACO...`);

  await prisma.food.deleteMany(); // limpar antes do seed
  await prisma.food.createMany({
    data: tacoFoods.map((f) => ({ ...f, source: FoodSource.TACO })),
    skipDuplicates: true,
  });

  // ── Usuários de teste ──────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.log('  👤 Criando usuários de teste...');

    const hashedPassword = await bcrypt.hash('Senha@123', 10);

    // Nutricionista de teste
    const nutriUser = await prisma.user.upsert({
      where: { email: 'nutri@fuelmatch.dev' },
      update: {},
      create: {
        email: 'nutri@fuelmatch.dev',
        password: hashedPassword,
        role: Role.NUTRITIONIST,
        nutritionist: {
          create: {
            fullName: 'Mariana Silva',
            crnNumber: 'CRN-2/12345',
            specialties: ['musculação', 'hipertrofia', 'cutting'],
            bio: 'Nutricionista esportiva especialista em musculação e periodização nutricional.',
          },
        },
      },
    });

    // Atleta de teste
    const athleteUser = await prisma.user.upsert({
      where: { email: 'atleta@fuelmatch.dev' },
      update: {},
      create: {
        email: 'atleta@fuelmatch.dev',
        password: hashedPassword,
        role: Role.ATHLETE,
        athlete: {
          create: {
            fullName: 'Rafael Costa',
            birthDate: new Date('1996-03-15'),
            gender: Gender.MALE,
            heightCm: 178,
            weightKg: 82,
            goal: Goal.HYPERTROPHY,
            trainingDaysPerWeek: 5,
          },
        },
      },
    });

    // Vincular atleta à nutricionista
    const nutritionist = await prisma.nutritionist.findUnique({ where: { userId: nutriUser.id } });
    const athlete = await prisma.athlete.findUnique({ where: { userId: athleteUser.id } });

    if (nutritionist && athlete) {
      await prisma.athlete.update({
        where: { id: athlete.id },
        data: { nutritionistId: nutritionist.id },
      });
    }

    console.log('  ✓ Usuários de teste criados:');
    console.log('    Nutri:  nutri@fuelmatch.dev   / Senha@123');
    console.log('    Atleta: atleta@fuelmatch.dev  / Senha@123');
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
