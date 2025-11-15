interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: false,
  quality: 0.8
};

export const compressFile = async (file: File, options: Partial<CompressionOptions> = {}): Promise<File> => {
  const opts = { ...defaultOptions, ...options };
  
  // Skip compression for already small files
  if (file.size <= opts.maxSizeMB * 1024 * 1024 * 0.5) {
    return file;
  }

  // Handle images
  if (file.type.startsWith('image/')) {
    return await compressImage(file, opts);
  }
  
  // Handle other files with generic compression
  return await compressGenericFile(file, opts);
};

const compressImage = async (file: File, options: CompressionOptions): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = calculateDimensions(img.width, img.height, options.maxWidthOrHeight);
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, options.quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const compressGenericFile = async (file: File, options: CompressionOptions): Promise<File> => {
  // For non-image files, use basic compression
  const arrayBuffer = await file.arrayBuffer();
  const compressed = await compressArrayBuffer(arrayBuffer);
  
  return new File([compressed], file.name, {
    type: file.type,
    lastModified: Date.now()
  });
};

const compressArrayBuffer = async (buffer: ArrayBuffer): Promise<Uint8Array> => {
  // Simple compression using gzip-like approach
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  writer.write(new Uint8Array(buffer));
  writer.close();
  
  const chunks: Uint8Array[] = [];
  let done = false;
  
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) chunks.push(value);
  }
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
};

const calculateDimensions = (width: number, height: number, maxSize: number) => {
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }
  
  const ratio = Math.min(maxSize / width, maxSize / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
};

export const getCompressionInfo = (originalSize: number, compressedSize: number) => {
  const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  return {
    originalSizeMB: (originalSize / 1024 / 1024).toFixed(2),
    compressedSizeMB: (compressedSize / 1024 / 1024).toFixed(2),
    compressionRatio: ratio
  };
};