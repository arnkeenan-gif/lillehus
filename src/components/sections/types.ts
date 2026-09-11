import type { Section } from "@/lib/cms";
import type { HeadingLevel } from "./heading";

/** What <Sections> hands every section component. */
export interface SectionProps<S extends Section = Section> {
  section: S;
  /** "h1" on the section that opens the page, "h2" everywhere else. */
  level: HeadingLevel;
  /** The spacing towards the section above, decided in render.tsx. */
  className?: string;
}
