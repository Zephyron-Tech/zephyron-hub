"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth.utils";

interface ObsidianNote {
  id: string;
  title: string;
  lastModified: string;
  tags: string[];
}

interface ObsidianApiResponse {
  notes: ObsidianNote[];
  error?: string;
  needsAuth?: boolean;
}

/**
 * ObsidianWidget - Client Component
 * Displays the 5 most recently modified notes from Obsidian vault on OneDrive
 */
export default function ObsidianWidget() {
  const [notes, setNotes] = useState<ObsidianNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const token = getStoredToken();
        if (!token) {
          setIsConnected(false);
          setCheckingConnection(false);
          return;
        }

        const response = await fetch("/api/obsidian/connection-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
        }
      } catch (err) {
        console.error("Failed to check connection status:", err);
      } finally {
        setCheckingConnection(false);
      }
    }

    checkConnection();
  }, []);

  useEffect(() => {
    async function fetchNotes() {
      if (!isConnected || checkingConnection) return;

      try {
        const token = getStoredToken();

        if (!token) {
          setError("No auth token found");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/obsidian/notes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data: ObsidianApiResponse = await response.json();
        
        if (data.needsAuth) {
          setIsConnected(false);
          setError(data.error || "Microsoft účet není připojený");
        } else if (data.error) {
          setError(data.error);
        } else {
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error("Error fetching Obsidian notes:", err);
        setError("Nepodařilo se načíst poznámky");
      } finally {
        setLoading(false);
      }
    }

    if (isConnected) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [isConnected, checkingConnection]);

  const handleConnectMicrosoft = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setError("No auth token found");
        return;
      }

      const response = await fetch("/api/auth/microsoft", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate Microsoft OAuth");
      }

      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Microsoft login
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error("Error connecting Microsoft:", err);
      setError("Nepodařilo se připojit Microsoft účet");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Opravdu chcete odpojit Microsoft účet?")) {
      return;
    }

    try {
      const token = getStoredToken();
      if (!token) {
        setError("No auth token found");
        return;
      }

      const response = await fetch("/api/auth/microsoft/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      setIsConnected(false);
      setNotes([]);
      setError(null);
    } catch (err) {
      console.error("Error disconnecting Microsoft account:", err);
      setError("Nepodařilo se odpojit Microsoft účet");
    }
  };

  const handleDebug = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch("/api/obsidian/debug", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch debug info");
      }

      const data = await response.json();
      console.log("=== OneDrive Debug Info ===");
      console.log(JSON.stringify(data, null, 2));
      alert("Debug info logged to console (F12)");
    } catch (err) {
      console.error("Error fetching debug info:", err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-purple-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">
            Poslední poznámky z Obsidianu
          </h2>
        </div>
        {isConnected && (
          <div className="flex gap-2">
            <button
              onClick={handleDebug}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
              title="Debug OneDrive structure (zkontroluj konzoli)"
            >
              Debug
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              title="Odpojit Microsoft účet"
            >
              Odpojit
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Načítání poznámek...</p>
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && !checkingConnection && (
        <div className="text-center py-8">
          <p className="text-yellow-400 mb-4">
            Pro zobrazení poznámek z Obsidianu je potřeba připojit Microsoft účet.
          </p>
          <button
            onClick={handleConnectMicrosoft}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
            Připojit Microsoft účet
          </button>
        </div>
      )}

      {/* Error State */}
      {error && !loading && isConnected && (
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Notes List */}
      {!loading && !error && notes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            Nepodařilo se načíst žádné poznámky...
          </p>
        </div>
      )}

      {!loading && !error && notes.length > 0 && (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              {/* Note Title */}
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {note.title}
              </h3>

              {/* Last Modified Date */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {new Date(note.lastModified).toLocaleString("cs-CZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
