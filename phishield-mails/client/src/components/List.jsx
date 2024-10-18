import React, { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Complete project report", isScanned: false },
    { id: 2, text: "Plan team meeting", isScanned: false },
  ]);

  const handleScan = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isScanned: !todo.isScanned } : todo
      )
    );
  };

  // const sender = "v3kLx@example.com";
  // const receiver = "v3kLx@example.com";
  // const content = "Hello, this is a test email.";

  const response = async ({ sender, receiver, content }) => {
    let res = await fetch("https://sai-iii-api.onrender.com/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender, receiver, content }),
    });
    res = res.json();
    return res;
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Your To-Do List</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between items-center mb-4">
            <span>{todo.text}</span>
            <button
              onClick={() => handleScan(todo.id)}
              className={`p-2 rounded ${
                todo.isScanned ? "bg-green-500" : "bg-yellow-500"
              } text-white`}
            >
              {todo.isScanned ? "Scanned" : "Scan"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
