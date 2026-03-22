export {};

declare global {
  interface BigInt {
    toJSON(): unknown;
  }

  interface JSON {
    rawJSON(value: string): unknown;
  }
}

BigInt.prototype.toJSON = function () {
  return JSON.rawJSON(this.toString());
};
