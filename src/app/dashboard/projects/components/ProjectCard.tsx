"use client";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    tasks: number;
  };
}

interface ProjectCardProps {
  project: Project;
}

const PROJECT_COLORS: { [key: string]: string } = {
  "zephyron hub": "from-blue-500 to-blue-700",
  "gridtime": "from-purple-500 to-purple-700",
  default: "from-gray-600 to-gray-800",
};

function getProjectGradient(projectName: string): string {
  const normalized = projectName.toLowerCase();
  return PROJECT_COLORS[normalized] || PROJECT_COLORS.default;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const taskCount = project._count?.tasks || 0;
  const gradient = getProjectGradient(project.name);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${gradient} p-6 flex items-end`}>
        <h3 className="text-2xl font-bold text-white">{project.name}</h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {project.description && (
          <p className="text-gray-400 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
