'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X } from 'lucide-react'
import { uploadListingImage, listingPublicUrl } from '@/lib/storage'
import {
  createListingAction,
  updateListingAction,
} from '@/app/listings/new/actions'
import type { Listing, ListingCategory } from '@/lib/types'

interface ListingFormProps {
  ownerId: string
  initial?: Listing
  mode: 'create' | 'edit'
}

export function ListingForm({ ownerId, initial, mode }: ListingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState<ListingCategory | ''>(initial?.category ?? '')
  const [gender, setGender] = useState<string>(initial?.gender ?? '')
  const [ageRange, setAgeRange] = useState<string>(initial?.age_range ?? '')

  async function handleFiles(filesList: FileList | null) {
    if (!filesList || filesList.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(filesList).slice(0, 8)) {
        const res = await uploadListingImage(ownerId, file)
        uploaded.push(res.path)
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 8))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل رفع الصورة'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function onSubmit(formData: FormData) {
    setError(null)
    images.forEach((p) => formData.append('images', p))
    if (category === 'kids') {
      if (gender) formData.set('gender', gender)
      if (ageRange) formData.set('age_range', ageRange)
    } else {
      formData.delete('gender')
      formData.delete('age_range')
    }
    startTransition(async () => {
      const result =
        mode === 'edit' && initial
          ? await updateListingAction(initial.id, formData)
          : await createListingAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label>الصور</Label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((path, i) => (
            <div
              key={path}
              className="relative aspect-square rounded-md overflow-hidden bg-muted group"
            >
              <Image src={listingPublicUrl(path)} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 left-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <label className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/50 text-muted-foreground text-xs">
              <Upload className="h-5 w-5" />
              {uploading ? 'جارٍ الرفع…' : 'إضافة'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">حتى ٨ صور، JPG/PNG/WEBP، حدّ ٨MB</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">العنوان</Label>
          <Input id="title" name="title" required defaultValue={initial?.title ?? ''} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">الصنف</Label>
          <Select
            name="category"
            value={category}
            onValueChange={(v) => setCategory(v as ListingCategory)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="اختاري" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="women">نسائي</SelectItem>
              <SelectItem value="men">رجالي</SelectItem>
              <SelectItem value="kids">أطفال</SelectItem>
              <SelectItem value="accessories">إكسسوار</SelectItem>
              <SelectItem value="shoes">أحذية</SelectItem>
              <SelectItem value="bags">حقائب</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">الحالة</Label>
          <Select name="condition" defaultValue={initial?.condition ?? undefined}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="اختاري" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="like_new">شبه جديد</SelectItem>
              <SelectItem value="good">جيد</SelectItem>
              <SelectItem value="fair">مقبول</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category === 'kids' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="gender">النوع</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="اختاري" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">أولاد</SelectItem>
                  <SelectItem value="girls">بنات</SelectItem>
                  <SelectItem value="unisex">للجنسين</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_range">الفئة العمرية</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger id="age_range">
                  <SelectValue placeholder="اختاري" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">٠–٢ سنوات</SelectItem>
                  <SelectItem value="3-5">٣–٥ سنوات</SelectItem>
                  <SelectItem value="6-9">٦–٩ سنوات</SelectItem>
                  <SelectItem value="10-12">١٠–١٢ سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="brand">الماركة</Label>
          <Input id="brand" name="brand" defaultValue={initial?.brand ?? ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">المقاس</Label>
          <Input id="size" name="size" defaultValue={initial?.size ?? ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">اللون</Label>
          <Input id="color" name="color" defaultValue={initial?.color ?? ''} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="price_buy">سعر البيع (د.ك)</Label>
          <Input
            id="price_buy"
            name="price_buy"
            type="number"
            step="0.001"
            min="0"
            required
            defaultValue={initial?.price_buy ?? ''}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || uploading}>
          {isPending ? 'جارٍ الحفظ…' : mode === 'edit' ? 'حفظ التغييرات' : 'نشر القطعة'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
