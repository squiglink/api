export interface Point {
  frequency_hz: string;
  phase_degrees?: string;
  spl_db: string;
}

const DELIMITERS = [",", ";", "\t", " "];
const MAX_BYTE_LENGTH = 64 * 1024;
const MAX_LINES = 1024;

export function parseMeasurement(text: string): [string?, string?] {
  const byteLength = Buffer.byteLength(text, "utf8");
  if (byteLength > MAX_BYTE_LENGTH) {
    return [undefined, "The byte length exceeds the maximum allowed value"];
  }

  const lines = text.split("\n");
  if (lines.length > MAX_LINES) {
    return [undefined, "The line count exceeds the maximum allowed value"];
  }

  const points: Point[] = [];
  let pointsHavePhase = true;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("*")) continue;

    let values: string[] = [];

    const delimiter = DELIMITERS.find((d) => trimmedLine.includes(d));
    if (!delimiter) return [undefined, "The measurement has unsupported delimiters"];
    values = trimmedLine
      .split(delimiter)
      .map((v) => v.trim())
      .filter((v) => v !== "");

    if (values.length >= 2) {
      const frequency_hz = values[0];
      const spl_db = values[1];

      if (!isNaN(Number(frequency_hz)) && !isNaN(Number(spl_db))) {
        const point: Point = {
          frequency_hz: frequency_hz,
          spl_db: spl_db,
        };

        if (values.length >= 3) {
          const phase_degrees = values[2];
          if (!isNaN(Number(phase_degrees))) {
            point.phase_degrees = phase_degrees;
          } else {
            pointsHavePhase = false;
          }
        } else {
          pointsHavePhase = false;
        }

        points.push(point);
      }
    }
  }

  let result = "";
  if (pointsHavePhase) {
    for (const point of points) {
      result += `${point.frequency_hz}, ${point.spl_db}, ${point.phase_degrees}\n`;
    }
  } else {
    for (const point of points) {
      result += `${point.frequency_hz}, ${point.spl_db}\n`;
    }
  }

  return [result, undefined];
}
