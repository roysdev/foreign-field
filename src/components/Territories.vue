<template>
  <div class="territories">
    <h4 class="pt-3 pl-3 w-100 text-left">Service Group: {{groupCode}}</h4>
    <header class="w-100 m-0 p-3 row align-items-center justify-content-between">
      <b-dropdown right variant="secondary">
        <span slot="button-content">
          <font-awesome-icon icon="filter" />
          {{availability}}
        </span>
        <b-dropdown-item
          class="availability-filter w-100 p-0"
          v-for="avail in availabilityFilters"
          v-bind:key="avail"
          @click="() => setAvailability(avail)">
          <font-awesome-icon class="selected" icon="check" v-if="availability === avail" />
          {{avail}}
        </b-dropdown-item>
      </b-dropdown>
      <br>
      <b-dropdown class="sort-btn" right variant="secondary">
        <span slot="button-content">
          <font-awesome-icon icon="sort-amount-down-alt" />
          {{sortOption}}
        </span>
        <b-dropdown-item v-for='option in sortOptions' :key="option" @click="() => sort(option)">
          <font-awesome-icon class="selected" icon="check" v-if="sortOption === option" /> {{option}}
        </b-dropdown-item>
      </b-dropdown>
    </header>
    <Loading v-if="loading"></Loading>
    <div v-else>
      <b-list-group class="columns flex-row flex-wrap">
        <b-list-group-item
          v-for="terr in filteredTerritories"
          v-bind:key="terr.id"
          data-toggle="collapse"
          class="territory-card col-md-6 pl-4 pr-4">
          <TerritoryCard :terr="terr" :groupCode="groupCode" :selectTerritory="selectTerritory" :fetch="fetch">
          </TerritoryCard>
        </b-list-group-item>
      </b-list-group>
      <CheckoutModal :territory="selectedTerritory" :fetch="fetch"></CheckoutModal>
    </div>
    <span class="p-2" v-if="!loading && filteredTerritories && filteredTerritories.length === 0">
      There are no {{availability}} territories
    </span>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TerritoryCard from './TerritoryCard.vue';
import CheckoutModal from './CheckoutModal.vue';
import Loading from './Loading.vue';
import orderBy from 'lodash/orderBy';

export default {
  name: 'Territories',
  components: {
    TerritoryCard,
    CheckoutModal,
    Loading,
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.groupCode = to.params.group;
    this.fetch();
  },

  data() {
    return {
      groupCode: '',
      selectedTerritory: {},
      cities: [],
      availability: '',
      availabilityFilters: [
        'All',
        'Available',
        'Checked Out',
        'Recently Worked',
      ],
      sortOption: 'Description',
      sortOptions: [
        'Name',
        'Description',
      ],
    };
  },

  computed: {
    ...mapGetters({
      congId: 'auth/congId',
      user: 'auth/user',
      token: 'auth/token',
      territories: 'territories/territories',
      loading: 'territories/loading',
    }),

    filteredTerritories() {
      if (this.availability === 'All') {
        const allTerrs = this.territories;
        return orderBy(allTerrs, this.sortOption.toLowerCase());
      }
      const filtered = this.territories && this.territories.filter(t => t.status && t.status.status === this.availability);
      return orderBy(filtered, this.sortOption.toLowerCase());
    },
  },

  watch: {
    congId() {
      this.fetch();
    },
    async token() {
      await this.fetch();
    },
  },

  methods: {
    selectTerritory(territory) {
      this.selectedTerritory = territory;
    },

    async setAvailability(value) {
      this.availability = value;
      await this.$store.dispatch('territories/fetchTerritories', {
        congId: this.congId,
        groupCode: this.groupCode,
      });
      sessionStorage.setItem('availability', value);
    },

    sort(value) {
      this.sortOption = value;
    },

    async fetch() {
      const congId = this.congId || (this.user && this.user.congId);
      this.groupCode = this.$route.params.group;
      this.availability = sessionStorage.getItem('availability') || 'Available';
      await this.$store.dispatch('territories/fetchTerritories', {
        congId,
        groupCode: this.groupCode,
      });
      await this.fetchPublishers(congId);
    },

    ...mapActions({
      resetTerritories: 'territories/resetTerritories',
      fetchPublishers: 'publishers/fetchPublishers',
      setLeftNavRoute: 'auth/setLeftNavRoute',
    }),
  },

  mounted() {
    this.setLeftNavRoute('/');
    this.fetch();
  },
};
</script>

<style scoped lang="scss">
.availability-filter, .sort-btn {
  .selected {
    margin-left: -20px;
  }
}
header {
  padding: 1.25rem 2rem;
}
.list-group {
  display: flex;
}
h4 {
  margin: 0;
  font-size: 18px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.list-group-item {
  text-align: left;
  padding: 0.75rem 2rem;
  border-width: 2px;
}
.list-group-item:hover {
  cursor: pointer;
}
.list-group-item a {
  padding-top: 0.4rem;
}
.list-group-item h5 {
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.recently-worked-button {
  background: transparent;
}
.list-group-item .checkout-publisher-dropdown>button.btn.btn-link {
  padding: 0 !important;
}

@media print {
  .columns {
    columns: 2;
  }
}
</style>
