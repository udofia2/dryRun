-- CreateEnum
CREATE TYPE "PAYMENTSTRUCTURE" AS ENUM ('lump_sum', 'per_specification');

-- CreateEnum
CREATE TYPE "POLICYSPECIFIER" AS ENUM ('client', 'vendor');

-- CreateEnum
CREATE TYPE "REFUNDPOLICY" AS ENUM ('refundable', 'non_refundable');

-- CreateEnum
CREATE TYPE "PROSPECTSTATUSTYPE" AS ENUM ('pending', 'converted', 'rejected');

-- CreateEnum
CREATE TYPE "EVENTSOURCE" AS ENUM ('offline', 'online');

-- CreateEnum
CREATE TYPE "STATUSTYPE" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "TICKETTYPE" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "STOCKTYPE" AS ENUM ('unlimited', 'limited');

-- CreateEnum
CREATE TYPE "ENTRYPASSTYPE" AS ENUM ('free', 'paid', 'invite_only');

-- CreateEnum
CREATE TYPE "SCHEDULETYPE" AS ENUM ('one_time', 'recurring');

-- CreateEnum
CREATE TYPE "USERTYPE" AS ENUM ('host', 'vendor');

-- CreateEnum
CREATE TYPE "EXHIBITTYPE" AS ENUM ('event_venues', 'event_planner', 'bar_services_and_beverages', 'photography', 'beauty_professional', 'fashion_designers_and_stylists', 'decorators', 'videographer', 'clothing_and_accessories', 'event_staffs', 'caterer', 'baker', 'printing_service', 'event_rental', 'favours_and_gifts', 'music_and_entertainment', 'lighting_and_av', 'dancing_instructor', 'health_and_fitness', 'accomodation', 'transportation_service', 'model', 'social_media_influencer');

-- CreateEnum
-- CREATE TYPE "PROSPECTTYPE" AS ENUM ('host', 'vendor');

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
    "source" "EVENTSOURCE" NOT NULL,
    "status" "PROSPECTSTATUSTYPE" NOT NULL DEFAULT 'pending',
    "client_email" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "STATUSTYPE" NOT NULL DEFAULT 'pending',
    "event_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
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
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "title_of_deliverable" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "contract_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentStructure" (
    "id" TEXT NOT NULL,
    "structure" "PAYMENTSTRUCTURE" NOT NULL,
    "initial_deposit" BOOLEAN NOT NULL DEFAULT false,
    "initial_deposit_amount" DOUBLE PRECISION,
    "offer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'undecided',
    "date" TIMESTAMP(3),
    "type" TEXT,
    "link" TEXT,
    "number_of_guests" INTEGER,
    "description" TEXT,
    "city" TEXT,
    "state" TEXT,
    "location_type" TEXT NOT NULL,
    "location" TEXT,
    "virtual_meeting_link" TEXT,
    "location_address" TEXT NOT NULL DEFAULT 'undecided',
    "schedule_type" "SCHEDULETYPE",
    "start_date" TIMESTAMP(3),
    "start_time" TEXT,
    "end_date" TIMESTAMP(3),
    "end_time" TEXT,
    "recurring_frequency" TEXT,
    "facebook_link" TEXT,
    "instagram_link" TEXT,
    "x_link" TEXT,
    "website_link" TEXT,
    "cover_art_url" TEXT,
    "vendor_id" TEXT NOT NULL,
    "client_email" TEXT,
    "prospect_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL,
    "theme" TEXT,
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
    "vendor_name" TEXT,
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
    "vendor_name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "specification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryPass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ENTRYPASSTYPE" NOT NULL,
    "stock_type" "STOCKTYPE" NOT NULL DEFAULT 'unlimited',
    "reservation_limit" INTEGER,
    "description" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "transfer_processing_fee_to_guest" BOOLEAN NOT NULL DEFAULT false,
    "ticket_type" "TICKETTYPE",
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntryPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "recipients_emails" TEXT[],
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entry_pass_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "STATUSTYPE" NOT NULL DEFAULT 'pending',
    "confidentiality" TEXT NOT NULL DEFAULT 'This agreement constitutes the entire agreement between the parties are commercial secrets and guarantees to not disclose such information to others without correct authorization.',
    "indemnification" TEXT NOT NULL DEFAULT 'This Client agrees to indemnify and hold the event vendor harmless from any claims, liabilities, damages, or expenses arising out of or related to the scope of service, excluding those caused by the vendor’s negligence or willful misconduct.',
    "photography_and_publicity_laws" TEXT NOT NULL DEFAULT 'The client would allow the vendor to take pictures with consent for their brand publicity.',
    "entire_agreement" TEXT NOT NULL DEFAULT 'This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, understandings, and agreements between the parties.',
    "client_email" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancellation" (
    "id" TEXT NOT NULL,
    "refund_policy" "REFUNDPOLICY" NOT NULL,
    "notice_days" INTEGER NOT NULL,
    "percentage_of_fee" DOUBLE PRECISION NOT NULL,
    "specified_by" "POLICYSPECIFIER" NOT NULL,
    "contract_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Invite_entry_pass_id_key" ON "Invite"("entry_pass_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_event_id_key" ON "Contract"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_contract_id_key" ON "Cancellation"("contract_id");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provision" ADD CONSTRAINT "Provision_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryPass" ADD CONSTRAINT "EntryPass_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_entry_pass_id_fkey" FOREIGN KEY ("entry_pass_id") REFERENCES "EntryPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
