import { useEffect, useState } from "react";

const tg = window.Telegram?.WebApp;

function App() {
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();

      // получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUserId(tg.initDataUnsafe.user.id);
        console.log("Telegram user:", tg.initDataUnsafe.user);
      }
    }

    // загружаем заметку пользователя
    if (userId) {
      const saved = localStorage.getItem(`note_${userId}`);
      if (saved) setText(saved);
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (userId) {
      localStorage.setItem(`note_${userId}`, e.target.value);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>📝 Моя заметка</h3>
      {userId ? (
        <>
          <input
            value={text}
            onChange={handleChange}
            placeholder="Введите текст..."
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
          <p style={{ marginTop: 12 }}>
            Сохранено: <b>{text || "—"}</b>
          </p>
        </>
      ) : (
        <p>Откройте приложение через Telegram, чтобы получить доступ к заметкам.</p>
      )}
    </div>
  );
}

export default App;
