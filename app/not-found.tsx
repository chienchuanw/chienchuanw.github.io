"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import routes from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold">找不到頁面</h2>
          <p className="text-muted-foreground">
            很抱歉，您要尋找的頁面不存在或已被移除。
          </p>
        </div>
        <div className="pt-6">
          <Button asChild size="lg" className="rounded-full">
            <Link href={routes.home}>
              <FontAwesomeIcon icon={faHome} className="mr-2 h-4 w-4" />
              返回首頁
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
