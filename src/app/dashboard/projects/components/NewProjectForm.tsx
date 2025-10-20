"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { getStoredToken } from "@/lib/auth.utils";

interface NewProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewProjectForm({ onSuccess, onCancel }: NewProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
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

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      // Success!
      onSuccess();
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        label="Project Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Zephyron Hub, GridTime..."
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
          placeholder="What is this project about?"
          rows={4}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-gray-100 border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
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
          Create Project
        </Button>
      </div>
    </form>
  );
}
