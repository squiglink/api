import { describe, it, expect } from "vitest";
import { parseMeasurement } from "./parse_measurement.js";

describe("measurement_parser", () => {
  it("parses the measurement if the delimeter is a space", () => {
    const data = "1.2 3.4\n5.6 7.8\n";
    const [result, error] = parseMeasurement(data);

    expect(error).toBeUndefined();
    expect(result).toBe("1.2, 3.4\n5.6, 7.8\n");
  });

  it("parses the measurement if the delimeter is a comma", () => {
    const data = "1.2, 3.4\n5.6, 7.8\n";
    const [result, error] = parseMeasurement(data);

    expect(error).toBeUndefined();
    expect(result).toBe("1.2, 3.4\n5.6, 7.8\n");
  });

  it("parses the measurement if the delimeter is a semicolon", () => {
    const data = "1.2; 3.4\n5.6; 7.8\n";
    const [result, error] = parseMeasurement(data);

    expect(error).toBeUndefined();
    expect(result).toBe("1.2, 3.4\n5.6, 7.8\n");
  });

  it("parses the measurement if the delimeter is a tab", () => {
    const data = "1.2\t3.4\n5.6\t7.8\n";
    const [result, error] = parseMeasurement(data);

    expect(error).toBeUndefined();
    expect(result).toBe("1.2, 3.4\n5.6, 7.8\n");
  });

  it("parses the measurement the phase column if it is present", () => {
    const data = "1.2, 3.4, 5.6\n7.8, 9.10, 11.12\n";
    const [result, error] = parseMeasurement(data);

    expect(error).toBeUndefined();
    expect(result).toBe("1.2, 3.4, 5.6\n7.8, 9.10, 11.12\n");
  });

  it("does not parse if the byte length exceeds the maximum allowed size", () => {
    const data = "x".repeat(65 * 1024);
    const [result, error] = parseMeasurement(data);

    expect(error).toBe("The byte length exceeds the maximum allowed value");
    expect(result).toBeUndefined();
  });

  it("does not parse if the line count exceeds the maximum allowed line count", () => {
    const data = Array(1025).fill("1.2, 3.4").join("\n");
    const [result, error] = parseMeasurement(data);

    expect(error).toBe("The line count exceeds the maximum allowed value");
    expect(result).toBeUndefined();
  });

  it("does not parse if the measurement has unsupported delimiters", () => {
    const data = "1.2|3.4";
    const [result, error] = parseMeasurement(data);

    expect(error).toBe("The measurement has unsupported delimiters");
    expect(result).toBeUndefined();
  });
});
