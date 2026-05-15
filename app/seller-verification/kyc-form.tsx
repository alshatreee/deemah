'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { submitKycAction } from './actions'

interface KycFormProps {
  userId: string
  initial: { full_name: string; phone: string }
}

export function KycForm({ userId, initial }: KycFormProps) {
  const [docPath, setDocPath] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  async function uploadDoc(file: File | null | undefined) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/kyc-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('kyc-docs')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      setDocPath(path)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(formData: FormData) {
    setError(null)
    if (docPath) formData.set('doc_path', docPath)
    startTransition(async () => {
      const r = await submitKycAction(formData)
      if (r?.error) setError(r.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="font-bold text-emerald-700 mb-2">✓ تم إرسال الطلب</p>
        <p className="text-sm text-muted-foreground">
          سنراجع البيانات خلال ١-٢ يوم عمل.
        </p>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">الاسم الكامل (كما في الهوية)</Label>
        <Input
          id="full_name"
          name="full_name"
          required
          maxLength={120}
          defaultValue={initial.full_name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          name="phone"
          required
          maxLength={20}
          placeholder="965XXXXXXXX"
          defaultValue={initial.phone}
        />
      </div>

      <div className="space-y-2">
        <Label>صورة الهوية المدنية (وجه أمامي)</Label>
        {docPath ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-3">
            <span className="text-sm text-emerald-800">✓ تم الرفع</span>
            <button
              type="button"
              onClick={() => setDocPath('')}
              className="text-emerald-700 hover:text-emerald-900"
              aria-label="حذف"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 text-muted-foreground text-sm">
            <Upload className="h-5 w-5" />
            {uploading ? 'جارٍ الرفع…' : 'اضغطي للرفع (JPG/PNG/PDF)'}
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              hidden
              onChange={(e) => uploadDoc(e.target.files?.[0])}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending || uploading || !docPath} className="w-full">
        {pending ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
      </Button>
    </form>
  )
}
