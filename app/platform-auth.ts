import { headers } from "next/headers";

export type AuthenticatedUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_EMAIL_HEADER = "x-spaplus-user-email";
const USER_FULL_NAME_HEADER = "x-spaplus-user-name";

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName = encodedFullName ? safeDecodeURIComponent(encodedFullName) : null;

  return {
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
