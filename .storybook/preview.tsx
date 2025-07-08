// .storybook/preview.tsx
import React from "react";
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import { HeroUIProvider } from "@heroui/react";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
  },
};

export const decorators = [
  (Story) => {
    return (
      <HeroUIProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Story />
        </div>
      </HeroUIProvider>
    );
  },
];

export default preview;
