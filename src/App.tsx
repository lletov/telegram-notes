import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type Note = {
  id: string;
  owner_id: number;
  content: string;
  shared_with: string[]; // jsonb массив никнеймов
};

const tg = window.Telegram?.WebApp;

function App() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [newSharedUser, setNewSharedUser] = useState("");

  // 1️⃣ Получаем Telegram userId и username
  useEffect(() => {
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) setUserId(user.id);
    if (user?.username) setUsername(user.username);
  }, []);

  // 2️⃣ Загружаем заметки: свои + расшаренные
  useEffect(() => {
    if (!userId || !username) return;

    const loadNotes = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .or(
          `owner_id.eq.${userId},shared_with.cs.${JSON.stringify([username])}`
        )
        .order("updated_at", { ascending: false });

      if (error) console.error("Ошибка загрузки заметок:", error);
      else {
        setNotes(data || []);
        if (data && data.length > 0) {
          setSelectedNoteId(data[0].id);
          setText(data[0].content || "");
        }
      }

      setLoading(false);
    };

    loadNotes();
  }, [userId, username]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // 3️⃣ Создание новой заметки
  const createNote = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        owner_id: userId,
        content: "",
        shared_with: []
      })
      .select()
      .single();

    if (error) {
      console.error("Ошибка создания заметки:", error);
      return;
    }

    setNotes([data, ...notes]);
    setSelectedNoteId(data.id);
    setText("");
  };

  // 4️⃣ Сохранение заметки
  const saveNote = async () => {
    if (!selectedNote) return;

    const { error } = await supabase
      .from("notes")
      .update({
        content: text,
        updated_at: new Date()
      })
      .eq("id", selectedNote.id);

    if (error) console.error("Ошибка сохранения:", error);
    else console.log("Заметка сохранена");
  };

  // 5️⃣ Добавление совместного пользователя по никнейму
  const addSharedUser = async () => {
    if (!selectedNote || !newSharedUser) return;

    if (selectedNote.shared_with.includes(newSharedUser)) return;

    const updatedShared = [...selectedNote.shared_with, newSharedUser];

    const { error } = await supabase
      .from("notes")
      .update({ shared_with: updatedShared })
      .eq("id", selectedNote.id);

    if (error) {
      console.error("Ошибка добавления пользователя:", error);
      return;
    }

    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id ? { ...n, shared_with: updatedShared } : n
      )
    );

    setNewSharedUser("");
  };

  // Удаление заметки только для того кто создавал
  const deleteNote = async (noteId: string) => {
  const note = notes.find((n) => n.id === noteId);
  if (!note) return;

  if (note.owner_id !== userId) {
    alert("Удалять заметку может только владелец");
    return;
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Ошибка удаления заметки:", error);
    return;
  }

  setNotes((prev) => prev.filter((n) => n.id !== noteId));
  setSelectedNoteId(prev => prev === noteId ? null : prev);
  setText("");
};

  if (loading) return <div style={{ padding: 16 }}>Загрузка…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <h3>📝 Совместные заметки</h3>

      {/* Список заметок */}
      <div style={{ marginBottom: 16 }}>
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => {
              setSelectedNoteId(note.id);
              setText(note.content);
            }}
            style={{
              marginRight: 8,
              marginBottom: 4,
              backgroundColor: note.id === selectedNoteId ? "#ccc" : "#eee",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {note.content.slice(0, 10) || "Новая заметка"}
          </button>
        ))}

        <button
          onClick={createNote}
          style={{
            marginLeft: 8,
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          ➕ Новая заметка
        </button>
      </div>

      {/* Редактор */}
      {selectedNote && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст заметки…"
            style={{
              width: "100%",
              height: 160,
              fontSize: 16,
              padding: 8,
              boxSizing: "border-box"
            }}
          />
          <button onClick={saveNote} style={{ marginTop: 8 }}>
            💾 Сохранить
          </button>
          {selectedNote.owner_id === userId && (
  <button
    onClick={() => deleteNote(selectedNote.id)}
    style={{
      marginTop: 8,
      marginLeft: 8,
      padding: "6px 12px",
      backgroundColor: "#f66",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      cursor: "pointer"
    }}
  >
    🗑 Удалить заметку
  </button>
)}

          {/* Добавление совместного пользователя */}
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Никнейм для совместного доступа"
              value={newSharedUser}
              onChange={(e) => setNewSharedUser(e.target.value)}
              style={{ padding: 6, fontSize: 14 }}
            />
            <button
              onClick={addSharedUser}
              style={{ marginLeft: 8, padding: "6px 12px", cursor: "pointer" }}
            >
              ➕ Добавить
            </button>
          </div>

          {/* Показ текущих совместных пользователей */}
          {selectedNote.shared_with.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Совместный доступ: {selectedNote.shared_with.join(", ")}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
