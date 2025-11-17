import { Stack } from "expo-router";

import "@/assets/css/global.css";
import { PermissionsProvider } from "@/utils/usePermissions";

export default function RootLayout() {
  return <PermissionsProvider><Stack />;</PermissionsProvider>
}
