import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

// Tests run west of UTC, in a zone with daylight saving time, so a date
// formatted without timeZone "UTC" (or "today" read in UTC) shows up as a day
// off instead of passing on a developer's machine in Europe. Pick another zone
// with TZ=Pacific/Kiritimati npx vitest run. Git Bash on Windows does not pass
// TZ to Node; use TEST_TZ there (or $env:TZ in PowerShell).
const TEST_TIME_ZONE = process.env.TEST_TZ || process.env.TZ || "America/New_York";
// A misspelt zone (Pacific/Kiritimat) makes Node fall back to UTC, the one zone
// where these bugs cannot show, and every test would pass. Refuse it instead.
// A POSIX ":/path" value cannot be checked here; it is used as given.
if (!TEST_TIME_ZONE.startsWith(":")) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: TEST_TIME_ZONE });
  } catch {
    throw new Error(`Unknown test time zone "${TEST_TIME_ZONE}" (from TEST_TZ or TZ). Use an IANA name such as America/New_York.`);
  }
}
process.env.TZ = TEST_TIME_ZONE;

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    env: { TZ: TEST_TIME_ZONE },
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
