import { axiosInstance } from '../config/api';

export interface UploadResponse {
  fileName: string;
  url: string;
  size: string;
  type: string;
}

export const uploadService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    // Валидация за PDF файлове
    if (file.type !== 'application/pdf') {
      throw new Error('Моля, качете само PDF файлове');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};