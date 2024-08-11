import { Logger } from "tslog";

const showTime: boolean = false;
const timePrefix = showTime ? `{{hh}}:{{MM}}:{{ss}}:{{ms}}\t` : "";
export const logTemplate = `${timePrefix}{{logLevelName}}\t{{name}}{{spacer}}`;
export const expandedLogTemplate = `${logTemplate}{{filePathWithLine}}\n`;

const isDev = import.meta.env.DEV;

const settings = {
  type: "pretty",
  overwrite: {
    addPlaceholders: (logObjMeta, placeholderValues) => {
      const maxWidth = 25;
      const fnWidth = logObjMeta?.name?.length || 0;

      const delta = maxWidth - fnWidth;
      const padding = new Array(delta < 0 ? 0 : delta).fill(" ").join("");
      placeholderValues["spacer"] = `${padding}`;

      return logObjMeta;
    },
  },
  hideLogPositionForProduction: !isDev,
  // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
  minLevel: 0,
  prettyLogTemplate: logTemplate,
  prettyErrorTemplate: expandedLogTemplate,
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", "bgWhiteBright", "dim"],
      SILLY: ["bold", "white"],
      TRACE: ["bold", "whiteBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
  },
} satisfies ConstructorParameters<typeof Logger>[0];

export const log = {
  common: new Logger<unknown>(settings),
  service: new Logger<unknown>({ name: "[SERVICE]", ...settings }),
  mutation: new Logger<unknown>({ name: "[MUTATION]", ...settings }),
  useBoot: new Logger<unknown>({ name: "[useBoot]", ...settings }),
  useSync: new Logger<unknown>({ name: "[useSync]", ...settings }),
};

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

    log.service.settings.name = `[${constructor}]`;
    log.service.info(`${propertyKey} in ${time}`);

    return result;
  };

  return descriptor;
}
