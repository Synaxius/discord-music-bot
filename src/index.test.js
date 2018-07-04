const MusicBot = require('./index');
const { commandKeys } = require('./config/commands');
const { messageConstants } = require('./config/messages');
const { preferenceConstants } = require('./config/preferences');
const { LOG_INFO, LOG_WARN, LOG_ERROR, LOG_DEBUG } = require('./constants');

const { BOT_MENTIONED } = messageConstants;
const { COMMAND_PREFIX } = preferenceConstants;

describe('MusicBot', () => {
  describe('isDebug()', () => {
    it('returns false by default', () => {
      const bot = new MusicBot({});

      expect(bot.isDebug()).toBe(false);
    });

    it('returns true if set in the config', () => {
      const bot = new MusicBot({ debug: true });

      expect(bot.isDebug()).toBe(true);
    });
  });

  describe('logger()', () => {
    const noFunc = () => '';

    it('defaults to `console.log`', () => {
      const spy = jest.spyOn(global.console, 'log');

      const testMsg = 'test';
      const bot = new MusicBot({});

      bot.logger(testMsg, testMsg, noFunc);

      expect(spy).toHaveBeenCalledWith(noFunc(), testMsg);

      spy.mockReset();
      spy.mockRestore();
    });

    it('uses `console.info` for `LOG_INFO`', () => {
      const spy = jest.spyOn(global.console, 'info');

      const testMsg = 'test';
      const bot = new MusicBot({});

      bot.logger(LOG_INFO, testMsg, noFunc);

      expect(spy).toHaveBeenCalledWith(noFunc(), testMsg);

      spy.mockReset();
      spy.mockRestore();
    });

    it('uses `console.warn` for `LOG_WARN`', () => {
      const spy = jest.spyOn(global.console, 'warn');

      const testMsg = 'test';
      const bot = new MusicBot({});

      bot.logger(LOG_WARN, testMsg, noFunc);

      expect(spy).toHaveBeenCalledWith(noFunc(), testMsg);

      spy.mockReset();
      spy.mockRestore();
    });

    it('uses `console.error` for `LOG_ERROR`', () => {
      const spy = jest.spyOn(global.console, 'error');

      const testMsg = 'test';
      const bot = new MusicBot({});

      bot.logger(LOG_ERROR, testMsg, noFunc);

      expect(spy).toHaveBeenCalledWith(noFunc(), testMsg);

      spy.mockReset();
      spy.mockRestore();
    });

    it('uses `console.debug` for `LOG_DEBUG` when `isDebug()=true`', () => {
      const spy = jest.spyOn(global.console, 'debug');

      const testMsg = 'test';
      const bot = new MusicBot({ debug: true });

      bot.logger(LOG_DEBUG, testMsg, noFunc);

      expect(spy).toHaveBeenCalledWith(noFunc(), testMsg);

      spy.mockReset();
      spy.mockRestore();
    });

    it("doesn't call `console.debug` for `LOG_DEBUG` when `isDebug=false`", () => {
      const spy = jest.spyOn(global.console, 'debug');

      const testMsg = 'aNewTest';
      const bot = new MusicBot({});

      bot.logger(LOG_DEBUG, testMsg, noFunc);

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockReset();
      spy.mockRestore();
    });
  });

  describe('getMessage()', () => {
    it('throws an Error if the key is not found', () => {
      const key = 'test';
      const bot = new MusicBot({});

      let error;

      try {
        bot.getMessage(key);
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(`Failed to get message with key '${key}'`);
    });

    it('retrieves the key if valid', () => {
      const bot = new MusicBot({});

      expect(bot.getMessage(BOT_MENTIONED)).toBe('Hey {}, you should try `{}` for a list of commands. :thumbsup:');
    });
  });

  describe('getPreference()', () => {
    it('throws an Error if the key is not found', () => {
      const key = 'test';
      const bot = new MusicBot({});

      let error;

      try {
        bot.getPreference(key);
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(`Failed to get preference with key '${key}'`);
    });

    it('retrieves the key if valid', () => {
      const bot = new MusicBot({});

      expect(bot.getPreference(COMMAND_PREFIX)).toBe('!');
    });
  });

  describe('setState()', () => {
    it('merges the `newState` into the existing state', () => {
      const bot = new MusicBot({});

      expect(bot.state).toEqual({});

      bot.setState({ music: 'bot' });

      expect(bot.state).toEqual({ music: 'bot' });
    });
  });

  describe('resetState()', () => {
    it("resets the bot's state back to the default", () => {
      const bot = new MusicBot({});

      const initialState = bot.state;

      bot.setState({ thing: 'test' });

      expect(bot.state).toEqual({ thing: 'test' });

      bot.resetState();

      expect(bot.state).toEqual(initialState);
    });
  });

  describe('messageHandler()', () => {
    it('returns a message given a valid key and message', () => {
      const bot = new MusicBot({});
      const message = { member: { user: { toString: () => 'abc' } } };

      expect(bot.messageHandler(BOT_MENTIONED, message)).toBe(
        'Hey abc, you should try `!` for a list of commands. :thumbsup:',
      );
    });

    it("throws an Error when the key's invalid", () => {
      const bot = new MusicBot({});
      const message = { member: { user: { toString: () => 'abc' } } };
      const messageKey = 'unknown';

      let error;

      try {
        bot.messageHandler(messageKey, message);
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(`Failed to handle message with key '${messageKey}'`);
    });
  });

  describe('commandHandler()', () => {
    // FIXME: this test needs to be improved... currently it doesn't assert anything.
    // It just calls the command and only fails if the command doesn't run...
    it('calls the run of a command for a given valid command key', () => {
      const bot = new MusicBot({});
      const args = [];
      const message = {};

      let error = null;

      try {
        bot.commandHandler(commandKeys.HELP_COMMAND, args, message);
      } catch (e) {
        error = e;
      }

      expect(error).toBeNull();
    });

    it('throws an Error when the command key is invalid', () => {
      const bot = new MusicBot({});
      const commandKey = 'unknown';
      const args = [];
      const message = {};

      let error;

      try {
        bot.commandHandler(commandKey, args, message);
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(`Failed to handle command with key '${commandKey}'`);
    });
  });

  describe('onReady()', () => {
    it("throws an Error if the `serverId` isn't resolvable", () => {
      const serverId = 'test';
      const bot = new MusicBot({ serverId });

      let result;

      try {
        bot.onReady();
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe(`Failed to connect to serverId '${serverId}'`);
    });

    it("throws an Error if the textChannelId isn't in the `server.channels`", () => {
      const textChannelId = 'test';
      const bot = new MusicBot({ serverId: 'test', textChannelId });

      bot.bot.guilds.get = () => ({ channels: [] });

      let result;

      try {
        bot.onReady();
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe(`Failed to find textChannelId '${textChannelId}'`);
    });

    it('will log a success message when it can connect', () => {
      const textChannelId = 'test';
      const bot = new MusicBot({ serverId: 'test', textChannelId });

      bot.bot.guilds.get = () => ({ channels: [{ id: textChannelId, type: 'text' }] });

      const mockFn = jest.fn();
      bot.logger = mockFn;

      bot.onReady();

      expect(mockFn.mock.calls.length).toBe(1);
    });
  });

  describe('onMessage()', () => {
    it("should not reply to it's own messages", () => {
      const botUserId = 123;
      const channelName = 'test-channel';
      const mockFn = jest.fn();

      const bot = new MusicBot({});
      bot.bot = { user: { id: botUserId } };
      bot.setState({ activeTextChannel: { name: channelName } });

      const message = {
        author: { id: botUserId },
        channel: { name: channelName, send: mockFn },
      };

      bot.onMessage(message);

      expect(mockFn.mock.calls.length).toBe(0);
    });

    it('should not reply to messages in other channels', () => {
      const mockFn = jest.fn();

      const bot = new MusicBot({});
      bot.bot = { user: { id: 123 } };
      bot.setState({ activeTextChannel: { name: 'test-channel' } });

      const message = {
        author: { id: 456 },
        channel: { name: 'test-channel2', send: mockFn },
      };

      bot.onMessage(message);

      expect(mockFn.mock.calls.length).toBe(0);
    });

    it('should reply to the user if the bot was mentioned', () => {
      const channelName = 'test-channel';
      const mockMessageHandler = jest.fn();
      const mockSend = jest.fn();

      const bot = new MusicBot({});
      bot.messageHandler = mockMessageHandler;
      bot.bot = { user: { id: 123 } };
      bot.setState({ activeTextChannel: { name: channelName } });

      const message = {
        author: { id: 456 },
        channel: { name: channelName, send: mockSend },
        isMentioned: () => true,
      };

      bot.onMessage(message);

      expect(mockSend.mock.calls.length).toBe(1);
    });

    it("will not do anything when it's just a message in the channel", () => {
      const channelName = 'test-channel';
      const mockMessageHandler = jest.fn();
      const mockSend = jest.fn();

      const bot = new MusicBot({});
      bot.messageHandler = mockMessageHandler;
      bot.bot = { user: { id: 123 } };
      bot.setState({ activeTextChannel: { name: channelName } });

      const message = {
        author: { id: 456 },
        channel: { name: channelName, send: mockSend },
        isMentioned: () => false,
      };

      bot.onMessage(message);

      expect(mockSend.mock.calls.length).toBe(0);
    });

    describe('it should attempt to interpret the message as a command if the first character is the `COMMAND_PREFIX`', () => {
      it('should return the `UNKNOWN_COMMAND` message to the channel if the command was unknown', () => {
        const channelName = 'test-channel';
        const mockMessageHandler = jest.fn();
        const mockSend = jest.fn();

        const bot = new MusicBot({});
        bot.messageHandler = mockMessageHandler;
        bot.bot = { user: { id: 123 } };
        bot.setState({ activeTextChannel: { name: channelName } });

        const message = {
          author: { id: 456 },
          channel: { name: channelName, send: mockSend },
          content: '!unknownCommand',
          isMentioned: () => false,
        };

        bot.onMessage(message);

        expect(mockMessageHandler.mock.calls[0][0]).toBe(messageConstants.UNKNOWN_COMMAND);
        expect(mockSend.mock.calls.length).toBe(1);
      });

      it("should call the command handler with the command's alias, args and the message", () => {
        const channelName = 'test-channel';
        const mockCommandHandler = jest.fn();

        const bot = new MusicBot({});
        bot.commandHandler = mockCommandHandler;
        bot.bot = { user: { id: 123 } };
        bot.setState({ activeTextChannel: { name: channelName } });

        const message = {
          author: { id: 456 },
          channel: { name: channelName },
          content: '!help arg1',
          isMentioned: () => false,
        };

        bot.onMessage(message);

        expect(mockCommandHandler.mock.calls[0][0]).toBe(commandKeys.HELP_COMMAND);
        expect(mockCommandHandler.mock.calls[0][1][0]).toBe('arg1');
        expect(mockCommandHandler.mock.calls[0][2]).toEqual(message);
      });
    });
  });

  describe('onDisconnect()', () => {
    it('calls the logger to log an error message to the console', () => {
      const spy = jest.spyOn(global.console, 'error');

      const error = { reason: 'testing', code: 0 };
      const bot = new MusicBot({});

      try {
        bot.onDisconnect(error);
      } catch (e) {} // eslint-disable-line

      expect(spy.mock.calls[0][1]).toBe(
        `Bot was disconnected from server.\nReason: ${error.reason}\nCode: ${error.code}`,
      );

      spy.mockReset();
      spy.mockRestore();
    });

    it('throws an Error when disconnected', () => {
      const error = { reason: 'testing', code: 0 };
      const bot = new MusicBot({});

      let result;

      try {
        bot.onDisconnect(error);
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe('Bot was disconnected from server.');
    });
  });

  describe('init()', () => {
    it('throws an Error if a `token` is not provided', () => {
      const bot = new MusicBot({});

      let result;

      try {
        bot.init();
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe("Failed to initialise: a 'token' was not provided in the config!");
    });

    it('throws an Error if a `serverId` is not provided', () => {
      const bot = new MusicBot({ token: 'abc' });

      let result;

      try {
        bot.init();
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe("Failed to initialise: a 'serverId' was not provided in the config!");
    });

    it('throws an Error if a `textChannelId` is not provided', () => {
      const bot = new MusicBot({ token: 'abc', serverId: 'def' });

      let result;

      try {
        bot.init();
      } catch (e) {
        result = e;
      }

      expect(result.message).toBe("Failed to initialise: a 'textChannelId' was not provided in the config!");
    });

    it('registers the listener functions', () => {
      const bot = new MusicBot({ token: 'abc', serverId: 'def', textChannelId: 'ghi' });

      const mockFn = jest.fn();
      bot.bot.on = mockFn;

      bot.init();

      expect(mockFn.mock.calls[0][0]).toBe('ready');
      expect(mockFn.mock.calls[0][1]).toBeInstanceOf(Function);

      expect(mockFn.mock.calls[1][0]).toBe('message');
      expect(mockFn.mock.calls[1][1]).toBeInstanceOf(Function);

      expect(mockFn.mock.calls[2][0]).toBe('disconnect');
      expect(mockFn.mock.calls[2][1]).toBeInstanceOf(Function);
    });

    it('calls `bot.login` if all is well', () => {
      const token = 'abc';
      const bot = new MusicBot({ token, serverId: 'def', textChannelId: 'ghi' });

      const mockFn = jest.fn();
      bot.bot.login = mockFn;

      bot.init();

      expect(mockFn.mock.calls.length).toBe(1);
      expect(mockFn.mock.calls[0][0]).toBe(token);
    });
  });
});
