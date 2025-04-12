import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service";
import { userService } from "@/lib/services/user-service";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // 獲取身份驗證令牌
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    // 驗證會話
    const user = await authService.validateSession(authToken);

    if (!user) {
      // 清除無效的 cookie
      cookieStore.delete("auth_token");

      return NextResponse.json({ error: "會話已過期" }, { status: 401 });
    }

    // 獲取請求數據
    const data = await request.json();

    // 只允許更新這些字段
    const updateData = {
      email: data.email,
      fullName: data.fullName,
    };

    // 更新用戶信息
    const updatedUser = await userService.update(user.id, updateData);

    // 移除密碼後返回更新後的用戶信息
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "個人資料已更新",
    });
  } catch (error) {
    console.error("更新個人資料時發生錯誤:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
