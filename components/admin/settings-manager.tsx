"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updatePlatformSettingsAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Shield, Globe, Palette, Save, Loader2 } from "lucide-react";
import { PlatformSettings } from "@/types/database";

interface SettingsManagerProps {
  initialSettings: PlatformSettings;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [maintenanceMode, setMaintenanceMode] = React.useState(
    initialSettings.maintenance_mode || false
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("maintenance_mode", maintenanceMode ? "true" : "false");

    try {
      const res = await updatePlatformSettingsAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          إعدادات المنصة العامة
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          تخصيص اسم المنصة، مظهر النظام الافتراضي، وإدارة وضع الصيانة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info Card */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>معلومات المنصة</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              تظهر هذه البيانات في شريط العنوان ورأس الصفحات للطلاب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">اسم المنصة (بالعربية)</label>
                <Input
                  name="platform_name"
                  defaultValue={initialSettings.platform_name}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">اسم المنصة (English)</label>
                <Input
                  name="platform_name_en"
                  defaultValue={initialSettings.platform_name_en || "Study Hub"}
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">وصف المنصة</label>
              <Textarea
                name="description"
                defaultValue={initialSettings.description || ""}
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Themes */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Palette className="h-4 w-4 text-violet-500" />
              <span>المظهر والتفضيلات الافتراضية</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              تحديد التفضيل الافتراضي لواجهة المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-medium text-foreground">المظهر الافتراضي للزوار الجدد</label>
              <select
                name="theme_default"
                defaultValue={initialSettings.theme_default || "system"}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="system">تلقائي (حسب جهاز المستخدم)</option>
                <option value="dark">داكن (Dark Mode)</option>
                <option value="light">فاتح (Light Mode)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>وضع الصيانة (Maintenance Mode)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              عند تفعيل هذا الخيار، سيتم تنبيه الطلاب بأن المنصة تخضع لأعمال صيانة مؤقتة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/70">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  تفعيل وضع الصيانة
                </span>
                <p className="text-[11px] text-muted-foreground">
                  المشرفين فقط سيتمكنون من تصفح المنصة بشكل طبيعي
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="rounded-xl px-6 gap-2 shadow-sm">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ الإعدادات</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
