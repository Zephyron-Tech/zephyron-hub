"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
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

interface KanbanBoardProps {
  initialTasks: Task[];
  onTaskUpdate?: () => void;
}

const COLUMNS = [
  { id: "backlog", title: "Backlog", color: "gray" },
  { id: "todo", title: "To Do", color: "blue" },
  { id: "inprogress", title: "In Progress", color: "yellow" },
  { id: "done", title: "Done", color: "green" },
];

export default function KanbanBoard({
  initialTasks,
  onTaskUpdate,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // Update on server
    try {
      const token = getStoredToken();
      if (!token) {
        console.error("No auth token found");
        // Revert optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === taskId ? { ...t, status: task.status } : t
          )
        );
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Notify parent component
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert optimistic update on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-400px)] min-h-[600px]">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={columnTasks}
              count={columnTasks.length}
              color={column.color}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <KanbanCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
