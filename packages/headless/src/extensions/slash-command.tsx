import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import { ReactRenderer, posToDOMRect } from "@tiptap/react";
import Suggestion, { type SuggestionOptions, type SuggestionProps } from "@tiptap/suggestion";
import type { RefObject } from "react";
import type { ReactNode } from "react";
import * as FloatingUI from "@floating-ui/dom";
import { EditorCommandOut } from "../components/editor-command";

// Helper function to update floating UI position (following Tiptap 3 pattern)
const updatePosition = (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  };

  FloatingUI.computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [FloatingUI.offset(8), FloatingUI.flip(), FloatingUI.shift()],
  }).then(({ x, y, strategy }) => {
    if (element) {
      element.style.width = "max-content";
      element.style.position = strategy;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
  });
};

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      // `editor` is injected in addProseMirrorPlugins, so callers must not pass it.
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      } as Omit<SuggestionOptions, "editor">,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const renderItems = (elementRef?: RefObject<Element> | null) => {
  let component: ReactRenderer | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      component = new ReactRenderer(EditorCommandOut, {
        props,
        editor: props.editor,
      });

      const { selection } = props.editor.state;

      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      if (blockType === "codeBlock") {
        return false;
      }

      if (!props.clientRect) {
        return;
      }

      component.element.style.position = "absolute";
      component.element.id = "slash-command-renderer";

      const parent = elementRef?.current || document.body;
      parent.appendChild(component.element);

      updatePosition(props.editor, component.element);
    },

    onUpdate: (props: SuggestionProps) => {
      component?.updateProps(props);

      if (!props.clientRect || !component) {
        return;
      }

      updatePosition(props.editor, component.element);
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        component?.element.remove();
        component?.destroy();
        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },

    onExit: () => {
      component?.element.remove();
      component?.destroy();
    },
  };
};

export interface SuggestionItem {
  title: string;
  description: string;
  icon: ReactNode;
  searchTerms?: string[];
  command?: (props: { editor: Editor; range: Range }) => void;
}

export const createSuggestionItems = (items: SuggestionItem[]) => items;

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command");
    if (slashCommand) {
      return true;
    }
  }
};

export { Command, renderItems };
