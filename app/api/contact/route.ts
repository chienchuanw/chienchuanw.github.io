import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contact-service';
import { authService } from '@/lib/services/auth-service';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 獲取聯絡頁面資訊
    const contactInfo = await contactService.getContactInfo();
    
    if (!contactInfo) {
      return NextResponse.json(
        { error: 'Contact information not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ contactInfo });
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json(
      { error: 'Server error, please try again later' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 驗證用戶是否已登入
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // 驗證會話
    const user = await authService.validateSession(authToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Session expired' }, 
        { status: 401 }
      );
    }
    
    // 獲取請求數據
    const data = await request.json();
    
    // 獲取現有聯絡頁面資訊
    let contactInfo = await contactService.getContactInfo();
    
    if (contactInfo) {
      // 更新現有資訊
      contactInfo = await contactService.updateContactInfo(contactInfo.id, data);
    } else {
      // 如果不存在，則創建新的
      contactInfo = await contactService.createContactInfo(data);
    }
    
    return NextResponse.json({ 
      contactInfo,
      message: 'Contact information updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact information:', error);
    return NextResponse.json(
      { error: 'Server error, please try again later' }, 
      { status: 500 }
    );
  }
}