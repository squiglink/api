export function allowParameters(body: any, parameters: string[]): any {
  Object.keys(body).forEach((key) => {
    if (!parameters.includes(key)) delete body[key];
  });
  return body;
}
