/**
 * 文件相关工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("zh-CN");
};

/**
 * 根据文件扩展名获取对应的图标
 * @param ext 文件扩展名
 * @returns 图标名称
 */
export const getFileIcon = (ext: string): string => {
  const iconMap: Record<string, string> = {
    ".pdf": "mdi-file-pdf-box",
    ".doc": "mdi-file-word",
    ".docx": "mdi-file-word",
    ".xls": "mdi-file-excel",
    ".xlsx": "mdi-file-excel",
    ".ppt": "mdi-file-powerpoint",
    ".pptx": "mdi-file-powerpoint",
    ".txt": "mdi-file-document",
    ".jpg": "mdi-file-image",
    ".jpeg": "mdi-file-image",
    ".png": "mdi-file-image",
    ".gif": "mdi-file-image",
    ".mp4": "mdi-file-video",
    ".avi": "mdi-file-video",
    ".mp3": "mdi-file-music",
    ".wav": "mdi-file-music",
    ".zip": "mdi-folder-zip",
    ".rar": "mdi-folder-zip",
  };
  return iconMap[ext.toLowerCase()] || "mdi-file";
};
