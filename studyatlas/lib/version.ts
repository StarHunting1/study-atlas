/**
 * Version numbers are Major.Phase.Update (three parts), from Ver.1.1.9 on:
 *   Major  – a change of the product's shape,
 *   Phase  – a development phase (a group of related updates),
 *   Update – one release inside that phase.
 * Releases before this one (Ver.1.1 … Ver.1.8) keep their old names; their commits and tags are not renamed.
 */
export const VERSION = "1.1.9";
export const versionLabel = `Ver.${VERSION}`;
/** "Ver.1.1.9" → [1, 1, 9]; undefined when the label is not in the three-part form. */
export function parseVersion(label: string): [number, number, number] | undefined {
  const m = /^(?:Ver\.)?(\d+)\.(\d+)\.(\d+)$/.exec(label.trim()); return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}
