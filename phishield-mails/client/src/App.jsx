import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SignUp from "./components/Signup";
import TodoList from "./components/List";

function App() {
  const [isSignedUp, setIsSignedUp] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50 text-gray-800 font-sans">
      <Navbar isSignedUp={isSignedUp} />
      {!isSignedUp ? <SignUp setIsSignedUp={setIsSignedUp} /> : <TodoList />}
    </div>
  );
}

export default App;
