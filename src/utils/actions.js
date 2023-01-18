import constants from '../Constants';
import { create } from 'vue-modal-dialogs'

import PropertyDialog from '@/views/PropertyDialog'
import RulesDialog from '@/views/settings/RulesDialog'
import PrsrvDialog from '@/views/settings/PrsrvDialog'
import NotificationDialog from '@/views/settings/Notification'
import newNotificationDialog from '@/views/settings/newNotification'
import DraftDialog from '@/views/DraftDialog'
import InlineViewerDialog from '@/views/InlineViewerDialog'
import DirDialog from '@/components/prompts/NewDir'
import PermissionDialog from '@/views/security/SecurityDialog'
import CarryingOutDialog from '@/views/security/CarryingOut'
import ShareDialog from '@/views/security/ShareDialog'
import ShareCard from '@/views/security/ShareCard'
import DelegationDialog from '@/views/settings/Delegation'

const propertyDialog = create(PropertyDialog)
const rulesDialog = create(RulesDialog)
const prsrvDialog = create(PrsrvDialog)
const manageNotyDialog = create(NotificationDialog)
const newmanageNotyDialog = create(newNotificationDialog)
const draftDialog = create(DraftDialog)
const viewerDialog = create(InlineViewerDialog)
const newDirDialog = create(DirDialog)
const permissionDialog = create(PermissionDialog)
const carryingOutDialog = create(CarryingOutDialog)
const shareDialog = create(ShareDialog)
const shareCard = create(ShareCard)

const manageDelegationDialog = create(DelegationDialog)

class Action {
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    constructor() { }
    do(vue, store) { }
    do(vue) {
        vue.$store.commit('showHover', this.command)
    }
}

class NewBundle extends Action {
    id = 'label.newBundle'
    icon = 'fa fa-copy'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 7
    constructor() {
        super()
        this.permission = ['add']
    }
    do(vue) {
        newDirDialog({ title: vue.$t('label.newBundle'), dynamic: true, bundle: true }).then(data => {
            if (data.requestReload)
                Event.fire(EventList.RELOAD_LIST)
        })
    }
    check() {
        return (Utils.features('files.bundle')) ? true : false
    }
}

class ActionNewDir extends Action {
    id = 'prompts.newDir'
    icon = 'fa fa-folder-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 6
    constructor() {
        super()
        this.permission = ['add']
        this.command = constants.ACTIONS.NEWDIR;
    }

}

class Upload extends Action {
    id = 'prompts.newfile'
    icon = 'fa fa-file-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 5
    line = false
    constructor() {
        super()
        this.permission = ['add']
        this.command = constants.ACTIONS.NEWFILE;
    }
}

class MakeNewFile extends Action {
    id = 'prompts.makenewfile'
    icon = 'fa fa-file-text'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 6
    line = false
    constructor() {
        super()
        this.permission = ['add']
        this.command = constants.ACTIONS.MAKEFILE;
    }
}


class Remove extends Action {
    id = 'prompts.remove'
    icon = 'fa fa-trash-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 22
    constructor() {
        super()
        this.permission = ['deleteDoc']
        this.command = constants.ACTIONS.DELETE;
    }
}

class Copy extends Action {
    id = 'prompts.copy'
    icon = 'fa fa-files-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 21
    constructor() {
        super()
        this.permission = ['copyDoc']
        this.command = constants.ACTIONS.COPY;
    }

    do(vue) {
        store.commit('setMoveList', null);
        if (store.state.copySelectedList.length === 0) {
            store.commit('setCopyList', [store.state.currentDir]);
        } else {
            store.commit('setCopyList', store.state.copySelectedList);
        }
        vue.$message(vue.$t('messages.copyToClipboard', { target: store.state.selectStatusMessage }));
    }
}

class Move extends Action {
    id = 'prompts.move'
    icon = 'fa fa-scissors'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 20
    constructor() {
        super()
        this.permission = ['moveDoc']
        this.command = constants.ACTIONS.MOVE;
    }

    do(vue) {
        store.commit('setCopyList', null);
        if (store.state.moveSelectedList.length === 0) {
            store.commit('setMoveList', [store.state.currentDir]);
        } else {
            store.commit('setMoveList', store.state.moveSelectedList);
        }
        if (!store.state.moveTableEnabled) {
            let treeview = $("#treeview").data("kendoTreeView");
            let selectedTree = treeview.dataItem(treeview.select()).uid
            store.commit('setMoveTreeList', selectedTree);
        } else {
            let treeview = $("#treeview").data("kendoTreeView");
            let selectedTree = treeview.dataItem(treeview.select()).uid
            store.commit('setMoveTableList', selectedTree);
        }
        vue.$message(vue.$t('messages.copyToClipboard', { target: store.state.selectStatusMessage }));
    }
}

class Paste extends Action {
    id = 'prompts.paste'
    icon = 'fa fa-paste'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 21
    constructor() {
        super()
        this.permission = ['copyDoc']
        this.command = constants.ACTIONS.PASTE;
    }

    do(vue) {
        if (store.state.copyList != null) {
            if (store.state.selected.length == 1) {
                if (store.state.selected[0].isFolder) {
                    api.copy(store.state.copyList, store.state.selected[0].r_object_id, "allowRename").then(data => {
                        console.log(vue);
                        vue.$refs.mainProgressbar.getStatus(data.actionId, true);
                        store.commit('setCopyList', null);
                        store.commit('setMoveList', null);
                    });

                    return;
                }
            }

            api.copy(store.state.copyList, store.state.currentDir, "allowRename").then(data => {
                console.log(vue);
                vue.$refs.mainProgressbar.getStatus(data.actionId, true);
                store.commit('setCopyList', null);
                store.commit('setMoveList', null);
            });
        } else if (store.state.moveList != null) {
            console.log(store.state.moveList);

            if (store.state.selected.length == 1) {
                if (store.state.selected[0].isFolder) {
                    api.move(store.state.moveList, store.state.selected[0].r_object_id, "overwrite").then(data => {
                        vue.$refs.mainProgressbar.getStatus(data.actionId, true);
                        store.commit('setCopyList', null);
                        store.commit('setMoveList', null);
                    });

                    return;
                }
            }

            api.move(store.state.moveList, store.state.currentDir, "overwrite").then(data => {
                vue.$refs.mainProgressbar.getStatus(data.actionId, true);
                store.commit('setCopyList', null);
                store.commit('setMoveList', null);
            });
        }
    }
}

class Share extends Action {
    id = 'prompts.share'
    icon = 'fa fa-share-alt'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_FILE;
    priority = 12
    constructor() {
        super()
        this.permission = ['createSharing']
        this.command = constants.ACTIONS.SHARE;
    }
    do(vue) {
        let items = Utils.getCurrentSelect()
        shareDialog({ elements: items, menus: vue.recentMenus })
        shareCard({ elements: items, menus: vue.recentMenus })
    }
}

class ShareEdit extends Action {
    id = 'prompts.shareChange'
    icon = 'fa fa-share-alt'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_FILE;
    priority = 12
    constructor() {
        super()
        this.permission = ['manageSharing']
        this.command = constants.ACTIONS.SHARE;
    }
    do(vue) {
        let items = Utils.getCurrentSelect()
        shareDialog({ elements: items, menus: vue.recentMenus })
        shareCard({ elements: items, menus: vue.recentMenus })
    }
}

class ShareCancel extends Action {
    id = 'prompts.shareCancel'
    icon = 'fa fa-share-alt'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_FILE;
    priority = 13
    constructor() {
        super()
        this.permission = ['removeSharing']
        this.command = constants.ACTIONS.SHARECANCEL;
    }
}

class Download extends Action {
    id = 'prompts.download'
    icon = 'fa fa-download'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 2
    constructor() {
        super()
        this.permission = ['openDoc']
        this.command = constants.ACTIONS.DOWNLOAD;
    }
}

class ZIPDownload extends Action {
    id = 'prompts.zipdownload'
    icon = 'fa fa-file-archive-o'
    attr = constants.ATTRIBUTE.COMMON_MULTI;
    priority = 2
    constructor() {
        super()
        this.permission = ['openDoc']
        this.command = constants.ACTIONS.ZIPDOWNLOAD;
    }
}

class CheckIn extends Action {
    id = 'prompts.checkin'
    icon = 'edm icon_new_editcompletion'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 10
    constructor() {
        super()
        this.permission = ['checkin']
        this.command = constants.ACTIONS.CHECKIN;
    }
}

class CheckRead extends Action {
    id = 'prompts.readmode'
    icon = 'fa fa-sign-out'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 11
    constructor() {
        super()
        this.permission = ['openDoc']
        this.command = constants.ACTIONS.READMODE;
    }
}

class Search extends Action {
    id = 'prompts.search'
    icon = 'fa fa-search'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.CURRENT_DIR;
    priority = 100
    constructor() {
        super()
        this.permission = ['search']
        this.command = constants.ACTIONS.SEARCH;
    }
}

class CheckOut extends Action {
    id = VFUSERnameChange()
    icon = 'edm icon_new_edit'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 10
    constructor() {
        super()
        this.permission = ['editLockDoc']
        this.command = constants.ACTIONS.CHECKOUT;
    }
}

class CheckoutCancel extends Action {
    id = 'prompts.checkoutcancel'
    icon = 'fa fa fa-ban'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 10
    constructor() {
        super()
        this.permission = ['editCancelDoc']
        this.command = constants.ACTIONS.CHECKOUTCANCEL;
    }
    do(vue) {
        let elementId = Utils.getCurrentSelect()[0].r_object_id
        api.cancelCheckout(elementId).then(data => {
            Utils.showResultMessage(true);
            Event.fire(EventList.TABLE_REFRESH);
            Utils.updateIndicator(elementId, 'lock');
        })
    }
}

class Rename extends Action {
    id = 'prompts.rename'
    icon = 'fa fa-pencil-square-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 15
    constructor() {
        super()
        this.permission = ['renameDoc']
        this.command = constants.ACTIONS.RENAME;
    }
}

class BookMarkRename extends Action {
    id = 'prompts.bookmarkrename'
    icon = 'fa fa-pencil-square-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 16
    constructor() {
        super()
        this.permission = ['isBookmarked']
        this.command = constants.ACTIONS.BOOKMARKRENAME;
    }
}

class URLShare extends Action {
    id = 'prompts.urlshare'
    icon = 'fa fa-share'
    attr = constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_FILE;
    priority = 14
    constructor() {
        super()
        this.permission = [
            ['createURLSharing']
        ]
        this.command = constants.ACTIONS.URL_SHARE;
    }
}

class Property extends Action {
    id = 'prompts.property'
    icon = 'fa fa-info-circle'
    //attr= constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 99
    line = true
    constructor() {
        super()
        this.permission = ['propertyDoc']
        this.command = constants.ACTIONS.PROPERTY;
    }
    // do(vue) {
    //     let elementId = Utils.getCurrentSelect()[0].r_object_id
    //     propertyDialog({title: vue.$t('prompts.property'), width: '60%', containerHeight: '600px', elementId: elementId}).then(data=> {
    //         if (data.requestReload)
    //             Event.fire(EventList.RELOAD_LIST)
    //     })
    // }
    do(vue) {
        let items = Utils.getCurrentSelect()
        let elementIds = items.map(e => {
            return e.r_object_id
        })
        propertyDialog({ title: vue.$t('prompts.property'), width: '60%', containerHeight: '600px', elementIds: elementIds, argElements: items }).then(data => {
            if (data.requestReload)
                Event.fire(EventList.RELOAD_LIST)
        })
    }
}
class AddBookmark extends Action {
    id = 'prompts.Addbookmark'
    icon = 'fa fa-star'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 15
    constructor() {
        super()
        this.permission = ['canAddBookmarked']
        this.command = constants.ACTIONS.ADDBOOKMARK;
    }
}
class RemoveBookmark extends Action {
    id = 'prompts.Removebookmark'
    icon = 'fa fa-star'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 15
    constructor() {
        super()
        this.permission = ['isBookmarked']
        this.command = constants.ACTIONS.REMOVEBOOKMARK;
    }
}
class Permission extends Action {
    id = 'prompts.permission'
    icon = 'fa fa-key'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 25
    line = true
    constructor() {
        super()
        this.permission = ['propertyDoc']
        this.command = constants.ACTIONS.PERMISSION;
    }
    do(vue) {
        let items = Utils.getCurrentSelect()
        let elementIds = items.map(e => {
            return e.r_object_id
        })
        console.log(items);
        permissionDialog({ argElementIds: elementIds, argElements: items, menus: vue.recentMenus })
    }
}
class CarryingOut extends Action {
    id = 'label.carryingOut'
    icon = 'fa fa-sign-out'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 91
    constructor() {
        super()
        this.permission = ['propertyDoc']
        this.command = 'carryingout'
    }
    do(vue) {
        let items = Utils.getCurrentSelect()
        carryingOutDialog({ argElements: items })
    }
    check() {
        return (store.state.user.isAdmin || store.state.user.isManager)
    }
}

class History extends Action {
    id = 'prompts.history'
    icon = 'fa fa-list-alt'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 23
    constructor() {
        super()
        this.permission = ['openDoc'] //열기 권한 있을시 히스토리 보기 가능
        this.command = constants.ACTIONS.HISTORY;
    }
}
class Version extends Action {
    id = 'prompts.version'
    icon = 'fa fa-history'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 24
    line = false
    constructor() {
        super()
        this.permission = ['openDoc'] //열기 권한 있을시 버전목록 보기 가능
        this.command = constants.ACTIONS.VERSION;
    }
}

class Zip extends Action {
    id = 'prompts.zip'
    icon = 'edm icon_new_compress'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_MULTI | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 101
    constructor() {
        super()
        this.permission = ['compress']
        this.command = constants.ACTIONS.ZIP;
    }
}

class Trashclean extends Action {
    id = 'prompts.trashClean'
    icon = 'fa fa-trash-o'
    priority = 2
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI | constants.ATTRIBUTE.CURRENT_DIR
    constructor() {
        super()
        this.permission = ['deleteTrash']
        this.command = constants.ACTIONS.TRASHCLEAN;
    }
    check() {
        return (store.state.rootId == 'trash')
    }
}

class Restore extends Action {
    id = 'prompts.restore'
    icon = 'fa fa-trash-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 3
    constructor() {
        super()
        this.permission = ['deleteTrash']
        this.command = constants.ACTIONS.RESTORE;
    }
}

class Expire extends Action {
    id = 'prompts.expire'
    icon = 'fa fa-trash-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 4
    constructor() {
        super()
        this.permission = ['deleteTrash']
        this.command = constants.ACTIONS.EXPIRE;
    }
}

class Viewer extends Action {
    id = 'prompts.viewer'
    icon = 'fa fa-eye'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 100
    constructor() {
        super()
        this.permission = ['openDoc'] //열기 권한 있을 시 무조건 표시
        this.command = constants.ACTIONS.VIEWER;
    }
    do(vue) {
        // vue.$router.push({ path: '/comp/viewer/' + Utils.getCurrentSelectId() })
        viewerDialog({ elementId: Utils.getCurrentSelectId(), object_name: Utils.getCurrentSelectName() }).then(data => {
            // do nothing
        })
    }
}

class Draft extends Action {
    id = 'prompts.approval'
    icon = 'fa fa-certificate'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 90
    constructor() {
        super()
        this.permission = ['approval']
        this.command = constants.ACTIONS.APPROVAL;
    }
    do(vue) {
        let element = Utils.getCurrentSelect(true)
        let groupware = Utils.featuresDefault('groupware.setting', false);
        if (groupware) {
            let groupwareURL = Utils.featuresDefault('groupware.url', false);
            if (groupwareURL) {
                //window.open(groupwareURL+"?userid="+store.state.user.userId);
                let selectedData = Utils.getCurrentSelect();
                var data = [];
                console.log(selectedData);
                if (selectedData) {
                    for (var i = 0; i < selectedData.length; i++) {
                        if (selectedData[i].r_object_type == "dm_folder" || selectedData[i].docTypeName == "FOLDER") {
                            data.push({
                                elementid: selectedData[i].r_object_id,
                                name: selectedData[i].object_name,
                                isFolder: true
                            })
                        } else {
                            let setSize = ""
                            if (selectedData[i].size) {
                                setSize = selectedData[i].size
                            } else {
                                setSize = selectedData[i].fileList[0].fileSize
                            }
                            data.push({
                                elementid: selectedData[i].r_object_id,
                                name: selectedData[i].object_name,
                                fileSize: Utils.filesize(setSize),
                                isFolder: false
                            })
                        }
                    }
                }

                let param = {
                    list: data
                }
                Utils.postWindowOepn(groupwareURL, param, vue.$t('Groupware.carryout'));

            } else {
                alert('연결된 그룹웨어 URL이 없습니다.')
            }
            console.log('url 요청');
        } else {
            draftDialog({ elementId: [element.r_object_id], rewriteId: element.rewriteId }).then(data => {
                // do nothing
            })
        }
    }
}

class Rules extends Action {
    id = 'prompts.rules'
    icon = 'edm icon_new_rule'
    attr = constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 90
    constructor() {
        super()
        this.permission = ['manager']
        this.command = constants.ACTIONS.RULES;
        this.features = 'rule.admin.only'
        this.onlyAdmin = true
    }
    do(vue) {
        let elementId = Utils.getCurrentSelect()[0].r_object_id
        rulesDialog({ elementId: elementId }).then(data => {
            // do nothing
        })
    }
    check() {
        if (Utils.featuresDefault('rule.admin.only', false))
            return store.state.user.isAdmin
        else
            return true
    }
}

class PRSRV extends Action {
    id = 'prompts.prsrv'
    icon = 'fa fa-calendar-check-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 90
    constructor() {
        super()
        this.permission = [['gmanager', 'manager']]
        this.command = constants.ACTIONS.PRSRV;
    }
    do(vue) {
        let elementId = Utils.getCurrentSelect();
        prsrvDialog({ elementIds: elementId }).then(data => {
            // do nothing
        })
    }
    check() {
        if (Utils.featuresDefault('rule.admin.only', false))
            return store.state.user.isAdmin
        else
            return true
    }
}

// notification settings
class ManageNotification extends Action {
    id = 'label.manageNoty'
    icon = 'fa fa-filter'
    attr = constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 90
    constructor() {
        super()
        this.permission = ['manager']
        this.command = 'manageNoty2';
        this.features = 'rule.admin.only'
        this.onlyAdmin = true
    }
    do(vue) {
        let elementId = Utils.getCurrentSelectId()
        manageNotyDialog({ elementId: elementId }).then(data => {
            // do nothing
        })
    }
    check() {
        if (Utils.features('rule.admin.only'))
            return store.state.user.isAdmin || store.state.user.isManager
        else
            return true
    }
}

// new notification settings

class newManageNotification extends Action {
    id = 'label.setManageNoty'
    icon = 'fa fa-filter'
    attr = constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 90
    constructor() {
        super()
        this.permission = ['openDoc']
        this.command = 'manageNoty';
        this.features = 'rule.admin.only'
        this.onlyAdmin = true
    }
    do(vue) {
        let elementId = Utils.getCurrentSelectId()
        newmanageNotyDialog({ elementId: elementId }).then(data => {
            // do nothing
        })
    }
}

// delegation settings
class ManageDelegation extends Action {
    id = 'label.manageDelegation'
    icon = 'fa fa-filter'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER;
    priority = 90
    constructor() {
        super()
        this.permission = ['manager']
        this.command = 'manageDelegation';
        this.onlyAdmin = true
    }
    do(vue) {
        let elementId = Utils.getCurrentSelectId()
        manageDelegationDialog({ elementId: elementId }).then(data => {
            // do nothing
        })
    }
    check() {
        return true
    }
}

class Unzip extends Action {
    id = 'prompts.unzip'
    icon = 'fa fa-undo'
    attr = constants.ATTRIBUTE.ZIP;
    priority = 102
    constructor() {
        super()
        this.permission = ['uncompress']
        this.command = constants.ACTIONS.UNZIP;
    }
}

class OnlineEdit extends Action {
    id = 'prompts.onlineedit'
    icon = 'fa fa-filter'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 4
    constructor() {
        super()
        this.permission = ['editOnline']
        this.command = constants.ACTIONS.ONLINEEDIT;
    }
}

class Goto extends Action {
    id = 'prompts.goto'
    icon = 'fa fa-location-arrow'
    attr = constants.ATTRIBUTE.COMMON_FILE;
    priority = 4
    constructor() {
        super()
        this.permission = ['goto']
        this.command = constants.ACTIONS.GOTO;
    }
    do(vue) {
        let selected = Utils.getCurrentSelect(true)
        Utils.jumpToPath(selected.r_folder_path)
    }
}

class RemoveRewrite extends Action {
    id = 'prompts.removeRewrite'
    icon = 'fa fa-location-arrow'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.SPECIAL;
    priority = 4
    constructor() {
        super()
        this.permission = ['']
        this.command = constants.ACTIONS.REMOVEREWRITE;
    }
    do(vue) {
        let selected = Utils.getCurrentSelect(true)
        api.removeRewrite(selected.rewriteId).then(data => {
            Event.fire(EventList.RELOAD_LIST);
        }).catch(error => {
            Utils.showResultMessage(false, null, error.errmsg);
        })
    }
}

class RealExpire extends Action {
    id = 'prompts.realExpire'
    icon = 'fa fa-trash-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 4
    constructor() {
        super()
        this.permission = ['deleteTrash']
        this.command = constants.ACTIONS.REALEXPIRE;
    }
}

class ExpireRestore extends Action {
    id = 'prompts.expireRestore'
    icon = 'fa fa-trash-o'
    attr = constants.ATTRIBUTE.COMMON_FILE | constants.ATTRIBUTE.COMMON_FOLDER | constants.ATTRIBUTE.SPECIAL | constants.ATTRIBUTE.COMMON_MULTI;
    priority = 3
    constructor() {
        super()
        this.permission = ['deleteTrash']
        this.command = constants.ACTIONS.EXPIRERESTORE;
    }
}

class customEncryptDRM extends Action {
    id = 'prompts.EncryptDRM'
    icon = 'fa fa-lock'
    attr = constants.ATTRIBUTE.COMMON_FILE
    priority = 91
    constructor() {
        super()
        this.permission = ['convertDrm']
        this.command = constants.ACTIONS.ENCRYPT;
    }
}

class customDescryptDRM extends Action {
    id = 'prompts.DescryptDRM'
    icon = 'fa fa-unlock-alt'
    attr = constants.ATTRIBUTE.COMMON_FILE
    priority = 91
    constructor() {
        super()
        this.permission = ['revertDrm']
        this.command = constants.ACTIONS.DECRYPT;
    }
}

class customUrlDRM extends Action {
    id = 'prompts.urlDRM'
    icon = 'fa fa-internet-explorer'
    attr = constants.ATTRIBUTE.COMMON_FILE
    priority = 91
    constructor() {
        super()
        this.permission = ['urlDrm']
        this.command = constants.ACTIONS.URLDRM;
    }
}

class synchronIn extends Action {
    id = 'prompts.synchronIn'
    icon = 'fa fa-tasks'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['synchron']
        this.command = constants.ACTIONS.URLSYNCHRONIN;
    }
}

class synchronOut extends Action {
    id = 'prompts.synchronOut'
    icon = 'fa fa-tasks'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['synchronout']
        this.command = constants.ACTIONS.URLSYNCHRONOUT;
    }
}

class synchronHistory extends Action {
    id = 'prompts.synchronHistory'
    icon = 'fa fa-internet-explorer'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['synchron']
        this.command = constants.ACTIONS.URLSYNCHRONHISTORY;
    }
}

class synchronOutHistory extends Action {
    id = 'prompts.synchronHistory'
    icon = 'fa fa-internet-explorer'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['synchronout']
        this.command = constants.ACTIONS.CUSTOMURL;
    }
}

class exitTransfer extends Action {
    id = 'prompts.exitTransfer'
    icon = 'fa fa-tasks'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['exitTransfer']
        this.command = constants.ACTIONS.URLEXITTRANS;
    }
}

class exitTransferHistory extends Action {
    id = 'prompts.exitTransferHistory'
    icon = 'fa fa-internet-explorer'
    attr = constants.ATTRIBUTE.COMMON_FOLDER
    priority = 92
    constructor() {
        super()
        this.permission = ['exitTransferHistory']
        this.command = constants.ACTIONS.URLEXITTRANSHISTORY;
    }
}



const ACTIONS_LIST = [
    new ActionNewDir(),
    new Upload(),
    new MakeNewFile(),
    new Remove(),
    new Viewer(),
    new Copy(),
    new Paste(),
    new Move(),
    new Download(),
    new ZIPDownload(),
    new CheckIn(),
    new CheckOut(),
    new Rename(),
    new BookMarkRename(),
    new Share(),
    new ShareEdit(),
    new Property(),
    new Rules(),
    //new ManageNotification(),
    new newManageNotification(),
    new ManageDelegation(),
    new AddBookmark(),
    new RemoveBookmark(),
    new Permission(),
    new CarryingOut(),
    new History(),
    new Version(),
    new Zip(),
    new Trashclean(),
    new Restore(),
    new Expire(),
    new Draft(),
    new Unzip(),
    new OnlineEdit(),
    new Goto(),
    new RemoveRewrite(),
    new NewBundle(),
    new CheckoutCancel(),
    new CheckRead(),
    new Search(),
    new RealExpire(),
    new ExpireRestore(),
    new customEncryptDRM(),
    new customDescryptDRM(),
    new URLShare(),
    new ShareCancel(),
    //new synchronIn(),
    //new synchronOut(),
    new synchronHistory(),
    // new synchronOutHistory(),
    new exitTransfer(),
    new exitTransferHistory(),
    //new customUrlDRM(),
    new PRSRV(),
]

export function getAction(command) {
    return ACTIONS_LIST.find(a => a.command == command)
}

function fnRemoveActions(allActions, toRemove) {
    toRemove.forEach(e => {
        let i = allActions.findIndex(a => { return a.id === e.id })
        if (i >= 0) {
            allActions.splice(i, 1)
        }
    })
}

export function VFUSERnameChange() {
    //let mgConnect = Utils.featuresDefault('mgConnect.websocket.open',false);
    //let id = 'prompts.checkout'
    //if (mgConnect) {
    let id = 'prompts.checkoutMode'
    //}
    return id
}

export function VFGetCookie(cName) {
    cName = cName + '=';
    let cookieData = document.cookie;
    let start = cookieData.indexOf(cName);
    let cValue = '';
    if (start != -1) {
        start += cName.length;
        let end = cookieData.indexOf(';', start);
        if (end == -1) end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}

// 모든 context menu를 가져온다.
// 20180815, ui의 bit 연산 사용하지 않고, 오로지 서버설정으로만 동작하게 함.
export function getActions(selected, response, from) {
    let availableActions = [];
    let addActions = [];
    let removeActions = [];

    let applyPermission = true

    let attr = constants.ATTRIBUTE.COMMON_FILE

    if (response.isFolder) {
        attr = constants.ATTRIBUTE.COMMON_FOLDER
    } else if (response.isFolder == undefined) {
        attr = constants.ATTRIBUTE.SPECIAL
    } else if (response.isFolder)
        if (selected.length > 1) {
            attr = constants.ATTRIBUTE.COMMON_MULTI;
        }

    // 빈 공간 클릭은 기존 선택을 무시
    if (from & constants.ATTRIBUTE.CURRENT_DIR)
        attr = from

    // validation
    let isRoot = response.isRoot || false
    let actions = null
    if (!selected || selected.length < 1) {
        console.error('No item selected')
        return []
    }
    if (!response.actions) {
        console.error('No server actions defined')
        return []
    } else {
        actions = JSON.parse(response.actions)
    }

    // single selection
    if (selected && selected.length <= 1) {
        try {
            // 루트는 액션 있으면 설정
            if ((isRoot || actions.inherit) && actions.root && actions.root.length > 0) {
                availableActions = ACTIONS_LIST.filter(item => actions.root.includes(item.command))
                console.log(availableActions)
            }
            // 하위 폴더 액션이 있으면 설정
            if (!isRoot && actions.inherit == false) {
                if (actions.sub && actions.sub.length > 0) {
                    availableActions = ACTIONS_LIST.filter(item => actions.sub.includes(item.command));
                }
                // 하위 폴더 액션설정이 [] 이면 기본 액션 모두
                else if (actions.sub && actions.sub.length == 0) {
                    availableActions = ACTIONS_LIST.filter(item => attr & item.attr);
                    console.log(availableActions)
                }
            }
            // 루트가 아니면서 하위에 추가할 action
            if (!isRoot && actions.addsub && actions.addsub.length > 0) {
                addActions = ACTIONS_LIST.filter(item => actions.addsub.includes(item.command));
                removeActions = ACTIONS_LIST.filter(item => actions.addsub.includes('-' + item.command));
            }

        } catch (error) {
            console.error(error)
        }
    }
    // multiple
    else if (selected && selected.length > 1) {
        if (actions.multisub && actions.multisub.length > 0) {
            availableActions = ACTIONS_LIST.filter(item => actions.multisub.includes(item.command));
        }
        applyPermission = false
    }
    // 권한 처리
    if (applyPermission) {
        availableActions = availableActions.filter(element => {
            if (element.permission && element.permission.length > 0) {
                return element.permission.every(e => {
                    if (Array.isArray(e)) { //check OR permission
                        return e.some(e => {
                            console.log(response, e, response[e] && response[e] === 'Y')
                            return response[e] && response[e] === 'Y'
                        })
                    } else return response[e] && response[e] === 'Y'
                })
            } else {
                return true
            }
        })
        console.log(availableActions)
    }

    // availableActions.push(...addActions)
    addActions.forEach(element => {
        availableActions.pushIfNotExist(element, function (e) {
            return e.id === element.id
        });
    });
    // remove action
    removeActions.forEach(e => {
        let i = availableActions.findIndex(a => { return a.id === e.id })
        if (i >= 0) {
            availableActions.splice(i, 1)
        }
    })

    //여기서 unzip빠진다
    // file or folder filtering
    availableActions = availableActions.filter(item => (item.attr & attr) == attr);

    var checkExt = selected[0].object_name.toLowerCase();
    if (selected.length < 2 && checkExt.includes(".zip")) {
        if (store.state.rootId != 'onlyExpired') {
            availableActions.push(new Unzip());
        }
    }
    // if (!(from & constants.ATTRIBUTE.CURRENT_DIR)) {
    //     fnRemoveActions(availableActions, [new ActionNewDir(), new Upload(), new MakeNewFile()])
    // }

    // 코드관리자에 따른 filtering
    let exceptionAction = Utils.featuresDefault('exceptionAction', ',') // 제외될 액션처리

    if (exceptionAction) {
        let removeList = exceptionAction.split(",")
        let exArray = [];
        ACTIONS_LIST.forEach(e => {
            removeList.forEach(exception => {
                if (exception.trim() == e.command) {
                    exArray.push(e);
                }
            })
        })
        fnRemoveActions(availableActions, exArray)
    }

    //마이가드 오픈 websocket 사용여부에 따라 읽기모드 추가
    let mgConnect = Utils.featuresDefault('mgConnect.websocket.open', false);
    if (!mgConnect) {
        fnRemoveActions(availableActions, [new CheckRead()])
    }


    //URL 복사 초기화
    fnRemoveActions(availableActions, [new URLShare()]);

    //대림 외부망 설정 요건
    let subnet = Utils.featuresDefault('limit.subnet', false);
    if (subnet != false) {
        let isOutsideSubnet = store.state.user.isOutsideSubnet; //외부망 여부
        if (isOutsideSubnet) {
            fnRemoveActions(availableActions, [new Draft(), new URLShare()])
            console.log('외부망 URL Share 삭제');
        } else {
            if (store.state.rootId == 'Sites' || store.state.rootId == 'Shared') {
                availableActions.push(new URLShare());
                console.log('내부망 URL Share 추가');
            }
        }
    }

    //부산은행 요건
    let busanException = Utils.featuresDefault('busan.contextmenu', false);
    if (!busanException) {
        console.log("BUSAN CONTEXT PRSRV")
        fnRemoveActions(availableActions, [new PRSRV()])
    }
    if (store.state.rootId == 'onlyExpired') {
        availableActions.push(new Search());
    }

    //대림 요건
    let exception = Utils.featuresDefault('daelim.exception.contextmenu', false);
    if (exception) {
        let treeview = $("#treeview").data("kendoTreeView");
        let selectedNode = treeview.select();
        let selected = Utils.getCurrentSelect()[0];
        //리스트에서 컨텍스 메뉴 제거
        if (selected) {
            if (selected.id) {
                let splitType = selected.id.split('/');
                console.log(splitType);
                if (splitType.length == 4) {
                    if (splitType[1] == 'Sites' || splitType[1] == 'Shared') {
                        fnRemoveActions(availableActions, [new URLShare()])
                    }
                }
            } else {
                if (selectedNode) {
                    let parentNode = treeview.parent(selectedNode);
                    let dataItem = treeview.dataItem(parentNode);
                    if (dataItem) {
                        if (dataItem.id == 'Sites' && !store.state.user.isAdmin) {
                            fnRemoveActions(availableActions, [new Download(), new newManageNotification(), new URLShare()])
                        }
                        if (dataItem.id == 'Shared' && !store.state.user.isAdmin) {
                            fnRemoveActions(availableActions, [new Download(), new newManageNotification(), new URLShare()])
                        }
                    } else {
                        fnRemoveActions(availableActions, [new URLShare()])
                    }
                }
            }

        } else { //트리에서 컨텍스 메뉴 제거
            fnRemoveActions(availableActions, [new URLShare()])
        }
    }


    // sort
    availableActions.sort((a, b) => {
        return a.priority - b.priority;
    })

    // Copy & Paste 처리
    if (store.state.copyList == null && store.state.moveList == null) {
        fnRemoveActions(availableActions, [new Paste()])
    }

    //인게,비인가,외부사용처리
    //fnRemoveActions(availableActions, [new CarryingOut(), new ManageDelegation(),new Draft()]);

    //무조건 추가할 액션
    let addAction = Utils.featuresDefault('addContextMenu', ',');
    if (addAction) {
        let addList = addAction.split(",")
        console.log(addList);
        let addArray = [];
        ACTIONS_LIST.forEach(e => {
            addList.forEach(add => {
                if (add.trim() == e.command) {
                    addArray.push(e);
                }
            })
        })
        for (var i = 0; i < addArray.length; i++) {
            availableActions.push(addArray[i]);
        }
    }


    // 최종 체크
    availableActions = availableActions.filter(element => {
        return (element.check === undefined) ? true : element.check()
    })

    return availableActions;
}