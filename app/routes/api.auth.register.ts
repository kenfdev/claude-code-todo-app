import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { AuthService } from "../services/auth";
import type { RegisterRequest, AuthResponse, AuthErrorResponse } from "../types/auth";

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  firstName: z.string().min(1, "名前を入力してください"),
  lastName: z.string().min(1, "苗字を入力してください"),
  phoneNumber: z.string().optional(),
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
    const validatedData = registerSchema.parse(formData);

    const authService = new AuthService(context.cloudflare.env.DB);
    const user = await authService.register(validatedData);

    // Generate token for immediate login after registration
    const accessToken = await authService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      success: true,
      data: {
        user,
        token: accessToken,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 201,
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

      if (error.message === "USER_ALREADY_EXISTS") {
        statusCode = 409;
        errorCode = "USER_ALREADY_EXISTS";
        errorMessage = "このメールアドレスは既に登録されています";
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