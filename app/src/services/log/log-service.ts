export function LogTimeWithPayload(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  if (typeof target === "function") {
    console.log(`${target.name}`);
    return;
  }

  const constructor = target.constructor.name;
  const originalMethod = descriptor?.value || "unknown method";

  if (!descriptor) return;
  descriptor.value = async function (...args: any[]) {
    const t1 = new Date();
    const result = await originalMethod.apply(this, args);
    const t2 = new Date();
    const time = `${t2.getTime() - t1.getTime()}ms`;

    console.log(`${constructor}: ${propertyKey} in ${time}`);

    return result;
  };

  return descriptor;
}
