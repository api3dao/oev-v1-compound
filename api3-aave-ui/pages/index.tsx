import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { populateChainConfigs } from "configuration";

function Home() {
  const router = useRouter();

  const currentChainConfig = populateChainConfigs();
  useEffect(() => {
    if (currentChainConfig.currentMarket === "compound") {
      router.replace("/markets");
    } else {
      router.replace("/dashboard");
    }
  }, [currentChainConfig, router]);

  return null;
}

export default Home;
