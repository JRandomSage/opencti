import React, { FunctionComponent, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import * as R from 'ramda';
import makeStyles from '@mui/styles/makeStyles';
import ListLines from '../../../../components/list_lines/ListLines';
import ContainerStixCyberObservablesLines, {
  containerStixCyberObservablesLinesQuery,
} from './ContainerStixCyberObservablesLines';
import { convertFilters } from '../../../../utils/ListParameters';
import StixCyberObservablesRightBar from '../../observations/stix_cyber_observables/StixCyberObservablesRightBar';
import ToolBar from '../../data/ToolBar';
import { defaultValue } from '../../../../utils/Graph';
import useLocalStorage, { localStorageToPaginationOptions } from '../../../../utils/hooks/useLocalStorage';
import { Theme } from '../../../../components/Theme';
import { Filters } from '../../../../components/list_lines';
import { ModuleHelper } from '../../../../utils/platformModulesHelper';
import {
  ContainerStixCyberObservablesLinesQuery,
  ContainerStixCyberObservablesLinesQuery$variables,
} from './__generated__/ContainerStixCyberObservablesLinesQuery.graphql';
import {
  StixCyberObservableLine_node$data,
} from '../../observations/stix_cyber_observables/__generated__/StixCyberObservableLine_node.graphql';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import {
  ContainerStixCyberObservables_container$data,
} from './__generated__/ContainerStixCyberObservables_container.graphql';
import useCopy from '../../../../utils/hooks/useCopy';
import {
  ContainerStixCyberObservablesLinesSearchQuery$data,
} from './__generated__/ContainerStixCyberObservablesLinesSearchQuery.graphql';
import { UserContext } from '../../../../utils/hooks/useAuth';

const useStyles = makeStyles<Theme>(() => ({
  container: {
    margin: '20px 0 0 0',
    padding: '0 260px 90px 0',
  },
}));

export const ContainerStixCyberObservablesLinesSearchQuery = graphql`
    query ContainerStixCyberObservablesLinesSearchQuery(
        $id: String!
        $types: [String]
        $search: String
        $filters: [StixObjectOrStixRelationshipsFiltering]
        $count: Int
    ) {
        container (id: $id) {
            id
            objects(
                types: $types
                search: $search
                first: $count
                filters: $filters
            ) {
                edges {
                    types
                    node {
                        ... on StixCyberObservable {
                            id
                            observable_value
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                    globalCount
                }
            }}
    }
`;

interface ContainerStixCyberObservablesComponentProps {
  container: ContainerStixCyberObservables_container$data
}

const LOCAL_STORAGE_KEY = 'view-container-stix-cyber-observables';

const ContainerStixCyberObservablesComponent: FunctionComponent<ContainerStixCyberObservablesComponentProps> = ({ container }) => {
  const classes = useStyles();

  const [viewStorage, setViewStorage, helpers] = useLocalStorage(LOCAL_STORAGE_KEY, {
    numberOfElements: { number: 0, symbol: '', original: 0 },
    filters: {} as Filters,
    searchTerm: '',
    sortBy: 'created_at',
    orderAsc: false,
    openExports: false,
    types: [] as string[],
  });
  const { numberOfElements, filters, searchTerm, sortBy, orderAsc, openExports, types } = viewStorage;
  const { handleRemoveFilter, handleSearch, handleSort, handleToggleExports, handleAddFilter, handleSetNumberOfElements } = helpers;

  const [selectedElements, setSelectedElements] = useState<Record<string, StixCyberObservableLine_node$data>>({});
  const [deSelectedElements, setDeSelectedElements] = useState<Record<string, StixCyberObservableLine_node$data>>({});
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const exportFilters = {
    containedBy: [{ id: container.id, value: defaultValue(container) }],
    entity_type:
      (types && types.length > 0) ? types.map((n) => ({ id: n, value: n })) : [],
    ...filters,
  };
  const finalFilters = convertFilters(exportFilters) as unknown as Filters;

  const paginationOptions = localStorageToPaginationOptions<ContainerStixCyberObservablesLinesQuery$variables>({
    ...viewStorage,
    count: 25,
    id: container.id,
    types: (types && types.length > 0) ? types : ['Stix-Cyber-Observable'],
    filters: finalFilters,
    orderMode: orderAsc ? 'asc' : 'desc',
  });

  let numberOfSelectedElements = Object.keys(selectedElements).length;
  if (selectAll) {
    numberOfSelectedElements = (numberOfElements?.number ?? 0)
      - Object.keys(deSelectedElements).length;
  }
  const backgroundTaskFilters = {
    containedBy: [{ id: container.id, value: defaultValue(container) }],
    entity_type:
      (types && types.length > 0)
        ? types.map((n) => ({ id: n, value: n }))
        : [{ id: 'Stix-Cyber-Observable', value: 'Stix-Cyber-Observable' }],
    ...filters,
  };

  const handleToggle = (type: string) => {
    if (types?.includes(type)) {
      setViewStorage((c) => ({ ...c, types: types.filter((x) => x !== type) }));
    } else {
      setViewStorage((c) => ({ ...c, types: types ? [...types, type] : [type] }));
    }
  };

  const getValuesForCopy = (data: ContainerStixCyberObservablesLinesSearchQuery$data) => {
    return (data.container?.objects?.edges ?? [])
      .map((o) => ({ id: o?.node.id, value: o?.node.observable_value }))
      .filter((o) => o.id) as { id: string, value: string }[];
  };

  const handleCopy = useCopy<ContainerStixCyberObservablesLinesSearchQuery$data>({
    filters: {
      ...filters,
      entity_type: types ? types.map((n) => ({ id: n, value: n })) : [],
    },
    searchTerm: searchTerm ?? '',
    query: ContainerStixCyberObservablesLinesSearchQuery,
    selectedValues: Object.values(selectedElements).map(({ observable_value }) => observable_value),
    deselectedIds: Object.values(deSelectedElements).map((o) => o.id),
    elementId: container.id,
    getValuesForCopy,
  }, selectAll);

  const handleClear = () => {
    setViewStorage((c) => ({ ...c, types: [] }));
  };

  const handleToggleSelectEntity = (entity: StixCyberObservableLine_node$data, event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (entity.id in (selectedElements)) {
      const newSelectedElements = R.omit([entity.id], selectedElements);
      setSelectAll(false);
      setSelectedElements(newSelectedElements);
    } else if (selectAll && entity.id in (deSelectedElements)) {
      const newDeSelectedElements = R.omit([entity.id], deSelectedElements);
      setDeSelectedElements(newDeSelectedElements);
    } else if (selectAll) {
      const newDeSelectedElements = {
        ...deSelectedElements,
        [entity.id]: entity,
      };
      setDeSelectedElements(newDeSelectedElements);
    } else {
      const newSelectedElements = {
        ...selectedElements,
        [entity.id]: entity,
      };
      setSelectAll(false);
      setSelectedElements(newSelectedElements);
    }
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedElements({});
    setDeSelectedElements({});
  };

  const handleClearSelectedElements = () => {
    setSelectAll(false);
    setSelectedElements({});
    setDeSelectedElements({});
  };

  const buildColumns = (helper: ModuleHelper | undefined) => {
    const isRuntimeSort = helper?.isRuntimeFieldEnable('RUNTIME_SORTING');
    return {
      entity_type: {
        label: 'Type',
        width: '15%',
        isSortable: true,
      },
      observable_value: {
        label: 'Value',
        width: '30%',
        isSortable: isRuntimeSort ?? false,
      },
      objectLabel: {
        label: 'Labels',
        width: '20%',
        isSortable: false,
      },
      createdBy: {
        label: 'Creator',
        width: '15%',
        isSortable: isRuntimeSort ?? false,
      },
      created_at: {
        label: 'Creation date',
        width: '10%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        isSortable: isRuntimeSort ?? false,
      },
    };
  };

  const queryRef = useQueryLoading<ContainerStixCyberObservablesLinesQuery>(containerStixCyberObservablesLinesQuery, paginationOptions);

  return (
    <UserContext.Consumer>
      {({ helper }) => (
        <div className={classes.container}>
          <ListLines
            sortBy={sortBy}
            orderAsc={orderAsc}
            dataColumns={buildColumns(helper)}
            handleSort={handleSort}
            handleSearch={handleSearch}
            secondaryAction={true}
            numberOfElements={numberOfElements}
            handleAddFilter={handleAddFilter}
            handleRemoveFilter={handleRemoveFilter}
            handleToggleSelectAll={handleToggleSelectAll}
            selectAll={selectAll}
            iconExtension={true}
            handleToggleExports={handleToggleExports}
            exportEntityType="Stix-Cyber-Observable"
            openExports={openExports}
            exportContext={`of-container-${container.id}`}
            filters={filters}
            availableFilterKeys={[
              'labelledBy',
              'markedBy',
              'created_at_start_date',
              'created_at_end_date',
              'x_opencti_score',
              'createdBy',
              'sightedBy',
            ]}
            paginationOptions={paginationOptions}
          >
            {queryRef && (
              <React.Suspense fallback={<Loader variant={LoaderVariant.inElement}/>}>
                <ContainerStixCyberObservablesLines
                  queryRef={queryRef}
                  paginationOptions={paginationOptions}
                  dataColumns={buildColumns(helper)}
                  setNumberOfElements={handleSetNumberOfElements}
                  onTypesChange={handleToggle}
                  openExports={openExports}
                  selectedElements={selectedElements}
                  deSelectedElements={deSelectedElements}
                  onToggleEntity={handleToggleSelectEntity}
                  selectAll={selectAll}
                  setSelectedElements={setSelectedElements}
                />
              </React.Suspense>
            )}
          </ListLines>
          <ToolBar
            selectedElements={selectedElements}
            deSelectedElements={deSelectedElements}
            numberOfSelectedElements={numberOfSelectedElements}
            selectAll={selectAll}
            search={searchTerm}
            filters={backgroundTaskFilters}
            handleClearSelectedElements={handleClearSelectedElements}
            variant="large"
            container={container}
            handleCopy={handleCopy}
          />
          <StixCyberObservablesRightBar
            types={types}
            handleToggle={handleToggle}
            handleClear={handleClear}
            openExports={openExports}
          />
        </div>
      )}
    </UserContext.Consumer>
  );
};

const ContainerStixCyberObservables = createFragmentContainer(
  ContainerStixCyberObservablesComponent,
  {
    container: graphql`
        fragment ContainerStixCyberObservables_container on Container {
            id
            ... on Report {
                name
            }
            ... on Grouping {
                name
            }
            ... on Note {
                attribute_abstract
                content
            }
            ... on Opinion {
                opinion
            }
            ... on ObservedData {
                name
                first_observed
                last_observed
            }
            ...ContainerHeader_container
        }
    `,
  },
);

export default ContainerStixCyberObservables;
