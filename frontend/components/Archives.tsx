import { useState, useEffect } from 'react';
import { File, Download, Search, Filter, Calendar, FileText, Image as ImageIcon, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';
import { documentService, DocumentMetadata, DocumentCategory, DocumentType } from '../services/documentService';
import { toast } from 'sonner';

export function Archives() {
  const { selectedBuilding, selectedUnit } = useSelection();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedBuilding || selectedUnit) {
      loadDocuments();
    }
  }, [selectedBuilding, selectedUnit]);

  const loadCategories = async () => {
    try {
      const data = await documentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDocuments = async () => {
    // Жителят може да има избран само unit, мениджърът може да има избран building
    const buildingId = selectedBuilding?.id || selectedUnit?.buildingId;
    
    if (!buildingId) return;

    try {
      setLoading(true);
      const data = await documentService.getDocumentsByBuilding(buildingId);
      // Филтрираме само visible документи за жителите
      setDocuments(data.filter(doc => doc.isVisible));
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

  if (!selectedBuilding && !selectedUnit) {
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
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Архив</h1>
        <p className="text-gray-600">Преглед на документи на входа</p>
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
                  <th className="px-6 py-3 text-right text-gray-700">Действия</th>
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Отвори в браузър"
                        >
                          <ExternalLink className="w-4 h-4" />
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
    </div>
  );
}