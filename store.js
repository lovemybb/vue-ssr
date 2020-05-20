// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)



export function createStore() {
  return new Vuex.Store({
    state: {
      items: {},
      asyncDataRuns: []
    },
    actions: {
      fetchItem({
        commit
      }, id) {
        // `store.dispatch()` 会返回 Promise，
        // 以便我们能够知道数据在何时更新
        return setTimeout(() => {
          commit('setItem', {
            id,
            item: new Date().getTime()
          })
        }, 100);

      }
    },
    mutations: {
      setItem(state, {
        id,
        item
      }) {
        Vue.set(state.items, id, item)
      },
      setAsyncDataRun(state, {
        name
      }) {
        state.asyncDataRuns.push(name)
      }
    }
  })
}