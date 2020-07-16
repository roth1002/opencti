import { assoc, pipe, isNil } from 'ramda';
import { createEntity, listEntities, loadEntityById, FROM_START, UNTIL_END } from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_INTRUSION_SET } from '../utils/idGenerator';

export const findById = (intrusionSetId) => {
  return loadEntityById(intrusionSetId, ENTITY_TYPE_INTRUSION_SET);
};

export const findAll = (args) => {
  return listEntities([ENTITY_TYPE_INTRUSION_SET], ['name', 'description', 'aliases'], args);
};

export const addIntrusionSet = async (user, intrusionSet) => {
  const intrusionSetToCreate = pipe(
    assoc('first_seen', isNil(intrusionSet.first_seen) ? new Date(FROM_START) : intrusionSet.first_seen),
    assoc('last_seen', isNil(intrusionSet.first_seen) ? new Date(UNTIL_END) : intrusionSet.first_seen)
  )(intrusionSet);
  const created = await createEntity(user, intrusionSetToCreate, ENTITY_TYPE_INTRUSION_SET);
  return notify(BUS_TOPICS.stixDomainObject.ADDED_TOPIC, created, user);
};