import { ref } from "vue";
import { StorageService } from "@/service/storage";
import { showSuccess, showError } from "@/utils/message";
import type { FileInfo } from "@/types";

/**
 * 文件上传相关的hook
 */
export const useFileUpload = (
  currentProvider: () => string,
  currentPath: () => string,
  loadFiles: () => Promise<void>
) => {
  // 上传相关状态
  const showUploadDialog = ref(false);
  const uploadFiles = ref<File[]>([]);
  const uploadPath = ref("");
  const uploading = ref(false);
  const uploadProgress = ref(0);

  /**
   * 上传文件
   */
  const uploadFile = async () => {
    if (!uploadFiles.value || uploadFiles.value.length === 0) return;

    uploading.value = true;
    uploadProgress.value = 0;

    try {
      for (const file of uploadFiles.value) {
        const targetPath = uploadPath.value || currentPath();
        const fullPath = targetPath.endsWith("/")
          ? targetPath + file.name
          : targetPath + "/" + file.name;

        await StorageService.Upload(
          currentProvider(),
          fullPath,
          file,
          (progressEvent) => {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        );
      }

      showSuccess("文件上传成功");
      showUploadDialog.value = false;
      uploadFiles.value = [];
      uploadPath.value = "";
      await loadFiles();
    } catch (error) {
      showError("文件上传失败: " + (error as Error).message);
    } finally {
      uploading.value = false;
      uploadProgress.value = 0;
    }
  };

  return {
    // 响应式数据
    showUploadDialog,
    uploadFiles,
    uploadPath,
    uploading,
    uploadProgress,

    // 方法
    uploadFile,
  };
};

/**
 * 文件夹操作相关的hook
 */
export const useFolderOperations = (
  currentProvider: () => string,
  currentPath: () => string,
  loadFiles: () => Promise<void>
) => {
  // 新建文件夹相关状态
  const showCreateFolderDialog = ref(false);
  const newFolderName = ref("");

  /**
   * 创建文件夹
   */
  const createFolder = async () => {
    if (!newFolderName.value) return;

    try {
      const folderPath = currentPath().endsWith("/")
        ? currentPath() + newFolderName.value
        : currentPath() + "/" + newFolderName.value;

      await StorageService.Mkdir(currentProvider(), folderPath);
      showSuccess("文件夹创建成功");
      showCreateFolderDialog.value = false;
      newFolderName.value = "";
      await loadFiles();
    } catch (error) {
      showError("文件夹创建失败: " + (error as Error).message);
    }
  };

  return {
    // 响应式数据
    showCreateFolderDialog,
    newFolderName,

    // 方法
    createFolder,
  };
};

/**
 * 文件操作相关的hook
 */
export const useFileOperations = (
  currentProvider: () => string,
  loadFiles: () => Promise<void>
) => {
  // 选中的文件
  const selectedFile = ref<FileInfo | null>(null);

  // 复制相关状态
  const showCopyDialogFlag = ref(false);
  const copyDestPath = ref("");
  const copyDestProvider = ref("");

  // 移动相关状态
  const showMoveDialogFlag = ref(false);
  const moveDestPath = ref("");
  const moveDestProvider = ref("");

  /**
   * 下载文件
   */
  const downloadFile = async (file: FileInfo) => {
    try {
      await StorageService.DownloadFile(
        currentProvider(),
        file.path,
        file.name
      );
      showSuccess("文件下载开始");
    } catch (error) {
      showError("文件下载失败: " + (error as Error).message);
    }
  };

  /**
   * 显示复制对话框
   */
  const showCopyDialog = (file: FileInfo) => {
    selectedFile.value = file;
    copyDestPath.value = file.path;
    copyDestProvider.value = currentProvider();
    showCopyDialogFlag.value = true;
  };

  /**
   * 复制文件
   */
  const copyFile = async () => {
    if (!selectedFile.value) return;

    try {
      await StorageService.Cpoy(
        currentProvider(),
        selectedFile.value.path,
        copyDestProvider.value,
        copyDestPath.value
      );
      showSuccess("文件复制成功");
      showCopyDialogFlag.value = false;
      await loadFiles();
    } catch (error) {
      showError("文件复制失败: " + (error as Error).message);
    }
  };

  /**
   * 显示移动对话框
   */
  const showMoveDialog = (file: FileInfo) => {
    selectedFile.value = file;
    moveDestPath.value = file.path;
    moveDestProvider.value = currentProvider();
    showMoveDialogFlag.value = true;
  };

  /**
   * 移动文件
   */
  const moveFile = async () => {
    if (!selectedFile.value) return;

    try {
      await StorageService.Move(
        currentProvider(),
        selectedFile.value.path,
        moveDestProvider.value,
        moveDestPath.value
      );
      showSuccess("文件移动成功");
      showMoveDialogFlag.value = false;
      await loadFiles();
    } catch (error) {
      showError("文件移动失败: " + (error as Error).message);
    }
  };

  /**
   * 删除文件
   */
  const deleteFile = async (file: FileInfo) => {
    if (!confirm(`确定要删除 ${file.name} 吗？`)) return;

    try {
      await StorageService.Delete(currentProvider(), file.path);
      showSuccess("文件删除成功");
      await loadFiles();
    } catch (error) {
      showError("文件删除失败: " + (error as Error).message);
    }
  };

  return {
    // 响应式数据
    selectedFile,
    showCopyDialogFlag,
    copyDestPath,
    copyDestProvider,
    showMoveDialogFlag,
    moveDestPath,
    moveDestProvider,

    // 方法
    downloadFile,
    showCopyDialog,
    copyFile,
    showMoveDialog,
    moveFile,
    deleteFile,
  };
};
