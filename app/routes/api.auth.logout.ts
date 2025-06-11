import { type ActionFunctionArgs } from "react-router";
import { AuthService } from "../services/auth";

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "メソッドが許可されていません",
      },
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: "MISSING_TOKEN",
          message: "認証トークンが必要です",
        },
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const authService = new AuthService(context.cloudflare.env.DB);
    
    await authService.logout(token);

    return new Response(JSON.stringify({
      success: true,
      message: "ログアウトしました",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "内部サーバーエラーが発生しました",
      },
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}