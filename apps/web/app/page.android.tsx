"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The app starts at `/`, which is the landing page on the web (the tab bar
// hides there). The calendar lives at `/app`.
export default function AndroidStartPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app");
  }, [router]);
  return null;
}
