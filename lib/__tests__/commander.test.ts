import { RokuClient } from '../client';
import { Commander } from '../commander';
import * as Keys from '../keys';

describe('Commander', () => {
  let methods: any[];
  let client: RokuClient;
  let commander: Commander;

  beforeEach(() => {
    methods = [];
    client = new RokuClient('address');
    client.keypress = function (command) {
      methods.push(command);
      return Promise.resolve();
    };
    commander = new Commander(client);
  });

  it('should allow chaining methods', () =>
    commander
      .up(2)
      .down(2)
      .left()
      .right()
      .left()
      .right()
      .text('b')
      .text('a')
      .enter()
      .send()
      .then(() => {
        expect(methods).toEqual([
          'Up',
          'Up',
          'Down',
          'Down',
          'Left',
          'Right',
          'Left',
          'Right',
          'b',
          'a',
          'Enter',
        ]);
      }));

  it('should allow for key strings to be used', () =>
    commander
      .keypress(Keys.VOLUME_DOWN)
      .keypress(Keys.VOLUME_UP)
      .keypress(Keys.VOLUME_MUTE)
      .keypress('Power')
      .send()
      .then(() => {
        expect(methods).toEqual([
          'VolumeDown',
          'VolumeUp',
          'VolumeMute',
          'Power',
        ]);
      }));

  it('should allow commands to be added in the exec method', () =>
    commander
      .exec((cmd) => cmd.down())
      .up()
      .send()
      .then(() => {
        expect(methods).toEqual(['Down', 'Up']);
      }));

  it('should allow waiting between commands', () => {
    jest.useFakeTimers();

    const cmd = commander.wait(2000).up().send();

    return new Promise((resolve) => {
      setImmediate(() => {
        expect(methods.length).toBe(0);
        jest.runAllTimers();
        resolve(
          cmd.then(() => {
            expect(methods).toEqual(['Up']);
          }),
        );
      });
    });
  });

  it('should allow sending more than once', async () => {
    commander.up(2).down(2).left().right();

    await commander.send();
    expect(methods).toEqual(['Up', 'Up', 'Down', 'Down', 'Left', 'Right']);

    methods = [];

    await commander.send();
    expect(methods).toEqual(['Up', 'Up', 'Down', 'Down', 'Left', 'Right']);
  });
});
