// Counts supplied by the creator from an authorized report. Imported counts
// from other platforms belong to their original providers.
export async function collect(source) {
  const {nativeDownloads, updatedAt} = source.report ?? {};
  if (!Number.isSafeInteger(nativeDownloads) || nativeDownloads < 0 || !Number.isFinite(Date.parse(updatedAt))) {
    throw new Error('Bedrock Buddy report needs an exact native download count and date');
  }
  return {value: nativeDownloads, updatedAt, metadata: {source: 'authorized-report'}};
}