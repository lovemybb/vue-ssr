import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


export function createRouter() {
    return new Router({
        mode: 'history',
        routes: [{
            path: '/',
            component: () => import('./components/Home.vue')
        }, {
            path: '/list',
            component: () => import('./components/list.vue')
        }, {
            path: '/unit',
            component: () => import('./components/unit.vue')
        }, {
            path: '/video',
            component: () => import('./components/unit.vue')
        }]
    })
}