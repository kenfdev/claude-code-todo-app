import { AuthService } from "../services/auth";
import type { User } from "../types/auth";

export interface AuthContext {
  user: User;
  accessToken: string;
}

export async function requireAuth(request: Request, context: any): Promise<AuthContext> {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "認証が必要です" }),
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (!accessToken) {
    throw new Response(
      JSON.stringify({ error: "アクセストークンが必要です" }),
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const authService = new AuthService(context.cloudflare.env.DB);
    const user = await authService.validateSession(accessToken);
    
    if (!user) {
      throw new Response(
        JSON.stringify({ error: "無効なアクセストークンです" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return { user, accessToken };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response(
      JSON.stringify({ error: "認証に失敗しました" }),
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
}

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
}