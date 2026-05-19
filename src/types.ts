import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export type PromptArgument = NonNullable<Prompt["arguments"]>[number];

export type PromptDefinition = {
  name: string;
  description: string;
  arguments: PromptArgument[];
  render: (args: Record<string, string | undefined>) => string;
};

export type PromptMessageResult = {
  description: string;
  messages: Array<{
    role: "user";
    content: {
      type: "text";
      text: string;
    };
  }>;
};
