export function LogTimeWithPayload(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const logger = console;
  descriptor.value = async function (...args: any[]) {
    const t1 = new Date();
    const result = await originalMethod.apply(this, args);
    const t2 = new Date();
    const time = `${t2.getTime() - t1.getTime()}ms`;

    console.log("IndexedDBService:", propertyKey + " in " + time);

    return result;
  };

  return descriptor;
}
