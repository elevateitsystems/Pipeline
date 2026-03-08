import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { redis } from "./redis";
import { User , Company } from "../app/generated/prisma";

const SESSION_TTL = 60 * 60 * 24 * 7;
const COOKIE_NAME = "session_id";
const SESSION_DATA_COOKIE_NAME = "session_data"; // Used as fallback when Redis is not available

export type SessionUser = Omit<User, "passCode"> & {
  company?: Pick<Company, "id" | "name" | "logoUrl">;
};

export async function createSession(user: SessionUser): Promise<string> {
  const sessionId = nanoid();
  const cookieStore = await cookies();

  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    primaryColor: user.primaryColor,
    secondaryColor: user.secondaryColor,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
    companyRole : user.companyRole,
    pin: user.pin,
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          logoUrl: user.company.logoUrl,
        }
      : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (redis) {
    // Use Redis for session storage (production/preferred)
    await redis.setex(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(sessionData)
    );
  } else {
    // Fallback: Store session data in cookie when Redis is not available (development only)
    console.warn('⚠️  Redis is not configured. Using cookie-based session storage (development only). For production, please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    
    // Store session data in a cookie (Base64 encoded to handle special characters)
    const encodedSessionData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    cookieStore.set(SESSION_DATA_COOKIE_NAME, encodedSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL,
      path: "/",
    });
  }

  return sessionId;
}


export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    console.log("No session ID found in cookies");
    return null;
  }

  if (redis) {
    // Use Redis for session storage (production/preferred)
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      console.log(`No session found in Redis for key: ${sessionKey}`);
      return null;
    }

    // Extend TTL on access
    await redis.expire(sessionKey, SESSION_TTL);

    let parsedSession: SessionUser;
    if (typeof sessionData === 'string') {
      parsedSession = JSON.parse(sessionData);
    } else {
      parsedSession = sessionData as SessionUser;
    }

    return {
      ...parsedSession,
      createdAt: new Date(parsedSession.createdAt),
      updatedAt: new Date(parsedSession.updatedAt),
    };
  } else {
    // Fallback: Get session data from cookie when Redis is not available
    const encodedSessionData = cookieStore.get(SESSION_DATA_COOKIE_NAME)?.value;
    
    if (!encodedSessionData) {
      console.log("No session data found in cookies");
      return null;
    }

    try {
      const sessionData = JSON.parse(Buffer.from(encodedSessionData, 'base64').toString('utf-8'));
      return {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        updatedAt: new Date(sessionData.updatedAt),
      };
    } catch (error) {
      console.error("Error parsing session data from cookie:", error);
      return null;
    }
  }
}


export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId && redis) {
    await redis.del(`session:${sessionId}`);
  }
  
  // Also delete the fallback cookie if it exists
  cookieStore.delete(SESSION_DATA_COOKIE_NAME);
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(SESSION_DATA_COOKIE_NAME);
}
