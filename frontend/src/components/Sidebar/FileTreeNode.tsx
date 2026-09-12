import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Plus,
  FolderPlus,
  Edit2,
  Trash2
} from 'lucide-react'
import { FileNode } from '@shared/types'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useGitStore } from '../../store/useGitStore'

interface FileTreeNodeProps {
  node: FileNode
  depth: number
}

function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode size={14} className="text-blue-400 shrink-0" />
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode size={14} className="text-amber-400 shrink-0" />
    case 'json':
      return <FileJson size={14} className="text-yellow-500 shrink-0" />
    case 'html':
    case 'htm':
      return <FileCode size={14} className="text-orange-500 shrink-0" />
    case 'css':
    case 'scss':
    case 'less':
      return <FileCode size={14} className="text-cyan-400 shrink-0" />
    case 'md':
    case 'markdown':
    case 'txt':
      return <FileText size={14} className="text-emerald-400 shrink-0" />
    case 'py':
      return <FileCode size={14} className="text-green-400 shrink-0" />
    case 'rs':
      return <FileCode size={14} className="text-orange-400 shrink-0" />
    case 'go':
      return <FileCode size={14} className="text-sky-400 shrink-0" />
    case 'csv':
    case 'sql':
      return <FileSpreadsheet size={14} className="text-emerald-500 shrink-0" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage size={14} className="text-purple-400 shrink-0" />
    default:
      return <File size={14} className="text-bodhi-muted shrink-0" />
  }
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, depth }) => {
  const {
    expandedPaths,
    selectedPath,
    creatingItem,
    renamingPath,
    toggleExpand,
    setSelectedPath,
    setCreatingItem,
    setRenamingPath,
    createFile,
    createFolder,
    renameItem,
    deleteItem
  } = useWorkspaceStore()

  const { openTab, activeTabId, pane2ActiveTabId } = useEditorStore()
  const { getFileStatus } = useGitStore()

  const gitStatus = !node.type || node.type === 'file' ? getFileStatus(node.path) : undefined

  const isDirectory = node.type === 'directory'
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = isDirectory
    ? selectedPath === node.path
    : activeTabId === node.path || pane2ActiveTabId === node.path || (selectedPath === node.path && !activeTabId)
  const isRenaming = renamingPath === node.path
  const isCreatingUnderThis = creatingItem?.parentPath === node.path

  const [renameValue, setRenameValue] = useState(node.name)
  const [newItemName, setNewItemName] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const createInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  useEffect(() => {
    if (isCreatingUnderThis && createInputRef.current) {
      createInputRef.current.focus()
    }
  }, [isCreatingUnderThis])

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setSelectedPath(node.path)
    if (isDirectory) {
      toggleExpand(node.path)
    } else {
      openTab(node.path)
    }
  }

  const handleRenameSubmit = async (): Promise<void> => {
    if (renameValue.trim() && renameValue !== node.name) {
      await renameItem(node.path, renameValue.trim())
    } else {
      setRenamingPath(null)
    }
  }

  const handleCreateSubmit = async (): Promise<void> => {
    if (!newItemName.trim() || !creatingItem) {
      setCreatingItem(null)
      return
    }

    if (creatingItem.type === 'file') {
      const newPath = await createFile(node.path, newItemName.trim())
      if (newPath) {
        await openTab(newPath)
      }
    } else {
      await createFolder(node.path, newItemName.trim())
    }
    setNewItemName('')
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    const confirmDelete = window.confirm(`Are you sure you want to delete "${node.name}"?`)
    if (confirmDelete) {
      await deleteItem(node.path)
    }
  }

  // Determine text color based on git status
  const getFileTextColor = (): string => {
    if (isSelected) return 'text-white'
    if (gitStatus === 'M') return 'text-amber-300'
    if (gitStatus === 'U' || gitStatus === '??') return 'text-emerald-400'
    if (gitStatus === 'A') return 'text-green-400'
    if (gitStatus === 'D') return 'text-rose-400'
    return 'text-gray-300'
  }

  return (
    <div className="flex flex-col select-none">
      {/* Node Row */}
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group relative flex items-center h-7 pr-2 text-xs cursor-pointer rounded transition-colors ${
          isSelected
            ? 'bg-BODHI-selection/40 text-white font-medium'
            : 'hover:bg-bodhi-surface/60 hover:text-white'
        } ${getFileTextColor()}`}
      >
        {/* Expand/Collapse Chevron for directories */}
        {isDirectory ? (
          <span className="w-4 h-4 flex items-center justify-center text-bodhi-muted group-hover:text-BODHI-text mr-1">
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span className="w-4 h-4 mr-1" />
        )}

        {/* Icon */}
        <span className="mr-1.5 flex items-center">
          {isDirectory ? (
            isExpanded ? (
              <FolderOpen size={14} className="text-bodhi-accent shrink-0" />
            ) : (
              <Folder size={14} className="text-bodhi-accent shrink-0" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </span>

        {/* Label or Inline Rename Input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setRenamingPath(null)
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-bodhi-bg border border-bodhi-accent rounded px-1 text-xs text-white outline-none"
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {/* Git Status Badge */}
        {!isRenaming && gitStatus && (
          <span
            title={
              gitStatus === 'M'
                ? 'Modified'
                : gitStatus === 'U' || gitStatus === '??'
                ? 'Untracked'
                : gitStatus === 'A'
                ? 'Added / Staged'
                : gitStatus === 'D'
                ? 'Deleted'
                : gitStatus
            }
            className={`mr-1 px-1 py-0.2 rounded font-mono text-[9px] font-bold ${
              gitStatus === 'M'
                ? 'text-amber-400 bg-amber-400/10'
                : gitStatus === 'U' || gitStatus === '??'
                ? 'text-emerald-400 bg-emerald-400/10'
                : gitStatus === 'A'
                ? 'text-green-400 bg-green-400/10'
                : gitStatus === 'D'
                ? 'text-rose-400 bg-rose-400/10'
                : 'text-bodhi-muted bg-bodhi-surface'
            }`}
          >
            {gitStatus === '??' ? 'U' : gitStatus}
          </span>
        )}

        {/* Hover Quick Actions */}
        {!isRenaming && (
          <div className="hidden group-hover:flex items-center gap-1 ml-auto bg-bodhi-panel/90 px-1 rounded">
            {isDirectory && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCreatingItem({ parentPath: node.path, type: 'file' })
                    if (!isExpanded) toggleExpand(node.path)
                  }}
                  title="New File"
                  className="p-0.5 text-bodhi-muted hover:text-white rounded"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCreatingItem({ parentPath: node.path, type: 'directory' })
                    if (!isExpanded) toggleExpand(node.path)
                  }}
                  title="New Folder"
                  className="p-0.5 text-bodhi-muted hover:text-white rounded"
                >
                  <FolderPlus size={12} />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setRenamingPath(node.path)
              }}
              title="Rename"
              className="p-0.5 text-bodhi-muted hover:text-white rounded"
            >
              <Edit2 size={11} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="p-0.5 text-bodhi-muted hover:text-red-400 rounded"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Inline Create Input for new items created under this directory */}
      {isDirectory && isExpanded && isCreatingUnderThis && (
        <div
          style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
          className="flex items-center h-7 pr-2 text-xs bg-bodhi-surface/40"
        >
          <span className="w-4 h-4 mr-1" />
          <span className="mr-1.5 flex items-center">
            {creatingItem.type === 'file' ? (
              <File size={14} className="text-bodhi-muted" />
            ) : (
              <Folder size={14} className="text-bodhi-accent" />
            )}
          </span>
          <input
            ref={createInputRef}
            type="text"
            placeholder={creatingItem.type === 'file' ? 'filename.ts' : 'folder name'}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit()
              if (e.key === 'Escape') setCreatingItem(null)
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-bodhi-bg border border-bodhi-accent rounded px-1.5 py-0.5 text-xs text-white outline-none"
          />
        </div>
      )}

      {/* Child Nodes */}
      {isDirectory && isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
