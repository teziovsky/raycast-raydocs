import { load } from "cheerio";
import crypto from "crypto";
import fetch from "node-fetch";
import showdown from "showdown";
import { Link } from "@/types";

const docsUrl = "https://developers.raycast.com";
const githubUrl = "https://raw.githubusercontent.com/raycast/extensions";
const linksUrl = `${githubUrl}/gh-pages/SUMMARY.md`;
const markdownUrl = `${githubUrl}/refs/heads/main/docs`;
const converter = new showdown.Converter();

export async function getLinks() {
  try {
    const res = await fetch(linksUrl).then((res) => res.text());

    const html = converter.makeHtml(res);

    const $ = load(html);

    let sectionTitle: string | undefined;

    const menuItems: Link[] = $("body > *")
      .map((_, element) => {
        if (/h[1-6]/.test(element.name)) {
          sectionTitle = $(element).text();
          return;
        }

        if (/hr/.test(element.name)) {
          sectionTitle = undefined;
          return;
        }

        if (/ul/.test(element.name)) {
          const links = $(element)
            .find("li > a")
            .map((_, link) => {
              return {
                id: crypto.randomUUID(),
                sectionTitle,
                title: $(link).text(),
                url: parseUrl($(link).attr("href")),
              };
            })
            .toArray();

          return links;
        }
      })
      .toArray();

    return menuItems;
  } catch (err) {
    console.error(err);
  }
}

export async function getLinkMarkdown(url: string) {
  try {
    let res = await fetch(url).then((res) => res.text());

    res = res.replaceAll(
      /(\.\.\/)*.gitbook\/assets/g,
      "https://raw.githubusercontent.com/raycast/extensions/refs/heads/main/docs/.gitbook/assets",
    );

    res = res.replaceAll(/\{% hint .* %\}\s+/g, "> ");
    res = res.replaceAll("{% endhint %}", "");
    res = res.replaceAll(/\{% tabs %\}\s+/g, "");
    res = res.replaceAll(/\{% endtabs %\}\s+/g, "");
    res = res.replaceAll(/{% tab title="([^"]+)" %}/g, "$1");
    res = res.replaceAll(/\{% endtab %\}\s+/g, "");
    res = res.replaceAll("<code>", "`");
    res = res.replaceAll("</code>", "`");

    return res;
  } catch (err) {
    console.error(err);
  }
}

function parseUrl(url: string | undefined): Link["url"] {
  if (!url || url === "README.md") {
    return {
      path: docsUrl,
      markdown: `${markdownUrl}/${url}`,
      external: false,
    };
  } else if (url.startsWith("http")) {
    return {
      path: url,
      markdown: url,
      external: true,
    };
  } else if (url.endsWith("README.md")) {
    return {
      path: `${docsUrl}/${url.replace("/README.md", "")}`,
      markdown: `${markdownUrl}/${url}`,
      external: false,
    };
  } else {
    return {
      path: `${docsUrl}/${url.replace(".md", "")}`,
      markdown: `${markdownUrl}/${url}`,
      external: false,
    };
  }
}
