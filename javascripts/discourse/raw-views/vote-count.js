import { getOwner } from "discourse-common/lib/get-owner";
import discourseComputed from "discourse-common/utils/decorators";
import EmberObject from "@ember/object";
import I18n from "I18n";

const votingCategories = settings.voting_categories.split("|");
const router = getOwner(this).lookup("router:main");

export default EmberObject.extend({
  showVoteCount() {
    const route = router.currentRoute;
    if (this.topic.can_vote && route.params?.category_slug_path_with_id) {
      document
        .querySelector(".list-container")
        .classList.add("voting-category");
      const splitCatPath = route.params.category_slug_path_with_id.split("/");
      const isVotingCategory = votingCategories.some(
        (category) => category === splitCatPath[splitCatPath.length - 1]
      );
      if (isVotingCategory) {
        document
          .querySelector(".list-container")
          .classList.add("voting-category");
        return true;
      }
      document
        .querySelector(".list-container")
        .classList.remove("voting-category");
      return false;
    }
  },
  @discourseComputed()
  userVotedClass() {
    return this.topic.user_voted ? "" : "can-vote";
  },
  @discourseComputed()
  votingDisabled() {
    if((this.currentUser?.votes_left <= 0 && !this.topic.user_voted) || this.topic.closed) {
      return "disabled";
    }
  },
  @discourseComputed()
  voteCount() {
    return this.topic.vote_count;
  },
  @discourseComputed()
  votedStatus() {
    if (settings.vote_from_topic_list) {
      if(this.topic.closed) {
        return I18n.t(themePrefix("closed"));
      }
      if(this.currentUser?.votes_left <= 0 && !this.topic.user_voted) {
        return I18n.t(themePrefix("out_of_votes"));
      }
      return this.topic.user_voted ? I18n.t(themePrefix("user_vote")) : I18n.t(themePrefix("user_no_vote"));
    }
    return;
  },
});
