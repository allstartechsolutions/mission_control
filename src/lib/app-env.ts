const rawLabel = process.env.NEXT_PUBLIC_APP_ENV_LABEL?.trim();
const rawEnv = process.env.MISSION_CONTROL_ENV?.trim().toLowerCase();
const rawTone = process.env.NEXT_PUBLIC_APP_ENV_TONE?.trim().toLowerCase();

export type AppEnvironmentTone = "slate" | "amber" | "red";

export function getAppEnvironmentLabel() {
  if (rawLabel) {
    return rawLabel;
  }

  if (!rawEnv || rawEnv === "production") {
    return "";
  }

  return rawEnv.toUpperCase();
}

export function getAppEnvironmentTone(): AppEnvironmentTone {
  if (rawTone === "amber" || rawTone === "red") {
    return rawTone;
  }

  return "slate";
}

export function isProductionEnvironment() {
  return !rawEnv || rawEnv === "production";
}
