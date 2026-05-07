import fs from "fs";
import path from "path";

export const deleteFileIfExists = (filePath?: string) => {
  if (!filePath) return;

  const fullPath = path.join(process.cwd(), filePath);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.warn("Failed to delete file:", err);
    }
  }
};


