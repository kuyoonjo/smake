export function property(accessor?: {
  get?: (self: any, key: string) => any;
  set?: (self: any, key: string, value: any) => void;
}) {
  return function (target: any, key: string) {
    const privateKey = '_' + key;

    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get:
        accessor && accessor.get
          ? () => accessor.get!(target, privateKey)
          : () => target[privateKey],
      set:
        accessor && accessor.set
          ? (v: any) => accessor.set!(target, privateKey, v)
          : (v: any) => {
              target[privateKey] = v;
            },
    });
  };
}
