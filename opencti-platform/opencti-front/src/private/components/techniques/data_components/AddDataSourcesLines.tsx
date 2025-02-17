import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, useMutation } from 'react-relay';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ProgressWrench } from 'mdi-material-ui';
import makeStyles from '@mui/styles/makeStyles';
import Skeleton from '@mui/material/Skeleton';
import { truncate } from '../../../../utils/String';
import { Theme } from '../../../../components/Theme';
import { AddDataSourcesLines_data$key } from './__generated__/AddDataSourcesLines_data.graphql';
import { AddDataSourcesLinesQuery } from './__generated__/AddDataSourcesLinesQuery.graphql';
import usePreloadedPaginationFragment from '../../../../utils/hooks/usePreloadedPaginationFragment';

const useStyles = makeStyles<Theme>((theme) => ({
  avatar: {
    width: 24,
    height: 24,
  },
  icon: {
    color: theme.palette.primary.main,
  },
}));

export const addDataSourcesLinesMutationAdd = graphql`
  mutation AddDataSourcesLinesAddMutation(
    $id: ID!
    $input: [EditInput]!
  ) {
    dataComponentFieldPatch(
      id: $id
      input: $input
    ) {
      ...DataComponentDataSources_dataComponent
    }
  }
`;

export const addDataSourcesLinesQuery = graphql`
  query AddDataSourcesLinesQuery(
    $search: String
    $count: Int!
    $cursor: ID
  ) {
    ...AddDataSourcesLines_data @arguments(
      search: $search,
      count: $count,
      cursor: $cursor
    )
  }
`;

const addDataSourcesLinesFragment = graphql`
  fragment AddDataSourcesLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
  ) @refetchable(queryName: "AddDataSourcesLinesRefetchQuery") {
    dataSources(
      search: $search,
      first: $count,
      after: $cursor
    )
    @connection(key: "Pagination_dataSources") {
      edges {
        node {
          id
          name
          description
        }
      }
    }
  }
`;

interface AddDataSourcesLinesContainerProps {
  dataComponentId: string,
  queryRef: PreloadedQuery<AddDataSourcesLinesQuery>
}

const AddDataSourcesLines: FunctionComponent<AddDataSourcesLinesContainerProps> = ({
  dataComponentId,
  queryRef,
}) => {
  const classes = useStyles();

  const { data } = usePreloadedPaginationFragment<AddDataSourcesLinesQuery, AddDataSourcesLines_data$key>({
    linesQuery: addDataSourcesLinesQuery,
    linesFragment: addDataSourcesLinesFragment,
    queryRef,
    nodePath: ['dataSources', 'edges'],
  });

  const [commit] = useMutation(addDataSourcesLinesMutationAdd);

  const addDataSource = (dataSource: { readonly description: string | null; readonly id: string; readonly name: string }) => commit({
    variables: {
      id: dataComponentId,
      input: {
        key: 'dataSource',
        value: [dataSource.id],
      },
    },
  });

  return (
    <List>
      {data?.dataSources?.edges?.map((dataSourceNode) => dataSourceNode?.node)
        .map((dataSource, idx) => {
          if (dataSource === null || dataSource === undefined) {
            return <ListItemText
              key={idx}
              primary={
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="90%"
                  height="100%"
                />
              }
            />;
          }
          return (
              <ListItem
                key={dataSource.id}
                classes={{ root: classes.menuItem }}
                divider={true}
                button={true}
                onClick={() => addDataSource(dataSource)}
              >
                <ListItemIcon>
                  <ProgressWrench />
                </ListItemIcon>
                <ListItemText
                  primary={dataSource.name}
                  secondary={truncate(dataSource.description, 120)}
                />
              </ListItem>
          );
        })}
    </List>
  );
};

export default AddDataSourcesLines;
