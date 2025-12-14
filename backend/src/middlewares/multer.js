import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'businessLicense') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'roomImages') {
      uploadPath += 'rooms/';
    } else {
      uploadPath += 'others/';
    }

    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);

    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    avatar: /jpeg|jpg|png|gif|webp/,
    businessLicense: /pdf|doc|docx|jpeg|jpg|png/,
    roomImages: /jpeg|jpg|png|webp/,
    default: /jpeg|jpg|png|pdf|doc|docx/,
  };

  const extension = path.extname(file.originalname).toLowerCase().slice(1);
  const fieldName = file.fieldname;

  const allowedPattern = allowedTypes[fieldName] || allowedTypes.default;

  if (allowedPattern.test(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for ${fieldName}. Allowed types: ${allowedPattern.source}`
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: fileFilter,
});

export { upload };

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'File upload error occurred.',
  });
};

export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const deleteFiles = (filePaths) => {
  const results = [];
  filePaths.forEach((filePath) => {
    results.push(deleteFile(filePath));
  });
  return results;
};

export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (res.statusCode >= 400 && req.files) {
      const filesToDelete = [];

      if (Array.isArray(req.files)) {
        filesToDelete.push(...req.files.map((file) => file.path));
      } else if (typeof req.files === 'object') {
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            filesToDelete.push(...fileArray.map((file) => file.path));
          } else {
            filesToDelete.push(fileArray.path);
          }
        });
      }

      if (req.file) {
        filesToDelete.push(req.file.path);
      }

      deleteFiles(filesToDelete);
    }

    originalSend.call(this, data);
  };
};
