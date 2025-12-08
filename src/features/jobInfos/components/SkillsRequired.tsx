import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { JobInfoFormData } from "./JobInfoForm";

const SkillsRequired = ({ form }: { form: UseFormReturn<JobInfoFormData> }) => {
  return (
    <FormField
      control={form.control}
      name="skillsRequired"
      render={({ field }) => {
        const [skillInput, setSkillInput] = React.useState("");

        const addSkill = () => {
          const trimmed = skillInput.trim();
          if (!trimmed) return;

          // prevent duplicates
          if (field.value.includes(trimmed)) return;

          field.onChange([...field.value, trimmed]);
          setSkillInput("");
        };

        const removeSkill = (skill: string) => {
          field.onChange(field.value.filter((s: string) => s !== skill));
        };

        return (
          <FormItem>
            <FormLabel>Skills Required</FormLabel>

            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Enter a skill and click Add"
              />
              <Button type="button" onClick={addSkill}>
                Add
              </Button>
            </div>

            {/* Skills List */}
            <div className="flex flex-wrap gap-2 mt-3">
              {field.value.length > 0 ? (
                field.value.map((skill: string) => (
                  <div
                    key={skill}
                    className="px-3 py-1 bg-secondary rounded-full flex items-center gap-2 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills added yet.
                </p>
              )}
            </div>

            <FormDescription>
              Add multiple skills required for this job.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default SkillsRequired;
