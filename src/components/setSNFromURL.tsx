"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SetSNFromURL = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const mc = searchParams.get("sn");
    if (mc) {
      localStorage.setItem("sn", mc);
    }
  }, [searchParams]);

  return null;
};

export default SetSNFromURL;
