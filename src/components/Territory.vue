<template>
  <div class="territory h-100">
    <div v-if="isLoading" class="font-weight-bold m-0 mt-2 mr-2 ml-2 medium">
      Please wait <font-awesome-icon icon="circle-notch" spin></font-awesome-icon>
    </div>
    <div v-else class="h-100">
      <header class="w-100 pl-2 pr-2">
        <div class="w-100">
          <div class="w-100 d-flex justify-content-between pt-3">
            <div class="text-left">
              <h4 class="mb-0">{{primaryCity}}</h4>
              <span>{{secondaryCities}}</span>
            </div>
            <h4 class="text-right">
                <font-awesome-icon
                  class="text-primary"
                  icon="sms"
                  size="sm"
                  @click="openSMSMobile()">
                </font-awesome-icon> {{territoryName}}
            </h4>
          </div>
          <div class="w-100 d-flex justify-content-between pb-3 pt-2">
            <b-button-group size="sm">
              <b-button variant="info" :to="`/territories/${group}/${id}`" :pressed="viewMode==='address-list'">
                List
              </b-button>
              <b-button variant="info" :to="`/territories/${group}/${id}/map`" :pressed="viewMode==='map-view'">
                Map
              </b-button>
            </b-button-group>
            <b-button-group v-if="viewMode==='address-list'" size="sm">
              <b-button v-if="isCheckedOut && (canWrite || isOwnedByUser)" variant="warning" @click="checkIn(true)">
                Check In
              </b-button>
              <b-button v-if="canWrite" variant="success" :to="`/territories/${group}/${id}/addresses/add`">
                <font-awesome-icon icon="plus"></font-awesome-icon> New Address
              </b-button>
            </b-button-group>
            <b-button-group v-if="viewMode==='map-view'" size="sm">
              <b-button variant="primary" :to="`/territories/${group}/${id}/optimize`">
                Optimize
              </b-button>
            </b-button-group>
          </div>
        </div>
      </header>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import get from 'lodash/get';
import TerritoryMap from './TerritoryMap.vue';

export default {
  name: 'Territory',
  components: {
    TerritoryMap,
  },
  props: ['group', 'id'],
  async mounted() {
    if (this.token) {
      await this.getTerritory(this.id);
    }
    this.isLoading = false;
  },
  data() {
    return {
      isLoading: true,
      reset: false,
      workInProgress: {},
      viewMode: 'address-list',
    };
  },
  computed: {
    ...mapGetters({
      territory: 'territory/territory',
      authIsLoading: 'auth/loading',
      user: 'auth/user',
      canWrite: 'auth/canWrite',
      canManage: 'auth/canManage',
      ownedBy: 'territory/isOwnedByUser',
    }),
    isCheckedOut() {
      return this.territory && this.territory.status && this.territory.status.status === 'Checked Out';
    },
    isRecentlyWorked() {
      return this.territory && this.territory.status && this.territory.status.status === 'Recently Worked';
    },
    cityNames() {
      return this.territory && this.territory.city ? this.territory.city.split(',') : [];
    },
    primaryCity() {
      return this.cityNames[0];
    },
    secondaryCities() {
      if (this.cityNames.length > 1 && this.cityNames.length <= 3) {
        return `also: ${this.cityNames.slice(1).join(',')}`;
      }
      if (this.cityNames.length > 3) {
        return `also: ${this.cityNames.length} cities`;
      }

      return '';
    },
    territoryName() {
      return this.territory && this.territory.name ? this.territory.name : '';
    },
    lastActivity() {
      return this.territory.lastActivity;
    },
    isOwnedByUser() {
      return this.ownedBy === get(this.user, 'username');
    },
  },
  methods: {
    ...mapActions({
      getTerritory: 'territory/getTerritory',
      resetNHRecords: 'territory/resetNHRecords',
      checkinTerritory: 'territory/checkinTerritory',
    }),

    async checkIn() {
      const response = await this.$bvModal.msgBoxConfirm('Ready to check-in the territory?', {
        title: `${this.territory.name}`,
        centered: true,
      });

      if (response) {
        this.checkInandReset();
      }
    },

    async checkInandReset() {
      this.isLoading = true;
      await this.resetNHRecords(this.id);
      await this.checkinTerritory({
        territoryId: this.id,
        userId: get(this.territory, 'status.publisher.id'),
        username: this.user.username,
      });
      this.isLoading = false;
      await this.$router.push({ name: 'home' });
      this.checkInToast('success');
    },

    checkInToast(variant = null) {
      this.$bvToast.toast('Territory checked in.', {
        title: 'Nice Work!',
        variant,
        solid: true,
      });
    },

    openSMSMobile() {
      window.open(`sms:&body=Work this territory with me!%0a%0a${window.location.href}`, '_self');
      return false;
    },
  },
  watch: {
    '$route.name': {
      // vue watch handlers does not allow arrow function syntax
      // eslint-disable-next-line
      handler: function (value) {
        this.viewMode = value;
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style scoped>
.list-group {
  display: block;
}
.columns {
  columns: 1;
}
.columns > [class*="col-"] {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
    width: 100%;
    float: none;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.add-new {
    font-size: 24px;
  }
@media (min-width: 769px) {
  .columns {
    columns: 2;
  }
}
@media print {
  .columns {
    columns: 2;
  }
}
</style>
