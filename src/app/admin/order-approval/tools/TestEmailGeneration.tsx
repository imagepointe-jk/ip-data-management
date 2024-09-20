"use client";

import { processFormattedTextAction } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useState } from "react";

export function TestEmailGeneration() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function generate(e: FormData) {
    setLoading(true);
    try {
      const processed = await processFormattedTextAction(e);
      setOutput(processed);
    } catch (error) {
      console.error(error);
      setOutput("ERROR GENERATING OUTPUT. View console for details.");
    }
    setLoading(false);
  }

  return (
    <>
      <h2>Test Email Generation</h2>
      <p>
        Use the below fields to test the appearance of dynamic emails without
        sending an email.
      </p>
      <div
        className="content-frame"
        style={{ width: "1200px", display: "flex", gap: "20px" }}
      >
        <form className="vert-flex-group" action={generate}>
          <div>
            <label className="input-label">Workflow Instance ID</label>
            <input type="number" name="id" />
          </div>
          <div>
            <label className="input-label">Target User Email</label>
            <input type="text" name="email" />
          </div>
          <div>
            <label className="input-label">Message with Shortcodes</label>
            <textarea cols={45} rows={10} name="text"></textarea>
          </div>
          <div>
            <ButtonWithLoading
              loading={loading}
              normalText="Generate"
              style={{ width: "150px" }}
            />
          </div>
        </form>
        <div className="content-frame-minor" style={{ width: "800px" }}>
          <div>Output</div>
          <hr />
          {/* The HTML is coming straight from our server */}
          <div dangerouslySetInnerHTML={{ __html: output }}></div>
        </div>
      </div>
    </>
  );
}
