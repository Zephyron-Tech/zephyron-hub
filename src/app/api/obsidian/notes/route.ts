import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import matter from "gray-matter";
import { getUserIdFromRequest } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

interface GraphFile {
  id: string;
  name: string;
  lastModifiedDateTime: string;
  "@microsoft.graph.downloadUrl": string;
}

/**
 * GET /api/obsidian/notes
 * 
 * Fetches the latest 5 Obsidian notes from OneDrive using delegated user access
 * Protected endpoint - requires authentication and Microsoft account connection
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

    // Get user's Microsoft tokens from database
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
        { 
          error: "Microsoft account not connected", 
          notes: [],
          needsAuth: true 
        },
        { status: 200 }
      );
    }

    // Check if required environment variables are present
    const clientId = process.env.AZURE_CLIENT_ID;
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const vaultPath = process.env.ONEDRIVE_VAULT_PATH;

    if (!clientId || !tenantId || !clientSecret || !vaultPath) {
      console.error("Missing required environment variables for Obsidian integration");
      return NextResponse.json(
        { error: "Obsidian integration not configured", notes: [] },
        { status: 200 }
      );
    }

    let accessToken = user.microsoftAccessToken;

    // Check if token needs refresh
    const needsRefresh = !user.microsoftTokenExpiry || 
                         new Date() >= new Date(user.microsoftTokenExpiry);

    if (needsRefresh && user.microsoftRefreshToken) {
      // Refresh the access token
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

          // Update tokens in database
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
          { 
            error: "Microsoft token expired, please reconnect", 
            notes: [],
            needsAuth: true 
          },
          { status: 200 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: "No valid access token", 
          notes: [],
          needsAuth: true 
        },
        { status: 200 }
      );
    }

    // Recursive function to fetch all .md files from folder and subfolders
    async function fetchMarkdownFiles(folderPath: string): Promise<GraphFile[]> {
      const graphUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}:/children`;
      
      const response = await fetch(graphUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(`Failed to fetch folder: ${folderPath}`);
        return [];
      }

      const data = await response.json();
      const items = data.value || [];
      
      const mdFiles: GraphFile[] = [];

      for (const item of items) {
        // Skip .obsidian folder
        if (item.name === '.obsidian') {
          continue;
        }

        // If it's a markdown file, add it to the list
        if (item.name.endsWith('.md')) {
          mdFiles.push(item);
        }
        
        // If it's a folder, recursively search it
        if (item.folder) {
          const subFolderPath = `${folderPath}/${item.name}`;
          const subFolderFiles = await fetchMarkdownFiles(subFolderPath);
          mdFiles.push(...subFolderFiles);
        }
      }

      return mdFiles;
    }

    console.log("Fetching markdown files from vault recursively...");
    
    // Fetch all markdown files from the vault
    const allMdFiles = await fetchMarkdownFiles(vaultPath);
    
    console.log(`Found ${allMdFiles.length} markdown files in total`);
    
    // Sort by lastModifiedDateTime descending
    const mdFiles = allMdFiles.sort((a, b) => 
      new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime()
    );

    // Process each file to extract frontmatter and content
    const notesWithNull = await Promise.all(
      mdFiles.slice(0, 5).map(async (file) => {
        try {
          // Download file content
          const contentResponse = await fetch(file["@microsoft.graph.downloadUrl"], {
            cache: "no-store",
          });

          if (!contentResponse.ok) {
            console.error(`Failed to download file: ${file.name}`);
            return null;
          }

          const content = await contentResponse.text();

          // Parse frontmatter using gray-matter
          const { data: frontmatter } = matter(content);

          // Extract tags from frontmatter (can be array or string)
          let tags: string[] = [];
          if (frontmatter.tags) {
            if (Array.isArray(frontmatter.tags)) {
              tags = frontmatter.tags;
            } else if (typeof frontmatter.tags === "string") {
              tags = [frontmatter.tags];
            }
          }

          return {
            id: file.id,
            title: file.name.replace(/\.md$/, ""),
            lastModified: file.lastModifiedDateTime,
            tags,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      })
    );

    // Filter out any null values from failed file processing
    const notes = notesWithNull.filter((note) => note !== null);

    return NextResponse.json(
      { notes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Obsidian notes fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching notes", notes: [] },
      { status: 200 }
    );
  }
}
