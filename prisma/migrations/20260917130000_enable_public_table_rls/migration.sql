-- FibreConnect uses Fastify and Prisma as its data boundary.
-- RLS is enabled without Data API policies so anon/authenticated roles receive no table access.
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserAddress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Provider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."NetworkOperator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."BroadbandPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CoverageArea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PackageAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SavedPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Comparison" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ComparisonItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CoverageSearch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Enquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EnquiryStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."NotificationPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProviderRating" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AppSetting" ENABLE ROW LEVEL SECURITY;
