import {
  SET_TEAM_UI_FLAG,
  CLEAR_TEAMS,
  SET_TEAMS,
  SET_TEAM_ITEM,
  EDIT_TEAM,
  DELETE_TEAM,
} from './types';
import TeamsAPI from '../../../api/teams';
import dbStorage from '../../../helper/dbStorage';

export const actions = {
  create: async ({ commit }, teamInfo) => {
    commit(SET_TEAM_UI_FLAG, { isCreating: true });
    try {
      const response = await TeamsAPI.create(teamInfo);
      const team = response.data;
      commit(SET_TEAM_ITEM, team);
      return team;
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(SET_TEAM_UI_FLAG, { isCreating: false });
    }
  },
  get: async ({ commit }) => {
    commit(SET_TEAM_UI_FLAG, { isFetching: true });
    try {
      const { data } = await TeamsAPI.get();
      commit(CLEAR_TEAMS);
      commit(SET_TEAMS, data);
      await dbStorage.setItem('teams', data || {});
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(SET_TEAM_UI_FLAG, { isFetching: false });
    }
  },
  setTeams: async ({ commit }) => {
    try {
      const teams = await dbStorage.getItem('teams');
      commit(SET_TEAMS, teams || {});
    } catch (err) {
      // Ignore retrieving errors
    }
  },
  show: async ({ commit }, { id }) => {
    commit(SET_TEAM_UI_FLAG, { isFetchingItem: true });
    try {
      const response = await TeamsAPI.show(id);
      commit(SET_TEAM_ITEM, response.data.payload);
      commit(SET_TEAM_UI_FLAG, {
        isFetchingItem: false,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(SET_TEAM_UI_FLAG, {
        isFetchingItem: false,
      });
    }
  },

  update: async ({ commit }, { id, ...updateObj }) => {
    commit(SET_TEAM_UI_FLAG, { isUpdating: true });
    try {
      const response = await TeamsAPI.update(id, updateObj);
      commit(EDIT_TEAM, response.data);
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(SET_TEAM_UI_FLAG, { isUpdating: false });
    }
  },

  delete: async ({ commit }, teamId) => {
    commit(SET_TEAM_UI_FLAG, { isDeleting: true });
    try {
      await TeamsAPI.delete(teamId);
      commit(DELETE_TEAM, teamId);
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(SET_TEAM_UI_FLAG, { isDeleting: false });
    }
  },
};
