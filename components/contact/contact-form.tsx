"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import AvatarUploader from "./avatar-uploader";

// Form schema
const formSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
});

export default function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      bio: "",
      skills: [],
      avatarUrl: "",
    },
  });

  // Load contact info
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/contact-info");
        if (response.ok) {
          const data = await response.json();
          if (data.contactInfo) {
            form.reset({
              displayName: data.contactInfo.displayName || "",
              email: data.contactInfo.email || "",
              bio: data.contactInfo.bio || "",
              skills: data.contactInfo.skills || [],
              avatarUrl: data.contactInfo.avatarUrl || "",
            });
            setSkills(data.contactInfo.skills || []);
          }
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
        toast({
          title: "Error",
          description: "Failed to load contact information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchContactInfo();
  }, [form, toast]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactInfo: {
            ...values,
            skills,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact information updated successfully",
        });
      } else {
        throw new Error("Failed to update contact information");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skill removal
  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
    form.setValue("skills", newSkills);
  };

  // Handle avatar change
  const handleAvatarChange = (url: string | null) => {
    form.setValue("avatarUrl", url || "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Update your contact information and profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <AvatarUploader
                  initialImage={form.getValues("avatarUrl")}
                  onImageChange={handleAvatarChange}
                />
              </div>

              <div className="md:w-2/3 space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A short bio about yourself"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => removeSkill(index)}
                        >
                          <FontAwesomeIcon
                            icon={faTimes}
                            className="h-3 w-3"
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 mr-2 animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}