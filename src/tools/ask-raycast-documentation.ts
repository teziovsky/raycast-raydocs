import { Tool } from "@raycast/api";

type Input = {
  section: string;
  query: string;
};

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  return {
    message: `Are you sure you want to greet ${input.section}?`,
  };
};

export default async function tool(input: Input) {
  console.log("input:", input);
  return "Hello world!";
}
