import { mapActions } from 'vuex';
import { IFrameHelper } from 'widget/helpers/utils';
import {
  SDK_ON_CAPTURE_EVENT,
  SDK_INITIALIZE,
  SDK_ON_LOCATION_CHANGE,
  SDK_ON_TOGGLE_CLOSE_BUTTON,
  SDK_SET_CONVERSATION_LABEL,
  SDK_REMOVE_CONVERSATION_LABEL,
  SDK_SET_USER,
  SDK_SET_CUSTOM_ATTRIBUTES,
  SDK_REMOVE_CUSTOM_ATTRIBUTE,
  SDK_SET_LOCALE,
  SDK_ON_WIDGET_OPEN,
  SDK_SET_BUBBLE_VISIBILITY,
} from '../../../shared/constants/sharedFrameEvents';
import { isAnInvalidWidgetTrigger, setBubbleLabel } from './helpers';

export default {
  methods: {
    ...mapActions('appConfig', ['setAppConfig', 'setReferrerHost']),

    setConfigFromSDK(message) {
      this.onSetLocale(message);
      this.setAppConfig(message);
    },

    onSDKLocationChange(message) {
      const { websiteToken } = window.chatwootWebChannel;
      const { referrerURL, referrerHost } = message;

      this.initCampaigns({
        currentURL: referrerURL,
        websiteToken,
        isInBusinessHours: this.isInBusinessHours,
      });
      window.referrerURL = referrerURL;
      this.setReferrerHost(referrerHost);
    },

    onToggleCloseButton(message) {
      this.isMobile = message.isMobile;
    },

    onCaptureEvent(message) {
      if (isAnInvalidWidgetTrigger(message.eventName, this.$route.name)) {
        return;
      }

      this.$store.dispatch('events/create', { name: message.eventName });
    },

    onSetConversationLabel(message) {
      this.$store.dispatch('conversationLabels/create', message.label);
    },

    onRemoveConversationLabel(message) {
      this.$store.dispatch('conversationLabels/destroy', message.label);
    },

    onSetUser(message) {
      this.$store.dispatch('contacts/update', message);
    },

    onSetCustomAttributes({ customAttributes }) {
      this.$store.dispatch('contacts/setCustomAttributes', customAttributes);
    },

    onRemoveCustomAttribute({ customAttribute }) {
      this.$store.dispatch('contacts/deleteCustomAttribute', customAttribute);
    },

    onSetLocale({ locale }) {
      const { enabledLanguages } = window.chatwootWebChannel;
      if (enabledLanguages.some(lang => lang.iso_639_1_code === locale)) {
        this.$root.$i18n.locale = locale;
      }

      if (this.isIFrame) {
        setBubbleLabel(this.$t('BUBBLE.LABEL'));
      }
    },

    onWidgetOpen(message) {
      this.$store.dispatch('appConfig/toggleWidgetOpen', message.isOpen);

      const shouldShowMessageView =
        ['home'].includes(this.$route.name) &&
        message.isOpen &&
        this.messageCount;
      const shouldShowHomeView =
        !message.isOpen &&
        ['unread-messages', 'campaigns'].includes(this.$route.name);

      if (shouldShowMessageView) {
        this.replaceRoute('messages');
      }
      if (shouldShowHomeView) {
        this.$store.dispatch('conversation/setUserLastSeen');
        this.unsetUnreadView();
        this.replaceRoute('home');
      }
      if (!message.isOpen) {
        this.resetCampaign();
      }
    },

    onSetBubbleVisiblity(message) {
      this.$store.dispatch(
        'appConfig/setBubbleVisibility',
        message.hideMessageBubble
      );
    },

    onIFramePostMessage(e) {
      if (!IFrameHelper.isAValidEvent(e)) {
        return;
      }

      const message = IFrameHelper.getMessage(e);

      const SDK_EVENTS = {
        [SDK_INITIALIZE]: this.setConfigFromSDK,
        [SDK_ON_LOCATION_CHANGE]: this.onSDKLocationChange,
        [SDK_ON_TOGGLE_CLOSE_BUTTON]: this.onToggleCloseButton,
        [SDK_ON_CAPTURE_EVENT]: this.onCaptureEvent,
        [SDK_SET_CONVERSATION_LABEL]: this.onSetConversationLabel,
        [SDK_REMOVE_CONVERSATION_LABEL]: this.onRemoveConversationLabel,
        [SDK_SET_USER]: this.onSetUser,
        [SDK_SET_CUSTOM_ATTRIBUTES]: this.onSetCustomAttributes,
        [SDK_REMOVE_CUSTOM_ATTRIBUTE]: this.onRemoveCustomAttribute,
        [SDK_SET_LOCALE]: this.onSetLocale,
        [SDK_ON_WIDGET_OPEN]: this.onWidgetOpen,
        [SDK_SET_BUBBLE_VISIBILITY]: this.onSetBubbleVisiblity,
      };

      const { event } = message;
      if (SDK_EVENTS[event] && typeof SDK_EVENTS[event] === 'function') {
        SDK_EVENTS[event](message);
      }
    },
  },
};
