const pinObjSchema = {
  default: {
    keys: {
      priv: {},
      pub: {},
      seed: {},
      imported: {},
    },
    coins: {},
    cache: {},
    exchanges: {},
    settings: {},
    addressBook: {},
  },
  watchonly: {
    keys: {
      pub: {},
    },
    coins: {},
    cache: {},
    exchanges: {},
    settings: {},
    addressBook: {},
  },
  offline: {
    keys: {
      priv: {},
      pub: {},
    },
    coins: {},
    cache: {},
    settings: {},
  },
  multisig: {
    keys: {
      priv: {},
      pub: {},
      seed: {},
    },
    coins: {},
    cache: {},
    settings: {},
    sigData: {},
    addressBook: {},
  },
  native: {
    keys: {
      imported: {},
    },
    coins: {},
    cache: {},
    settings: {},
    addressBook: {},
  },
};

module.exports = pinObjSchema;