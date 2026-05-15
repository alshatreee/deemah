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
import { COLORS } from '@/lib/constants/colors'
import { KW_AREAS } from '@/lib/constants/areas'
import { POPULAR_BRANDS } from '@/lib/constants/brands'
import { sizesForCategory } from '@/lib/constants/sizes'
import { subCategoriesFor } from '@/lib/constants/sub-categories'
import { DELIVERY_METHODS } from '@/lib/constants/delivery'

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
  const [subCategory, setSubCategory] = useState<string>(initial?.sub_category ?? '')
  const [gender, setGender] = useState<string>(initial?.gender ?? '')
  const [ageRange, setAgeRange] = useState<string>(initial?.age_range ?? '')
  const [color, setColor] = useState<string>(initial?.color ?? '')
  const [size, setSize] = useState<string>(initial?.size ?? '')
  const [area, setArea] = useState<string>(initial?.area ?? '')
  const [brand, setBrand] = useState<string>(initial?.brand ?? '')
  const [deliveryMethod, setDeliveryMethod] = useState<string>(
    initial?.delivery_method ?? 'meet_in_person',
  )

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
    if (color) formData.set('color', color)
    if (size) formData.set('size', size)
    if (area) formData.set('area', area)
    if (brand) formData.set('brand', brand)
    if (subCategory) formData.set('sub_category', subCategory)
    if (deliveryMethod) formData.set('delivery_method', deliveryMethod)
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

  const sizes = sizesForCategory(category || undefined)
  const subs = subCategoriesFor(category || undefined)

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
            onValueChange={(v) => {
              setCategory(v as ListingCategory)
              setSubCategory('')
              setSize('')
            }}
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

        {subs.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="sub_category">النوع</Label>
            <Select value={subCategory} onValueChange={setSubCategory}>
              <SelectTrigger id="sub_category">
                <SelectValue placeholder="اختاري" />
              </SelectTrigger>
              <SelectContent>
                {subs.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="condition">الحالة</Label>
          <Select name="condition" defaultValue={initial?.condition ?? undefined}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="اختاري" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">جديد بالتغليف</SelectItem>
              <SelectItem value="like_new">ممتاز</SelectItem>
              <SelectItem value="good">جيد جداً</SelectItem>
              <SelectItem value="fair">جيد</SelectItem>
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
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="اختاري الماركة" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {POPULAR_BRANDS.map((b) => (
                <SelectItem key={b.slug} value={b.label}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">المقاس</Label>
          {sizes.length > 0 ? (
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="size">
                <SelectValue placeholder="اختاري المقاس" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>اللون</Label>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
            {COLORS.map((c) => {
              const sel = color === c.id
              const isMulti = c.id === 'multi'
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(sel ? '' : c.id)}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={sel}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    sel
                      ? 'border-primary ring-2 ring-primary/40 ring-offset-2 scale-110'
                      : 'border-border hover:scale-110'
                  }`}
                  style={isMulti ? { backgroundImage: c.hex } : { backgroundColor: c.hex }}
                />
              )
            })}
          </div>
          {color && (
            <p className="text-xs text-muted-foreground">
              المختار: {COLORS.find((c) => c.id === color)?.label}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">المنطقة (للتسليم)</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger id="area">
              <SelectValue placeholder="اختاري المحافظة" />
            </SelectTrigger>
            <SelectContent>
              {KW_AREAS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_method">طريقة التسليم</Label>
          <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
            <SelectTrigger id="delivery_method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_METHODS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {deliveryMethod !== 'meet_in_person' && (
          <div className="space-y-2">
            <Label htmlFor="delivery_fee">رسوم التوصيل (د.ك)</Label>
            <Input
              id="delivery_fee"
              name="delivery_fee"
              type="number"
              step="0.5"
              min="0"
              max="99"
              defaultValue={initial?.delivery_fee ?? ''}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="original_price">السعر الأصلي (اختياري — لعرض الخصم)</Label>
          <Input
            id="original_price"
            name="original_price"
            type="number"
            step="0.001"
            min="0"
            defaultValue={initial?.original_price ?? ''}
          />
        </div>

        <div className="space-y-2">
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
