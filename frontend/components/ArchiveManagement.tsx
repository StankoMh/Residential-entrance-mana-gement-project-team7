import { useState, useEffect } from 'react';
import { Upload, File, Download, Trash2, Search, Filter, Calendar, FileText, Image as ImageIcon, FileSpreadsheet, Loader2, ExternalLink, X } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';
import { documentService, DocumentMetadata, DocumentCategory, DocumentType } from '../services/documentService';
import { toast } from 'sonner';

export function ArchiveManagement() {
  const { selectedBuilding } = useSelection();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentType | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<DocumentType>('PROTOCOL');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isVisibleToResidents, setIsVisibleToResidents] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      loadDocuments();
    }
  }, [selectedBuilding]);

  const loadCategories = async () => {
    try {
      const data = await documentService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setUploadType(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDocuments = async () => {
    if (!selectedBuilding) return;

    try {
      setLoading(true);
      const data = await documentService.getDocumentsByBuilding(selectedBuilding.id);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Грешка при зареждане на документи');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    
    if (extension === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryName = (type: DocumentType): string => {
    const category = categories.find(cat => cat.id === type);
    return category?.name || type;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || doc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Проверка дали файлът е PDF
      if (file.type !== 'application/pdf') {
        alert('Моля, изберете само PDF файл');
        e.target.value = ''; // Изчистваме избора
        return;
      }
      
      setUploadFile(file);
      // Автоматично задаваме заглавие от името на файла
      if (!uploadTitle) {
        setUploadTitle(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedBuilding || !uploadTitle.trim()) {
      alert('Моля, попълнете всички задължителни полета');
      return;
    }

    setUploading(true);

    try {
      await documentService.uploadDocument(
        selectedBuilding.id,
        uploadFile,
        uploadType,
        uploadTitle,
        uploadDescription,
        isVisibleToResidents // isVisibleToResidents
      );

      toast.success('Документът е качен успешно!');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      loadDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Грешка при качване на документ');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentMetadata) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете \"${doc.title}\"?`) || !selectedBuilding) {
      return;
    }

    try {
      await documentService.deleteDocument(selectedBuilding.id, doc.id);
      toast.success('Документът е изтрит успешно!');
      loadDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Грешка при изтриване на документ');
    }
  };

  const handleDownload = async (doc: DocumentMetadata) => {
    try {
      const blob = await documentService.downloadDocument(doc.fileUrl);
      // Използваме заглавието на документа като име на файла
      let fileName = doc.title;
      // Добавяме .pdf разширение ако го няма
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
      }
      documentService.downloadAndSaveFile(blob, fileName);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error.message || 'Грешка при изтегляне на документ');
    }
  };

  const handleOpenInBrowser = (doc: DocumentMetadata) => {
    // Отваряме документа в нов таб
    window.open(doc.fileUrl, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!selectedBuilding) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Моля, изберете вход за преглед на архива
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на архив</h1>
          <p className="text-gray-600">
            Качвайте и управлявайте документи за {selectedBuilding.name}
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Качи документ
        </button>
      </div>

      {/* Филтри */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Търсене */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Търсене по име на документ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Категория */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(e.target.value ? e.target.value as DocumentType : null)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Всички категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Списък с документи */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Няма намерени документи</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Документ</th>
                  <th className="px-6 py-3 text-left text-gray-700">Категория</th>
                  <th className="px-6 py-3 text-left text-gray-700">Качен от</th>
                  <th className="px-6 py-3 text-left text-gray-700">Дата</th>
                  <th className="px-11 py-3 text-right text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.fileUrl)}
                        <span className="text-gray-900">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {getCategoryName(doc.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.uploaderName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.createdAt).toLocaleDateString('bg-BG')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Изтегли"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenInBrowser(doc)}
                          className="p-2 text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Отвори в браузър"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Изтрий"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-gray-900 text-xl">Качване на документ</h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="p-6">
              <div className="space-y-4">
                {/* Избор на категория */}
                <div>
                  <label className="block text-gray-700 mb-2">Категория</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Избор на файл */}
                <div>
                  <label className="block text-gray-700 mb-2">Файл</label>
                  {!uploadFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,application/pdf"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-1">
                          Кликнете за избор на PDF файл
                        </p>
                        <p className="text-gray-400 text-sm">Само PDF документи</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700">{uploadFile.name}</span>
                          <span className="text-sm text-gray-500">
                            ({formatFileSize(uploadFile.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Заглавие */}
                <div>
                  <label className="block text-gray-700 mb-2">Заглавие</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Видимост за жители */}
                <div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isVisibleToResidents"
                      checked={isVisibleToResidents}
                      onChange={(e) => setIsVisibleToResidents(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isVisibleToResidents" className="text-gray-700 cursor-pointer">
                      Видим за жителите
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {uploading ? 'Качване...' : 'Качи'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}