<template>
<div id="arcDiv">
    <kendo-chart ref="chart"
                 :title-text="MainName"
                 :title-position="'bottom'"
                 :chart-area-background="''"
                 :legend-visible="true"
                 :series-defaults-labels-visible="true"
                 :series-defaults-labels-background="'transparent'"
                 :series-defaults-labels-template="labeltemplate"
                 :series="series"
                 :tooltip-visible="true"
                 :tooltip-position='inside'
                 :theme="'sass'">
    </kendo-chart>
</div>
</template>



<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState,mapActions } from 'vuex'
import Utils from '@/utils/utils'
import { Chart,
        ChartSeriesItem,
        Sparkline,
        SparklineSeriesItem,
        StockChart,
        ChartInstaller } from '@progress/kendo-charts-vue-wrapper'

Vue.use(ChartInstaller)

export default {
  name: 'arc-page',
  components:{
    Chart
  },
  props: {
        containerHeight: {
            default: '700px',
            type: String
        },
  },
  data: function () {
    return {
            labeltemplate: '#= category # #= value #%',
            series: [],
            MainName: '',
            inside : 'inside',
            areaW : '100%',
            areaH : '100%',
            // :chart-area-height="areaH"
            // :chart-area-width="areaW"
            chartArea : {
				width : this.areaW,
				height : this.areaH
			}
    }
  },
  mounted() {
    this.init();
  },
  methods: {
      init(param){
         let all = api.getStatisticRepository()
        .then(data => { 
           this.series=[{
                type: 'pie',
                data: [{
                    category: this.$t('Statistic.use')+" ["+ Utils.volumeFormat2(parseInt(data.list[1].spaceLeft))+"GB]",
                    value : ((parseInt(data.list[1].maxSpace)-(parseInt(data.list[1].maxSpace)-parseInt(data.list[1].spaceLeft)))/(parseInt(data.list[1].maxSpace)) *100).toFixed(2),
                    color: '#ffd246',
                    physicalVolume: Utils.volumeFormat2(parseInt(data.list[1].spaceLeft))
                },
                {
                    category: this.$t('Statistic.left')+" ["+ Utils.volumeFormat2((parseInt(data.list[1].maxSpace)-parseInt(data.list[1].spaceLeft)))+"GB]",
                    value : ((parseInt(data.list[1].maxSpace)-parseInt(data.list[1].spaceLeft))/(parseInt(data.list[1].maxSpace)) *100).toFixed(2),
                    color: '#ff6358',
                    physicalVolume: Utils.volumeFormat2(parseInt(data.list[1].maxSpace)-(parseInt(data.list[1].maxSpace)-parseInt(data.list[1].spaceLeft))),
                    explode: true
                }],
           }]
           this.MainName=data.list[1].name
        })
        .catch((error) => {
            console.log(error); 
        });

      },
  }
}
</script>


<style lang="scss">

</style>