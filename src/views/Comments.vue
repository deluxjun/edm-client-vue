<template>
  <div v-if="permissions.read" class="comments" >
    <div v-if="permissions.edit && permissions.add" class="comment-input">
      <el-input v-if="permissions.edit && permissions.add" type="textarea" v-model="newComment"  
        :placeholder="$t('messages.inputMessage')" ></el-input>
        <el-button class="add-btn" v-show="isShowingSubmit" @click="submitComment" size="small"> {{ $t('label.add') }} </el-button>
    </div>
    <div v-loading="isLoading">
      <article class="message is-small" v-for="list in commentList" >
        <div class="message-header">
          <p>{{ $Utils.getIdName(list.creatorId, list.creatorName) }} </p> <span class="comment-created" >{{ $Utils.formatMoment(list.createdAt) }}</span>
          <button v-if="isOwner(list)" class="delete is-small" aria-label="delete" v-on:click="deleteComment(list.id)"></button>
        </div>
        <div class="message-body">
          {{ list.content }}
        </div>
      </article>
    </div>
    <el-button v-if="seemore" @click="getCommentList(true)" :disabled="isLoading" size="small">{{ $t('buttons.more') }}</el-button>

  </div>
</template>

<script>
import * as api from '@/utils/api'
import { mapState } from 'vuex'

export default {
  name: 'comments',
  props: {
    permissions : {
      required : true,
      type: Object
    },
    elementId: {
      required: true
    }

  },
  data () {
    return {
      newComment: "",
      commentList: [],
      isLoading: true,
      destroyed : false,
      page: 1,
      pageSize: 10,
      seemore:false,
    }
  },
  computed: {
    ...mapState(['info', 'user']),
    isShowingSubmit() {
      return this.newComment.length > 0
    }
  },
  created() {
    let check = () => {
      if (!this.destroyed) {
        
        this.getCommentList()
        setTimeout(check, 10*1000)
        return
      }
    }

    check()

  },
  mounted() {

  },
  beforeDestroy() {
    this.destroyed = true
  },
  methods: {
    isOwner(list) {
      return this.user.userId === list.creatorId
    },
      getCommentList:function(more = false){
        if (!more) {
          this.page = 1
        } else {
          this.page ++
        }
        this.isLoading = true
        api.getComment(this.elementId, this.page, this.pageSize).then(data=>{
            var cnt=data.list.length;
            if(cnt==0){
                if(this.page>1)
                    this.page-=1;
            }

            // clear
            if (!more) {
              this.commentList.splice(0, this.commentList.length)
            }

            // add all
            for(var i=0;i<cnt;i++){
              this.commentList.push(data.list[i]);
            }

            if(cnt >= this.pageSize )
              this.seemore=true;
            else
              this.seemore=false;

            this.isLoading=false;
        }).catch(error=>{
            console.log(error)
            this.isLoading=false;
        });
      },

      deleteComment:function(commentId){
            let successMessage=this.$t('success.complete')
            api.deleteComment(this.elementId,commentId).then(data=>{
                this.commentList.splice(this.commentList.findIndex(e => e.id === commentId), 1);
                // this.getCommentList();
            });
      },
      submitComment:function(){
            let successMessage=this.$t('success.complete')
            if(this.newComment.length < 1)
              return
            api.submitComment(this.elementId,this.newComment).then(data=>{
                this.newComment="";
                this.commentList.splice(0,0, data.list[0]);
                // this.getCommentList();
            });
      },

  }
}

</script>
<style>
.comment-created {
  color: darkgray;
}

.comment-input {
  margin-bottom: 10px;
}

.message:not(:last-child) {
    margin-bottom: 5px;
}
.add-btn{
  margin-top: 5px;
}
</style>
