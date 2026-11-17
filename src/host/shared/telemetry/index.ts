/**
 * Public API of the telemetry segment: the anonymous ping the request guard starts, the payload it
 * sends, and the readers that build it.
 *
 * Nothing here is imported by the browser half: this is the host's one outbound request.
 */
export {
  buildPayload,
  countEpisodeFolders,
  createTelemetry,
  episodeBucket,
  type EpisodeBucket,
  hostFacts,
  type HostFacts,
  isInstallId,
  type PackageManifest,
  PING_INTERVAL_MS,
  PING_TIMEOUT_MS,
  readPackageManifest,
  SAVE_RETRY_MS,
  type Telemetry,
  TELEMETRY_ENDPOINT,
  type TelemetryFetch,
  type TelemetryMetrics,
  type TelemetryOptions,
  type TelemetryPayload,
  TELEMETRY_VERSION,
} from './telemetry.ts'
