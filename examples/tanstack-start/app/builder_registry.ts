import { type RegisteredComponent } from "@builder.io/sdk-react";
import { Test } from "./components/test";

export const customComponents: RegisteredComponent[] = [
  {
    component: Test,
    name: "Test",
    inputs: [
      {
        name: "text",
        type: "string",
        defaultValue: "Hello world",
      },
    ],
  },
];