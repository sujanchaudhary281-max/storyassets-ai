'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Lock, Bell, AlertTriangle, Camera } from 'lucide-react'
import { toast } from '@/lib/toast'

const ROLES = ['member', 'developer', 'designer', 'marketer', 'founder', 'product-manager'] as const

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [role, setRole] = useState('')
  const [image, setImage] = useState(session?.user?.image ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(json => {
      if (json.data) {
        setRole(json.data.role ?? 'member')
        setImage(json.data.image ?? '')
        setName(json.data.name ?? '')
      }
    })
  }, [])

  async function handleImageUpload(file: File) {
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', 'Only PNG, JPEG, and WebP are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Maximum size is 5MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Upload failed')
      }

      if (json.data?.url) {
        setImage(json.data.url)
        await update()
        toast.success('Profile image updated', 'Your profile picture has been updated successfully.')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Upload failed', error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role })
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save changes')
      }

      await update()
      toast.success('Settings saved', 'Your profile has been updated successfully.')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Save failed', error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account?\n\nThis will delete all your projects, assets, and data. This action cannot be undone.'
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      const res = await fetch('/api/user/me', { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete account')
      }

      toast.success('Account deleted', 'Your account has been permanently deleted.')
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Delete failed', error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-8">Settings</h1>

      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-sm)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[var(--mute)]" />
              <CardTitle className="text-base">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={image} />
                  <AvatarFallback className="text-lg">{name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Upload photo"
                >
                  <Camera size={18} className="text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{name || 'Your Name'}</p>
                <p className="text-xs text-[var(--mute)]">{uploading ? 'Uploading...' : 'Click avatar to change photo'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 h-10 rounded-[var(--radius-sm)]" />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input value={session?.user?.email ?? ''} disabled className="mt-1 h-10 rounded-[var(--radius-sm)] opacity-60" />
                <p className="text-xs text-[var(--mute)] mt-1">Email changes require re-verification.</p>
              </div>
              <div>
                <Label className="text-sm">Role</Label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] px-3 text-sm"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="rounded-[var(--radius-pill)] mt-4">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-sm)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[var(--mute)]" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Current Password</Label>
                <Input type="password" className="mt-1 h-10 rounded-[var(--radius-sm)]" />
              </div>
              <div>
                <Label className="text-sm">New Password</Label>
                <Input type="password" className="mt-1 h-10 rounded-[var(--radius-sm)]" />
              </div>
              <div>
                <Label className="text-sm">Confirm New Password</Label>
                <Input type="password" className="mt-1 h-10 rounded-[var(--radius-sm)]" />
              </div>
            </div>
            <Button className="rounded-[var(--radius-pill)] mt-4">Update Password</Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-sm)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[var(--mute)]" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Generation complete</p>
                <p className="text-xs text-[var(--mute)]">Email me when assets are ready</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low credit warning</p>
                <p className="text-xs text-[var(--mute)]">Warn when credits ≤ 2</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-sm)] border-[var(--error)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--error)]" />
              <CardTitle className="text-base text-[var(--error)]">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--body)] mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
            <Button
              variant="destructive"
              className="rounded-[var(--radius-pill)]"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
