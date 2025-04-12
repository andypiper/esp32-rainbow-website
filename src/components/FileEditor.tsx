import { useState, useEffect } from 'react';

interface FileEditorProps {
  filename: string;
  content: string;
  onSave: (content: string) => Promise<any>;
  onCancel: () => void;
  readOnly?: boolean;
}

const FileEditor = ({ filename, content, onSave, onCancel, readOnly = false }: FileEditorProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Update edited content when the original content changes
  useEffect(() => {
    setEditedContent(content);
    setIsDirty(false);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (readOnly) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await onSave(editedContent);
      setIsDirty(false);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Implement Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && !readOnly) {
      e.preventDefault();
      handleSave();
    }
    
    // Support tab key in the editor
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert a tab at the cursor position
      setEditedContent(
        editedContent.substring(0, start) + '  ' + editedContent.substring(end)
      );
      
      // Move the cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      
      setIsDirty(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 p-2 bg-gray-800 rounded">
        <div className="text-lg font-medium">
          {readOnly ? 'Viewing' : 'Editing'}: {filename}
        </div>
        <div className="flex space-x-2">
          {!readOnly && (
            <button 
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`px-4 py-1 rounded ${
                isSaving || !isDirty 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button 
            onClick={onCancel}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 mb-2 bg-red-900 text-white rounded">
          {error}
        </div>
      )}

      <textarea
        value={editedContent}
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        className="flex-grow p-4 bg-gray-900 text-white font-mono rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ minHeight: '300px' }}
        spellCheck={false}
        readOnly={readOnly}
      />

      {isDirty && !readOnly && (
        <div className="p-2 mt-2 bg-yellow-900 text-white rounded text-center">
          You have unsaved changes
        </div>
      )}
    </div>
  );
};

export default FileEditor; 