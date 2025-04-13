import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface BookEditorProps {
  content: string;
  onSave: (content: string) => void;
  isSaving: boolean;
}

export default function BookEditor({ content, onSave, isSaving }: BookEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isContentChanged, setIsContentChanged] = useState(false);

  // Update edited content when the passed content changes (switching pages)
  useEffect(() => {
    setEditedContent(content);
    setIsContentChanged(false);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setIsContentChanged(true);
  };

  const handleSave = () => {
    onSave(editedContent);
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={editedContent}
        onChange={handleContentChange}
        placeholder="Enter content for this page..."
        className="min-h-[300px] font-mono text-sm"
      />
      
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isContentChanged || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Editing Tips:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Use HTML tags for formatting (<code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, etc.)</li>
          <li>Add line breaks with <code>&lt;br&gt;</code> tags</li>
          <li>Create lists with <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> tags</li>
        </ul>
      </div>
    </div>
  );
}
