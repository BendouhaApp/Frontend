const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

type CompressionOptions = {
  maxDimension?: number;
  quality?: number;
  minQuality?: number;
  maxSizeMB?: number;
};

const supportsWebp = () => {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
};

const readImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };

    image.src = url;
  });

const toBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const fileNameWithExtension = (name: string, extension: string) => {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  return `${base}.${extension}`;
};

const getExtensionByMime = (mime: string) => {
  switch (mime) {
    case "image/webp":
      return "webp";
    case "image/png":
      return "png";
    default:
      return "jpg";
  }
};

const getOutputType = (fileType: string) => {
  if (supportsWebp()) return "image/webp";
  if (fileType === "image/png") return "image/png";
  return "image/jpeg";
};

export const compressImageFile = async (
  file: File,
  options: CompressionOptions = {},
): Promise<File> => {
  if (typeof window === "undefined") return file;
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;

  const {
    maxDimension = 1800,
    quality = 0.84,
    minQuality = 0.55,
    maxSizeMB = 1.5,
  } = options;

  const sourceImage = await readImage(file);
  const largestSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight);
  const resizeRatio = largestSide > maxDimension ? maxDimension / largestSide : 1;
  const width = Math.max(1, Math.round(sourceImage.naturalWidth * resizeRatio));
  const height = Math.max(1, Math.round(sourceImage.naturalHeight * resizeRatio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(sourceImage, 0, 0, width, height);

  const outputType = getOutputType(file.type);
  const maxBytes = maxSizeMB * 1024 * 1024;
  let currentQuality = quality;
  let compressed = await toBlob(
    canvas,
    outputType,
    outputType === "image/png" ? undefined : currentQuality,
  );

  while (
    compressed &&
    compressed.size > maxBytes &&
    outputType !== "image/png" &&
    currentQuality > minQuality
  ) {
    currentQuality = Math.max(minQuality, Number((currentQuality - 0.08).toFixed(2)));
    compressed = await toBlob(canvas, outputType, currentQuality);
  }

  if (!compressed || compressed.size >= file.size) {
    return file;
  }

  return new File([compressed], fileNameWithExtension(file.name, getExtensionByMime(outputType)), {
    type: outputType,
    lastModified: Date.now(),
  });
};

export const compressImageBatch = async (
  files: File[],
  options?: CompressionOptions,
  onProgress?: (done: number, total: number) => void,
) => {
  const compressed: File[] = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    compressed.push(await compressImageFile(file, options));
    onProgress?.(i + 1, files.length);
  }

  return compressed;
};

