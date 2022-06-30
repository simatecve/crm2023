import localforage from 'localforage';

const dbStorage = localforage.createInstance({
  name: 'chatwoot-db',
});

export default dbStorage;
