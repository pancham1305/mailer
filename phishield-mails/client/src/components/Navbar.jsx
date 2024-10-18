import React from "react";

export default function Navbar({ isSignedUp }) {
  return (
    <nav className="px-4 py-2 border flex text-slate-700 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Phishield Mails</h1>
      {isSignedUp && (
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="rounded-full cursor-pointer"
        />
      )}
    </nav>
  );
}
