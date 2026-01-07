import { api, axiosInstance } from '../config/api';

// Upload response от /api/uploads
export interface UploadResponse {
  fileName: string;
  url: string;
  size: string;
  type: string;
}

// Document type enum (съгласно backend)
export type DocumentType = 'PROTOCOL' | 'RULEBOOK' | 'CONTRACT' | 'DECISION' | 'OTHER';

// Document metadata от backend
export interface DocumentMetadata {
  id: number;
  title: string;
  description: string;
  type: DocumentType;
  fileUrl: string;
  uploaderName: string;
  isVisible: boolean;
  createdAt: string;
}

// Request за създаване на документ
export interface CreateDocumentRequest {
  title: string;
  description: string;
  type: DocumentType;
  fileUrl: string;
  isVisibleToResidents: boolean;
}

// Категории за UI (mapped към DocumentType)
export interface DocumentCategory {
  id: DocumentType;
  name: string;
  description?: string;
}

class DocumentService {
  // Вземане на всички документи за вход
  async getDocumentsByBuilding(buildingId: number): Promise<DocumentMetadata[]> {
    try {
      const data = await api.get<DocumentMetadata[]>(`/buildings/${buildingId}/documents`);
      return data;
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      throw new Error(error.message || 'Грешка при зареждане на документи');
    }
  }

  // Вземане на категории за документи (статични според backend enum)
  async getCategories(): Promise<DocumentCategory[]> {
    return [
      { id: 'PROTOCOL', name: 'Протоколи', description: 'Протоколи от общи събрания' },
      { id: 'RULEBOOK', name: 'Правилници', description: 'Правилници за управление' },
      { id: 'CONTRACT', name: 'Договори', description: 'Договори с доставчици и изпълнители' },
      { id: 'DECISION', name: 'Решения', description: 'Решения на събранията' },
      { id: 'OTHER', name: 'Други', description: 'Други документи' },
    ];
  }

  // Качване на файл на сървъра (стъпка 1)
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      console.log('Uploading file to /api/uploads:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      // Използваме axiosInstance директно за FormData
      const response = await axiosInstance.post<UploadResponse>('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Важно: презапис на default application/json
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);
      
      // Покажи по-детайлно съобщение за грешката
      const errorMessage = error.data?.message || error.message || 'Грешка при качване на файл';
      const hint = error.status === 500 
        ? ' (Проверете дали backend-ът е стартиран и дали endpoint-ът /api/uploads очаква поле с име "file")'
        : '';
      
      throw new Error(errorMessage + hint);
    }
  }

  // Създаване на документ запис (стъпка 2)
  async createDocument(buildingId: number, request: CreateDocumentRequest): Promise<DocumentMetadata> {
    try {
      const data = await api.post<DocumentMetadata>(
        `/buildings/${buildingId}/documents`,
        request
      );
      return data;
    } catch (error: any) {
      console.error('Error creating document:', error);
      throw new Error(error.message || 'Грешка при създаване на документ');
    }
  }

  // Качване на документ (комбинира двете стъпки)
  async uploadDocument(
    buildingId: number, 
    file: File, 
    type: DocumentType,
    title: string,
    description: string = '',
    isVisibleToResidents: boolean = true
  ): Promise<DocumentMetadata> {
    try {
      console.log('Step 1: Uploading file...', file.name);
      
      // Стъпка 1: Качваме файла
      const uploadResponse = await this.uploadFile(file);
      
      console.log('Step 1 complete. File URL:', uploadResponse.url);
      console.log('Step 2: Creating document record...');

      // Стъпка 2: Създаваме документ запис
      const documentRequest: CreateDocumentRequest = {
        title,
        description,
        type,
        fileUrl: uploadResponse.url,
        isVisibleToResidents,
      };
      
      console.log('Document request:', documentRequest);
      
      const document = await this.createDocument(buildingId, documentRequest);
      
      console.log('Step 2 complete. Document created:', document);

      return document;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      console.error('Error details:', error.response || error);
      throw new Error(error.message || 'Грешка при качване на документ');
    }
  }

  // Изтриване на документ
  async deleteDocument(buildingId: number, documentId: number): Promise<void> {
    try {
      await api.delete<void>(`/buildings/${buildingId}/documents/${documentId}`);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw new Error(error.message || 'Грешка при изтриване на документ');
    }
  }

  // Изтегляне на документ (от fileName в URL)
  async downloadDocument(fileUrl: string): Promise<Blob> {
    try {
      // Извличаме fileName от URL-а (последната част след /)
      const fileName = fileUrl.split('/').pop();
      
      // Използваме axiosInstance директно за blob response
      const response = await axiosInstance.get(`/uploads/files/${fileName}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      throw new Error(error.message || 'Грешка при изтегляне на документ');
    }
  }

  // Helper за изтегляне и запазване на файл
  downloadAndSaveFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const documentService = new DocumentService();