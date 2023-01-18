<template>
  <div id ="layoutscript">
    <!-- kendo template 은 여기에 정의해야함. List vue에 넣으면 항목 표시가 안됨 -->
    <script id="list1-itemTemplate" type="text/x-kendo-template">
        <div id="list-item" class="list-item-list1 list-item">
            <div class="list-item-bottom">
                <div class='list-item-indic1'>
                     #if (Utils.features('listselectbox')) {#
                        <input type='checkbox' class='k-checkbox row-checkbox'>
                        # if (r_object_type != 'dm_folder') { #
                          <label class='k-checkbox-label row-checkbox-label' title='file'></label>
                        #}else{#
                          <label class='k-checkbox-label row-checkbox-label' title='folder'></label>
                        #}#
                    #}#
                    <span id='indic_#= r_object_id #' class="list-indicator">
                        #= Utils.getIndicators(data,true) #
                    </span>
                </div>
                <div class="list-item-icon-list1">
                    #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                </div>
                <div class="list-item-name">#=object_name#
                </div>
                <div class="list-item-filesize">
                    # if (r_object_type != 'dm_folder') { #
                    <span id='vLabel_#= r_object_id #' class='versionLabel'>#=r_version_label#</span>
                    # } #
                    #: Utils.filesize(r_content_size) #
                </div>
            </div>
        </div>
        </div>
    </script>
    <script id="list2-itemTemplate" type="text/x-kendo-template">
        <div id="list-item" class="list-item-list2 list-item">
            <div class="list-item-bottom">
                <div class='list-item-indic2'>
                    #if (Utils.features('listselectbox')) {#
                        <input type='checkbox' class='k-checkbox row-checkbox'>
                        # if (r_object_type != 'dm_folder') { #
                          <label class='k-checkbox-label row-checkbox-label' title='file'></label>
                        #}else{#
                          <label class='k-checkbox-label row-checkbox-label' title='folder'></label>
                        #}#
                    #}#
                    <span id='indic_#= r_object_id #' class="list-indicator">
                        #= Utils.getIndicators(data,true) #
                    </span>
                </div>
                <div class="list-item-icon-list2">
                    # try { #
                        # if (Utils.featuresDefault('thumbnail',false) && Utils.isThumbnailSupported(dos_ext)) { #
                            <img src="#=store.state.baseURL#/service/thumbnail/get?docId=#=r_object_id#&c=force" onError="Utils.handleThumbnailError(this, '#=r_object_type#', '#=dos_ext#')" />
                        # } else { #
                            #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                        # } #
                    # } catch (e) { #
                        #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                    # } #
                </div>
                <div class="list-item-name">#=object_name#
                </div>
                <div class="list-item-filesize">
                    # if (r_object_type != 'dm_folder') { #
                    <span id='vLabel_#= r_object_id #' class='versionLabel'>#=r_version_label#</span>
                    # } #
                    #: Utils.filesize(r_content_size) #
                </div>
            </div>
        </div>
    </script>

    <!-- detail item template -->
    <script id="detail-itemTemplate" type="text/x-kendo-template">

        <div class="list-item-detail box list-item">
            <article class="media">
                <div class='checkboxView'>
                #if (Utils.features('listselectbox')) {#
                <div class='list-checkbox'>
                    <input type='checkbox' class='k-checkbox row-checkbox'>
                    # if (r_object_type != 'dm_folder') { #
                          <label class='k-checkbox-label row-checkbox-label' title='file'></label>
                    #}else{#
                          <label class='k-checkbox-label row-checkbox-label' title='folder'></label>
                    #}#
                </div>
                #}#
                </div>
                <div class="media-left">

                    <div class="list-item-icon-detail">
                        # try { #
                            # if (Utils.featuresDefault('thumbnail',false) && Utils.isThumbnailSupported(dos_ext)) { #
                                <img class="list-item-image" src="#=store.state.baseURL#/service/thumbnail/get?&docId=#=r_object_id#&c=force" onError="Utils.handleThumbnailError(this, '#=r_object_type#', '#=dos_ext#')" />
                            # } else { #
                                #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                            # } #
                        # } catch (e) { #
                            #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                        # } #
                    </div>
                </div>
                <div class="media-content class-con">
                    <div class="content">
                        # if (data.sProcess != undefined && (store.state.rootId=="approval" || store.state.rootId=="request" || store.state.rootId=="complete")) { #
                            <div class="list-item-name">#=subject#</div>
                        # } #
                        <div class="list-item-name margin-minus">#=object_name#
                        # if (r_object_type != 'dm_folder') { #
                            <span id='vLabel_#= r_object_id #' class="versionLabel margin-r-15">#=r_version_label#</span>
                            <span class="margin-r-15 grayfont">
                                #: Utils.filesize(r_content_size) #
                            </span>
                        # } #
                            <span id='indic_#= r_object_id #' class="list-indicator">
                                #= Utils.getIndicators(data,true, ((typeof doAction)!='undefined')? doAction: true) #
                            </span>
                        </div>

                        <p>
                        # if (data.sProcess != undefined && (store.state.rootId=="approval" || store.state.rootId=="request" || store.state.rootId=="complete") ) { #
                            <span class="margin-r-15 modified">
                                <span class="grayfont">{{ $t('label.approvalDate') }} : </span> #: Utils.formatMoment(startDate) #</span>
                            </span>
                            <span class="margin-r-15">
                                <span class="grayfont">{{ $t('label.author') }} : </span> #=author#
                            </span>
                        # } else {#
                            <span class="margin-r-15 modified">
                                <span class="grayfont">{{ $t('label.modifiedDate') }} : </span> #: Utils.formatMoment(r_modify_date) #</span>
                            </span>
                            <span class="margin-r-15 modified">
                                <span class="grayfont">{{ $t('label.createdDate') }} : </span> #: Utils.formatMoment(r_creation_date) #</span>
                            </span>

                            <span class="margin-r-15">
                                <span class="grayfont">{{ $t('label.owner') }} : </span> #=owner_name#
                            </span>
                            <span class="margin-r-15">
                                <span class="grayfont">{{ $t('label.create_userid') }} : </span> #=producer_name#
                            </span>
                            #if (data.modifier_name != undefined) {#
                            <span class="margin-r-15">
                                <span class="grayfont">{{ $t('files.modifier') }} : </span> #=modifier_name#
                            </span>
                            #}#
                            </p>
                            #if (data.summary != undefined) {#
                            <div class="summary">#=data.summary#</div>
                            #}#

                            # if(data.tags != undefined && tags.length>0){ #
                                <div class="x-tags">
                                    <span class="grayfont margin-r-15">{{ $t('label.tags') }} </span>
                                    # for (let i=0; i<tags.length;i++) { #
                                        <span class="tag" onclick="Event.fire(EventList.SEARCH_TAG, '#: tags[i].eclassId#')">
                                            #:tags[i].description#
                                        </span>
                                    # } #
                                </div>
                            # } #
                            # if(data.categories != undefined && categories.length>0){ #
                                <div class="x-tags category-list">
                                    <span class="grayfont margin-r-15">{{ $t('label.categories') }} </span>
                                    # for (let i=0; i<categories.length;i++) { #
                                        <span class="tag" onclick="Event.fire(EventList.SEARCH_TAG, '#: categories[i].eclassId#')">
                                            #:categories[i].description#
                                        </span>
                                    # } #
                                </div>
                            # } #
                        # } #
                        #if (constants.FEATURES_PATH(store.state.rootId)) {#
                        <span class="list-item-path" onclick="Utils.jumpToPath('#: data.r_folder_path#')"> #=path# </span>
                        #}#

                    </div>
                </div>
            </article>
        </div>
    </script>
    
    <!-- notice template -->
    <script id="notice-Template" type="text/x-kendo-template">
        <div class="list-item-detail box list-item">
            <article class="media">
                <div class="media-content class-con">
                    <div class="content">
                       <p onclick="Event.fire(EventList.DASHBOARD_NOTICE,'#: JSON.stringify(data) #')">
                          <span class="notice-subject">
                             #=subject#
                          </span>
                          <span class="grayfont notice-detail">
                             #=Utils.getLocaleDate(data.createDate)#
                          </span>
                       </p>
                    </div>
                </div>
            </article>
        </div>
    </script>
    
     <!-- dashboard -->
     <script id="dashboard-list-itemTemplate" type="text/x-kendo-template">

        <div class="list-item-detail box list-item">
                <div class="">
                    <div class="dash-icon">
                        # try { #
                            # if (Utils.featuresDefault('thumbnail',false) && Utils.isThumbnailSupported(dos_ext)) { #
                                <img class="list-item-image" src="#=store.state.baseURL#/service/thumbnail/get?&docId=#=r_object_id#&c=force" onError="Utils.handleThumbnailError(this, '#=r_object_type#', '#=dos_ext#')" />
                            # } else { #
                                #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                            # } #
                        # } catch (e) { #
                            #=Utils.getDefaultFileIcon(r_object_type, dos_ext, data.attrList)#
                        # } #
                    </div>
                </div>
                <div class="media-content class-con">
                    <div class="content">
                            <b>#=object_name#</b>
                            # if (r_object_type != 'dm_folder') { #
                                <span id='vLabel_#= r_object_id #' class="versionLabel margin-r-15">#=r_version_label#</span>
                                <span class="margin-r-15 grayfont">
                                    #: Utils.filesize(r_content_size) #
                                </span>
                            # } #
                            <p>
                            <span class="margin-r-15 modified">
                                <span class="grayfont">{{ $t('label.createdDate') }} : </span> #: Utils.formatMoment(r_creation_date)#</span>
                            </span>

                            <span class="margin-r-15">
                                <span class="grayfont">{{ $t('label.owner') }} : </span> #=owner_name#
                            </span>
                            </p>
                    </div>
                </div>
        </div>
    </script>
  </div>


</template>

<script>

export default {
  name: "layoutScript",
  methods : {
  }
};
</script>
