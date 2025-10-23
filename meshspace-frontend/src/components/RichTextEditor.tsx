import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useState, useCallback } from 'react';
import { mentionService } from '@/services/mention.service';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "What's on your mind?", 
  maxLength = 2000,
  className = ""
}: RichTextEditorProps) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-blue-500 font-medium bg-blue-50 px-1 rounded',
        },
        suggestion: {
          items: async ({ query }: { query: string }) => {
            if (query.length < 1) return [];
            try {
              const response = await mentionService.searchUsers(query);
              return response.data || [];
            } catch (error) {
              console.error('Error fetching user suggestions:', error);
              return [];
            }
          },
          render: () => {
            let component: any;

            return {
              onStart: (props: any) => {
                // Create a wrapper object that mimics the component interface
                component = {
                  items: props.items,
                  command: props.command,
                  onKeyDown: () => {
                    // This will be handled by the React component
                    return false;
                  },
                  updateProps: (newProps: any) => {
                    component.items = newProps.items;
                    component.command = newProps.command;
                  }
                };
                return component;
              },
              onUpdate: (props: any) => {
                if (component) {
                  component.updateProps({
                    items: props.items,
                    command: props.command,
                  });
                }
              },
              onKeyDown: (props: any) => {
                return component?.onKeyDown(props) || false;
              },
              onExit: () => {
                component = null;
              },
            };
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3 border rounded-lg ${className}`,
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    // Remove link if URL is empty
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    // Add link
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setIsLinkModalOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: string; 
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0"
      title={title}
    >
      <Icon icon={icon} className="w-4 h-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar Toggle Button */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowToolbar(!showToolbar)}
          className="h-8 px-2"
        >
          <Icon icon="mdi:format-bold" className="w-4 h-4 mr-2" />
          Format
          <Icon icon={showToolbar ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 ml-2" />
        </Button>
        <div className="text-xs text-muted-foreground">
          {editor.storage.characterCount?.characters() || 0} / {maxLength} characters
        </div>
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon="mdi:format-bold"
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon="mdi:format-italic"
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon="mdi:format-strikethrough"
          title="Strikethrough"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon="mdi:format-header-1"
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon="mdi:format-header-2"
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon="mdi:format-header-3"
          title="Heading 3"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon="mdi:format-list-bulleted"
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon="mdi:format-list-numbered"
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon="mdi:format-quote-close"
          title="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon="mdi:code-braces"
          title="Code Block"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          icon="mdi:link"
          title="Add Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon="mdi:minus"
          title="Horizontal Rule"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon="mdi:undo"
          title="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon="mdi:redo"
          title="Redo"
        />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Keyboard Shortcut Info */}
      <div className="flex justify-end items-center px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
        <span className="text-xs">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to post
        </span>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={setLink}>
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
