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
  DragHandle as EditorDragHandle,
  type DragHandleProps as EditorDragHandleProps,
} from "./components";

// Extensions
export {
  AIHighlight,
  CodeBlockLowlight,
  HorizontalRule,
  ImageResizer,
  InputRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  Image,
  TiptapUnderline,
  Markdown,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  Link,
  UpdatedImage,
  Youtube,
  Twitter,
  Mathematics,
  CharacterCount,
  DragHandle,
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

// Store and Atoms
export { queryAtom, rangeAtom } from "./utils/atoms";
