import { LottieProps } from "@lottielab/lottie-player/react";
import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { ILottie } from "@lottielab/lottie-player";
import { useColorMode } from "@docusaurus/theme-common";

// TOD0: Replace these URLs with your actual themed animation URLs
const LOTTIE_URLS = {
  dark: "https://lottie.host/bc4266d9-d196-43c1-b81c-41e379c63b1b/UD7HLlauIo.json",
  light: "https://cdn.lottielab.com/l/3cp3bJwTzHxWRS.json",
};

const LottieAnimation = () => {
  const { colorMode } = useColorMode();
  const [LottieComponent, setLottieComponent] =
    useState<React.ForwardRefExoticComponent<
      LottieProps & React.RefAttributes<ILottie>
    > | null>(null);

  useEffect(() => {
    import("@lottielab/lottie-player/react").then((module) => {
      setLottieComponent(() => module.default);
    });
  }, []);

  const getAnimationSrc = () => {
    return colorMode === "dark"
      ? LOTTIE_URLS.dark
      : LOTTIE_URLS.light;
  };

  return (
    <BrowserOnly>
      {() =>
        LottieComponent ? (
          <LottieComponent
            src={getAnimationSrc()}
            autoplay
          />
        ) : null
      }
    </BrowserOnly>
  );
};

export default LottieAnimation;
