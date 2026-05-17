export function formatReflection(text: string): string {
  return text
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("**") && block.includes(":**")) {
        const [title, ...rest] = block.split("\n");
        return `<h2>${title.replace(/\*\*/g, "")}</h2><p>${rest.join("\n")}</p>`;
      }
      return `<p>${block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("");
}
