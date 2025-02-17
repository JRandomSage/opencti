// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from 'react';
import { Route, Redirect, Switch, useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, useSubscription } from 'react-relay';
import { GraphQLSubscriptionConfig } from 'relay-runtime';
import TopBar from '../../nav/TopBar';
import Country from './Country';
import CountryKnowledge from './CountryKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import CountryPopover from './CountryPopover';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import useAuth from '../../../../utils/hooks/useAuth';
import {
  RootCountriesSubscription,
} from './__generated__/RootCountriesSubscription.graphql';
import { RootCountryQuery } from './__generated__/RootCountryQuery.graphql';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';

const subscription = graphql`
  subscription RootCountriesSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Country {
        ...Country_country
        ...CountryEditionOverview_country
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const countryQuery = graphql`
  query RootCountryQuery($id: String!) {
    country(id: $id) {
      id
      name
      x_opencti_aliases
      x_opencti_graph_data
      ...Country_country
      ...CountryKnowledge_country
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
    settings {
      platform_enable_reference
    }
  }
`;

const RootCountryComponent = ({ queryRef }) => {
  const { me } = useAuth();
  const { countryId } = useParams() as { countryId: string };

  const link = `/dashboard/locations/countries/${countryId}/knowledge`;
  const subConfig = useMemo<GraphQLSubscriptionConfig<RootCountriesSubscription>>(() => ({
    subscription,
    variables: { id: countryId },
  }), [countryId]);
  useSubscription(subConfig);

  const data = usePreloadedQuery(countryQuery, queryRef);
  const { country, connectorsForExport } = data;

  return (
      <div>
        <TopBar me={me} />
        <Route path="/dashboard/locations/countries/:countryId/knowledge">
          <StixCoreObjectKnowledgeBar
            stixCoreObjectLink={link}
            availableSections={[
              'cities',
              'organizations',
              'threat_actors',
              'intrusion_sets',
              'campaigns',
              'incidents',
              'malwares',
              'attack_patterns',
              'tools',
              'observables',
            ]}
          />
        </Route>
        <>
          {country ? (
            <Switch>
              <Route
                exact
                path="/dashboard/locations/countries/:countryId"
                render={() => (<Country countryData={country} />)}
              />
              <Route
                exact
                path="/dashboard/locations/countries/:countryId/knowledge"
                render={() => (
                  <Redirect
                    to={`/dashboard/locations/countries/${countryId}/knowledge/overview`}
                  />
                )}
              />
              <Route
                path="/dashboard/locations/countries/:countryId/knowledge"
                render={() => (<CountryKnowledge countryData={country} />)}
              />
              <Route
                exact
                path="/dashboard/locations/countries/:countryId/analysis"
                render={(routeProps) => (
                  <React.Fragment>
                    <StixDomainObjectHeader
                      disableSharing={true}
                      stixDomainObject={country}
                      PopoverComponent={CountryPopover}
                    />
                    <StixCoreObjectOrStixCoreRelationshipContainers
                      {...routeProps}
                      stixDomainObjectOrStixCoreRelationship={country}
                    />
                  </React.Fragment>
                )}
              />
              <Route
                exact
                path="/dashboard/locations/countries/:countryId/sightings"
                render={(routeProps) => (
                  <EntityStixSightingRelationships
                    entityId={country.id}
                    entityLink={link}
                    noPadding={true}
                    isTo={true}
                    {...routeProps}
                  />
                )}
              />
              <Route
                exact
                path="/dashboard/locations/countries/:countryId/files"
                render={(routeProps) => (
                  <React.Fragment>
                    <StixDomainObjectHeader
                      disableSharing={true}
                      stixDomainObject={country}
                      PopoverComponent={CountryPopover}
                    />
                    <FileManager
                      {...routeProps}
                      id={countryId}
                      connectorsImport={[]}
                      connectorsExport={connectorsForExport}
                      entity={country}
                    />
                  </React.Fragment>
                )}
              />
              <Route
                exact
                path="/dashboard/locations/countries/:countryId/history"
                render={(routeProps) => (
                  <React.Fragment>
                    <StixDomainObjectHeader
                      disableSharing={true}
                      stixDomainObject={country}
                      PopoverComponent={CountryPopover}
                    />
                    <StixCoreObjectHistory
                      {...routeProps}
                      stixCoreObjectId={countryId}
                    />
                  </React.Fragment>
                )}
              />
            </Switch>
          ) : <ErrorNotFound />}
        </>
      </div>
  );
};

const RootCountry = () => {
  const { countryId } = useParams() as { countryId: string };

  const queryRef = useQueryLoading<RootCountryQuery>(countryQuery, { id: countryId });
  return queryRef ? (
    <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
      <RootCountryComponent queryRef={queryRef} />
    </React.Suspense>
  ) : <Loader variant={LoaderVariant.inElement} />;
};

export default RootCountry;
