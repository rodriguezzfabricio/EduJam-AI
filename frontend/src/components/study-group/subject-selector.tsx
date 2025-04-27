"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { studyGroupApi } from "@/services/api";

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string) => void;
}

export function SubjectSelector({ onSubjectSelect }: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const data = await studyGroupApi.getSubjects();
        setSubjects(data);
      } catch (error: any) {
        setError(error.message || "Failed to load subjects");
        console.error("Error fetching subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Subject icons (could be replaced with actual SVG icons or images)
  const subjectIcons: Record<string, string> = {
    "Math": "📐",
    "English": "📚",
    "Science": "🔬",
    "Technology": "💻",
    "Social Studies": "🌎",
  };

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
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card 
          key={subject} 
          className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-500"
          onClick={() => onSubjectSelect(subject)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">{subjectIcons[subject] || "📘"}</span>
              {subject}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find study groups for {subject}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 