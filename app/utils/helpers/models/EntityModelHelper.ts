const selectSimpleProperties = {
  id: true,
  order: true,
  name: true,
  title: true,
  titlePlural: true,
  active: true,
  slug: true,
  type: true,
  hasApi: true,
  showInSidebar: true,
  icon: true,
  onEdit: true,
};

const selectEntityWithoutIcon = { id: true, name: true, title: true, titlePlural: true, slug: true, onEdit: true };

export default {
  selectSimpleProperties,
  selectEntityWithoutIcon,
};
