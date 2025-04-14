import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Clock, 
  User 
} from "lucide-react";

interface PostDetailsProps {
  date: string;
  category?: string;
  readingTime?: string;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
}

export function PostDetails({ 
  date, 
  category = "Uncategorized", 
  readingTime = "5 min", 
  author 
}: PostDetailsProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-sm font-medium">DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">DATE</div>
          <div className="text-sm">{date}</div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">CATEGORY</div>
          <Badge variant="secondary" className="rounded-sm font-normal">
            {category}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">READING</div>
          <div className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {readingTime}
          </div>
        </div>
        
        {author && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium">AUTHOR</div>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{author.name}</div>
                  {author.role && (
                    <div className="text-xs text-muted-foreground">{author.role}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <div className="text-sm font-medium">SHARE</div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Instagram className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}