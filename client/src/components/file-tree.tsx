import { FileNode } from "@shared/schema";
import { File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  files: FileNode[];
  level?: number;
}

export function FileTree({ files, level = 0 }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-1">
      {files.map((file, index) => {
        const isExpanded = expandedFolders.has(file.path);
        const isFolder = file.type === "folder";

        return (
          <div key={`${file.path}-${index}`}>
            <div
              className={`flex items-center gap-2 py-1 px-2 rounded-md hover-elevate cursor-pointer ${
                level > 0 ? "ml-" + (level * 4) : ""
              }`}
              style={{ paddingLeft: `${level * 1}rem` }}
              onClick={() => isFolder && toggleFolder(file.path)}
              data-testid={`file-item-${file.name}`}
            >
              {isFolder ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                )
              ) : (
                <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-sm truncate flex-1">{file.name}</span>
              {file.size && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatFileSize(file.size)}
                </span>
              )}
            </div>
            {isFolder && isExpanded && file.children && (
              <FileTree files={file.children} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}
