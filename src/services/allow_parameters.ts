export function allowParameters(body: any, parameters: string[]): any {
  Object.keys(body).filter((key) => {
    if (!parameters.includes(key)) {
      delete body[key];
    }
  });
  return body;
}
