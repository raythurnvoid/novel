import { BubbleMenu } from "@tiptap/react/menus";
import type { BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";
import { isNodeSelection, useCurrentEditor } from "@tiptap/react";
import { isTextSelection } from "@tiptap/core";
import { useMemo, type Ref } from "react";
import type { ReactNode, HTMLAttributes } from "react";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type EditorBubbleProps = Optional<
  Omit<BubbleMenuPluginProps, "editor" | "element">,
  "pluginKey"
> &
  HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<HTMLDivElement>;
    children: ReactNode;
  };

/**
 * TipTap 3.8.0's default shouldShow implementation (ported as-is).
 *
 * This includes the robust isChildOfMenu check that prevents the menu
 * from closing when clicking buttons inside it.
 */
function tiptapDefaultShouldShowImpl({
  view,
  state,
  from,
  to,
  element,
  editor,
}: Parameters<NonNullable<BubbleMenuPluginProps["shouldShow"]>>[0]): boolean {
  const { doc, selection } = state;
  const { empty } = selection;

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock =
    !doc.textBetween(from, to).length && isTextSelection(selection);

  // When clicking on a element inside the bubble menu the editor "blur" event
  // is called and the bubble menu item is focussed. In this case we should
  // consider the menu as part of the editor and keep showing the menu
  const isChildOfMenu = element.contains(document.activeElement);

  const hasEditorFocus = view.hasFocus() || isChildOfMenu;

  if (!hasEditorFocus || empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  return true;
}

/**
 * Novel's shouldShow implementation that calls TipTap's default
 * and adds Novel's additional checks on top.
 */
function novelShouldShowImpl(
  params: Parameters<NonNullable<BubbleMenuPluginProps["shouldShow"]>>[0],
): boolean {
  // First, run TipTap's default shouldShow (includes isChildOfMenu check)
  const tiptapResult = tiptapDefaultShouldShowImpl(params);
  if (!tiptapResult) {
    return false;
  }

  // Then, apply Novel's additional checks:
  // - the selected node is an image
  // - the selection is a node selection (for drag handles)
  const { editor, state } = params;
  const { selection } = state;

  if (editor.isActive("image") || isNodeSelection(selection)) {
    return false;
  }

  return true;
}

export function EditorBubble(props: EditorBubbleProps) {
  const { ref, children, ...rest } = props;
  const { editor: currentEditor } = useCurrentEditor();

  if (!currentEditor) return null;

  return (
    // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
    <div ref={ref}>
      <BubbleMenu
        editor={currentEditor}
        shouldShow={novelShouldShowImpl}
        {...rest}
      >
        {children}
      </BubbleMenu>
    </div>
  );
}

EditorBubble.tiptapDefaultShouldShowImpl = tiptapDefaultShouldShowImpl;
EditorBubble.novelShouldShowImpl = novelShouldShowImpl;

export default EditorBubble;
