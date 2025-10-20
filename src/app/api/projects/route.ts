import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * GET /api/projects
 * 
 * Fetches all projects
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

    // Fetch all projects
    const projects = await prisma.project.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        projects,
        count: projects.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Projects fetch error:", error);

    return NextResponse.json(
      { error: "An error occurred while fetching projects" },
      { status: 500 }
    );
  }
}
