<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "customURL",
  computed: {
    ...mapState(["selected"]),
  },
  props: {
    type: String,
  },
  data: function () {
    return {
      selectedList: null,
      dialogVisible: true,
    };
  },
  methods: {
    init() {
      //alert();
      if (this.type == "synchronIn") {
        let url = Utils.featuresDefault("synchronIn", false);
        if (url) {
          Utils.fileDownload(url);
        } else {
          alert("요청하신 URL이 없습니다.");
        }
      } else if (this.type == "synchronOut") {
        let url = Utils.featuresDefault("synchronOut", false);
        if (url) {
          Utils.fileDownload(url);
        } else {
          alert("요청하신 URL이 없습니다.");
        }
      } else if (this.type == "synchronHistory") {
        let url = Utils.featuresDefault("synchronHistory", false);
        if (url) {
          window.open(url, "_blank");
        } else {
          alert("요청하신 URL이 없습니다.");
        }
      } else if (this.type == "exitTrans") {
        let url = Utils.featuresDefault("exitTrans", false);
        if (url) {
          console.log(this.selectedList[0].r_object_id);
          let jobid = "";
          if (this.selectedList[0].attrList) {
            jobid = this.selectedList[0].attrList.find(
              (x) => x.name === "ext:jobid"
            ).value;
          }
          let data = {
            elementid: this.selectedList[0].r_object_id,
            jobid: jobid,
          };
          console.log("???");
          Utils.postIframe(url, data);
          this.$showSuccess();
        } else {
          alert("요청하신 URL이 없습니다.");
        }
      } else if (this.type == "exitTransHistory") {
        let url = Utils.featuresDefault("exitTransHistory", false);

        let jobid = "";
        if (this.selectedList[0].attrList) {
          jobid = this.selectedList[0].attrList.find(
            (x) => x.name === "ext:jobid"
          ).value;
        }

        if (url && jobid) {
          let form = document.createElement("form");
          form.setAttribute("method", "post");
          form.setAttribute("action", url);
          form.setAttribute("target", "popup_id");

          let input = document.createElement("input");
          input.type = "hidden";
          input.name = "regDeptCode";
          input.value = jobid;
          form.appendChild(input);

          document.body.appendChild(form);

          if (
            /Chrome/.test(navigator.userAgent) &&
            /Google Inc/.test(navigator.vendor)
          ) {
            window.open(url, "popup_id");
          } else {
            window.open(
              url,
              "popup_id",
              "resizable=yes,toolbar=yes,menubar=yes,location=yes"
            );
          }

          form.submit();

          document.body.removeChild(form);
        } else if (url) {
          window.open(url, "_blank");
        } else {
          alert("요청하신 URL이 없습니다.");
        }
      }
      this.close();
    },
    close() {
      this.$store.commit("closeHovers");
    },
  },
  mounted() {
    this.selectedList = Utils.getCurrentSelect();
    this.init();
  },
};
</script>
