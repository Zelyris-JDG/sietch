import type { Epigraph as EpigraphData } from "../../src/content/descent";

export function Epigraph({ data, className }: { data: EpigraphData; className?: string }) {
  return (
    <blockquote className={`epigraph${className ? ` ${className}` : ""}`}>
      <p>« {data.text} »</p>
      <cite>— {data.sign}</cite>
    </blockquote>
  );
}
