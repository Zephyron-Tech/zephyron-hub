"use client";

import { useState } from "react";
import { getStoredToken } from "@/lib/auth.utils";

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

interface TaskListProps {
  initialTasks: Task[];
}

const PROJECT_COLORS: { [key: string]: string } = {
  "zephyron hub": "bg-blue-500 text-white",
  "gridtime": "bg-purple-500 text-white",
  default: "bg-gray-600 text-white",
};

function getProjectColor(projectName: string): string {
  const normalized = projectName.toLowerCase();
  return PROJECT_COLORS[normalized] || PROJECT_COLORS.default;
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());

  const handleCompleteTask = async (taskId: number) => {
    // Add to completing set for animation
    setCompletingIds((prev) => new Set(prev).add(taskId));

    try {
      const token = getStoredToken();

      if (!token) {
        console.error("No auth token found");
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "done" }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update task:", error);
        // Remove from completing set if failed
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        return;
      }

      // Wait for animation to complete before removing from list
      setTimeout(() => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 300);
    } catch (error) {
      console.error("Error completing task:", error);
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const inProgressTasks = tasks.filter((task) => task.status === "inprogress");
  const toDoTasks = tasks.filter((task) => task.status === "todo");
  const backlogTasks = tasks.filter((task) => task.status === "backlog");

  const renderTaskItem = (task: Task) => {
    const isCompleting = completingIds.has(task.id);

    return (
      <div
        key={task.id}
        className={`flex items-center gap-3 py-3 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 ${
          isCompleting ? "opacity-50 line-through" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={isCompleting}
          onChange={() => handleCompleteTask(task.id)}
          disabled={isCompleting}
          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex-1 flex items-center gap-3">
          <span className="text-gray-200">{task.title}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getProjectColor(
              task.project.name
            )}`}
          >
            {task.project.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {inProgressTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            In Progress
          </h3>
          <div className="space-y-2">{inProgressTasks.map(renderTaskItem)}</div>
        </div>
      )}

      {toDoTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            To Do
          </h3>
          <div className="space-y-2">{toDoTasks.map(renderTaskItem)}</div>
        </div>
      )}

      {backlogTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Backlog
          </h3>
          <div className="space-y-2">{backlogTasks.map(renderTaskItem)}</div>
        </div>
      )}
    </div>
  );
}
