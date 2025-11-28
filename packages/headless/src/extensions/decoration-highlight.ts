import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type DecorationHighlight_Options = {
  HTMLAttributes: Record<string, string>;
};

type DecorationHighlight_Meta =
  | { type: "set"; from: number; to: number }
  | { type: "clear" };

const DECORATION_HIGHLIGHT_PLUGIN_KEY = new PluginKey<DecorationSet>(
  "decoration-highlight",
);

function createDecoration(from: number, to: number) {
  return Decoration.inline(from, to, {
    "data-decoration-highlight": "true",
  });
}

/**
 * Plugin that provides decoration highlighting for selected text.
 *
 * Useful for showing highlighted text while the editor is not in focus,
 * for example when inserting a link or adding a comment to the editor.
 */
const decorationHighlightPlugin = new Plugin<DecorationSet>({
  key: DECORATION_HIGHLIGHT_PLUGIN_KEY,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, old) {
      const meta = tr.getMeta(DECORATION_HIGHLIGHT_PLUGIN_KEY) as
        | DecorationHighlight_Meta
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
      return DECORATION_HIGHLIGHT_PLUGIN_KEY.getState(state) ?? null;
    },
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    DecorationHighlight: {
      /**
       * Set a DecorationHighlight decoration
       */
      setDecorationHighlight: () => ReturnType;
      /**
       * Clear all DecorationHighlight decorations
       */
      clearDecorationHighlight: () => ReturnType;
    };
  }
}

export const DecorationHighlight =
  Extension.create<DecorationHighlight_Options>({
    name: "decoration-highlight",

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    addProseMirrorPlugins() {
      return [decorationHighlightPlugin];
    },

    addCommands() {
      return {
        setDecorationHighlight:
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
              state.tr.setMeta(DECORATION_HIGHLIGHT_PLUGIN_KEY, {
                type: "set",
                from,
                to,
              } satisfies DecorationHighlight_Meta),
            );

            return true;
          },
        clearDecorationHighlight:
          () =>
          ({ state, dispatch }) => {
            if (!dispatch) {
              return true;
            }

            dispatch(
              state.tr.setMeta(DECORATION_HIGHLIGHT_PLUGIN_KEY, {
                type: "clear",
              } satisfies DecorationHighlight_Meta),
            );

            return true;
          },
      };
    },
  });
