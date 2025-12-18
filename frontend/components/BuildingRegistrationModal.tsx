import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface BuildingRegistrationModalProps {
  onComplete: (code: string) => void;
  existingCode?: string | null;
}

export function BuildingRegistrationModal({ onComplete, existingCode }: BuildingRegistrationModalProps) {
  const [generatedCode] = useState(existingCode || '');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    // Fallback метод за копиране, който работи във всички браузъри
    const textArea = document.createElement('textarea');
    textArea.value = generatedCode;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      textArea.remove();
    }
  };

  const handleComplete = () => {
    onComplete(generatedCode);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-gray-900 mb-2">Вход регистриран успешно!</h2>
            <p className="text-gray-600">
              Вашият уникален код за достъп е генериран.
            </p>
          </div>

          {/* Generated Code */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 text-center mb-3">Код за достъп:</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white px-6 py-4 rounded-lg border-2 border-blue-300">
                <span className="text-blue-600 tracking-widest text-3xl">
                  {generatedCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Копирай код"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm text-center">Кодът е копиран!</p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-gray-900 mb-2">⚠️ Важно!</h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>• Запазете този код на сигурно място</li>
              <li>• Споделете го само с жители от вашия вход</li>
              <li>• Жителите ще използват този код за регистрация в системата</li>
              <li>• Можете да намерите кода по-късно в административния панел</li>
            </ul>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Разбрах, продължи
          </button>
        </div>
      </div>
    </div>
  );
}