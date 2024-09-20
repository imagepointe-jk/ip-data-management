import { replacers } from "@/order-approval/mail/mail";

export function ShortcodeReference() {
  return (
    <div className="content-frame" style={{ width: "600px" }}>
      <details>
        <summary>Shortcode Reference</summary>
        <ul>
          {replacers
            .filter((replacer) => !replacer.automatic)
            .map((replacer, i) => (
              <li key={i}>
                <strong>{replacer.shortcode}</strong> - {replacer.description}
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
}
