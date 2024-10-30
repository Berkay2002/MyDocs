// src/components/UserProfile/ThemeSelector.js
import { useState } from "react";
import { firestore } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const ThemeSelector = ({ userId }) => {
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [fontStyle, setFontStyle] = useState("sans-serif");
  const [primaryColor, setPrimaryColor] = useState("#1A73E8");

  const handleThemeChange = async () => {
    await updateDoc(doc(firestore, "users", userId), {
      theme: {
        backgroundColor,
        fontStyle,
        primaryColor,
      },
    });
  };

  return (
    <div>
      <label>Background Color</label>
      <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
      <label>Font Style</label>
      <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
        <option value="sans-serif">Sans-serif</option>
        <option value="serif">Serif</option>
      </select>
      <label>Primary Color</label>
      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
      <button onClick={handleThemeChange}>Save Theme</button>
    </div>
  );
};

export default ThemeSelector;
