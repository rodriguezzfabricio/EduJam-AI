"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Activity {
  id: string;
  type: "study_group" | "ai_chat" | "whiteboard";
  name: string;
  date: string;
  boardId?: string;
  subject?: string;
}

export default function DashboardPage() {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Protect the route - redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  
  // Fetch recent activities
  useEffect(() => {
    if (user) {
      // This would normally be an API call
      // For demo, we'll use mock data
      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "study_group",
          name: "Calculus Study Group",
          date: "2023-08-15T14:30:00Z",
          boardId: "sg1234",
          subject: "Math"
        },
        {
          id: "2",
          type: "ai_chat",
          name: "AI Chat Session",
          date: "2023-08-14T10:15:00Z"
        },
        {
          id: "3",
          type: "whiteboard",
          name: "Physics Concepts",
          date: "2023-08-13T16:45:00Z",
          boardId: "wb5678"
        }
      ];
      
      setRecentActivities(mockActivities);
      setLoading(false);
    }
  }, [user]);
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Study Groups</CardTitle>
              <CardDescription>Find or create study groups</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm">Collaborate with peers on specific subjects</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/study-groups">Browse Study Groups</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">AI Chat</CardTitle>
              <CardDescription>Get help from our AI tutor</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm">Ask questions or upload documents for analysis</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/ai-chat">Start AI Chat</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Quick Whiteboard</CardTitle>
              <CardDescription>Create a new whiteboard session</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm">Start a blank whiteboard for your ideas</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/board/${Math.random().toString(36).substring(2, 10)}`}>
                  New Whiteboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        
        {recentActivities.length === 0 ? (
          <Card className="bg-muted">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You don't have any recent activities.</p>
              <p className="text-muted-foreground text-sm mt-1">Start by creating a study group or chat with AI.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{activity.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </CardDescription>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {activity.type === "study_group" && "Study Group"}
                      {activity.type === "ai_chat" && "AI Chat"}
                      {activity.type === "whiteboard" && "Whiteboard"}
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="border-t bg-muted/50 py-2">
                  <div className="flex justify-between items-center w-full">
                    {activity.subject && (
                      <span className="text-xs text-muted-foreground">
                        Subject: {activity.subject}
                      </span>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link 
                        href={
                          activity.type === "study_group" ? `/board/${activity.boardId}` :
                          activity.type === "ai_chat" ? "/ai-chat" :
                          `/board/${activity.boardId}`
                        }
                      >
                        Continue
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 