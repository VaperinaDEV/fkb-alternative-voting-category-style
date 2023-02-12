import { ajax } from "discourse/lib/ajax";
import { apiInitializer } from "discourse/lib/api";
import { alias } from "@ember/object/computed";
import discourseComputed from "discourse-common/utils/decorators";
import I18n from "I18n";

const votingCategories = settings.voting_categories.split("|");

export default apiInitializer("1.1", (api) => {
  api.modifyClass("component:topic-list-item", {
    pluginId: "discourse-alternative-voting-category-style",
    votesLeft: alias("currentUser.votes_left"),
    userVoted: alias("topic.user_voted"),

    @discourseComputed("topic", "lastVisitedTopic")
    unboundClassNames(topic, lastVisitedTopic) {
      let classList = this._super(...arguments);
      if(!topic.can_vote) {
        classList += " non-voting";
      }
      return classList;
    },
    click(e) {
      const target = e.target;
      const topic = this.topic;

      if (target.classList.contains("topic-list-vote-button") && settings.vote_from_topic_list && (this.votesLeft > 0 || this.userVoted) && !topic.closed) {
        let voteCountElem = target.nextElementSibling;
        let voteCount = parseInt(voteCountElem.innerHTML);
        let voteType;

        if (target.classList.contains("can-vote")) {
          voteCountElem.innerHTML = voteCount + 1;
          voteType = "vote";

          this.set("votesLeft", this.votesLeft - 1);
          this.set("userVoted", true);

          if(this.votesLeft === 0) {
            document.querySelectorAll(".topic-list-item:not(.closed) .topic-list-vote-button.can-vote").forEach(voteButton => {
              voteButton.classList.add('disabled');
              voteButton.title = I18n.t(themePrefix("out_of_votes"));
            });
          }

          // Ensure clicked button has proper title and class
          target.title = I18n.t(themePrefix("user_vote"));
          target.classList.remove('disabled');

        } else {
          voteCountElem.innerHTML = voteCount - 1;
          voteType = "unvote";

          this.set("votesLeft", this.votesLeft + 1);
          this.set("userVoted", false);

          if(this.votesLeft > 0) {
            document.querySelectorAll(".topic-list-item:not(.closed) .topic-list-vote-button.can-vote").forEach(voteButton => {
              voteButton.classList.remove('disabled');
              voteButton.title = I18n.t(themePrefix("user_no_vote"));
            });
          }

          target.title = I18n.t(themePrefix("user_no_vote"));
        }

        target.classList.toggle("can-vote");

        ajax(`/voting/${voteType}`, {
          type: "POST",
          data: {
            topic_id: topic.id
          }
        })
      }
      return this._super(...arguments);
    }
  });
});
