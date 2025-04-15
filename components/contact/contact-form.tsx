"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import routes from "@/lib/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import AvatarUploader from "./avatar-uploader";
import Image from "next/image";

// 表單驗證模式
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Please enter a valid email address"),
  github: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().optional(),
  newSkill: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactInfo {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  skills: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // 表單設置
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      email: "",
      github: "",
      linkedin: "",
      avatarUrl: "",
      newSkill: "",
    },
    mode: "onChange", // Enable real-time validation as user types
  });

  // 獲取聯絡頁面資訊
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(routes.apiContact);

        if (!response.ok) {
          throw new Error("Failed to fetch contact information");
        }

        const data = await response.json();
        setContactInfo(data.contactInfo);
        setSkills(data.contactInfo.skills || []);

        // 設置表單預設值
        form.reset({
          name: data.contactInfo.name,
          title: data.contactInfo.title,
          bio: data.contactInfo.bio,
          email: data.contactInfo.email,
          github: data.contactInfo.github || "",
          linkedin: data.contactInfo.linkedin || "",
          avatarUrl: data.contactInfo.avatarUrl || "",
          newSkill: "",
        });
      } catch (error) {
        console.error("Error fetching contact information:", error);
        toast({
          title: "Error",
          description: "Failed to load contact information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, [form]);

  // 處理新增技能
  const handleAddSkill = () => {
    const skill = form.getValues("newSkill");
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      form.setValue("newSkill", "");
    }
  };

  // 處理移除技能
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // 處理表單提交
  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSubmitting(true);

      // 準備提交的數據
      const submitData = {
        ...data,
        skills,
      };

      // 移除不需要的字段
      delete submitData.newSkill;

      // 發送請求
      const response = await fetch(routes.apiContact, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update contact information"
        );
      }

      const result = await response.json();

      // 更新本地狀態
      setContactInfo(result.contactInfo);

      toast({
        title: "Success",
        description: "Contact information updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating contact information:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 顯示載入中狀態
  if (isLoading) {
    return (
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
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Contact Page Information</CardTitle>
        <CardDescription>
          Update the information displayed on your contact page
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your name"
                      className={
                        form.formState.errors.name
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Web Developer"
                      className={
                        form.formState.errors.title
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A short description about yourself"
                      className={
                        form.formState.errors.bio
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="your@email.com"
                      className={
                        form.formState.errors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* GitHub */}
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://github.com/yourusername"
                      className={
                        form.formState.errors.github
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LinkedIn */}
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/in/yourusername"
                      className={
                        form.formState.errors.linkedin
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar Uploader */}
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 pt-2">
                    <AvatarUploader
                      initialImage={field.value}
                      name={form.getValues("name")}
                      onImageChange={(url) => {
                        field.onChange(url);
                      }}
                    />
                    <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
                      <p className="mb-2">
                        Upload or select an avatar image for your contact page.
                      </p>
                      <p>
                        The image will be displayed as a circular avatar on your
                        contact page.
                      </p>
                      <p>
                        For best results, use a square image with dimensions of
                        at least 256x256 pixels.
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills */}
            <div className="space-y-2">
              <FormLabel>Skills</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="newSkill"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Add a skill"
                          className={
                            form.formState.errors.newSkill
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 sm:p-6">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
