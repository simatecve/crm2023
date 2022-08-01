<template>
  <div class="container">
    <edit-article-header
      back-button-label="All Articles"
      draft-state="saved"
      @back="onClickGoBack"
    />
    <div v-if="isFetching" class="text-center p-normal fs-default h-full">
      <spinner size="" />
      <span>{{ $t('HELP_CENTER.EDIT_ARTICLE.LOADING') }}</span>
    </div>
    <article-editor v-else :article="article" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EditArticleHeader from '../../components/Header/EditArticleHeader.vue';
import ArticleEditor from '../../components/ArticleEditor.vue';
import Spinner from 'shared/components/Spinner';

export default {
  components: {
    EditArticleHeader,
    ArticleEditor,
    Spinner,
  },
  computed: {
    ...mapGetters({
      isFetching: 'articles/isFetching',
    }),
    article() {
      return this.$store.getters['articles/articleById'](this.articleId);
    },
    articleId() {
      return this.$route.params.articleSlug;
    },
    portalSlug() {
      return this.$route.params.portalSlug;
    },
  },
  mounted() {
    this.fetchArticleDetails();
  },
  methods: {
    onClickGoBack() {
      this.$router.push({ name: 'list_all_locale_articles' });
    },
    fetchArticleDetails() {
      this.$store.dispatch('articles/show', {
        id: this.articleId,
        portalSlug: this.portalSlug,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: var(--space-small) var(--space-normal);
  width: 100%;
}
</style>
