import {
  IconArrowLeft,
  IconFolder,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import AddDocumentSlider from "../components/documents/AddDocumentSlider";
import CreateFolderModal from "../components/documents/CreateFolderModal";
import DocumentGridCard from "../components/documents/DocumentGridCard";
import DocumentPreviewModal from "../components/documents/DocumentPreviewModal";
import DocumentTable from "../components/documents/DocumentTable";
import FolderCard from "../components/documents/FolderCard";
import PageHeader from "../components/common/PageHeader";
import { PAGE_META } from "../constants/pageMeta";
import { useAuth } from "../context/AuthContext";
import { useFamilyMembers } from "../context/FamilyMembersContext";
import {
  downloadFile,
  formatUploadedAt,
  getDocumentLabel,
  getFolderTotals,
} from "../utils/documentUtils";
import {
  createDocument,
  createFolder,
  deleteDocument,
  deleteFolder,
  getDocuments,
  getRecentDocuments,
  updateFolder,
  updateDocument,
} from "../services/documentsApi";
import Spinner from "../components/common/Spinner";

function mapDocumentFile(file, memberMap = new Map()) {
  const fileUrl = file.file_url || file.url || "";
  return {
    id: file.id,
    name: file.file_name || "",
    title: file.title || file.file_name || "Untitled Document",
    fileType: file.file_type || "FILE",
    previewUrl: file.preview_url || file.thumbnail_url || fileUrl,
    fileUrl,
    category: file.category || "",
    uploadedAt: formatUploadedAt(file.created_at),
    sizeMb: typeof file.size_mb === "number" ? file.size_mb : 0,
    visibility: file.visibility || "family",
    sharedWith: Array.isArray(file.shared_with_user_ids)
      ? file.shared_with_user_ids
      : [],
    sharedWithProfiles: Array.isArray(file.shared_with_user_ids)
      ? file.shared_with_user_ids.map((id) => memberMap.get(id)).filter(Boolean)
      : [],
    created_by_user_id: file.created_by_user_id || null,
  };
}

function mapFolder(folder, memberMap) {
  const createdByProfile = memberMap?.get(folder.created_by_user_id) || null;
  return {
    id: folder.id,
    name: folder.name || "Untitled Folder",
    visibility: folder.visibility || "family",
    sharedWith: Array.isArray(folder.shared_with_user_ids)
      ? folder.shared_with_user_ids
      : [],
    created_by_user_id: folder.created_by_user_id || null,
    createdByProfile,
    files: Array.isArray(folder.files)
      ? folder.files.map((file) => mapDocumentFile(file, memberMap))
      : [],
  };
}

function toRecentFileItems(recentDocuments, memberMap) {
  return (Array.isArray(recentDocuments) ? recentDocuments : [])
    .map((file) => ({
      ...mapDocumentFile(file, memberMap),
      folderId: file.folder_id || file.folderId || file.folder?.id || null,
      folderName:
        file.folder_name || file.folderName || file.folder?.name || "",
      folderColor: file.folder?.color || null,
    }))
    .slice(0, 4);
}

export default function Documents() {
  const { user } = useAuth();
  const {
    members,
    loading: membersLoading,
    refreshMembers,
  } = useFamilyMembers();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [modulePermissions, setModulePermissions] = useState({
    view: true,
    edit: false,
    delete: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAllFolders, setShowAllFolders] = useState(false);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState(null);
  const [editFolderTarget, setEditFolderTarget] = useState(null);

  const [uploadSliderOpen, setUploadSliderOpen] = useState(false);
  const [recentView, setRecentView] = useState("grid");
  const [folderView, setFolderView] = useState("grid");

  const [editDocumentTarget, setEditDocumentTarget] = useState(null);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState(null);
  const [isDocumentSubmitting, setIsDocumentSubmitting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null);

  const pageTitle = PAGE_META["/documents"];
  const canEditDocuments = Boolean(modulePermissions.edit);
  const canExportDocuments = Boolean(user?.permission_export_data);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId],
  );

  const visibleFolders = useMemo(
    () => (showAllFolders ? folders : folders.slice(0, 4)),
    [folders, showAllFolders],
  );

  const handleOpenPreview = (file) => {
    setPreviewTarget(file || null);
  };

  const handleClosePreview = () => {
    setPreviewTarget(null);
  };

  const handleDownloadDocument = async (file) => {
    const url = file?.fileUrl || file?.previewUrl || "";
    if (!url) return;

    const ok = await downloadFile(url, file?.name || file?.title || "document");
    if (!ok) {
      toast.error("Unable to download. Opening in a new tab.");
    }
  };

  const refreshRecentDocuments = useCallback(
    async (membersInput) => {
      const sourceMembers = Array.isArray(membersInput)
        ? membersInput
        : members;
      if (!Array.isArray(sourceMembers)) return;

      const membersMap = new Map(
        sourceMembers.map((member) => [
          member.id,
          {
            id: member.id,
            name: member.name || member.email?.split("@")?.[0] || "Member",
            photoUrl: member.profile_photo_url || "",
          },
        ]),
      );

      try {
        const recentRes = await getRecentDocuments(4);
        const recentData = Array.isArray(recentRes?.data) ? recentRes.data : [];
        setRecentFiles(toRecentFileItems(recentData, membersMap));
      } catch {
        setRecentFiles([]);
      }
    },
    [members],
  );

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [documentsRes] = await Promise.all([getDocuments()]);

      const documentsData = documentsRes?.data || {};
      const rawFolders = Array.isArray(documentsData.folders)
        ? documentsData.folders
        : [];
      setModulePermissions(
        documentsData.permissions || { view: true, edit: false, delete: false },
      );

      let membersList = members;
      if (!membersList.length && !membersLoading) {
        membersList = (await refreshMembers()) || [];
      }

      const me = membersList.find((member) => member.email === user?.email);
      setCurrentUserId(me?.id || null);
      const membersMap = new Map(
        membersList.map((member) => [
          member.id,
          {
            id: member.id,
            name: member.name || member.email?.split("@")?.[0] || "Member",
            photoUrl: member.profile_photo_url || "",
          },
        ]),
      );
      setFolders(rawFolders.map((folder) => mapFolder(folder, membersMap)));
      await refreshRecentDocuments(membersList);
    } catch (error) {
      setFolders([]);
      setRecentFiles([]);
      setModulePermissions({ view: true, edit: false, delete: false });
      setCurrentUserId(null);
      toast.error(error?.message || "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  }, [
    members,
    membersLoading,
    refreshMembers,
    refreshRecentDocuments,
    user?.email,
  ]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateFolder = async ({ name, visibility, sharedWith }) => {
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    try {
      const response = await createFolder({
        name,
        visibility,
        sharedWith,
      });
      const created = response?.data;
      if (created) {
        setFolders((prev) => [mapFolder(created), ...prev]);
      }
      setCreateFolderOpen(false);
      toast.success("Folder created");
    } catch (error) {
      toast.error(error?.message || "Failed to create folder.");
    }
  };

  const handleUpdateFolder = async ({ name, visibility, sharedWith }) => {
    if (!editFolderTarget?.id) return;
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    try {
      const response = await updateFolder(editFolderTarget.id, {
        name,
        visibility,
        sharedWith,
      });
      const updated = response?.data;
      if (updated) {
        setFolders((prev) =>
          prev.map((folder) => {
            if (folder.id !== editFolderTarget.id) return folder;
            return {
              ...folder,
              name: updated.name || folder.name,
              visibility: updated.visibility || folder.visibility,
              sharedWith: Array.isArray(updated.shared_with_user_ids)
                ? updated.shared_with_user_ids
                : folder.sharedWith,
            };
          }),
        );
      }
      setEditFolderTarget(null);
      setCreateFolderOpen(false);
      toast.success("Folder updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update folder.");
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget?.id) return;
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    try {
      await deleteFolder(deleteFolderTarget.id);
      setFolders((prev) =>
        prev.filter((folder) => folder.id !== deleteFolderTarget.id),
      );

      if (selectedFolderId === deleteFolderTarget.id) {
        setSelectedFolderId(null);
      }

      setDeleteFolderTarget(null);
      toast.success("Folder deleted");
    } catch (error) {
      toast.error(error?.message || "Failed to delete folder.");
    }
  };

  const handleUploadDocument = async ({
    title,
    category,
    folderId,
    fileName,
    fileType,
    sizeMb,
    visibility,
    sharedWith,
    file,
  }) => {
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    if (isDocumentSubmitting) return;
    setIsDocumentSubmitting(true);
    try {
      const response = await createDocument({
        title,
        category,
        folderId,
        file,
        fileName,
        fileType,
        sizeMb,
        visibility,
        sharedWith,
      });
      const created = response?.data;
      if (created) {
        const mapped = mapDocumentFile(created);
        setFolders((prev) =>
          prev.map((folder) => {
            if (folder.id !== folderId) return folder;
            return {
              ...folder,
              files: [mapped, ...folder.files],
            };
          }),
        );
        refreshRecentDocuments();
      }
      setUploadSliderOpen(false);
      setEditDocumentTarget(null);
      toast.success("Document added to folder");
    } catch (error) {
      toast.error(error?.message || "Failed to upload document.");
    } finally {
      setIsDocumentSubmitting(false);
    }
  };

  const canManageFile = useCallback(
    (file) => {
      if (!canEditDocuments) return false;
      return Boolean(
        currentUserId &&
        file?.created_by_user_id &&
        file.created_by_user_id === currentUserId,
      );
    },
    [canEditDocuments, currentUserId],
  );

  const handleOpenEditDocument = (file, folderId) => {
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    if (!canManageFile(file)) {
      toast.error("You can edit only documents created by you.");
      return;
    }
    setEditDocumentTarget({
      folderId,
      documentId: file.id,
      file,
    });
  };

  const handleUpdateDocument = async ({
    title,
    folderId,
    fileName,
    fileType,
    sizeMb,
    visibility,
    sharedWith,
    category,
    file,
  }) => {
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    if (!editDocumentTarget?.folderId || !editDocumentTarget?.documentId)
      return;
    if (!canManageFile(editDocumentTarget.file)) {
      toast.error("You can edit only documents created by you.");
      return;
    }
    if (isDocumentSubmitting) return;
    setIsDocumentSubmitting(true);

    try {
      const response = await updateDocument(editDocumentTarget.documentId, {
        title,
        folderId,
        file,
        fileName,
        fileType,
        sizeMb,
        visibility,
        sharedWith,
        category,
      });
      const updated = response?.data;
      if (!updated) return;

      const mapped = mapDocumentFile(updated);
      const sourceFolderId = editDocumentTarget.folderId;
      const destinationFolderId =
        updated.folder_id || folderId || sourceFolderId;

      setFolders((prev) => {
        if (sourceFolderId === destinationFolderId) {
          return prev.map((folder) => {
            if (folder.id !== sourceFolderId) return folder;
            return {
              ...folder,
              files: folder.files.map((doc) =>
                doc.id === editDocumentTarget.documentId ? mapped : doc,
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
              files: [mapped, ...folder.files],
            };
          }
          return folder;
        });
      });

      setEditDocumentTarget(null);
      setUploadSliderOpen(false);
      refreshRecentDocuments();
      toast.success("Document updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update document.");
    } finally {
      setIsDocumentSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocumentTarget?.folderId || !deleteDocumentTarget?.documentId)
      return;
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    if (
      deleteDocumentTarget?.file &&
      !canManageFile(deleteDocumentTarget.file)
    ) {
      toast.error("You can delete only documents created by you.");
      return;
    }

    try {
      await deleteDocument(deleteDocumentTarget.documentId);
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
      refreshRecentDocuments();
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error?.message || "Failed to delete document.");
    }
  };

  const openDeleteDocument = (file, folderId) => {
    if (!canEditDocuments) {
      toast.error("You do not have permission to edit documents.");
      return;
    }
    if (!canManageFile(file)) {
      toast.error("You can delete only documents created by you.");
      return;
    }
    setDeleteDocumentTarget({
      folderId,
      documentId: file.id,
      name: getDocumentLabel(file),
      file,
    });
  };

  const sliderOpen = uploadSliderOpen || Boolean(editDocumentTarget);

  let pageContent = null;

  if (selectedFolder) {
    const totals = getFolderTotals(selectedFolder.files);

    pageContent = (
      <section className="pb-6">
        <div className="mt-6">
          <div className="">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-white"
              >
                <IconArrowLeft size={20} />
                Back to Folders
              </button>
              <div className="flex gap-2">
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

                {canEditDocuments ? (
                  <button
                    type="button"
                    onClick={() => setUploadSliderOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    <IconUpload size={15} />
                    Upload to this Folder
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <h1 className="mt-1 text-3xl font-semibold text-white">
                {selectedFolder.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {totals.fileCount} files • Last updated 2 hours ago
              </p>
            </div>
          </div>

          {folderView === "grid" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {selectedFolder.files.map((file) => (
                <DocumentGridCard
                  key={file.id}
                  file={file}
                  onPreview={handleOpenPreview}
                  onDownloadClick={() => handleDownloadDocument(file)}
                  canDownload={canExportDocuments}
                  onEditClick={
                    canEditDocuments && canManageFile(file)
                      ? () => handleOpenEditDocument(file, selectedFolder.id)
                      : null
                  }
                  onDeleteClick={
                    canEditDocuments && canManageFile(file)
                      ? () => openDeleteDocument(file, selectedFolder.id)
                      : null
                  }
                />
              ))}

              {canEditDocuments ? (
                <button
                  type="button"
                  onClick={() => setUploadSliderOpen(true)}
                  className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-sky-500/40 bg-sky-500/5 text-sky-200 transition hover:bg-sky-500/10"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-sky-200">
                    <IconPlus size={16} />
                  </span>
                  <span className="mt-3 text-sm font-semibold">
                    Add New File
                  </span>
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-5">
              <DocumentTable
                files={selectedFolder.files}
                variant="folder"
                onPreview={handleOpenPreview}
                onEditClick={
                  canEditDocuments
                    ? (file) => handleOpenEditDocument(file, selectedFolder.id)
                    : null
                }
                onDeleteClick={
                  canEditDocuments
                    ? (file) => openDeleteDocument(file, selectedFolder.id)
                    : null
                }
                canManageFile={canManageFile}
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
          isSubmitting={isDocumentSubmitting}
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
  } else {
    pageContent = (
      <section className="pb-6">
        <PageHeader
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
          right={
            canEditDocuments ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditFolderTarget(null);
                    setCreateFolderOpen(true);
                  }}
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
            ) : null
          }
        />

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Categories</h2>
              {folders.length > 4 ? (
                <button
                  type="button"
                  onClick={() => setShowAllFolders((prev) => !prev)}
                  className="text-xs font-semibold text-sky-300 hover:text-sky-200"
                >
                  {showAllFolders ? "Show Less" : "View All"}
                </button>
              ) : null}
            </div>
            {isLoading ? (
              <div className="px-4 py-10 text-slate-400">
                <div className="flex items-center justify-center">
                  <Spinner size={30} />
                </div>
              </div>
            ) : folders.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {visibleFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    canEdit={canEditDocuments}
                    currentUserId={currentUserId}
                    onSelect={(folderId) => setSelectedFolderId(folderId)}
                    onEdit={(selected) => {
                      setEditFolderTarget(selected);
                      setCreateFolderOpen(true);
                    }}
                    onDelete={(selected) => setDeleteFolderTarget(selected)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={IconFolder}
                title="No folders yet"
                description="Organize family files into folders so they are easy to find and share."
                actionLabel="Create Folder"
                canAction={canEditDocuments}
                onAction={() => {
                  setEditFolderTarget(null);
                  setCreateFolderOpen(true);
                }}
              />
            )}
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

            {!isLoading && recentFiles.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 text-sm text-slate-400">
                No recent documents yet.
              </div>
            ) : recentView === "grid" ? (
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {recentFiles.map((file) => (
                  <DocumentGridCard
                    key={file.id}
                    file={file}
                    onPreview={handleOpenPreview}
                    onDownloadClick={() => handleDownloadDocument(file)}
                    canDownload={canExportDocuments}
                    onEditClick={
                      canEditDocuments && canManageFile(file)
                        ? () => handleOpenEditDocument(file, file.folderId)
                        : null
                    }
                    onDeleteClick={
                      canEditDocuments && canManageFile(file)
                        ? () => openDeleteDocument(file, file.folderId)
                        : null
                    }
                  />
                ))}
              </div>
            ) : (
              <DocumentTable
                files={recentFiles}
                variant="recent"
                onPreview={handleOpenPreview}
                onEditClick={
                  canEditDocuments
                    ? (file) => handleOpenEditDocument(file, file.folderId)
                    : null
                }
                onDeleteClick={
                  canEditDocuments
                    ? (file) => openDeleteDocument(file, file.folderId)
                    : null
                }
                canManageFile={canManageFile}
              />
            )}
          </div>
        </div>

        <CreateFolderModal
          open={createFolderOpen}
          onClose={() => {
            setCreateFolderOpen(false);
            setEditFolderTarget(null);
          }}
          onCreate={handleCreateFolder}
          onUpdate={handleUpdateFolder}
          mode={editFolderTarget ? "edit" : "create"}
          initialFolder={editFolderTarget}
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
          isSubmitting={isDocumentSubmitting}
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

  return (
    <>
      {pageContent}
      <DocumentPreviewModal
        open={Boolean(previewTarget)}
        file={previewTarget}
        onClose={handleClosePreview}
        onDownload={handleDownloadDocument}
        canDownload={canExportDocuments}
      />
    </>
  );
}
