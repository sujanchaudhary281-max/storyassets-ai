import type { Project, GenerationJob, GeneratedAsset, UploadedScreenshot } from '@prisma/client'

export type ProjectWithJobs = Project & {
  generationJobs: GenerationJob[]
  uploadedScreenshots: UploadedScreenshot[]
}

export type JobWithAssets = GenerationJob & {
  generatedAssets: GeneratedAsset[]
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type AssetType = 'logo' | 'icon' | 'screenshot_ios' | 'screenshot_android'
export type StylePreset = 'minimal' | 'gradient' | 'dark' | 'vibrant'
export type Platform = 'ios' | 'android'
export type PlanType = 'free' | 'pro'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
