"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  memberCount: number;
  boardId: string;
  description: string;
}

export default function StudyGroupsPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Protect the route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  
  // Fetch study groups
  useEffect(() => {
    if (user) {
      // This would normally be an API call
      // Mock data for demo
      const mockGroups: StudyGroup[] = [
        {
          id: "sg1",
          name: "Calculus Study Group",
          subject: "Mathematics",
          memberCount: 12,
          boardId: "board1",
          description: "A group dedicated to discussing calculus concepts and solving problems together."
        },
        {
          id: "sg2",
          name: "Physics Lab Partners",
          subject: "Physics",
          memberCount: 8,
          boardId: "board2",
          description: "Collaboration group for physics lab experiments and homework."
        },
        {
          id: "sg3",
          name: "Literature Analysis",
          subject: "English",
          memberCount: 15,
          boardId: "board3",
          description: "Discussing classic and modern literature, themes, and writing techniques."
        },
        {
          id: "sg4",
          name: "Computer Science Projects",
          subject: "Computer Science",
          memberCount: 10,
          boardId: "board4",
          description: "Working on programming projects and discussing algorithms and data structures."
        }
      ];
      
      setStudyGroups(mockGroups);
      setLoading(false);
    }
  }, [user]);
  
  // Filter study groups based on search term
  const filteredGroups = studyGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
            <p className="text-muted-foreground">Join existing groups or create a new one</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            
            <Button>
              Create New Group
            </Button>
          </div>
        </div>
        
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No study groups found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? `No groups match "${searchTerm}". Try a different search term.` 
                : "Get started by creating a new study group."}
            </p>
            <Button>Create Your First Group</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{group.name}</span>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {group.subject}
                    </div>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{group.memberCount} members</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/study-groups/${group.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/board/${group.boardId}`}>
                      Join Board
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 