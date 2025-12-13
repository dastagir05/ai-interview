ALTER TABLE "job_info" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_info" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "job_info" ADD COLUMN "skillsRequired" varchar[] DEFAULT '{}';