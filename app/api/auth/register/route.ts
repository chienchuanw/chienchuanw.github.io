import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 返回 403 禁止訪問錯誤
  return NextResponse.json(
    { error: '註冊功能已被停用，請聯絡管理員創建帳戶' },
    { status: 403 }
  );
}
