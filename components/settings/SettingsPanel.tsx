"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  { value: "#C1440E", name: "Terracotta" },
  { value: "#D4872A", name: "Amber" },
  { value: "#6B7C5E", name: "Sage" },
  { value: "#7587B1", name: "Steel" },
  { value: "#B83232", name: "Ruby" },
  { value: "#4A7A4A", name: "Forest" },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { language } = useLanguage();
  const { currentUser, allUsers, setCurrentUser, createUser, updateUser, deleteUser } = useUser();

  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    avatarColor: "#6B7C5E",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when opening edit mode
  const startEdit = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        phone: currentUser.phone || "",
        location: currentUser.location || "",
        avatarColor: currentUser.avatarColor,
      });
    }
    setMode("edit");
    setError(null);
  };

  // Reset form for create mode
  const startCreate = () => {
    setFormData({
      name: "",
      phone: "",
      location: "",
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].value,
    });
    setMode("create");
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        const newUser = await createUser({
          name: formData.name,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
          avatarColor: formData.avatarColor,
          initials: generateInitials(formData.name),
        });
        setCurrentUser(newUser);
      } else if (mode === "edit" && currentUser) {
        await updateUser(currentUser.id, {
          name: formData.name,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
          avatarColor: formData.avatarColor,
        });
      }
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(currentUser.id);
      setShowDeleteConfirm(false);
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate initials from name
  function generateInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-indigo/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-parchment shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-indigo text-parchment px-4 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {language === "kr" ? "Paramèt" : "Settings"}
          </h2>
          <button
            onClick={onClose}
            className="text-parchment/70 hover:text-parchment text-xl"
          >
            {"\u2715"}
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* View Mode */}
          {mode === "view" && currentUser && (
            <>
              {/* Current User Card */}
              <section className="card p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-parchment text-xl font-bold"
                    style={{ backgroundColor: currentUser.avatarColor }}
                  >
                    {currentUser.initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-indigo">
                      {currentUser.name}
                    </h3>
                    {currentUser.location && (
                      <p className="text-sm text-indigo/70">{currentUser.location}</p>
                    )}
                    {currentUser.phone && (
                      <p className="text-sm text-indigo/50 font-mono">{currentUser.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={startEdit}
                    className="flex-1 px-3 py-2 bg-sage/20 text-sage-600 rounded-lg text-sm font-medium hover:bg-sage/30 transition-colors"
                  >
                    {"\u270E"} {language === "kr" ? "Modifye" : "Edit"}
                  </button>
                  {currentUser.id !== "demo-user-1" && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-2 bg-alert-red/10 text-alert-red rounded-lg text-sm font-medium hover:bg-alert-red/20 transition-colors"
                    >
                      {"\u2715"}
                    </button>
                  )}
                </div>
              </section>

              {/* Switch User */}
              {allUsers.length > 1 && (
                <section className="card p-4">
                  <h4 className="font-display text-sm font-semibold text-indigo mb-3">
                    {language === "kr" ? "Chanje Itilizatè" : "Switch User"}
                  </h4>
                  <div className="space-y-2">
                    {allUsers
                      .filter((u) => u.id !== currentUser.id)
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setCurrentUser(user)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-parchment-dark/20 transition-colors text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-parchment text-xs font-bold"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo">{user.name}</p>
                            {user.location && (
                              <p className="text-xs text-indigo/60">{user.location}</p>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </section>
              )}

              {/* Add New User */}
              <button
                onClick={startCreate}
                className="w-full px-4 py-3 border-2 border-dashed border-sage/50 rounded-lg text-sage-600 font-medium hover:border-sage hover:bg-sage/5 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                {language === "kr" ? "Ajoute Nouvo Itilizatè" : "Add New User"}
              </button>
            </>
          )}

          {/* Edit/Create Mode */}
          {(mode === "edit" || mode === "create") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-indigo">
                {mode === "create"
                  ? language === "kr" ? "Nouvo Itilizatè" : "New User"
                  : language === "kr" ? "Modifye Pwofil" : "Edit Profile"
                }
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-indigo/70 mb-1">
                  {language === "kr" ? "Non" : "Name"} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-sage/50 bg-parchment-light text-indigo"
                  placeholder={language === "kr" ? "Non konplè" : "Full name"}
                  required
                  minLength={2}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-indigo/70 mb-1">
                  {language === "kr" ? "Kote" : "Location"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-sage/50 bg-parchment-light text-indigo"
                  placeholder={language === "kr" ? "Mache, vil" : "Market, city"}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-indigo/70 mb-1">
                  {language === "kr" ? "Telefòn" : "Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-sage/50 bg-parchment-light text-indigo font-mono"
                  placeholder="+509-XXXX-XXXX"
                />
              </div>

              {/* Avatar Color */}
              <div>
                <label className="block text-sm font-medium text-indigo/70 mb-2">
                  {language === "kr" ? "Koulè Avatar" : "Avatar Color"}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarColor: color.value })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.avatarColor === color.value
                          ? "border-indigo scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 bg-parchment-dark/20 rounded-lg">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-parchment font-bold"
                  style={{ backgroundColor: formData.avatarColor }}
                >
                  {formData.name ? generateInitials(formData.name) : "??"}
                </div>
                <div>
                  <p className="font-medium text-indigo">
                    {formData.name || (language === "kr" ? "(Non)" : "(Name)")}
                  </p>
                  <p className="text-sm text-indigo/60">
                    {formData.location || (language === "kr" ? "(Kote)" : "(Location)")}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-alert-red/10 border border-alert-red/30 rounded-lg text-alert-red text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="flex-1 px-4 py-2 border border-indigo/30 text-indigo rounded-lg font-medium hover:bg-parchment-dark/20 transition-colors"
                  disabled={isSubmitting}
                >
                  {language === "kr" ? "Anile" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sage text-parchment rounded-lg font-medium hover:bg-sage-600 transition-colors disabled:opacity-50"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting
                    ? (language === "kr" ? "Ap sove..." : "Saving...")
                    : (language === "kr" ? "Sove" : "Save")
                  }
                </button>
              </div>
            </form>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && currentUser && (
            <div className="fixed inset-0 bg-indigo/70 z-50 flex items-center justify-center p-4">
              <div className="bg-parchment rounded-xl p-6 max-w-sm w-full">
                <h3 className="font-display text-lg font-semibold text-indigo mb-2">
                  {language === "kr" ? "Konfime Sipresyon" : "Confirm Delete"}
                </h3>
                <p className="text-indigo/70 mb-4">
                  {language === "kr"
                    ? `Ou sèten ou vle efase ${currentUser.name}? Tout done yo ap pèdi.`
                    : `Are you sure you want to delete ${currentUser.name}? All data will be lost.`
                  }
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-indigo/30 text-indigo rounded-lg font-medium"
                    disabled={isSubmitting}
                  >
                    {language === "kr" ? "Anile" : "Cancel"}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-alert-red text-parchment rounded-lg font-medium disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (language === "kr" ? "Ap efase..." : "Deleting...")
                      : (language === "kr" ? "Efase" : "Delete")
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
