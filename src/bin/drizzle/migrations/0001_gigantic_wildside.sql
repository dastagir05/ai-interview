ALTER TABLE "job_info" ALTER COLUMN "experienceLevel" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_infos_experience_level";--> statement-breakpoint
CREATE TYPE "public"."job_infos_experience_level" AS ENUM('junior', 'mid-level', 'senior');--> statement-breakpoint
ALTER TABLE "job_info" ALTER COLUMN "experienceLevel" SET DATA TYPE "public"."job_infos_experience_level" USING "experienceLevel"::"public"."job_infos_experience_level";--> statement-breakpoint
ALTER TABLE "job_info" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "job_info" ADD COLUMN "description" varchar NOT NULL;