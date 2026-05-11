'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import { uploadAvatar } from '@/lib/storage'
import { updateProfileAction } from './actions'
import type { UserProfile } from '@/lib/types'

interface ProfileFormProps {
  profile: UserProfile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)

  async function handleAvatar(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const res = await uploadAvatar(profile.id, file)
      setAvatarUrl(res.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    formData.set('avatar_url', avatarUrl)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl">
              {(profile.full_name ?? 'م').charAt(0)}
            </div>
          )}
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-muted">
          <Upload className="h-4 w-4" />
          {uploading ? 'جارٍ الرفع…' : 'تغيير الصورة'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">الاسم الكامل</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile.full_name ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">اسم المستخدمة</Label>
          <Input
            id="username"
            name="username"
            required
            dir="ltr"
            defaultValue={profile.username ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">الهاتف</Label>
          <Input id="phone" name="phone" dir="ltr" defaultValue={profile.phone ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">المدينة</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? 'الكويت'} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">نبذة</Label>
          <Textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ''} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-700">تم الحفظ ✓</p>}

      <Button type="submit" disabled={isPending || uploading}>
        {isPending ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
      </Button>
    </form>
  )
}
