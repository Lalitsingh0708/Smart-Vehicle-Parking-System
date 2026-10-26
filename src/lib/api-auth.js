import { getSession } from "./auth";
import { NextResponse } from "next/server";

export async function authenticateApiRequest(requiredRole = null) {
  const session = await getSession();
  if (!session) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Authentication required to access this resource" },
        { status: 401 }
      ),
      session: null,
    };
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(session.role)
      : session.role === requiredRole;

    if (!allowed) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: "Forbidden: You do not have permission to perform this action" },
          { status: 403 }
        ),
        session,
      };
    }
  }

  return {
    authenticated: true,
    session,
    response: null,
  };
}
