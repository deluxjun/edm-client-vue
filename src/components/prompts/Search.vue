<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "search",
  computed: {
    ...mapState(["selected"])
  },
  data: function() {
    return {
      selectedList: null,
      dialogVisible: true
    };
  },
  methods: {
    search: function() {
      this.selectedList = Utils.getCurrentSelect();
      /*
      2020-04-20 : 김준호
      트리에서 우클릭->검색 시 'SEARCH_DEFAULT' 이벤트에 의해서 선택된 폴더값이 카테고리에도 영향을 주기에
      이벤트명을 변경함.
      */
      Event.fire(EventList.LOAD_TREEDATA_FOLDER, this.selectedList);
      this.$Utils.toggleActive("search-menu");
    },
    close() {
      this.$store.commit("closeHovers");
    }
  },
  mounted() {
    this.search();
    this.close();
  }
};
</script>
