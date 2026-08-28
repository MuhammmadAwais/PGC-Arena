"use client";

import { useState, useEffect } from "react";
import { Layers, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";
import {
  createTopicAction,
  updateTopicAction,
} from "../../actions/questionActions";

export function CreateEditTopicModal() {
  const {
    isCreateTopicOpen,
    closeCreateTopic,
    editTopicData,
    targetChapterForTopic,
    vaultData,
    fetchVaultData,
    fetchQuestions,
  } = useQuestionBankStore();

  const isEditing = !!editTopicData;

  const [chapterId, setChapterId] = useState("");
  const [topicNumber, setTopicNumber] = useState("");
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapters = vaultData?.chapters || [];

  useEffect(() => {
    if (editTopicData) {
      setChapterId(editTopicData.chapter_id);
      setTopicNumber(editTopicData.topic_number);
      setTitle(editTopicData.title);
      setIsActive(editTopicData.is_active);
    } else {
      const defaultChapId = targetChapterForTopic?.id || chapters[0]?.id || "";
      const selectedChap = chapters.find((c) => c.id === defaultChapId);
      const defaultChapNum = selectedChap?.chapter_number || targetChapterForTopic?.chapter_number || 1;
      const nextTopicIndex = (selectedChap?.topics.length || 0) + 1;

      setChapterId(defaultChapId);
      setTopicNumber(`${defaultChapNum}.${nextTopicIndex}`);
      setTitle("");
      setIsActive(true);
    }
    setError(null);
  }, [editTopicData, isCreateTopicOpen, targetChapterForTopic, chapters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterId) {
      setError("Please select a chapter.");
      return;
    }
    if (!topicNumber.trim() || !title.trim()) {
      setError("Topic number and title are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editTopicData) {
        const res = await updateTopicAction({
          id: editTopicData.id,
          topic_number: topicNumber.trim(),
          title: title.trim(),
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to update topic");
      } else {
        const res = await createTopicAction({
          chapter_id: chapterId,
          topic_number: topicNumber.trim(),
          title: title.trim(),
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to create topic");
      }

      await fetchVaultData();
      await fetchQuestions();
      closeCreateTopic();
    } catch (err: any) {
      console.error("Topic modal error:", err);
      setError(err.message || "Failed to save topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateTopicOpen} onOpenChange={(open) => !open && closeCreateTopic()}>
      <DialogContent className="max-w-md p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Topic" : "Create Topic"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Define a modular sub-topic within the chapter syllabus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Select Chapter <span className="text-pgc-red">*</span>
              </label>
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  const selectedChap = chapters.find((c) => c.id === e.target.value);
                  if (selectedChap) {
                    setTopicNumber(`${selectedChap.chapter_number}.${selectedChap.topics.length + 1}`);
                  }
                }}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0B0C16] text-white">
                    Chapter {c.chapter_number}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Topic # <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={topicNumber}
                onChange={(e) => setTopicNumber(e.target.value)}
                placeholder="1.1"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:border-amber-400"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Topic Title <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Von Neumann Architecture"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div>
              <p className="text-xs font-bold text-white font-display">Active Topic</p>
              <p className="text-[11px] text-slate-400">
                Allows MCQs under this topic to be queried.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={closeCreateTopic}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Topic"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
