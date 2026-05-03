"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Camera,
  Tag,
  Ruler,
  DollarSign,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: Tag },
  { id: 2, title: "التفاصيل", icon: Ruler },
  { id: 3, title: "التسعير", icon: DollarSign },
  { id: 4, title: "الصور", icon: Camera },
]

const categories = [
  { value: "dresses", label: "فساتين" },
  { value: "abayas", label: "عبايات" },
  { value: "bags", label: "حقائب" },
  { value: "shoes", label: "أحذية" },
  { value: "accessories", label: "إكسسوارات" },
  { value: "jewelry", label: "مجوهرات" },
]

const conditions = [
  { value: "new", label: "جديد (مع الكرتون)", description: "القطعة جديدة تماماً ولم تُستخدم" },
  { value: "excellent", label: "ممتاز", description: "استُخدمت مرة أو مرتين فقط، بحالة ممتازة" },
  { value: "good", label: "جيد", description: "بعض علامات الاستخدام البسيطة" },
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "مقاس واحد"]

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    description: "",
    category: "",
    section: "women",
    // Step 2
    size: "",
    condition: "",
    brand: "",
    color: "",
    // Step 3
    listingType: "sale",
    salePrice: "",
    rentalPrice: "",
    minRentalDays: "1",
    // Step 4
    images: [] as string[],
  })

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    updateFormData("images", [...formData.images, ...newImages].slice(0, 5))
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    updateFormData("images", newImages)
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return formData.size && formData.condition
      case 3:
        return formData.listingType === "sale" 
          ? !!formData.salePrice 
          : !!formData.rentalPrice
      case 4:
        return formData.images.length >= 1
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            أضيفي قطعة جديدة
          </h1>
          <p className="text-muted-foreground mb-8">
            املئي التفاصيل التالية لإضافة قطعتك إلى المنصة
          </p>

          {/* Progress Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                        currentStep > step.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : currentStep === step.id
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium hidden sm:block",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-4 transition-colors",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && "أدخلي المعلومات الأساسية عن القطعة"}
                {currentStep === 2 && "أضيفي تفاصيل إضافية لمساعدة المشتريات"}
                {currentStep === 3 && "حددي نوع الإعلان والسعر"}
                {currentStep === 4 && "أضيفي صور جذابة لقطعتك"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">اسم القطعة *</Label>
                    <Input
                      id="title"
                      placeholder="مثال: فستان سهرة ذهبي"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف *</Label>
                    <Textarea
                      id="description"
                      placeholder="اكتبي وصفاً تفصيلياً للقطعة..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>الفئة *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => updateFormData("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختاري الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>القسم *</Label>
                      <RadioGroup
                        value={formData.section}
                        onValueChange={(value) => updateFormData("section", value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="women" id="women" />
                          <Label htmlFor="women" className="font-normal cursor-pointer">
                            نسائي
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="kids" id="kids" />
                          <Label htmlFor="kids" className="font-normal cursor-pointer">
                            أطفال
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>المقاس *</Label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={formData.size === size ? "default" : "outline"}
                          onClick={() => updateFormData("size", size)}
                          className="min-w-[60px]"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>الحالة *</Label>
                    <RadioGroup
                      value={formData.condition}
                      onValueChange={(value) => updateFormData("condition", value)}
                      className="space-y-3"
                    >
                      {conditions.map((condition) => (
                        <div
                          key={condition.value}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                            formData.condition === condition.value
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/50"
                          )}
                          onClick={() => updateFormData("condition", condition.value)}
                        >
                          <RadioGroupItem value={condition.value} id={condition.value} className="mt-1" />
                          <div>
                            <Label htmlFor={condition.value} className="font-medium cursor-pointer">
                              {condition.label}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {condition.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brand">العلامة التجارية</Label>
                      <Input
                        id="brand"
                        placeholder="مثال: زهير مراد"
                        value={formData.brand}
                        onChange={(e) => updateFormData("brand", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">اللون</Label>
                      <Input
                        id="color"
                        placeholder="مثال: ذهبي"
                        value={formData.color}
                        onChange={(e) => updateFormData("color", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-3">
                    <Label>نوع الإعلان *</Label>
                    <RadioGroup
                      value={formData.listingType}
                      onValueChange={(value) => updateFormData("listingType", value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div
                        className={cn(
                          "flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-colors",
                          formData.listingType === "sale"
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        )}
                        onClick={() => updateFormData("listingType", "sale")}
                      >
                        <RadioGroupItem value="sale" id="sale" className="sr-only" />
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <Label htmlFor="sale" className="font-semibold cursor-pointer">للبيع</Label>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          بيع القطعة بشكل نهائي
                        </p>
                      </div>

                      <div
                        className={cn(
                          "flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-colors",
                          formData.listingType === "rent"
                            ? "border-olive bg-olive/5"
                            : "hover:border-muted-foreground/50"
                        )}
                        onClick={() => updateFormData("listingType", "rent")}
                      >
                        <RadioGroupItem value="rent" id="rent" className="sr-only" />
                        <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center mb-3">
                          <Tag className="h-6 w-6 text-olive" />
                        </div>
                        <Label htmlFor="rent" className="font-semibold cursor-pointer">للإيجار</Label>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          تأجير القطعة بالأيام
                        </p>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.listingType === "sale" ? (
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">سعر البيع (د.ك) *</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        placeholder="0"
                        value={formData.salePrice}
                        onChange={(e) => updateFormData("salePrice", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        حددي السعر المناسب لقطعتك
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="rentalPrice">سعر الإيجار اليومي (د.ك) *</Label>
                        <Input
                          id="rentalPrice"
                          type="number"
                          placeholder="0"
                          value={formData.rentalPrice}
                          onChange={(e) => updateFormData("rentalPrice", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>الحد الأدنى للإيجار</Label>
                        <Select
                          value={formData.minRentalDays}
                          onValueChange={(value) => updateFormData("minRentalDays", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">يوم واحد</SelectItem>
                            <SelectItem value="2">يومين</SelectItem>
                            <SelectItem value="3">3 أيام</SelectItem>
                            <SelectItem value="7">أسبوع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Step 4: Images */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>الصور (حتى 5 صور) *</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        أضيفي صور واضحة وعالية الجودة لقطعتك
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                        >
                          <Image
                            src={image}
                            alt={`صورة ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              الرئيسية
                            </span>
                          )}
                        </div>
                      ))}

                      {formData.images.length < 5 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">إضافة صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Preview Card */}
                  {formData.images.length > 0 && (
                    <div className="mt-8 p-6 bg-secondary/50 rounded-xl">
                      <h3 className="font-semibold mb-4">معاينة الإعلان</h3>
                      <div className="flex gap-4">
                        <div className="w-24 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={formData.images[0]}
                            alt="معاينة"
                            width={96}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{formData.title || "اسم القطعة"}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formData.category ? categories.find(c => c.value === formData.category)?.label : "الفئة"} • {formData.size || "المقاس"}
                          </p>
                          <p className="text-lg font-bold text-primary mt-2">
                            {formData.listingType === "sale" 
                              ? `${formData.salePrice || 0} د.ك`
                              : `${formData.rentalPrice || 0} د.ك/يوم`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronRight className="h-4 w-4 ml-2" />
              السابق
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep} disabled={!isStepValid()}>
                التالي
                <ChevronLeft className="h-4 w-4 mr-2" />
              </Button>
            ) : (
              <Button disabled={!isStepValid()}>
                نشر الإعلان
                <Check className="h-4 w-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
