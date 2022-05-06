export function isPluginInstalled(p: string) {
  try {
    require.resolve(p);
    return true;
  } catch (e) {
    return false;
  }
}
