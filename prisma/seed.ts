import prisma from './db';

type UnitData = {
  unitAbbr: string;
  unitName: string;
};

async function main() {
  // Create units
  const units: UnitData[] = [
    { unitAbbr: 'OZ', unitName: 'Ounces' },
    { unitAbbr: 'ML', unitName: 'Milliliters' },
    { unitAbbr: 'TBSP', unitName: 'Tablespoon' },
    { unitAbbr: 'LB', unitName: 'Pounds' },
    { unitAbbr: 'IN', unitName: 'Inches' },
    { unitAbbr: 'CM', unitName: 'Centimeters' },
    { unitAbbr: 'G', unitName: 'Grams' },
    { unitAbbr: 'KG', unitName: 'Kilograms' },
    { unitAbbr: 'F', unitName: 'Fahrenheit' },
    { unitAbbr: 'C', unitName: 'Celsius' },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { unitAbbr: unit.unitAbbr },
      update: unit,
      create: unit,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      process.exit(1);
    }
  });
