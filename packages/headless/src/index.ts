// Components
export {
  EditorRoot,
  EditorContent,
  type EditorContentProps,
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  useEditor,
  type EditorInstance,
  type JSONContent,
} from "./components";

// Extensions
export {
  AIHighlight,
  removeAIHighlight,
  addAIHighlight,
  CodeBlockLowlight,
  HorizontalRule,
  ImageResizer,
  InputRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapUnderline,
  Markdown,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  TiptapLink,
  UpdatedImage,
  Youtube,
  Twitter,
  Mathematics,
  CharacterCount,
  Command,
  renderItems,
  createSuggestionItems,
  handleCommandNavigation,
  type SuggestionItem,
} from "./extensions";

// Plugins
export {
  UploadImagesPlugin,
  type UploadFn,
  type ImageUploadOptions,
  createImageUpload,
  handleImageDrop,
  handleImagePaste,
} from "./plugins";

// Utils
export {
  isValidUrl,
  getUrlFromString,
  getPrevText,
  getAllContent,
} from "./utils";

// Store and Atoms
export { queryAtom, rangeAtom } from "./utils/atoms";

// Drag Handle
export { DragHandle } from "@tiptap/extension-drag-handle-react";
export * from "@tiptap/extension-drag-handle";
