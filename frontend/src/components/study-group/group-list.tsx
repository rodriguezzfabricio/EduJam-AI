"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { studyGroupApi } from "@/services/api";
import { useWebSocket } from "@/services/websocket-provider";

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  boardId: string;
  creatorId: string;
  createdAt: string;
  maxParticipants: number;
  currentParticipants: number;
  participantIds: string[];
  active: boolean;
  full: boolean;
}

interface GroupListProps {
  subject: string;
  onCreateNewGroup: () => void;
}

export function GroupList({ subject, onCreateNewGroup }: GroupListProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const router = useRouter();
  const { studyGroupWs } = useWebSocket();

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const data = await studyGroupApi.getGroupsBySubject(subject);
      setGroups(data);
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to load study groups");
      console.error("Error fetching study groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();

    // Listen for WebSocket updates to group list
    studyGroupWs.on("groupsListUpdate", (data: any) => {
      if (data.subject === subject) {
        setGroups(data.groups);
      }
    });

    // Listen for successful group join
    studyGroupWs.on("groupJoined", (data: any) => {
      router.push(`/board/${data.group.boardId}`);
    });

    // Listen for errors
    studyGroupWs.on("error", (data: any) => {
      setError(data.message);
      setJoiningGroupId(null);
    });

    return () => {
      studyGroupWs.off("groupsListUpdate");
      studyGroupWs.off("groupJoined");
      studyGroupWs.off("error");
    };
  }, [subject, router, studyGroupWs]);

  const handleJoinGroup = (groupId: string) => {
    setJoiningGroupId(groupId);
    studyGroupWs.send({
      type: "joinGroup",
      groupId,
    });
  };

  const renderEmptyState = () => (
    <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-medium mb-2">No Study Groups Available</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        There are no active study groups for {subject} at the moment.
      </p>
      <Button onClick={onCreateNewGroup}>Create a New Group</Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-red-500 dark:text-red-300">{error}</p>
        <Button className="mt-4" onClick={fetchGroups}>Try Again</Button>
      </div>
    );
  }

  if (groups.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{subject} Study Groups</h2>
        <Button onClick={onCreateNewGroup}>Create New Group</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant={group.full ? "destructive" : "secondary"}>
                  {group.currentParticipants}/{group.maxParticipants}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created {new Date(group.createdAt).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={group.full || joiningGroupId === group.id} 
                onClick={() => handleJoinGroup(group.id)}
              >
                {joiningGroupId === group.id ? "Joining..." : group.full ? "Full" : "Join Group"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 