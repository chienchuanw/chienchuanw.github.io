"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/profile-form";
import PasswordForm from "@/components/profile/password-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {/* User info card skeleton with responsive design */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 w-full sm:w-auto text-center sm:text-left">
                <Skeleton className="h-5 w-40 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-60 mx-auto sm:mx-0" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid w-full grid-cols-2 gap-1 rounded-lg p-1">
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
            </div>

            {/* Tab content skeleton */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <Skeleton className="h-7 w-[200px] sm:w-[250px] mb-2" />
                <Skeleton className="h-5 w-[280px] sm:w-[350px]" />
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6">
                <Skeleton className="h-10 w-full sm:w-[120px] ml-auto" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        {user ? (
          <div className="space-y-4 sm:space-y-6">
            {/* User info card with responsive design */}
            <Card>
              <CardContent className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 p-4 sm:p-6 text-center sm:text-left">
                <Avatar className="h-16 w-16 mb-3 sm:mb-0">
                  <AvatarFallback className="text-2xl font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user.fullName || user.username}
                  </h2>
                  <p className="text-muted-foreground break-all">
                    {user.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="password" className="text-xs sm:text-sm">
                  Change Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 sm:mt-6">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="password" className="mt-4 sm:mt-6">
                <PasswordForm />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-lg mb-4">You are not logged in</p>
            <Button onClick={() => router.push(routes.login)}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
