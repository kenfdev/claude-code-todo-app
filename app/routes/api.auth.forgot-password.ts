import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { AuthService } from "../services/auth";
import type { AuthErrorResponse } from "../types/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
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
    const validatedData = forgotPasswordSchema.parse(formData);

    const authService = new AuthService(context.cloudflare.env.DB);
    
    try {
      await authService.createPasswordResetToken(validatedData.email);
    } catch (error) {
      // For security reasons, we don't reveal whether the email exists or not
      // We always return success to prevent email enumeration attacks
    }

    return new Response(JSON.stringify({
      success: true,
      message: "パスワードリセットのメールを送信しました",
    }), {
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