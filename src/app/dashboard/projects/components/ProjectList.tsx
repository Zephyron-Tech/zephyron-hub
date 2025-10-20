"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth.utils";
import ProjectCard from "./ProjectCard";
import { Button, Modal } from "@/components/ui";
import NewProjectForm from "./NewProjectForm";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    tasks: number;
  };
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        setError("No auth token found");
        setLoading(false);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = () => {
    setIsModalOpen(false);
    setLoading(true);
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">
            Manage your projects and track their progress
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-xl">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-400 mb-6">
            Get started by creating your first project
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
          >
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <NewProjectForm
          onSuccess={handleProjectCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
