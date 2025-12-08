"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { experienceLevels, JobInfoTable } from "@/drizzle/schema/jobInfo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobInfoSchema } from "../schemas";
import { formatExperienceLevel } from "../lib/formatters";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import SkillsRequired from "./SkillsRequired";
import { getCurrentUserId } from "@/lib/auth";

export type JobInfoFormData = z.infer<typeof jobInfoSchema>;

export function JobInfoForm({
  jobInfo,
}: {
  jobInfo?: Pick<
    typeof JobInfoTable.$inferSelect,
    | "id"
    | "name"
    | "title"
    | "description"
    | "experienceLevel"
    | "skillsRequired"
  >;
}) {
  const form = useForm<JobInfoFormData>({
    resolver: zodResolver(jobInfoSchema),
    defaultValues: jobInfo
      ? {
          title: jobInfo.title,
          name: jobInfo.name,
          description: jobInfo.description,
          experienceLevel: jobInfo.experienceLevel,
          skillsRequired: jobInfo.skillsRequired ?? [],
        }
      : {
          title: "",
          name: null,
          description: "",
          experienceLevel: "junior",
          skillsRequired: [],
        },
  });

  async function onSubmit(values: JobInfoFormData) {
    const currRecId = await getCurrentUserId();
    try {
      const response = await fetch(`/api/jobs?recruiterId=${currRecId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          skillsRequired: values.skillsRequired,
          experienceLevel: values.experienceLevel.toUpperCase(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          (data && (data.message || data.error)) ?? "Failed to save job"
        );
        return;
      }

      toast.success("Job saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This name is displayed in the UI for easy identification.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <SkillsRequired form={form} />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatExperienceLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A Next.js 15 and React 19 full stack web developer job that uses Drizzle ORM and Postgres for database management."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible. The more information you provide,
                the better the interviews will be.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Job Information
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
