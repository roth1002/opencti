import { GraphQLDateTime } from 'graphql-iso-date';
import { mergeResolvers } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';
import ConstraintDirective from 'graphql-constraint-directive';
import settingsResolvers from '../resolvers/settings';
import logResolvers from '../resolvers/log';
import inferenceResolvers from '../resolvers/inference';
import attributeResolvers from '../resolvers/attribute';
import subTypeResolvers from '../resolvers/subType';
import labelResolvers from '../resolvers/label';
import rabbitmqMetricsResolvers from '../resolvers/rabbitmqMetrics';
import stixCoreObjectResolvers from '../resolvers/stixCoreObject';
import stixDomainObjectResolvers from '../resolvers/stixDomainObject';
import stixCyberObservableResolvers from '../resolvers/stixCyberObservable';
import stixCoreRelationshipResolvers from '../resolvers/stixCoreRelationship';
import stixSightingResolvers from '../resolvers/stixSighting';
import stixCyberObservableRelationResolvers from '../resolvers/stixCyberObservableRelationship';
import workspaceResolvers from '../resolvers/workspace';
import identityResolvers from '../resolvers/identity';
import userResolvers from '../resolvers/user';
import organizationResolvers from '../resolvers/organization';
import sectorResolvers from '../resolvers/sector';
import cityResolvers from '../resolvers/city';
import countryResolvers from '../resolvers/country';
import regionResolvers from '../resolvers/region';
import groupResolvers from '../resolvers/group';
import markingDefinitionResolvers from '../resolvers/markingDefinition';
import externalReferenceResolvers from '../resolvers/externalReference';
import killChainPhaseResolvers from '../resolvers/killChainPhase';
import attackPatternResolvers from '../resolvers/attackPattern';
import courseOfActionResolvers from '../resolvers/courseOfAction';
import threatActorResolvers from '../resolvers/threatActor';
import intrusionSetResolvers from '../resolvers/intrusionSet';
import campaignResolvers from '../resolvers/campaign';
import incidentResolvers from '../resolvers/incident';
import malwareResolvers from '../resolvers/malware';
import toolResolvers from '../resolvers/tool';
import vulnerabilityResolvers from '../resolvers/vulnerability';
import reportResolvers from '../resolvers/report';
import noteResolvers from '../resolvers/note';
import opinionResolvers from '../resolvers/opinion';
import indicatorResolvers from '../resolvers/indicator';
import AuthDirectives, { AUTH_DIRECTIVE } from './authDirective';
import connectorResolvers from '../resolvers/connector';
import fileResolvers from '../resolvers/file';
import typeDefs from '../../config/schema/opencti.graphql';

const createSchema = () => {
  const globalResolvers = {
    DateTime: GraphQLDateTime,
  };

  const resolvers = mergeResolvers([
    globalResolvers,
    settingsResolvers,
    logResolvers,
    inferenceResolvers,
    attributeResolvers,
    subTypeResolvers,
    labelResolvers,
    rabbitmqMetricsResolvers,
    connectorResolvers,
    fileResolvers,
    stixCoreObjectResolvers,
    stixDomainObjectResolvers,
    stixCyberObservableResolvers,
    stixCoreRelationshipResolvers,
    stixSightingResolvers,
    stixCyberObservableRelationResolvers,
    workspaceResolvers,
    identityResolvers,
    userResolvers,
    organizationResolvers,
    sectorResolvers,
    cityResolvers,
    countryResolvers,
    regionResolvers,
    groupResolvers,
    markingDefinitionResolvers,
    externalReferenceResolvers,
    killChainPhaseResolvers,
    attackPatternResolvers,
    courseOfActionResolvers,
    threatActorResolvers,
    intrusionSetResolvers,
    campaignResolvers,
    incidentResolvers,
    malwareResolvers,
    toolResolvers,
    vulnerabilityResolvers,
    reportResolvers,
    noteResolvers,
    opinionResolvers,
    indicatorResolvers,
  ]);

  return makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
      [AUTH_DIRECTIVE]: AuthDirectives,
      constraint: ConstraintDirective,
    },
    inheritResolversFromInterfaces: true,
  });
};

export default createSchema;
