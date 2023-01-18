import { mapState, mapMutations } from 'vuex'
import {getFullUrl} from '@/utils/api'

export default {
    computed: {
        ...mapState([
            'pageSize', 'viewOption'
        ]),
        initMessage() {
            return ' '
        },
    },
    data: function () {
        return {
            totalCount: 0,
            moreData : false,
            pageNum : 1,
            dataSource : null
        }
    },
    mounted () {
        // TODO: error handling
        // this.remoteDataSource.bind("error", this.handleError);
        console.log('mounted ' + this.$el.id)
        this.sharedDataSource().bind("error", this.handleError);
        this.loadData()
    },
    methods: {
        ...mapMutations(['setLoading']),
        sharedDataSource(renew = false) {
            if (!this.dataSource || renew){
                this.dataSource = this.getNewDataSource()
            }
            return this.dataSource
            // return this.getNewDataSource()
        },
        getPageMessage() {
            if (this.moreData)
              return `${this.totalCount} ${i18n.t("files.moreItems")}`
            else
              return `${this.totalCount} ${i18n.t("files.items")}`
        },
        onDefaultDataBound() {
            // this.setLoading(false)
            console.log("Event(List) :: dataBound :: " + this.getPageMessage())

            // this.setLoading('false')
        },
        calcTotalCommon(response) {
            this.moreData = (response.moreData)? response.moreData: false
            this.totalCount = response.totalCount ;
//            this.onDataBound('')
//            if(response.current) this.totalCount-=1;
//            else if(!this.moreData) this.totalCount-=1;
            // console.log('스크롤 확인 작업=================>');
            // console.log(response);
            // console.log($(".k-scrollbar"));
            // console.log($(".k-scrollbar")[0].scrollTop);
            // console.log($(".k-scrollbar")[0].scrollHeight);
            // console.log($(".k-scrollbar")[0].scrollHeight-($(".k-scrollbar")[0].scrollHeight*0.3));
           /*if(this.viewOption.view=='grid'){
                if(this.compareMoreData(this.moreData)){
                    this.totalCount-=1;
                }
            }*/
            console.log(`total : ${this.totalCount}, moreData : ${this.moreData}`)
            if(!this.moreData) this.totalCount -= 1;

            return this.totalCount
        },
        compareMoreData(moreData){
            if(!moreData){
                $(".k-scrollbar").scrollTop($(".k-scrollbar")[0].scrollTop);
                return true
            }else{
                if($(".k-scrollbar")[0].scrollHeight < 1500){
                    $(".k-scrollbar").scrollTop(450);
                }else{
                    $(".k-scrollbar").scrollTop($(".k-scrollbar")[0].scrollTop-($(".k-scrollbar")[0].scrollTop*0.1));
                }
                return false
            }
        },
        handleError(e) {
            console.log('error : ' + e.xhr.status)
            if (e.xhr.readyState == 0 || e.xhr.status == 401) {
                api.toLogin()
            }
        },
    }
}