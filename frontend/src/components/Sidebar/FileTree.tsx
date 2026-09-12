import React, { useState, useRef, useEffect } from 'react'
import {
  FolderPlus,
  FilePlus,
  RefreshCw,
  FolderOpen,
  FolderCode,
  File,
  Folder
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useEditorStore } from '../../store/useEditorStore'
import { FileTreeNode } from './FileTreeNode'

export const FileTree: React.FC = () => {
  const {
    rootPath,
    rootNode,
    isLoading,
    creatingItem,
    openFolder,
    refreshTree,
    setCreatingItem,
    createFile,
    createFolder
  } = useWorkspaceStore()

  const { openTab } = useEditorStore()

  const [rootNewName, setRootNewName] = useState('')
  const rootInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creatingItem?.parentPath === rootPath && rootInputRef.current) {
      rootInputRef.current.focus()
    }
  }, [creatingItem, rootPath])

  const handleRootCreate = async (): Promise<void> => {
    if (!rootNewName.trim() || !rootPath || !creatingItem) {
      setCreatingItem(null)
      return
    }

    if (creatingItem.type === 'file') {
      const newPath = await createFile(rootPath, rootNewName.trim())
      if (newPath) {
        await openTab(newPath)
      }
    } else {
      await createFolder(rootPath, rootNewName.trim())
    }
    setRootNewName('')
  }

  if (!rootPath || !rootNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="w-12 h-12 rounded-xl bg-bodhi-surface border border-BODHI-border flex items-center justify-center text-bodhi-accent mb-3 shadow-inner">
          <FolderCode size={24} />
        </div>
        <h4 className="text-xs font-semibold text-BODHI-text mb-1">No Folder Opened</h4>
        <p className="text-[11px] text-bodhi-muted mb-4 max-w-[180px]">
          Open a folder to start editing files and navigating your project.
        </p>
        <button
          onClick={() => openFolder()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bodhi-accent hover:brightness-110 text-black text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <FolderOpen size={13} />
          <span>Open Folder</span>
        </button>
      </div>
    )
  }

  const workspaceName = rootPath.split(/[/\\]/).pop() || rootPath

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-BODHI-sidebar text-BODHI-text">
      {/* File Tree Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-BODHI-border select-none shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-bodhi-muted truncate">
          {workspaceName}
        </span>
        <div className="flex items-center gap-0.5 text-bodhi-muted">
          <button
            onClick={() => setCreatingItem({ parentPath: rootPath, type: 'file' })}
            title="New File in Root"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <FilePlus size={13} />
          </button>
          <button
            onClick={() => setCreatingItem({ parentPath: rootPath, type: 'directory' })}
            title="New Folder in Root"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <FolderPlus size={13} />
          </button>
          <button
            onClick={() => refreshTree()}
            title="Refresh Explorer"
            className={`p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors ${
              isLoading ? 'animate-spin text-bodhi-accent' : ''
            }`}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* File Tree Nodes */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {/* Inline Create Input for Root Level */}
        {creatingItem?.parentPath === rootPath && (
          <div className="flex items-center h-7 px-3 text-xs bg-bodhi-surface/40 mb-1">
            <span className="w-4 h-4 mr-1" />
            <span className="mr-1.5 flex items-center">
              {creatingItem.type === 'file' ? (
                <File size={14} className="text-bodhi-muted" />
              ) : (
                <Folder size={14} className="text-bodhi-accent" />
              )}
            </span>
            <input
              ref={rootInputRef}
              type="text"
              placeholder={creatingItem.type === 'file' ? 'filename.ts' : 'folder name'}
              value={rootNewName}
              onChange={(e) => setRootNewName(e.target.value)}
              onBlur={handleRootCreate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRootCreate()
                if (e.key === 'Escape') setCreatingItem(null)
              }}
              className="flex-1 bg-bodhi-bg border border-bodhi-accent rounded px-1.5 py-0.5 text-xs text-white outline-none"
            />
          </div>
        )}

        {rootNode.children && rootNode.children.length > 0 ? (
          rootNode.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={0} />
          ))
        ) : (
          <div className="p-4 text-center text-xs text-bodhi-muted italic">
            Folder is empty
          </div>
        )}
      </div>
    </div>
  )
}
