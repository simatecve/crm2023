import { IFrameHelper } from 'widget/helpers/utils';
import { APP_SET_BUBBLE_LABEL } from 'shared/constants/sharedFrameEvents';

export const isAnInvalidWidgetTrigger = (eventName, routeName) => {
  const isWidgetTriggerEvent = eventName === 'webwidget.triggered';
  const isOnAnUnreadView = ['unread-messages', 'campaigns'].includes(routeName);
  return isWidgetTriggerEvent && isOnAnUnreadView;
};

export const setBubbleLabel = label => {
  const event = APP_SET_BUBBLE_LABEL;
  IFrameHelper.sendMessage({ event, label });
};
