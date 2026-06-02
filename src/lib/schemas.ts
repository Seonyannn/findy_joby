import { z } from "zod";

// 简历结构化数据
export const ResumeDataSchema = z.object({
  name: z.string(),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      major: z.string(),
      year: z.string(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      duration: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  skills: z.array(z.string()),
  summary: z.string(),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;

// 岗位描述
export const JobDescriptionSchema = z.object({
  job_title: z.string(),
  department: z.string().optional(),
  location: z.string().optional(),
  requirements: z.array(z.string()),
  description: z.string(),
  url: z.string().optional(),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

// 匹配结果
export const MatchResultSchema = z.object({
  job_title: z.string(),
  match_percentage: z.number(),
  match_reasons: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

// API 响应
export const MatchResponseSchema = z.object({
  results: z.array(MatchResultSchema),
});

export type MatchResponse = z.infer<typeof MatchResponseSchema>;
