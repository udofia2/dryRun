-- CreateEnum
CREATE TYPE "PAYMENTSTRUCTURE" AS ENUM ('lump_sum', 'per_specification');

-- CreateEnum
CREATE TYPE "USERTYPE" AS ENUM ('host', 'exhibitor');

-- CreateEnum
CREATE TYPE "EXHIBITTYPE" AS ENUM ('event_venues', 'event_planner', 'bar_services_and_beverages', 'photography', 'beauty_professional', 'fashion_designers_and_stylists', 'decorators', 'videographer', 'clothing_and_accessories', 'event_staffs', 'caterer', 'baker', 'printing_service', 'event_rental', 'favours_and_gifts', 'music_and_entertainment', 'lighting_and_av', 'dancing_instructor', 'health_and_fitness', 'accomodation', 'transportation_service', 'model', 'social_media_influencer');

-- CreateEnum
CREATE TYPE "PROSPECTTYPE" AS ENUM ('host', 'exhibitor');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "USERTYPE",
    "city" TEXT,
    "state" TEXT,
    "booked_dates" TIMESTAMP(3)[],
    "exhibit" "EXHIBITTYPE",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "client_email" TEXT NOT NULL,
    "exhibitor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "event_id" TEXT NOT NULL,
    "exhibitor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentStructure" (
    "id" TEXT NOT NULL,
    "structure" "PAYMENTSTRUCTURE" NOT NULL,
    "initial_deposit" BOOLEAN NOT NULL DEFAULT false,
    "initial_deposit_amount" DOUBLE PRECISION,
    "offer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'undecided',
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT,
    "state" TEXT,
    "location_type" TEXT NOT NULL,
    "location_address" TEXT NOT NULL DEFAULT 'undecided',
    "exhibitor_id" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "prospect_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provision" (
    "id" TEXT NOT NULL,
    "provision" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exhibitor_name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "specification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exhibitor_name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "specification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Prospect_id_idx" ON "Prospect"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_event_id_key" ON "Offer"("event_id");

-- CreateIndex
CREATE INDEX "Offer_id_idx" ON "Offer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStructure_offer_id_key" ON "PaymentStructure"("offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_prospect_id_key" ON "Event"("prospect_id");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_event_id_key" ON "Specification"("event_id");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provision" ADD CONSTRAINT "Provision_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
