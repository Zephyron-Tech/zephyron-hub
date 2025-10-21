import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * GET /api/tasks/my-tasks
 * 
 * Fetches all active tasks assigned to the currently logged-in user
 * Protected endpoint - requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 }
      );
    }

    // Fetch all tasks assigned to the current user (including done)
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
      },
      include: {
        project: true, // Include project data for the tag display
      },
      orderBy: [
        {
          status: "asc", // Order by status to group tasks
        },
        {
          createdAt: "desc", // Then by creation date
        },
      ],
    });

    return NextResponse.json(
      {
        tasks,
        count: tasks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tasks fetch error:", error);

    return NextResponse.json(
      { error: "An error occurred while fetching tasks" },
      { status: 500 }
    );
  }
}
