import { getOwner } from "discourse-common/lib/get-owner";
import discourseComputed from "discourse-common/utils/decorators";
import EmberObject from "@ember/object";

const votingCategories = settings.voting_categories.split("|");
const router = getOwner(this).lookup("router:main");

export default EmberObject.extend({
  @discourseComputed()
  showCommentIcon() {
    const route = router.currentRoute;
    if (route.params && route.params.category_slug_path_with_id) {
      const splitCatPath = route.params.category_slug_path_with_id.split("/");
      return votingCategories.some(
        (category) => category === splitCatPath[splitCatPath.length - 1]
      );
    }
  },
});
