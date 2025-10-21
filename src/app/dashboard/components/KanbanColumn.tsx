"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

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

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  count: number;
  color: string;
}

const colorClasses: { [key: string]: string } = {
  gray: "bg-gray-600",
  blue: "bg-blue-600",
  yellow: "bg-yellow-600",
  green: "bg-green-600",
};

export default function KanbanColumn({
  id,
  title,
  tasks,
  count,
  color,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 flex flex-col h-full transition-all ${
        isOver ? "ring-2 ring-blue-500 bg-gray-750" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />
          <h3 className="font-semibold text-gray-200 uppercase text-sm tracking-wide">
            {title}
          </h3>
        </div>
        <span className="bg-gray-700 text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
          {count}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto min-h-[200px]"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500 text-sm">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => <KanbanCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
