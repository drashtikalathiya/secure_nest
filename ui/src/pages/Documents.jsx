import {
  IconArrowLeft,
  IconBriefcase,
  IconFileDescription,
  IconFolder,
  IconHeart,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconShield,
  IconStar,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import AddDocumentSlider from "../components/documents/AddDocumentSlider";
import CreateFolderModal from "../components/documents/CreateFolderModal";
import DocumentGridCard from "../components/documents/DocumentGridCard";
import DocumentTable from "../components/documents/DocumentTable";
import PageHeader from "../components/common/PageHeader";
import { FOLDER_STYLE_COLORS, INITIAL_FOLDERS } from "../const/documentsData";
import { PAGE_META } from "../const/pageMeta";

const FOLDER_ICONS = {
  folder: IconFolder,
  briefcase: IconBriefcase,
  heart: IconHeart,
  shield: IconShield,
  star: IconStar,
  document: IconFileDescription,
  lock: IconShield,
};

function formatSize(sizeMb) {
  if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(2)} GB`;
  return `${(sizeMb || 0).toFixed(1)} MB`;
}

function getFolderTotals(files) {
  const totalSize = files.reduce((sum, file) => sum + (file.sizeMb || 0), 0);
  return {
    fileCount: files.length,
    totalSize,
  };
}

function getDocumentLabel(file) {
  return file?.name || file?.title || "Untitled Document";
}

function toRecentFileItems(folders) {
  return folders
    .flatMap((folder) =>
      folder.files.map((file) => ({
        ...file,
        folderId: folder.id,
        folderName: folder.name,
        folderColor: folder.color,
      })),
    )
    .slice(0, 4);
}

export default function Documents() {
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState(null);

  const [uploadSliderOpen, setUploadSliderOpen] = useState(false);
  const [recentView, setRecentView] = useState("grid");
  const [folderView, setFolderView] = useState("grid");

  const [editDocumentTarget, setEditDocumentTarget] = useState(null);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState(null);

  const pageTitle = PAGE_META["/documents"];

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId],
  );

  const recentFiles = useMemo(() => toRecentFileItems(folders), [folders]);

  const handleCreateFolder = ({
    name,
    color,
    icon,
    visibility,
    sharedWith,
  }) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      icon,
      visibility: visibility || "family",
      sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
      files: [],
    };

    setFolders((prev) => [newFolder, ...prev]);
    setCreateFolderOpen(false);
    toast.success("Folder created");
  };

  const handleDeleteFolder = () => {
    if (!deleteFolderTarget?.id) return;

    setFolders((prev) =>
      prev.filter((folder) => folder.id !== deleteFolderTarget.id),
    );

    if (selectedFolderId === deleteFolderTarget.id) {
      setSelectedFolderId(null);
    }

    setDeleteFolderTarget(null);
    toast.success("Folder deleted");
  };

  const handleUploadDocument = ({
    name,
    title,
    folderId,
    fileName,
    fileType,
    sizeMb,
    visibility,
    sharedWith,
    owner,
  }) => {
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: name || "",
      title: title || fileName || "",
      fileType,
      uploadedAt: "Just now",
      sizeMb: sizeMb || 0.1,
      visibility: visibility || "family",
      sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
      owner: owner || "alex",
    };

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id !== folderId) return folder;
        return {
          ...folder,
          files: [newDocument, ...folder.files],
        };
      }),
    );

    toast.success("Document added to folder");
  };

  const handleOpenEditDocument = (file, folderId) => {
    setEditDocumentTarget({
      folderId,
      documentId: file.id,
      file,
    });
  };

  const handleUpdateDocument = ({
    title,
    folderId,
    fileName,
    fileType,
    sizeMb,
    owner,
    visibility,
    sharedWith,
  }) => {
    if (!editDocumentTarget?.folderId || !editDocumentTarget?.documentId)
      return;

    const sourceFolderId = editDocumentTarget.folderId;
    const destinationFolderId = folderId || sourceFolderId;
    const existing = editDocumentTarget.file || {};

    const updatedDoc = {
      ...existing,
      title: title || existing.title || fileName || "",
      fileType: fileType || existing.fileType || "FILE",
      sizeMb: typeof sizeMb === "number" ? sizeMb : existing.sizeMb || 0.1,
      owner: owner || existing.owner || "alex",
      visibility: visibility || existing.visibility || "family",
      sharedWith: Array.isArray(sharedWith)
        ? sharedWith
        : Array.isArray(existing.sharedWith)
          ? existing.sharedWith
          : [],
    };

    setFolders((prev) => {
      if (sourceFolderId === destinationFolderId) {
        return prev.map((folder) => {
          if (folder.id !== sourceFolderId) return folder;
          return {
            ...folder,
            files: folder.files.map((doc) =>
              doc.id === editDocumentTarget.documentId ? updatedDoc : doc,
            ),
          };
        });
      }

      return prev.map((folder) => {
        if (folder.id === sourceFolderId) {
          return {
            ...folder,
            files: folder.files.filter(
              (doc) => doc.id !== editDocumentTarget.documentId,
            ),
          };
        }
        if (folder.id === destinationFolderId) {
          return {
            ...folder,
            files: [updatedDoc, ...folder.files],
          };
        }
        return folder;
      });
    });

    setEditDocumentTarget(null);
    toast.success("Document updated");
  };

  const handleDeleteDocument = () => {
    if (!deleteDocumentTarget?.folderId || !deleteDocumentTarget?.documentId)
      return;

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id !== deleteDocumentTarget.folderId) return folder;

        return {
          ...folder,
          files: folder.files.filter(
            (doc) => doc.id !== deleteDocumentTarget.documentId,
          ),
        };
      }),
    );

    setDeleteDocumentTarget(null);
    toast.success("Document deleted");
  };

  const openDeleteDocument = (file, folderId) => {
    setDeleteDocumentTarget({
      folderId,
      documentId: file.id,
      name: getDocumentLabel(file),
    });
  };

  const renderFolderCard = (folder) => {
    const FolderIcon = FOLDER_ICONS[folder.icon] || IconFolder;
    const styleClasses =
      FOLDER_STYLE_COLORS[folder.color] || FOLDER_STYLE_COLORS.slate;
    const totals = getFolderTotals(folder.files);

    return (
      <div
        key={folder.id}
        onClick={() => setSelectedFolderId(folder.id)}
        className="group relative rounded-2xl border cursor-pointer border-slate-800/80 bg-dashboard-card p-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
      >
        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setDeleteFolderTarget(folder);
            }}
            className="rounded p-1 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
            aria-label="Delete folder"
          >
            <IconTrash size={20} />
          </button>
        </div>

        <span
          className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${styleClasses}`}
        >
          <FolderIcon size={20} />
        </span>
        <p className="text-sm font-semibold text-slate-100">{folder.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {totals.fileCount} file{totals.fileCount === 1 ? "" : "s"} •{" "}
          {formatSize(totals.totalSize)}
        </p>
      </div>
    );
  };

  const sliderOpen = uploadSliderOpen || Boolean(editDocumentTarget);

  if (selectedFolder) {
    const totals = getFolderTotals(selectedFolder.files);

    return (
      <section className="pb-6">
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-white"
              >
                <IconArrowLeft size={20} />
                Back to Folders
              </button>
              <h1 className="mt-1 text-3xl font-semibold text-white">
                {selectedFolder.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {totals.fileCount} files • Last updated 2 hours ago
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
                <button
                  type="button"
                  onClick={() => setFolderView("grid")}
                  className={`rounded-lg p-2 transition ${
                    folderView === "grid"
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                  aria-label="Grid view"
                >
                  <IconLayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setFolderView("list")}
                  className={`rounded-lg p-2 transition ${
                    folderView === "list"
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                  aria-label="List view"
                >
                  <IconList size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setUploadSliderOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2.5 text-xs font-semibold text-white"
              >
                <IconUpload size={15} />
                Upload to this Folder
              </button>
            </div>
          </div>

          {folderView === "grid" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {selectedFolder.files.map((file) => (
                <DocumentGridCard
                  key={file.id}
                  file={file}
                  onEditClick={() =>
                    handleOpenEditDocument(file, selectedFolder.id)
                  }
                  onDeleteClick={() =>
                    openDeleteDocument(file, selectedFolder.id)
                  }
                />
              ))}

              <button
                type="button"
                onClick={() => setUploadSliderOpen(true)}
                className="flex h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-sky-500/40 bg-sky-500/5 text-sky-200 transition hover:bg-sky-500/10"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-sky-200">
                  <IconPlus size={16} />
                </span>
                <span className="mt-3 text-sm font-semibold">Add New File</span>
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <DocumentTable
                files={selectedFolder.files}
                variant="folder"
                onEditClick={(file) =>
                  handleOpenEditDocument(file, selectedFolder.id)
                }
                onDeleteClick={(file) =>
                  openDeleteDocument(file, selectedFolder.id)
                }
              />
            </div>
          )}
        </div>

        <AddDocumentSlider
          open={sliderOpen}
          onClose={() => {
            setUploadSliderOpen(false);
            setEditDocumentTarget(null);
          }}
          folderOptions={folders.map((folder) => ({
            id: folder.id,
            name: folder.name,
          }))}
          defaultFolderId={editDocumentTarget?.folderId || selectedFolder.id}
          onUpload={handleUploadDocument}
          onUpdate={handleUpdateDocument}
          mode={editDocumentTarget ? "edit" : "create"}
          initialDocument={editDocumentTarget?.file || null}
        />

        <ConfirmModal
          open={Boolean(deleteDocumentTarget)}
          title="Delete Document?"
          message={`This will permanently remove "${
            deleteDocumentTarget?.name || "this document"
          }" from this folder.`}
          confirmLabel="Delete Document"
          onConfirm={handleDeleteDocument}
          onCancel={() => setDeleteDocumentTarget(null)}
        />
      </section>
    );
  }

  return (
    <section className="pb-6">
      <PageHeader
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateFolderOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              <IconPlus size={15} />
              New Folder
            </button>
            <button
              type="button"
              onClick={() => setUploadSliderOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2 text-xs font-semibold text-white"
            >
              <IconUpload size={15} />
              Add New Document
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <button
              type="button"
              className="text-xs font-semibold text-sky-300 hover:text-sky-200"
            >
              View All
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {folders.map((folder) => renderFolderCard(folder))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Recent Documents
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRecentView("grid")}
                className={`rounded p-1.5 ${
                  recentView === "grid"
                    ? "bg-sky-500/20 text-sky-200"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
                aria-label="Grid view"
              >
                <IconLayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setRecentView("list")}
                className={`rounded p-1.5 ${
                  recentView === "list"
                    ? "bg-sky-500/20 text-sky-200"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
                aria-label="List view"
              >
                <IconList size={15} />
              </button>
            </div>
          </div>

          {recentView === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {recentFiles.map((file) => (
                <DocumentGridCard
                  key={file.id}
                  file={file}
                  onEditClick={() =>
                    handleOpenEditDocument(file, file.folderId)
                  }
                  onDeleteClick={() => openDeleteDocument(file, file.folderId)}
                />
              ))}
            </div>
          ) : (
            <DocumentTable
              files={recentFiles}
              variant="recent"
              onEditClick={(file) =>
                handleOpenEditDocument(file, file.folderId)
              }
              onDeleteClick={(file) => openDeleteDocument(file, file.folderId)}
            />
          )}
        </div>
      </div>

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <ConfirmModal
        open={Boolean(deleteFolderTarget)}
        title="Delete Folder?"
        message={`This will remove "${
          deleteFolderTarget?.name || "this folder"
        }" and all documents inside it.`}
        confirmLabel="Delete Folder"
        onConfirm={handleDeleteFolder}
        onCancel={() => setDeleteFolderTarget(null)}
      />

      <AddDocumentSlider
        open={sliderOpen}
        onClose={() => {
          setUploadSliderOpen(false);
          setEditDocumentTarget(null);
        }}
        folderOptions={folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
        }))}
        defaultFolderId={editDocumentTarget?.folderId}
        onUpload={handleUploadDocument}
        onUpdate={handleUpdateDocument}
        mode={editDocumentTarget ? "edit" : "create"}
        initialDocument={editDocumentTarget?.file || null}
      />

      <ConfirmModal
        open={Boolean(deleteDocumentTarget)}
        title="Delete Document?"
        message={`This will permanently remove "${
          deleteDocumentTarget?.name || "this document"
        }".`}
        confirmLabel="Delete Document"
        onConfirm={handleDeleteDocument}
        onCancel={() => setDeleteDocumentTarget(null)}
      />
    </section>
  );
}
