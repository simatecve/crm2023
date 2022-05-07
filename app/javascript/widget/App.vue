<template>
  <div
    v-if="!conversationSize && isFetchingList"
    class="flex flex-1 items-center h-full bg-black-25 justify-center"
  >
    <spinner size="" />
  </div>
  <div
    v-else
    class="flex flex-col justify-end h-full"
    :class="{
      'is-mobile': isMobile,
      'is-widget-right': isRightAligned,
      'is-bubble-hidden': hideMessageBubble,
      'is-flat-design': isWidgetStyleFlat,
    }"
  >
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { setHeader } from 'widget/helpers/axios';
import { IFrameHelper, RNHelper } from 'widget/helpers/utils';
import configMixin from './mixins/configMixin';
import availabilityMixin from 'widget/mixins/availability';
import { getLocale } from './helpers/urlParamsHelper';
import { isEmptyObject } from 'widget/helpers/utils';
import frameListenerMixin from './mixins/frameListeners';
import Spinner from 'shared/components/Spinner.vue';
import routerMixin from './mixins/routerMixin';
import {
  getExtraSpaceToScroll,
  loadedEventConfig,
} from './helpers/IframeEventHelper';
import {
  ON_AGENT_MESSAGE_RECEIVED,
  ON_CAMPAIGN_MESSAGE_CLICK,
  ON_UNREAD_MESSAGE_CLICK,
} from './constants/widgetBusEvents';

export default {
  name: 'App',
  components: {
    Spinner,
  },
  mixins: [availabilityMixin, configMixin, routerMixin, frameListenerMixin],
  data() {
    return {
      isMobile: false,
    };
  },
  computed: {
    ...mapGetters({
      activeCampaign: 'campaign/getActiveCampaign',
      campaigns: 'campaign/getCampaigns',
      conversationSize: 'conversation/getConversationSize',
      currentUser: 'contacts/getCurrentUser',
      hasFetched: 'agent/getHasFetched',
      hideMessageBubble: 'appConfig/getHideMessageBubble',
      isFetchingList: 'conversation/getIsFetchingList',
      isRightAligned: 'appConfig/isRightAligned',
      isWidgetOpen: 'appConfig/getIsWidgetOpen',
      messageCount: 'conversation/getMessageCount',
      unreadMessageCount: 'conversation/getUnreadMessageCount',
      isWidgetStyleFlat: 'appConfig/isWidgetStyleFlat',
    }),
    isIFrame() {
      return IFrameHelper.isIFrame();
    },
    isRNWebView() {
      return RNHelper.isRNWebView();
    },
  },
  watch: {
    activeCampaign() {
      this.setCampaignView();
    },
  },
  mounted() {
    this.initializeWidgetApp();
  },
  methods: {
    ...mapActions('appConfig', ['setWidgetColor']),
    ...mapActions('conversation', ['fetchOldConversations', 'setUserLastSeen']),
    ...mapActions('campaign', [
      'initCampaigns',
      'executeCampaign',
      'resetCampaign',
    ]),
    ...mapActions('agent', ['fetchAvailableAgents']),
    initializeWidgetApp() {
      const { websiteToken, locale, widgetColor } = window.chatwootWebChannel;
      setHeader('X-Auth-Token', window.authToken);

      this.onSetLocale({ locale });
      this.setWidgetColor(widgetColor);
      this.registerListeners();
      this.sendLoadedEvent();
      this.fetchAvailableAgents(websiteToken);
      this.fetchOldConversations().then(() => {
        if (this.isIFrame) {
          this.setUnreadView();
        }
      });

      if (!this.isIFrame) {
        this.onSetLocale({ locale: getLocale(window.location.search) });
      }

      this.$store.dispatch('contacts/get');
      this.$store.dispatch('conversationAttributes/getAttributes');
      this.registerUnreadEvents();
      this.registerCampaignEvents();
    },
    setIframeHeight(isFixedHeight) {
      this.$nextTick(() => {
        const extraHeight = getExtraSpaceToScroll();
        IFrameHelper.sendMessage({
          event: 'updateIframeHeight',
          isFixedHeight,
          extraHeight,
        });
      });
    },
    registerUnreadEvents() {
      bus.$on(ON_AGENT_MESSAGE_RECEIVED, () => {
        const { name: routeName } = this.$route;
        if (this.isWidgetOpen && routeName === 'messages') {
          this.$store.dispatch('conversation/setUserLastSeen');
        }
        this.setUnreadView();
      });
      bus.$on(ON_UNREAD_MESSAGE_CLICK, () => {
        this.replaceRoute('messages').then(() => this.unsetUnreadView());
      });
    },
    registerCampaignEvents() {
      bus.$on(ON_CAMPAIGN_MESSAGE_CLICK, () => {
        if (this.shouldShowPreChatForm) {
          this.replaceRoute('prechat-form');
        } else {
          this.replaceRoute('messages');
          bus.$emit('execute-campaign', { campaignId: this.activeCampaign.id });
        }
        this.unsetUnreadView();
      });
      bus.$on('execute-campaign', campaignDetails => {
        const { customAttributes, campaignId } = campaignDetails;
        const { websiteToken } = window.chatwootWebChannel;
        this.executeCampaign({ campaignId, websiteToken, customAttributes });
        this.replaceRoute('messages');
      });
    },
    setCampaignView() {
      const { messageCount, activeCampaign } = this;
      const isCampaignReadyToExecute =
        !isEmptyObject(activeCampaign) && !messageCount;
      if (this.isIFrame && isCampaignReadyToExecute) {
        this.replaceRoute('campaigns').then(() => {
          this.setIframeHeight(true);
          IFrameHelper.sendMessage({ event: 'setUnreadMode' });
        });
      }
    },
    setUnreadView() {
      const { unreadMessageCount } = this;

      if (this.isIFrame && unreadMessageCount > 0 && !this.isWidgetOpen) {
        this.replaceRoute('unread-messages').then(() => {
          this.setIframeHeight(true);
          IFrameHelper.sendMessage({ event: 'setUnreadMode' });
        });
        this.handleUnreadNotificationDot();
      }
    },
    unsetUnreadView() {
      if (this.isIFrame) {
        IFrameHelper.sendMessage({ event: 'resetUnreadMode' });
        this.setIframeHeight(false);
        this.handleUnreadNotificationDot();
      }
    },
    handleUnreadNotificationDot() {
      const { unreadMessageCount } = this;
      if (this.isIFrame) {
        IFrameHelper.sendMessage({
          event: 'handleNotificationDot',
          unreadMessageCount,
        });
      }
    },
    registerListeners() {
      if (!this.isIFrame && !this.isRNWebView) {
        return;
      }

      window.addEventListener('message', this.onIFramePostMessage);
    },
    sendLoadedEvent() {
      if (this.isIFrame) {
        IFrameHelper.sendMessage(loadedEventConfig());
      }
      if (this.isRNWebView) {
        RNHelper.sendMessage(loadedEventConfig());
      }
    },
  },
};
</script>

<style lang="scss">
@import '~widget/assets/scss/woot.scss';
</style>
