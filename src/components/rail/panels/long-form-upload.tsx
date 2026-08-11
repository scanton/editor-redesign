"use client";

import { AnimatePresence, motion } from "motion/react";
import { Camera, FileText, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Section, inputClass } from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerChild } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/** Formats we read directly, no server round-trip. */
const PLAIN_TEXT = /\.(txt|md|markdown|text)$/i;

const TEXT_ACCEPT =
  ".txt,.text,.md,.markdown,.rtf,.doc,.docx,.pages,text/plain,text/markdown," +
  "application/rtf,text/rtf,application/msword," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Source = {
  id: "camera" | "image" | "file";
  label: string;
  hint: string;
  icon: typeof Camera;
  accept: string;
  capture?: "environment";
};

const SOURCES: Source[] = [
  {
    id: "camera",
    label: "Take a photo",
    hint: "Opens the camera on phone and iPad",
    icon: Camera,
    accept: "image/*",
    capture: "environment",
  },
  {
    id: "image",
    label: "Upload an image",
    hint: "A scan or photo of handwriting or print",
    icon: ImagePlus,
    accept: "image/*",
  },
  {
    id: "file",
    label: "Upload a document",
    hint: "txt, md, rtf, doc, docx",
    icon: FileText,
    accept: TEXT_ACCEPT,
  },
];

/**
 * Bring your own long-form text: photograph it, scan it, or hand over a
 * document. Plain text is read here in the browser; anything else (OCR, rtf,
 * docx) is a server job, so it's stubbed with clearly-labelled output.
 */
export function LongFormUpload() {
  const uploadedText = useEditorStore((s) => s.longForm.uploadedText);
  const fileName = useEditorStore((s) => s.longForm.fileName);
  const setLongForm = useEditorStore((s) => s.setLongForm);

  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [stubbed, setStubbed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Object URLs leak until revoked.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const accept = (file: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
    setLongForm({ fileName: file.name });
    setReading(true);

    if (PLAIN_TEXT.test(file.name) || file.type === "text/plain") {
      // Genuinely read — no stub needed for plain text.
      setStubbed(false);
      file
        .text()
        .then((text) => setLongForm({ uploadedText: text.trim() }))
        .finally(() => setReading(false));
      return;
    }

    setStubbed(true);
    const kind = file.type.startsWith("image/") ? "photo" : "document";
    window.setTimeout(() => {
      setLongForm({
        uploadedText:
          `[Stub — text lifted from your ${kind} would appear here, ready to edit.]\n\n` +
          `We read “${file.name}” and pulled out the writing. In the real editor ` +
          `this is OCR for photos and a document parser for rtf and docx, both ` +
          `server-side. Edit anything that came through wrong, then place it on ` +
          `the card.`,
      });
      setReading(false);
    }, 1200);
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setStubbed(false);
    setLongForm({ uploadedText: "", fileName: null });
  };

  return (
    <>
      <Section title="Where's the text?">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) accept(file);
          }}
          className={cn(
            "space-y-2 rounded-[14px] border-2 border-dashed p-2.5 transition-colors",
            dragOver
              ? "border-brand-red bg-brand-red/5"
              : "border-hairline-strong bg-surface-sunken/40",
          )}
        >
          {SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <div key={source.id}>
                <input
                  ref={(el) => {
                    inputs.current[source.id] = el;
                  }}
                  type="file"
                  accept={source.accept}
                  capture={source.capture}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) accept(file);
                    e.target.value = "";
                  }}
                />
                <motion.button
                  type="button"
                  onClick={() => inputs.current[source.id]?.click()}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTight}
                  className="flex w-full items-center gap-3 rounded-[11px] bg-surface px-3 py-2.5 text-left ring-1 ring-hairline"
                >
                  <Icon size={17} className="shrink-0 text-ink-soft" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink">
                      {source.label}
                    </span>
                    <span className="block text-[11.5px] leading-snug text-ink-faint">
                      {source.hint}
                    </span>
                  </span>
                </motion.button>
              </div>
            );
          })}

          <p className="pt-0.5 text-center text-[11.5px] text-ink-faint">
            or drop a file here
          </p>
        </div>
      </Section>

      {/* Variant labels, not objects: the Section inside inherits its "visible"
          state from this wrapper, and stays at opacity 0 without it. */}
      <AnimatePresence>
        {fileName && (
          <motion.div
            variants={staggerChild}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springBouncy}
          >
            <Section title="Source">
              <div className="flex items-center gap-3 rounded-[12px] bg-surface-sunken/70 p-2.5">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-[8px] object-cover ring-1 ring-black/10"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-surface text-ink-faint ring-1 ring-hairline">
                    <FileText size={18} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {fileName}
                  </span>
                  <span className="block text-[11.5px] text-ink-faint">
                    {reading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={11} className="animate-spin" />
                        Reading the text…
                      </span>
                    ) : stubbed ? (
                      "Stub — extraction runs server-side"
                    ) : (
                      "Read in full"
                    )}
                  </span>
                </span>
                <motion.button
                  type="button"
                  aria-label="Remove file"
                  onClick={clear}
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={springTight}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface hover:text-ink"
                >
                  <X size={14} />
                </motion.button>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      <Section title="Your text">
        <textarea
          rows={8}
          value={uploadedText}
          onChange={(e) => setLongForm({ uploadedText: e.target.value })}
          placeholder="Upload something above, or type it here."
          className={cn(inputClass, "resize-none leading-relaxed")}
        />
        {uploadedText.length > 0 && (
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            {uploadedText.trim().split(/\s+/).length} words
          </p>
        )}
      </Section>
    </>
  );
}
