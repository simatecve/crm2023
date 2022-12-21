<template>
  <variable :items="items" @mention-select="handleVariableClick" />
</template>

<script>
const variables = [
  {
    label: 'Conversation Id',
    key: 'conversation.id',
  },
  {
    label: 'Contact Id',
    key: 'contact.id',
  },
  {
    label: 'Contact name',
    key: 'contact.name',
  },
  {
    label: 'Contact email',
    key: 'contact.email',
  },
  {
    label: 'Contact phone',
    key: 'contact.phone',
  },
  {
    label: 'Agent name',
    key: 'agent.name',
  },
  {
    label: 'Agent email',
    key: 'agent.email',
  },
];
import Variable from '../variable/Variable.vue';

export default {
  components: { Variable },
  props: {
    searchKey: {
      type: String,
      default: '',
    },
  },
  computed: {
    items() {
      return variables.filter(variable => {
        return (
          variable.label.includes(this.searchKey) ||
          variable.key.includes(this.searchKey)
        );
      });
    },
  },
  methods: {
    handleVariableClick(item = {}) {
      this.$emit('click', item.key);
    },
  },
};
</script>
