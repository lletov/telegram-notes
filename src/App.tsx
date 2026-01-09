import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const tg = window.Telegram?.WebApp;

function App() {
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Загрузка заметки при старте
  useEffect(() => {
    const user = tg?.initDataUnsafe?.user;
    if (!user) {
      console.warn("Откройте приложение через Telegram, чтобы получить userId");
      return;
    }

    const id = user.id;
    setUserId(id);
    console.log("Telegram userId:", id, "user object:", user);

    // Загрузка заметки из Supabase
    supabase
      .from("notes")
      .select("content")
      .eq("user_id", id)
      .single()
      .then(({ data, error }) => {
        console.log("Загрузка заметки:", { data, error });
        if (error && error.code !== "PGRST116") {
          console.error("Ошибка при загрузке заметки:", error);
        }
        if (data) setText(data.content);
      });
  }, []);

  // Сохранение заметки при изменении
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setText(value);

  if (!userId) return;

  console.log("Сохраняем заметку:", { userId, content: value });

  supabase
    .from("notes")
    .upsert(
      { user_id: userId, content: value },
      { onConflict: "user_id" }
    )
    .then(({ data, error }) => {
      if (error) console.error("Ошибка при сохранении:", error);
      else console.log("Успешно сохранено:", data);
    });
};

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <h3>📝 Моя заметка</h3>
      {userId ? (
        <input
          value={text}
          onChange={handleChange}
          placeholder="Введите текст..."
          style={{ width: "100%", padding: 8, fontSize: 16 }}
        />
      ) : (
        <p>Откройте приложение через Telegram, чтобы использовать заметки.</p>
      )}
    </div>
  );
}

export default App;
