const mattermost = require('../lib/mattermost');
const config = require('../config');
const BetaGouv = require('../betagouv');
const utils = require('../controllers/utils');

// get users that are member (got a github card) and mattermost account that is not in the team
const getUnregisteredMemberActifs = async (activeGithubUsers, mattermostUsersNotInMembreActif) => {
  const activeGithubUsersEmails = activeGithubUsers.map((user) => `${user.id}@${config.domain}`);
  const unregisteredMemberActifs = mattermostUsersNotInMembreActif.filter(
    (user) => activeGithubUsersEmails.includes(user.email),
  );
  return unregisteredMemberActifs;
};

const addUsersToTeam = async () => {
  const mattermostUsersNotInMembreActif = await mattermost.getUserNotInTeam(config.mattermostTeamId);
  const users = await BetaGouv.usersInfos();
  const activeGithubUsers = users.filter((x) => {
    const stillActive = !utils.checkUserIsExpired(x);
    return stillActive;
  });
  const unregisteredMemberActifs = await getUnregisteredMemberActifs(activeGithubUsers, mattermostUsersNotInMembreActif);
  const results = await mattermost.addUsersToTeam(unregisteredMemberActifs, config.mattermostTeamId);
  return results;
};

module.exports.addUsersToTeam = addUsersToTeam;
