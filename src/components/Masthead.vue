<template>
  <div class="lead">
    <vue-pull-refresh class="bg-primary" :on-refresh="onRefresh" :config="refreshOptions">
      <b-navbar class="border-warning gold-bottom" type="dark" variant="primary" toggleable fill>
        <b-link class="button text-white-50" @click="back">
          <font-awesome-icon icon="chevron-left" v-show="showLeftNav"></font-awesome-icon>
        </b-link>
        <b-navbar-toggle target="nav_dropdown_collapse"></b-navbar-toggle>
        <b-collapse is-nav id="nav_dropdown_collapse">
          <b-navbar-nav>
            <b-nav-item to="/">Home</b-nav-item>
            <b-nav-item-dropdown v-if="canWrite" class="group-codes" text="Territories">
              <b-dropdown-item v-for="group in groupCodes" v-bind:key="group" :to="`/territories/${group}`" class="w-100">
                <font-awesome-icon icon="check" v-if="group === groupCode" /> {{group}}
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item
              v-if="canWrite && matchingRouteNames.includes('territory')"
              :to="`/territories/${territory.group_code}/${territory.id}/optimize`">
              Optimize
            </b-nav-item>
            <b-nav-item v-if="canRead" :to="`/dnc/${this.user.congregation.id}`">DNC</b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown v-if="isAuthenticated" right>
              <span slot="text">{{name}}</span>
              <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </vue-pull-refresh>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VuePullRefresh from 'vue-pull-refresh';

export default {
  name: 'Masthead',
  components: {
    VuePullRefresh,
  },
  watch: {
    $route(to) {
      if (to.params.group) {
        this.groupCode = to.params.group;
      }
    },
  },
  data() {
    return {
      groupCode: this.$route.params.group,
      permissions: {
        territories: ['Admin', 'TS', 'GO', 'SO'],
      },
      refreshOptions: {
        errorLabel: 'Unable to reload',
        startLabel: 'Starting reload',
        readyLabel: 'Ready',
        loadingLabel: 'Reloading',
      },
    };
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/signout');
    },
    async onRefresh() {
      this.$router.go();
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
    back() {
      if (this.leftNavRoute) {
        this.$router.push(this.leftNavRoute);
      } else {
        this.$router.go(-1);
      }
    },
  },

  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      isAuthorized: 'auth/isAuthorized',
      user: 'auth/user',
      name: 'auth/name',
      congId: 'auth/congId',
      terrCongId: 'territory/congId',
      groupCodes: 'auth/groupCodes',
      leftNavRoute: 'auth/mastheadLeftNavRoute',
      canManage: 'auth/canManage',
      canWrite: 'auth/canWrite',
      canRead: 'auth/canRead',
      territory: 'territory/territory',
    }),
    showLeftNav() {
      return this.$route.name !== 'home';
    },
    matchingRouteNames() {
      return this.$route.matched.map(r => r.name);
    },
  },
};
</script>

<style lang="scss">
.pull-down-header {
  background-color: unset;
}
.gold-bottom {
  border-bottom: solid 6px;
}
</style>
