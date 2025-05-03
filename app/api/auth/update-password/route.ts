import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import { cookies } from "next/headers";
import { authService } from "@/lib/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    // 獲取當前會話，確認用戶已登入
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: '您必須登入才能更新密碼' },
        { status: 401 }
      );
    }

    // 驗證會話
    const currentUser = await authService.validateSession(authToken);

    if (!currentUser) {
      return NextResponse.json(
        { error: '會話已過期，請重新登入' },
        { status: 401 }
      );
    }
    const { currentPassword, newPassword } = await request.json();

    // 基本驗證
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "當前密碼和新密碼都是必填項" },
        { status: 400 }
      );
    }

    // 檢查新密碼長度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "新密碼長度必須至少為6個字符" },
        { status: 400 }
      );
    }

    // 獲取用戶資料以驗證當前密碼
    const userId = currentUser.id as number;
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const user = userResult[0];

    // 發送調試信息
    console.log('User data:', {
      id: user.id,
      hasPassword: !!user.password
    });

    // 確保密碼存在
    if (!user.password) {
      return NextResponse.json(
        { error: "用戶密碼資料不完整" },
        { status: 400 }
      );
    }

    // 驗證當前密碼
    const isCurrentPasswordCorrect = await compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        { error: "當前密碼不正確" },
        { status: 400 }
      );
    }

    // 對新密碼進行加密
    const newPasswordHash = await hash(newPassword, 10);

    // 更新密碼
    await db
      .update(users)
      .set({
        password: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新密碼時出錯:", error);
    return NextResponse.json(
      { error: "更新密碼時發生錯誤" },
      { status: 500 }
    );
  }
}
