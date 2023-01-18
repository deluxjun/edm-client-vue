<template>
    <component v-if="component" :is="component"></component>
    <iframe id="iframe" v-else src="" class='loginFrame' frameborder="0" scrolling="no" marginwidth="0" marginheight="0"></iframe>
    <!-- <div  v-else id="iframe">&nbsp;</div> -->
</template>

<script>
import Vue from 'vue'

// function loadComponent(){
//   return new Promise((resolve, reject) => {
//    let script = document.createElement('script')
//    script.onload = () => {
//     resolve()
//    }
//    script.async = true
//    script.src = 'static/CustomLogin.js'
//    document.head.appendChild(script)
//   })
// };
// Vue.component('login', () => loadComponent())


export default {
  name: 'loginWrapper',
  data: function () {
    return {
      component: null,
      loginUrl: null
    }
  },
  computed: {
  },
  mounted () {
    let myvue = this
    // $('#iframe').onload = function(){
    //   var that = $(this)[0];
    //   try{
    //     that.contentDocument;
    //   }
    //   catch(err){
    //     console.error(err)
    //     myvue.component = () => import('./Login')
    //   }
    // };

  },
  watch: {
  },
  created(){

    let myvue = this
    let loginUrl = this.$Utils.features('login.customUrl')
    if (loginUrl) {
      let baseUrl = store.state.webBaseURL || ''
      baseUrl = `${baseUrl}/static/${loginUrl}`
      this.loginUrl = baseUrl

      $(function() {
          // var infoBox = document.getElementById("iframe");
          // var xhr = new XMLHttpRequest();
          // xhr.onreadystatechange = function() {
          //   if (xhr.readyState != 4) return;
          //   if (xhr.status != 200) {
          //     console.error("login load fail : " + xhr.status)
          //     this.loginUrl = null
          //     myvue.component = () => import('./Login')
          //     return;
          //   }
          //   infoBox.innerHTML = xhr.responseText;
          // };
          // xhr.open("GET", baseUrl, true);
          // xhr.send(null);

          jQuery.ajax({
              type : "GET",
              async : true,
              url : baseUrl
          })
          .done(function() {
              $("#iframe").attr("src", baseUrl);
          })
          .fail(function(jqXHR, textStatus, errorThrown){
            // Handle error perhaps a failover url
            console.error("login fail : " + errorThrown)
            this.loginUrl = null
            myvue.component = () => import('./Login')
          })
      });
    }
    else
      this.component = () => import('./Login')


  },
  methods: {

  }
}
</script>

<style>
.loginFrame{
   height: calc(100% - 100px);
   width:100%; 
   border: 0px;
}
</style>
