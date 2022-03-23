export const convertImageUrlToDataUrl = (
  src: string,
  outputFormat: "image/png" | "image/jpeg" | "image/webp" = "image/png",
): Promise<string> => {
  // resolves when image data url is created in format "data:image/type;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const IMAGE_HEIGHT = 300;
      const PADDING_RATIO = 0.2;
      const PADDING = IMAGE_HEIGHT * PADDING_RATIO;
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const relativeWidth =
        (img.naturalWidth * IMAGE_HEIGHT) / img.naturalHeight;
      const relativeHeight =
        (img.naturalHeight * relativeWidth) / img.naturalWidth;
      img.width = relativeWidth;
      img.height = relativeHeight;
      canvas.height = relativeWidth + PADDING * 2;
      canvas.width = relativeHeight + PADDING * 2;
      ctx?.drawImage(img, PADDING, PADDING, relativeWidth, relativeHeight);
      const dataURL = canvas.toDataURL(outputFormat);
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
  });
};
