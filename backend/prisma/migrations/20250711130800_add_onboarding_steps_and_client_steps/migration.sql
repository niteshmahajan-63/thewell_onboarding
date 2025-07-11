-- CreateTable
CREATE TABLE "onboarding_steps" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_steps" (
    "id" SERIAL NOT NULL,
    "zoho_record_id" TEXT NOT NULL,
    "step_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_steps" ADD CONSTRAINT "client_steps_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "onboarding_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
