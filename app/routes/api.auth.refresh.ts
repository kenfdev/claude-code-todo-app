import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { AuthService } from "../services/auth";
import type { RefreshTokenResponse, AuthErrorResponse } from "../types/auth";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "リフレッシュトークンが必要です"),
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
    const validatedData = refreshSchema.parse(formData);

    const authService = new AuthService(context.cloudflare.env.DB);
    const tokens = await authService.refreshToken(validatedData.refreshToken);

    const response: RefreshTokenResponse = {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

      if (error.message === "INVALID_REFRESH_TOKEN") {
        statusCode = 401;
        errorCode = "INVALID_REFRESH_TOKEN";
        errorMessage = "無効なリフレッシュトークンです";
      } else if (error.message === "REFRESH_TOKEN_EXPIRED") {
        statusCode = 401;
        errorCode = "REFRESH_TOKEN_EXPIRED";
        errorMessage = "リフレッシュトークンが期限切れです";
      } else if (error.message === "USER_NOT_FOUND") {
        statusCode = 404;
        errorCode = "USER_NOT_FOUND";
        errorMessage = "ユーザーが見つかりません";
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