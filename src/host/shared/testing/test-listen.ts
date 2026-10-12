/**
 * Start a test server on a port that `fetch` will talk to.
 *
 * `listen(0)` takes whatever port the OS hands out, and `fetch` refuses a fixed list of
 * ports outright ("bad port"): 6000, 6667, 10080 and a few dozen more, from the Fetch
 * standard. On the default dynamic range (49152 and up) none of them can come up, but
 * Windows can be configured to start the range at 1024, and on such a machine a test failed
 * now and then with `TypeError: fetch failed`, caused by `bad port`. A server that lands on
 * one of those ports is closed and started again.
 *
 * Lives beside the tests it serves and is not part of the bundle: nothing in `src/index.ts`
 * imports it.
 */
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'

/** The Fetch standard's "bad ports": a request to one fails before it is sent. */
const BAD_PORTS: ReadonlySet<number> = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101, 102, 103, 104, 109,
  110, 111, 113, 115, 117, 119, 123, 135, 137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531,
  532, 540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060,
  5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697, 10080,
])

/**
 * Listen on 127.0.0.1 and return the port, retrying while the port is one `fetch` refuses.
 * @param server - a server that is not listening yet.
 * @returns the port it listens on.
 */
export async function listenForFetch(server: Server): Promise<number> {
  for (;;) {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const port = (server.address() as AddressInfo).port
    if (!BAD_PORTS.has(port)) return port
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}
