import { BubbleMenu } from "@tiptap/react/menus";
import type { BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";
import { isNodeSelection, useCurrentEditor } from "@tiptap/react";
import { forwardRef, useMemo } from "react";
import type { ReactNode, HTMLAttributes } from "react";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface EditorBubbleProps
  extends Optional<
      Omit<BubbleMenuPluginProps, "editor" | "element">,
      "pluginKey"
    >,
    HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
  ({ children, ...rest }, ref) => {
    const { editor: currentEditor } = useCurrentEditor();

    const shouldShow = useMemo<BubbleMenuPluginProps["shouldShow"]>(() => {
      return ({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;

        // don't show bubble menu if:
        // - the editor is not editable
        // - the selected node is an image
        // - the selection is empty
        // - the selection is a node selection (for drag handles)
        if (
          !editor.isFocused ||
          !editor.isEditable ||
          editor.isActive("image") ||
          empty ||
          isNodeSelection(selection)
        ) {
          return false;
        }
        return true;
      };
    }, []);

    if (!currentEditor) return null;

    return (
      // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
      <div ref={ref}>
        <BubbleMenu editor={currentEditor} shouldShow={shouldShow} {...rest}>
          {children}
        </BubbleMenu>
      </div>
    );
  },
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;
