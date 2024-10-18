import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
function SignUp({ setIsSignedUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/");
    const data = await res.json();
    window.open(data.url, "_self");
    setIsSignedUp(true); // Placeholder for sign-up logic
  };

  return (
    <div className="flex items-center justify-center h-screen dark:bg-gray-800">
      <button
        className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150"
        onClick={handleSignUp}
      >
        <img
          className="w-6 h-6"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
        />
        <span>Login with Google</span>
      </button>
    </div>
  );
}

export default SignUp;
