<template>
  <div>
<!--     <menus></menus> -->
    <download v-if="showDownload"></download>
    <zipdownload v-if="showZIPDownload"></zipdownload>
    <new-file v-else-if="showNewFile"></new-file>
    <new-dir v-else-if="showNewDir" :showing="showNewDir"></new-dir>
    <make-file v-else-if="showMakeFile" :showing="showMakeFile"></make-file>
    <rename v-else-if="showRename"></rename>
    <bookmarkrename v-else-if="showBookmarkRename"></bookmarkrename>
    <delete v-else-if="showDelete" :showing="showDelete"></delete>
    <move v-else-if="showMove"></move>
    <copy v-else-if="showCopy"></copy>
    <read v-else-if="showRead"></read>
    <checkout v-else-if="showCheckout"></checkout>
    <checkin v-else-if="showCheckin"></checkin>
    <addbookmark v-else-if="showAddBookmark"></addbookmark>
    <removebookmark v-else-if="showRemoveBookmark"></removebookmark>
    <history v-else-if="showHistory"></history>
    <version v-else-if="showVersion"></version>
    <zip v-else-if="showZip"></zip>
    <unzip v-else-if="showUnzip"></unzip>
    <trashclean v-else-if="showTrashClean"></trashclean>
    <restore v-else-if="showRestore"></restore>
    <!-- <viewer v-else-if="showViewer"></viewer> -->
    <expire v-else-if="showExpire"></expire>
    <scan v-else-if="showScan" :showing="showScan"></scan>
    <multiupload v-else-if="showMultiUpload" :showing="showMultiUpload"></multiupload>
    <search v-if="showSearch"></search>
    <onlineedit v-else-if="showOnlineedit"></onlineedit>
    <expireRestore v-else-if="showExpireRestore"></expireRestore>
    <realExpire v-else-if="showRealExpire"></realExpire>
    <encrypt v-else-if="showCustomEncryptDRM"></encrypt>
    <descrypt v-else-if="showCustomDescryptDRM"></descrypt>
    <urldrm v-else-if="showCustomUrlDRM"></urldrm>
    <urlcustom v-else-if="showCustomUrl" :type="show"></urlcustom>
    <urlshare v-else-if="showShareUrl"></urlshare>
    <sharecancel v-else-if="showShareCancel"></sharecancel>
    <div v-show="showOverlay" @click="resetPrompts" class="overlay"></div>
  </div>
</template>

<script>

import Delete from './Delete'
import Rename from './Rename'
import Bookmarkrename from './BookmarkRename'
import Download from './Download'
import Zipdownload from './ZIPDownload'
import Move from './Move'
import Copy from './Copy'
import Read from './Read'
import NewFile from './NewFile'
import NewDir from './NewDir'
import MakeFile from './MakeFile'
import Checkout from './Checkout'
import Checkin from './CheckIn'
import Addbookmark from './Addbookmark'
import Removebookmark from './Removebookmark'
import History from './History'
import Version from './Version'
import Zip from './Zip'
import Unzip from './Unzip'
import Trashclean from './TrashClean'
import Restore from './Restore'
// import Viewer from './Viewer'
import Expire from './Expire'
import Onlineedit from './OnlineEdit'
import Scan from './Scan'
import Multiupload from './Multiupload'
import Search from './Search'
import ExpireRestore from './ExpireRestore'
import RealExpire from './RealExpire'
import Encrypt from './Encrypt'
import Descrypt from './Descrypt'
import Urldrm from './CustomURL'
import Urlcustom from './CustomSetURL'
import Urlshare from './URLShare'
import Sharecancel from './ShareCancel'
import { mapState } from 'vuex'
import * as api from '@/utils/api'

export default {
  name: 'prompts',
  components: {
    Delete,
    Rename,
    Bookmarkrename,
    Download,
    Zipdownload,
    Move,
    Copy,
    NewFile,
    NewDir,
    MakeFile,
    // 'property-dialog' : PropertyDialog,
    Checkout,
    Checkin,
    Addbookmark,
    Removebookmark,
    History,
    Version,
    Zip,
    Unzip,
    Trashclean,
    Restore,
    Read,
    // Viewer,
    Expire,
    Onlineedit,
    Scan,
    Search,
    ExpireRestore,
    RealExpire,
    Encrypt,
    Descrypt,
    Urldrm,
    Urlshare,
    Urlcustom,
    Sharecancel,
    Multiupload
  },  
  watch: {    
    show: function() {      
      if(this.show != null) {        
        this.$store.commit('setCanCopy', false);
      }else {
        this.$store.commit('setCanCopy', true);
      }      
    }
  },
  data: function () {
    return {

    }
  },
  computed: {
    ...mapState(['show', 'plugins']),
    showMenu: function () { return this.show === constants.ACTIONS.MENU },
    showDelete: function () { return this.show === constants.ACTIONS.DELETE },
    showRename: function () { return this.show === constants.ACTIONS.RENAME },
    showBookmarkRename: function () { return this.show === constants.ACTIONS.BOOKMARKRENAME },
    showMove: function () { return this.show === constants.ACTIONS.MOVE },
    showCopy: function () { return this.show === constants.ACTIONS.COPY },
    showNewFile: function () { return this.show === constants.ACTIONS.NEWFILE },
    showNewDir: function () { return this.show === constants.ACTIONS.NEWDIR },
    showMakeFile: function () { return this.show === constants.ACTIONS.MAKEFILE },
    showDownload: function () { return this.show === constants.ACTIONS.DOWNLOAD },
    showZIPDownload: function () { return this.show === constants.ACTIONS.ZIPDOWNLOAD },
    showProperty: function () { return this.show === constants.ACTIONS.PROPERTY },
    showCheckout: function () { return this.show === constants.ACTIONS.CHECKOUT },
    showRead: function () { return this.show === constants.ACTIONS.READMODE },
    showCheckin: function () { return this.show === constants.ACTIONS.CHECKIN },
    showAddBookmark: function () { return this.show === constants.ACTIONS.ADDBOOKMARK },
    showRemoveBookmark: function () { return this.show === constants.ACTIONS.REMOVEBOOKMARK },
    showHistory: function () { return this.show === constants.ACTIONS.HISTORY },
    showVersion: function () { return this.show === constants.ACTIONS.VERSION },
    showZip:function(){return this.show===constants.ACTIONS.ZIP},
    showUnzip:function(){return this.show===constants.ACTIONS.UNZIP},
    showTrashClean:function(){return this.show===constants.ACTIONS.TRASHCLEAN},
    showRestore:function(){return this.show===constants.ACTIONS.RESTORE},
    // showViewer:function(){return this.show===constants.ACTIONS.VIEWER},
    showExpire:function(){return this.show===constants.ACTIONS.EXPIRE},
    showOnlineedit:function(){return this.show===constants.ACTIONS.ONLINEEDIT},
    showScan:function(){return this.show===constants.ACTIONS.SCAN},
    showMultiUpload:function(){return this.show===constants.ACTIONS.MULTIUPLOAD},
    showSearch:function(){return this.show===constants.ACTIONS.SEARCH},
    showExpireRestore:function(){return this.show===constants.ACTIONS.EXPIRERESTORE},
    showRealExpire:function(){return this.show===constants.ACTIONS.REALEXPIRE},
    showCustomEncryptDRM:function(){return this.show===constants.ACTIONS.ENCRYPT},
    showCustomDescryptDRM:function(){return this.show===constants.ACTIONS.DECRYPT},
    showCustomUrlDRM:function(){return this.show===constants.ACTIONS.URLDRM},
    showCustomUrl:function(){return this.show===constants.ACTIONS.URLSYNCHRONIN || this.show===constants.ACTIONS.URLSYNCHRONOUT || this.show===constants.ACTIONS.URLSYNCHRONHISTORY || this.show===constants.ACTIONS.URLEXITTRANS || this.show===constants.ACTIONS.URLEXITTRANSHISTORY },
    showShareUrl:function(){return this.show===constants.ACTIONS.URL_SHARE},
    showShareCancel:function(){return this.show===constants.ACTIONS.SHARECANCEL},
    showOverlay: function () {
      return (this.show !== null && this.show !== 'search' && this.show !== 'more')
    },
  },
  methods: {
    resetPrompts () {
      this.$store.commit('closeHovers')
    }
  }
}
</script>
