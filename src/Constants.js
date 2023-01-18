import i18n from './i18n'
import { Store } from '../node_modules/vuex';
let constants = {
    FILES_VIEW_LIST: [
        //{ id: 'grid', text: 'buttons.gridView', icon: 'fa fa-list' },
        { id: 'table', text: 'buttons.gridView', icon: 'fa fa-list' },
        { id: 'detail', text: 'buttons.detailView', icon: 'fa fa-info-circle' },
        { id: 'list1', text: 'buttons.list1View', icon: 'fa fa-th' },
        { id: 'list2', text: 'buttons.list2View', icon: 'fa fa-th-large' },
    ],
    isValidFilesView: (viewId) => {
        let found = constants.FILES_VIEW_LIST.find(e => e.id === viewId)
        return (found) ? true : false
    },
    NAMESORT(columnsName) {
        let namesort = {
            compare: function (a, b) {
                let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a[columnsName] : '1' + a[columnsName]
                let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b[columnsName] : '1' + b[columnsName]
                return compareNameA.localeCompare(compareNameB)
            }
        }
        return namesort
    },
    ACTIONS: {
        MENU: 'menu',
        DELETE: 'delete',
        RENAME: 'rename',
        DELEGATION: 'delegation',
        MOVE: 'move',
        COPY: 'copy',
        PASTE: 'paste',
        NEWFILE: 'newFile',
        DOWNLOAD: 'download',
        ZIPDOWNLOAD: 'zipdownload',
        URL_SHARE: 'urlshare',
        SHARE: 'share',
        SHARECANCEL: 'shareCancel',
        PROPERTY: 'property',
        CHECKOUT: 'checkout',
        READMODE: 'readmode',
        CHECKIN: 'checkin',
        ADDBOOKMARK: 'Addbookmark',
        REMOVEBOOKMARK: 'Removebookmark',
        PERMISSION: 'permission',
        HISTORY: 'history',
        VERSION: 'version',
        NEWDIR: 'newDir',
        ZIP: 'zip',
        UNZIP: 'unzip',
        GROUPSEARCH: 'groupsearch', // 임시
        TRASHCLEAN: 'trashclean',
        RESTORE: 'restore',
        VIEWER: 'viewer',
        RULES: 'rules',
        APPROVAL: 'approval',
        EXPIRE: 'expire',
        ONLINEEDIT: 'onlineedit',
        GOTO: 'goto',
        REMOVEREWRITE: 'removeRewrite',
        SHORTCUT: 'shortcut',
        SCAN: 'scan',
        CHECKOUTCANCEL: 'Checkoutcancel',
        MAKEFILE: 'makefile',
        SEARCH: 'search',
        REALEXPIRE: 'realExpire',
        EXPIRERESTORE: 'expireRestore',
        BOOKMARKRENAME: 'bookmarkrename',
        ENCRYPT: 'revertDrm',
        DECRYPT: 'convertDrm',
        URLDRM: 'urlDrm',
        URLSYNCHRONIN: 'synchronIn',
        URLSYNCHRONOUT: 'synchronOut',
        URLSYNCHRONHISTORY: 'synchronHistory',
        URLEXITTRANS: 'exitTrans',
        URLEXITTRANSHISTORY: 'exitTransHistory',
        MULTIUPLOAD: 'multiUpload',
        PRSRV: 'prsrv'
    },
    ATTRIBUTE: {
        NONE: 0,
        COMMON_FILE: 1,
        COMMON_MULTI: 2,
        COMMON_FOLDER: 4,
        CURRENT_DIR: 8, // empty area
        // contextmenu에서 element가 실제 존재하지 않을경우, file/folder 여부를 알 수 없으므로 special 처리
        SPECIAL: 16,
        ZIP: 32
    },
    VIEW_TYPES: {
        USER: 'user',
        SEL_USERGROUP: 'usergroup',
        SEL_USER: 'select_user',
        SEL_GROUP: 'select_group',
        SEL_GROUP_TREE: 'group_tree',
        GROUP: 'group',
        PERMISSION: 'permission'
    },
    SELECTABLE: {
        MULTIPLE: 'multiple, row',
        ROW: 'row',
        NONE: false
    },
    PERMISSION: {
        DOWNLOAD: 32,
        CONTROL: 1024,
        VIEW: 64,
        PRINT: 128,
        CHECK: 256,
        RENAME: 16,
        DELETE: 8,
        ADD: 4,
        WRITE: 2,
        READ: 1
    },
    STATUS: {
        PARTIAL: "-1",
        FALSE: "0",
        TRUE: "1"
    },
    // 패스 정보가 필요한 rootId 정의
    FEATURES_PATH(root) {
        let array = [
            'bookmark', 'trash', 'search', 'Categories', 'recentDoc', 'inShare', 'request', 'complete', 'approval', 'checkedOutDocs'
        ]
        return array.includes(root)
    },
    // filesize 정렬이 가능한 문서함
    FEATURES_SORTABLE_SIZE(root) {
        let array = [
            'Shared', 'Workspace', 'Sites', 'trash', 'search', 'recentDoc', 'checkedOutDocs', 'Categories'
        ]
        return array.includes(root)
    },
    FEATURES_TOOLBAR_ACTIONS(root) {
        let array = [
            'bookmark', 'trash', 'search', 'Categories', 'recentDoc', 'inShare', 'receivedShare', 'carryout'
        ]
        return !array.includes(root)
    },
    FEATURES_APPROVAL(root) {
        let array = [
            'approval', 'request'
        ]
        return !array.includes(root)
    },
    FEATURES_DRAGFILEUPLOAD(root) {
        let array = [
            'Shared', 'Workspace'
        ]
        return array.includes(root)
    },
    MVCP_OPTIONS: {
        NONE: 0,
        WAIT: 1,
        SKIP: 2,
        OVERWRITE: 4,
        OVERWRITEALL: 8,
        SKIPALL: 16,
        CANCEL: 32
    },
    PROGRESS_TYPE: {
        COMMON: 0,
        ZIP: 1,
        MVCP: 2
    },
    MVCP_OPTION: {
        NONE: 0,
        CONFLICT: 1,
        NOPERMISSION: 2,
        UNKNOWN_ERROR: 4,
    },
    FILTER_FILENAME: [
        '.', '..', 'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ],
    FORM_VALIDATOR: {
        FILTER_ILLEGAL_FILENAME: (rule, value, callback) => {
            if (value == '' && value.trim().length == 0) {
                callback(new Error(vue.$t('messages.inputFilename')));
                return;
            }
            if (constants.FILTER_FILENAME.includes(value.toUpperCase())) {
                callback(new Error(vue.$t('messages.wrongFilename')));
                return
            }
            if (/[\|"<>\\:"/*]/g.test(value)) {
                callback(new Error(vue.$t('messages.illegalFilename')));
                return;
            }
            callback();
        }
    },
    GRID_COLUMN: { //기존 캔도용
        FILENAME: {
            field: "object_name",
            title: i18n.t('files.name'),
            sortable: {
                initialDirection: 'asc',
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.object_name : '1' + a.object_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.object_name : '1' + b.object_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        }
    },
    LISTGRID_EMPTY_MESSAGE_FACTORY(rootId, currentId) {
        var message = "";
        switch (rootId) {
            case 'search':
                {
                    message = "<br><center>" + i18n.t('label.empty_search_result') + "</center>";
                }
                break;
            case 'category':
                {
                    if (currentId == 'category') {
                        message = "<br><center>" + i18n.t('label.select_category') + "</center>";
                    } else {
                        message = "<br><center>" + i18n.t('label.empty_category') + "</center>";
                    }
                }
                break;
            case 'bookmark':
                {
                    message = "<br><center>" + i18n.t('label.bookmark_empty') + "</center>";
                }
                break;
            case 'request':
                {
                    message = "<br><center>" + i18n.t('label.request_empty') + "</center>";
                }
                break;
            case 'approval':
                {
                    message = "<br><center>" + i18n.t('label.approval_empty') + "</center>";
                }
                break;
            case 'complete':
                {
                    message = "<br><center>" + i18n.t('label.complete_empty') + "</center>";
                }
                break;
            case 'receivedShare':
                {
                    message = "<br><center>" + i18n.t('label.receivedShare_empty') + "</center>";
                }
                break;
            case 'inShare':
                {
                    message = "<br><center>" + i18n.t('label.share_empty') + "</center>";
                }
                break;
            case 'myShared':
                {
                    message = "<br><center>" + i18n.t('label.myshare_empty') + "</center>";
                }
                break;
            // case 'Categories':
            //     {
            //         message = "<br><center>" + i18n.t('label.category_empty') + "</center>";
            //     }
            //     break;
            default:
                {
                    message = "<br><center>" + i18n.t('label.directory_empty') + "</center>"
                }
        }
        return message;
    },
    GRID_COLUMN: {
        INDICATOR: { template: "<div id='indic_#= r_object_id #' class='list-indicator'>#=Utils.getIndicators(data)#</div>", field: "r_object_id", title: ' ', width: 30, cellClass: 'ui-grid-cell-contents-auto' },
        FILENAME: {
            template: "<div class='hold-line' title='#: object_name #'><span class='grid-icon'>#=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#</span>" +
                "#= Utils.truncate(object_name, 80) # " +
                "# if (r_object_type != 'dm_folder') { # " +
                "<span id='vLabel_#= r_object_id #' class='versionLabel'>#=r_version_label#</span>" +
                "# } #" +
                "# if(store.state.rootId!='trash' && store.state.rootId!='onlyExpired' && store.state.rootId!='bookmark' && store.state.rootId!='approval' && store.state.rootId!='request' && !(store.state.rootId=='search' && (store.state.lastSearchOption.content.r_folder_id=='trash' || store.state.lastSearchOption.content.r_folder_id=='onlyExpired '))) { #" +
                "# if ((typeof bookmarked)=='undefined') { # " +
                "<span id='star_#= r_object_id #' class='fa fa-star-o bookmarked' onclick='Utils.changeBookmarkLogo(#= r_object_id #);' title='" + i18n.t('files.bookmark') + "'></span>" +
                "# }else{ #" +
                " <span id='star_#= r_object_id #' class='fa fa-star bookmarked' onclick='Utils.changeBookmarkLogo(#= r_object_id #);' title='" + i18n.t('files.bookmark') + "'></span>" +
                "# } #" +
                "# if ((typeof securityProfileId) !='undefined' && securityProfileId == 'ACL') { # " +
                "<span class='fa fa-key' style='color:darkgray;' title='" + i18n.t('label.acl') + "'></span>" +
                "# } #" +
                "# } #" +
                "</div>",
            field: "object_name",
            title: i18n.t('files.name'),
            width: 200,
            minWidth: 200,
            maxWidth: 500,
            sortable: {
                initialDirection: 'asc',
                //allowUnsort: true,
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.object_name : '1' + a.object_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.object_name : '1' + b.object_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        FILESIZE: {
            template: "<span class='filesizeSort' title='#: Utils.filesize(r_content_size) #'>#: Utils.filesize(r_content_size) #</span>",
            field: "r_content_size",
            title: i18n.t('files.size'),
            width: 100,
            sortable: {
                compare: function (a, b) {
                    if (parseInt(a.r_content_size) === parseInt(b.r_content_size)) {
                        return 0
                    } else if (parseInt(a.r_content_size) < parseInt(b.r_content_size)) {
                        return -1
                    } else {
                        return 1
                    }
                }
            }
        },
        OWNER: {
            field: "owner_name",
            template: "<span title='#: owner_name #'>#: owner_name #</span>",
            title: i18n.t('files.owner'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.owner_name : '1' + a.owner_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.owner_name : '1' + b.owner_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }

        },
        MODIFIER: {
            field: "modifier_name",
            template: "# if (r_object_type != 'dm_folder') { # " +
                "<span title='#: modifier_name #'>#: modifier_name #</span>" +
                "# } #",
            title: i18n.t('files.modifier'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.modifier_name : '1' + a.modifier_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.modifier_name : '1' + b.modifier_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        MODIFIED_DATE: {
            template: "<span title='#: Utils.formatMoment(r_modify_date)#'>#: Utils.formatMoment(r_modify_date)#</span>",
            field: "r_modify_date",
            title: i18n.t('files.lastModified'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.r_modify_date : '1' + a.r_modify_date
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.r_modify_date : '1' + b.r_modify_date
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        DELETE: {
            field: "modifier_name",
            template: "# if (r_object_type != 'dm_folder') { # " +
                "<span title='#: modifier_name #'>#: modifier_name #</span>" +
                "# } #",
            title: i18n.t('files.deleteName'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.modifier_name : '1' + a.modifier_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.modifier_name : '1' + b.modifier_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        DELETE_DATE: {
            template: "<span title='#: Utils.formatMoment(r_modify_date)#'>#: Utils.formatMoment(r_modify_date)#</span>",
            field: "r_modify_date",
            title: i18n.t('files.deleteDate'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.r_modify_date : '1' + a.r_modify_date
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.r_modify_date : '1' + b.r_modify_date
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        CREATER: {
            field: "producer_name",
            template: "<span title='#: producer_name #'>#: producer_name #</span>",
            title: i18n.t('label.create_userid'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.producer_name : '1' + a.producer_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.producer_name : '1' + b.producer_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        CREATED_DATE: {
            template: "<span title='#: Utils.formatMoment(r_creation_date) #'>#: Utils.formatMoment(r_creation_date) #</span>",
            field: "r_creation_date",
            title: i18n.t('label.creation_date'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.r_creation_date : '1' + a.r_creation_date
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.r_creation_date : '1' + b.r_creation_date
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        PATH: {
            field: "r_folder_path",
            template: "<span class='list-item-path' onclick=\"Utils.jumpToPath('#= r_folder_path #')\">" + " # if (path!=null) { # " +
                "#= path #" +
                "# } #" +
                "</span>",
            title: i18n.t('label.path'),
            width: 200,
            sortable: false
        },
        SUBJECT: { field: "subject", title: i18n.t('label.subject'), width: 250, minWidth: 200, maxWidth: 500 },
        APPROVAL_DATE: { template: "#: Utils.formatMoment(startDate) #", field: "startDate", title: i18n.t('label.approvalDate') },
        AUTHOR: { field: "author", title: i18n.t('label.author'), sortable: false },
        SHARER: { field: "share_user", title: i18n.t('label.sharer'), sortable: false },
        SHARE_DATE: { template: "#: Utils.formatMoment(share_created) #", field: "share_created", title: i18n.t('label.shareCreated') },
        DOC_TYPE: {
            template: "# if (r_object_type != 'dm_folder') { # " +
                "#=docTypeName#" +
                "# } #",
            field: "docTypeName",
            title: i18n.t('files.doctype'),
            width: "100px",
            sortable: false
        },
        SELECTBOX: {
            title: '',
            //headerTemplate: "<input type='checkbox' id='header-chb' class='k-checkbox header-checkbox'><label class='k-checkbox-label' for='header-chb'></label>",
            template: "<input type='checkbox' class='k-checkbox row-checkbox'>" +
                " # if (r_object_type != 'dm_folder') { # <label class='k-checkbox-label row-checkbox-label' title='file'></label> #}else{# <label class='k-checkbox-label row-checkbox-label' title='folder'></label> #}#",
            width: 80
        },
        LOCK_OWNER: {
            field: "r_lock_owner_name",
            template: "<span title='#: r_lock_owner_name #'>#: r_lock_owner_name #</span>",
            title: i18n.t('files.lockowner'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.r_lock_owner_name : '1' + a.r_lock_owner_name
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.r_lock_owner_name : '1' + b.r_lock_owner_name
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
        VERSION: {
            field: "r_version_label",
            title: i18n.t('files.version'),
            sortable: {
                compare: function (a, b) {
                    let compareNameA = (a.docTypeName == 'FOLDER') ? '0' + a.r_version_label : '1' + a.r_version_label
                    let compareNameB = (b.docTypeName == 'FOLDER') ? '0' + b.r_version_label : '1' + b.r_version_label
                    return compareNameA.localeCompare(compareNameB)
                }
            }
        },
    },
    GRID_COLUMN_TEMPLATE: {
        COMMON: ['INDICATOR', 'FILENAME', 'PATH', 'FILESIZE', 'MODIFIER', 'MODIFIED_DATE', 'CREATER', 'CREATED_DATE'],
        APPROVAL: ['FILENAME', 'SUBJECT', 'AUTHOR', 'APPROVAL_DATE'],
        RECVSHARE: ['FILENAME', 'PATH', 'FILESIZE', 'MODIFIER', 'MODIFIED_DATE', 'CREATER', 'CREATED_DATE'],
        TRASH: ['INDICATOR', 'FILENAME', 'PATH', 'FILESIZE', 'OWNER', 'DELETE', 'DELETE_DATE'],
        SEARCH: ['INDICATOR', 'FILENAME', 'PATH', 'FILESIZE', 'CREATER', 'CREATED_DATE'],
    },

    ADMINMENU: {
        USER: 'user',
        GROUP: 'group',
        TASK: 'task',
        LOG: 'log',
        DOCUMENTTYPE: 'docType',
        CATEGORY: 'category',
        NOTICE: 'notice',
        TEMPLATE: 'template',
        CODE: 'code',
        AUDIT: 'audit',
        SECURITY: 'security',
        SESSION: 'session',
        HISTORY: 'history',
        CREATE: 'create',
        EDIT: 'edit',
        PROFILE: 'profile',
        DELETE: 'delete',
        UNSSIGN: 'unassign',
        SETADMIN: 'none',
    },
    PREDEFINED_COLUMNS_FIX: (type) => {
        let columns = [];
        let gridColumnList = constants.GRID_COLUMN_TEMPLATE[type]
        var commonColums = Utils.features('gridColumn');

        if (type === 'COMMON' && commonColums) {
            gridColumnList = ['FILENAME', 'INDICATOR', 'CREATED_DATE', 'CREATER']
        }

        gridColumnList.forEach(e => {
            // filesize의 경우, sortable 가능여부 따로 설정
            let name = e.trim()
            let column = constants.GRID_COLUMN[name]
            //   if (name === 'FILESIZE') {
            //     column.sortable = constants.FEATURES_SORTABLE_SIZE(store.state.rootId)
            //   }
            columns.push(column);
        })

        if (Utils.featuresDefault('listselectbox', false)) {
            columns.unshift(constants.GRID_COLUMN['SELECTBOX']);
        }
        return columns
    },
    PREDEFINED_COLUMNS: (type) => {
        let columns = [];
        let gridColumnList = constants.GRID_COLUMN_TEMPLATE[type]
        var commonColums = Utils.features('gridColumn');

        if (type === 'COMMON' && commonColums) {
            gridColumnList = commonColums.split(',');
        }

        gridColumnList.forEach(e => {
            // filesize의 경우, sortable 가능여부 따로 설정
            let name = e.trim()
            let column = constants.GRID_COLUMN[name]
            //   if (name === 'FILESIZE') {
            //     column.sortable = constants.FEATURES_SORTABLE_SIZE(store.state.rootId)
            //   }
            columns.push(column);
        })

        if (Utils.featuresDefault('listselectbox', false)) {
            columns.unshift(constants.GRID_COLUMN['SELECTBOX']);
        }
        return columns
    },
    TREEVIEW_TEMPLATE: "#if(Utils.rootIconCheck(item.spriteCssClass)){" +
        "   #<i class='fa fa-folder treeFolderIcon'></i># " +
        " }#" +
        "#: item.text #",
    TREEVIEW_FILE_TEMPLATE: "#if(Utils.rootIconCheck(item.spriteCssClass)){" +
        "   #<i class='fa fa-folder treeFolderIcon'></i># " +
        "}else if(item.spriteCssClass=='x-icon-rule'){" +
        "   #<i class='fa fa-folder treeFolderIcon'></i># " +
        "}#" +
        "#: item.text #",
    STATISTIC: {
        arc: 'archive',
        search: 'search'
    },
    DEFAULT_HOME: '/files/',
    NOPE: '::NOPE::' // dummy data, currentDir 초기화 용으로 쓰임

}

export default constants