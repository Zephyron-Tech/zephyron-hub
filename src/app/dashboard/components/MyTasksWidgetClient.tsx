"use client";

import { useEffect, useState } from "react";
import { getStoredToken, getCurrentUser } from "@/lib/auth.utils";
import TaskList from "./TaskList";
import { Button, Modal } from "@/components/ui";
import NewTaskForm from "./NewTaskForm";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  assigneeId: number | null;
  project: Project;
}

export default function MyTasksWidgetClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const token = getStoredToken();

      if (!token) {
        setError("No auth token found");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/tasks/my-tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    // Refresh the task list
    setLoading(true);
    fetchTasks();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          My To-Do List
        </h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Task
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Task List or Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Clean slate! All tasks are completed. ✨
          </p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <TaskList initialTasks={tasks} />
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <NewTaskForm
          onSuccess={handleTaskCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
