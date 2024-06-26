import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

import Board from "./components/Board"

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return <div className="container">
      <Board/>
    </div>
}

export default App;
