import { useDropzone } from 'react-dropzone';
import { useState, useCallback } from 'react';
import AvatarEditor from 'react-avatar-editor';

export function useAvatarUploader() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const getAvatarAsBase64 = (editor: AvatarEditor): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            if (editor) {
                const canvas = editor.getImageScaledToCanvas();
                const base64Image = canvas.toDataURL();
                resolve(base64Image);
            } else {
                reject(new Error('Editor is not initialized.'));
            }
        });
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setSelectedImage(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        onDrop,
    });

    return { selectedImage, setSelectedImage, getAvatarAsBase64, getRootProps, getInputProps };
}
