import sanitizeHtml from "sanitize-html";

export function compressHTML(html: string) {
  html = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "strong",
      "em",
      "span",
      "a",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "img",
      "div"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      code: ["spellcheck"],
      "*": ["class", "style", "data-*"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["data"]
    },
    allowProtocolRelative: true
  });

  //  去除多余的空格和换行
  html = html.replace(/\s+/g, " ");
  //  去除标签之间的空格
  html = html.replace(/>\s+</g, "><");
  // 去除行首行尾的空格
  html = html.trim();
  return html;
}
