import SeedService from "~/utils/db/seed/SeedService";

async function seed() {
  await SeedService.seed();
}

seed();
