import { Link } from "@/types";
import { getLinkMarkdown } from "@/utils";
import { Action, ActionPanel, Detail } from "@raycast/api";
import { usePromise } from "@raycast/utils";

type Props = {
  link: Link;
};

export default function LinkContent({ link }: Props) {
  const { data, isLoading } = usePromise(() => getLinkMarkdown(link.url.markdown));

  return (
    <Detail
      isLoading={isLoading}
      markdown={data || "**Loading...**"}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={link.url.path} />
          <Action.CopyToClipboard title="Copy URL to Clipboard" content={link.url.path} />
        </ActionPanel>
      }
    />
  );
}
