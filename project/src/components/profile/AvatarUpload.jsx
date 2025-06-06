import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import { useContext } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';

export function AvatarUpload({ currentAvatar, onAvatarChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, JPG, PNG, or WebP images.');
      }

      // Validate file size (20MB as per backend)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 20MB.');
      }

      // Create temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      
      // Pass both the file and preview URL to parent
      onAvatarChange({ 
        target: { 
          name: 'avatar', 
          value: previewUrl,
          file: file // Pass the file object
        } 
      });

    } catch (err) {
      setError(err.message || 'Failed to upload image');
      console.error('Upload error:', err);
    }
  }, [onAvatarChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false
  });

  return (
    <div className="relative group">
      <img
        src={currentAvatar || '/default-avatar.png'}
        alt="Profile"
        className="w-24 h-24 rounded-full border-4 border-purple-500 dark:border-purple-400 object-cover"
      />
      <div
        {...getRootProps()}
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
          loading ? 'opacity-100' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-white text-center p-2">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">
                {isDragActive ? 'Drop here' : 'Upload'}
              </span>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center rounded-b-full">
          {error}
        </div>
      )}
    </div>
  );
}