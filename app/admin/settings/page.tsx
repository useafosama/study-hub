import * as React from "react";
import { getPlatformSettings } from "@/actions/settings";
import { SettingsManager } from "@/components/admin/settings-manager";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return <SettingsManager initialSettings={settings} />;
}
