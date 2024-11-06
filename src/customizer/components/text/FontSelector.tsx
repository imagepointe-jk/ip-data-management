import { useEffect } from "react";

export function FontSelector() {
  async function loadFonts() {}

  useEffect(() => {
    const font = new FontFace(
      "Londrina Sketch",
      'url("https://fonts.gstatic.com/s/londrinasketch/v25/c4m41npxGMTnomOHtRU68eIJn8qvXmP4.woff2")'
    );
    document.fonts.add(font);
  }, []);

  return (
    <div>
      <select>
        <option
          value=""
          style={{ fontFamily: "'Londrina Sketch', sans-serif" }}
        >
          Font
        </option>
      </select>
    </div>
  );
}
