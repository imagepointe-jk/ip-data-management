"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function Search() {
  const [clearedSearchPath, setClearedSearchPath] = useState(
    null as string | null
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const search = formData.get("search");
    if (!search) return;

    const newParams = new URLSearchParams(window.location.search);
    newParams.set("pageNumber", "1");
    newParams.set("keywords", encodeURIComponent(`${search}`));

    router.push(`designs?${newParams}`);
  }

  useEffect(() => {
    const curSearch = searchParams.get("keywords");
    if (!curSearch) {
      setClearedSearchPath(null);
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("keywords");
    setClearedSearchPath(`designs?${newSearchParams}`);
  }, [searchParams]);

  return (
    <>
      {clearedSearchPath && <Link href={clearedSearchPath}>Clear Search</Link>}
      <form onSubmit={submitSearch} style={{ display: "inline" }}>
        <input type="text" name="search" id="search" />
        <button>Search</button>
      </form>
    </>
  );
}
