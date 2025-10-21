import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * PATCH /api/tasks/[id]
 * 
 * Updates a task's status (e.g., marking it as done)
 * Protected endpoint - requires authentication
 * Only the assignee can update their own tasks
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 }
      );
    }

    // Get task ID from URL
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: "Status is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if task exists and belongs to the user first
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Security check: verify the task is assigned to the current user
    if (existingTask.assigneeId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - you can only update your own tasks" },
        { status: 403 }
      );
    }

    // Validate status value - if invalid, return current task without error
    const validStatuses = ["backlog", "todo", "inprogress", "done"];
    const normalizedStatus = status.toLowerCase();
    
    if (!validStatuses.includes(normalizedStatus)) {
      // Return the task with its current status (no update, no error)
      return NextResponse.json(
        {
          message: "Invalid status, task unchanged",
          task: {
            ...existingTask,
            project: await prisma.project.findUnique({
              where: { id: existingTask.projectId },
            }),
            assignee: await prisma.user.findUnique({
              where: { id: existingTask.assigneeId || undefined },
              select: { id: true, name: true, email: true },
            }),
          },
        },
        { status: 200 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: normalizedStatus },
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
        message: "Task updated successfully",
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Task update error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while updating the task" },
      { status: 500 }
    );
  }
}
