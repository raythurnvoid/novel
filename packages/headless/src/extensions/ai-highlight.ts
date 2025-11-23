import { Extension, type Command } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type AIHighlight_Options = {
  HTMLAttributes: Record<string, string>;
};

type AIHighlight_Meta =
  | { type: "set"; from: number; to: number }
  | { type: "clear" };

const AI_HIGHLIGHT_PLUGIN_KEY = new PluginKey<DecorationSet>("ai-highlight");

function createDecoration(from: number, to: number) {
  return Decoration.inline(from, to, {
    "data-ai-highlight": "true",
  });
}

const aiHighlightPlugin = new Plugin<DecorationSet>({
  key: AI_HIGHLIGHT_PLUGIN_KEY,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, old) {
      const meta = tr.getMeta(AI_HIGHLIGHT_PLUGIN_KEY) as
        | AIHighlight_Meta
        | undefined;
      const mapped = old.map(tr.mapping, tr.doc);

      if (!meta) {
        return mapped;
      }

      if (meta.type === "clear") {
        return DecorationSet.empty;
      }

      // Helper to perform range union/diff logic on the decorations
      const currentDecorations = mapped.find();
      const { from, to } = meta;

      // Find all decorations that touch or overlap the target range
      const touching = currentDecorations.filter(
        (d) => d.from <= to && d.to >= from,
      );

      // Calculate the union range of all touching decorations + new range
      const unionFrom = Math.min(from, ...touching.map((d) => d.from));
      const unionTo = Math.max(to, ...touching.map((d) => d.to));

      const others = currentDecorations.filter((d) => !touching.includes(d));

      // Only "set" remains after clear check above
      // Merge all touching decorations into one
      return DecorationSet.create(tr.doc, [
        ...others,
        createDecoration(unionFrom, unionTo),
      ]);
    },
  },
  props: {
    decorations(state) {
      return AI_HIGHLIGHT_PLUGIN_KEY.getState(state) ?? null;
    },
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    AIHighlight: {
      /**
       * Set a AIHighlight decoration
       */
      setAIHighlight: () => ReturnType;
      /**
       * Clear all AIHighlight decorations
       */
      clearAIHighlight: () => ReturnType;
    };
  }
}

export const AIHighlight = Extension.create<AIHighlight_Options>({
  name: "ai-highlight",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addProseMirrorPlugins() {
    return [aiHighlightPlugin];
  },

  addCommands() {
    return {
      setAIHighlight:
        () =>
        ({ state, dispatch }) => {
          if (!dispatch) {
            return true;
          }

          const { from, to } = state.selection;
          if (from === to) {
            return false;
          }

          dispatch(
            state.tr.setMeta(AI_HIGHLIGHT_PLUGIN_KEY, {
              type: "set",
              from,
              to,
            } satisfies AIHighlight_Meta),
          );

          return true;
        },
      clearAIHighlight:
        () =>
        ({ state, dispatch }) => {
          if (!dispatch) {
            return true;
          }

          dispatch(
            state.tr.setMeta(AI_HIGHLIGHT_PLUGIN_KEY, {
              type: "clear",
            } satisfies AIHighlight_Meta),
          );

          return true;
        },
    };
  },
});
