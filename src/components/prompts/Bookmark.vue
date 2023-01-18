<template>

</template>
<script>
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import Utils from '@/utils/utils'
export default {
  name: 'bookmark',
  computed: {
    ...mapState(['selected'])
  }, 
  data: function () {
    return {
      selectedList:null
    }
  },
  methods:{
    addBookmark:function(object_id,type){
        var successMessage=this.$t('bookmark.addbookmarkmsg');
        api.addBookmark(object_id,type).then(data=>{
            Utils.showResultMessage(true,successMessage)
            Event.fire(EventList.RELOAD_LIST);
        }).catch(error=>{
            Utils.showResultMessage(false,error,this);
        });
        this.close();
    },
    removeBookmark:function(object_id){
        var successMessage=this.$t('bookmark.removebookmarkmsg');
        api.removeBookmark(object_id).then(data=>{
            Utils.showResultMessage(true,successMessage)
            Event.fire(EventList.RELOAD_LIST);
        }).catch(error=>{
            Utils.showResultMessage(false,error,this);
        });
        this.close();
    },
    close(){
        this.$store.commit('closeHovers')
    }
  },
  created() {
    this.selectedList=Utils.getCurrentSelect();
    var count=this.selectedList.length
    if(count==1){
        var isbookmarked=this.selectedList[0].bookmarked;
        if(isbookmarked==undefined){
            var type=this.selectedList[0].docTypeName || "FOLDER"; //from treeview
            if(type=="FOLDER"){
                this.addBookmark(this.selectedList[0].r_object_id,0);
            }
            else{
                this.addBookmark(this.selectedList[0].r_object_id,1);
            }
        }
        else{
            this.removeBookmark(this.selectedList[0].r_object_id);
        }
    }
    else this.close();
  }
}
</script>
