import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";

export function Main() {
  const { parentWindow } = useIframe();
  const search = new URLSearchParams(parentWindow.location?.search);

  const accessCodeInParams = search.get("code")
    ? `${search.get("code")}`
    : null;

  return <div>Order approval for {accessCodeInParams}</div>;
}
