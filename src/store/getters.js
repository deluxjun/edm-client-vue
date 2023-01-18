const getters = {
  userNameUI: state =>
    Utils.getUserNameForUI(state.user.userId, state.user.userName),
  userId: state => state.user.userId,
  selectedCount: state => state.selected.length,
  getRootIdByName: state => name => {
    let node = state.rootMap.get(name);
    if (node) return node.id;
    else return null;
  },
  getRootByName: state => name => {
    let node = state.rootMap.get(name);
    return node;
  }
  // getSelected: state => {
  //   if (state.selected && state.selected.length > 0)
  //     return state.selected
  //   else return [
  //     {r_object_id: state.currentDir}
  //   ]
  // },
  // getSelectedId: state => {
  //   if (state.selected && state.selected.length > 0)
  //     return state.selected.map(e => {return e.r_object_id})
  //   else
  //     return [state.currentDir]
  // }
};

export default getters;
