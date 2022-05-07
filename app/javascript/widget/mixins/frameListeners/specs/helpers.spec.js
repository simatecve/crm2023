import { isAnInvalidWidgetTrigger, setBubbleLabel } from '../helpers';

describe('#frameListenerHelpers', () => {
  describe('#isAnInvalidWidgetTrigger', () => {
    it('return the value properly', () => {
      expect(
        isAnInvalidWidgetTrigger('webwidget.triggered', 'campaigns')
      ).toEqual(true);

      expect(
        isAnInvalidWidgetTrigger('webwidget.triggered', 'unread-messages')
      ).toEqual(true);

      expect(isAnInvalidWidgetTrigger('webwidget.triggered', 'home')).toEqual(
        false
      );

      expect(isAnInvalidWidgetTrigger('user.click', 'campaigns')).toEqual(
        false
      );
    });
  });

  describe('#', () => {
    it('sends the event properly', () => {
      const { postMessage } = window.top;
      window.top.postMessage = jest.fn();

      setBubbleLabel('Chat with Sales!');
      expect(window.top.postMessage).toHaveBeenCalledWith(
        'chatwoot-widget:{"event":"setBubbleLabel","label":"Chat with Sales!"}',
        '*'
      );

      window.top.postMessage = postMessage;
    });
  });
});
