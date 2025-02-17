// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import CountryPopover from './CountryPopover';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import StixCoreObjectStixCyberObservables from '../../observations/stix_cyber_observables/StixCoreObjectStixCyberObservables';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';
import { CountryKnowledge_country$key } from './__generated__/CountryKnowledge_country.graphql';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 0 0',
  },
}));

const countryKnowledgeFragment = graphql`
  fragment CountryKnowledge_country on Country {
    id
    name
    x_opencti_aliases
  }
`;

const CountryKnowledgeComponent = ({ countryData }: { countryData: CountryKnowledge_country$key }) => {
  const classes = useStyles();
  const country = useFragment<CountryKnowledge_country$key>(countryKnowledgeFragment, countryData);
  const link = `/dashboard/locations/countries/${country.id}/knowledge`;

  return (
    <div className={classes.container}>
      <StixDomainObjectHeader
        disableSharing={true}
        stixDomainObject={country}
        PopoverComponent={CountryPopover}
        variant="noaliases"
      />
      <Switch>
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/relations/:relationId"
          render={(routeProps) => (
            <StixCoreRelationship
              entityId={country.id}
              paddingRight={20}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/sightings/:sightingId"
          render={(routeProps) => (
            <StixSightingRelationship
              entityId={country.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/overview"
          render={(routeProps) => (
            <StixDomainObjectKnowledge
              stixDomainObjectId={country.id}
              stixDomainObjectType="Country"
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/related"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['related-to']}
              targetStixDomainObjectTypes={[
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
                'Incident',
                'Malware',
                'Tool',
                'Vulnerability',
                'Individual',
                'Organization',
                'Sector',
                'Region',
                'Country',
                'City',
                'Position',
              ]}
              entityLink={link}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/cities"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['located-at']}
              targetStixDomainObjectTypes={['City']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/organizations"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['located-at']}
              targetStixDomainObjectTypes={['Organization']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/threat_actors"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Threat-Actor']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/intrusion_sets"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets', 'originates-from']}
              targetStixDomainObjectTypes={['Campaign', 'Intrusion-Set']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/campaigns"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Campaign']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/incidents"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Incident']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/malwares"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Malware']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/attack_patterns"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Attack-Pattern']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/tools"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={country.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Tool']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/observables"
          render={(routeProps) => (
            <StixCoreObjectStixCyberObservables
              stixCoreObjectId={country.id}
              stixCoreObjectLink={link}
              noRightBar={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/locations/countries/:countryId/knowledge/sightings"
          render={(routeProps) => (
            <EntityStixSightingRelationships
              entityId={country.id}
              entityLink={link}
              noRightBar={true}
              isTo={true}
              {...routeProps}
            />
          )}
        />
      </Switch>
    </div>
  );
};

export default CountryKnowledgeComponent;
