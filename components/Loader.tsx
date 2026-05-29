"use client";

import { useApp } from "@/hooks/useAppData";

export default function Loader() {
  const { loading, loaderMsg } = useApp();

  if (!loading) return null;

  return (
    <div className="loader">
      <div className="loader-spinner"></div>
      <div className="loader-msg">{loaderMsg}</div>
    </div>
  );
}
