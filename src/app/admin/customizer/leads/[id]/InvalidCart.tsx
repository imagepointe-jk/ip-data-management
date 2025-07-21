import { VERSIONS } from "@/constants";

type Props = {
  parsedJson: { [key: string]: any };
};
export function InvalidCart({ parsedJson }: Props) {
  return (
    <>
      <h1>Invalid cart data.</h1>
      <h2>
        The cart data was created in version{" "}
        {parsedJson.createdInVersion || "(UNKNOWN)"}. The current version is{" "}
        {VERSIONS.customizer}.
      </h2>
      <details>
        <summary>Show JSON</summary>
        <div>{JSON.stringify(parsedJson)}</div>
      </details>
    </>
  );
}
