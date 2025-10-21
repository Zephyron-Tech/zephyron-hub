import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

interface DriveItem {
  id: string;
  name: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
  lastModifiedDateTime: string;
  parentReference?: {
    path: string;
  };
}

interface FolderStructure {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  lastModified: string;
  children?: FolderStructure[];
}

/**
 * GET /api/obsidian/structure
 * 
 * Fetches the folder structure of the Obsidian vault
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        microsoftAccessToken: true,
        microsoftRefreshToken: true,
        microsoftTokenExpiry: true,
      },
    });

    if (!user || !user.microsoftRefreshToken) {
      return NextResponse.json(
        { error: "Microsoft account not connected", needsAuth: true },
        { status: 200 }
      );
    }

    const vaultPath = process.env.ONEDRIVE_VAULT_PATH;
    if (!vaultPath) {
      return NextResponse.json(
        { error: "Vault path not configured" },
        { status: 500 }
      );
    }

    let accessToken = user.microsoftAccessToken;

    // Check if token needs refresh
    const needsRefresh = !user.microsoftTokenExpiry || 
                         new Date() >= new Date(user.microsoftTokenExpiry);

    if (needsRefresh && user.microsoftRefreshToken) {
      // Token refresh logic (same as in notes route)
      const clientId = process.env.AZURE_CLIENT_ID;
      const tenantId = process.env.AZURE_TENANT_ID;
      const clientSecret = process.env.AZURE_CLIENT_SECRET;

      if (!clientId || !tenantId || !clientSecret) {
        return NextResponse.json(
          { error: "OAuth not configured" },
          { status: 500 }
        );
      }

      const { ConfidentialClientApplication } = await import("@azure/msal-node");
      
      const msalConfig = {
        auth: {
          clientId,
          authority: `https://login.microsoftonline.com/${tenantId}`,
          clientSecret,
        },
      };

      const cca = new ConfidentialClientApplication(msalConfig);

      try {
        const tokenResponse = await cca.acquireTokenByRefreshToken({
          refreshToken: user.microsoftRefreshToken,
          scopes: ["Files.Read", "Files.Read.All"],
        });

        if (tokenResponse && tokenResponse.accessToken) {
          accessToken = tokenResponse.accessToken;

          await prisma.user.update({
            where: { id: userId },
            data: {
              microsoftAccessToken: tokenResponse.accessToken,
              microsoftTokenExpiry: new Date(Date.now() + (tokenResponse.expiresOn?.getTime() || 3600000)),
            },
          });
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return NextResponse.json(
          { error: "Token expired, please reconnect", needsAuth: true },
          { status: 200 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "No valid access token", needsAuth: true },
        { status: 200 }
      );
    }

    // Fetch root folder structure
    const rootUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${vaultPath}:/children`;
    
    const response = await fetch(rootUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch structure: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch vault structure: ${response.status}` },
        { status: 200 }
      );
    }

    const data = await response.json();
    const items: DriveItem[] = data.value || [];

    // Build folder structure (excluding .obsidian folder)
    const structure: FolderStructure[] = items
      .filter((item: DriveItem) => item.folder || item.file)
      .map((item: DriveItem) => ({
        id: item.id,
        name: item.name,
        type: (item.folder ? 'folder' : 'file') as 'folder' | 'file',
        path: item.parentReference?.path 
          ? `${item.parentReference.path.replace('/drive/root:', '')}/${item.name}`
          : item.name,
        lastModified: item.lastModifiedDateTime,
      }))
      .sort((a, b) => {
        // Folders first, then by name
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ structure });
  } catch (error) {
    console.error("Structure fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault structure" },
      { status: 500 }
    );
  }
}
