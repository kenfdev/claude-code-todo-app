import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { AuthService } from "../services/auth";
import type { AuthResponse, AuthErrorResponse } from "../types/auth";

const loginSchema = z.object({
  username: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

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
    const formData = await request.json();
    const validatedData = loginSchema.parse(formData);

    const userAgent = request.headers.get("User-Agent") || undefined;
    const ipAddress = request.headers.get("CF-Connecting-IP") || 
                     request.headers.get("X-Forwarded-For") || 
                     undefined;

    const authService = new AuthService(context.cloudflare.env.DB);
    const { user, accessToken } = await authService.login(
      validatedData,
      userAgent,
      ipAddress
    );

    const response: AuthResponse = {
      success: true,
      data: {
        user,
        token: accessToken,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: AuthErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.errors[0].message,
        },
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof Error) {
      let statusCode = 500;
      let errorCode = "INTERNAL_SERVER_ERROR";
      let errorMessage = "内部サーバーエラーが発生しました";

      if (error.message === "INVALID_CREDENTIALS") {
        statusCode = 401;
        errorCode = "INVALID_CREDENTIALS";
        errorMessage = "メールアドレスまたはパスワードが正しくありません";
      }

      const response: AuthErrorResponse = {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };

      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: AuthErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "内部サーバーエラーが発生しました",
      },
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}