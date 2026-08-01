import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";
import "./AvatarUpload.css";

function AvatarUpload({ userId, userName, currentAvatar, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || null);
  const fileInputRef = useRef(null);

  // ✅ Синхронизируем превью с пропсом
  useEffect(() => {
    setPreview(currentAvatar || null);
  }, [currentAvatar]);

  // ✅ Достаём путь файла из публичного URL
  const getStoragePath = (url) => {
    if (!url) return null;
    const parts = url.split("/avatars/");
    return parts.length > 1 ? parts[1].split("?")[0] : null;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Файл слишком большой. Максимум 2MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Можно загружать только изображения");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Загружаем новый файл
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Обновляем профиль в БД
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // ✅ Удаляем старый файл ПОСЛЕ успешного обновления
      const oldPath = getStoragePath(currentAvatar);
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      setPreview(avatarUrl);
      onUploadSuccess(avatarUrl);
      alert("✅ Аватар успешно загружен!");
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Удалить аватар?")) return;

    setUploading(true);

    try {
      // Обновляем профиль
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) throw error;

      // ✅ Удаляем файл (err объявлен корректно)
      const oldPath = getStoragePath(currentAvatar);
      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from("avatars")
          .remove([oldPath]);

        if (removeError) {
          console.log("Не удалось удалить файл:", removeError.message);
        }
      }

      setPreview(null);
      onUploadSuccess(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("🗑️ Аватар удалён");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Первая буква имени, а не UUID
  const initial = (userName || "?").charAt(0).toUpperCase();

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Аватар" />
        ) : (
          <div className="avatar-placeholder">{initial}</div>
        )}
      </div>

      <div className="avatar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: "none" }}
        />

        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Загрузка..." : preview ? "Изменить" : "Загрузить"}
        </button>

        {preview && (
          <button
            type="button"
            className="remove-btn"
            onClick={handleRemoveAvatar}
            disabled={uploading}
          >
            Удалить
          </button>
        )}
      </div>

      <p className="avatar-hint">JPG, PNG или GIF. Максимум 2MB</p>
    </div>
  );
}

export default AvatarUpload;
