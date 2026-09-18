-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'SALES', 'CONTENT_EDITOR', 'ANALYST', 'PROVIDER_MANAGER');

-- CreateEnum
CREATE TYPE "ConnectivityType" AS ENUM ('FIBRE', 'LTE', 'FIVE_G');

-- CreateEnum
CREATE TYPE "CoverageResultType" AS ENUM ('FIBRE', 'WIRELESS', 'NONE');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PROVIDER_CONTACTED', 'AWAITING_CUSTOMER', 'APPROVED', 'INSTALLATION_SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerifiedAt" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoText" TEXT,
    "color" TEXT,
    "description" TEXT NOT NULL,
    "connectivity" "ConnectivityType"[],
    "rating" DECIMAL(2,1),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkOperator" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoText" TEXT,
    "color" TEXT,
    "infrastructure" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supportedProviders" TEXT[],
    "coverageLocations" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroadbandPackage" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "providerId" UUID NOT NULL,
    "networkId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "connectivityType" "ConnectivityType" NOT NULL,
    "downloadMbps" INTEGER NOT NULL,
    "uploadMbps" INTEGER NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "promotionalPrice" DECIMAL(10,2),
    "promotionStart" TIMESTAMP(3),
    "promotionEnd" TIMESTAMP(3),
    "installationFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "routerFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "routerIncluded" BOOLEAN NOT NULL DEFAULT false,
    "contractMonths" INTEGER NOT NULL DEFAULT 0,
    "uncapped" BOOLEAN NOT NULL DEFAULT true,
    "dataAllowanceGb" INTEGER,
    "fairUsagePolicy" TEXT,
    "activationEstimate" TEXT,
    "residential" BOOLEAN NOT NULL DEFAULT true,
    "business" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "bestValue" BOOLEAN NOT NULL DEFAULT false,
    "mostPopular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "extras" TEXT[],
    "bestUseCase" TEXT,
    "rating" DECIMAL(2,1),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadbandPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageArea" (
    "id" UUID NOT NULL,
    "networkId" UUID NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageAvailability" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "coverageAreaId" UUID NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PackageAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPackage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonItem" (
    "comparisonId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ComparisonItem_pkey" PRIMARY KEY ("comparisonId","packageId")
);

-- CreateTable
CREATE TABLE "CoverageSearch" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "address" JSONB NOT NULL,
    "resultType" "CoverageResultType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverageSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" UUID,
    "packageId" UUID NOT NULL,
    "assignedToId" UUID,
    "address" JSONB NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "dwelling" TEXT NOT NULL,
    "unit" TEXT,
    "accessNotes" TEXT,
    "landlordAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsentAt" TIMESTAMP(3) NOT NULL,
    "termsConsentAt" TIMESTAMP(3) NOT NULL,
    "providerContactConsentAt" TIMESTAMP(3) NOT NULL,
    "marketingConsentAt" TIMESTAMP(3),
    "status" "EnquiryStatus" NOT NULL DEFAULT 'SUBMITTED',
    "deduplicationKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnquiryStatusHistory" (
    "id" UUID NOT NULL,
    "enquiryId" UUID NOT NULL,
    "status" "EnquiryStatus" NOT NULL,
    "note" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderRating" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserAddress_userId_idx" ON "UserAddress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkOperator_slug_key" ON "NetworkOperator"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BroadbandPackage_slug_key" ON "BroadbandPackage"("slug");

-- CreateIndex
CREATE INDEX "BroadbandPackage_providerId_active_idx" ON "BroadbandPackage"("providerId", "active");

-- CreateIndex
CREATE INDEX "BroadbandPackage_networkId_active_idx" ON "BroadbandPackage"("networkId", "active");

-- CreateIndex
CREATE INDEX "BroadbandPackage_connectivityType_active_idx" ON "BroadbandPackage"("connectivityType", "active");

-- CreateIndex
CREATE INDEX "BroadbandPackage_monthlyPrice_idx" ON "BroadbandPackage"("monthlyPrice");

-- CreateIndex
CREATE INDEX "BroadbandPackage_downloadMbps_idx" ON "BroadbandPackage"("downloadMbps");

-- CreateIndex
CREATE INDEX "Promotion_packageId_active_startsAt_endsAt_idx" ON "Promotion"("packageId", "active", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "CoverageArea_province_city_suburb_idx" ON "CoverageArea"("province", "city", "suburb");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageArea_networkId_province_city_suburb_key" ON "CoverageArea"("networkId", "province", "city", "suburb");

-- CreateIndex
CREATE INDEX "PackageAvailability_coverageAreaId_available_idx" ON "PackageAvailability"("coverageAreaId", "available");

-- CreateIndex
CREATE UNIQUE INDEX "PackageAvailability_packageId_coverageAreaId_key" ON "PackageAvailability"("packageId", "coverageAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPackage_userId_packageId_key" ON "SavedPackage"("userId", "packageId");

-- CreateIndex
CREATE INDEX "Comparison_userId_createdAt_idx" ON "Comparison"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonItem_comparisonId_position_key" ON "ComparisonItem"("comparisonId", "position");

-- CreateIndex
CREATE INDEX "CoverageSearch_userId_createdAt_idx" ON "CoverageSearch"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_reference_key" ON "Enquiry"("reference");

-- CreateIndex
CREATE INDEX "Enquiry_userId_createdAt_idx" ON "Enquiry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_email_createdAt_idx" ON "Enquiry"("email", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_deduplicationKey_createdAt_idx" ON "Enquiry"("deduplicationKey", "createdAt");

-- CreateIndex
CREATE INDEX "EnquiryStatusHistory_enquiryId_createdAt_idx" ON "EnquiryStatusHistory"("enquiryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderRating_providerId_userId_key" ON "ProviderRating"("providerId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadbandPackage" ADD CONSTRAINT "BroadbandPackage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadbandPackage" ADD CONSTRAINT "BroadbandPackage_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "NetworkOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "BroadbandPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageArea" ADD CONSTRAINT "CoverageArea_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "NetworkOperator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAvailability" ADD CONSTRAINT "PackageAvailability_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "BroadbandPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAvailability" ADD CONSTRAINT "PackageAvailability_coverageAreaId_fkey" FOREIGN KEY ("coverageAreaId") REFERENCES "CoverageArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPackage" ADD CONSTRAINT "SavedPackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPackage" ADD CONSTRAINT "SavedPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "BroadbandPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonItem" ADD CONSTRAINT "ComparisonItem_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonItem" ADD CONSTRAINT "ComparisonItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "BroadbandPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageSearch" ADD CONSTRAINT "CoverageSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "BroadbandPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryStatusHistory" ADD CONSTRAINT "EnquiryStatusHistory_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderRating" ADD CONSTRAINT "ProviderRating_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
