import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain at least one uppercase letter').regex(/[0-9]/, 'Must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1)
    .refine((v) => v.trim().split(/\s+/).filter(Boolean).length <= 5000, 'Description must be 5000 words or fewer'),
  ageGroup: z.enum(['all-ages', '4+', '9+', '12+', '17+']),
  category: z.string().min(1),
  platforms: z.array(z.enum(['ios', 'android'])).min(1),
  stylePreset: z.enum(['minimal', 'gradient', 'dark', 'vibrant']),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  templateId: z.string().optional(),
  locales: z.array(z.string()).optional(),
  iconKey: z.string().optional(),
})

export const projectUpdateSchema = projectSchema.partial()

export const projectDraftSchema = z.object({
  formData: z.record(z.string(), z.unknown()),
  step: z.number().int().min(1).max(6).optional(),
})

export const screenshotUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(['image/png', 'image/jpeg']),
  fileSize: z.number().max(10 * 1024 * 1024, 'Max file size is 10MB'),
})

export const APP_CATEGORIES = [
  'productivity', 'social', 'health-fitness', 'education', 'entertainment',
  'finance', 'food-drink', 'games', 'lifestyle', 'music', 'news',
  'photography', 'shopping', 'sports', 'travel', 'utilities', 'weather', 'business', 'developer-tools', 'other'
] as const

export const STYLE_PRESETS = ['minimal', 'gradient', 'dark', 'vibrant'] as const
export const PLATFORMS = ['ios', 'android'] as const

export const AGE_GROUPS = [
  { value: 'all-ages', label: 'All ages' },
  { value: '4+', label: '4+' },
  { value: '9+', label: '9+' },
  { value: '12+', label: '12+' },
  { value: '17+', label: '17+' },
] as const
