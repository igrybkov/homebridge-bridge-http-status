import {API, Logger, PlatformConfig, Service, Characteristic} from 'homebridge';

import {createServer} from 'http';
import {createHttpTerminator} from 'http-terminator';
import {PlatformPlugin} from 'homebridge/lib/api';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class BridgeHttpStatusPlatform implements PlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      const port = this.config.port || 6345;

      const server = createServer((req, res) => {
        log.debug('http request received');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('ok');
      });

      const httpTerminator = createHttpTerminator({
        server,
      });

      server.listen(port, () => {
        log.info(`Webserver listening on port ${port}`);
      });

      this.api.on('shutdown', () => {
        httpTerminator.terminate();
      });
    });
  }
}
