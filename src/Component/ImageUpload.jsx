import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 2, 
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '' 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Memoize image URLs to prevent recreation on every render
  const imageUrls = useMemo(() => {
    return images.map(image => 
      image instanceof File 
        ? URL.createObjectURL(image) 
        : (typeof image === 'string' ? image : image.url)
    );
  }, [images]);

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  const validateFile = useCallback((file) => {
    const errors = [];
    
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Only image files are allowed (JPEG, PNG, WebP)`);
    }
    
    if (file.size > maxSizePerImage) {
      errors.push(`${file.name}: File size must be less than ${Math.round(maxSizePerImage / (1024 * 1024))}MB`);
    }
    
    return errors;
  }, [acceptedTypes, maxSizePerImage]);

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList);
    const newErrors = [];
    
    // Check total count
    if (images.length + files.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed. Please remove some existing images first.`);
      setErrors(newErrors);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    files.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        newErrors.push(...fileErrors);
      }
    });
    
    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  }, [images, maxImages, validateFile, onImagesChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
      // Clear the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [handleFiles]);

  const removeImage = useCallback((index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setErrors([]); // Clear errors when removing images
  }, [images, onImagesChange]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Single Hidden File Input - Used by both upload area and add more button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload Area - Only show when no images */}
      {images.length === 0 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          role="button"
          tabIndex={0}
          aria-label="Upload images by clicking or dragging files here"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFileDialog();
            }
          }}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxImages} images, up to {Math.round(maxSizePerImage / (1024 * 1024))}MB each
            </p>
            <p className="text-xs text-gray-500">
              Supported: JPEG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {/* Error Messages - Only show when there are actual errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => {
            const imageUrl = imageUrls[index];
              
            return (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Remove image"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                
                {/* Image Info */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  Image {index + 1}
                  {image instanceof File && (
                    <span className="block">
                      {Math.round(image.size / 1024)}KB
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add More Button */}
      {images.length > 0 && images.length < maxImages && (
        <button
          type="button"
          onClick={openFileDialog}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Add more images"
        >
          <PlusIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Add {maxImages - images.length} more image{maxImages - images.length !== 1 ? 's' : ''}
          </p>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;

const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};