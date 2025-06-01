"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export default function Contact() {
  const t = useTranslations('contact');
  const navT = useTranslations('navigation');
  const locale = useLocale();
  const [contactInfo, setContactInfo] = useState<{
    name?: string;
    bio?: string;
    email?: string;
    github?: string;
    linkedin?: string;
    avatarUrl?: string;
    skills?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 獲取聯絡頁面資訊
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await fetch('/api/contact');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data.contactInfo);
        } else {
          console.error("Failed to fetch contact info:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  // 構建支援 locale 的路由
  const homeUrl = `/${locale}`;
  const blogUrl = `/${locale}/blog`;
  const projectsUrl = `/${locale}/projects`;
  const aboutUrl = `/${locale}/about`;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full space-y-8 mx-auto">
          <div className="animate-pulse">
            <div className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
              <div className="h-24 w-24 md:h-32 md:w-32 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <main className="max-w-2xl w-full space-y-8 mx-auto">
        {/* Profile Section */}
        <section className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            {contactInfo?.avatarUrl ? (
              <AvatarImage src={contactInfo.avatarUrl} alt={contactInfo.name} />
            ) : null}
            <AvatarFallback>
              {contactInfo?.name
                ? contactInfo.name.charAt(0).toUpperCase()
                : "CC"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {contactInfo?.name || "CHIEN CHUAN"}
            </h1>
            <p className="text-muted-foreground max-w-md">
              {contactInfo?.bio ||
                t('defaultBio')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {contactInfo?.skills && contactInfo.skills.length > 0 ? (
              contactInfo.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">Next.js</Badge>
              </>
            )}
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-4">
          <div className="h-px w-full bg-border" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('title')}</h2>
            <p className="text-muted-foreground">
              {t('description')}
            </p>

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                <a
                  href={`mailto:${
                    contactInfo?.email || "chienchuanwww@gmail.com"
                  }`}
                  className="hover:underline"
                >
                  {contactInfo?.email || "chienchuanwww@gmail.com"}
                </a>
              </div>

              {contactInfo?.github && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
                  <a
                    href={contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {contactInfo.github.replace("https://", "")}
                  </a>
                </div>
              )}

              {contactInfo?.linkedin && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                  <a
                    href={contactInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {contactInfo.linkedin.replace("https://", "")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Links */}
        <section className="space-y-4">
          <div className="h-px w-full bg-border" />

          <div className="grid gap-2">
            <Link href={homeUrl} className="group">
              <Button variant="ghost" className="w-full justify-between">
                <span>{navT('home')}</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Button>
            </Link>

            <Link href={blogUrl} className="group">
              <Button variant="ghost" className="w-full justify-between">
                <span>{navT('blog')}</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Button>
            </Link>

            <Link href={projectsUrl} className="group">
              <Button variant="ghost" className="w-full justify-between">
                <span>{t('links.projects')}</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Button>
            </Link>

            <Link href={aboutUrl} className="group">
              <Button variant="ghost" className="w-full justify-between">
                <span>{t('links.about')}</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Button>
            </Link>
          </div>
        </section>

        {/* Social Links */}
        <section className="pt-4">
          <div className="flex justify-center gap-4 md:justify-start">
            {contactInfo?.github && (
              <Button variant="outline" size="icon" asChild>
                <a
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
            )}

            {contactInfo?.linkedin && (
              <Button variant="outline" size="icon" asChild>
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            )}

            <Button variant="outline" size="icon" asChild>
              <a
                href={`mailto:${
                  contactInfo?.email || "chienchuanwww@gmail.com"
                }`}
              >
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Chien Chuan W. All rights reserved.</p>
      </footer>
    </div>
  );
}
