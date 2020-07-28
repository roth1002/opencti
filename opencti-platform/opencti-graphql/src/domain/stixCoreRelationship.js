import { assoc, dissoc, propOr } from 'ramda';
import { delEditContext, notify, setEditContext } from '../database/redis';
import {
  createRelation,
  deleteRelationById,
  escapeString,
  executeWrite,
  findWithConnectedRelations,
  getRelationInferredById,
  internalLoadEntityById,
  listRelations,
  loadRelationById,
  loadWithConnectedRelations,
  updateAttribute,
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { ForbiddenAccess } from '../config/errors';
import { elCount } from '../database/elasticSearch';
import { buildPagination, INDEX_STIX_CORE_RELATIONSHIPS } from '../database/utils';
import {
  isStixId,
  isInternalId,
  isStixCoreRelationship,
  ENTITY_TYPE_LABEL,
  ENTITY_TYPE_IDENTITY,
  ENTITY_TYPE_CONTAINER_REPORT,
  RELATION_CREATED_BY,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
  RELATION_KILL_CHAIN_PHASE,
  RELATION_EXTERNAL_REFERENCE,
  ENTITY_TYPE_CONTAINER_NOTE,
  ENTITY_TYPE_CONTAINER_OPINION,
  ENTITY_TYPE_MARKING_DEFINITION,
  ENTITY_TYPE_KILL_CHAIN_PHASE,
  ENTITY_TYPE_EXTERNAL_REFERENCE,
} from '../utils/idGenerator';

export const findAll = async (args) => {
  return listRelations(propOr('stix_relation', 'relationship_type', args), args);
};

export const findById = (stixCoreRelationshipId) => {
  if (!isStixId(stixCoreRelationshipId) && !isInternalId(stixCoreRelationshipId)) {
    return getRelationInferredById(stixCoreRelationshipId);
  }
  return loadRelationById(stixCoreRelationshipId, 'stix_relation');
};

export const stixCoreRelationshipsNumber = (args) => {
  let finalArgs;
  if (args.type && args.type !== 'stix_relation' && args.type !== 'stix_relation_embedded') {
    finalArgs = assoc('relationshipType', args.type, args);
  } else {
    finalArgs = args.type ? assoc('types', [args.type], args) : assoc('types', ['stix_relation'], args);
  }
  return {
    count: elCount(INDEX_STIX_CORE_RELATIONSHIPS, finalArgs),
    total: elCount(INDEX_STIX_CORE_RELATIONSHIPS, dissoc('endDate', finalArgs)),
  };
};

export const createdBy = (stixCoreRelationshipId) => {
  return loadWithConnectedRelations(
    `match $to isa ${ENTITY_TYPE_IDENTITY}; 
    $rel(${RELATION_OBJECT}_from:$from, ${RELATION_OBJECT}_to: $to) isa ${RELATION_CREATED_BY};
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $from has internal_id "${escapeString(stixCoreRelationshipId)}"; 
    get; offset 0; limit 1;`,
    'to',
    { extraRelKey: 'rel' }
  );
};

export const reports = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $from isa ${ENTITY_TYPE_CONTAINER_REPORT}, has internal_id $from_id;
    $rel(${RELATION_OBJECT}_from:$from ${RELATION_OBJECT}_to:$to) isa ${RELATION_OBJECT}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $to has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'from',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const notes = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $from isa ${ENTITY_TYPE_CONTAINER_NOTE}, has internal_id $from_id; 
    $rel(${RELATION_OBJECT}_from:$from, ${RELATION_OBJECT}_to:$to) isa ${RELATION_OBJECT}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $to has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'from',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const opinions = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $from isa ${ENTITY_TYPE_CONTAINER_OPINION}, has internal_id $from_id;
    $rel(${RELATION_OBJECT}_from:$from, ${RELATION_OBJECT}_to:$to) isa ${RELATION_OBJECT}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $to has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'from',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const labels = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $to isa ${ENTITY_TYPE_LABEL}, has internal_id $to_id; 
    $rel(${RELATION_OBJECT_LABEL}_from:$from, ${RELATION_OBJECT_LABEL}_to:$to) isa ${RELATION_OBJECT_LABEL}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $from has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const markingDefinitions = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $to isa ${ENTITY_TYPE_MARKING_DEFINITION}, has internal_id $to_id;
    $rel(${RELATION_OBJECT_MARKING}_from:$from, ${RELATION_OBJECT_MARKING}_to:$to) isa ${RELATION_OBJECT_MARKING}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $from has internal_id "${escapeString(stixCoreRelationshipId)}"; 
    get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const killChainPhases = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $to isa ${ENTITY_TYPE_KILL_CHAIN_PHASE}, has internal_id $to_id;
    $rel(${RELATION_KILL_CHAIN_PHASE}_from:$from, ${RELATION_KILL_CHAIN_PHASE}_to:$to) isa ${RELATION_KILL_CHAIN_PHASE}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $from has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const externalReferences = (stixCoreRelationshipId) => {
  return findWithConnectedRelations(
    `match $to isa ${ENTITY_TYPE_EXTERNAL_REFERENCE}, has internal_id $to_id;
    $rel(${RELATION_EXTERNAL_REFERENCE}_from:$from, ${RELATION_EXTERNAL_REFERENCE}_to:$to) isa ${RELATION_EXTERNAL_REFERENCE}, has internal_id $rel_id;
    $from has internal_id $rel_from_id;
    $to has internal_id $rel_to_id;
    $from has internal_id "${escapeString(stixCoreRelationshipId)}";
    get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};

export const stixRelations = (stixCoreObjectId, args) => {
  const finalArgs = assoc('fromId', stixCoreObjectId, args);
  return findAll(finalArgs);
};

// region mutations
export const addStixCoreRelationship = async (user, stixCoreRelationship, reversedReturn = false) => {
  // We force the created by ref if not specified
  let input = stixCoreRelationship;
  if (!stixCoreRelationship.createdBy) {
    input = assoc('createdBy', user.id, stixCoreRelationship);
  }
  const created = await createRelation(user, input, { reversedReturn });
  return notify(BUS_TOPICS.StixCoreRelationship.ADDED_TOPIC, created, user);
};

export const stixCoreRelationshipDelete = async (user, stixCoreRelationshipId) => {
  return deleteRelationById(user, stixCoreRelationshipId, 'stix_relation');
};

export const stixCoreRelationshipEditField = (user, stixCoreRelationshipId, input) => {
  return executeWrite((wTx) => {
    return updateAttribute(user, stixCoreRelationshipId, 'stix_relation', input, wTx);
  }).then(async () => {
    const stixCoreRelationship = await loadRelationById(stixCoreRelationshipId, 'stix_relation');
    return notify(BUS_TOPICS.StixCoreRelationship.EDIT_TOPIC, stixCoreRelationship, user);
  });
};

export const stixCoreRelationshipAddRelation = async (user, stixCoreRelationshipId, input) => {
  const data = await internalLoadEntityById(stixCoreRelationshipId);
  if (!isStixCoreRelationship(data.type) || !input.relationship_type) {
    throw ForbiddenAccess();
  }
  const finalInput = assoc('fromId', stixCoreRelationshipId, input);
  return createRelation(user, finalInput).then((relationData) => {
    notify(BUS_TOPICS.StixCoreRelationship.EDIT_TOPIC, relationData, user);
    return relationData;
  });
};

export const stixCoreRelationshipDeleteRelation = async (user, stixCoreRelationshipId, relationId) => {
  await deleteRelationById(user, relationId, 'stix_relation_embedded');
  const data = await loadRelationById(stixCoreRelationshipId, 'stix_relation');
  return notify(BUS_TOPICS.StixCoreRelationship.EDIT_TOPIC, data, user);
};
// endregion

// region context
export const stixCoreRelationshipCleanContext = (user, stixCoreRelationshipId) => {
  delEditContext(user, stixCoreRelationshipId);
  return loadRelationById(stixCoreRelationshipId, 'stix_relation').then((stixCoreRelationship) =>
    notify(BUS_TOPICS.StixCoreRelationship.EDIT_TOPIC, stixCoreRelationship, user)
  );
};

export const stixCoreRelationshipEditContext = (user, stixCoreRelationshipId, input) => {
  setEditContext(user, stixCoreRelationshipId, input);
  return loadRelationById(stixCoreRelationshipId, 'stix_relation').then((stixCoreRelationship) =>
    notify(BUS_TOPICS.StixCoreRelationship.EDIT_TOPIC, stixCoreRelationship, user)
  );
};
// endregion
