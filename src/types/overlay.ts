export type OverlayKind = "heading" | "table" | "latex" | "diagram";

export interface OverlayRange {
  start: {
    line: number;
    character: number;
  };
  end: {
    line: number;
    character: number;
  };
}

export interface OverlayData {
  type: OverlayKind;
  level?: number;
  range: OverlayRange;
  content: string;
  rendered: string;
}
