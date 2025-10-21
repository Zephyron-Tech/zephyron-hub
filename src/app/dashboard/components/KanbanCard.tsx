"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface KanbanCardProps {
  task: Task;
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

export default function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "z-50 rotate-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-gray-100 font-medium flex-1 break-words">
          {task.title}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${getProjectColor(
            task.project.name
          )}`}
        >
          {task.project.name}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
