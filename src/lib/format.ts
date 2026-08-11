import DOMPurify from 'isomorphic-dompurify';

export function formatReflection(text: string): string {
  const rawHtml = text
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("**") && block.includes(":**")) {
        const [title, ...rest] = block.split("\n");
        return `<h2>${title.replace(/\*\*/g, "")}</h2><p>${rest.join("\n")}</p>`;
      }
      return `<p>${block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("");
    
  return DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS: ['p', 'h2', 'strong', 'em', 'br', 'ul', 'ol', 'li'] });
}
