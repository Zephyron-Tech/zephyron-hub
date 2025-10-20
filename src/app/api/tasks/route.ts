import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * POST /api/tasks
 * 
 * Creates a new task
 * Protected endpoint - requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, projectId, status } = body;

    // Validation
    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and project are required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "todo",
        projectId: parseInt(projectId),
        assigneeId: userId,
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Task creation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}
