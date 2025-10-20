"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { getStoredToken } from "@/lib/auth.utils";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface NewTaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewTaskForm({ onSuccess, onCancel }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("todo");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = getStoredToken();

        if (!token) {
          setError("No auth token found");
          setLoadingProjects(false);
          return;
        }

        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!projectId) {
      setError("Please select a project");
      return;
    }

    setLoading(true);

    try {
      const token = getStoredToken();

      if (!token) {
        setError("No auth token found");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          projectId: parseInt(projectId),
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      // Success!
      onSuccess();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        label="Task Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title..."
        required
        disabled={loading}
      />

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add task description..."
          rows={3}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-gray-100 border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Project
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-gray-100 border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-gray-100 border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
          className="flex-1"
        >
          Create Task
        </Button>
      </div>
    </form>
  );
}
