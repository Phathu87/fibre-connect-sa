-- Keep Prisma's internal migration metadata inaccessible through exposed schemas.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
