"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ContactForm from "@/components/contact/contact-form";

/**
 * 管理員聯絡設定頁面
 * 提供編輯聯絡頁面資訊的功能
 */
export default function AdminContactSettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin.contactSettings');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題與返回按鈕 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/${locale}/admin/dashboard`)}
            aria-label={t('backToDashboard')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        {/* 聯絡表單組件 */}
        <ContactForm />
      </div>
    </div>
  );
}
