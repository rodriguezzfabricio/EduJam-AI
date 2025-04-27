"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studyGroupApi } from "@/services/api";
import { useWebSocket } from "@/services/websocket-provider";

const formSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters" }).max(50),
  subject: z.string().min(1, { message: "Please select a subject" }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGroupFormProps {
  defaultSubject?: string;
  onSuccess?: (groupId: string, boardId: string) => void;
  onCancel?: () => void;
}

export function CreateGroupForm({ defaultSubject, onSuccess, onCancel }: CreateGroupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { studyGroupWs } = useWebSocket();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: defaultSubject || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create group using the REST API
      const group = await studyGroupApi.createGroup(values.name, values.subject);
      
      // Connect to the WebSocket for this group
      studyGroupWs.send({
        type: "joinGroup",
        groupId: group.id,
      });
      
      // Setup WebSocket listener for successful group join
      const handleGroupJoined = (data: any) => {
        // Once joined, remove the listener and navigate
        studyGroupWs.off("groupJoined");
        
        if (onSuccess) {
          onSuccess(group.id, data.group.boardId);
        } else {
          router.push(`/board/${data.group.boardId}`);
        }
      };
      
      studyGroupWs.on("groupJoined", handleGroupJoined);
      
      // Cleanup on timeout (5 seconds)
      setTimeout(() => {
        studyGroupWs.off("groupJoined");
        setIsLoading(false);
        setError("Failed to join the created group. Please try again.");
      }, 5000);
      
    } catch (error: any) {
      setError(error.message || "Failed to create study group");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create a New Study Group</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Fill out the form below to create a new study group
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-200 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Math Study Session" 
                    disabled={isLoading} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select 
                  disabled={isLoading || !!defaultSubject} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 